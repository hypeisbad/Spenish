/** Spaced repetition (SM-2 variant with Again/Hard/Good/Easy). */

export interface SrsCard {
  id: string;
  es: string;
  en: string;
  note?: string;
  source: string; // 'course' | 'translator' | 'phrasebook' | 'slang' | 'story' | ...
  ease: number;
  interval: number; // days
  reps: number;
  lapses: number;
  due: number; // epoch ms
  added: number;
}

export type Grade = 0 | 1 | 2 | 3; // again, hard, good, easy

const DAY = 86_400_000;
const MIN = 60_000;

export function newCard(id: string, es: string, en: string, source: string, note?: string, now = Date.now()): SrsCard {
  return { id, es, en, note, source, ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now, added: now };
}

export function review(card: SrsCard, grade: Grade, now = Date.now()): SrsCard {
  const c = { ...card };
  if (grade === 0) {
    c.reps = 0;
    c.lapses += 1;
    c.interval = 0;
    c.ease = Math.max(1.3, c.ease - 0.2);
    c.due = now + MIN; // see it again in a minute
    return c;
  }
  if (grade === 1) {
    c.interval = c.reps === 0 ? 1 : Math.max(1, Math.round(c.interval * 1.2));
    c.ease = Math.max(1.3, c.ease - 0.15);
  } else if (grade === 2) {
    c.interval = c.reps === 0 ? 1 : c.reps === 1 ? 3 : Math.round(c.interval * c.ease);
  } else {
    c.interval = c.reps === 0 ? 4 : Math.round(c.interval * c.ease * 1.3);
    c.ease = Math.min(3.2, c.ease + 0.15);
  }
  c.interval = Math.max(1, c.interval);
  c.reps += 1;
  c.due = now + c.interval * DAY;
  return c;
}

/** Human preview of the next interval for a grade, e.g. "1 min", "3 d", "2 mo". */
export function previewInterval(card: SrsCard, grade: Grade): string {
  const next = review(card, grade, 0);
  const ms = next.due;
  if (ms < DAY) return `${Math.round(ms / MIN)} min`;
  const d = Math.round(ms / DAY);
  if (d < 30) return `${d} d`;
  if (d < 365) return `${Math.round(d / 30)} mo`;
  return `${(d / 365).toFixed(1)} y`;
}

export function dueCards(cards: SrsCard[], now = Date.now()): SrsCard[] {
  return cards.filter((c) => c.due <= now).sort((a, b) => a.due - b.due);
}

export function masteryLabel(card: SrsCard): { label: string; level: number } {
  if (card.reps === 0) return { label: 'Nueva', level: 0 };
  if (card.interval < 3) return { label: 'Aprendiendo', level: 1 };
  if (card.interval < 21) return { label: 'Repasando', level: 2 };
  return { label: 'Dominada', level: 3 };
}
