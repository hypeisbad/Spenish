import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { BookmarkPlus, Check, Mic, Volume2, X, Globe, Loader2, Layers } from 'lucide-react';
import { useStore } from '../lib/store';
import { listen, onSpeakingChange, speak, stopSpeaking, sttSupported, type Lang } from '../lib/speech';
import { haptic, sfx } from '../lib/sound';
import { toast } from '../lib/events';
import { tokenize } from '../lib/text';
import { analyzeVerb, lookupEs } from '../data/lexicon';
import { translate } from '../lib/translate';
import { navigate } from '../lib/router';

/* ---------- Bilingual label ---------- */
export function Bi({ es, en, as: Tag = 'span', className }: { es: ReactNode; en: ReactNode; as?: 'span' | 'div' | 'h1' | 'h2' | 'h3'; className?: string }) {
  return (
    <Tag className={className}>
      {es}
      <span className="bi-en">{en}</span>
    </Tag>
  );
}

export function PageHead({ eyebrow, es, en, desc, right }: { eyebrow?: string; es: string; en: string; desc?: ReactNode; right?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <Bi as="h1" className="h1" es={es} en={en} />
        {desc && <p>{desc}</p>}
      </div>
      {right}
    </div>
  );
}

/* ---------- Speak ---------- */
export function useSpeaking(text?: string): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => onSpeakingChange((s, t) => setOn(s && (text === undefined || t === text))), [text]);
  return on;
}

export function say(text: string, lang: Lang = 'es', rateMul = 1) {
  const { voiceURI, rate } = useStore.getState().settings;
  return speak(text, { lang, voiceURI, rate: rate * rateMul });
}

export function SpeakButton({ text, lang = 'es', size = 'sm', slow = false, label, className = '' }: { text: string; lang?: Lang; size?: 'xs' | 'sm' | 'md'; slow?: boolean; label?: string; className?: string }) {
  const speaking = useSpeaking(text);
  const cls = size === 'md' ? '' : size;
  return (
    <button
      type="button"
      className={`btn ${label ? '' : 'icon'} ${cls} ${speaking ? 'speaking-btn' : ''} ${className}`}
      aria-label={label ?? (slow ? 'Listen slowly' : 'Listen')}
      title={slow ? 'Listen slowly 🐢' : 'Listen'}
      onClick={(e) => {
        e.stopPropagation();
        if (speaking) stopSpeaking();
        else void say(text, lang, slow ? 0.65 : 1);
      }}
    >
      {speaking ? (
        <span className="waves" aria-hidden>
          <i /><i /><i /><i />
        </span>
      ) : slow ? (
        <span aria-hidden style={{ fontSize: size === 'xs' ? 13 : 16 }}>🐢</span>
      ) : (
        <Volume2 />
      )}
      {label}
    </button>
  );
}

/* ---------- Mic ---------- */
export function MicButton({
  lang = 'es', onResult, onInterim, size = 'md', label, continuous = false, className = '', disabled,
}: {
  lang?: Lang;
  onResult: (text: string, confidence: number) => void;
  onInterim?: (text: string) => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  continuous?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  const [live, setLive] = useState(false);
  const stopRef = useRef<() => void>(() => {});
  useEffect(() => () => stopRef.current(), []);
  const supported = sttSupported();
  const start = () => {
    if (!supported) {
      toast('Speech recognition isn’t available in this browser. Try Chrome, Edge or Safari.', '🎙️', 'error');
      return;
    }
    if (live) {
      stopRef.current();
      return;
    }
    haptic(15);
    sfx.pop();
    setLive(true);
    let got = false;
    stopRef.current = listen(
      lang,
      {
        onInterim: (t) => onInterim?.(t),
        onFinal: (t, c) => {
          got = true;
          onResult(t, c);
        },
        onError: (m) => toast(m, '🎙️', 'error'),
        onEnd: () => {
          setLive(false);
          if (!got) onInterim?.('');
        },
      },
      continuous,
    );
  };
  const sizeCls = size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : '';
  return (
    <button
      type="button"
      disabled={disabled}
      className={`btn mic round ${label ? '' : 'icon'} ${sizeCls} ${live ? 'live' : ''} ${className}`}
      onClick={start}
      aria-label={live ? 'Stop listening' : `Speak in ${lang === 'es' ? 'Spanish' : 'English'}`}
      aria-pressed={live}
      title={live ? 'Listening… tap to stop' : `Speak ${lang === 'es' ? 'Spanish 🇲🇽' : 'English 🇺🇸'}`}
      style={size === 'lg' && !label ? { width: 64, height: 64 } : undefined}
    >
      <Mic style={size === 'lg' ? { width: 26, height: 26 } : undefined} />
      {label && <span>{live ? 'Escuchando…' : label}</span>}
    </button>
  );
}

/* ---------- Accent keyboard ---------- */
const ACCENTS = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'];
export function AccentBar({ target }: { target: React.RefObject<HTMLInputElement | HTMLTextAreaElement> }) {
  const [upper, setUpper] = useState(false);
  const insert = (ch: string) => {
    const el = target.current;
    if (!el) return;
    const c = upper ? ch.toUpperCase() : ch;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    const next = el.value.slice(0, start) + c + el.value.slice(end);
    setter?.call(el, next);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + c.length, start + c.length);
    });
    sfx.tap();
  };
  return (
    <div className="accent-bar" role="group" aria-label="Spanish characters">
      {ACCENTS.map((a) => (
        <button key={a} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insert(a)} aria-label={`Insert ${a}`}>
          {upper ? a.toUpperCase() : a}
        </button>
      ))}
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setUpper((u) => !u)} aria-label="Toggle uppercase" style={{ minWidth: 44 }}>
        {upper ? 'abc' : 'ABC'}
      </button>
    </div>
  );
}

