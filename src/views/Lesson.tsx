import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Check, X, Flame, ArrowRight, RotateCcw, Ear, Volume2, SkipForward } from 'lucide-react';
import type { Route } from '../lib/router';
import { navigate } from '../lib/router';
import { UNIT_MAP, lessonsFor } from '../data/units';
import { buildLesson, checkBuild, firstEn, type Ex } from '../lib/exercises';
import { checkAnswer, wordMatch, shuffle } from '../lib/text';
import { sttSupported } from '../lib/speech';
import { useStore } from '../lib/store';
import { emit } from '../lib/events';
import { haptic, sfx } from '../lib/sound';
import { AccentBar, MicButton, SpeakButton, say, Empty } from '../components/ui';

type Phase = 'intro' | 'quiz' | 'done';
interface Feedback {
  ok: boolean;
  correct: string;
  note?: string;
  audio?: string;
}

function useFx() {
  const s = useStore((x) => x.settings);
  return {
    good: () => { if (s.sfx) sfx.correct(); if (s.haptics) haptic(12); },
    bad: () => { if (s.sfx) sfx.wrong(); if (s.haptics) haptic([30, 40, 30]); },
  };
}

/* ---------------- Exercise renderers ---------------- */

function Choice({ ex, onAnswer, locked }: { ex: Extract<Ex, { kind: 'mc' | 'listen' }>; onAnswer: (ok: boolean, fb: Feedback) => void; locked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const autoSpeak = useStore((s) => s.settings.autoSpeak);
  const audio = ex.kind === 'listen' || ex.dir === 'es-en' ? ex.item.es : undefined;
  useEffect(() => {
    if (audio && (autoSpeak || ex.kind === 'listen')) void say(audio);
  }, [ex]); // eslint-disable-line react-hooks/exhaustive-deps
  const choose = useCallback(
    (i: number) => {
      if (locked) return;
      setSel(i);
      const ok = i === ex.answer;
      const correct = ex.options[ex.answer];
      onAnswer(ok, { ok, correct: ex.kind === 'listen' ? `${correct} — ${firstEn(ex.item.en)}` : ex.dir === 'es-en' ? `${ex.item.es} = ${correct}` : `${correct} = ${firstEn(ex.item.en)}`, note: ex.item.note, audio: ex.item.es });
    },
    [ex, locked, onAnswer],
  );
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= ex.options.length && !(e.target instanceof HTMLInputElement)) choose(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choose, ex.options.length]);

  return (
    <div className="stack lg">
      {ex.kind === 'listen' ? (
        <div className="stack center">
          <div className="eyebrow">Escucha · What do you hear?</div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn primary lg round" onClick={() => say(ex.item.es)} aria-label="Play audio"><Volume2 /> Escuchar</button>
            <SpeakButton text={ex.item.es} slow size="md" />
          </div>
        </div>
      ) : ex.dir === 'es-en' ? (
        <div className="stack center">
          <div className="eyebrow">¿Qué significa? · What does it mean?</div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <span style={{ fontSize: 46 }}>{ex.item.emoji}</span>
            <span className="es" style={{ fontSize: 'clamp(30px, 6vw, 44px)' }}>{ex.item.es}</span>
            <SpeakButton text={ex.item.es} />
          </div>
        </div>
      ) : (
        <div className="stack center">
          <div className="eyebrow">¿Cómo se dice…? · How do you say…</div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <span style={{ fontSize: 46 }}>{ex.item.emoji}</span>
            <span style={{ fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 650 }}>“{firstEn(ex.item.en)}”</span>
          </div>
        </div>
      )}
      <div className="grid cols-2">
        {ex.options.map((o, i) => {
          const state = locked ? (i === ex.answer ? 'right' : i === sel ? 'wrong' : '') : sel === i ? 'sel' : '';
          return (
            <button key={i} className={`choice ${state}`} disabled={locked} onClick={() => choose(i)}>
              <span className="num">{i + 1}</span>
              <span className={ex.kind === 'listen' || ex.dir === 'en-es' ? 'es' : ''}>{o}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TypeIt({ ex, onAnswer, locked }: { ex: Extract<Ex, { kind: 'type' }>; onAnswer: (ok: boolean, fb: Feedback) => void; locked: boolean }) {
  const [v, setV] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  const submit = () => {
    if (locked || !v.trim()) return;
    const r = checkAnswer(v, ex.accepted);
    const ok = r.verdict !== 'wrong';
    const note =
      r.verdict === 'accent' ? `Casi perfecto — watch the accents: ${r.best}` :
      r.verdict === 'typo' ? `Small typo — it’s “${r.best}”` : ex.item.note;
    onAnswer(ok, { ok, correct: ex.item.es, note, audio: ex.item.es });
  };
  return (
    <div className="stack lg">
      <div className="stack center">
        <div className="eyebrow">Escribe en español · Type it in Spanish</div>
        <div className="row" style={{ justifyContent: 'center' }}>
          <span style={{ fontSize: 46 }}>{ex.item.emoji}</span>
          <span style={{ fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 650 }}>“{ex.prompt}”</span>
        </div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="stack">
        <input ref={ref} className="input big" value={v} onChange={(e) => setV(e.target.value)} disabled={locked} placeholder="Escribe aquí…" aria-label="Your answer" autoCapitalize="off" autoComplete="off" spellCheck={false} />
        <AccentBar target={ref} />
        {!locked && <button className="btn primary lg" type="submit" disabled={!v.trim()}>Comprobar</button>}
      </form>
    </div>
  );
}

function Match({ ex, onAnswer, locked }: { ex: Extract<Ex, { kind: 'match' }>; onAnswer: (ok: boolean, fb: Feedback) => void; locked: boolean }) {
  const left = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ t: p.es, i }))), [ex]);
  const right = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ t: p.en, i }))), [ex]);
  const [selL, setSelL] = useState<number | null>(null);
  const [selR, setSelR] = useState<number | null>(null);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const mistakes = useRef(0);
  const fx = useFx();
  useEffect(() => {
    if (selL === null || selR === null) return;
    if (selL === selR) {
      const next = new Set(done).add(selL);
      setDone(next);
      fx.good();
      void say(ex.pairs[selL].es);
      if (next.size === ex.pairs.length) {
        const ok = mistakes.current <= 1;
        setTimeout(() => onAnswer(ok, { ok, correct: ex.pairs.map((p) => `${p.es} = ${p.en}`).join(' · '), note: mistakes.current ? `${mistakes.current} mistake${mistakes.current > 1 ? 's' : ''}` : '¡Sin errores!' }), 350);
      }
    } else {
      mistakes.current++;
      fx.bad();
      setWrong(`${selL}-${selR}`);
      setTimeout(() => setWrong(null), 450);
    }
    setSelL(null);
    setSelR(null);
  }, [selL, selR]); // eslint-disable-line react-hooks/exhaustive-deps
  const cell = (side: 'l' | 'r', it: { t: string; i: number }) => {
    const isDone = done.has(it.i);
    const sel = side === 'l' ? selL === it.i : selR === it.i;
    const isWrong = wrong && (side === 'l' ? wrong.startsWith(`${it.i}-`) : wrong.endsWith(`-${it.i}`)) && sel === false;
    return (
      <button
        key={side + it.i}
        className={`choice ${isDone ? 'right' : sel ? 'sel' : ''} ${isWrong ? 'wrong' : ''}`}
        disabled={isDone || locked}
        style={{ justifyContent: 'center', opacity: isDone ? 0.5 : 1 }}
        onClick={() => {
          sfx.tap();
          if (side === 'l') {
            setSelL(it.i);
            void say(it.t);
          } else setSelR(it.i);
        }}
      >
        <span className={side === 'l' ? 'es' : ''}>{it.t}</span>
      </button>
    );
  };
  return (
    <div className="stack lg">
      <div className="eyebrow center">Une las parejas · Match the pairs</div>
      <div className="grid cols-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="stack sm">{left.map((it) => cell('l', it))}</div>
        <div className="stack sm">{right.map((it) => cell('r', it))}</div>
      </div>
    </div>
  );
}

