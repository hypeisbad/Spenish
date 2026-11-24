import { useEffect, useRef, useState } from 'react';
import { Bot, KeyRound, Send, Square, Trash2, Eye, EyeOff, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import type { Route } from '../lib/router';
import { navigate } from '../lib/router';
import { useStore } from '../lib/store';
import { streamChat, tutorSystem, parseTutorReply, AI_MODELS, type ChatTurn } from '../lib/ai';
import { SCENARIOS, SCENARIO_MAP } from '../data/scenarios';
import { toast } from '../lib/events';
import { IS_ARTIFACT, useAiAvailable, useHost } from '../lib/host';
import { AccentBar, MicButton, PageHead, SpeakButton, SaveButton, TapText, say } from '../components/ui';
import { RichText } from '../components/RichText';

type Mode = 'chat' | 'scenario' | 'explain' | 'correct';

const MODES: { id: Mode; es: string; en: string; emoji: string }[] = [
  { id: 'chat', es: 'Platicar', en: 'Free chat', emoji: '💬' },
  { id: 'scenario', es: 'Role-play', en: 'Act out a scene', emoji: '🎭' },
  { id: 'explain', es: 'Explícame', en: 'Ask anything', emoji: '🧑‍🏫' },
  { id: 'correct', es: 'Corrígeme', en: 'Fix my Spanish', emoji: '✏️' },
];

const STARTERS: Record<Mode, string[]> = {
  chat: ['¡Hola, Profe! ¿Cómo estás?', 'Quiero practicar para mi viaje a Oaxaca.', '¿Qué comida mexicana me recomiendas?', 'Ayer fui al mercado y compré muchas frutas.'],
  scenario: [],
  explain: ['When do I use ser vs estar?', 'What does “ahorita” really mean?', 'Is “güey” rude?', 'Explain the subjunctive with Mexican examples.'],
  correct: ['Yo soy muy cansado porque ayer yo fui a la fiesta y bailé mucho.', 'Ayer yo ha comido tacos con mis amigos en el centro.', 'Me gusta mucho los tacos al pastor.'],
};

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  hidden?: boolean;
}

