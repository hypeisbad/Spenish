import { useState } from 'react';
import { Search, Star } from 'lucide-react';
import { PHRASEBOOK } from '../data/phrases';
import { normalize, stripDiacritics } from '../lib/text';
import { useStore } from '../lib/store';
import { PageHead, SaveButton, SpeakButton, Empty } from '../components/ui';

export default function Phrasebook() {
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const favorites = useStore((s) => s.favorites);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const nq = stripDiacritics(normalize(q));
  const cats = cat === 'all' ? PHRASEBOOK : PHRASEBOOK.filter((c) => c.id === cat);
  const total = PHRASEBOOK.reduce((n, c) => n + c.phrases.length, 0);

  return (
    <div className="page">
      <PageHead eyebrow="Frases · Phrasebook" es="Frases para sobrevivir (y disfrutar)" en="Phrases to survive (and thrive)" desc={`${total} practical phrases as they’re really said in Mexico — tap 🔊 to hear them, 🐢 to slow them down.`} />
      <div className="row" style={{ marginBottom: 14 }}>
        <div className="row nowrap grow" style={{ position: 'relative', minWidth: 220 }}>
          <Search style={{ position: 'absolute', left: 14, width: 18, color: 'var(--muted)' }} />
          <input className="input" style={{ paddingLeft: 42 }} placeholder="Buscar frase… (bathroom, cuenta, help…)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search phrases" />
        </div>
      </div>
      <div className="row" style={{ marginBottom: 18 }}>
        <button className={`chip ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>✨ Todas</button>
        {PHRASEBOOK.map((c) => <button key={c.id} className={`chip ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(c.id)}>{c.emoji} {c.es}</button>)}
      </div>
      <div className="stack lg">
        {cats.map((c) => {
          const list = c.phrases.filter((p) => !nq || stripDiacritics(normalize(`${p.es} ${p.en} ${p.note ?? ''}`)).includes(nq));
          if (!list.length) return null;
          return (
            <section key={c.id} className="card">
              <div className="card-title" style={{ fontSize: 18 }}>{c.emoji} {c.es} <span className="muted small" style={{ fontWeight: 500 }}>· {c.en}</span></div>
              <div className="list">
                {list.map((p) => {
                  const fav = !!favorites[p.es.toLowerCase().trim()];
                  return (
                    <div key={p.id} className="list-item">
                      <div className="grow">
                        <div className="es" style={{ fontWeight: 600, fontSize: 17 }}>{p.es}</div>
                        <div className="small muted">{p.en}{p.note ? <span className="soft"> · 💡 {p.note}</span> : null}</div>
                      </div>
                      <div className="row nowrap" style={{ gap: 4 }}>
                        <SpeakButton text={p.es.replace(/…/g, '')} size="xs" />
                        <SpeakButton text={p.es.replace(/…/g, '')} size="xs" slow />
                        <button className={`btn icon xs ${fav ? 'on' : ''}`} aria-label="Favorite" onClick={() => toggleFavorite(p.es, p.en)}><Star fill={fav ? 'currentColor' : 'none'} /></button>
                        <SaveButton es={p.es} en={p.en} source="Frases" note={p.note} size="xs" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
        {nq && cats.every((c) => !c.phrases.some((p) => stripDiacritics(normalize(`${p.es} ${p.en} ${p.note ?? ''}`)).includes(nq))) && (
          <Empty emoji="🔎" title="No phrases found">
            <a className="btn primary" href={`#/translate?q=${encodeURIComponent(q)}`}>Traducir “{q}”</a>
          </Empty>
        )}
      </div>
    </div>
  );
}
