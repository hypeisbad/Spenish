import { useEffect, useMemo, useRef, useState } from 'react';
import { Command, Languages, Brain, CornerDownLeft, Search } from 'lucide-react';
import { on } from '../lib/events';
import { navigate } from '../lib/router';
import { ALL_NAV } from './nav';
import { searchLexicon } from '../data/lexicon';
import { VERBS } from '../data/verbs';
import { normalize, stripDiacritics } from '../lib/text';
import { Modal } from './ui';

interface Item {
  id: string;
  label: string;
  sub?: string;
  emoji?: string;
  kind: 'route' | 'translate' | 'verb' | 'word';
  run: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement)?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    const off = on((e) => e.type === 'palette' && setOpen(true));
    return () => {
      window.removeEventListener('keydown', onKey);
      off();
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ('');
      setSel(0);
      setTimeout(() => input.current?.focus(), 30);
    }
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const close = (fn: () => void) => () => {
      setOpen(false);
      fn();
    };
    const nq = stripDiacritics(normalize(q));
    const routes: Item[] = ALL_NAV.filter(
      (n) => !nq || stripDiacritics(normalize(`${n.es} ${n.en} ${n.desc}`)).includes(nq),
    ).map((n) => ({ id: 'r' + n.path, label: `${n.es} · ${n.en}`, sub: n.desc, emoji: n.emoji, kind: 'route', run: close(() => navigate(n.path)) }));
    if (!nq) return routes;
    const out: Item[] = [
      { id: 'tr', label: `Traducir “${q}”`, sub: 'Open in the translator', kind: 'translate', run: close(() => navigate(`/translate?q=${encodeURIComponent(q)}`)) },
      ...routes.slice(0, 5),
    ];
    const verbs = VERBS.filter((v) => stripDiacritics(v.inf).startsWith(nq) || stripDiacritics(normalize(v.en)).includes(nq)).slice(0, 4);
    for (const v of verbs) out.push({ id: 'v' + v.inf, label: v.inf, sub: `${v.en} · conjugate`, kind: 'verb', run: close(() => navigate(`/verbs/${encodeURIComponent(v.inf)}`)) });
    for (const w of searchLexicon(q, 8)) {
      out.push({ id: 'w' + w.es + w.en, label: w.es, sub: `${w.en} · ${w.source}`, kind: 'word', run: close(() => navigate(`/dictionary?q=${encodeURIComponent(w.es)}`)) });
    }
    return out;
  }, [q]);

  useEffect(() => {
    setSel(0);
  }, [q]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((s) => Math.min(items.length - 1, s + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      items[sel]?.run();
    }
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} label="Command palette">
      <div className="row nowrap" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 10, marginBottom: 10 }}>
        <Search style={{ width: 20, height: 20, color: 'var(--muted)' }} />
        <input
          ref={input}
          className="palette-input"
          placeholder="Busca o traduce… (search anything or type a phrase)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Search"
        />
        <span className="kbd">esc</span>
      </div>
      <div className="stack sm" role="listbox">
        {items.map((it, i) => (
          <div
            key={it.id}
            role="option"
            aria-selected={i === sel}
            className={`palette-item ${i === sel ? 'sel' : ''}`}
            onMouseMove={() => i !== sel && setSel(i)}
            onClick={it.run}
          >
            {it.emoji ? <span style={{ fontSize: 18, width: 18 }}>{it.emoji}</span> : it.kind === 'translate' ? <Languages /> : it.kind === 'verb' ? <Brain /> : <Command />}
            <div className="grow">
              <div style={{ fontWeight: 600 }} className={it.kind === 'word' || it.kind === 'verb' ? 'es' : ''}>{it.label}</div>
              {it.sub && <div className="tiny muted">{it.sub}</div>}
            </div>
            {i === sel && <CornerDownLeft style={{ width: 16, height: 16 }} />}
          </div>
        ))}
      </div>
      <div className="row tiny muted mt">
        <span className="kbd">↑</span><span className="kbd">↓</span> navegar · <span className="kbd">enter</span> abrir · <span className="kbd">⌘K</span> / <span className="kbd">/</span> abrir en cualquier momento
      </div>
    </Modal>
  );
}
