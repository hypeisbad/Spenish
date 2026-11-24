import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Timer } from 'lucide-react';
import { VERBS } from '../../data/verbs';
import { conjugate, TENSE_INFO, type SimpleTense } from '../../lib/conjugate';
import { shuffle } from '../../lib/text';
import { useStore } from '../../lib/store';
import { emit } from '../../lib/events';
import { sfx } from '../../lib/sound';
import { say } from '../../components/ui';

const PERSONS = [0, 1, 2, 3, 5];
const LABEL = ['yo', 'tú', 'él / ella / usted', 'nosotros', '', 'ellos / ustedes'];
const TENSES: SimpleTense[] = ['presente', 'preterito', 'imperfecto', 'futuro', 'condicional', 'subjPresente'];
const POOL = VERBS.filter((v) => !v.inf.endsWith('se') && v.inf !== 'haber');
const DURATION = 60;

interface Q {
  inf: string;
  en: string;
  tense: SimpleTense;
  person: number;
  options: string[];
  answer: number;
}

function makeQ(tenses: SimpleTense[]): Q {
  const v = POOL[Math.floor(Math.random() * POOL.length)];
  const tense = tenses[Math.floor(Math.random() * tenses.length)];
  const person = PERSONS[Math.floor(Math.random() * PERSONS.length)];
  const c = conjugate(v);
  const right = c.tenses[tense][person];
  const pool = new Set<string>();
  for (const p of PERSONS) pool.add(c.tenses[tense][p]);
  for (const t of TENSES) pool.add(c.tenses[t][person]);
  pool.delete(right);
  const distract = shuffle([...pool]).slice(0, 3);
  const options = shuffle([right, ...distract]);
  return { inf: v.inf, en: v.en, tense, person, options, answer: options.indexOf(right) };
}

export default function Sprint() {
  const settings = useStore((s) => s.settings);
  const addXp = useStore((s) => s.addXp);
  const bump = useStore((s) => s.bump);
  const setBest = useStore((s) => s.setBest);
  const best = useStore((s) => s.stats.sprintBest);
  const [tenses, setTenses] = useState<SimpleTense[]>(['presente', 'preterito']);
  const [state, setState] = useState<'idle' | 'play' | 'over'>('idle');
  const [q, setQ] = useState<Q>(() => makeQ(['presente']));
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (state !== 'play') return;
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  useEffect(() => {
    if (state === 'play' && left <= 0) {
      setState('over');
      bump('gamesPlayed');
      addXp(Math.min(80, scoreRef.current * 2));
      if (setBest('sprintBest', scoreRef.current) && scoreRef.current > 0) {
        emit({ type: 'confetti', intensity: 1 });
        void say('¡Nuevo récord!');
      }
      if (settings.sfx) sfx.complete();
    }
    if (state === 'play' && left > 0 && left <= 5 && settings.sfx) sfx.tick();
  }, [left, state, bump, addXp, setBest, settings.sfx]);

  const start = () => {
    scoreRef.current = 0;
    setScore(0);
    setWrong(0);
    setLeft(DURATION);
    setQ(makeQ(tenses));
    setState('play');
  };

  const pick = useCallback(
    (i: number) => {
      if (state !== 'play') return;
      const ok = i === q.answer;
      if (ok) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
      } else setWrong((w) => w + 1);
      setFlash(ok ? 'ok' : 'bad');
      setTimeout(() => setFlash(null), 220);
      if (settings.sfx) (ok ? sfx.correct : sfx.wrong)();
      setQ(makeQ(tenses));
    },
    [q, state, tenses, settings.sfx],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= 4) pick(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pick]);

  return (
    <div className="stack lg">
      <div className="row between">
        <div className="row">
          {TENSES.map((t) => (
            <button key={t} disabled={state === 'play'} className={`chip ${tenses.includes(t) ? 'on' : ''}`} onClick={() => setTenses((d) => (d.includes(t) ? (d.length > 1 ? d.filter((x) => x !== t) : d) : [...d, t]))}>
              {TENSE_INFO[t].es.split(' (')[0]}
            </button>
          ))}
        </div>
        <div className="row">
          <span className="chip accent">✓ {score}</span>
          <span className="chip"><Timer /> {left}s</span>
          {best > 0 && <span className="chip ok">Récord: {best}</span>}
        </div>
      </div>
      <div className="bar"><i style={{ width: `${(left / DURATION) * 100}%`, transition: 'width 1s linear' }} /></div>
      <div className="card hero center" style={{ padding: '30px 18px', minHeight: 320, outline: flash ? `2px solid ${flash === 'ok' ? 'var(--ok)' : 'var(--bad)'}` : 'none', transition: 'outline .1s' }}>
        {state === 'play' ? (
          <div className="stack lg">
            <div>
              <div className="soft">{TENSE_INFO[q.tense].es} · <span className="muted">{TENSE_INFO[q.tense].en}</span></div>
              <div style={{ fontSize: 'clamp(24px, 5vw, 34px)', marginTop: 6 }}>
                <span className="muted">{LABEL[q.person]}</span> + <span className="es" style={{ color: 'var(--accent)' }}>{q.inf}</span>
              </div>
              <div className="tiny muted">{q.en}</div>
            </div>
            <div className="grid cols-2">
              {q.options.map((o, i) => (
                <button key={o + i} className="choice" style={{ justifyContent: 'center' }} onClick={() => pick(i)}>
                  <span className="num">{i + 1}</span><span className="es" style={{ fontSize: 18 }}>{o}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="stack">
            <div className="emoji-xl float" style={{ margin: '0 auto' }}>{state === 'over' ? '⚡' : '🏁'}</div>
            <div className="h2">{state === 'over' ? `¡${score} correctas en ${DURATION}s!` : 'Conjugación relámpago'}</div>
            <div className="soft small">{state === 'over' ? `${wrong} errores · precisión ${score + wrong ? Math.round((score / (score + wrong)) * 100) : 0}%` : 'Pick the right form as fast as you can. 60 seconds. Keys 1–4 work too.'}</div>
            <button className="btn primary lg" style={{ margin: '0 auto' }} onClick={start}>{state === 'over' ? <><RotateCcw /> Otra vez</> : <><Play /> ¡Arrancar!</>}</button>
          </div>
        )}
      </div>
    </div>
  );
}
