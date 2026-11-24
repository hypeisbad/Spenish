import { useState } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import type { Route } from '../lib/router';
import { navigate } from '../lib/router';
import { GRAMMAR, GRAMMAR_MAP } from '../data/grammar';
import { useStore } from '../lib/store';
import { sfx } from '../lib/sound';
import { emit } from '../lib/events';
import { PageHead, SpeakButton, Empty } from '../components/ui';

function Quiz({ id }: { id: string }) {
  const g = GRAMMAR_MAP[id];
  const addXp = useStore((s) => s.addXp);
  const sound = useStore((s) => s.settings.sfx);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const done = Object.keys(answers).length === g.quiz.length;
  const score = g.quiz.filter((q, i) => answers[i] === q.answer).length;
  return (
    <div className="card mt">
      <div className="card-title">🧠 Mini quiz</div>
      <div className="stack lg">
        {g.quiz.map((q, i) => {
          const a = answers[i];
          return (
            <div key={i} className="stack sm">
              <div className="es" style={{ fontSize: 19 }}>{q.q}</div>
              <div className="row">
                {q.options.map((o, oi) => {
                  const state = a === undefined ? '' : oi === q.answer ? 'right' : oi === a ? 'wrong' : '';
                  return (
                    <button
                      key={oi}
                      className={`choice ${state}`}
                      style={{ width: 'auto', minWidth: 110, justifyContent: 'center' }}
                      disabled={a !== undefined}
                      onClick={() => {
                        const next = { ...answers, [i]: oi };
                        setAnswers(next);
                        if (sound) (oi === q.answer ? sfx.correct : sfx.wrong)();
                        if (Object.keys(next).length === g.quiz.length) {
                          const sc = g.quiz.filter((qq, ii) => next[ii] === qq.answer).length;
                          addXp(sc * 4);
                          if (sc === g.quiz.length) emit({ type: 'confetti', intensity: 0.6 });
                        }
                      }}
                    >
                      <span className="es">{o}</span>
                    </button>
                  );
                })}
              </div>
              {a !== undefined && (
                <div className={`small ${a === q.answer ? '' : ''}`} style={{ color: a === q.answer ? 'var(--ok)' : '#ffb3c3' }}>
                  {a === q.answer ? <Check style={{ display: 'inline', width: 15, verticalAlign: -3 }} /> : <X style={{ display: 'inline', width: 15, verticalAlign: -3 }} />} {q.why}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {done && (
        <div className="row between mt">
          <b>{score}/{g.quiz.length} {score === g.quiz.length ? '— ¡perfecto! 🎉' : ''}</b>
          <button className="btn sm" onClick={() => setAnswers({})}>Otra vez</button>
        </div>
      )}
    </div>
  );
}

export default function Grammar({ route }: { route: Route }) {
  const id = route.parts[1];
  if (id) {
    const g = GRAMMAR_MAP[id];
    if (!g) return <div className="page narrow"><Empty emoji="📐" title="Topic not found" /></div>;
    return (
      <div className="page narrow">
        <button className="btn sm ghost" onClick={() => navigate('/grammar')}><ArrowLeft /> Gramática</button>
        <div className="card hero mt">
          <div className="row"><span style={{ fontSize: 40 }}>{g.emoji}</span><span className="chip">{g.level}</span></div>
          <h1 className="h1 mt">{g.title}</h1>
          <div className="h3 soft">{g.titleEn}</div>
          <p className="soft">{g.summary}</p>
        </div>
        {g.sections.map((s) => (
          <div key={s.h} className="card mt">
            <div className="h3">{s.h}</div>
            <p className="soft" style={{ marginBottom: s.ex ? 10 : 0 }}>{s.p}</p>
            {s.ex && (
              <div className="list">
                {s.ex.map(([es, en]) => (
                  <div className="list-item" key={es}>
                    <div className="grow">
                      <div className="es" style={{ fontWeight: 600, fontSize: 17 }}>{es}</div>
                      <div className="small muted">{en}</div>
                    </div>
                    <SpeakButton text={es} size="xs" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <Quiz id={g.id} />
      </div>
    );
  }
  return (
    <div className="page">
      <PageHead eyebrow="Gramática · Grammar" es="La gramática sin dolor" en="Grammar without the pain" desc="Short, practical guides with Mexican examples, audio, and a quiz at the end of each." />
      <div className="grid auto">
        {GRAMMAR.map((g) => (
          <a key={g.id} href={`#/grammar/${g.id}`} className="tile">
            <div className="row between"><div className="tile-icon">{g.emoji}</div><span className="chip">{g.level}</span></div>
            <div>
              <div className="tile-title">{g.title}</div>
              <div className="tile-desc">{g.titleEn} — {g.summary}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