function Build({ ex, onAnswer, locked }: { ex: Extract<Ex, { kind: 'build' }>; onAnswer: (ok: boolean, fb: Feedback) => void; locked: boolean }) {
  const [picked, setPicked] = useState<number[]>([]);
  const submit = () => {
    const words = picked.map((i) => ex.tiles[i]);
    const ok = checkBuild(words, ex.answer);
    onAnswer(ok, { ok, correct: ex.es, audio: ex.es });
  };
  return (
    <div className="stack lg">
      <div className="stack center">
        <div className="eyebrow">Arma la frase · Build the sentence</div>
        <div style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 600 }}>“{ex.en}”</div>
      </div>
      <div className="answer-line" aria-label="Your sentence">
        {picked.map((ti, k) => (
          <button key={k} className="wtile es" disabled={locked} onClick={() => { sfx.tap(); setPicked((p) => p.filter((_, j) => j !== k)); }}>
            {ex.tiles[ti]}
          </button>
        ))}
      </div>
      <div className="tiles-bank">
        {ex.tiles.map((t, i) => (
          <button key={i} className={`wtile es ${picked.includes(i) ? 'used' : ''}`} disabled={locked} onClick={() => { sfx.tap(); void say(t); setPicked((p) => [...p, i]); }}>
            {t}
          </button>
        ))}
      </div>
      {!locked && (
        <div className="row">
          <button className="btn ghost" onClick={() => setPicked([])} disabled={!picked.length}><RotateCcw /> Borrar</button>
          <button className="btn primary lg grow" onClick={submit} disabled={!picked.length}>Comprobar</button>
        </div>
      )}
    </div>
  );
}

