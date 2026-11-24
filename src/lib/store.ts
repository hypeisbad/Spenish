import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { dayKey, daysBetween, uid } from './text';
import { newCard, review, type Grade, type SrsCard } from './srs';
import { emit } from './events';
import { DEFAULT_MODEL } from './ai';

export interface Settings {
  name: string;
  voiceURI: string | null;
  rate: number;
  autoSpeak: boolean;
  sfx: boolean;
  haptics: boolean;
  immersion: boolean;
  showVosotros: boolean;
  dailyGoal: number;
  aiKey: string;
  aiModel: string;
  engine: 'auto' | 'ai' | 'online' | 'offline';
  register: 'neutral' | 'casual' | 'slang' | 'formal';
  spiceMax: 1 | 2 | 3;
  accent: 'rosa' | 'cempasuchil' | 'jade' | 'talavera';
  reduceMotion: boolean;
}

export interface Stats {
  lessons: number;
  perfectLessons: number;
  correct: number;
  wrong: number;
  translations: number;
  gamesPlayed: number;
  loteriaWins: number;
  speakingAttempts: number;
  speakingGreat: number;
  storiesRead: number;
  aiMessages: number;
  reviews: number;
  scenarios: number;
  sprintBest: number;
  rainBest: number;
  numbersBest: number;
  memoramaBest: number;
  conversations: number;
}

export interface HistoryItem {
  id: string;
  src: string;
  out: string;
  from: 'es' | 'en';
  provider: string;
  ts: number;
}

export interface LessonRecord {
  stars: number;
  best: number;
  times: number;
}

export interface State {
  settings: Settings;
  xp: number;
  xpByDay: Record<string, number>;
  streak: { count: number; last: string | null; best: number };
  lessons: Record<string, LessonRecord>;
  srs: Record<string, SrsCard>;
  history: HistoryItem[];
  favorites: Record<string, { es: string; en: string; ts: number }>;
  achievements: Record<string, number>;
  visited: Record<string, number>;
  stats: Stats;
  onboarded: boolean;

  setSettings: (s: Partial<Settings>) => void;
  addXp: (n: number) => void;
  completeLesson: (key: string, accuracy: number) => void;
  bump: (k: keyof Stats, n?: number) => void;
  setBest: (k: 'sprintBest' | 'rainBest' | 'numbersBest' | 'memoramaBest', v: number, lowerIsBetter?: boolean) => boolean;
  addCard: (es: string, en: string, source: string, note?: string) => boolean;
  hasCard: (es: string) => boolean;
  reviewCard: (id: string, g: Grade) => void;
  removeCard: (id: string) => void;
  addHistory: (h: Omit<HistoryItem, 'id' | 'ts'>) => void;
  clearHistory: () => void;
  toggleFavorite: (es: string, en: string) => boolean;
  visit: (route: string) => void;
  setOnboarded: () => void;
  importData: (json: string) => void;
  exportData: () => string;
  resetAll: () => void;
}

export const DEFAULT_SETTINGS: Settings = {
  name: '',
  voiceURI: null,
  rate: 0.95,
  autoSpeak: true,
  sfx: true,
  haptics: true,
  immersion: false,
  showVosotros: false,
  dailyGoal: 50,
  aiKey: '',
  aiModel: DEFAULT_MODEL,
  engine: 'auto',
  register: 'neutral',
  spiceMax: 2,
  accent: 'rosa',
  reduceMotion: false,
};

const EMPTY_STATS: Stats = {
  lessons: 0, perfectLessons: 0, correct: 0, wrong: 0, translations: 0, gamesPlayed: 0, loteriaWins: 0,
  speakingAttempts: 0, speakingGreat: 0, storiesRead: 0, aiMessages: 0, reviews: 0, scenarios: 0,
  sprintBest: 0, rainBest: 0, numbersBest: 0, memoramaBest: 0, conversations: 0,
};

/* ---------- Levels ---------- */

