import { useEffect, useState } from 'react';
import { RotateCcw, Timer } from 'lucide-react';
import { UNITS } from '../../data/units';
import { sampleDistinct, firstEn } from '../../lib/exercises';
import { shuffle } from '../../lib/text';
import { useStore } from '../../lib/store';
import { emit } from '../../lib/events';
import { sfx, haptic } from '../../lib/sound';
import { say } from '../../components/ui';

interface Card {
  id: number;
  pair: number;
  text: string;
  emoji: string;
  lang: 'es' | 'en';
}

function deal(unitId: string): Card[] {
  const pool = unitId === 'mix' ? UNITS.flatMap((u) => u.items) : UNITS.find((u) => u.id === unitId)!.items;
  const items = sampleDistinct(pool, 8, Math.random);
  const cards: Card[] = [];
  items.forEach((it, i) => {
    cards.push({ id: i * 2, pair: i, text: it.es, emoji: it.emoji, lang: 'es' });
    cards.push({ id: i * 2 + 1, pair: i, text: firstEn(it.en), emoji: it.emoji, lang: 'en' });
  });
  return shuffle(cards);
}

export default function Memorama() {
  const settings = useStore((s) => s.settings);
  const addXp = useStore((s) => s.addXp);
  const bump = useStore((s) => s.bump);
  const setBest = useStore((s) => s.setBest);
  const best = useStore((s) => s.stats.memoramaBest);
  const [unit, setUnit] = useState('mix');
  const [cards, setCards] = useState<Card[]>(() => deal('mix'));
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [won, setWon] = useState(false);
  const pairs = cards.length / 2;

  useEffect(() => {
    if (!start || won) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [start, won]);

  const restart = (u = unit) => {
    setCards(deal(u));
    setOpen([]);
    setFound(new Set());
    setMoves(0);
    setStart(null);
    setWon(false);
  };

  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || found.has(cards[i].pair) || won) return;
    if (!start) setStart(Date.now());
    const c = cards[i];
    if (c.lang === 'es') void say(c.text);
    if (settings.sfx) sfx.flip();
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((k) => cards[k]);
      if (a.pair === b.pair) {
        setTimeout(() => {
          const f = new Set(found).add(a.pair);
          setFound(f);
          setOpen([]);
          if (settings.sfx) sfx.correct();
          if (settings.haptics) haptic(12);
          if (f.size === pairs) {
            setWon(true);
            const finalMoves = moves + 1;
            const isBest = setBest('memoramaBest', finalMoves, true);
            bump('gamesPlayed');
            addXp(Math.max(10, 40 - finalMoves));
            emit({ type: 'confetti', intensity: 1 });
            if (settings.sfx) sfx.complete();
            if (isBest) void say('¡Nuevo récord!');
          }
        }, 380);
      } else {
        setTimeout(() => setOpen([]), 950);
      }
    }
  };

  const secs = start ? Math.round(((won ? now : now) - start) / 1000) : 0;

  return (
    <div className="stack lg">
      <div className="row between">
        <select className="select" style={{ width: 'auto' }} value={unit} onChange={(e) => { setUnit(e.target.value); restart(e.target.value); }} aria-label="Word set">
          <option value="mix">🎲 Mezcla de todo</option>
          {UNITS.map((u) => <option key={u.id} value={u.id}>{u.emoji} {u.es}</option>)}
        </select>
        <div className="row">
          <span className="chip">Movimientos: {moves}</span>
          <span className="chip"><Timer /> {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</span>
          {best > 0 && <span className="chip ok">Récord: {best}</span>}
          <button className="btn icon sm" onClick={() => restart()} aria-label="Restart"><RotateCcw /></button>
        </div>
      </div>
      {won && (
        <div className="feedback ok">
          <div className="f-icon">🏆</div>
          <div className="grow"><b>¡Ganaste en {moves} movimientos!</b><div className="small">Found all {pairs} pairs in {secs}s.</div></div>
          <button className="btn ok" onClick={() => restart()}>Otra vez</button>
        </div>
      )}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
        {cards.map((c, i) => {
          const shown = open.includes(i) || found.has(c.pair);
          return (
            <div key={c.id} className="flash-wrap" style={{ aspectRatio: '1 / 1' }}>
              <div className={`flash ${shown ? 'flipped' : ''}`} style={{ minHeight: 0, height: '100%' }} onClick={() => flip(i)} role="button" tabIndex={0} aria-label={shown ? c.text : 'Hidden card'} onKeyDown={(e) => e.key === 'Enter' && flip(i)}>
                <div className="flash-face" style={{ padding: 6, borderRadius: 16 }}>
                  <span style={{ fontSize: 'clamp(22px, 5vw, 34px)', opacity: 0.85 }}>🌼</span>
                </div>
                <div className="flash-face back" style={{ padding: 6, borderRadius: 16, background: found.has(c.pair) ? 'linear-gradient(160deg, rgba(34,219,168,.25), rgba(34,219,168,.05)), var(--panel-solid)' : undefined }}>
                  <span style={{ fontSize: 'clamp(18px, 4vw, 26px)' }}>{c.lang === 'es' ? c.emoji : '🇺🇸'}</span>
                  <span className={c.lang === 'es' ? 'es' : ''} style={{ fontSize: 'clamp(12px, 2.4vw, 16px)', fontWeight: 650, lineHeight: 1.15, marginTop: 4 }}>{c.text}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