function Speak({ ex, onAnswer, locked, onSkip }: { ex: Extract<Ex, { kind: 'speak' }>; onAnswer: (ok: boolean, fb: Feedback) => void; locked: boolean; onSkip: () => void }) {
  const [heard, setHeard] = useState('');
  const bump = useStore((s) => s.bump);
  const result = heard ? wordMatch(ex.es, heard) : null;
  return (
    <div className="stack lg center">
      <div className="eyebrow">Dilo en voz alta · Say it out loud</div>
      <div className="row" style={{ justifyContent: 'center' }}>
        <span className="es" style={{ fontSize: 'clamp(26px, 5.5vw, 38px)' }}>
          {result ? result.words.map((w, i) => <span key={i} style={{ color: w.ok ? 'var(--ok)' : 'var(--bad)' }}>{w.w} </span>) : ex.es}
        </span>
        <SpeakButton text={ex.es} />
        <SpeakButton text={ex.es} slow />
      </div>
      <div className="muted">{ex.en}</div>
      {!locked && (
        <div className="stack" style={{ alignItems: 'center' }}>
          <MicButton
            lang="es"
            size="lg"
            onInterim={(t) => t && setHeard(t)}
            onResult={(t) => {
              setHeard(t);
              const r = wordMatch(ex.es, t);
              bump('speakingAttempts');
              if (r.score >= 90) bump('speakingGreat');
              const ok = r.score >= 70;
              onAnswer(ok, { ok, correct: ex.es, note: `Escuché: “${t}” · ${r.score}%`, audio: ex.es });
            }}
          />
          {heard && <div className="small soft">“{heard}”</div>}
          <button className="btn sm ghost" onClick={onSkip}><SkipForward /> No puedo hablar ahora</button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Lesson screen ---------------- */

export default function Lesson({ route }: { route: Route }) {
  const [unitId, rawIdx] = [route.parts[1], route.parts[2]];
  const unit = UNIT_MAP[unitId];
  const which: number | 'final' = rawIdx === 'final' ? 'final' : Number(rawIdx);
  const lessons = unit ? lessonsFor(unit) : [];
  const lesson = unit ? (which === 'final' ? lessons[lessons.length - 1] : lessons[which as number]) : undefined;
  const lessonKey = `${unitId}:${which}`;
  const store = useStore();
  const fx = useFx();
  const seen = !!store.lessons[lessonKey];

  const [queue, setQueue] = useState<Ex[]>(() => (unit && lesson ? buildLesson(unit, which, Math.random, sttSupported()) : []));
  const [pos, setPos] = useState(0);
  const [phase, setPhase] = useState<Phase>(seen || which === 'final' ? 'quiz' : 'intro');
  const [introIdx, setIntroIdx] = useState(0);
  const [fb, setFb] = useState<Feedback | null>(null);
  const [stats, setStats] = useState({ right: 0, wrong: 0, combo: 0, maxCombo: 0, xp: 0 });
  const [requeued, setRequeued] = useState<Set<number>>(new Set());
  const startTime = useRef(Date.now());
  const [added, setAdded] = useState(0);

  const total = queue.length;
  const ex = queue[pos];

  const onAnswer = useCallback(
    (ok: boolean, f: Feedback) => {
      setFb(f);
      if (ok) {
        fx.good();
        setStats((s) => {
          const combo = s.combo + 1;
          return { ...s, right: s.right + 1, combo, maxCombo: Math.max(s.maxCombo, combo), xp: s.xp + (requeued.has(pos) ? 5 : 10) + (combo >= 5 ? 2 : 0) };
        });
      } else {
        fx.bad();
        setStats((s) => ({ ...s, wrong: s.wrong + 1, combo: 0 }));
        // retry this one later in the lesson (once)
        if (!requeued.has(pos)) {
          setQueue((q) => [...q, q[pos]]);
          setRequeued((r) => new Set(r).add(queue.length));
        }
        if (f.audio) void say(f.audio);
      }
    },
    [fx, pos, queue.length, requeued],
  );

  const finish = useCallback(() => {
    const acc = stats.right + stats.wrong ? stats.right / (stats.right + stats.wrong) : 1;
    const perfectBonus = stats.wrong === 0 ? 20 : 0;
    store.addXp(stats.xp + perfectBonus + 5);
    store.completeLesson(lessonKey, acc);
    store.bump('correct', stats.right);
    store.bump('wrong', stats.wrong);
    let n = 0;
    if (lesson) for (const it of lesson.items) if (store.addCard(it.es, firstEn(it.en), `Curso · ${unit?.es}`, it.note)) n++;
    setAdded(n);
    setPhase('done');
    if (store.settings.sfx) sfx.complete();
    emit({ type: 'confetti', intensity: acc >= 0.95 ? 1.3 : 0.8 });
  }, [lesson, lessonKey, stats, store, unit?.es]);

  const next = useCallback(() => {
    setFb(null);
    if (pos + 1 >= queue.length) finish();
    else setPos((p) => p + 1);
  }, [finish, pos, queue.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && fb && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fb, next]);

  if (!unit || !lesson) {
    return <div className="page narrow"><Empty emoji="🤔" title="Lesson not found"><a className="btn primary" href="#/learn">Back to course</a></Empty></div>;
  }

  const restart = () => {
    setQueue(buildLesson(unit, which, Math.random, sttSupported()));
    setPos(0);
    setFb(null);
    setStats({ right: 0, wrong: 0, combo: 0, maxCombo: 0, xp: 0 });
    setRequeued(new Set());
    startTime.current = Date.now();
    setPhase('quiz');
  };

  const nextLessonPath = (() => {
    if (which === 'final') {
      const ui = Object.keys(UNIT_MAP).indexOf(unitId);
      const nextUnit = Object.values(UNIT_MAP)[ui + 1];
      return nextUnit ? `/lesson/${nextUnit.id}/0` : '/learn';
    }
    const ni = (which as number) + 1;
    return ni >= lessons.length - 1 ? `/lesson/${unitId}/final` : `/lesson/${unitId}/${ni}`;
  })();

  /* ---- Intro (new words) ---- */
  if (phase === 'intro') {
    const it = lesson.items[introIdx];
    return (
      <div className="page narrow">
        <LessonTop progress={introIdx / lesson.items.length} combo={0} title={`${unit.emoji} ${unit.es} · Palabras nuevas`} />
        <div className="card center" style={{ padding: '36px 22px' }} key={it.id}>
          <div className="emoji-xl" style={{ margin: '0 auto 16px', fontSize: 80 }}>{it.emoji}</div>
          <div className="es" style={{ fontSize: 'clamp(34px, 7vw, 52px)' }}>{it.es}</div>
          <div className="h3 soft mt">{it.en.split(' / ').join(' · ')}</div>
          {it.note && <div className="callout mx mt" style={{ textAlign: 'left' }}>💡 {it.note}</div>}
          <div className="row mt" style={{ justifyContent: 'center' }}>
            <SpeakButton text={it.es} size="md" />
            <SpeakButton text={it.es} slow size="md" />
          </div>
          <AutoSay text={it.es} />
        </div>
        <div className="row mt between">
          <button className="btn ghost" onClick={() => setPhase('quiz')}>Saltar · Skip <SkipForward /></button>
          <button className="btn primary lg" onClick={() => (introIdx + 1 >= lesson.items.length ? setPhase('quiz') : setIntroIdx((i) => i + 1))}>
            {introIdx + 1 >= lesson.items.length ? '¡A practicar!' : 'Siguiente'} <ArrowRight />
          </button>
        </div>
      </div>
    );
  }

  /* ---- Done ---- */
  if (phase === 'done') {
    const acc = stats.right + stats.wrong ? stats.right / (stats.right + stats.wrong) : 1;
    const secs = Math.round((Date.now() - startTime.current) / 1000);
    const stars = acc >= 0.95 ? 3 : acc >= 0.8 ? 2 : 1;
    return (
      <div className="page narrow">
        <div className="card hero center stack" style={{ padding: '34px 22px' }}>
          <div className="emoji-xl pulse" style={{ margin: '0 auto' }}>{stars === 3 ? '🏆' : stars === 2 ? '🎉' : '💪'}</div>
          <div className="h1">{stars === 3 ? '¡Perfecto!' : stars === 2 ? '¡Muy bien!' : '¡Buen trabajo!'}</div>
          <div className="row" style={{ justifyContent: 'center', fontSize: 34 }}>{'⭐'.repeat(stars)}<span style={{ opacity: 0.2 }}>{'⭐'.repeat(3 - stars)}</span></div>
          <div className="grid cols-3 mt">
            <div className="stat"><b>{Math.round(acc * 100)}%</b><span>precisión</span></div>
            <div className="stat"><b>+{stats.xp + (stats.wrong === 0 ? 20 : 0) + 5}</b><span>XP</span></div>
            <div className="stat"><b>{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</b><span>tiempo</span></div>
          </div>
          {stats.maxCombo >= 3 && <div className="chip accent" style={{ margin: '0 auto' }}><Flame /> Mejor combo: {stats.maxCombo}</div>}
          {added > 0 && <div className="small soft">🗃️ {added} palabras nuevas en tu mazo de repaso.</div>}
          <div className="row mt" style={{ justifyContent: 'center' }}>
            <button className="btn" onClick={restart}><RotateCcw /> Repetir</button>
            <button className="btn" onClick={() => navigate('/learn')}>Curso</button>
            <button className="btn primary lg" onClick={() => navigate(nextLessonPath)}>Siguiente <ArrowRight /></button>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Quiz ---- */
  return (
    <div className="page narrow">
      <LessonTop progress={pos / Math.max(1, total)} combo={stats.combo} title={`${unit.emoji} ${unit.es} · ${lesson.title}`} />
      <div className="card" style={{ padding: 'clamp(18px, 4vw, 30px)', minHeight: 360 }} key={pos}>
        {ex.kind === 'mc' || ex.kind === 'listen' ? <Choice ex={ex} onAnswer={onAnswer} locked={!!fb} /> : null}
        {ex.kind === 'type' && <TypeIt ex={ex} onAnswer={onAnswer} locked={!!fb} />}
        {ex.kind === 'match' && <Match ex={ex} onAnswer={onAnswer} locked={!!fb} />}
        {ex.kind === 'build' && <Build ex={ex} onAnswer={onAnswer} locked={!!fb} />}
        {ex.kind === 'speak' && <Speak ex={ex} onAnswer={onAnswer} locked={!!fb} onSkip={next} />}
      </div>
      {fb && (
        <div className={`feedback mt ${fb.ok ? 'ok' : 'bad'}`} role="status">
          <div className="f-icon">{fb.ok ? <Check /> : <X />}</div>
          <div className="grow">
            <div style={{ fontWeight: 700, fontSize: 17 }}>{fb.ok ? ['¡Correcto!', '¡Eso!', '¡Muy bien!', '¡Órale, qué bien!', '¡Excelente!'][Math.floor(Math.random() * 5)] : 'Respuesta correcta:'}</div>
            <div className="es" style={{ fontSize: 17 }}>{fb.correct}</div>
            {fb.note && <div className="small soft" style={{ marginTop: 4 }}>{fb.note}</div>}
          </div>
          <div className="stack sm" style={{ alignItems: 'flex-end' }}>
            {fb.audio && <SpeakButton text={fb.audio} size="sm" />}
            <button className={`btn ${fb.ok ? 'ok' : 'bad'}`} onClick={next} autoFocus>Continuar <ArrowRight /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function AutoSay({ text }: { text: string }) {
  const autoSpeak = useStore((s) => s.settings.autoSpeak);
  useEffect(() => {
    if (autoSpeak) void say(text);
  }, [text, autoSpeak]);
  return null;
}

function LessonTop({ progress, combo, title }: { progress: number; combo: number; title: string }) {
  return (
    <div className="stack sm" style={{ marginBottom: 16 }}>
      <div className="row between nowrap">
        <button className="btn icon sm ghost" onClick={() => { if (confirm('¿Salir de la lección? Your progress in this lesson will be lost.')) navigate('/learn'); }} aria-label="Exit lesson"><X /></button>
        <div className="small soft grow" style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        {combo >= 2 ? <span className="chip accent pulse"><Flame /> x{combo}</span> : <span className="chip" aria-hidden><Ear /></span>}
      </div>
      <div className="bar"><i style={{ width: `${progress * 100}%` }} /></div>
    </div>
  );
}
