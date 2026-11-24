/** Unified lexicon: every word/phrase in the app + reverse verb-form analysis. */
import { conjugate, PERSONS, TENSE_INFO, type SimpleTense, SIMPLE_TENSES } from '../lib/conjugate';
import { normalize, stripDiacritics, tokenize } from '../lib/text';
import { ALL_VOCAB } from './units';
import { ALL_PHRASES } from './phrases';
import { SLANG } from './slang';
import { STORIES } from './stories';
import { VERBS } from './verbs';
import { LOTERIA } from './loteria';

export interface LexEntry {
  es: string;
  en: string;
  source: string;
}

export interface VerbAnalysis {
  inf: string;
  en: string;
  tense: SimpleTense | 'gerundio' | 'participio' | 'infinitivo';
  tenseLabel: string;
  persons: string[];
}

const ARTICLE = /^(el|la|los|las|un|una|unos|unas) /;

function key(s: string): string {
  return stripDiacritics(normalize(s)).replace(/…/g, '').trim();
}

let esIndex: Map<string, LexEntry[]> | null = null;
let enIndex: Map<string, LexEntry[]> | null = null;
let verbIndex: Map<string, VerbAnalysis[]> | null = null;

function add(map: Map<string, LexEntry[]>, k: string, e: LexEntry) {
  if (!k) return;
  const arr = map.get(k);
  if (arr) {
    if (!arr.some((x) => x.es === e.es && x.en === e.en)) arr.push(e);
  } else map.set(k, [e]);
}

function build() {
  if (esIndex) return;
  esIndex = new Map();
  enIndex = new Map();
  const entries: LexEntry[] = [];
  for (const v of ALL_VOCAB) entries.push({ es: v.es, en: v.en, source: 'Curso' });
  for (const p of ALL_PHRASES) entries.push({ es: p.es, en: p.en, source: 'Frases' });
  for (const s of SLANG) {
    for (const t of s.term.split(' / ')) entries.push({ es: t, en: s.meaning, source: 'Slang' });
  }
  for (const v of VERBS) entries.push({ es: v.inf, en: v.en, source: 'Verbos' });
  for (const c of LOTERIA) entries.push({ es: c.name, en: c.en, source: 'Lotería' });
  for (const st of STORIES) {
    for (const [w, m] of Object.entries(st.glossary)) entries.push({ es: w, en: m, source: 'Historias' });
    for (const s of st.sentences) entries.push({ es: s.es, en: s.en, source: 'Historias' });
  }
  for (const e of entries) {
    const k = key(e.es);
    add(esIndex, k, e);
    const noArt = k.replace(ARTICLE, '');
    if (noArt !== k) add(esIndex, noArt, e);
    for (const part of e.en.split('/')) {
      const ek = key(part).replace(/^(the|a|an|to) /, '');
      add(enIndex, ek, e);
    }
  }
}

function buildVerbs() {
  if (verbIndex) return;
  verbIndex = new Map();
  const push = (form: string, a: VerbAnalysis) => {
    const k = key(form);
    const arr = verbIndex!.get(k) ?? [];
    const same = arr.find((x) => x.inf === a.inf && x.tense === a.tense);
    if (same) {
      for (const p of a.persons) if (!same.persons.includes(p)) same.persons.push(p);
    } else arr.push({ ...a, persons: [...a.persons] });
    verbIndex!.set(k, arr);
  };
  for (const v of VERBS) {
    const c = conjugate(v);
    const inf = v.inf.replace(/se$/, '');
    if (c.reflexive && VERBS.some((x) => x.inf === inf)) continue; // base verb covers forms
    for (const t of SIMPLE_TENSES) {
      c.tenses[t].forEach((f, i) => {
        const bare = c.reflexive ? f.split(' ').slice(1).join(' ') : f;
        push(bare, { inf: v.inf, en: v.en, tense: t, tenseLabel: TENSE_INFO[t].en, persons: [PERSONS[i]] });
      });
    }
    push(c.gerund, { inf: v.inf, en: v.en, tense: 'gerundio', tenseLabel: 'Gerund (-ing)', persons: [] });
    push(c.participle, { inf: v.inf, en: v.en, tense: 'participio', tenseLabel: 'Past participle', persons: [] });
    push(inf, { inf: v.inf, en: v.en, tense: 'infinitivo', tenseLabel: 'Infinitive', persons: [] });
  }
}

