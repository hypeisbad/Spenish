import { Check, Play, Star } from 'lucide-react';
import { useStore } from '../lib/store';
import { UNITS, lessonsFor } from '../data/units';
import { navigate } from '../lib/router';
import { PageHead } from '../components/ui';
import { nextLesson } from './Home';

export default function Learn() {
  const lessons = useStore((s) => s.lessons);
  const next = nextLesson(lessons);
  const totalLessons = UNITS.reduce((n, u) => n + lessonsFor(u).length, 0);
  const done = Object.keys(lessons).length;

  return (
    <div className="page">
      <PageHead
        eyebrow="Curso · Course"
        es="Español de México, paso a paso"
        en="Mexican Spanish, step by step"
        desc={`${UNITS.length} units · ${totalLessons} lessons · listening, speaking, typing, matching and sentence building. Every word you learn goes into your flashcard deck automatically.`}
        right={
          <div className="card tight flat" style={{ minWidth: 220 }}>
            <div className="row between small"><span className="muted">Progreso</span><b>{done}/{totalLessons}</b></div>
            <div className="bar mt" style={{ marginTop: 8 }}><i style={{ width: `${(done / totalLessons) * 100}%` }} /></div>
          </div>
        }
      />
      <div className="stack lg">
        {UNITS.map((u, ui) => {
          const ls = lessonsFor(u);
          const keys = ls.map((l, i) => (l.review ? `${u.id}:final` : `${u.id}:${i}`));
          const doneCount = keys.filter((k) => lessons[k]).length;
          const complete = doneCount === ls.length;
          const isNext = next?.unitId === u.id;
          return (
            <section
              key={u.id}
              className={`card ${isNext ? 'glow' : ''}`}
              style={{ background: `linear-gradient(120deg, ${u.color}22, transparent 55%), var(--panel)` }}
              aria-label={`Unit ${ui + 1}: ${u.en}`}
            >
              <div className="row nowrap" style={{ alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 62, height: 62, borderRadius: 18, display: 'grid', placeItems: 'center', fontSize: 32, background: `${u.color}26`, border: `1px solid ${u.color}55`, flex: 'none' }}>
                  {u.emoji}
                </div>
                <div className="grow">
                  <div className="row between">
                    <div>
                      <div className="tiny muted" style={{ fontWeight: 600, letterSpacing: '.1em' }}>UNIDAD {ui + 1}</div>
                      <div className="h2">{u.es}<span className="bi-en">{u.en}</span></div>
                    </div>
                    <div className="row">
                      {complete && <span className="chip ok"><Check /> Completa</span>}
                      {isNext && <span className="chip accent">Siguiente</span>}
                      <span className="chip">{doneCount}/{ls.length}</span>
                    </div>
                  </div>
                  <div className="soft small" style={{ marginTop: 4 }}>{u.desc}</div>
                  <div className="row mt">
                    {ls.map((l, i) => {
                      const key = keys[i];
                      const rec = lessons[key];
                      const idx = l.review ? 'final' : i;
                      const recommended = isNext && next?.idx === idx;
                      return (
                        <button
                          key={key}
                          className={`btn sm ${recommended ? 'primary' : rec ? 'on' : ''}`}
                          onClick={() => navigate(`/lesson/${u.id}/${idx}`)}
                          title={l.review ? 'Final review: everything in this unit + sentences' : `${l.items.map((x) => x.es).join(', ')}`}
                        >
                          {rec ? (
                            <span className="row nowrap" style={{ gap: 1 }}>
                              {[0, 1, 2].map((s) => <Star key={s} style={{ width: 13, height: 13 }} fill={s < rec.stars ? 'currentColor' : 'none'} />)}
                            </span>
                          ) : recommended ? <Play /> : null}
                          {l.review ? '🏁 Repaso final' : l.title}
                        </button>
                      );
                    })}
                  </div>
                  <div className="callout mx mt small">🇲🇽 {u.tip}</div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
