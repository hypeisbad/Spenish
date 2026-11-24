import { useEffect, useRef, useState } from 'react';
import { Check, Volume2, X, RotateCcw } from 'lucide-react';
import { numberToSpanish, pesosToSpanish, formatMx } from '../../lib/numbers';
import { timeToSpanish } from '../../lib/time';
import { useStore } from '../../lib/store';
import { emit } from '../../lib/events';
import { sfx } from '../../lib/sound';
import { say, SpeakButton } from '../../components/ui';

type Mode = 'precios' | 'numeros' | 'hora';
const LEVELS = [
  { es: 'Fácil', max: 100 },
  { es: 'Medio', max: 1000 },
  { es: 'Difícil', max: 100000 },
];
const ROUNDS = 10;

interface Q {
  speech: string;
  answer: string;
  display: string;
}

function makeQ(mode: Mode, level: number): Q {
  if (mode === 'hora') {
    const h = Math.floor(Math.random() * 24);
    const m = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55][Math.floor(Math.random() * 12)];
    const t = timeToSpanish(h, m);
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return { speech: t.main, answer: `${h12}:${String(m).padStart(2, '0')}`, display: `${t.main}${t.alt ? ` (${t.alt})` : ''}` };
  }
  const max = LEVELS[level].max;
  const min = level === 0 ? 1 : LEVELS[level - 1].max;
  const n = Math.floor(min + Math.random() * (max - min));
  if (mode === 'numeros') return { speech: numberToSpanish(n), answer: String(n), display: numberToSpanish(n) };
  const cents = level === 2 && Math.random() < 0.4 ? [50, 25, 90, 10][Math.floor(Math.random() * 4)] : 0;
  const amount = n + cents / 100;
  const phrase = pesosToSpanish(amount);
  return { speech: `Son ${phrase}`, answer: cents ? amount.toFixed(2) : String(n), display: phrase };
}

function normalizeAnswer(s: string, mode: Mode): string {
  if (mode === 'hora') {
    const m = s.trim().match(/^(\d{1,2})[:.h ]?(\d{2})$/);
    if (!m) return s.trim();
    let h = Number(m[1]) % 12;
    if (h === 0) h = 12;
    return `${h}:${m[2]}`;
  }
  const clean = s.replace(/[$,\s]/g, '');
  const n = Number(clean);
  if (!Number.isFinite(n)) return clean;
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

export default function NumberGame() {
  const settings = useStore((s) => s.settings);
  const addXp = useStore((s) => s.addXp);
  const bump = useStore((s) => s.bump);
  const setBest = useStore((s) => s.setBest);
  const [mode, setMode] = useState<Mode>('precios');
  const [level, setLevel] = useState(0);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState<Q>(() => makeQ('precios', 0));
  const [val, setVal] = useState('');
  const [res, setRes] = useState<null | boolean>(null);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void say(q.speech);
    ref.current?.focus();
  }, [q]);

  const restart = (m = mode, l = level) => {
    setRound(0);
    setScore(0);
    setDone(false);
    setRes(null);
    setVal('');
    setQ(makeQ(m, l));
  };

  const submit = () => {
    if (done) return;
    if (res !== null) {
      if (round + 1 >= ROUNDS) {
        setDone(true);
        bump('gamesPlayed');
        addXp(score * 3);
        if (setBest('numbersBest', score) && score >= 7) emit({ type: 'confetti', intensity: 0.8 });
        return;
      }
      setRound((r) => r + 1);
      setRes(null);
      setVal('');
      setQ(makeQ(mode, level));
      return;
    }
    if (!val.trim()) return;
    const ok = normalizeAnswer(val, mode) === q.answer;
    setRes(ok);
    if (ok) setScore((s) => s + 1);
    if (settings.sfx) (ok ? sfx.correct : sfx.wrong)();
  };

  return (
    <div className="stack lg">
      <div className="row between">
        <div className="seg">
          {(['precios', 'numeros', 'hora'] as const).map((m) => (
            <button key={m} className={mode === m ? 'on' : ''} onClick={() => { setMode(m); restart(m, level); }}>
              {{ precios: '💰 ¿Cuánto cuesta?', numeros: '🔢 Números', hora: '🕐 ¿Qué hora es?' }[m]}
            </button>
          ))}
        </div>
        {mode !== 'hora' && (
          <div className="seg">
            {LEVELS.map((l, i) => <button key={l.es} className={level === i ? 'on' : ''} onClick={() => { setLevel(i); restart(mode, i); }}>{l.es}</button>)}
          </div>
        )}
      </div>
      <div className="card hero center stack" style={{ padding: '30px 20px' }}>
        {done ? (
          <>
            <div className="emoji-xl" style={{ margin: '0 auto' }}>{score >= 9 ? '🏆' : score >= 6 ? '🎉' : '💪'}</div>
            <div className="h1">{score}/{ROUNDS}</div>
            <div className="soft">{score >= 9 ? '¡Tienes oído de mercado!' : score >= 6 ? '¡Muy bien!' : 'Sigue practicando — los números son difíciles.'}</div>
            <button className="btn primary lg" style={{ margin: '0 auto' }} onClick={() => restart()}><RotateCcw /> Jugar otra vez</button>
          </>
        ) : (
          <>
            <div className="row between"><span className="chip">Ronda {round + 1}/{ROUNDS}</span><span className="chip ok">{score} ✓</span></div>
            <div className="soft">{mode === 'hora' ? 'Escucha la hora y escríbela (ej. 3:45)' : mode === 'precios' ? 'Escucha el precio y escríbelo en número' : 'Escucha el número y escríbelo'}</div>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button className="btn primary lg round" onClick={() => say(q.speech)}><Volume2 /> Escuchar</button>
              <SpeakButton text={q.speech} slow size="md" />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="stack" style={{ maxWidth: 360, margin: '0 auto', width: '100%' }}>
              <input ref={ref} className="input big" style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums' }} inputMode={mode === 'hora' ? 'text' : 'decimal'} placeholder={mode === 'hora' ? '3:45' : mode === 'precios' ? '$' : '123'} value={val} onChange={(e) => setVal(e.target.value)} disabled={res !== null} aria-label="Your answer" />
              {res !== null && (
                <div className={`feedback ${res ? 'ok' : 'bad'}`} style={{ textAlign: 'left' }}>
                  <div className="f-icon">{res ? <Check /> : <X />}</div>
                  <div>
                    <b>{mode === 'precios' ? `$${formatMx(Number(q.answer), q.answer.includes('.') ? 2 : 0)}` : q.answer}</b>
                    <div className="small es">{q.display}</div>
                  </div>
                </div>
              )}
              <button className="btn primary lg" type="submit">{res === null ? 'Comprobar' : 'Siguiente'}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
