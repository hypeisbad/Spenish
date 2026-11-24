import { useState } from 'react';
import { Search, Layers } from 'lucide-react';
import type { Route } from '../lib/router';
import { searchLexicon, analyzeVerb } from '../data/lexicon';
import { PageHead, SaveButton, SpeakButton, Empty } from '../components/ui';

export default function Dictionary({ route }: { route: Route }) {
  const [q, setQ] = useState(route.query.get('q') ?? '');
  const results = q.trim() ? searchLexicon(q, 60) : [];
  const verbs = q.trim() ? analyzeVerb(q.trim()) : [];
  return (
    <div className="page narrow">
      <PageHead eyebrow="Diccionario · Dictionary" es="Busca cualquier palabra" en="Look up any word" desc="Searches every word, phrase, slang term and story in the app — in both directions. Type a conjugated verb (fuimos, tengo, hizo) to see what it is." />
      <div className="row nowrap" style={{ position: 'relative', marginBottom: 16 }}>
        <Search style={{ position: 'absolute', left: 16, width: 20, color: 'var(--muted)' }} />
        <input className="input big" style={{ paddingLeft: 48 }} autoFocus placeholder="taco, beautiful, fuimos, güey…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the dictionary" />
      </div>
      {verbs.length > 0 && (
        <div className="stack sm" style={{ marginBottom: 14 }}>
          {verbs.slice(0, 4).map((v, i) => (
            <a key={i} href={`#/verbs/${encodeURIComponent(v.inf)}`} className="callout mx" style={{ color: 'inherit' }}>
              <Layers style={{ width: 18, flex: 'none' }} />
              <div><b className="es">{q.trim()}</b> → <b className="es">{v.inf}</b> ({v.en}) · {v.tenseLabel}{v.persons.length ? ` · ${v.persons.join(', ')}` : ''}</div>
            </a>
          ))}
        </div>
      )}
      {q.trim() && !results.length && !verbs.length && (
        <Empty emoji="🔎" title="No está en el diccionario">
          <a className="btn primary" href={`#/translate?q=${encodeURIComponent(q)}`}>Traducir “{q}” en línea</a>
        </Empty>
      )}
      {results.length > 0 && (
        <div className="card">
          <div className="list">
            {results.map((r, i) => (
              <div key={i} className="list-item">
                <div className="grow">
                  <div className="es" style={{ fontWeight: 600, fontSize: 17 }}>{r.es}</div>
                  <div className="small muted">{r.en}</div>
                </div>
                <span className="chip hide-sm">{r.source}</span>
                <SpeakButton text={r.es.replace(/…/g, '')} size="xs" />
                <SaveButton es={r.es} en={r.en.split(' / ')[0]} source={`Diccionario · ${r.source}`} size="xs" />
              </div>
            ))}
          </div>
        </div>
      )}
      {!q.trim() && (
        <div className="row">
          {['ahorita', 'chido', 'fuimos', 'beautiful', 'cuenta', 'tengo', 'popote', 'hungry'].map((w) => <button key={w} className="chip" onClick={() => setQ(w)}>{w}</button>)}
        </div>
      )}
    </div>
  );
}
