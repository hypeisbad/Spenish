import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Dumbbell, Search, X, Zap } from 'lucide-react';
import type { Route } from '../lib/router';
import { navigate } from '../lib/router';
import { VERBS, findVerb } from '../data/verbs';
import {
  conjugate, PERSONS, TENSE_INFO, SIMPLE_TENSES, COMPOUND_TENSES, type TenseKey, type VerbDef,
} from '../lib/conjugate';
import { checkAnswer, normalize, stripDiacritics } from '../lib/text';
import { useStore } from '../lib/store';
import { haptic, sfx } from '../lib/sound';
import { AccentBar, PageHead, SpeakButton, say, Empty } from '../components/ui';

const FILTERS: { id: string; es: string; test: (v: VerbDef) => boolean }[] = [
  { id: 'all', es: 'Todos', test: () => true },
  { id: 'top', es: '⭐ Esenciales', test: (v) => !!v.tags?.includes('top') },
  { id: 'irregular', es: 'Irregulares', test: (v) => !!v.tags?.includes('irregular') || !!v.tags?.includes('zco') },
  { id: 'stem', es: 'Cambio de raíz', test: (v) => !!v.stem },
  { id: 'reflexive', es: 'Reflexivos', test: (v) => v.inf.endsWith('se') },
  { id: 'mexico', es: '🇲🇽 Mexicanos', test: (v) => !!v.tags?.includes('mexico') || !!v.mx },
];

/** Regular-pattern forms for the same infinitive, to highlight irregularities. */
function regularOf(v: VerbDef): VerbDef {
  return { inf: v.inf, en: v.en };
}

function personsFor(showVos: boolean): number[] {
  return showVos ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 5];
}

const PERSON_LABEL_MX = ['yo', 'tú', 'él / ella / usted', 'nosotros', 'vosotros 🇪🇸', 'ellos / ellas / ustedes'];

function Drill({ verbs, tenses, onClose }: { verbs: VerbDef[]; tenses: TenseKey[]; onClose: () => void }) {
  const settings = useStore((s) => s.settings);
  const addXp = useStore((s) => s.addXp);
  const persons = personsFor(settings.showVosotros);
  const pick = () => {
    const v = verbs[Math.floor(Math.random() * verbs.length)];
    const t = tenses[Math.floor(Math.random() * tenses.length)];
    const p = persons[Math.floor(Math.random() * persons.length)];
    return { v, t, p, answer: conjugate(v).tenses[t][p] };
  };
  const [q, setQ] = useState(pick);
  const [val, setVal] = useState('');
  const [res, setRes] = useState<null | { ok: boolean; note?: string }>(null);
  const [score, setScore] = useState({ ok: 0, total: 0, streak: 0 });
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, [q]);

  const submit = () => {
    if (res) {
      setQ(pick());
      setVal('');
      setRes(null);
      return;
    }
    if (!val.trim()) return;
    const r = checkAnswer(val, [q.answer]);
    const ok = r.verdict === 'correct' || r.verdict === 'accent';
    setRes({ ok, note: r.verdict === 'accent' ? 'Watch the accent marks!' : undefined });
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1, streak: ok ? s.streak + 1 : 0 }));
    if (ok) {
      addXp(3);
      if (settings.sfx) sfx.correct();
      haptic(10);
    } else if (settings.sfx) sfx.wrong();
    void say(q.answer);
  };

  return (
    <div className="card glow">
      <div className="row between">
        <div className="card-title" style={{ margin: 0 }}><Dumbbell /> Práctica de conjugación</div>
        <div className="row">
          <span className="chip ok"><Check /> {score.ok}/{score.total}</span>
          {score.streak >= 3 && <span className="chip accent">🔥 {score.streak}</span>}
          <button className="btn icon sm ghost" onClick={onClose} aria-label="Close drill"><X /></button>
        </div>
      </div>
      <div className="center stack mt">
        <div className="soft">{TENSE_INFO[q.t].es} <span className="muted small">· {TENSE_INFO[q.t].en}</span></div>
        <div style={{ fontSize: 'clamp(22px, 4.5vw, 30px)' }}>
          <span className="muted">{PERSON_LABEL_MX[q.p]}</span> + <span className="es" style={{ color: 'var(--accent)' }}>{q.v.inf}</span>
        </div>
        <div className="tiny muted">{q.v.en}</div>
      </div>
      <form className="stack mt" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <input ref={ref} className="input big" style={{ textAlign: 'center' }} value={val} onChange={(e) => setVal(e.target.value)} disabled={!!res} placeholder="…" aria-label="Conjugated form" autoCapitalize="off" autoComplete="off" spellCheck={false} />
        <AccentBar target={ref} />
        {res && (
          <div className={`feedback ${res.ok ? 'ok' : 'bad'}`}>
            <div className="f-icon">{res.ok ? <Check /> : <X />}</div>
            <div className="grow">
              <b>{res.ok ? '¡Correcto!' : 'Correcto:'}</b> <span className="es">{q.answer}</span>
              {res.note && <div className="small">{res.note}</div>}
            </div>
            <SpeakButton text={q.answer} />
          </div>
        )}
        <button className="btn primary lg" type="submit">{res ? 'Siguiente' : 'Comprobar'}</button>
      </form>
    </div>
  );
}

