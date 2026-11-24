import { useEffect, useState } from 'react';
import { ArrowLeftRight, Clock, Coins, Hash, Loader2, Percent, Ruler, CalendarDays, RefreshCw } from 'lucide-react';
import { numberToSpanish, pesosToSpanish, formatMx } from '../lib/numbers';
import { timeToSpanish, dateToSpanish, nowInZone } from '../lib/time';
import { PageHead, SpeakButton } from '../components/ui';

function NumberTool() {
  const [n, setN] = useState('1534');
  const [pesos, setPesos] = useState(false);
  const num = Number(n.replace(/,/g, ''));
  let out = '';
  let err = '';
  try {
    if (n.trim() && Number.isFinite(num) && num >= 0) out = pesos ? pesosToSpanish(num) : numberToSpanish(num);
    else if (n.trim()) err = 'Enter a positive number';
  } catch (e) {
    err = e instanceof Error ? e.message : 'Invalid';
  }
  return (
    <div className="card">
      <div className="card-title"><Hash /> Números en palabras</div>
      <div className="row nowrap">
        <input className="input big" inputMode="decimal" value={n} onChange={(e) => setN(e.target.value)} aria-label="Number" />
        <button className={`btn ${pesos ? 'on' : ''}`} onClick={() => setPesos((p) => !p)}>{pesos ? '💰 Pesos' : '🔢 Número'}</button>
      </div>
      <div className="row nowrap mt" style={{ alignItems: 'flex-start' }}>
        <div className="es grow" style={{ fontSize: 22, minHeight: 34 }}>{err ? <span className="muted small">{err}</span> : out}</div>
        {out && <SpeakButton text={out} />}
      </div>
      <div className="row mt">
        {[21, 100, 101, 555, 1000, 21000, 1_000_000, 2026].map((x) => <button key={x} className="chip" onClick={() => setN(String(x))}>{formatMx(x)}</button>)}
      </div>
    </div>
  );
}

const RATE_KEY = 'spenish-rate';
async function fetchRate(): Promise<{ rate: number; date: string; source: string }> {
  try {
    const r = await fetch('https://api.frankfurter.app/latest?from=USD&to=MXN');
    if (r.ok) {
      const j = (await r.json()) as { rates?: { MXN?: number }; date?: string };
      if (j.rates?.MXN) return { rate: j.rates.MXN, date: j.date ?? '', source: 'Frankfurter (ECB)' };
    }
  } catch {
    /* try next */
  }
  const r2 = await fetch('https://open.er-api.com/v6/latest/USD');
  const j2 = (await r2.json()) as { result?: string; rates?: { MXN?: number }; time_last_update_utc?: string };
  if (j2.result === 'success' && j2.rates?.MXN) return { rate: j2.rates.MXN, date: (j2.time_last_update_utc ?? '').slice(5, 16), source: 'ExchangeRate-API' };
  throw new Error('No rate available');
}

