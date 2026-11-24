import { useState } from 'react';
import { Search } from 'lucide-react';
import { SLANG, SPAIN_VS_MEXICO } from '../data/slang';
import { normalize, stripDiacritics } from '../lib/text';
import { useStore } from '../lib/store';
import { PageHead, SaveButton, SpeakButton, Spice } from '../components/ui';

export default function Slang() {
  const spiceMax = useStore((s) => s.settings.spiceMax);
  const setSettings = useStore((s) => s.setSettings);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'slang' | 'spain'>('slang');
  const nq = stripDiacritics(normalize(q));
  const list = SLANG.filter((s) => s.spice <= spiceMax && (!nq || stripDiacritics(normalize(`${s.term} ${s.meaning} ${s.ex} ${s.region ?? ''}`)).includes(nq)));

  return (
    <div className="page">
      <PageHead
        eyebrow="Mexicanismos · Slang"
        es="Habla como local"
        en="Talk like a local"
        desc="Real Mexican slang with a spice meter: 🌶️ family-friendly · 🌶️🌶️ among friends · 🌶️🌶️🌶️ vulgar (recognize it, use it carefully)."
      />
      <div className="row between" style={{ marginBottom: 14 }}>
        <div className="seg">
          <button className={tab === 'slang' ? 'on' : ''} onClick={() => setTab('slang')}>🌶️ Slang ({SLANG.length})</button>
          <button className={tab === 'spain' ? 'on' : ''} onClick={() => setTab('spain')}>🇲🇽 vs 🇪🇸 ({SPAIN_VS_MEXICO.length})</button>
        </div>
        {tab === 'slang' && (
          <div className="seg" aria-label="Maximum spice level">
            {([1, 2, 3] as const).map((n) => (
              <button key={n} className={spiceMax === n ? 'on' : ''} onClick={() => setSettings({ spiceMax: n })}>{'🌶️'.repeat(n)}</button>
            ))}
          </div>
        )}
      </div>
      {tab === 'slang' ? (
        <>
          <div className="row nowrap" style={{ position: 'relative', marginBottom: 16 }}>
            <Search style={{ position: 'absolute', left: 14, width: 18, color: 'var(--muted)' }} />
            <input className="input" style={{ paddingLeft: 42 }} placeholder="Buscar… (neta, money, dude…)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search slang" />
          </div>
          <div className="grid auto">
            {list.map((s) => (
              <div key={s.id} className="card" style={{ borderColor: s.spice === 3 ? 'rgba(255,85,119,.35)' : undefined }}>
                <div className="row between nowrap" style={{ alignItems: 'flex-start' }}>
                  <div className="es" style={{ fontSize: 22, fontWeight: 650 }}>{s.term}</div>
                  <Spice level={s.spice} />
                </div>
                <div className="soft" style={{ marginTop: 4 }}>{s.meaning}</div>
                <div className="small mt" style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 10 }}>
                  <div className="es">{s.ex}</div>
                  <div className="muted">{s.exEn}</div>
                </div>
                {s.note && <div className="tiny muted mt">💡 {s.note}</div>}
                <div className="row mt between">
                  <div className="row" style={{ gap: 4 }}>
                    <SpeakButton text={s.ex} size="xs" />
                    <SaveButton es={s.term} en={s.meaning} source="Slang" note={s.note} size="xs" />
                  </div>
                  {s.region && <span className="chip">📍 {s.region}</span>}
                </div>
              </div>
            ))}
          </div>
          {spiceMax < 3 && <div className="tiny muted center mt">{SLANG.filter((s) => s.spice > spiceMax).length} spicier entries hidden — raise the spice level to see them.</div>}
        </>
      ) : (
        <div className="card">
          <div className="list">
            <div className="list-item tiny muted" style={{ fontWeight: 700, letterSpacing: '.08em' }}>
              <span style={{ width: '28%' }}>ENGLISH</span><span style={{ width: '36%' }}>🇲🇽 MÉXICO</span><span>🇪🇸 ESPAÑA</span>
            </div>
            {SPAIN_VS_MEXICO.map((r) => (
              <div key={r.en} className="list-item" style={{ alignItems: 'flex-start' }}>
                <span className="small" style={{ width: '28%' }}>{r.en}</span>
                <span style={{ width: '36%' }} className="row nowrap"><b className="es" style={{ color: 'var(--ok)' }}>{r.mx}</b> <SpeakButton text={r.mx.split(' / ')[0]} size="xs" /></span>
                <span className="grow">
                  <span className="es soft">{r.es}</span>
                  {r.note && <div className="tiny muted">{r.note}</div>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