function KeySetup() {
  const setSettings = useStore((s) => s.setSettings);
  const [key, setKey] = useState('');
  return (
    <div className="card hero">
      <div className="row nowrap" style={{ alignItems: 'flex-start', gap: 16 }}>
        <div style={{ fontSize: 54 }}>👩‍🏫</div>
        <div className="grow stack">
          <div className="h2">Conoce a Profe Lupita</div>
          <p className="soft" style={{ margin: 0 }}>
            An AI Spanish tutor from Mexico City, powered by Claude. She chats with you at your level, plays characters in role-plays
            (taquero, taxi driver, market vendor…), corrects every mistake gently, and answers any grammar or culture question.
          </p>
          <form className="row" onSubmit={(e) => { e.preventDefault(); if (key.trim()) { setSettings({ aiKey: key.trim() }); toast('API key saved on this device', '🔑', 'success'); } }}>
            <div className="row nowrap grow" style={{ position: 'relative', minWidth: 240 }}>
              <KeyRound style={{ position: 'absolute', left: 14, width: 18, color: 'var(--muted)' }} />
              <input className="input" style={{ paddingLeft: 42 }} type="password" placeholder="sk-ant-…" value={key} onChange={(e) => setKey(e.target.value)} aria-label="Claude API key" autoComplete="off" />
            </div>
            <button className="btn primary" type="submit" disabled={!key.trim()}><Sparkles /> Activar</button>
          </form>
          <div className="tiny muted">
            Get a key at <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">console.anthropic.com <ExternalLink style={{ display: 'inline', width: 12 }} /></a>.
            Your key is stored only in this browser and sent only to Anthropic’s API.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tutor({ route }: { route: Route }) {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const bump = useStore((s) => s.bump);
  const addXp = useStore((s) => s.addXp);
  const initialScenario = route.query.get('scenario');
  const [mode, setMode] = useState<Mode>(initialScenario ? 'scenario' : 'chat');
  const [level, setLevel] = useState('A2');
  const [scenarioId, setScenarioId] = useState<string | null>(initialScenario);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [showEn, setShowEn] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const hasKey = useAiAvailable(settings.aiKey);
  const host = useHost();

  useEffect(() => {
    // scrollIntoView may return a Promise in newer browsers — never return it from an effect
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs]);
  useEffect(() => () => abort.current?.abort(), []);

  const system = () =>
    tutorSystem({
      mode,
      level,
      name: settings.name,
      scenario: scenarioId ? `${SCENARIO_MAP[scenarioId].aiPrompt} Setting: ${SCENARIO_MAP[scenarioId].setting}` : undefined,
    });

  const send = async (text: string, opts: { hidden?: boolean; base?: Msg[] } = {}) => {
    const clean = text.trim();
    if (!clean || streaming) return;
    const base = opts.base ?? msgs;
    const next: Msg[] = [...base, { role: 'user', content: clean, hidden: opts.hidden }, { role: 'assistant', content: '' }];
    setMsgs(next);
    setInput('');
    setStreaming(true);
    const ctrl = new AbortController();
    abort.current = ctrl;
    try {
      const history: ChatTurn[] = next.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
      const full = await streamChat({
        apiKey: settings.aiKey,
        model: settings.aiModel,
        system: system(),
        messages: history,
        signal: ctrl.signal,
        tier: mode === 'explain' || mode === 'correct' ? 'default' : 'quick',
        onText: (d) =>
          setMsgs((cur) => {
            const copy = cur.slice();
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = { ...last, content: last.content + d };
            return copy;
          }),
      });
      if (!opts.hidden) {
        bump('aiMessages');
        addXp(3);
      }
      if (settings.autoSpeak && (mode === 'chat' || mode === 'scenario')) {
        const es = parseTutorReply(full).es;
        if (es) void say(es);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      if (!ctrl.signal.aborted) toast(msg, '⚠️', 'error');
      setMsgs((cur) => {
        const last = cur[cur.length - 1];
        return last && last.role === 'assistant' && !last.content ? cur.slice(0, -2) : cur;
      });
    } finally {
      setStreaming(false);
    }
  };

  const startScenario = (id: string) => {
    setScenarioId(id);
    setMsgs([]);
    void send('[El estudiante acaba de llegar. Empieza la escena saludando, en personaje.]', { hidden: true, base: [] });
  };

  useEffect(() => {
    if (initialScenario && hasKey && SCENARIO_MAP[initialScenario]) startScenario(initialScenario);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    abort.current?.abort();
    setMsgs([]);
    if (mode === 'scenario') setScenarioId(null);
  };

  if (!hasKey) {
    return (
      <div className="page">
        <PageHead eyebrow="Profe IA · AI tutor" es="Tu maestra personal" en="Your personal tutor" />
        {IS_ARTIFACT ? (
          <div className="card hero">
            {host.ready ? (
              <div className="soft">👩‍🏫 Profe Lupita needs Claude, which isn’t available in this view. The offline role-plays below work anywhere.</div>
            ) : (
              <div className="soft">Conectando con Claude…</div>
            )}
          </div>
        ) : (
          <KeySetup />
        )}
        <div className="nav-group" style={{ paddingLeft: 2, marginTop: 24 }}>Mientras tanto · Offline role-plays (no key needed)</div>
        <ScenarioGrid onPick={(id) => navigate(`/scenario/${id}`)} />
      </div>
    );
  }

  const visible = msgs.filter((m) => !m.hidden);
  const lastAssistant = msgs[msgs.length - 1];

  return (
    <div className="page">
      <PageHead
        eyebrow="Profe IA · AI tutor"
        es="Platica con Profe Lupita"
        en="Chat with Profe Lupita"
        right={
          <div className="row">
            <select className="select" style={{ width: 'auto', height: 40, padding: '0 34px 0 12px' }} value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Your level">
              {['A1', 'A2', 'B1', 'B2', 'C1'].map((l) => <option key={l} value={l}>Nivel {l}</option>)}
            </select>
            {!IS_ARTIFACT && (
              <select className="select" style={{ width: 'auto', height: 40, padding: '0 34px 0 12px' }} value={settings.aiModel} onChange={(e) => setSettings({ aiModel: e.target.value })} aria-label="Model">
                {AI_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            )}
          </div>
        }
      />
      <div className="seg" style={{ marginBottom: 14 }}>
        {MODES.map((m) => (
          <button key={m.id} className={mode === m.id ? 'on' : ''} onClick={() => { if (m.id !== mode) { abort.current?.abort(); setMode(m.id); setMsgs([]); setScenarioId(null); } }}>
            {m.emoji} {m.es} <span className="hide-sm" style={{ opacity: 0.7, fontWeight: 500 }}>· {m.en}</span>
          </button>
        ))}
      </div>

      {mode === 'scenario' && !scenarioId ? (
        <ScenarioGrid onPick={startScenario} ai />
      ) : (
        <div className="card" style={{ minHeight: 420, display: 'flex', flexDirection: 'column' }}>
          <div className="row between" style={{ marginBottom: 10 }}>
            <div className="row">
              <span style={{ fontSize: 28 }}>{scenarioId ? SCENARIO_MAP[scenarioId].whoEmoji : '👩‍🏫'}</span>
              <div>
                <b>{scenarioId ? SCENARIO_MAP[scenarioId].who : 'Profe Lupita'}</b>
                <div className="tiny muted">{scenarioId ? SCENARIO_MAP[scenarioId].setting : `${MODES.find((m) => m.id === mode)?.en} · ${IS_ARTIFACT ? 'Claude' : AI_MODELS.find((m) => m.id === settings.aiModel)?.label ?? settings.aiModel}`}</div>
              </div>
            </div>
            <div className="row">
              {(mode === 'chat' || mode === 'scenario') && (
                <button className={`btn sm ${showEn ? 'on' : ''}`} onClick={() => setShowEn((v) => !v)}>{showEn ? <Eye /> : <EyeOff />} English</button>
              )}
              {visible.length > 0 && <button className="btn icon sm" onClick={reset} aria-label="New conversation" title="New conversation"><Trash2 /></button>}
            </div>
          </div>

          <div className="chat" style={{ flex: 1, padding: '8px 0' }}>
            {visible.length === 0 && !streaming && (
              <div className="center" style={{ padding: '24px 8px' }}>
                <div className="emoji-xl float" style={{ margin: '0 auto 10px' }}><Bot style={{ width: 54, height: 54, color: 'var(--accent)' }} /></div>
                <div className="soft">
                  {mode === 'chat' && 'Write or speak in Spanish (or English if you’re stuck). Profe Lupita replies at your level and corrects your mistakes.'}
                  {mode === 'explain' && 'Ask any question about Spanish grammar, vocabulary, slang or Mexican culture.'}
                  {mode === 'correct' && 'Paste or write Spanish text and get a corrected, natural Mexican version with explanations.'}
                </div>
                <div className="row mt" style={{ justifyContent: 'center' }}>
                  {STARTERS[mode].map((s) => <button key={s} className="chip" onClick={() => send(s)}>{s}</button>)}
                </div>
              </div>
            )}
            {msgs.map((m, i) => {
              if (m.hidden) return null;
              if (m.role === 'user') return <div key={i} className="bubble me">{m.content}</div>;
              const isLast = i === msgs.length - 1;
              if (!m.content) return <div key={i} className="bubble them"><span className="typing"><i /><i /><i /></span></div>;
              if (mode === 'explain' || mode === 'correct') {
                return <div key={i} className="bubble them" style={{ whiteSpace: 'normal' }}><RichText text={m.content} /></div>;
              }
              const p = parseTutorReply(m.content);
              return (
                <div key={i} className="bubble them" style={{ whiteSpace: 'normal' }}>
                  <div className="es" style={{ fontSize: 17 }}>{streaming && isLast ? p.es : <TapText text={p.es} />}</div>
                  {p.en && showEn && <div className="en">{p.en}</div>}
                  {p.fix && <div className="fix"><b>✏️ </b><RichText text={p.fix} /></div>}
                  {!(streaming && isLast) && p.es && (
                    <div className="row" style={{ marginTop: 8 }}>
                      <SpeakButton text={p.es} size="xs" />
                      <SpeakButton text={p.es} size="xs" slow />
                      {p.en && <SaveButton es={p.es} en={p.en} source="Profe IA" size="xs" />}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <form className="stack sm" onSubmit={(e) => { e.preventDefault(); void send(input); }}>
            <div className="row nowrap" style={{ alignItems: 'flex-end' }}>
              <MicButton lang={mode === 'explain' ? 'en' : 'es'} onInterim={(t) => t && setInput(t)} onResult={(t) => setInput(t)} disabled={streaming} />
              <textarea
                ref={inputRef}
                className="textarea"
                style={{ minHeight: 48, height: 48, resize: 'none' }}
                placeholder={mode === 'explain' ? 'Ask a question…' : 'Escribe en español…'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(input); } }}
                aria-label="Message"
              />
              {streaming ? (
                <button type="button" className="btn icon bad" onClick={() => abort.current?.abort()} aria-label="Stop"><Square /></button>
              ) : (
                <button type="submit" className="btn icon primary" disabled={!input.trim()} aria-label="Send"><Send /></button>
              )}
            </div>
            {mode !== 'explain' && <AccentBar target={inputRef} />}
          </form>
          {lastAssistant?.role === 'assistant' && streaming && <div className="tiny muted mt">Profe Lupita está escribiendo…</div>}
        </div>
      )}
    </div>
  );
}

function ScenarioGrid({ onPick, ai }: { onPick: (id: string) => void; ai?: boolean }) {
  return (
    <div className="grid auto">
      {SCENARIOS.map((s) => (
        <button key={s.id} className="tile" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => onPick(s.id)}>
          <div className="row between"><div className="tile-icon">{s.emoji}</div><span className="chip">{s.level}</span></div>
          <div>
            <div className="tile-title">{s.title}<span className="bi-en">{s.titleEn}</span></div>
            <div className="tile-desc">{s.whoEmoji} {s.who} — {s.setting}</div>
          </div>
          <div className="row tiny muted">{ai ? <><Sparkles style={{ width: 14 }} /> Free-form with AI</> : <>🗣️ Speak or tap · offline</>} <ArrowRight style={{ width: 14 }} /></div>
        </button>
      ))}
    </div>
  );
}