function PesoTool() {
  const [rate, setRate] = useState<number>(() => {
    try {
      const c = JSON.parse(localStorage.getItem(RATE_KEY) ?? 'null') as { rate: number } | null;
      return c?.rate ?? 18;
    } catch {
      return 18;
    }
  });
  const [meta, setMeta] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [usd, setUsd] = useState('20');
  const [dir, setDir] = useState<'usd' | 'mxn'>('usd');
  const load = async () => {
    setLoading(true);
    try {
      const r = await fetchRate();
      setRate(r.rate);
      setMeta(`${r.source} · ${r.date}`);
      try {
        localStorage.setItem(RATE_KEY, JSON.stringify({ rate: r.rate, ts: Date.now() }));
      } catch {
        /* storage unavailable */
      }
    } catch {
      setMeta('Offline — using saved/approximate rate (editable)');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const amount = Number(usd.replace(/,/g, '')) || 0;
  const result = dir === 'usd' ? amount * rate : amount / rate;
  const mxn = dir === 'usd' ? result : amount;
  return (
    <div className="card">
      <div className="card-title"><Coins /> Pesos ↔ dólares</div>
      <div className="row nowrap">
        <input className="input big" inputMode="decimal" value={usd} onChange={(e) => setUsd(e.target.value)} aria-label="Amount" />
        <button className="btn" onClick={() => setDir((d) => (d === 'usd' ? 'mxn' : 'usd'))} aria-label="Swap currencies"><ArrowLeftRight /> {dir === 'usd' ? 'USD → MXN' : 'MXN → USD'}</button>
      </div>
      <div className="h2 mt">{dir === 'usd' ? `$${formatMx(result, 2)} MXN` : `$${result.toFixed(2)} USD`}</div>
      <div className="row nowrap mt">
        <div className="es small soft grow">{pesosToSpanish(mxn)}</div>
        <SpeakButton text={`Son ${pesosToSpanish(mxn)}`} size="xs" />
      </div>
      <div className="row mt small muted">
        <span>1 USD =</span>
        <input className="input" style={{ width: 100, padding: '6px 10px' }} inputMode="decimal" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} aria-label="Exchange rate" />
        <span>MXN</span>
        <button className="btn icon xs ghost" onClick={load} aria-label="Refresh rate">{loading ? <Loader2 className="spin" /> : <RefreshCw />}</button>
      </div>
      {meta && <div className="tiny muted">{meta}</div>}
    </div>
  );
}

function TipTool() {
  const [bill, setBill] = useState('850');
  const [pct, setPct] = useState(15);
  const [people, setPeople] = useState(2);
  const b = Number(bill.replace(/,/g, '')) || 0;
  const tip = (b * pct) / 100;
  const total = b + tip;
  const each = total / Math.max(1, people);
  return (
    <div className="card">
      <div className="card-title"><Percent /> Propina y cuenta</div>
      <input className="input big" inputMode="decimal" value={bill} onChange={(e) => setBill(e.target.value)} aria-label="Bill amount (MXN)" placeholder="$" />
      <div className="row mt">
        {[10, 12, 15, 20].map((p) => <button key={p} className={`chip ${pct === p ? 'on' : ''}`} onClick={() => setPct(p)}>{p}%</button>)}
        <span className="small muted" style={{ marginLeft: 'auto' }}>Personas</span>
        <button className="btn icon xs" onClick={() => setPeople((n) => Math.max(1, n - 1))} aria-label="Fewer people">−</button>
        <b>{people}</b>
        <button className="btn icon xs" onClick={() => setPeople((n) => Math.min(30, n + 1))} aria-label="More people">+</button>
      </div>
      <div className="grid cols-3 mt" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }}>
        <div className="stat"><b>${formatMx(tip, 2)}</b><span>propina</span></div>
        <div className="stat"><b>${formatMx(total, 2)}</b><span>total</span></div>
        <div className="stat"><b>${formatMx(each, 2)}</b><span>c/u (each)</span></div>
      </div>
      <div className="callout mx mt small">🇲🇽 10–15% is standard in restaurants. Say <b className="es">“¿Me trae la cuenta, por favor?”</b> — the check won’t come until you ask!</div>
    </div>
  );
}

function TimeTool() {
  const [t, setT] = useState('15:45');
  const [h, m] = t.split(':').map(Number);
  const valid = Number.isFinite(h) && Number.isFinite(m);
  const r = valid ? timeToSpanish(h, m) : null;
  const [d, setD] = useState(() => new Date().toISOString().slice(0, 10));
  const [y, mo, da] = d.split('-').map(Number);
  const dateText = y ? dateToSpanish(new Date(y, mo - 1, da)) : '';
  return (
    <div className="card">
      <div className="card-title"><Clock /> La hora y la fecha</div>
      <div className="row nowrap">
        <input className="input big" type="time" value={t} onChange={(e) => setT(e.target.value)} aria-label="Time" style={{ colorScheme: 'dark' }} />
        <button className="btn" onClick={() => { const n = nowInZone(); setT(`${String(n.h).padStart(2, '0')}:${String(n.m).padStart(2, '0')}`); }}>Ahora (CDMX)</button>
      </div>
      {r && (
        <div className="stack sm mt">
          <div className="row nowrap"><div className="es grow" style={{ fontSize: 21 }}>{r.main}</div><SpeakButton text={r.main} /></div>
          {r.alt && <div className="row nowrap"><div className="es soft grow">🇲🇽 También: {r.alt}</div><SpeakButton text={r.alt} size="xs" /></div>}
        </div>
      )}
      <hr className="divider" />
      <div className="row nowrap"><CalendarDays style={{ width: 18, color: 'var(--muted)' }} /><input className="input" type="date" value={d} onChange={(e) => setD(e.target.value)} aria-label="Date" style={{ colorScheme: 'dark' }} /></div>
      {dateText && <div className="row nowrap mt"><div className="es grow" style={{ fontSize: 18 }}>{dateText.charAt(0).toUpperCase() + dateText.slice(1)}</div><SpeakButton text={dateText} size="xs" /></div>}
    </div>
  );
}

