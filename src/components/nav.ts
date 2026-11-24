import type { LucideIcon } from 'lucide-react';
import {
  House, Languages, MessagesSquare, ScanText, GraduationCap, Layers, Brain, Wand2, BookOpen, Ear,
  Bot, Gamepad2, Library, Quote, Flame, PartyPopper, Wrench, Search, Trophy, Settings,
} from 'lucide-react';

export interface NavItem {
  path: string;
  es: string;
  en: string;
  icon: LucideIcon;
  desc: string;
  emoji: string;
  color: string;
}

export interface NavGroup {
  es: string;
  en: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    es: 'Principal', en: 'Main', items: [
      { path: '/', es: 'Inicio', en: 'Home', icon: House, desc: 'Your daily dashboard', emoji: '🏠', color: '#ff2e93' },
      { path: '/translate', es: 'Traductor', en: 'Translator', icon: Languages, desc: 'Text & voice, Mexican Spanish', emoji: '🔁', color: '#ffa630' },
      { path: '/conversation', es: 'Conversación', en: 'Conversation', icon: MessagesSquare, desc: 'Face-to-face live interpreter', emoji: '🗣️', color: '#19d3a2' },
      { path: '/scan', es: 'Escáner', en: 'Scan & translate', icon: ScanText, desc: 'Photo of a menu or sign → English', emoji: '📸', color: '#4cc9f0' },
    ],
  },
  {
    es: 'Aprender', en: 'Learn', items: [
      { path: '/learn', es: 'Curso', en: 'Course', icon: GraduationCap, desc: '16 units of Mexican Spanish', emoji: '🎓', color: '#ff2e93' },
      { path: '/review', es: 'Repaso', en: 'Flashcards', icon: Layers, desc: 'Spaced-repetition deck', emoji: '🗃️', color: '#a06cf0' },
      { path: '/verbs', es: 'Verbos', en: 'Conjugator', icon: Brain, desc: '150+ verbs, every tense', emoji: '⚡', color: '#ffa630' },
      { path: '/lab', es: 'Laboratorio', en: 'Sentence lab', icon: Wand2, desc: 'Build sentences that conjugate themselves', emoji: '🧪', color: '#19d3a2' },
      { path: '/grammar', es: 'Gramática', en: 'Grammar', icon: BookOpen, desc: 'Ser vs estar, por vs para…', emoji: '📐', color: '#4cc9f0' },
      { path: '/speak', es: 'Pronunciación', en: 'Pronunciation', icon: Ear, desc: 'Speak & get scored', emoji: '🎙️', color: '#ff4d6d' },
    ],
  },
  {
    es: 'Practicar', en: 'Practice', items: [
      { path: '/tutor', es: 'Profe IA', en: 'AI tutor & role-play', icon: Bot, desc: 'Chat with Profe Lupita', emoji: '🤖', color: '#a06cf0' },
      { path: '/games', es: 'Juegos', en: 'Games', icon: Gamepad2, desc: 'Lotería, Memorama & more', emoji: '🎴', color: '#ffa630' },
      { path: '/stories', es: 'Historias', en: 'Stories', icon: Library, desc: 'Read-along stories', emoji: '📖', color: '#19d3a2' },
    ],
  },
  {
    es: 'Referencia', en: 'Reference', items: [
      { path: '/phrases', es: 'Frases', en: 'Phrasebook', icon: Quote, desc: '120+ travel phrases', emoji: '💬', color: '#4cc9f0' },
      { path: '/slang', es: 'Mexicanismos', en: 'Slang', icon: Flame, desc: 'With a spice meter 🌶️', emoji: '🌶️', color: '#ff2e93' },
      { path: '/culture', es: 'Cultura', en: 'Culture', icon: PartyPopper, desc: 'Fiestas, food & customs', emoji: '💀', color: '#ffa630' },
      { path: '/tools', es: 'Herramientas', en: 'Tools', icon: Wrench, desc: 'Numbers, pesos, time, tips', emoji: '🧮', color: '#19d3a2' },
      { path: '/dictionary', es: 'Diccionario', en: 'Dictionary', icon: Search, desc: 'Search every word', emoji: '🔎', color: '#a06cf0' },
    ],
  },
  {
    es: 'Tú', en: 'You', items: [
      { path: '/progress', es: 'Progreso', en: 'Progress', icon: Trophy, desc: 'Stats, streaks & badges', emoji: '🏆', color: '#ffd166' },
      { path: '/settings', es: 'Ajustes', en: 'Settings', icon: Settings, desc: 'Voice, AI, theme, data', emoji: '⚙️', color: '#918aa8' },
    ],
  },
];

export const ALL_NAV: NavItem[] = NAV.flatMap((g) => g.items);

export function activeNav(path: string): NavItem | undefined {
  const base = '/' + (path.split('/')[1] ?? '');
  const alias: Record<string, string> = { '/lesson': '/learn', '/story': '/stories', '/scenario': '/tutor' };
  const p = alias[base] ?? base;
  return ALL_NAV.find((n) => n.path === p);
}
