/** Lesson exercise generator (pure — unit tested). */
import { ALL_VOCAB, lessonsFor, type Unit, type VocabItem } from '../data/units';
import { normalize, shuffle, sample } from './text';

export type Ex =
  | { kind: 'mc'; dir: 'es-en' | 'en-es'; item: VocabItem; options: string[]; answer: number }
  | { kind: 'listen'; item: VocabItem; options: string[]; answer: number }
  | { kind: 'type'; item: VocabItem; prompt: string; accepted: string[] }
  | { kind: 'match'; pairs: { es: string; en: string }[] }
  | { kind: 'build'; es: string; en: string; tiles: string[]; answer: string[] }
  | { kind: 'speak'; es: string; en: string };

export const firstEn = (en: string) => en.split(' / ')[0];
const enSet = (en: string) => en.split(' / ').map((x) => normalize(x).replace(/^(the|a|an|to) /, ''));

function overlaps(a: VocabItem, b: VocabItem): boolean {
  if (normalize(a.es) === normalize(b.es)) return true;
  const A = enSet(a.en);
  return enSet(b.en).some((x) => A.includes(x));
}

export function distractors(item: VocabItem, pool: VocabItem[], n: number, rng: () => number): VocabItem[] {
  const picked: VocabItem[] = [];
  const ok = (c: VocabItem) => c.id !== item.id && !overlaps(c, item) && !picked.some((p) => overlaps(p, c));
  for (const c of shuffle(pool, rng)) {
    if (picked.length >= n) break;
    if (ok(c)) picked.push(c);
  }
  if (picked.length < n) {
    for (const c of shuffle(ALL_VOCAB, rng)) {
      if (picked.length >= n) break;
      if (ok(c)) picked.push(c);
    }
  }
  return picked;
}

function mc(item: VocabItem, dir: 'es-en' | 'en-es', pool: VocabItem[], rng: () => number): Ex {
  const ds = distractors(item, pool, 3, rng);
  const all = shuffle([item, ...ds], rng);
  const label = (v: VocabItem) => (dir === 'es-en' ? firstEn(v.en) : v.es);
  return { kind: 'mc', dir, item, options: all.map(label), answer: all.indexOf(item) };
}

function listenEx(item: VocabItem, pool: VocabItem[], rng: () => number): Ex {
  const ds = distractors(item, pool, 3, rng);
  const all = shuffle([item, ...ds], rng);
  return { kind: 'listen', item, options: all.map((v) => v.es), answer: all.indexOf(item) };
}

function typeEx(item: VocabItem): Ex {
  const prompt = firstEn(item.en);
  const p = normalize(prompt).replace(/^(the|a|an|to) /, '');
  // accept any course word that shares this English gloss (e.g. "cool" → padre / chido)
  const accepted = Array.from(new Set([item.es, ...ALL_VOCAB.filter((v) => enSet(v.en).includes(p)).map((v) => v.es)]));
  return { kind: 'type', item, prompt, accepted };
}

export function tilesOf(sentence: string): string[] {
  return sentence
    .split(/\s+/)
    .map((w) => w.replace(/[¿?¡!.,;:"“”«»…]/g, ''))
    .filter(Boolean);
}

function buildEx(s: { es: string; en: string }, others: { es: string }[], rng: () => number): Ex {
  const answer = tilesOf(s.es);
  const lower = new Set(answer.map((w) => w.toLowerCase()));
  const extra = shuffle(
    Array.from(new Set(others.flatMap((o) => tilesOf(o.es)).filter((w) => !lower.has(w.toLowerCase())))),
    rng,
  ).slice(0, Math.min(3, Math.max(2, Math.round(answer.length / 3))));
  return { kind: 'build', es: s.es, en: s.en, tiles: shuffle([...answer, ...extra], rng), answer };
}

/** Sample n items with no overlapping Spanish or English glosses (so matching is unambiguous). */
export function sampleDistinct(pool: VocabItem[], n: number, rng: () => number): VocabItem[] {
  const out: VocabItem[] = [];
  for (const c of shuffle(pool, rng)) {
    if (out.length >= n) break;
    if (!out.some((o) => overlaps(o, c))) out.push(c);
  }
  return out;
}

export function checkBuild(picked: string[], answer: string[]): boolean {
  return normalize(picked.join(' ')) === normalize(answer.join(' '));
}

export function buildLesson(unit: Unit, which: number | 'final', rng: () => number = Math.random, canSpeak = true): Ex[] {
  const lessons = lessonsFor(unit);
  const lesson = which === 'final' ? lessons[lessons.length - 1] : lessons[which];
  if (!lesson) return [];
  const pool = unit.items;
  const out: Ex[] = [];

  if (which !== 'final') {
    for (const item of lesson.items) {
      out.push(mc(item, 'es-en', pool, rng));
      const r = rng();
      if (r < 0.34) out.push(mc(item, 'en-es', pool, rng));
      else if (r < 0.67) out.push(listenEx(item, pool, rng));
      else out.push(typeEx(item));
    }
    const shuffled = shuffle(out, rng);
    if (lesson.items.length >= 3) {
      shuffled.splice(Math.floor(shuffled.length / 2), 0, {
        kind: 'match', pairs: sampleDistinct(lesson.items, Math.min(5, lesson.items.length), rng).map((v) => ({ es: v.es, en: firstEn(v.en) })),
      });
    }
    const lessonWords = new Set(lesson.items.flatMap((v) => tilesOf(v.es).map((w) => w.toLowerCase())));
    const relevant = unit.sentences.filter((s) => tilesOf(s.es).some((w) => lessonWords.has(w.toLowerCase())));
    const sent = (relevant.length ? relevant : unit.sentences)[Math.floor(rng() * (relevant.length || unit.sentences.length))];
    if (sent) shuffled.push(buildEx(sent, unit.sentences.filter((x) => x !== sent), rng));
    if (canSpeak) {
      const sp = lesson.items[Math.floor(rng() * lesson.items.length)];
      shuffled.push({ kind: 'speak', es: sp.es.replace(/…/g, ''), en: firstEn(sp.en) });
    }
    return shuffled;
  }

  // Final review
  const items = sample(pool, Math.min(8, pool.length), rng);
  for (const item of items) {
    const r = rng();
    if (r < 0.3) out.push(mc(item, 'es-en', pool, rng));
    else if (r < 0.55) out.push(mc(item, 'en-es', pool, rng));
    else if (r < 0.8) out.push(listenEx(item, pool, rng));
    else out.push(typeEx(item));
  }
  out.push({ kind: 'match', pairs: sampleDistinct(pool, 5, rng).map((v) => ({ es: v.es, en: firstEn(v.en) })) });
  const sents = sample(unit.sentences, Math.min(3, unit.sentences.length), rng);
  const shuffledOut = shuffle(out, rng);
  for (const s of sents) shuffledOut.push(buildEx(s, unit.sentences.filter((x) => x !== s), rng));
  if (canSpeak && unit.sentences.length) {
    const s = unit.sentences[Math.floor(rng() * unit.sentences.length)];
    shuffledOut.push({ kind: 'speak', es: s.es, en: s.en });
  }
  return shuffledOut;
}
