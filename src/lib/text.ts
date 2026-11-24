/** Text helpers: normalization, fuzzy matching, answer checking, language detection. */

export function stripDiacritics(s: string): string {
  // keep ñ distinct from n
  return s
    .replace(/ñ/g, '\u0001')
    .replace(/Ñ/g, '\u0002')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\u0001/g, 'ñ')
    .replace(/\u0002/g, 'Ñ');
}

/** Lowercase, trim, collapse spaces, drop punctuation (¿¡?!.,;:"'…). */
export function normalize(s: string, { accents = true }: { accents?: boolean } = {}): string {
  let out = s.toLowerCase().replace(/[¿¡?!.,;:"“”«»…()\[\]{}]/g, ' ').replace(/[’']/g, "'");
  out = out.replace(/\s+/g, ' ').trim();
  if (!accents) out = stripDiacritics(out);
  return out;
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/** 0..1 similarity */
export function similarity(a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  if (!max) return 1;
  return 1 - levenshtein(a, b) / max;
}

export type AnswerVerdict = 'correct' | 'accent' | 'typo' | 'wrong';

const EN_ARTICLES = /^(the|a|an|to) /;
const ES_ARTICLES = /^(el|la|los|las|un|una|unos|unas) /;
const stripArticles = (s: string) => s.replace(EN_ARTICLES, '').replace(ES_ARTICLES, '');

/**
 * Check a typed answer against accepted answers.
 * - exact (ignoring case/punctuation) → correct
 * - same except accents/ñ → accent (accepted, with a nudge)
 * - within 1 edit for short or ~12% for long → typo (accepted, with a nudge)
 */
export function checkAnswer(input: string, accepted: string[]): { verdict: AnswerVerdict; best: string } {
  const inp = normalize(input);
  if (!inp) return { verdict: 'wrong', best: accepted[0] ?? '' };
  const expanded = accepted.flatMap((a) => a.split('/').map((x) => x.trim())).filter(Boolean);
  let best = expanded[0] ?? '';
  let bestDist = Infinity;
  for (const a of expanded) {
    const na = normalize(a);
    if (na === inp) return { verdict: 'correct', best: a };
    const stripA = stripArticles(na);
    const stripI = stripArticles(inp);
    if (stripA === stripI) {
      const artA = na.match(ES_ARTICLES)?.[1];
      const artI = inp.match(ES_ARTICLES)?.[1];
      // a missing article is fine; a wrong one (la taco) gets a gentle nudge
      return { verdict: artA && artI && artA !== artI ? 'typo' : 'correct', best: a };
    }
    if (stripDiacritics(stripA) === stripDiacritics(stripI)) return { verdict: 'accent', best: a };
    if (stripDiacritics(na) === stripDiacritics(inp)) return { verdict: 'accent', best: a };
    const d = levenshtein(stripDiacritics(stripA), stripDiacritics(stripI));
    if (d < bestDist) {
      bestDist = d;
      best = a;
    }
  }
  const len = normalize(best).length;
  const tolerance = len <= 5 ? 0 : len <= 12 ? 1 : Math.floor(len * 0.12);
  if (bestDist <= tolerance) return { verdict: 'typo', best };
  return { verdict: 'wrong', best };
}

/** Word-level diff for pronunciation scoring: which target words were heard. */
export function wordMatch(target: string, heard: string): { words: { w: string; ok: boolean }[]; score: number } {
  const tw = normalize(target, { accents: false }).split(' ').filter(Boolean);
  const hw = normalize(heard, { accents: false }).split(' ').filter(Boolean);
  const used = new Array(hw.length).fill(false);
  const displayWords = target.split(/\s+/).filter(Boolean);
  const words = tw.map((w, i) => {
    let ok = false;
    for (let j = 0; j < hw.length; j++) {
      if (!used[j] && (hw[j] === w || (w.length > 3 && similarity(hw[j], w) >= 0.75))) {
        used[j] = true;
        ok = true;
        break;
      }
    }
    return { w: displayWords[i] ?? w, ok };
  });
  const wordScore = words.length ? words.filter((x) => x.ok).length / words.length : 0;
  const charScore = similarity(tw.join(' '), hw.join(' '));
  const score = Math.round((wordScore * 0.7 + charScore * 0.3) * 100);
  return { words, score: Math.max(0, Math.min(100, score)) };
}

const ES_HINTS = new Set([
  'el', 'la', 'los', 'las', 'que', 'de', 'y', 'en', 'un', 'una', 'es', 'por', 'para', 'con', 'no', 'se', 'su', 'lo', 'como',
  'más', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'sí', 'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'también',
  'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros',
  'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'otro', 'otras', 'otra', 'él',
  'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'algunas', 'algo',
  'nosotros', 'mi', 'mis', 'tú', 'te', 'ti', 'tu', 'tus', 'ellas', 'hola', 'gracias', 'buenos', 'buenas', 'días', 'quiero',
  'tengo', 'estoy', 'eres', 'soy', 'cómo', 'dónde', 'cuánto', 'cuesta', 'bien', 'mal', 'adiós', 'güey', 'neta', 'chido',
  'órale', 'ándale', 'padre', 'onda', 'favor', 'perdón', 'disculpe', 'señor', 'señora', 'amigo', 'amiga', 'casa', 'agua',
]);
const EN_HINTS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do',
  'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would',
  'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like',
  'time', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our',
  'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'are',
  'was', 'were', 'hello', 'hi', 'thanks', 'thank', 'please', 'where', 'much', 'does', 'cost', 'friend', 'house', 'water',
  "i'm", "it's", "don't", 'am', 'yes', 'no', 'sorry', 'excuse',
]);

/** Heuristic: is this text Spanish? Returns 'es' | 'en'. */
export function detectLanguage(text: string): 'es' | 'en' {
  const t = text.toLowerCase();
  if (/[ñ¿¡]/.test(t)) return 'es';
  const words = normalize(t).split(' ').filter(Boolean);
  let es = 0;
  let en = 0;
  for (const w of words) {
    if (ES_HINTS.has(w)) es++;
    if (EN_HINTS.has(w)) en++;
  }
  if (/[áéíóú]/.test(t)) es += 2;
  if (/(ción|ciones|mente|ado|ido|amos|emos|imos)\b/.test(t)) es += 1;
  if (/(tion|ing|ly|ed)\b/.test(t)) en += 1;
  if (/\b(th|wh)\w+/.test(t)) en += 1;
  return es > en ? 'es' : 'en';
}

/** Split into sentences, keeping punctuation ("¿Qué onda? ¡Todo bien!" → 2 sentences). */
export function sentences(text: string): string[] {
  const out: string[] = [];
  let cur = '';
  const flush = () => {
    const t = cur.trim();
    if (t) {
      if (out.length && /^[.!?…"”»)\]]+$/.test(t)) out[out.length - 1] += t;
      else out.push(t);
    }
    cur = '';
  };
  for (const ch of text) {
    if (ch === '\n') {
      flush();
      continue;
    }
    cur += ch;
    if (/[.!?…]/.test(ch)) flush();
  }
  flush();
  return out;
}

/** Tokenize into words and separators, preserving everything (for tap-to-translate). */
export function tokenize(text: string): { t: string; word: boolean }[] {
  const parts = text.split(/([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:'[A-Za-z]+)?)/);
  return parts.filter((p) => p !== '').map((p) => ({ t: p, word: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(p) }));
}

export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: T[], n: number, rng: () => number = Math.random): T[] {
  return shuffle(arr, rng).slice(0, n);
}

/** Deterministic PRNG (mulberry32) */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function dayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
