/** Text-to-speech (Mexican Spanish voices preferred) and speech recognition. */
import { sentences } from './text';

export type Lang = 'es' | 'en';

const LOCALE: Record<Lang, string> = { es: 'es-MX', en: 'en-US' };

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

let voicesCache: SpeechSynthesisVoice[] = [];

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!ttsSupported()) return Promise.resolve([]);
  const now = window.speechSynthesis.getVoices();
  if (now.length) {
    voicesCache = now;
    return Promise.resolve(now);
  }
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      voicesCache = window.speechSynthesis.getVoices();
      resolve(voicesCache);
    };
    window.speechSynthesis.addEventListener('voiceschanged', finish, { once: true });
    setTimeout(finish, 1500);
  });
}

/** Rank Spanish voices: es-MX first, then Latin American, then any Spanish. Natural/online voices get a bonus. */
function score(v: SpeechSynthesisVoice): number {
  const lang = v.lang.replace('_', '-').toLowerCase();
  let s = 0;
  if (lang === 'es-mx') s += 100;
  else if (lang === 'es-us' || lang === 'es-419') s += 70;
  else if (/^es-(co|ar|cl|pe|ve|gt|cr|pa|do|pr|ec|bo|py|uy|sv|hn|ni|cu)$/.test(lang)) s += 50;
  else if (lang.startsWith('es')) s += 20;
  else return -1;
  const n = v.name.toLowerCase();
  if (/natural|neural|online|premium|enhanced|siri/.test(n)) s += 15;
  if (/google/.test(n)) s += 8;
  if (/paulina|dalia|jorge|juan|renata|mónica|monica/.test(n)) s += 5;
  return s;
}

export function spanishVoices(): SpeechSynthesisVoice[] {
  return voicesCache.filter((v) => score(v) >= 0).sort((a, b) => score(b) - score(a));
}

export function pickVoice(lang: Lang, preferredURI?: string | null): SpeechSynthesisVoice | undefined {
  const voices = voicesCache.length ? voicesCache : ttsSupported() ? window.speechSynthesis.getVoices() : [];
  if (lang === 'es') {
    if (preferredURI) {
      const p = voices.find((v) => v.voiceURI === preferredURI);
      if (p) return p;
    }
    return voices.filter((v) => score(v) >= 0).sort((a, b) => score(b) - score(a))[0];
  }
  return (
    voices.find((v) => v.lang === 'en-US' && /natural|google|samantha/i.test(v.name)) ??
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang.startsWith('en'))
  );
}

export interface SpeakOptions {
  lang?: Lang;
  rate?: number;
  voiceURI?: string | null;
  onBoundary?: (charIndex: number, sentenceIndex: number) => void;
  onSentence?: (sentenceIndex: number) => void;
  onEnd?: () => void;
}

let speakToken = 0;
const listeners = new Set<(speaking: boolean, text: string | null) => void>();
let currentText: string | null = null;

function notify(speaking: boolean) {
  listeners.forEach((l) => l(speaking, speaking ? currentText : null));
}

export function onSpeakingChange(l: (speaking: boolean, text: string | null) => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function stopSpeaking() {
  speakToken++;
  if (ttsSupported()) window.speechSynthesis.cancel();
  currentText = null;
  notify(false);
}

/** Speak text. Long text is chunked by sentence (works around Chrome's ~15s cutoff). */
export function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (!ttsSupported() || !text.trim()) {
    opts.onEnd?.();
    return Promise.resolve();
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const token = ++speakToken;
  const lang = opts.lang ?? 'es';
  const voice = pickVoice(lang, opts.voiceURI);
  const chunks = text.length > 180 ? sentences(text) : [text];
  currentText = text;
  notify(true);

  return new Promise((resolve) => {
    let i = 0;
    let keepAlive: ReturnType<typeof setInterval> | undefined;
    const finish = () => {
      if (keepAlive) clearInterval(keepAlive);
      if (token === speakToken) {
        currentText = null;
        notify(false);
      }
      opts.onEnd?.();
      resolve();
    };
    const next = () => {
      if (token !== speakToken) return finish();
      if (i >= chunks.length) return finish();
      const u = new SpeechSynthesisUtterance(chunks[i]);
      u.lang = voice?.lang ?? LOCALE[lang];
      if (voice) u.voice = voice;
      u.rate = opts.rate ?? 0.95;
      u.pitch = 1;
      const idx = i;
      opts.onSentence?.(idx);
      u.onboundary = (e) => opts.onBoundary?.(e.charIndex, idx);
      u.onend = () => {
        i++;
        next();
      };
      u.onerror = () => {
        i++;
        next();
      };
      synth.speak(u);
    };
    // Chrome sometimes pauses long queues; nudge it.
    keepAlive = setInterval(() => {
      if (token !== speakToken) return;
      if (synth.paused) synth.resume();
    }, 4000);
    next();
  });
}

/* ---------------- Speech recognition ---------------- */

interface RecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string; confidence: number };
}
interface RecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<RecognitionResultLike>;
}
interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: RecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

function RecognitionCtor(): (new () => RecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function sttSupported(): boolean {
  return !!RecognitionCtor();
}

export interface ListenHandlers {
  onInterim?: (text: string) => void;
  onFinal?: (text: string, confidence: number) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
  onStart?: () => void;
}

const ERRORS: Record<string, string> = {
  'not-allowed': 'Microphone permission was denied. Allow mic access in your browser settings.',
  'service-not-allowed': 'Speech recognition is blocked in this browser context.',
  'no-speech': 'I didn’t hear anything — try again a bit closer to the mic.',
  'audio-capture': 'No microphone was found.',
  network: 'Speech recognition needs an internet connection in this browser.',
  aborted: '',
};

/** Start listening. Returns a stop function. */
export function listen(lang: Lang, h: ListenHandlers, continuous = false): () => void {
  const Ctor = RecognitionCtor();
  if (!Ctor) {
    h.onError?.('Speech recognition isn’t supported in this browser. Try Chrome, Edge or Safari.');
    h.onEnd?.();
    return () => {};
  }
  stopSpeaking();
  const r = new Ctor();
  r.lang = LOCALE[lang];
  r.interimResults = true;
  r.continuous = continuous;
  r.maxAlternatives = 1;
  let finalText = '';
  r.onstart = () => h.onStart?.();
  r.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const res = e.results[i];
      if (res.isFinal) {
        finalText += res[0].transcript;
        h.onFinal?.(res[0].transcript.trim(), res[0].confidence);
      } else interim += res[0].transcript;
    }
    h.onInterim?.((finalText + interim).trim());
  };
  r.onerror = (e) => {
    const msg = ERRORS[e.error] ?? `Speech recognition error: ${e.error}`;
    if (msg) h.onError?.(msg);
  };
  r.onend = () => h.onEnd?.();
  try {
    r.start();
  } catch {
    h.onError?.('Could not start the microphone.');
    h.onEnd?.();
  }
  return () => {
    try {
      r.stop();
    } catch {
      /* already stopped */
    }
  };
}
