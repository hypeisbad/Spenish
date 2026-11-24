/**
 * Host adapters for the claude.ai artifact preview build (`vite build --mode artifact`).
 * In the sandboxed viewer, outside network calls and the microphone are blocked,
 * so the preview uses the viewer's built-in capabilities instead:
 *   sample    → Claude answers (tutor, AI translation, photo reading) — no API key needed
 *   dictation → speech-to-text
 *   downloads → saving the progress backup
 * In the normal web/PWA build every function here is inert.
 */
import { useSyncExternalStore } from 'react';

export const IS_ARTIFACT = import.meta.env.MODE === 'artifact';

export interface HostSampleError {
  code: string;
  message: string;
  text?: string;
}
type Turn = { role: 'user' | 'assistant'; content: string };
interface SampleOptions {
  onText?: (u: { text: string; delta: string }) => void;
  signal?: AbortSignal;
  images?: Blob | Blob[];
  modelTier?: 'quick' | 'default' | 'complex';
  cache?: boolean;
}
export interface HostSample {
  (input: string | Turn[], options?: SampleOptions): Promise<{ text: string; truncated: boolean }>;
  json<T = unknown>(input: string | Turn[], options?: SampleOptions): Promise<T>;
  limits(): Promise<{ images?: { maxCount: number; mediaTypes: string[] } }>;
}
export interface HostDictation {
  start(o?: { language?: string }): Promise<void>;
  stop(): Promise<void>;
  active(): boolean;
  onPartial(h: (e: { text: string }) => void): () => void;
  onFinal(h: (e: { text: string }) => void): () => void;
  onState(h: (e: { state: string; reason?: string }) => void): () => void;
}
export interface HostDownloads {
  save(r: { filename: string; data: string | Blob }): Promise<{ status: string }>;
}

interface HostState {
  ready: boolean;
  sample: HostSample | null;
  dictation: HostDictation | null;
  downloads: HostDownloads | null;
  images: boolean;
}

let state: HostState = { ready: !IS_ARTIFACT, sample: null, dictation: null, downloads: null, images: false };
const listeners = new Set<() => void>();

function set(p: Partial<HostState>) {
  state = { ...state, ...p };
  listeners.forEach((l) => l());
}

export function getHost(): HostState {
  return state;
}

export function useHost(): HostState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

type ClaudeUse = { use: (name: string) => Promise<unknown> };

export async function initHost(): Promise<void> {
  if (!IS_ARTIFACT) return;
  const c = (window as unknown as { claude?: ClaudeUse }).claude;
  if (!c?.use) {
    set({ ready: true });
    return;
  }
  const safe = (name: string) => c.use(name).catch(() => null);
  const [sample, dictation, downloads] = (await Promise.all([safe('sample'), safe('dictation'), safe('downloads')])) as [
    HostSample | null,
    HostDictation | null,
    HostDownloads | null,
  ];
  let images = false;
  if (sample) {
    try {
      images = !!(await sample.limits()).images;
    } catch {
      images = false;
    }
  }
  set({ ready: true, sample, dictation, downloads, images });
}

/** True when Claude can answer: an API key (web build) or the viewer's built-in Claude (preview build). */
export function aiAvailable(aiKey: string): boolean {
  return !!aiKey || (IS_ARTIFACT && !!state.sample);
}

export function useAiAvailable(aiKey: string): boolean {
  const h = useHost();
  return !!aiKey || (IS_ARTIFACT && !!h.sample);
}

export function sampleErrorMessage(e: unknown): { message: string; kind: 'auth' | 'rate' | 'refusal' | 'network' | 'other' } {
  const code = (e as HostSampleError)?.code;
  switch (code) {
    case 'not_granted':
      return { message: 'Claude isn’t allowed on this page yet. Allow it from the page’s Permissions menu to use AI features.', kind: 'auth' };
    case 'sampling_disabled':
      return { message: 'Claude isn’t available for this account.', kind: 'auth' };
    case 'rate_limited':
      return { message: 'Too many requests right now — wait a moment and try again.', kind: 'rate' };
    case 'refused':
      return { message: 'Claude declined that one. Try rephrasing.', kind: 'refusal' };
    case 'cancelled':
      return { message: 'Cancelled.', kind: 'other' };
    case 'session_expired':
      return { message: 'Your Claude session expired — sign in again.', kind: 'auth' };
    case 'invalid_json':
      return { message: 'Claude’s answer came back in an unexpected format. Try again.', kind: 'other' };
    default:
      return { message: (e as HostSampleError)?.message || 'Claude couldn’t answer just now. Try again.', kind: 'network' };
  }
}
