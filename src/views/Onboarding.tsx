import { useState } from 'react';
import { useStore } from '../lib/store';
import { Modal } from '../components/ui';
import { sfx } from '../lib/sound';
import { emit } from '../lib/events';

const GOALS = [
  { xp: 20, es: 'Relajado', en: 'Casual · ~5 min/day', emoji: '🌴' },
  { xp: 50, es: 'Normal', en: 'Regular · ~10 min/day', emoji: '🌮' },
  { xp: 100, es: 'Serio', en: 'Serious · ~20 min/day', emoji: '🔥' },
  { xp: 200, es: 'Intenso', en: 'Intense · 30+ min/day', emoji: '🌋' },
];

export function Onboarding() {
  const setSettings = useStore((s) => s.setSettings);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(50);

  const finish = () => {
    setSettings({ name: name.trim(), dailyGoal: goal });
    setOnboarded();
    sfx.complete();
    emit({ type: 'confetti', intensity: 0.8 });
  };

  return (
    <Modal open onClose={finish} label="Welcome">
      {step === 0 && (
        <div className="stack center" style={{ padding: '6px 0' }}>
          <div className="emoji-xl float" style={{ margin: '0 auto' }}>🌮</div>
          <div className="eyebrow">Bienvenido · Welcome</div>
          <div className="h1">¡Hola! Soy <span className="grad-text">Spenish</span></div>
          <p className="soft" style={{ margin: 0 }}>
            Your all-in-one Mexican Spanish app: a voice translator, a face-to-face interpreter, a full course, an AI tutor,
            Lotería, a 100+ verb conjugator and a whole lot more.
          </p>
          <div className="grid cols-3" style={{ gap: 8, textAlign: 'left' }}>
            {[['🔁', 'Translate'], ['🎓', 'Learn'], ['🎴', 'Play']].map(([e, t]) => (
              <div key={t} className="card tight flat center"><div style={{ fontSize: 26 }}>{e}</div><div className="small" style={{ fontWeight: 600 }}>{t}</div></div>
            ))}
          </div>
          <button className="btn primary lg block" onClick={() => setStep(1)}>¡Vámonos! · Let’s go</button>
        </div>
      )}
      {step === 1 && (
        <div className="stack">
          <div className="eyebrow">Paso 1 de 2</div>
          <div className="h2">¿Cómo te llamas? <span className="bi-en">What’s your name?</span></div>
          <input className="input big" placeholder="Me llamo…" value={name} onChange={(e) => setName(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && setStep(2)} aria-label="Your name" />
          <div className="row end">
            <button className="btn ghost" onClick={() => setStep(2)}>Skip</button>
            <button className="btn primary" onClick={() => setStep(2)}>Siguiente</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="stack">
          <div className="eyebrow">Paso 2 de 2</div>
          <div className="h2">Tu meta diaria <span className="bi-en">Pick a daily goal</span></div>
          <div className="stack sm">
            {GOALS.map((g) => (
              <button key={g.xp} className={`choice ${goal === g.xp ? 'sel' : ''}`} onClick={() => { setGoal(g.xp); sfx.tap(); }}>
                <span style={{ fontSize: 24 }}>{g.emoji}</span>
                <span className="grow"><b>{g.es}</b> <span className="muted small">· {g.en}</span></span>
                <span className="chip">{g.xp} XP</span>
              </button>
            ))}
          </div>
          <button className="btn primary lg block" onClick={finish}>¡Empezar! · Start</button>
        </div>
      )}
    </Modal>
  );
}