export function lookupEs(word: string): LexEntry[] {
  build();
  const k = key(word);
  return esIndex!.get(k) ?? esIndex!.get(k.replace(ARTICLE, '')) ?? [];
}

export function lookupEn(word: string): LexEntry[] {
  build();
  const k = key(word).replace(/^(the|a|an|to) /, '');
  return enIndex!.get(k) ?? [];
}

export function analyzeVerb(word: string): VerbAnalysis[] {
  buildVerbs();
  return verbIndex!.get(key(word)) ?? [];
}

/** All Spanish keys for search (command palette / dictionary). */
export function searchLexicon(q: string, limit = 30): LexEntry[] {
  build();
  const k = key(q);
  if (!k) return [];
  const out: LexEntry[] = [];
  const seen = new Set<string>();
  const consider = (e: LexEntry) => {
    const id = e.es + '|' + e.en;
    if (seen.has(id)) return;
    seen.add(id);
    out.push(e);
  };
  for (const [kk, list] of esIndex!) if (kk.startsWith(k)) list.forEach(consider);
  for (const [kk, list] of enIndex!) if (kk.startsWith(k)) list.forEach(consider);
  if (out.length < limit) {
    for (const [kk, list] of esIndex!) if (kk.includes(k)) list.forEach(consider);
    for (const [kk, list] of enIndex!) if (kk.includes(k)) list.forEach(consider);
  }
  return out
    .sort((a, b) => a.es.length - b.es.length)
    .slice(0, limit);
}

/** Offline fallback translation: exact phrase match, otherwise a word-by-word gloss. */
export function offlineTranslate(text: string, from: 'es' | 'en'): { text: string; exact: boolean } | null {
  build();
  const k = key(text);
  if (!k) return null;
  const idx = from === 'es' ? esIndex! : enIndex!;
  const exact = idx.get(k) ?? idx.get(k.replace(from === 'es' ? ARTICLE : /^(the|a|an|to) /, ''));
  if (exact?.length) {
    const e = exact[0];
    const out = from === 'es' ? e.en.split(' / ')[0] : e.es;
    return { text: out, exact: true };
  }
  const tokens = tokenize(text);
  let hits = 0;
  let words = 0;
  const out = tokens.map((t) => {
    if (!t.word) return t.t;
    words++;
    if (from === 'es') {
      const l = lookupEs(t.t);
      if (l.length) {
        hits++;
        return l[0].en.split(' / ')[0];
      }
      const v = analyzeVerb(t.t);
      if (v.length) {
        hits++;
        return v[0].en.replace(/^to /, '').split(' / ')[0];
      }
    } else {
      const l = lookupEn(t.t);
      if (l.length) {
        hits++;
        return l[0].es;
      }
    }
    return t.t;
  });
  if (!hits || hits / Math.max(1, words) < 0.34) return null;
  return { text: out.join(''), exact: false };
}

/** Word of the day — deterministic per calendar day. */
export function wordOfTheDay(date = new Date()): { es: string; en: string; note?: string; emoji: string; ex?: string; exEn?: string } {
  const pool = [
    ...ALL_VOCAB.map((v) => ({ es: v.es, en: v.en.split(' / ')[0], note: v.note, emoji: v.emoji })),
    ...SLANG.filter((s) => s.spice === 1).map((s) => ({ es: s.term, en: s.meaning, note: s.note, emoji: '🌶️', ex: s.ex, exEn: s.exEn })),
  ];
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  // spread consecutive days across the pool
  const i = (day * 7919) % pool.length;
  return pool[i];
}
