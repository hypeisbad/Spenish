import { useMemo } from 'react';
import { CULTURE, HOLIDAYS, upcomingHolidays } from '../data/culture';
import { PageHead, SpeakButton, SaveButton } from '../components/ui';

export default function Culture() {
  const year = new Date().getFullYear();
  const next = useMemo(() => upcomingHolidays(new Date(), 1)[0], []);
  const all = useMemo(
    () => HOLIDAYS.map((h) => ({ h, date: h.date(year) })).sort((a, b) => a.date.getTime() - b.date.getTime()),
    [year],
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    <div className="page">
      <PageHead eyebrow="Cultura · Culture" es="México, de cerca" en="Mexico up close" desc="Fiestas, food, customs and the stories behind the words." />
      {next && (
        <div className="card hero" style={{ marginBottom: 18 }}>
          <div className="row nowrap">
            <div style={{ fontSize: 56 }} className="float">{next.h.emoji}</div>
            <div className="grow">
              <div className="eyebrow">Próxima fiesta · {next.days === 0 ? '¡Hoy!' : `en ${next.days} días`}</div>
              <div className="h2">{next.h.name}</div>
              <div className="soft">{next.h.en} · {next.date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
              <div className="small mt">{next.h.desc}</div>
            </div>
          </div>
        </div>
      )}
      <div className="grid auto" style={{ marginBottom: 22 }}>
        {CULTURE.map((c) => (
          <article key={c.id} className="card">
            <div className="row between"><span style={{ fontSize: 38 }}>{c.emoji}</span><span className="chip">{c.tag}</span></div>
            <div className="h3 mt">{c.title}</div>
            <p className="small soft" style={{ lineHeight: 1.6 }}>{c.body}</p>
            <div className="list">
              {c.words.map(([es, en]) => (
                <div key={es} className="list-item" style={{ padding: '7px 0' }}>
                  <div className="grow"><b className="es">{es}</b> <span className="small muted">· {en}</span></div>
                  <SpeakButton text={es} size="xs" />
                  <SaveButton es={es} en={en} source="Cultura" size="xs" />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="card">
        <div className="card-title">📅 Calendario de fiestas {year}</div>
        <div className="list">
          {all.map(({ h, date }) => {
            const past = date < today;
            return (
              <div key={h.name} className="list-item" style={{ opacity: past ? 0.45 : 1 }}>
                <span style={{ fontSize: 22, width: 30 }}>{h.emoji}</span>
                <span className="small" style={{ width: 92, fontVariantNumeric: 'tabular-nums' }}>{date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                <div className="grow">
                  <div style={{ fontWeight: 600 }}>{h.name} <span className="muted small">· {h.en}</span></div>
                  <div className="tiny muted">{h.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
