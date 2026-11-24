import { useEffect, useMemo, useState, useCallback } from 'react';
import { Layers, Plus, Search, Trash2, RotateCcw, Shuffle } from 'lucide-react';
import { useStore } from '../lib/store';
import { dueCards, masteryLabel, previewInterval, type Grade, type SrsCard } from '../lib/srs';
import { normalize, stripDiacritics, shuffle } from '../lib/text';
import { UNITS } from '../data/units';
import { firstEn } from '../lib/exercises';
import { toast, emit } from '../lib/events';
import { haptic, sfx } from '../lib/sound';
import { PageHead, SpeakButton, say, Empty } from '../components/ui';

const GRADES: { g: Grade; es: string; en: string; cls: string; key: string }[] = [
  { g: 0, es: 'Otra vez', en: 'Again', cls: 'bad', key: '1' },
  { g: 1, es: 'Difícil', en: 'Hard', cls: '', key: '2' },
  { g: 2, es: 'Bien', en: 'Good', cls: 'ok', key: '3' },
  { g: 3, es: 'Fácil', en: 'Easy', cls: 'on', key: '4' },
];

function Study({ cards, onDone, mode }: { cards: SrsCard[]; onDone: (n: number) => void; mode: 'es' | 'en' | 'audio' }) {
  const reviewCard = useStore((s) => s.reviewCard);
  const settings = useStore((s) => s.settings);
  const [queue, setQueue] = useState(cards);
  const [flipped, setFlipped] = useState(false);
  const [count, setCount] = useState(0);
  const card = queue[0];

  useEffect(() => {
    if (card && (mode === 'audio' || (mode === 'es' && settings.autoSpeak))) void say(card.es);
  }, [card?.id, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const grade = useCallback(
    (g: Grade) => {
      if (!card) return;
      reviewCard(card.id, g);
      if (settings.sfx) (g === 0 ? sfx.wrong : sfx.flip)();
      if (settings.haptics) haptic(8);
      setFlipped(false);
      setCount((c) => c + 1);
      setQueue((q) => {
        const rest = q.slice(1);
        // "Again" cards come back later in this session
        return g === 0 ? [...rest, { ...card }] : rest;
      });
    },
    [card, reviewCard, settings.sfx, settings.haptics],
  );

  useEffect(() => {
    if (!card) onDone(count);
  }, [card, count, onDone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => {
          if (!f && card && mode !== 'es') void say(card.es);
          return !f;
        });
      } else if (flipped && ['1', '2', '3', '4'].includes(e.key)) grade((Number(e.key) - 1) as Grade);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flipped, grade, card, mode]);

  if (!card) return null;
  const flip = () => {
    if (!flipped && mode !== 'es') void say(card.es);
    setFlipped((f) => !f);
    if (settings.sfx) sfx.flip();
  };
  return (
    <div className="stack lg">
      <div className="row between small"><span className="muted">Quedan {queue.length}</span><span className="muted">Repasadas {count}</span></div>
      <div className="flash-wrap">
        <div className={`flash ${flipped ? 'flipped' : ''}`} onClick={flip} role="button" tabIndex={0} aria-label="Flip card" onKeyDown={(e) => e.key === 'Enter' && flip()}>
          <div className="flash-face">
            {mode === 'audio' ? (
              <>
                <div className="emoji-xl">🎧</div>
                <div className="soft mt">Escucha y recuerda · Listen & recall</div>
              </>
            ) : mode === 'es' ? (
              <div className="es" style={{ fontSize: 'clamp(28px, 6vw, 44px)' }}>{card.es}</div>
            ) : (
              <div style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 650 }}>{card.en}</div>
            )}
            <div className="tiny muted" style={{ position: 'absolute', bottom: 16 }}>Toca para voltear · tap or press space</div>
          </div>
          <div className="flash-face back">
            <div className="es" style={{ fontSize: 'clamp(26px, 5.5vw, 40px)' }}>{card.es}</div>
            <div className="h3 soft mt">{card.en}</div>
            {card.note && <div className="small muted mt">💡 {card.note}</div>}
            <div className="tiny muted mt">{card.source}</div>
          </div>
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'center' }}>
        <SpeakButton text={card.es} />
        <SpeakButton text={card.es} slow />
      </div>
      {flipped ? (
        <div className="grid cols-4" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))' }}>
          {GRADES.map((g) => (
            <button key={g.g} className={`btn ${g.cls}`} style={{ height: 'auto', padding: '10px 6px', flexDirection: 'column', gap: 2 }} onClick={() => grade(g.g)}>
              <b>{g.es}</b>
              <span className="tiny" style={{ opacity: 0.75 }}>{previewInterval(card, g.g)} · {g.key}</span>
            </button>
          ))}
        </div>
      ) : (
        <button className="btn primary lg block" onClick={flip}>Mostrar respuesta</button>
      )}
    </div>
  );
}

