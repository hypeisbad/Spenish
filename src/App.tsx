import { Component, Suspense, lazy, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { Flame, Search, Zap, House, Languages, GraduationCap, Gamepad2, LayoutGrid } from 'lucide-react';
import { useRoute, navigate, type Route } from './lib/router';
import { liveStreak, useStore, levelInfo } from './lib/store';
import { loadVoices } from './lib/speech';
import { setSoundEnabled } from './lib/sound';
import { emit } from './lib/events';
import { dueCards } from './lib/srs';
import { NAV, activeNav } from './components/nav';
import { Toaster, Confetti, LevelUp } from './components/Effects';
import { CommandPalette } from './components/CommandPalette';
import { Modal, CloseButton } from './components/ui';
import { Onboarding } from './views/Onboarding';

type View = ComponentType<{ route: Route }>;
const v = (f: () => Promise<{ default: View }>) => lazy(f);

const Home = v(() => import('./views/Home'));
const Translate = v(() => import('./views/Translate'));
const Conversation = v(() => import('./views/Conversation'));
const Scan = v(() => import('./views/Scan'));
const Learn = v(() => import('./views/Learn'));
const Lesson = v(() => import('./views/Lesson'));
const Review = v(() => import('./views/Review'));
const Verbs = v(() => import('./views/Verbs'));
const Lab = v(() => import('./views/SentenceLab'));
const Grammar = v(() => import('./views/Grammar'));
const Speak = v(() => import('./views/Pronunciation'));
const Tutor = v(() => import('./views/Tutor'));
const Scenario = v(() => import('./views/Scenario'));
const Games = v(() => import('./views/Games'));
const Stories = v(() => import('./views/Stories'));
const Phrases = v(() => import('./views/Phrasebook'));
const Slang = v(() => import('./views/Slang'));
const Culture = v(() => import('./views/Culture'));
const Tools = v(() => import('./views/Tools'));
const Dictionary = v(() => import('./views/Dictionary'));
const Progress = v(() => import('./views/Progress'));
const SettingsView = v(() => import('./views/Settings'));
const NotFound = v(() => import('./views/NotFound'));

const ROUTES: Record<string, React.LazyExoticComponent<View>> = {
  '': Home, translate: Translate, conversation: Conversation, scan: Scan, learn: Learn, lesson: Lesson, review: Review,
  verbs: Verbs, lab: Lab, grammar: Grammar, speak: Speak, tutor: Tutor, scenario: Scenario, games: Games, stories: Stories,
  phrases: Phrases, slang: Slang, culture: Culture, tools: Tools, dictionary: Dictionary, progress: Progress, settings: SettingsView,
};

function Loading() {
  return (
    <div className="page" aria-busy="true">
      <div className="shimmer" style={{ height: 46, width: '40%', marginBottom: 18 }} />
      <div className="shimmer" style={{ height: 180, marginBottom: 14 }} />
      <div className="shimmer" style={{ height: 120 }} />
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error('Spenish view error:', error);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="page narrow">
        <div className="card center stack" style={{ padding: 32 }}>
          <div className="emoji-xl" style={{ margin: '0 auto' }}>🌵</div>
          <div className="h2">¡Híjole! Algo salió mal.</div>
          <p className="soft">Something went wrong on this screen. Your progress is safe.</p>
          <div className="tiny muted">{this.state.error.message}</div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn" onClick={() => this.setState({ error: null })}>Reintentar</button>
            <a className="btn primary" href="#/" onClick={() => this.setState({ error: null })}>Ir al inicio</a>
          </div>
        </div>
      </div>
    );
  }
}

function DueBadge() {
  const srs = useStore((s) => s.srs);
  const n = dueCards(Object.values(srs)).length;
  return n ? <span className="count">{n > 99 ? '99+' : n}</span> : null;
}

function Sidebar({ path }: { path: string }) {
  const active = activeNav(path);
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => liveStreak(s.streak));
  const lv = levelInfo(xp);
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <a className="brand" href="#/">
        <div className="brand-mark">🌮</div>
        <div>
          <div className="brand-name">Sp<em>e</em>nish</div>
          <div className="brand-sub">Español de México</div>
        </div>
      </a>
      <button className="btn sm block" style={{ justifyContent: 'flex-start', color: 'var(--muted)' }} onClick={() => emit({ type: 'palette' })}>
        <Search /> Buscar o traducir… <span className="kbd" style={{ marginLeft: 'auto' }}>⌘K</span>
      </button>
      {NAV.map((g) => (
        <nav key={g.es} aria-label={g.en}>
          <div className="nav-group">{g.es}</div>
          {g.items.map((n) => {
            const Icon = n.icon;
            return (
              <a key={n.path} href={'#' + n.path} className={`nav-item ${active?.path === n.path ? 'active' : ''}`} aria-current={active?.path === n.path ? 'page' : undefined}>
                <Icon /> {n.es}
                {n.path === '/review' && <DueBadge />}
              </a>
            );
          })}
        </nav>
      ))}
      <div className="sidebar-foot">
        <a className="card tight flat" href="#/progress" style={{ display: 'block', color: 'inherit' }}>
          <div className="row between">
            <span className="chip accent"><Flame /> {streak} {streak === 1 ? 'día' : 'días'}</span>
            <span className="chip"><Zap /> {xp} XP</span>
          </div>
          <div className="tiny muted mt" style={{ marginTop: 10 }}>Nivel {lv.level} · {lv.name}</div>
          <div className="bar thin" style={{ marginTop: 6 }}><i style={{ width: `${lv.pct * 100}%` }} /></div>
        </a>
      </div>
    </aside>
  );
}