/* ---------- Ring ---------- */
export function Ring({ value, size = 120, stroke = 10, children, color }: { value: number; size?: number; stroke?: number; children?: ReactNode; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  const id = useRef('rg' + Math.random().toString(36).slice(2)).current;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color ?? 'var(--accent)'} />
            <stop offset="100%" stopColor={color ? color : 'var(--accent-2)'} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)', filter: 'drop-shadow(0 0 6px rgba(var(--accent-rgb), .6))' }}
        />
      </svg>
      <div className="ring-label">{children}</div>
    </div>
  );
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, children, wide, label }: { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean; label?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="overlay sheet-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label={label}>
      <div className={`modal ${wide ? 'wide' : ''}`}>{children}</div>
    </div>,
    document.body,
  );
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="btn ghost icon sm" onClick={onClick} aria-label="Close">
      <X />
    </button>
  );
}

/* ---------- Switch ---------- */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="switch" aria-label={label}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span />
    </label>
  );
}

/* ---------- Papel picado ---------- */
const PAPEL_COLORS = ['#ff2e93', '#ffa630', '#19d3a2', '#4cc9f0', '#a06cf0', '#ffd166'];
export function PapelPicado({ count = 9 }: { count?: number }) {
  return (
    <div className="papel" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const c = PAPEL_COLORS[i % PAPEL_COLORS.length];
        return (
          <svg key={i} width="54" height="62" viewBox="0 0 54 62" style={{ marginTop: -2 }}>
            <path d="M0 0H54V50L49 58L44 50L38 58L32 50L27 58L22 50L16 58L10 50L5 58L0 50Z" fill={c} opacity="0.85" />
            <circle cx="27" cy="20" r="7" fill="#07070d" opacity="0.85" />
            <path d="M27 6l3 6h-6z M27 34l3-6h-6z M13 20l6-3v6z M41 20l-6-3v6z" fill="#07070d" opacity="0.85" />
            <circle cx="10" cy="38" r="3" fill="#07070d" opacity="0.85" />
            <circle cx="44" cy="38" r="3" fill="#07070d" opacity="0.85" />
            <rect x="22" y="38" width="10" height="4" rx="2" fill="#07070d" opacity="0.85" />
          </svg>
        );
      })}
    </div>
  );
}

/* ---------- Spice meter ---------- */
export function Spice({ level }: { level: 1 | 2 | 3 }) {
  const label = ['', 'Family-friendly', 'Casual — friends only', 'Vulgar — know it, use with care'][level];
  return (
    <span className="spice" title={label} aria-label={label}>
      {'🌶️'.repeat(level)}
      <span style={{ opacity: 0.18 }}>{'🌶️'.repeat(3 - level)}</span>
    </span>
  );
}

/* ---------- Save to deck ---------- */
export function SaveButton({ es, en, source, note, size = 'sm' }: { es: string; en: string; source: string; note?: string; size?: 'xs' | 'sm' }) {
  const has = useStore((s) => !!s.srs['c:' + es.toLowerCase().trim()]);
  const addCard = useStore((s) => s.addCard);
  return (
    <button
      type="button"
      className={`btn icon ${size} ${has ? 'on' : ''}`}
      aria-label={has ? 'Saved to your deck' : 'Save to flashcards'}
      title={has ? 'In your flashcard deck' : 'Save to flashcards'}
      onClick={(e) => {
        e.stopPropagation();
        if (has) return;
        if (addCard(es, en, source, note)) {
          sfx.pop();
          haptic(10);
          toast(`“${es}” added to your deck`, '🗃️', 'success');
        }
      }}
    >
      {has ? <Check /> : <BookmarkPlus />}
    </button>
  );
}