/** "21 kilómetros", "un kilo", "menos cinco grados" — correct agreement & apocope. */
function qty(n: number, one: string, many: string): string {
  const r = Math.round(n);
  const neg = r < 0 ? 'menos ' : '';
  const a = Math.abs(r);
  return `${neg}${a === 1 ? 'un' : numberToSpanish(a, true)} ${a === 1 ? one : many}`;
}

const CONVERSIONS = [
  { id: 'temp', es: 'Temperatura', a: '°C', b: '°F', toB: (x: number) => (x * 9) / 5 + 32, toA: (x: number) => ((x - 32) * 5) / 9, def: 30, say: (c: number) => `Hace ${qty(c, 'grado', 'grados')}` },
  { id: 'dist', es: 'Distancia', a: 'km', b: 'mi', toB: (x: number) => x * 0.621371, toA: (x: number) => x / 0.621371, def: 10, say: (k: number) => qty(k, 'kilómetro', 'kilómetros') },
  { id: 'peso', es: 'Peso', a: 'kg', b: 'lb', toB: (x: number) => x * 2.20462, toA: (x: number) => x / 2.20462, def: 1, say: (k: number) => qty(k, 'kilo', 'kilos') },
  { id: 'vol', es: 'Volumen', a: 'L', b: 'gal', toB: (x: number) => x * 0.264172, toA: (x: number) => x / 0.264172, def: 40, say: (l: number) => qty(l, 'litro', 'litros') },
];

function UnitTool() {
  const [id, setId] = useState('temp');
  const c = CONVERSIONS.find((x) => x.id === id)!;
  const [val, setVal] = useState(String(c.def));
  const [rev, setRev] = useState(false);
  const x = Number(val) || 0;
  const res = rev ? c.toA(x) : c.toB(x);
  const metric = rev ? res : x;
  return (
    <div className="card">
      <div className="card-title"><Ruler /> Sistema métrico</div>
      <div className="seg">
        {CONVERSIONS.map((k) => <button key={k.id} className={id === k.id ? 'on' : ''} onClick={() => { setId(k.id); setVal(String(k.def)); setRev(false); }}>{k.es}</button>)}
      </div>
      <div className="row nowrap mt">
        <input className="input big" inputMode="decimal" value={val} onChange={(e) => setVal(e.target.value)} aria-label="Value" />
        <button className="btn" onClick={() => setRev((r) => !r)}><ArrowLeftRight /> {rev ? `${c.b} → ${c.a}` : `${c.a} → ${c.b}`}</button>
      </div>
      <div className="h2 mt">{res.toFixed(1)} {rev ? c.a : c.b}</div>
      <div className="row nowrap mt"><div className="es small soft grow">{c.say(metric)}</div><SpeakButton text={c.say(metric)} size="xs" /></div>
      <div className="tiny muted mt">Mexico uses the metric system — gas is sold by the liter and the weather is in °C.</div>
    </div>
  );
}

export default function Tools() {
  return (
    <div className="page">
      <PageHead eyebrow="Herramientas · Tools" es="Tu navaja suiza" en="Your travel Swiss-army knife" desc="Numbers in words, live peso exchange, tips, Mexican-style time telling, dates and metric conversions — all with audio." />
      <div className="grid cols-2">
        <NumberTool />
        <PesoTool />
        <TipTool />
        <TimeTool />
        <UnitTool />
      </div>
    </div>
  );
}