function Topbar() {
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => liveStreak(s.streak));
  return (
    <header className="topbar">
      <a className="brand" href="#/">
        <div className="brand-mark">🌮</div>
        <div className="brand-name">Sp<em>e</em>nish</div>
      </a>
      <div className="row nowrap" style={{ marginLeft: 'auto', gap: 6 }}>
        <span className="chip accent"><Flame /> {streak}</span>
        <span className="chip"><Zap /> {xp}</span>
        <button className="btn icon sm ghost" aria-label="Open search" onClick={() => emit({ type: "palette" })}><Search /></button>
      </div>
    </header>
  );
}

function BottomBar({ path, onMore }: { path: string; onMore: () => void }) {
  const a = activeNav(path)?.path ?? '';
  const main = ['/', '/translate', '/learn', '/games'];
  const items = [
    { p: '/', l: 'Inicio', I: House },
    { p: '/translate', l: 'Traducir', I: Languages },
    { p: '/learn', l: 'Aprender', I: GraduationCap },
    { p: '/games', l: 'Juegos', I: Gamepad2 },
  ];
  return (
    <nav className="bottombar" aria-label="Quick navigation">
      {items.map(({ p, l, I }) => (
        <a key={p} href={'#' + p} className={a === p ? 'active' : ''} aria-current={a === p ? 'page' : undefined}>
          <I /> {l}
        </a>
      ))}
      <button className={!main.includes(a) ? 'active' : ''} onClick={onMore} aria-label="More sections">
        <LayoutGrid /> Más
      </button>
    </nav>
  );
}

function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} label="All sections">
      <div className="row between">
        <div className="h2">Todo Spenish</div>
        <CloseButton onClick={onClose} />
      </div>
      {NAV.map((g) => (
        <div key={g.es}>
          <div className="nav-group" style={{ paddingLeft: 2 }}>{g.es} · {g.en}</div>
          <div className="grid auto-sm" style={{ gap: 8 }}>
            {g.items.map((n) => (
              <a key={n.path} href={'#' + n.path} onClick={onClose} className="card tight flat" style={{ color: 'inherit', display: 'flex', gap: 10, alignItems: 'center', padding: 12 }}>
                <span style={{ fontSize: 20 }}>{n.emoji}</span>
                <span className="small" style={{ fontWeight: 600, lineHeight: 1.2 }}>{n.es}<span className="bi-en">{n.en}</span></span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </Modal>
  );
}

export default function App() {
  const route = useRoute();
  const settings = useStore((s) => s.settings);
  const onboarded = useStore((s) => s.onboarded);
  const visit = useStore((s) => s.visit);
  const [more, setMore] = useState(false);

  useEffect(() => {
    void loadVoices();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.accent = settings.accent;
    root.classList.toggle('immersion', settings.immersion);
    root.classList.toggle('reduce-motion', settings.reduceMotion);
    setSoundEnabled(settings.sfx);
  }, [settings.accent, settings.immersion, settings.reduceMotion, settings.sfx]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    visit(route.path);
    const nav = activeNav(route.path);
    document.title = nav && nav.path !== '/' ? `${nav.es} · Spenish` : 'Spenish — Español de México';
  }, [route.path, visit]);

  const View = ROUTES[route.parts[0] ?? ''] ?? NotFound;

  return (
    <>
      <div className="ambient" aria-hidden>
        <div className="orb a" />
        <div className="orb b" />
        <div className="orb c" />
        <div className="grain" />
      </div>
      <div className="app">
        <Sidebar path={route.path} />
        <Topbar />
        <main className="main" id="main">
          <ErrorBoundary key={route.path}>
            <Suspense fallback={<Loading />}>
              <View key={route.path} route={route} />
            </Suspense>
          </ErrorBoundary>
        </main>
        <BottomBar path={route.path} onMore={() => setMore(true)} />
      </div>
      <MoreSheet open={more} onClose={() => setMore(false)} />
      <CommandPalette />
      <Toaster />
      <Confetti />
      <LevelUp />
      {!onboarded && <Onboarding />}
    </>
  );
}

export { navigate };
