import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Flame, Languages, Layers, Mic, Sparkles, Zap, CalendarHeart, Clock, ChevronRight } from 'lucide-react';
import { useStore, liveStreak, levelInfo, todayXp } from '../lib/store';
import { nowInZone, timeToSpanish } from '../lib/time';
import { wordOfTheDay } from '../data/lexicon';
import { upcomingHolidays } from '../data/culture';
import { UNITS, lessonsFor } from '../data/units';
import { SPAIN_VS_MEXICO } from '../data/slang';
import { dueCards } from '../lib/srs';
import { navigate } from '../lib/router';
import { NAV } from '../components/nav';
import { PapelPicado, Ring, SaveButton, SpeakButton, MicButton, say } from '../components/ui';

function greeting(h: number): string {
  if (h < 12) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

function useCdmxClock() {
  const [now, setNow] = useState(() => nowInZone());
  useEffect(() => {
    const t = setInterval(() => setNow(nowInZone()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function nextLesson(lessons: Record<string, unknown>): { unitId: string; idx: number | 'final'; title: string; unitTitle: string; emoji: string } | null {
  for (const u of UNITS) {
    const ls = lessonsFor(u);
    for (let i = 0; i < ls.length; i++) {
      const key = ls[i].review ? `${u.id}:final` : `${u.id}:${i}`;
      if (!lessons[key]) return { unitId: u.id, idx: ls[i].review ? 'final' : i, title: ls[i].title, unitTitle: u.es, emoji: u.emoji };
    }
  }
  return null;
}

export default function Home() {
  const s = useStore();
  const clock = useCdmxClock();
  const t = timeToSpanish(clock.h, clock.m);
  const wotd = useMemo(() => wordOfTheDay(), []);
  const holidays = useMemo(() => upcomingHolidays(new Date(), 3), []);
  const fact = useMemo(() => SPAIN_VS_MEXICO[Math.floor(Math.random() * SPAIN_VS_MEXICO.length)], []);
  const streak = liveStreak(s.streak);
  const lv = levelInfo(s.xp);
  const today = todayXp(s);
  const goal = s.settings.dailyGoal;
  const due = dueCards(Object.values(s.srs)).length;
  const next = nextLesson(s.lessons);
  const [quick, setQuick] = useState('');
  const localHour = new Date().getHours();
  const name = s.settings.name;

  return (
    <div className="page">
      <section className="card hero" style={{ paddingTop: 72, marginBottom: 18 }}>
        <PapelPicado count={11} />
        <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) auto', alignItems: 'center', gap: 20 }}>
          <div className="stack sm">
            <div className="eyebrow">{clock.weekday} · {clock.dateText}</div>
            <h1 className="h1">
              ¡{greeting(localHour)}{name ? `, ${name}` : ''}!
            </h1>
            <div className="row nowrap" style={{ alignItems: 'flex-start' }}>
              <Clock style={{ width: 18, height: 18, color: 'var(--cempa)', marginTop: 4, flex: 'none' }} />
              <div>
                <div className="es" style={{ fontSize: 19 }}>
                  En la Ciudad de México: {t.main.charAt(0).toLowerCase() + t.main.slice(1)}.
                </div>
                <div className="tiny muted">
                  {String(clock.h).padStart(2, '0')}:{String(clock.m).padStart(2, '0')}:{String(clock.s).padStart(2, '0')} CDMX
                  {t.alt ? ` · también: “${t.alt}”` : ''}
                  {' · '}
                  <button className="btn xs ghost" style={{ display: 'inline-flex', height: 22 }} onClick={() => say(`En la Ciudad de México ${t.main.toLowerCase()}`)}>
                    🔊 escuchar
                  </button>
                </div>
              </div>
            </div>
            <div className="row mt">
              {next ? (
                <button className="btn primary lg" onClick={() => navigate(`/lesson/${next.unitId}/${next.idx}`)}>
                  {next.emoji} Continuar: {next.unitTitle} · {next.title} <ArrowRight />
                </button>
              ) : (
                <button className="btn primary lg" onClick={() => navigate('/review')}>🏆 Course complete — review</button>
              )}
              <button className="btn lg" onClick={() => navigate('/translate')}><Languages /> Traducir</button>
            </div>
          </div>
          <div className="hide-sm">
            <Ring value={today / goal} size={150} stroke={12}>
              <div>
                <div style={{ fontSize: 30, fontWeight: 700 }}>{today}</div>
                <div className="tiny muted">/ {goal} XP hoy</div>
                {today >= goal && <div className="tiny" style={{ color: 'var(--ok)' }}>¡Meta cumplida! ✓</div>}
              </div>
            </Ring>
          </div>
        </div>
      </section>

      <div className="grid cols-4" style={{ marginBottom: 18 }}>
        <a className="card tight" href="#/progress" style={{ color: 'inherit' }}>
          <div className="stat"><b className="row nowrap" style={{ gap: 6 }}><Flame style={{ color: 'var(--cempa)', width: 22 }} />{streak}</b><span>racha · day streak</span></div>
        </a>
        <a className="card tight" href="#/progress" style={{ color: 'inherit' }}>
          <div className="stat"><b className="row nowrap" style={{ gap: 6 }}><Zap style={{ color: 'var(--accent)', width: 22 }} />{s.xp}</b><span>XP total · Nivel {lv.level}</span></div>
          <div className="bar thin mt" style={{ marginTop: 8 }}><i style={{ width: `${lv.pct * 100}%` }} /></div>
        </a>
        <a className="card tight" href="#/review" style={{ color: 'inherit' }}>
          <div className="stat"><b className="row nowrap" style={{ gap: 6 }}><Layers style={{ color: 'var(--morado)', width: 22 }} />{due}</b><span>tarjetas para repasar</span></div>
        </a>
        <div className="card tight">
          <div className="stat"><b>{today}/{goal}</b><span>XP de hoy · today</span></div>
          <div className="bar thin" style={{ marginTop: 8 }}><i style={{ width: `${Math.min(100, (today / goal) * 100)}%` }} /></div>
        </div>
      </div>

      <div className="grid cols-3" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-title"><Sparkles /> Palabra del día</div>
          <div className="row nowrap between" style={{ alignItems: 'flex-start' }}>
            <div>
              <div className="es" style={{ fontSize: 30, lineHeight: 1.1 }}>{wotd.es}</div>
              <div className="soft mt" style={{ marginTop: 6 }}>{wotd.en}</div>
            </div>
            <div style={{ fontSize: 38 }}>{wotd.emoji}</div>
          </div>
          {wotd.ex && <div className="small mt"><span className="es">{wotd.ex}</span><div className="muted">{wotd.exEn}</div></div>}
          {wotd.note && <div className="tiny muted mt">💡 {wotd.note}</div>}
          <div className="row mt">
            <SpeakButton text={wotd.es} />
            <SpeakButton text={wotd.es} slow />
            <SaveButton es={wotd.es} en={wotd.en} source="Palabra del día" note={wotd.note} />
          </div>
        </div>

        <div className="card">
          <div className="card-title"><Languages /> Traducción rápida</div>
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              if (quick.trim()) navigate(`/translate?q=${encodeURIComponent(quick.trim())}`);
            }}
          >
            <input className="input" placeholder="Type English or Spanish…" value={quick} onChange={(e) => setQuick(e.target.value)} aria-label="Quick translate" />
            <div className="row">
              <button className="btn primary sm" type="submit" disabled={!quick.trim()}>Traducir <ArrowRight /></button>
              <MicButton size="sm" lang="en" onResult={(t) => navigate(`/translate?q=${encodeURIComponent(t)}`)} />
              <button type="button" className="btn sm" onClick={() => navigate('/conversation')}><Mic /> Modo conversación</button>
            </div>
          </form>
          <div className="callout mx mt small">
            <span>🇲🇽</span>
            <span>In Mexico it’s <b>{fact.mx}</b>, in Spain <b>{fact.es}</b> ({fact.en}).{fact.note ? ` ${fact.note}` : ''}</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><CalendarHeart /> Próximas fiestas</div>
          <div className="list">
            {holidays.map(({ h, date, days }) => (
              <div className="list-item" key={h.name + date.toISOString()}>
                <span style={{ fontSize: 26 }}>{h.emoji}</span>
                <div className="grow">
                  <div style={{ fontWeight: 600 }}>{h.name}</div>
                  <div className="tiny muted">{date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })} · {h.desc}</div>
                </div>
                <span className="chip accent">{days === 0 ? '¡Hoy!' : days === 1 ? 'Mañana' : `${days} días`}</span>
              </div>
            ))}
          </div>
          <a href="#/culture" className="btn sm ghost mt">Ver cultura <ChevronRight /></a>
        </div>
      </div>

      {NAV.slice(0, 4).map((g) => (
        <section key={g.es} style={{ marginBottom: 20 }}>
          <div className="nav-group" style={{ paddingLeft: 2 }}>{g.es} · {g.en}</div>
          <div className="grid auto">
            {g.items.filter((n) => n.path !== '/').map((n) => (
              <a key={n.path} className="tile" href={'#' + n.path} style={{ ['--tile' as string]: n.color }}>
                <div className="tile-icon">{n.emoji}</div>
                <div>
                  <div className="tile-title">{n.es}<span className="bi-en">{n.en}</span></div>
                  <div className="tile-desc">{n.desc}</div>
                </div>
                <ArrowRight className="tile-arrow" />
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
