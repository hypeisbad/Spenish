/**
 * Claude integration (bring-your-own API key, stored only in this browser).
 * The SDK is loaded lazily so it never weighs down the rest of the app.
 */
import type Anthropic from '@anthropic-ai/sdk';

export const AI_MODELS = [
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5', hint: 'Best quality (default)' },
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5', hint: 'Fast & capable' },
  { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5', hint: 'Fastest & cheapest' },
] as const;

export const DEFAULT_MODEL = 'claude-opus-5-5';

type SDK = typeof import('@anthropic-ai/sdk');
let sdkPromise: Promise<SDK> | null = null;
function sdk(): Promise<SDK> {
  if (!sdkPromise) sdkPromise = import('@anthropic-ai/sdk');
  return sdkPromise;
}

async function client(apiKey: string): Promise<Anthropic> {
  const mod = await sdk();
  return new mod.default({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 2 });
}

/** Server-side refusal fallback is available for Opus/Sonnet 5.5, not Haiku 5.5. */
function fallbackParams(model: string) {
  if (model.startsWith('claude-haiku')) return {};
  return { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const };
}

export class AiError extends Error {
  constructor(message: string, public kind: 'auth' | 'rate' | 'refusal' | 'network' | 'other' = 'other') {
    super(message);
  }
}

async function friendly(err: unknown): Promise<AiError> {
  const mod = await sdk();
  const A = mod.default;
  if (err instanceof AiError) return err;
  if (err instanceof A.AuthenticationError) return new AiError('Your API key was rejected. Check it in Settings → AI.', 'auth');
  if (err instanceof A.PermissionDeniedError) return new AiError('This API key doesn’t have access to that model.', 'auth');
  if (err instanceof A.NotFoundError) return new AiError('That model isn’t available for your key. Pick another in Settings.', 'other');
  if (err instanceof A.RateLimitError) return new AiError('Rate limit reached — wait a moment and try again.', 'rate');
  if (err instanceof A.BadRequestError) return new AiError(`Request error: ${err.message}`, 'other');
  if (err instanceof A.APIConnectionError) return new AiError('Couldn’t reach the Claude API. Check your connection.', 'network');
  if (err instanceof A.APIError) return new AiError(`Claude API error (${err.status ?? '?'}): ${err.message}`, 'other');
  if (err instanceof DOMException && err.name === 'AbortError') return new AiError('Cancelled.', 'other');
  return new AiError(err instanceof Error ? err.message : String(err));
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

/** Stream a chat completion. Calls onText with each text delta. Returns the full text. */
export async function streamChat(opts: {
  apiKey: string;
  model: string;
  system: string;
  messages: ChatTurn[];
  onText: (delta: string) => void;
  signal?: AbortSignal;
}): Promise<string> {
  try {
    const c = await client(opts.apiKey);
    const stream = c.beta.messages.stream(
      {
        model: opts.model,
        max_tokens: 16000,
        system: opts.system,
        messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
        output_config: { effort: 'low' },
        ...fallbackParams(opts.model),
      },
      { signal: opts.signal },
    );
    let text = '';
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        text += event.delta.text;
        opts.onText(event.delta.text);
      }
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') {
      throw new AiError('Claude declined to answer that one. Try rephrasing.', 'refusal');
    }
    return text;
  } catch (e) {
    throw await friendly(e);
  }
}

async function jsonCall<T>(opts: {
  apiKey: string;
  model: string;
  system: string;
  content: Anthropic.Beta.BetaContentBlockParam[] | string;
  schema: Record<string, unknown>;
  signal?: AbortSignal;
}): Promise<T> {
  try {
    const c = await client(opts.apiKey);
    const res = await c.beta.messages.create(
      {
        model: opts.model,
        max_tokens: 16000,
        system: opts.system,
        messages: [{ role: 'user', content: opts.content }],
        output_config: { effort: 'low', format: { type: 'json_schema', schema: opts.schema } },
        ...fallbackParams(opts.model),
      },
      { signal: opts.signal },
    );
    if (res.stop_reason === 'refusal') throw new AiError('Claude declined this request.', 'refusal');
    const textBlock = res.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text');
    if (!textBlock) throw new AiError('Empty response from Claude.');
    return JSON.parse(textBlock.text) as T;
  } catch (e) {
    throw await friendly(e);
  }
}

export interface AiTranslation {
  translation: string;
  alternatives: string[];
  literal: string;
  notes: string;
  formality: string;
}

const TRANSLATION_SCHEMA = {
  type: 'object',
  properties: {
    translation: { type: 'string' },
    alternatives: { type: 'array', items: { type: 'string' } },
    literal: { type: 'string' },
    notes: { type: 'string' },
    formality: { type: 'string' },
  },
  required: ['translation', 'alternatives', 'literal', 'notes', 'formality'],
  additionalProperties: false,
};