export const LEVEL_NAMES = [
  'Turista', 'Viajero', 'Aprendiz', 'Platicador', 'Cuate', 'Compa', 'Carnal',
  'Chilango honorario', 'Maestro', 'Leyenda', 'Leyenda dorada', 'Patrimonio nacional',
];

export function levelInfo(xp: number): { level: number; name: string; into: number; need: number; pct: number } {
  let level = 1;
  let need = 100;
  let rest = xp;
  while (rest >= need) {
    rest -= need;
    level++;
    need = Math.round(need * 1.3);
  }
  const name = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
  return { level, name, into: rest, need, pct: rest / need };
}

/* ---------- Achievements ---------- */

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  test: (s: State) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-lesson', title: 'Primer paso', desc: 'Complete your first lesson', emoji: '👣', test: (s) => s.stats.lessons >= 1 },
  { id: 'ten-lessons', title: 'Estudiante dedicado', desc: 'Complete 10 lessons', emoji: '📚', test: (s) => s.stats.lessons >= 10 },
  { id: 'perfect', title: 'Perfeccionista', desc: 'Finish a lesson with 100% accuracy', emoji: '💎', test: (s) => s.stats.perfectLessons >= 1 },
  { id: 'streak-3', title: 'En racha', desc: 'Reach a 3-day streak', emoji: '🔥', test: (s) => s.streak.best >= 3 },
  { id: 'streak-7', title: 'Imparable', desc: 'Reach a 7-day streak', emoji: '🌋', test: (s) => s.streak.best >= 7 },
  { id: 'streak-30', title: 'Leyenda de la constancia', desc: 'Reach a 30-day streak', emoji: '🏆', test: (s) => s.streak.best >= 30 },
  { id: 'xp-500', title: 'Medio millar', desc: 'Earn 500 XP', emoji: '⚡', test: (s) => s.xp >= 500 },
  { id: 'xp-2000', title: 'Dos mil', desc: 'Earn 2,000 XP', emoji: '🚀', test: (s) => s.xp >= 2000 },
  { id: 'translator', title: 'Traductor', desc: 'Translate 25 times', emoji: '🔁', test: (s) => s.stats.translations >= 25 },
  { id: 'collector', title: 'Coleccionista', desc: 'Save 25 cards to your deck', emoji: '🗃️', test: (s) => Object.keys(s.srs).length >= 25 },
  { id: 'reviewer', title: 'Memoria de elefante', desc: 'Do 100 flashcard reviews', emoji: '🐘', test: (s) => s.stats.reviews >= 100 },
  { id: 'loteria', title: '¡Lotería!', desc: 'Win a game of Lotería', emoji: '🎴', test: (s) => s.stats.loteriaWins >= 1 },
  { id: 'gamer', title: 'Jugador', desc: 'Play 10 games', emoji: '🎮', test: (s) => s.stats.gamesPlayed >= 10 },
  { id: 'speaker', title: 'Lengua de oro', desc: 'Score 90%+ on 10 pronunciation attempts', emoji: '🎙️', test: (s) => s.stats.speakingGreat >= 10 },
  { id: 'reader', title: 'Cuentacuentos', desc: 'Finish 3 stories', emoji: '📖', test: (s) => s.stats.storiesRead >= 3 },
  { id: 'tutor', title: 'Platicador', desc: 'Send 10 messages to Profe Lupita', emoji: '💬', test: (s) => s.stats.aiMessages >= 10 },
  { id: 'roleplay', title: 'Actor de telenovela', desc: 'Finish 3 role-play scenarios', emoji: '🎭', test: (s) => s.stats.scenarios >= 3 },
  { id: 'explorer', title: 'Explorador', desc: 'Visit 15 different sections', emoji: '🧭', test: (s) => Object.keys(s.visited).length >= 15 },
  { id: 'unit', title: 'Unidad completa', desc: 'Finish every lesson of a unit', emoji: '🎓', test: (s) => Object.keys(s.lessons).some((k) => k.endsWith(':final')) },
  { id: 'night-owl', title: 'Búho nocturno', desc: 'Study after 11 pm', emoji: '🦉', test: () => new Date().getHours() >= 23 },
  { id: 'early-bird', title: 'Madrugador', desc: 'Study before 7 am', emoji: '🐓', test: () => new Date().getHours() < 7 },
];

