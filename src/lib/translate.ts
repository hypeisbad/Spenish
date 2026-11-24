/**
 * Translation providers with graceful fallback:
 *   Claude (if an API key is set and AI mode is on) → Google → MyMemory (es-MX) → offline lexicon.
 */
import { aiTranslate, type AiTranslation } from './ai';
import { aiAvailable } from './host';
import { detectLanguage, sentences } from './text';
import { offlineTranslate } from '../data/lexicon';
import { SPAIN_TO_MX_HINTS } from '../data/slang';

export type LangCode = 'es' | 'en';
export type Provider = 'claude' | 'google' | 'mymemory' | 'offline';

export interface DictEntry {
  pos: string;
  terms: string[];
}

export interface TranslateResult {
  text: string;
  from: LangCode;
  to: LangCode;
  provider: Provider;
  approximate?: boolean;
  alternatives?: string[];
  literal?: string;
  notes?: string;
  formality?: string;
  dict?: DictEntry[];
}

export interface TranslateOptions {
  from: LangCode | 'auto';
  engine: 'auto' | 'ai' | 'online' | 'offline';
  aiKey?: string;
  aiModel?: string;
  register?: 'neutral' | 'casual' | 'slang' | 'formal';
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
}

function timeoutSignal(ms: number, outer?: AbortSignal): { signal: AbortSignal; clear: () => void } {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  const onAbort = () => ctrl.abort();
  outer?.addEventListener('abort', onAbort);
  return {
    signal: ctrl.signal,
    clear: () => {
      clearTimeout(t);
      outer?.removeEventListener('abort', onAbort);
    },
  };
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Parse Google's translate_a/single response (dj=1 object or legacy array). */
export function parseGoogle(json: unknown): { text: string; src?: string; dict?: DictEntry[] } {
  if (Array.isArray(json)) {
    const segs = (json[0] as unknown[] | null) ?? [];
    const text = segs.map((s) => (Array.isArray(s) && typeof s[0] === 'string' ? s[0] : '')).join('');
    const dictRaw = Array.isArray(json[1]) ? (json[1] as unknown[]) : [];
    const dict = dictRaw
      .filter(Array.isArray)
      .map((d) => ({ pos: String((d as unknown[])[0] ?? ''), terms: ((d as unknown[])[1] as string[] | undefined) ?? [] }));
    return { text, src: typeof json[2] === 'string' ? json[2] : undefined, dict };
  }
  const o = json as { sentences?: { trans?: string }[]; src?: string; dict?: { pos?: string; terms?: string[] }[] };
  const text = (o.sentences ?? []).map((s) => s.trans ?? '').join('');
  const dict = (o.dict ?? []).map((d) => ({ pos: d.pos ?? '', terms: d.terms ?? [] }));
  return { text, src: o.src, dict };
}

async function google(text: string, from: LangCode | 'auto', to: LangCode, f: typeof fetch, outer?: AbortSignal) {
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&dt=bd&dj=1' +
    `&sl=${from}&tl=${to}&q=${encodeURIComponent(text)}`;
  const { signal, clear } = timeoutSignal(8000, outer);
  try {
    const res = await f(url, { signal });
    if (!res.ok) throw new Error(`Google HTTP ${res.status}`);
    const parsed = parseGoogle(await res.json());
    if (!parsed.text.trim()) throw new Error('Empty Google result');
    return parsed;
  } finally {
    clear();
  }
}

async function myMemory(text: string, from: LangCode, to: LangCode, f: typeof fetch, outer?: AbortSignal) {
  const pair = `${from === 'es' ? 'es-MX' : 'en-US'}|${to === 'es' ? 'es-MX' : 'en-US'}`;
  // MyMemory caps each request at ~500 bytes; translate sentence chunks.
  const chunks: string[] = [];
  let cur = '';
  for (const s of sentences(text)) {
    if ((cur + ' ' + s).length > 420 && cur) {
      chunks.push(cur);
      cur = s;
    } else cur = cur ? `${cur} ${s}` : s;
  }
  if (cur) chunks.push(cur);
  const out: string[] = [];
  for (const chunk of chunks) {
    const { signal, clear } = timeoutSignal(9000, outer);
    try {
      const res = await f(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${encodeURIComponent(pair)}`, { signal });
      if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);
      const j = (await res.json()) as { responseStatus?: number | string; responseData?: { translatedText?: string } };
      const t = j.responseData?.translatedText ?? '';
      if (Number(j.responseStatus) !== 200 || !t || /MYMEMORY WARNING|INVALID LANGUAGE PAIR|QUERY LENGTH LIMIT/i.test(t)) {
        throw new Error('MyMemory unavailable');
      }
      out.push(decodeEntities(t));
    } finally {
      clear();
    }
  }
  return out.join(' ');
}

export async function translate(text: string, opts: TranslateOptions): Promise<TranslateResult> {
  const clean = text.trim();
  if (!clean) throw new Error('Nothing to translate');
  const f = opts.fetchImpl ?? fetch.bind(window);
  let from: LangCode = opts.from === 'auto' ? detectLanguage(clean) : opts.from;
  let to: LangCode = from === 'es' ? 'en' : 'es';
  const errors: string[] = [];

  const offline = (): TranslateResult | null => {
    const o = offlineTranslate(clean, from);
    return o ? { text: o.text, from, to, provider: 'offline', approximate: !o.exact } : null;
  };

  if (opts.engine === 'offline') {
    const o = offline();
    if (o) return o;
    throw new Error('No offline match. Switch to Online or AI mode for full translations.');
  }

  if ((opts.engine === 'ai' || opts.engine === 'auto') && aiAvailable(opts.aiKey ?? '')) {
    try {
      const r: AiTranslation = await aiTranslate({
        apiKey: opts.aiKey ?? '',
        model: opts.aiModel ?? 'claude-opus-5-5',
        text: clean,
        from,
        register: opts.register ?? 'neutral',
        signal: opts.signal,
      });
      return {
        text: r.translation, from, to, provider: 'claude', alternatives: r.alternatives,
        literal: r.literal, notes: r.notes, formality: r.formality,
      };
    } catch (e) {
      if (opts.engine === 'ai') throw e;
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const o = offline();
    if (o) return o;
    throw new Error('You’re offline and there’s no offline match for this text.');
  }

  try {
    const g = await google(clean, opts.from === 'auto' ? 'auto' : from, to, f, opts.signal);
    if (opts.from === 'auto' && (g.src === 'es' || g.src === 'en') && g.src !== from) {
      // Google detected the other language — redo with the right direction.
      from = g.src;
      to = from === 'es' ? 'en' : 'es';
      const g2 = await google(clean, from, to, f, opts.signal);
      return { text: g2.text, from, to, provider: 'google', dict: g2.dict?.length ? g2.dict : undefined };
    }
    return { text: g.text, from, to, provider: 'google', dict: g.dict?.length ? g.dict : undefined };
  } catch (e) {
    if (opts.signal?.aborted) throw e;
    errors.push(e instanceof Error ? e.message : String(e));
  }

  try {
    const t = await myMemory(clean, from, to, f, opts.signal);
    return { text: t, from, to, provider: 'mymemory' };
  } catch (e) {
    if (opts.signal?.aborted) throw e;
    errors.push(e instanceof Error ? e.message : String(e));
  }

  const o = offline();
  if (o) return o;
  throw new Error('Translation services are unreachable right now. ' + (errors[0] ?? ''));
}

/** Find Spain-specific words in Spanish text and suggest the Mexican alternative. */
export function mexicanHints(spanish: string): { word: string; mx: string }[] {
  const found: { word: string; mx: string }[] = [];
  const seen = new Set<string>();
  for (const m of spanish.toLowerCase().matchAll(/[a-záéíóúüñ]+/g)) {
    const w = m[0];
    const mx = SPAIN_TO_MX_HINTS[w];
    if (mx && !seen.has(w)) {
      seen.add(w);
      found.push({ word: w, mx });
    }
  }
  return found;
}

export const PROVIDER_LABEL: Record<Provider, string> = {
  claude: 'Claude AI',
  google: 'Google',
  mymemory: 'MyMemory (es-MX)',
  offline: 'Offline dictionary',
};