export function aiTranslate(opts: {
  apiKey: string;
  model: string;
  text: string;
  from: 'es' | 'en';
  register: 'neutral' | 'casual' | 'slang' | 'formal';
  signal?: AbortSignal;
}): Promise<AiTranslation> {
  const target = opts.from === 'en' ? 'Mexican Spanish (es-MX)' : 'natural American English';
  const registerText = {
    neutral: 'a natural, everyday register',
    casual: 'a casual, friendly register as spoken among friends in Mexico (tú)',
    slang: 'a very colloquial register with authentic Mexican slang where it fits naturally (e.g., chido, neta, güey) — but never forced',
    formal: 'a polite, formal register (usted)',
  }[opts.register];
  return jsonCall<AiTranslation>({
    apiKey: opts.apiKey,
    model: opts.model,
    signal: opts.signal,
    schema: TRANSLATION_SCHEMA,
    system:
      'You are an expert Mexican Spanish ↔ English translator and language teacher. ' +
      'Always prefer vocabulary used in Mexico (carro, celular, computadora, jugo, camión for bus, ustedes — never vosotros). ' +
      'Return JSON only: "translation" (best translation), "alternatives" (0–3 other natural options), ' +
      '"literal" (a word-for-word gloss to help a learner, or "" if identical), ' +
      '"notes" (one or two short sentences in English about nuance, slang or cultural context; "" if nothing notable), ' +
      '"formality" (one word: informal, neutral, or formal).',
    content: `Translate the following text into ${target}, using ${registerText}.\n\n<text>\n${opts.text}\n</text>`,
  });
}

export interface VisionResult {
  detected: string;
  items: { es: string; en: string }[];
  summary: string;
}

export function aiReadImage(opts: {
  apiKey: string;
  model: string;
  base64: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  signal?: AbortSignal;
}): Promise<VisionResult> {
  return jsonCall<VisionResult>({
    apiKey: opts.apiKey,
    model: opts.model,
    signal: opts.signal,
    schema: {
      type: 'object',
      properties: {
        detected: { type: 'string' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: { es: { type: 'string' }, en: { type: 'string' } },
            required: ['es', 'en'],
            additionalProperties: false,
          },
        },
        summary: { type: 'string' },
      },
      required: ['detected', 'items', 'summary'],
      additionalProperties: false,
    },
    system:
      'You help travelers in Mexico read signs, menus and labels. Transcribe the Spanish text you see and translate each line to English. ' +
      'For menu items, explain unfamiliar Mexican dishes briefly in the English line. ' +
      'Return JSON: "detected" (what the image is, e.g. "taquería menu"), "items" (lines of Spanish text with English translation; ' +
      'if the text is English, put the Mexican Spanish translation in "es"), and "summary" (one helpful sentence in English).',
    content: [
      { type: 'image', source: { type: 'base64', media_type: opts.mediaType, data: opts.base64 } },
      { type: 'text', text: 'Read and translate the text in this image.' },
    ],
  });
}

/** Tutor system prompt. */
export function tutorSystem(opts: { mode: 'chat' | 'scenario' | 'explain' | 'correct'; level: string; scenario?: string; name?: string }): string {
  const base =
    'You are “Profe Lupita”, a warm, witty Spanish tutor from Mexico City. You teach MEXICAN Spanish: Mexican vocabulary and expressions, ustedes (never vosotros), and you sprinkle in cultural tips. ' +
    `The student is at roughly ${opts.level} level — adapt your vocabulary and sentence length to them.` +
    (opts.name ? ` The student's name is ${opts.name}.` : '') +
    '\n\nFORMAT every reply exactly like this:\n' +
    '1. Your reply in Spanish (1–4 short sentences, conversational).\n' +
    '2. A line containing only §EN§ followed by the English translation of your reply.\n' +
    '3. A line containing only §FIX§ followed by gentle corrections of the student’s LAST message: quote each mistake, give the correct Mexican Spanish, and a 1-line reason. If there were no mistakes, write “¡Perfecto!” plus one tip to sound more natural.\n' +
    'Never use markdown headings. Keep it friendly and encouraging. If the student writes in English, reply in simple Spanish and help them say it in Spanish.';
  if (opts.mode === 'scenario' && opts.scenario) {
    return base + `\n\nROLE-PLAY: Stay in character. ${opts.scenario} Start or continue the scene naturally. Correct mistakes in the §FIX§ section only — never break character in the Spanish reply.`;
  }
  if (opts.mode === 'explain') {
    return (
      'You are “Profe Lupita”, an expert, friendly Mexican Spanish teacher. The student asks grammar, vocabulary or culture questions. ' +
      'Answer in clear English with plenty of short Mexican Spanish examples (with translations). Mention Mexico vs. Spain differences when relevant. ' +
      'Keep answers focused and skimmable: short paragraphs and simple bullet lists using "- ". Do not use the §EN§ or §FIX§ markers.'
    );
  }
  if (opts.mode === 'correct') {
    return (
      'You are “Profe Lupita”, a meticulous but kind Mexican Spanish editor. The student sends Spanish text. Reply in English with:\n' +
      '- A corrected version (natural Mexican Spanish).\n- A bullet list of each change and why (short).\n- One tip to sound more natural in Mexico.\n' +
      'Use "- " bullets, no headings. Do not use the §EN§ or §FIX§ markers.'
    );
  }
  return base + '\n\nFREE CONVERSATION: Ask the student engaging questions about their life, plans, food, travel, and Mexico. Keep the conversation flowing.';
}

/** Split a tutor reply into its parts (tolerant of streaming/partial text). */
export function parseTutorReply(text: string): { es: string; en: string; fix: string } {
  const enIdx = text.indexOf('§EN§');
  const fixIdx = text.indexOf('§FIX§');
  if (enIdx < 0 && fixIdx < 0) return { es: text.trim(), en: '', fix: '' };
  const es = text.slice(0, enIdx >= 0 ? enIdx : fixIdx).trim();
  const en = enIdx >= 0 ? text.slice(enIdx + 4, fixIdx > enIdx ? fixIdx : undefined).trim() : '';
  const fix = fixIdx >= 0 ? text.slice(fixIdx + 5).trim() : '';
  return { es, en, fix };
}
