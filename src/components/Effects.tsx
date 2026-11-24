import { useEffect, useRef, useState } from 'react';
import { on, type AppEvent } from '../lib/events';
import { useStore } from '../lib/store';
import { haptic, sfx } from '../lib/sound';
import { Modal } from './ui';

/* ---------- Toasts ---------- */
interface ToastItem {
  id: number;
  text: string;
  emoji?: string;
  tone: string;
  leaving?: boolean;
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    let n = 0;
    const add = (t: Omit<ToastItem, 'id'>, ms = 3200) => {
      const id = ++n;
      setItems((list) => [...list.slice(-3), { ...t, id }]);
      setTimeout(() => setItems((l) => l.map((x) => (x.id === id ? { ...x, leaving: true } : x))), ms);
      setTimeout(() => setItems((l) => l.filter((x) => x.id !== id)), ms + 320);
    };
    return on((e: AppEvent) => {
      if (e.type === 'toast') add({ text: e.text, emoji: e.emoji, tone: e.tone ?? 'info' });
      if (e.type === 'achievement') {
        add({ text: `¡Logro desbloqueado! ${e.title}`, emoji: e.emoji, tone: 'achievement' }, 4200);
        if (useStore.getState().settings.sfx) sfx.levelup();
      }
    });
  }, []);
  return (
    <div className="toasts" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast ${t.tone} ${t.leaving ? 'leaving' : ''}`}>
          {t.emoji && <span className="t-emoji">{t.emoji}</span>}
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Confetti (papel picado colors + a few tacos) ---------- */
const COLORS = ['#ff2e93', '#ffa630', '#19d3a2', '#4cc9f0', '#a06cf0', '#ffd166', '#ffffff'];
const EMOJI = ['🌮', '🌶️', '🌼', '🎉', '💀', '🪅'];

interface P { x: number; y: number; vx: number; vy: number; r: number; vr: number; w: number; h: number; c: string; e?: string; life: number }

export function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);
  const parts = useRef<P[]>([]);
  const raf = useRef(0);
  useEffect(() => {
    const burst = (intensity = 1) => {
      if (useStore.getState().settings.reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const count = Math.round(140 * intensity);
      for (let i = 0; i < count; i++) {
        const fromLeft = i % 2 === 0;
        const emoji = Math.random() < 0.08 ? EMOJI[Math.floor(Math.random() * EMOJI.length)] : undefined;
        parts.current.push({
          x: fromLeft ? -10 : W + 10,
          y: H * (0.55 + Math.random() * 0.3),
          vx: (fromLeft ? 1 : -1) * (6 + Math.random() * 9),
          vy: -(10 + Math.random() * 12),
          r: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.4,
          w: 7 + Math.random() * 7,
          h: 10 + Math.random() * 10,
          c: COLORS[Math.floor(Math.random() * COLORS.length)],
          e: emoji,
          life: 1,
        });
      }
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };
    const tick = () => {
      const cv = ref.current;
      if (!cv) return;
      const ctx = cv.getContext('2d');
      if (!ctx) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== window.innerWidth * dpr) {
        cv.width = window.innerWidth * dpr;
        cv.height = window.innerHeight * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      parts.current = parts.current.filter((p) => p.y < window.innerHeight + 40 && p.life > 0);
      for (const p of parts.current) {
        p.vy += 0.32;
        p.vx *= 0.985;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        p.life -= 0.0035;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.5));
        if (p.e) {
          ctx.font = '22px serif';
          ctx.fillText(p.e, -11, 8);
        } else {
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)) + 2);
        }
        ctx.restore();
      }
      if (parts.current.length) raf.current = requestAnimationFrame(tick);
      else {
        raf.current = 0;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };
    const off = on((e) => {
      if (e.type === 'confetti') burst(e.intensity);
      if (e.type === 'levelup') burst(1.4);
    });
    return () => {
      off();
      cancelAnimationFrame(raf.current);
    };
  }, []);
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 110 }} aria-hidden />;
}

/* ---------- Level up ---------- */
export function LevelUp() {
  const [lv, setLv] = useState<{ level: number; name: string } | null>(null);
  useEffect(
    () =>
      on((e) => {
        if (e.type === 'levelup') {
          setLv({ level: e.level, name: e.name });
          if (useStore.getState().settings.sfx) sfx.complete();
          haptic([30, 40, 30, 40, 80]);
        }
      }),
    [],
  );
  return (
    <Modal open={!!lv} onClose={() => setLv(null)} label="Level up">
      <div className="center stack" style={{ padding: '10px 0' }}>
        <div className="emoji-xl pulse" style={{ margin: '0 auto' }}>🏆</div>
        <div className="eyebrow">¡Subiste de nivel!</div>
        <div className="h1 grad-text">Nivel {lv?.level}</div>
        <div className="h2">{lv?.name}</div>
        <p className="soft">You leveled up. ¡Sigue así! (Keep it up!)</p>
        <button className="btn primary lg" onClick={() => setLv(null)}>¡Órale!</button>
      </div>
    </Modal>
  );
}
