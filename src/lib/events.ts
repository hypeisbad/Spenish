/** Tiny typed event bus for app-wide effects (toasts, confetti, level-ups). */

export type AppEvent =
  | { type: 'toast'; text: string; emoji?: string; tone?: 'info' | 'success' | 'error' }
  | { type: 'confetti'; intensity?: number }
  | { type: 'achievement'; id: string; title: string; emoji: string }
  | { type: 'levelup'; level: number; name: string }
  | { type: 'palette' }
  | { type: 'confirm'; message: string; detail?: string; ok: string; danger?: boolean; resolve: (v: boolean) => void };

type Listener = (e: AppEvent) => void;
const listeners = new Set<Listener>();

export function emit(e: AppEvent) {
  listeners.forEach((l) => l(e));
}

export function on(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export const toast = (text: string, emoji?: string, tone: 'info' | 'success' | 'error' = 'info') =>
  emit({ type: 'toast', text, emoji, tone });

/** In-app confirmation (browser confirm() is blocked in some embeds). */
export function askConfirm(message: string, opts: { detail?: string; ok?: string; danger?: boolean } = {}): Promise<boolean> {
  return new Promise((resolve) => emit({ type: 'confirm', message, detail: opts.detail, ok: opts.ok ?? 'Sí', danger: opts.danger, resolve }));
}
