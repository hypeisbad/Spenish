import { useState } from 'react';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { DRILL_SETS, SOUND_GUIDE } from '../data/pronunciation';
import { wordMatch } from '../lib/text';
import { sttSupported } from '../lib/speech';
import { useStore } from '../lib/store';
import { emit } from '../lib/events';
import { sfx } from '../lib/sound';
import { MicButton, PageHead, Ring, SpeakButton } from '../components/ui';

export default function Pronunciation() {
  const [setId, setSetId] = useState(DRILL_SETS[0].id);
  const [idx, setIdx] = useState(0);
  const [heard, setHeard] = useState('');
  const [score, setScore] = useState<ReturnType<typeof wordMatch> | null>(null);
  const [best, setBest] = useState<Record<string, number>>({});
  const bump = useStore((s) => s.bump);
  const addXp = useStore((s) => s.addXp);
  const sound = useStore((s) => s.settings.sfx);
  const set = DRILL_SETS.find((d) => d.id === setId)!;
  const item = set.items[idx];
  const supported = sttSupported();

  const go = (d: number) => {
    setIdx((i) => (i + d + set.items.length) % set.items.length);
    setHeard('');
    setScore(null);
  };

  const onResult = (t: string) => {
    setHeard(t);
    const r = wordMatch(item.es, t);
    setScore(r);
    bump('speakingAttempts');
    const key = setId + idx;
    if (r.score > (best[key] ?? 0)) setBest((b) => ({ ...b, [key]: r.score }));
    if (r.score >= 90) {
      bump('speakingGreat');
      addXp(5);
      if (sound) sfx.correct();
      emit({ type: 'confetti', intensity: 0.4 });
    } else if (r.score >= 70) {
      addXp(3);
      if (sound) sfx.correct();
    } else if (sound) sfx.wrong();
  };

  const verdict = !score ? null : score.score >= 90 ? '¡Pronunciación perfecta! 🎯' : score.score >= 70 ? '¡Muy bien! Casi perfecto.' : score.score >= 45 ? 'Vas bien — escucha y repite otra vez.' : 'Inténtalo de nuevo, más despacio.';

  return (
    <div className="page">
      <PageHead
        eyebrow="Pronunciación · Pronunciation coach"
        es="Habla como mexicano"
        en="Sound like a Mexican"
        desc="Listen, repeat, and get word-by-word feedback from speech recognition tuned to Mexican Spanish (es-MX)."
      />
      {!supported && <div className="callout warn" style={{ marginBottom: 16 }}>🎙️ Speech recognition isn’t available in this browser. You can still listen and practice — try Chrome, Edge or Safari for scoring.</div>}
      <div className="seg" style={{ marginBottom: 16 }}>
        {DRILL_SETS.map((d) => (
          <button key={d.id} className={setId === d.id ? 'on' : ''} onClick={() => { setSetId(d.id); setIdx(0); setHeard(''); setScore(null); }}>
            {d.emoji} {d.title}
          </button>
        ))}
      </div>
      <div className="grid cols-2">
        <div className="card hero">
          <div className="row between">
            <span className="chip">{idx + 1} / {set.items.length}</span>
            {best[setId + idx] !== undefined && <span className="chip ok">Mejor: {best[setId + idx]}%</span>}
          </div>
          <div className="center stack mt" style={{ padding: '18px 0' }}>
            <div className="es" style={{ fontSize: `clamp(24px, ${item.es.length > 60 ? 3.6 : 5.5}vw, ${item.es.length > 60 ? 30 : 44}px)`, lineHeight: 1.3 }}>
              {score ? score.words.map((w, i) => <span key={i} style={{ color: w.ok ? 'var(--ok)' : 'var(--bad)', transition: 'color .3s' }}>{w.w} </span>) : item.es}
            </div>
            <div className="soft">{item.en}</div>
            {item.tip && <div className="callout mx small" style={{ textAlign: 'left' }}><Info style={{ width: 16, flex: 'none' }} /> {item.tip}</div>}
            <div className="row" style={{ justifyContent: 'center' }}>
              <SpeakButton text={item.es} label="Escuchar" />
              <SpeakButton text={item.es} slow label="Lento" />
            </div>
            <div style={{ margin: '10px auto 0' }}>
              <MicButton lang="es" size="lg" onInterim={setHeard} onResult={onResult} />
            </div>
            <div className="small muted">{heard ? `Escuché: “${heard}”` : 'Toca el micrófono y repite la frase'}</div>
          </div>
          <div className="row between">
            <button className="btn" onClick={() => go(-1)}><ArrowLeft /> Anterior</button>
            <button className="btn primary" onClick={() => go(1)}>Siguiente <ArrowRight /></button>
          </div>
        </div>
        <div className="card">
          {score ? (
            <div className="stack center">
              <div style={{ margin: '0 auto' }}>
                <Ring value={score.score / 100} size={150} color={score.score >= 90 ? '#22dba8' : score.score >= 70 ? '#ffa630' : '#ff5577'}>
                  <div><div style={{ fontSize: 34, fontWeight: 700 }}>{score.score}%</div><div className="tiny muted">precisión</div></div>
                </Ring>
              </div>
              <div className="h3">{verdict}</div>
              <div className="small soft">{score.words.filter((w) => !w.ok).length ? `Practica: ${score.words.filter((w) => !w.ok).map((w) => w.w).join(', ')}` : 'Every word recognized.'}</div>
            </div>
          ) : (
            <>
              <div className="card-title">🔤 Guía de sonidos mexicanos</div>
              <div className="list">
                {SOUND_GUIDE.map((g) => (
                  <div className="list-item" key={g.sound} style={{ alignItems: 'flex-start' }}>
                    <b className="es" style={{ minWidth: 92, color: 'var(--accent)' }}>{g.sound}</b>
                    <div className="grow">
                      <div className="small">{g.how}</div>
                      <div className="tiny muted es">{g.ex}</div>
                    </div>
                    <SpeakButton text={g.ex.replace(/ · /g, ', ')} size="xs" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
