import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, RotateCcw, Sparkles } from 'lucide-react';
import type { Route } from '../lib/router';
import { navigate } from '../lib/router';
import { SCENARIO_MAP, type ScenarioOption } from '../data/scenarios';
import { similarity, normalize } from '../lib/text';
import { useStore } from '../lib/store';
import { emit, toast } from '../lib/events';
import { useAiAvailable } from '../lib/host';
import { sfx } from '../lib/sound';
import { Empty, MicButton, SpeakButton, say } from '../components/ui';

interface Line {
  who: 'npc' | 'me' | 'tip';
  es: string;
  en?: string;
  good?: boolean;
}

export default function Scenario({ route }: { route: Route }) {
  const sc = SCENARIO_MAP[route.parts[1]];
  const settings = useStore((s) => s.settings);
  const addXp = useStore((s) => s.addXp);
  const bump = useStore((s) => s.bump);
  const [nodeId, setNodeId] = useState(sc?.start ?? '');
  const [lines, setLines] = useState<Line[]>(() => (sc ? [{ who: 'npc', es: sc.nodes[sc.start].npc, en: sc.nodes[sc.start].npcEn }] : []));
  const [showEn, setShowEn] = useState(false);
  const [score, setScore] = useState({ good: 0, total: 0 });
  const [heard, setHeard] = useState('');
  const aiOn = useAiAvailable(settings.aiKey);
  const endRef = useRef<HTMLDivElement>(null);
  const finished = useRef(false);

  const node = sc?.nodes[nodeId];

  useEffect(() => {
    if (node) void say(node.npc);
  }, [nodeId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [lines]);
  useEffect(() => {
    if (node?.end && !finished.current) {
      finished.current = true;
      bump('scenarios');
      addXp(15 + score.good * 3);
      emit({ type: 'confetti', intensity: 0.9 });
      if (settings.sfx) sfx.complete();
    }
  }, [node, bump, addXp, score.good, settings.sfx]);

  if (!sc || !node) return <div className="page narrow"><Empty emoji="🎭" title="Scenario not found"><a className="btn primary" href="#/tutor">Back</a></Empty></div>;

  const choose = (o: ScenarioOption) => {
    const next = sc.nodes[o.next];
    const add: Line[] = [{ who: 'me', es: o.es, en: o.en, good: o.good }];
    if (o.feedback) add.push({ who: 'tip', es: o.feedback, good: o.good });
    add.push({ who: 'npc', es: next.npc, en: next.npcEn });
    setLines((l) => [...l, ...add]);
    setScore((s) => ({ good: s.good + (o.good ? 1 : 0), total: s.total + 1 }));
    if (settings.sfx) (o.good ? sfx.correct : sfx.wrong)();
    if (o.good) addXp(3);
    setHeard('');
    setNodeId(o.next);
  };

  const fromSpeech = (t: string) => {
    if (!node.options) return;
    const n = normalize(t, { accents: false });
    let best = node.options[0];
    let bestS = -1;
    for (const o of node.options) {
      const s = similarity(n, normalize(o.es, { accents: false }));
      if (s > bestS) {
        bestS = s;
        best = o;
      }
    }
    if (bestS >= 0.45) choose(best);
    else toast(`I heard “${t}” — try one of the options.`, '👂', 'info');
  };

  const restart = () => {
    finished.current = false;
    setNodeId(sc.start);
    setLines([{ who: 'npc', es: sc.nodes[sc.start].npc, en: sc.nodes[sc.start].npcEn }]);
    setScore({ good: 0, total: 0 });
  };

  return (
    <div className="page narrow">
      <div className="row between">
        <button className="btn sm ghost" onClick={() => navigate('/tutor')}><ArrowLeft /> Role-plays</button>
        <div className="row">
          <button className={`btn sm ${showEn ? 'on' : ''}`} onClick={() => setShowEn((v) => !v)}>{showEn ? <Eye /> : <EyeOff />} English</button>
          <button className="btn icon sm" onClick={restart} aria-label="Restart"><RotateCcw /></button>
        </div>
      </div>
      <div className="card hero mt">
        <div className="row nowrap">
          <div style={{ fontSize: 46 }}>{sc.whoEmoji}</div>
          <div>
            <div className="h2">{sc.emoji} {sc.title}</div>
            <div className="small soft">{sc.who} · {sc.setting}</div>
          </div>
        </div>
      </div>
      <div className="card mt">
        <div className="chat">
          {lines.map((l, i) =>
            l.who === 'tip' ? (
              <div key={i} className={`callout ${l.good ? 'mx' : 'warn'} small`} style={{ alignSelf: 'stretch' }}>💡 {l.es}</div>
            ) : (
              <div key={i} className={`bubble ${l.who === 'me' ? 'me' : 'them'}`}>
                <div className="es" style={{ fontSize: 17 }}>{l.es}</div>
                {(showEn || l.who === 'me') && l.en && <div className="en" style={l.who === 'me' ? { color: 'rgba(255,255,255,.8)' } : undefined}>{l.en}</div>}
                {l.who === 'npc' && <div style={{ marginTop: 6 }}><SpeakButton text={l.es} size="xs" /></div>}
              </div>
            ),
          )}
          <div ref={endRef} />
        </div>
        {node.end ? (
          <div className="center stack mt">
            <div className="emoji-xl" style={{ margin: '0 auto' }}>🎉</div>
            <div className="h2">¡Escena completada!</div>
            <div className="soft">{score.good}/{score.total} respuestas naturales</div>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button className="btn" onClick={restart}><RotateCcw /> Otra vez</button>
              {aiOn && <button className="btn primary" onClick={() => navigate(`/tutor?scenario=${sc.id}`)}><Sparkles /> Versión libre con IA</button>}
              <button className="btn" onClick={() => navigate('/tutor')}>Más escenas</button>
            </div>
          </div>
        ) : (
          <div className="stack mt">
            <div className="row between">
              <span className="tiny muted">Elige o di tu respuesta · Tap or say your answer</span>
              <MicButton lang="es" size="sm" label="Decirlo" onInterim={setHeard} onResult={fromSpeech} />
            </div>
            {heard && <div className="small soft">🎙️ “{heard}”</div>}
            {node.options?.map((o) => (
              <div
                key={o.es}
                role="button"
                tabIndex={0}
                className="choice"
                style={{ cursor: 'pointer' }}
                onClick={() => choose(o)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(o); } }}
              >
                <span className="grow">
                  <span className="es">{o.es}</span>
                  <span className="bi-en" style={{ fontSize: 13 }}>{o.en}</span>
                </span>
                <SpeakButton text={o.es} size="xs" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
