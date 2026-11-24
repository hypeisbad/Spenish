import { Suspense, lazy } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Route } from '../lib/router';
import { navigate } from '../lib/router';
import { useStore } from '../lib/store';
import { PageHead, Empty } from '../components/ui';

const GAMES = [
  { id: 'loteria', es: 'Lotería', en: 'Mexican bingo with a singing caller', emoji: '🎴', color: '#ffa630', C: lazy(() => import('./games/Loteria')), stat: 'loteriaWins' as const, statLabel: 'victorias' },
  { id: 'memorama', es: 'Memorama', en: 'Memory pairs: Spanish ↔ English', emoji: '🧠', color: '#a06cf0', C: lazy(() => import('./games/Memorama')), stat: 'memoramaBest' as const, statLabel: 'mov. récord' },
  { id: 'lluvia', es: 'Lluvia de palabras', en: 'Type before the words hit the ground', emoji: '☔', color: '#4cc9f0', C: lazy(() => import('./games/WordRain')), stat: 'rainBest' as const, statLabel: 'récord' },
  { id: 'numeros', es: '¿Cuánto cuesta?', en: 'Prices, numbers & time by ear', emoji: '💰', color: '#19d3a2', C: lazy(() => import('./games/NumberGame')), stat: 'numbersBest' as const, statLabel: '/10 récord' },
  { id: 'relampago', es: 'Conjugación relámpago', en: '60-second verb sprint', emoji: '⚡', color: '#ff2e93', C: lazy(() => import('./games/Sprint')), stat: 'sprintBest' as const, statLabel: 'récord' },
];

export default function Games({ route }: { route: Route }) {
  const stats = useStore((s) => s.stats);
  const id = route.parts[1];
  if (id) {
    const g = GAMES.find((x) => x.id === id);
    if (!g) return <div className="page narrow"><Empty emoji="🎲" title="Game not found" /></div>;
    const C = g.C;
    return (
      <div className="page">
        <div className="row between" style={{ marginBottom: 16 }}>
          <div className="row">
            <button className="btn icon sm ghost" onClick={() => navigate('/games')} aria-label="Back to games"><ArrowLeft /></button>
            <span style={{ fontSize: 30 }}>{g.emoji}</span>
            <div>
              <div className="h2">{g.es}</div>
              <div className="tiny muted">{g.en}</div>
            </div>
          </div>
        </div>
        <Suspense fallback={<div className="shimmer" style={{ height: 380 }} />}>
          <C />
        </Suspense>
      </div>
    );
  }
  return (
    <div className="page">
      <PageHead eyebrow="Juegos · Games" es="Aprende jugando" en="Learn by playing" desc="Every game uses real Mexican Spanish audio and earns XP. Beat your records!" />
      <div className="grid auto">
        {GAMES.map((g) => (
          <a key={g.id} className="tile" href={`#/games/${g.id}`} style={{ ['--tile' as string]: g.color, minHeight: 170 }}>
            <div className="tile-icon" style={{ fontSize: 26 }}>{g.emoji}</div>
            <div>
              <div className="tile-title">{g.es}</div>
              <div className="tile-desc">{g.en}</div>
            </div>
            {stats[g.stat] > 0 && <span className="chip" style={{ alignSelf: 'flex-start' }}>🏆 {stats[g.stat]} {g.statLabel}</span>}
            <ArrowRight className="tile-arrow" />
          </a>
        ))}
      </div>
    </div>
  );
}
