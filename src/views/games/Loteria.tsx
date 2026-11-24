import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Eye, EyeOff, Volume2 } from 'lucide-react';
import { LOTERIA, type LoteriaCard } from '../../data/loteria';
import { shuffle } from '../../lib/text';
import { useStore } from '../../lib/store';
import { emit, toast } from '../../lib/events';
import { haptic, sfx } from '../../lib/sound';
import { say } from '../../components/ui';

type Pattern = 'linea' | 'esquinas' | 'centro' | 'llena';
const PATTERNS: { id: Pattern; es: string; en: string }[] = [
  { id: 'linea', es: 'Línea', en: 'Any row, column or diagonal' },
  { id: 'esquinas', es: 'Cuatro esquinas', en: 'The four corners' },
  { id: 'centro', es: 'Centrito', en: 'The 4 middle cards' },
  { id: 'llena', es: 'Tabla llena', en: 'The whole board' },
];
const SPEEDS = [
  { ms: 9000, es: 'Tranqui' },
  { ms: 6500, es: 'Normal' },
  { ms: 4500, es: 'Rápido' },
];

const LINES: number[][] = [
  [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
  [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
  [0, 5, 10, 15], [3, 6, 9, 12],
];

export function wins(marked: Set<number>, pattern: Pattern): boolean {
  const all = (ids: number[]) => ids.every((i) => marked.has(i));
  if (pattern === 'linea') return LINES.some(all);
  if (pattern === 'esquinas') return all([0, 3, 12, 15]);
  if (pattern === 'centro') return all([5, 6, 9, 10]);
  return marked.size === 16;
}

const BOTS = [
  { name: 'Doña Chuy', emoji: '👵' },
  { name: 'Tío Beto', emoji: '🧔' },
];

function newTabla(): LoteriaCard[] {
  return shuffle(LOTERIA).slice(0, 16);
}

export default function Loteria() {
  const settings = useStore((s) => s.settings);
  const addXp = useStore((s) => s.addXp);
  const bump = useStore((s) => s.bump);
  const [pattern, setPattern] = useState<Pattern>('linea');
  const [speed, setSpeed] = useState(1);
  const [deck, setDeck] = useState<LoteriaCard[]>(() => shuffle(LOTERIA));
  const [tabla, setTabla] = useState<LoteriaCard[]>(newTabla);
  const [botTablas, setBotTablas] = useState<LoteriaCard[][]>(() => BOTS.map(newTabla));
  const [called, setCalled] = useState(0); // number of cards called
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState<null | { winner: string; you: boolean }>(null);
  const [showEn, setShowEn] = useState(false);
  const [helper, setHelper] = useState(true);
  const botClaim = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calledSet = useMemo(() => new Set(deck.slice(0, called).map((c) => c.n)), [deck, called]);
  const current = called > 0 ? deck[called - 1] : null;

  const callCard = useCallback(
    (card: LoteriaCard) => {
      if (settings.sfx) sfx.bell();
      setTimeout(() => void say(`${card.verse} ¡${card.name}!`, 'es', 1.02), 350);
    },
    [settings.sfx],
  );

  // Caller loop
  useEffect(() => {
    if (!running || over) return;
    if (called >= deck.length) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => {
      const card = deck[called];
      setCalled((c) => c + 1);
      callCard(card);
    }, called === 0 ? 400 : SPEEDS[speed].ms);
    return () => clearTimeout(t);
  }, [running, called, deck, speed, over, callCard]);

  // Bots check their boards
  useEffect(() => {
    if (!running || over || called === 0) return;
    for (let b = 0; b < BOTS.length; b++) {
      const m = new Set<number>();
      botTablas[b].forEach((c, i) => calledSet.has(c.n) && m.add(i));
      if (wins(m, pattern)) {
        if (botClaim.current) return;
        botClaim.current = setTimeout(() => {
          setOver({ winner: BOTS[b].name, you: false });
          setRunning(false);
          void say(`¡Lotería! Gané yo, ${BOTS[b].name}.`);
          if (settings.sfx) sfx.wrong();
          bump('gamesPlayed');
          botClaim.current = null;
        }, 2600);
        return;
      }
    }
  }, [called, calledSet, botTablas, pattern, running, over, bump, settings.sfx]);

  const reset = () => {
    if (botClaim.current) clearTimeout(botClaim.current);
    botClaim.current = null;
    setDeck(shuffle(LOTERIA));
    setTabla(newTabla());
    setBotTablas(BOTS.map(newTabla));
    setCalled(0);
    setMarked(new Set());
    setOver(null);
    setRunning(false);
  };

  const tap = (i: number) => {
    if (over) return;
    const card = tabla[i];
    if (marked.has(i)) return;
    if (!calledSet.has(card.n)) {
      toast(`¡Todavía no sale ${card.name}!`, '✋', 'info');
      if (settings.sfx) sfx.wrong();
      return;
    }
    setMarked((m) => new Set(m).add(i));
    if (settings.sfx) sfx.pop();
    if (settings.haptics) haptic(10);
    void say(card.name);
  };

  const claim = () => {
    if (over) return;
    if (wins(marked, pattern)) {
      if (botClaim.current) clearTimeout(botClaim.current);
      botClaim.current = null;
      setOver({ winner: 'Tú', you: true });
      setRunning(false);
      void say('¡Lotería!');
      if (settings.sfx) sfx.complete();
      emit({ type: 'confetti', intensity: 1.4 });
      bump('loteriaWins');
      bump('gamesPlayed');
      addXp(30 + marked.size);
    } else {
      toast('¡Todavía no tienes Lotería! Check the pattern.', '🤔', 'info');
      if (settings.sfx) sfx.wrong();
    }
  };

  const canWin = wins(marked, pattern);

  return (
    <div className="stack lg">
      <div className="row between">
        <div className="row">
          <div className="seg" aria-label="Winning pattern">
            {PATTERNS.map((p) => (
              <button key={p.id} className={pattern === p.id ? 'on' : ''} disabled={called > 0 && !over} onClick={() => setPattern(p.id)} title={p.en}>{p.es}</button>
            ))}
          </div>
          <div className="seg" aria-label="Caller speed">
            {SPEEDS.map((s, i) => <button key={s.es} className={speed === i ? 'on' : ''} onClick={() => setSpeed(i)}>{s.es}</button>)}
          </div>
        </div>
        <div className="row">
          <button className={`btn sm ${showEn ? 'on' : ''}`} onClick={() => setShowEn((v) => !v)}>{showEn ? <Eye /> : <EyeOff />} English</button>
          <button className={`btn sm ${helper ? 'on' : ''}`} onClick={() => setHelper((v) => !v)} title="Highlight called cards on your board">💡 Ayuda</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)', alignItems: 'start' }}>
        <div className="card" style={{ padding: 14, background: 'linear-gradient(160deg, rgba(255,166,48,.14), rgba(255,46,147,.08)), var(--panel)' }}>
          <div className="row between" style={{ marginBottom: 10 }}>
            <b className="display" style={{ fontSize: 20 }}>Tu tabla</b>
            <span className="chip">{marked.size} frijolitos</span>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
            {tabla.map((c, i) => (
              <button
                key={c.n + '-' + i}
                className={`loteria-cell ${marked.has(i) ? 'marked' : ''} ${helper && !marked.has(i) && calledSet.has(c.n) ? 'hint' : ''}`}
                onClick={() => tap(i)}
                aria-label={`${c.name}${marked.has(i) ? ', marked' : ''}`}
              >
                <span className="ln">{c.n}</span>
                <span className="le" aria-hidden>{c.emoji}</span>
                <span className="lt">{showEn ? c.en : c.name}</span>
              </button>
            ))}
          </div>
          <button className={`btn lg block mt ${canWin ? 'primary pulse' : ''}`} onClick={claim} disabled={!!over || called === 0}>
            🎉 ¡LOTERÍA!
          </button>
        </div>

        <div className="stack">
          <div className="card center" style={{ minHeight: 280 }}>
            {over ? (
              <div className="stack" style={{ padding: '10px 0' }}>
                <div className="emoji-xl" style={{ margin: '0 auto' }}>{over.you ? '🏆' : '😅'}</div>
                <div className="h2">{over.you ? '¡Ganaste!' : `¡${over.winner} gritó Lotería!`}</div>
                <div className="soft small">{over.you ? `+${30 + marked.size} XP · ${called} cartas cantadas` : 'Ni modo… ¡la revancha!'}</div>
                <button className="btn primary" onClick={reset}><RotateCcw /> Otra partida</button>
              </div>
            ) : current ? (
              <div className="stack" key={current.n}>
                <div className="tiny muted">Carta {called} de {deck.length}</div>
                <div className="loteria-cell" style={{ width: 150, margin: '0 auto', animation: 'popIn .4s var(--ease) both' }}>
                  <span className="ln">{current.n}</span>
                  <span className="le" style={{ fontSize: 64 }}>{current.emoji}</span>
                  <span className="lt" style={{ fontSize: 15 }}>{current.name}</span>
                </div>
                <div className="es" style={{ fontSize: 17, fontStyle: 'italic' }}>“{current.verse}”</div>
                {showEn && <div className="small muted">{current.verseEn} — <b>{current.en}</b></div>}
                <button className="btn sm ghost" onClick={() => callCard(current)}><Volume2 /> Repetir</button>
              </div>
            ) : (
              <div className="stack" style={{ padding: '20px 0' }}>
                <div className="emoji-xl float" style={{ margin: '0 auto' }}>🎴</div>
                <div className="h3">¿Listos para la Lotería?</div>
                <div className="small soft">The caller (el gritón) sings a traditional verse for each card. Listen, find it on your board, and tap to place a bean. Complete the pattern and shout ¡Lotería! before the bots do.</div>
              </div>
            )}
            {!over && (
              <div className="row mt" style={{ justifyContent: 'center' }}>
                <button className="btn primary" onClick={() => setRunning((r) => !r)}>
                  {running ? <><Pause /> Pausa</> : <><Play /> {called ? 'Seguir' : '¡Empezar!'}</>}
                </button>
                <button className="btn" onClick={reset}><RotateCcw /> Nueva</button>
              </div>
            )}
          </div>
          <div className="card tight">
            <div className="tiny muted" style={{ marginBottom: 6 }}>Rivales</div>
            {BOTS.map((b, bi) => {
              const n = botTablas[bi].filter((c) => calledSet.has(c.n)).length;
              return (
                <div key={b.name} className="row between nowrap" style={{ padding: '4px 0' }}>
                  <span style={{ width: 120 }}>{b.emoji} {b.name}</span>
                  <div className="bar thin grow"><i style={{ width: `${(n / 16) * 100}%` }} /></div>
                  <span className="tiny muted">{n}/16</span>
                </div>
              );
            })}
          </div>
          {called > 1 && (
            <div className="card tight">
              <div className="tiny muted" style={{ marginBottom: 6 }}>Ya salieron</div>
              <div className="row" style={{ gap: 4 }}>
                {deck.slice(0, called).reverse().slice(0, 24).map((c) => (
                  <span key={c.n} className="chip" title={c.name} style={{ padding: '3px 7px' }}>{c.emoji} <span className="tiny">{c.name.replace(/^(El|La|Las|Los) /, '')}</span></span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@media (max-width: 800px) { .stack.lg > .grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