function checkAchievements(get: () => State, set: (p: Partial<State>) => void) {
  const s = get();
  const unlocked = { ...s.achievements };
  let changed = false;
  for (const a of ACHIEVEMENTS) {
    if (unlocked[a.id]) continue;
    // time-based badges only count when actually studying (called from addXp)
    try {
      if (a.test(s)) {
        unlocked[a.id] = Date.now();
        changed = true;
        emit({ type: 'achievement', id: a.id, title: a.title, emoji: a.emoji });
      }
    } catch {
      /* ignore */
    }
  }
  if (changed) set({ achievements: unlocked });
}

/* ---------- Store ---------- */

const TIME_BADGES = new Set(['night-owl', 'early-bird']);

export const useStore = create<State>()(
  persist(
    (set, get) => {
      const check = () => {
        // evaluate everything except time-of-day badges (those are evaluated in addXp)
        const s = get();
        const unlocked = { ...s.achievements };
        let changed = false;
        for (const a of ACHIEVEMENTS) {
          if (unlocked[a.id] || TIME_BADGES.has(a.id)) continue;
          if (a.test(s)) {
            unlocked[a.id] = Date.now();
            changed = true;
            emit({ type: 'achievement', id: a.id, title: a.title, emoji: a.emoji });
          }
        }
        if (changed) set({ achievements: unlocked });
      };

      return {
        settings: DEFAULT_SETTINGS,
        xp: 0,
        xpByDay: {},
        streak: { count: 0, last: null, best: 0 },
        lessons: {},
        srs: {},
        history: [],
        favorites: {},
        achievements: {},
        visited: {},
        stats: EMPTY_STATS,
        onboarded: false,

        setSettings: (p) => set({ settings: { ...get().settings, ...p } }),

        addXp: (n) => {
          if (n <= 0) return;
          const s = get();
          const today = dayKey();
          let { count, last, best } = s.streak;
          if (last !== today) {
            count = last && daysBetween(last, today) === 1 ? count + 1 : 1;
            last = today;
            best = Math.max(best, count);
          }
          const before = levelInfo(s.xp).level;
          const xp = s.xp + n;
          set({
            xp,
            xpByDay: { ...s.xpByDay, [today]: (s.xpByDay[today] ?? 0) + n },
            streak: { count, last, best },
          });
          const after = levelInfo(xp);
          if (after.level > before) emit({ type: 'levelup', level: after.level, name: after.name });
          checkAchievements(get, set);
        },

        completeLesson: (key, accuracy) => {
          const s = get();
          const stars = accuracy >= 0.95 ? 3 : accuracy >= 0.8 ? 2 : 1;
          const prev = s.lessons[key];
          set({
            lessons: {
              ...s.lessons,
              [key]: { stars: Math.max(stars, prev?.stars ?? 0), best: Math.max(accuracy, prev?.best ?? 0), times: (prev?.times ?? 0) + 1 },
            },
            stats: { ...s.stats, lessons: s.stats.lessons + 1, perfectLessons: s.stats.perfectLessons + (accuracy >= 1 ? 1 : 0) },
          });
          check();
        },

        bump: (k, n = 1) => {
          set({ stats: { ...get().stats, [k]: (get().stats[k] ?? 0) + n } });
          check();
        },

        setBest: (k, v, lowerIsBetter = false) => {
          const cur = get().stats[k];
          const better = lowerIsBetter ? cur === 0 || v < cur : v > cur;
          if (better) set({ stats: { ...get().stats, [k]: v } });
          return better;
        },

        addCard: (es, en, source, note) => {
          const id = 'c:' + es.toLowerCase().trim();
          if (get().srs[id]) return false;
          set({ srs: { ...get().srs, [id]: newCard(id, es, en, source, note) } });
          check();
          return true;
        },

        hasCard: (es) => !!get().srs['c:' + es.toLowerCase().trim()],

        reviewCard: (id, g) => {
          const c = get().srs[id];
          if (!c) return;
          set({ srs: { ...get().srs, [id]: review(c, g) }, stats: { ...get().stats, reviews: get().stats.reviews + 1 } });
          check();
        },

        removeCard: (id) => {
          const next = { ...get().srs };
          delete next[id];
          set({ srs: next });
        },

        addHistory: (h) => {
          const list = get().history.filter((x) => !(x.src === h.src && x.from === h.from));
          set({
            history: [{ ...h, id: uid(), ts: Date.now() }, ...list].slice(0, 200),
            stats: { ...get().stats, translations: get().stats.translations + 1 },
          });
          check();
        },

        clearHistory: () => set({ history: [] }),

        toggleFavorite: (es, en) => {
          const f = { ...get().favorites };
          const k = es.toLowerCase().trim();
          let added: boolean;
          if (f[k]) {
            delete f[k];
            added = false;
          } else {
            f[k] = { es, en, ts: Date.now() };
            added = true;
          }
          set({ favorites: f });
          return added;
        },

        visit: (route) => {
          const base = route.split('/').slice(0, 2).join('/') || '/';
          if (get().visited[base]) return;
          set({ visited: { ...get().visited, [base]: Date.now() } });
          check();
        },

        setOnboarded: () => set({ onboarded: true }),

        exportData: () => {
          const { settings, xp, xpByDay, streak, lessons, srs, history, favorites, achievements, visited, stats, onboarded } = get();
          return JSON.stringify(
            { app: 'spenish', version: 1, exported: new Date().toISOString(), data: { settings: { ...settings, aiKey: '' }, xp, xpByDay, streak, lessons, srs, history, favorites, achievements, visited, stats, onboarded } },
            null,
            2,
          );
        },

        importData: (json) => {
          const parsed = JSON.parse(json);
          if (parsed?.app !== 'spenish' || !parsed.data) throw new Error('This file is not a Spenish backup.');
          const d = parsed.data;
          set({
            settings: { ...DEFAULT_SETTINGS, ...d.settings, aiKey: get().settings.aiKey },
            xp: Number(d.xp) || 0,
            xpByDay: d.xpByDay ?? {},
            streak: d.streak ?? { count: 0, last: null, best: 0 },
            lessons: d.lessons ?? {},
            srs: d.srs ?? {},
            history: d.history ?? [],
            favorites: d.favorites ?? {},
            achievements: d.achievements ?? {},
            visited: d.visited ?? {},
            stats: { ...EMPTY_STATS, ...d.stats },
            onboarded: true,
          });
        },

        resetAll: () =>
          set({
            settings: { ...DEFAULT_SETTINGS, aiKey: get().settings.aiKey },
            xp: 0, xpByDay: {}, streak: { count: 0, last: null, best: 0 }, lessons: {}, srs: {}, history: [],
            favorites: {}, achievements: {}, visited: {}, stats: EMPTY_STATS, onboarded: false,
          }),
      };
    },
    {
      name: 'spenish-v1',
      version: 1,
      storage: createJSONStorage(() => {
        try {
          const k = '__spenish_test__';
          localStorage.setItem(k, '1');
          localStorage.removeItem(k);
          return localStorage;
        } catch {
          const mem = new Map<string, string>();
          return {
            getItem: (k: string) => mem.get(k) ?? null,
            setItem: (k: string, v: string) => void mem.set(k, v),
            removeItem: (k: string) => void mem.delete(k),
          };
        }
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        return {
          ...current,
          ...p,
          settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) },
          stats: { ...EMPTY_STATS, ...(p.stats ?? {}) },
        };
      },
    },
  ),
);

/** Effective streak (0 if the last study day was before yesterday). */
export function liveStreak(s: State['streak']): number {
  if (!s.last) return 0;
  const gap = daysBetween(s.last, dayKey());
  return gap <= 1 ? s.count : 0;
}

export function todayXp(s: State): number {
  return s.xpByDay[dayKey()] ?? 0;
}
