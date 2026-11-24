/** Synthesized sound effects (Web Audio) — no audio files needed. */

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

function ac(): AudioContext | null {
  if (!enabled) return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.18, glideTo?: number) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** Brassy "trumpet" note: sawtooth through a lowpass filter. */
function brass(freq: number, start: number, dur: number, gain = 0.12) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const f = c.createBiquadFilter();
  const g = c.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, t0);
  f.type = 'lowpass';
  f.frequency.setValueAtTime(900, t0);
  f.frequency.linearRampToValueAtTime(2600, t0 + 0.06);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.03);
  g.gain.setValueAtTime(gain, t0 + dur * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(f).connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  tap() {
    tone(660, 0, 0.05, 'triangle', 0.05);
  },
  correct() {
    tone(784, 0, 0.12, 'triangle', 0.16);
    tone(1175, 0.08, 0.22, 'triangle', 0.14);
  },
  wrong() {
    tone(196, 0, 0.18, 'square', 0.07, 150);
    tone(147, 0.12, 0.25, 'square', 0.06);
  },
  flip() {
    tone(420, 0, 0.08, 'sine', 0.07, 620);
  },
  complete() {
    // Mariachi-style fanfare: G C E G (brass)
    [392, 523, 659, 784].forEach((f, i) => brass(f, i * 0.11, 0.2));
    brass(1047, 0.46, 0.55, 0.14);
    brass(784, 0.46, 0.55, 0.08);
  },
  levelup() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => brass(f, i * 0.09, 0.22, 0.11));
  },
  bell() {
    tone(1568, 0, 0.9, 'sine', 0.12);
    tone(2349, 0, 0.6, 'sine', 0.05);
    tone(1046, 0.01, 1.1, 'sine', 0.06);
  },
  pop() {
    tone(880, 0, 0.06, 'sine', 0.1, 1400);
  },
  tick() {
    tone(1200, 0, 0.03, 'square', 0.03);
  },
};

export function haptic(pattern: number | number[] = 12) {
  try {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  } catch {
    /* unsupported */
  }
}