export default function Review() {
  const srs = useStore((s) => s.srs);
  const addCard = useStore((s) => s.addCard);
  const removeCard = useStore((s) => s.removeCard);
  const addXp = useStore((s) => s.addXp);
  const all = useMemo(() => Object.values(srs), [srs]);
  const [session, setSession] = useState<SrsCard[] | null>(null);
  const [mode, setMode] = useState<'es' | 'en' | 'audio'>('es');
  const [tab, setTab] = useState<'study' | 'deck'>('study');
  const [q, setQ] = useState('');
  const [newEs, setNewEs] = useState('');
  const [newEn, setNewEn] = useState('');
  const due = dueCards(all);
  const counts = [0, 0, 0, 0];
  for (const c of all) counts[masteryLabel(c).level]++;

  const onDone = useCallback(
    (n: number) => {
      setSession(null);
      if (n > 0) {
        addXp(Math.min(60, n * 2));
        emit({ type: 'confetti', intensity: 0.6 });
        toast(`¡Listo! ${n} tarjetas repasadas`, '🧠', 'success');
      }
    },
    [addXp],
  );

  const filtered = all
    .filter((c) => !q || stripDiacritics(normalize(c.es + ' ' + c.en)).includes(stripDiacritics(normalize(q))))
    .sort((a, b) => a.due - b.due);

  return (
    <div className="page narrow">
      <PageHead
        eyebrow="Repaso · Spaced repetition"
        es="Tu mazo de tarjetas"
        en="Your flashcard deck"
        desc="Cards come back right before you'd forget them. Words from lessons, the translator, stories and the phrasebook all land here."
      />
      <div className="grid cols-4" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))', marginBottom: 16 }}>
        {[['Nuevas', counts[0], '🌱'], ['Aprendiendo', counts[1], '🌿'], ['Repasando', counts[2], '🌳'], ['Dominadas', counts[3], '🏆']].map(([l, n, e]) => (
          <div key={l as string} className="card tight center"><div style={{ fontSize: 20 }}>{e}</div><div className="stat"><b>{n}</b><span>{l}</span></div></div>
        ))}
      </div>
      <div className="row between" style={{ marginBottom: 14 }}>
        <div className="seg">
          <button className={tab === 'study' ? 'on' : ''} onClick={() => setTab('study')}><Layers /> Estudiar</button>
          <button className={tab === 'deck' ? 'on' : ''} onClick={() => setTab('deck')}><Search /> Mazo ({all.length})</button>
        </div>
        {tab === 'study' && !session && (
          <div className="seg" aria-label="Card front">
            <button className={mode === 'es' ? 'on' : ''} onClick={() => setMode('es')}>🇲🇽 → 🇺🇸</button>
            <button className={mode === 'en' ? 'on' : ''} onClick={() => setMode('en')}>🇺🇸 → 🇲🇽</button>
            <button className={mode === 'audio' ? 'on' : ''} onClick={() => setMode('audio')}>🎧 Audio</button>
          </div>
        )}
      </div>

      {tab === 'study' && (
        <div className="card">
          {session ? (
            <Study cards={session} onDone={onDone} mode={mode} />
          ) : all.length === 0 ? (
            <Empty emoji="🗃️" title="Tu mazo está vacío">
              <p>Complete a lesson, or add a whole unit below. You can also save words from the translator and stories.</p>
            </Empty>
          ) : due.length ? (
            <div className="center stack">
              <div className="emoji-xl float" style={{ margin: '0 auto' }}>🧠</div>
              <div className="h2">{due.length} tarjetas para hoy</div>
              <div className="soft">≈ {Math.max(1, Math.round(due.length * 0.15))} min</div>
              <button className="btn primary lg" onClick={() => setSession(due.slice(0, 50))}>Empezar repaso</button>
            </div>
          ) : (
            <div className="center stack">
              <div className="emoji-xl" style={{ margin: '0 auto' }}>✅</div>
              <div className="h2">¡Todo al día!</div>
              <div className="soft">No cards are due. Next one: {new Date(Math.min(...all.map((c) => c.due))).toLocaleString('es-MX', { weekday: 'long', hour: 'numeric', minute: '2-digit' })}</div>
              <button className="btn" onClick={() => setSession(shuffle(all).slice(0, 15))}><Shuffle /> Practicar de todos modos</button>
            </div>
          )}
        </div>
      )}

      {tab === 'study' && !session && (
        <div className="card mt">
          <div className="card-title"><Plus /> Añadir tarjetas</div>
          <div className="row">
            {UNITS.map((u) => (
              <button
                key={u.id}
                className="chip"
                onClick={() => {
                  let n = 0;
                  for (const it of u.items) if (addCard(it.es, firstEn(it.en), `Curso · ${u.es}`, it.note)) n++;
                  toast(n ? `${n} cards added from ${u.es}` : `All of ${u.es} is already in your deck`, u.emoji, n ? 'success' : 'info');
                }}
              >
                {u.emoji} {u.es}
              </button>
            ))}
          </div>
          <form
            className="row mt"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newEs.trim() || !newEn.trim()) return;
              if (addCard(newEs.trim(), newEn.trim(), 'Personal')) toast('Card added', '🗃️', 'success');
              else toast('That card already exists', 'ℹ️');
              setNewEs('');
              setNewEn('');
            }}
          >
            <input className="input grow" placeholder="Español" value={newEs} onChange={(e) => setNewEs(e.target.value)} aria-label="Spanish" style={{ minWidth: 140 }} />
            <input className="input grow" placeholder="English" value={newEn} onChange={(e) => setNewEn(e.target.value)} aria-label="English" style={{ minWidth: 140 }} />
            <button className="btn primary" type="submit" disabled={!newEs.trim() || !newEn.trim()}><Plus /> Añadir</button>
          </form>
        </div>
      )}

      {tab === 'deck' && (
        <div className="card">
          <input className="input" placeholder="Buscar en el mazo…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search deck" />
          <div className="list mt">
            {filtered.slice(0, 300).map((c) => {
              const m = masteryLabel(c);
              return (
                <div className="list-item" key={c.id}>
                  <div className="grow">
                    <div className="es" style={{ fontWeight: 600 }}>{c.es}</div>
                    <div className="small muted">{c.en} · {c.source}</div>
                  </div>
                  <span className={`chip ${m.level === 3 ? 'ok' : m.level === 0 ? '' : 'warn'}`}>{m.label}</span>
                  <SpeakButton text={c.es} size="xs" />
                  <button className="btn icon xs ghost" aria-label={`Delete ${c.es}`} onClick={() => removeCard(c.id)}><Trash2 /></button>
                </div>
              );
            })}
            {!filtered.length && <div className="muted small">No cards found.</div>}
          </div>
          {all.length > 0 && (
            <button className="btn sm ghost mt" onClick={() => setSession(shuffle(filtered).slice(0, 30))}><RotateCcw /> Practice these</button>
          )}
        </div>
      )}
    </div>
  );
}
