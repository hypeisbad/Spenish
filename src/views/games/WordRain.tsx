import { useEffect, useRef, useState } from 'react';
import { Heart, Play, RotateCcw } from 'lucide-react';
import { ALL_VOCAB } from '../../data/units';
import { firstEn } from '../../lib/exercises';
import { normalize, stripDiacritics } from '../../lib/text';
import { useStore } from '../../lib/store';
import { emit } from '../../lib/events';
import { sfx } from '../../lib/sound';
import { AccentBar, say } from '../../components/ui';

interface Drop {
  id: number;
  prompt: string;
  answers: string[];
  x: number;
  y: number;
  speed: number;
}

const POOL = ALL_VOCAB.filter((v) => v.es.length <= 16 && !/[¿?¡!…]/.test(v.es));
const ART = /^(el|la|los|las|un|una) /;

function key(s: string) {
  return stripDiacritics(normalize(s)).replace(ART, '').replace(/^(the|a|an|to) /, '');
}

export default function WordRain() {
  const settings = useStore((s) => s.settings);
  const addXp = useStore((s) => s.addXp);
  const bump = useStore((s) => s.bump);
  const setBest = useStore((s) => s.setBest);
  const best = useStore((s) => s.stats.rainBest);
  const [dir, setDir] = useState<'to-es' | 'to-en'>('to-es');
  const [state, setState] = useState<'idle' | 'play' | 'over'>('idle');
  const [, force] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [input, setInput] = useState('');
  const [flash, setFlash] = useState<string | null>(null);
  const drops = useRef<Drop[]>([]);
  const nextId = useRef(0);
  const last = useRef(0);
  const spawnAcc = useRef(0);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const raf = useRef(0);

  const spawn = () => {
    const v = POOL[Math.floor(Math.random() * POOL.length)];
    const prompt = dir === 'to-es' ? firstEn(v.en) : v.es;
    const answers = dir === 'to-es' ? [v.es] : v.en.split(' / ');
    const level = Math.floor(scoreRef.current / 5);
    drops.current.push({ id: nextId.current++, prompt, answers, x: 6 + Math.random() * 70, y: -6, speed: 5.5 + level * 0.9 + Math.random() * 2 });
  };

  const loop = (t: number) => {
    const dt = last.current ? Math.min(0.05, (t - last.current) / 1000) : 0;
    last.current = t;
    spawnAcc.current += dt;
    const interval = Math.max(1.1, 2.8 - scoreRef.current * 0.06);
    if (spawnAcc.current > interval || drops.current.length === 0) {
      spawnAcc.current = 0;
      spawn();
    }
    for (const d of drops.current) d.y += d.speed * dt;
    const fallen = drops.current.filter((d) => d.y > 92);
    if (fallen.length) {
      drops.current = drops.current.filter((d) => d.y <= 92);
      livesRef.current -= fallen.length;
      setLives(livesRef.current);
      if (settings.sfx) sfx.wrong();
      setFlash(`${fallen[0].prompt} → ${fallen[0].answers[0]}`);
      if (livesRef.current <= 0) {
        end();
        return;
      }
    }
    force((n) => n + 1);
    raf.current = requestAnimationFrame(loop);
  };

  const start = () => {
    drops.current = [];
    livesRef.current = 3;
    scoreRef.current = 0;
    setLives(3);
    setScore(0);
    setInput('');
    setFlash(null);
    last.current = 0;
    spawnAcc.current = 0;
    setState('play');
    raf.current = requestAnimationFrame(loop);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const end = () => {
    cancelAnimationFrame(raf.current);
    setState('over');
    bump('gamesPlayed');
    const s = scoreRef.current;
    if (s > 0) addXp(Math.min(60, s * 2));
    if (setBest('rainBest', s) && s > 0) emit({ type: 'confetti', intensity: 0.8 });
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const submit = (val: string) => {
    const k = key(val);
    if (!k) return;
    const hit = drops.current
      .filter((d) => d.answers.some((a) => key(a) === k))
      .sort((a, b) => b.y - a.y)[0];
    if (hit) {
      drops.current = drops.current.filter((d) => d !== hit);
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setInput('');
      if (settings.sfx) sfx.correct();
      if (dir === 'to-es') void say(hit.answers[0]);
    }
  };

  return (
    <div className="stack lg">
      <div className="row between">
        <div className="seg">
          <button className={dir === 'to-es' ? 'on' : ''} disabled={state === 'play'} onClick={() => setDir('to-es')}>🇺🇸 → 🇲🇽 Escribe en español</button>
          <button className={dir === 'to-en' ? 'on' : ''} disabled={state === 'play'} onClick={() => setDir('to-en')}>🇲🇽 → 🇺🇸 Type in English</button>
        </div>
        <div className="row">
          <span className="chip accent">Puntos: {score}</span>
          <span className="chip">{Array.from({ length: 3 }).map((_, i) => <Heart key={i} fill={i < lives ? 'currentColor' : 'none'} style={{ color: '#ff5577' }} />)}</span>
          {best > 0 && <span className="chip ok">Récord: {best}</span>}
        </div>
      </div>
      <div className="card" style={{ position: 'relative', height: 'min(58vh, 460px)', overflow: 'hidden', padding: 0, background: 'linear-gradient(180deg, rgba(76,201,240,.08), rgba(var(--accent-rgb),.06)), var(--panel)' }}>
        {state === 'play' && drops.current.map((d) => (
          <div key={d.id} className="drop" style={{ left: `${d.x + 10}%`, top: `${d.y}%` }}>
            <span className={dir === 'to-en' ? 'es' : ''}>{d.prompt}</span>
          </div>
        ))}
        {state !== 'play' && (
          <div className="center stack" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <div className="stack">
              <div className="emoji-xl float" style={{ margin: '0 auto' }}>{state === 'over' ? '🌧️' : '☔'}</div>
              <div className="h2">{state === 'over' ? `¡Se acabó! ${score} palabras` : 'Lluvia de palabras'}</div>
              <div className="soft small" style={{ maxWidth: 380 }}>{state === 'over' ? (flash ? `Last miss: ${flash}` : '') : 'Words fall from the sky. Type the translation before they hit the ground! Accents optional, articles optional.'}</div>
              <button className="btn primary lg" onClick={start}>{state === 'over' ? <><RotateCcw /> Otra vez</> : <><Play /> ¡Jugar!</>}</button>
            </div>
          </div>
        )}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '8%', background: 'linear-gradient(0deg, rgba(255,85,119,.35), transparent)' }} />
      </div>
      <form className="stack sm" onSubmit={(e) => { e.preventDefault(); submit(input); }}>
        <input
          ref={inputRef}
          className="input big"
          placeholder={state === 'play' ? (dir === 'to-es' ? 'Escribe en español y presiona Enter…' : 'Type in English and press Enter…') : 'Press ¡Jugar! to start'}
          value={input}
          disabled={state !== 'play'}
          onChange={(e) => {
            setInput(e.target.value);
            // auto-submit on exact match
            const k = key(e.target.value);
            if (k && drops.current.some((d) => d.answers.some((a) => key(a) === k))) submit(e.target.value);
          }}
          aria-label="Your answer"
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
        />
        {dir === 'to-es' && state === 'play' && <AccentBar target={inputRef} />}
      </form>
    </div>
  );
}