function VerbDetail({ v }: { v: VerbDef }) {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const c = useMemo(() => conjugate(v), [v]);
  const reg = useMemo(() => {
    try {
      return conjugate(regularOf(v));
    } catch {
      return null;
    }
  }, [v]);
  const [drill, setDrill] = useState(false);
  const persons = personsFor(settings.showVosotros);
  const isIrr = (t: TenseKey, p: number) => !!reg && reg.tenses[t][p] !== c.tenses[t][p];
  const irrCount = reg ? (Object.keys(c.tenses) as TenseKey[]).reduce((n, t) => n + persons.filter((p) => isIrr(t, p)).length, 0) : 0;

  const Table = ({ t }: { t: TenseKey }) => (
    <div className="card tight">
      <div className="row between" style={{ marginBottom: 6 }}>
        <div>
          <div style={{ fontWeight: 650 }}>{TENSE_INFO[t].es}</div>
          <div className="tiny muted">{TENSE_INFO[t].en} — {TENSE_INFO[t].hint}</div>
        </div>
      </div>
      <table className="conj">
        <tbody>
          {persons.map((p) => (
            <tr key={p}>
              <td>{PERSON_LABEL_MX[p]}</td>
              <td className={`form es ${isIrr(t, p) ? 'irr' : ''}`}>
                <span role="button" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => say(c.tenses[t][p])} onKeyDown={(e) => e.key === 'Enter' && say(c.tenses[t][p])}>
                  {c.tenses[t][p]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="page">
      <button className="btn sm ghost" onClick={() => navigate('/verbs')}><ArrowLeft /> Verbos</button>
      <div className="card hero mt">
        <div className="row between">
          <div>
            <div className="row">
              <span className="es" style={{ fontSize: 'clamp(36px, 7vw, 54px)' }}>{v.inf}</span>
              <SpeakButton text={v.inf} />
            </div>
            <div className="h3 soft">{v.en}</div>
            <div className="row mt">
              {c.reflexive && <span className="chip">Reflexivo</span>}
              {v.stem && <span className="chip warn">Cambio {v.stem.replace('>', ' → ')}</span>}
              {irrCount > 0 ? <span className="chip accent">{irrCount} formas irregulares</span> : <span className="chip ok">Regular</span>}
              <span className="chip">Gerundio: <b className="es">&nbsp;{c.gerund}</b></span>
              <span className="chip">Participio: <b className="es">&nbsp;{c.participle}</b></span>
            </div>
          </div>
          <div className="stack sm" style={{ alignItems: 'flex-end' }}>
            <button className="btn primary" onClick={() => setDrill(true)}><Dumbbell /> Practicar</button>
            <label className="row small soft" style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={settings.showVosotros} onChange={(e) => setSettings({ showVosotros: e.target.checked })} /> Mostrar vosotros (Spain)
            </label>
          </div>
        </div>
        {v.mx && <div className="callout mx mt">🇲🇽 {v.mx}</div>}
        {irrCount > 0 && <div className="tiny muted mt"><span className="irr">Orange</span> = differs from the regular pattern. Tap any form to hear it.</div>}
      </div>
      {drill && <div className="mt"><Drill verbs={[v]} tenses={[...SIMPLE_TENSES, 'perfecto']} onClose={() => setDrill(false)} /></div>}
      <div className="nav-group" style={{ paddingLeft: 2, marginTop: 18 }}>Modo indicativo y subjuntivo</div>
      <div className="grid auto">{SIMPLE_TENSES.map((t) => <Table key={t} t={t} />)}</div>
      <div className="nav-group" style={{ paddingLeft: 2, marginTop: 18 }}>Imperativo</div>
      <div className="card tight">
        <table className="conj">
          <thead><tr><td></td><td className="tiny muted">Afirmativo</td><td className="tiny muted">Negativo</td></tr></thead>
          <tbody>
            {persons.filter((p) => p !== 0).map((p) => (
              <tr key={p}>
                <td>{['', 'tú', 'usted', 'nosotros', 'vosotros 🇪🇸', 'ustedes'][p]}</td>
                <td className="form es">{c.imperative.affirmative[p] ? <span role="button" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => say(c.imperative.affirmative[p]!)}>{c.imperative.affirmative[p]}</span> : '—'}</td>
                <td className="form es">{c.imperative.negative[p] ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="nav-group" style={{ paddingLeft: 2, marginTop: 18 }}>Tiempos compuestos y progresivo</div>
      <div className="grid auto">{COMPOUND_TENSES.map((t) => <Table key={t} t={t} />)}</div>
    </div>
  );
}

export default function Verbs({ route }: { route: Route }) {
  const inf = route.parts[1];
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [drill, setDrill] = useState(false);
  const [drillTenses, setDrillTenses] = useState<TenseKey[]>(['presente', 'preterito']);

  if (inf) {
    const v = findVerb(inf);
    if (!v) return <div className="page narrow"><Empty emoji="🤷" title={`No tengo “${inf}” todavía`}><a href="#/verbs" className="btn primary">Ver todos los verbos</a></Empty></div>;
    return <VerbDetail v={v} />;
  }

  const f = FILTERS.find((x) => x.id === filter)!;
  const nq = stripDiacritics(normalize(q));
  const list = VERBS.filter((v) => f.test(v) && (!nq || stripDiacritics(v.inf).includes(nq) || stripDiacritics(normalize(v.en)).includes(nq)));
  const pool = list.length ? list : VERBS;

  return (
    <div className="page">
      <PageHead
        eyebrow="Conjugador · Conjugator"
        es="Todos los verbos, todos los tiempos"
        en="Every verb, every tense"
        desc={`${VERBS.length} verbs with 13 tenses + imperative, irregular forms highlighted, Mexican usage notes, and vosotros hidden by default (Mexico uses ustedes).`}
        right={<button className="btn primary" onClick={() => setDrill((d) => !d)}><Zap /> Modo práctica</button>}
      />
      {drill && (
        <div className="stack" style={{ marginBottom: 16 }}>
          <div className="row">
            <span className="small muted">Tiempos:</span>
            {[...SIMPLE_TENSES, 'perfecto' as TenseKey].map((t) => (
              <button key={t} className={`chip ${drillTenses.includes(t) ? 'on' : ''}`} onClick={() => setDrillTenses((d) => (d.includes(t) ? (d.length > 1 ? d.filter((x) => x !== t) : d) : [...d, t]))}>
                {TENSE_INFO[t].es.split(' (')[0]}
              </button>
            ))}
          </div>
          <Drill key={drillTenses.join() + filter} verbs={pool} tenses={drillTenses} onClose={() => setDrill(false)} />
        </div>
      )}
      <div className="row" style={{ marginBottom: 14 }}>
        <div className="row nowrap grow" style={{ position: 'relative', minWidth: 220 }}>
          <Search style={{ position: 'absolute', left: 14, width: 18, color: 'var(--muted)' }} />
          <input className="input" style={{ paddingLeft: 42 }} placeholder="Busca un verbo (comer, to eat…)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search verbs"
            onKeyDown={(e) => { if (e.key === 'Enter' && list[0]) navigate(`/verbs/${encodeURIComponent(list[0].inf)}`); }} />
        </div>
        <div className="seg">
          {FILTERS.map((x) => <button key={x.id} className={filter === x.id ? 'on' : ''} onClick={() => setFilter(x.id)}>{x.es}</button>)}
        </div>
      </div>
      <div className="grid auto-sm">
        {list.map((v) => (
          <a key={v.inf} href={`#/verbs/${encodeURIComponent(v.inf)}`} className="card tight" style={{ color: 'inherit' }}>
            <div className="es" style={{ fontSize: 20 }}>{v.inf}</div>
            <div className="tiny muted" style={{ lineHeight: 1.3 }}>{v.en}</div>
            <div className="row" style={{ marginTop: 8, gap: 4 }}>
              {v.tags?.includes('irregular') && <span className="chip warn" style={{ padding: '2px 8px', fontSize: 11 }}>irr.</span>}
              {v.stem && <span className="chip" style={{ padding: '2px 8px', fontSize: 11 }}>{v.stem}</span>}
              {(v.tags?.includes('mexico')) && <span className="chip ok" style={{ padding: '2px 8px', fontSize: 11 }}>🇲🇽</span>}
            </div>
          </a>
        ))}
      </div>
      {!list.length && <Empty emoji="🔎" title="No verbs match that search" />}
      <div className="tiny muted center mt">Persons: {PERSONS.join(' · ')}</div>
    </div>
  );
}