/* ---------- Tap-to-translate text ---------- */
export function TapText({ text, className, highlight, sentenceEn }: { text: string; className?: string; highlight?: number; sentenceEn?: string }) {
  const [sel, setSel] = useState<{ word: string; idx: number } | null>(null);
  const tokens = tokenize(text);
  let charPos = 0;
  return (
    <>
      <span className={className}>
        {tokens.map((t, i) => {
          const start = charPos;
          charPos += t.t.length;
          if (!t.word) return <span key={i}>{t.t}</span>;
          const speaking = highlight !== undefined && highlight >= start && highlight < start + t.t.length;
          return (
            <span
              key={i}
              role="button"
              tabIndex={0}
              className={`word ${sel?.idx === i ? 'active' : ''} ${speaking ? 'speaking' : ''}`}
              onClick={() => setSel({ word: t.t, idx: i })}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSel({ word: t.t, idx: i })}
            >
              {t.t}
            </span>
          );
        })}
      </span>
      <WordModal word={sel?.word ?? null} context={text} contextEn={sentenceEn} onClose={() => setSel(null)} />
    </>
  );
}

export function WordModal({ word, context, contextEn, onClose }: { word: string | null; context?: string; contextEn?: string; onClose: () => void }) {
  const [online, setOnline] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const settings = useStore((s) => s.settings);
  useEffect(() => {
    setOnline(null);
    setLoading(false);
    if (word && settings.autoSpeak) void say(word);
  }, [word]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!word) return null;
  const entries = lookupEs(word);
  const verbs = analyzeVerb(word);
  const firstEn = entries[0]?.en ?? (verbs[0] ? verbs[0].en : online ?? '');
  const fetchOnline = async () => {
    setLoading(true);
    try {
      const r = await translate(word, { from: 'es', engine: settings.engine === 'offline' ? 'online' : settings.engine, aiKey: settings.aiKey, aiModel: settings.aiModel });
      setOnline(r.text);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Translation failed', '⚠️', 'error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal open onClose={onClose} label={`Word: ${word}`}>
      <div className="row between nowrap">
        <div className="row nowrap">
          <span className="es" style={{ fontSize: 34 }}>{word}</span>
          <SpeakButton text={word} />
          <SpeakButton text={word} slow />
        </div>
        <CloseButton onClick={onClose} />
      </div>
      <div className="stack mt">
        {entries.slice(0, 4).map((e, i) => (
          <div key={i} className="row between nowrap" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{e.en}</div>
              <div className="tiny muted">{e.es !== word ? `${e.es} · ` : ''}{e.source}</div>
            </div>
          </div>
        ))}
        {verbs.slice(0, 3).map((v, i) => (
          <div key={'v' + i} className="callout mx">
            <Layers style={{ width: 18, height: 18, flex: 'none' }} />
            <div>
              <b>{v.inf}</b> — {v.en}
              <div className="small">
                {v.tenseLabel}
                {v.persons.length ? ` · ${v.persons.join(', ')}` : ''}
              </div>
              <button className="btn xs mt" onClick={() => { onClose(); navigate(`/verbs/${encodeURIComponent(v.inf)}`); }}>
                Ver conjugación
              </button>
            </div>
          </div>
        ))}
        {!entries.length && !verbs.length && !online && (
          <div className="muted small">Not in the built-in dictionary yet.</div>
        )}
        {online && (
          <div className="callout">
            <Globe style={{ width: 18, height: 18, flex: 'none' }} />
            <div><b>{online}</b></div>
          </div>
        )}
        {context && contextEn && (
          <div className="small soft" style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 12 }}>
            <div className="es">{context}</div>
            <div className="muted">{contextEn}</div>
          </div>
        )}
        <div className="row">
          {!online && (
            <button className="btn sm" onClick={fetchOnline} disabled={loading}>
              {loading ? <Loader2 className="spin" /> : <Globe />} Translate online
            </button>
          )}
          {(firstEn || online) && <SaveButton es={word.toLowerCase()} en={(firstEn || online || '').split(' / ')[0]} source="Lector" />}
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Empty ---------- */
export function Empty({ emoji, title, children }: { emoji: string; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="emoji-xl float">{emoji}</div>
      <div className="h3" style={{ color: 'var(--text)' }}>{title}</div>
      {children && <div className="small mt">{children}</div>}
    </div>
  );
}

export function Flag({ lang }: { lang: 'es' | 'en' }) {
  return <span aria-hidden>{lang === 'es' ? '🇲🇽' : '🇺🇸'}</span>;
}
