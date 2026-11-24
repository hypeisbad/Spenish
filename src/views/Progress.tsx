import { useMemo, useState } from 'react';
import { Flame, Zap, Trophy, Target } from 'lucide-react';
import { useStore, levelInfo, liveStreak, ACHIEVEMENTS, LEVEL_NAMES } from '../lib/store';
import { dayKey } from '../lib/text';
import { UNITS, lessonsFor } from '../data/units';
import { PageHead, Ring } from '../components/ui';

function lastDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() - i);
    out.push(dayKey(x));
  }
  return out;
}

/** Single-series bar chart: XP per day (one hue, rounded data-ends, hover tooltip). */
function XpChart({ data }: { data: { day: string; xp: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 180;
  const pad = { l: 34, r: 8, t: 14, b: 24 };
  const max = Math.max(20, ...data.map((d) => d.xp));
  const nice = Math.ceil(max / 20) * 20;
  const bw = (W - pad.l - pad.r) / data.length;
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / nice);
  const ticks = [0, nice / 2, nice];
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="XP earned per day over the last 30 days" onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,.07)" strokeWidth={1} />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="var(--muted)">{t}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.l + i * bw + 1;
          const w = Math.max(2, bw - 2);
          const top = y(d.xp);
          const h = H - pad.b - top;
          const r = Math.min(4, w / 2, h);
          const path = h > 0
            ? `M${x},${H - pad.b} V${top + r} Q${x},${top} ${x + r},${top} H${x + w - r} Q${x + w},${top} ${x + w},${top + r} V${H - pad.b} Z`
            : '';
          return (
            <g key={d.day}>
              {path && <path d={path} fill="var(--accent)" opacity={hover === null || hover === i ? 1 : 0.45} />}
              <rect x={pad.l + i * bw} y={pad.t} width={bw} height={H - pad.t - pad.b} fill="transparent" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0} aria-label={`${d.day}: ${d.xp} XP`} />
              {(i === 0 || i === data.length - 1 || i % 7 === 0) && (
                <text x={pad.l + i * bw + bw / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--muted)">{d.day.slice(8)}/{d.day.slice(5, 7)}</text>
              )}
            </g>
          );
        })}
        <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="rgba(255,255,255,.18)" strokeWidth={1} />
      </svg>
      {hover !== null && (
        <div className="chip" style={{ position: 'absolute', top: 0, left: `${((pad.l + hover * bw + bw / 2) / W) * 100}%`, transform: 'translateX(-50%)', pointerEvents: 'none', background: 'var(--panel-solid)', color: 'var(--text)' }}>
          {new Date(data[hover].day + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })} · <b>{data[hover].xp} XP</b>
        </div>
      )}
    </div>
  );
}

