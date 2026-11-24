import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Pause, Play, Languages } from 'lucide-react';
import type { Route } from '../lib/router';
import { navigate } from '../lib/router';
import { STORIES, STORY_MAP, type Story } from '../data/stories';
import { speak, stopSpeaking } from '../lib/speech';
import { useStore } from '../lib/store';
import { emit } from '../lib/events';
import { sfx } from '../lib/sound';
import { PageHead, SpeakButton, TapText, Empty } from '../components/ui';

function Reader({ story }: { story: Story }) {
  const settings = useStore((s) => s.settings);
  const addXp = useStore((s) => s.addXp);
  const bump = useStore((s) => s.bump);
  const [showAll, setShowAll] = useState(false);
  const [shown, setShown] = useState<Set<number>>(new Set());
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(-1);
  const [charIdx, setCharIdx] = useState<number | undefined>(undefined);
  const [rate, setRate] = useState(settings.rate);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const cancel = useRef(false);
  const rewarded = useRef(false);

  useEffect(() => () => { cancel.current = true; stopSpeaking(); }, []);

  const playFrom = async (start: number) => {
    cancel.current = false;
    setPlaying(true);
    for (let i = start; i < story.sentences.length; i++) {
      if (cancel.current) break;
      setCur(i);
      setCharIdx(undefined);
      await speak(story.sentences[i].es, { voiceURI: settings.voiceURI, rate, onBoundary: (c) => setCharIdx(c) });
      if (cancel.current) break;
      await new Promise((r) => setTimeout(r, 250));
    }
    setPlaying(false);
    setCur(-1);
    setCharIdx(undefined);
  };

  const toggle = () => {
    if (playing) {
      cancel.current = true;
      stopSpeaking();
      setPlaying(false);
    } else void playFrom(cur >= 0 ? cur : 0);
  };

  const answered = Object.keys(answers).length;
  const correct = story.questions.filter((q, i) => answers[i] === q.answer).length;
  useEffect(() => {
    if (answered === story.questions.length && !rewarded.current) {
      rewarded.current = true;
      addXp(10 + correct * 5);
      bump('storiesRead');
      if (correct === story.questions.length) emit({ type: 'confetti', intensity: 0.8 });
      if (settings.sfx) sfx.complete();
    }
  }, [answered, correct, story.questions.length, addXp, bump, settings.sfx]);

  return (
    <div className="page narrow">
      <button className="btn sm ghost" onClick={() => navigate('/stories')}><ArrowLeft /> Historias</button>
      <div className="card hero mt">
        <div className="row between">
          <div className="row nowrap">
            <span style={{ fontSize: 46 }}>{story.emoji}</span>
            <div>
              <div className="h1" style={{ fontSize: 'clamp(26px, 5vw, 38px)' }}>{story.title}</div>
              <div className="soft">{story.titleEn} · <span className="chip">{story.level}</span> · {story.minutes} min</div>
            </div>
          </div>
        </div>
        <div className="row mt">
          <button className="btn primary" onClick={toggle}>{playing ? <><Pause /> Pausa</> : <><Play /> {cur > 0 ? 'Continuar' : 'Escuchar la historia'}</>}</button>
          <button className={`btn ${showAll ? 'on' : ''}`} onClick={() => setShowAll((v) => !v)}>{showAll ? <Eye /> : <EyeOff />} Traducción</button>
          <label className="row small soft" style={{ gap: 8 }}>
            🐢
            <input type="range" min={0.6} max={1.2} step={0.05} value={rate} onChange={(e) => setRate(Number(e.target.value))} style={{ width: 110 }} aria-label="Reading speed" />
            🐇
          </label>
        </div>
        <div className="tiny muted mt">Toca cualquier palabra para ver su significado y conjugación · Tap any word for its meaning.</div>
      </div>
      <div className="card mt">
        <div className="stack" style={{ gap: 14 }}>
          {story.sentences.map((s, i) => (
            <div key={i} style={{ padding: '8px 10px', borderRadius: 12, background: cur === i ? 'rgba(255,166,48,.10)' : 'transparent', borderLeft: `3px solid ${cur === i ? 'var(--cempa)' : 'transparent'}`, transition: 'all .25s' }}>
              <div className="row nowrap" style={{ alignItems: 'flex-start' }}>
                <div className="grow es" style={{ fontSize: 20, lineHeight: 1.55 }}>
                  <TapText text={s.es} sentenceEn={s.en} highlight={cur === i ? charIdx : undefined} />
                </div>
                <div className="row nowrap" style={{ gap: 4 }}>
                  <SpeakButton text={s.es} size="xs" />
                  <button className={`btn icon xs ${shown.has(i) ? 'on' : ''}`} aria-label="Show translation" onClick={() => setShown((x) => { const n = new Set(x); if (n.has(i)) n.delete(i); else n.add(i); return n; })}><Languages /></button>
                </div>
              </div>
              {(showAll || shown.has(i)) && <div className="small muted" style={{ marginTop: 4 }}>{s.en}</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="card mt">
        <div className="card-title">❓ Comprensión</div>
        <div className="stack lg">
          {story.questions.map((q, i) => (
            <div key={i} className="stack sm">
              <div className="es" style={{ fontSize: 18 }}>{q.q}</div>
              <div className="tiny muted">{q.qEn}</div>
              <div className="stack sm">
                {q.options.map((o, oi) => {
                  const a = answers[i];
                  const st = a === undefined ? '' : oi === q.answer ? 'right' : oi === a ? 'wrong' : '';
                  return (
                    <button key={oi} className={`choice ${st}`} disabled={a !== undefined} onClick={() => { setAnswers((x) => ({ ...x, [i]: oi })); if (settings.sfx) (oi === q.answer ? sfx.correct : sfx.wrong)(); }}>
                      <span className="es">{o}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {answered === story.questions.length && (
          <div className="feedback ok mt">
            <div className="f-icon">🎉</div>
            <div className="grow"><b>{correct}/{story.questions.length} correctas</b><div className="small">+{10 + correct * 5} XP</div></div>
            <button className="btn ok" onClick={() => navigate('/stories')}>Más historias</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Stories({ route }: { route: Route }) {
  const id = route.parts[1];
  if (id) {
    const s = STORY_MAP[id];
    if (!s) return <div className="page narrow"><Empty emoji="📖" title="Story not found" /></div>;
    return <Reader story={s} />;
  }
  return (
    <div className="page">
      <PageHead eyebrow="Historias · Stories" es="Lee y escucha" en="Read & listen" desc="Original graded stories set in Mexico. Listen with karaoke-style highlighting, tap any word for its meaning, then test your comprehension." />
      <div className="grid auto">
        {STORIES.map((s) => (
          <a key={s.id} className="tile" href={`#/stories/${s.id}`} style={{ minHeight: 170 }}>
            <div className="row between"><div className="tile-icon" style={{ fontSize: 26 }}>{s.emoji}</div><span className="chip">{s.level}</span></div>
            <div>
              <div className="tile-title">{s.title}</div>
              <div className="tile-desc">{s.titleEn} · {s.minutes} min · {s.sentences.length} frases</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