/** Activity heatmap — sequential single hue, dim → bright on the dark surface. */
function Heatmap({ xpByDay, goal }: { xpByDay: Record<string, number>; goal: number }) {
  const days = lastDays(7 * 20);
  const level = (v: number) => (v <= 0 ? 0 : v < goal * 0.5 ? 1 : v < goal ? 2 : v < goal * 2 ? 3 : 4);
  const alpha = [0, 0.28, 0.5, 0.75, 1];
  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks.length}, 1fr)`, gap: 3, minWidth: 420 }}>
        {weeks.map((w, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gap: 3 }}>
            {w.map((d) => {
              const v = xpByDay[d] ?? 0;
              const l = level(v);
              return (
                <div key={d} title={`${d}: ${v} XP`} style={{ aspectRatio: '1', borderRadius: 3, background: l ? `rgba(var(--accent-rgb), ${alpha[l]})` : 'rgba(255,255,255,.05)' }} />
              );
            })}
          </div>
        ))}
      </div>
      <div className="row tiny muted mt" style={{ justifyContent: 'flex-end', gap: 4 }}>
        Menos {alpha.map((a, i) => <span key={i} style={{ width: 11, height: 11, borderRadius: 3, display: 'inline-block', background: i ? `rgba(var(--accent-rgb), ${a})` : 'rgba(255,255,255,.05)' }} />)} Más
      </div>
    </div>
  );
}

export default function Progress() {
  const s = useStore();
  const lv = levelInfo(s.xp);
  const streak = liveStreak(s.streak);
  const days = useMemo(() => lastDays(30).map((d) => ({ day: d, xp: s.xpByDay[d] ?? 0 })), [s.xpByDay]);
  const week = days.slice(-7).reduce((n, d) => n + d.xp, 0);
  const acc = s.stats.correct + s.stats.wrong ? Math.round((s.stats.correct / (s.stats.correct + s.stats.wrong)) * 100) : 0;
  const unlocked = ACHIEVEMENTS.filter((a) => s.achievements[a.id]).length;
  const [table, setTable] = useState(false);

  const stats: [string, string | number, string][] = [
    ['🎓', s.stats.lessons, 'lecciones'],
    ['🎯', `${acc}%`, 'precisión'],
    ['🗃️', Object.keys(s.srs).length, 'tarjetas'],
    ['🧠', s.stats.reviews, 'repasos'],
    ['🔁', s.stats.translations, 'traducciones'],
    ['🎮', s.stats.gamesPlayed, 'partidas'],
    ['🎴', s.stats.loteriaWins, '¡loterías!'],
    ['🎙️', s.stats.speakingAttempts, 'intentos de voz'],
    ['📖', s.stats.storiesRead, 'historias'],
    ['💬', s.stats.aiMessages, 'mensajes a Profe'],
    ['🎭', s.stats.scenarios, 'escenas'],
    ['⚡', s.stats.sprintBest, 'récord relámpago'],
  ];

  return (
    <div className="page">
      <PageHead eyebrow="Progreso · Progress" es="Tu camino" en="Your journey" />
      <div className="grid cols-3" style={{ marginBottom: 16 }}>
        <div className="card hero center">
          <div style={{ margin: '0 auto' }}>
            <Ring value={lv.pct} size={150} stroke={12}>
              <div><div className="tiny muted">Nivel</div><div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>{lv.level}</div></div>
            </Ring>
          </div>
          <div className="h2 mt">{lv.name}</div>
          <div className="small muted">{lv.need - lv.into} XP para {LEVEL_NAMES[Math.min(lv.level, LEVEL_NAMES.length - 1)]}</div>
        </div>
        <div className="card">
          <div className="stack">
            <div className="row"><Flame style={{ color: 'var(--cempa)' }} /><div className="stat"><b>{streak} días</b><span>racha actual · mejor: {s.streak.best}</span></div></div>
            <div className="row"><Zap style={{ color: 'var(--accent)' }} /><div className="stat"><b>{s.xp} XP</b><span>total · {week} esta semana</span></div></div>
            <div className="row"><Target style={{ color: 'var(--ok)' }} /><div className="stat"><b>{s.settings.dailyGoal} XP</b><span>meta diaria · <a href="#/settings">cambiar</a></span></div></div>
            <div className="row"><Trophy style={{ color: 'var(--warn)' }} /><div className="stat"><b>{unlocked}/{ACHIEVEMENTS.length}</b><span>logros</span></div></div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Actividad · 20 semanas</div>
          <Heatmap xpByDay={s.xpByDay} goal={s.settings.dailyGoal} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row between">
          <div className="card-title" style={{ margin: 0 }}>XP por día · últimos 30 días</div>
          <button className="btn xs ghost" onClick={() => setTable((t) => !t)}>{table ? 'Ver gráfica' : 'Ver tabla'}</button>
        </div>
        {table ? (
          <table className="conj mt">
            <tbody>
              {days.slice().reverse().filter((d) => d.xp > 0).map((d) => <tr key={d.day}><td>{d.day}</td><td className="form">{d.xp} XP</td></tr>)}
              {!days.some((d) => d.xp > 0) && <tr><td colSpan={2} className="muted">No activity yet.</td></tr>}
            </tbody>
          </table>
        ) : (
          <XpChart data={days} />
        )}
      </div>

      <div className="grid auto-sm" style={{ marginBottom: 16 }}>
        {stats.map(([e, v, l]) => (
          <div key={l} className="card tight"><div style={{ fontSize: 20 }}>{e}</div><div className="stat"><b>{v}</b><span>{l}</span></div></div>
        ))}
      </div>

      <div className="grid cols-2">
        <div className="card">
          <div className="card-title">🎓 Curso</div>
          <div className="stack sm">
            {UNITS.map((u) => {
              const ls = lessonsFor(u);
              const done = ls.filter((l, i) => s.lessons[l.review ? `${u.id}:final` : `${u.id}:${i}`]).length;
              return (
                <a key={u.id} href="#/learn" className="row nowrap" style={{ color: 'inherit' }}>
                  <span style={{ width: 24 }}>{u.emoji}</span>
                  <span className="small" style={{ width: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.es}</span>
                  <div className="bar thin grow"><i style={{ width: `${(done / ls.length) * 100}%` }} /></div>
                  <span className="tiny muted" style={{ width: 34, textAlign: 'right' }}>{done}/{ls.length}</span>
                </a>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div className="card-title">🏆 Logros</div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            {ACHIEVEMENTS.map((a) => {
              const at = s.achievements[a.id];
              return (
                <div key={a.id} className="card tight flat center" style={{ opacity: at ? 1 : 0.42, filter: at ? undefined : 'grayscale(1)', padding: 12 }} title={a.desc}>
                  <div style={{ fontSize: 30 }}>{a.emoji}</div>
                  <div className="small" style={{ fontWeight: 650, lineHeight: 1.2, marginTop: 4 }}>{a.title}</div>
                  <div className="tiny muted" style={{ lineHeight: 1.25 }}>{a.desc}</div>
                  {at && <div className="tiny" style={{ color: 'var(--ok)', marginTop: 4 }}>✓ {new Date(at).toLocaleDateString('es-MX')}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
