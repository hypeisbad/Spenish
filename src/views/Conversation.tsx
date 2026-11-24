import { useEffect, useRef, useState } from 'react';
import { Loader2, RotateCcw, Send, Trash2, Volume2, VolumeX, FlipVertical2, Columns2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { translate } from '../lib/translate';
import { uid } from '../lib/text';
import { toast } from '../lib/events';
import { sttSupported } from '../lib/speech';
import { MicButton, SpeakButton, say } from '../components/ui';

interface Turn {
  id: string;
  speaker: 'es' | 'en';
  es: string;
  en: string;
  pending?: boolean;
}

function Panel({
  lang, turns, onSend, busy, flipped, interim, setInterim,
}: {
  lang: 'es' | 'en';
  turns: Turn[];
  onSend: (text: string, lang: 'es' | 'en') => void;
  busy: boolean;
  flipped: boolean;
  interim: string;
  setInterim: (s: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, interim]);
  const isEs = lang === 'es';
  return (
    <section
      className="card"
      style={{
        display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, padding: 16,
        transform: flipped ? 'rotate(180deg)' : undefined,
        background: isEs ? 'linear-gradient(160deg, rgba(25,211,162,.10), rgba(76,201,240,.04)), var(--panel)' : 'linear-gradient(160deg, rgba(var(--accent-rgb),.12), rgba(255,166,48,.05)), var(--panel)',
      }}
      aria-label={isEs ? 'Spanish speaker' : 'English speaker'}
    >
      <div className="row between">
        <div className="row">
          <span style={{ fontSize: 22 }}>{isEs ? '🇲🇽' : '🇺🇸'}</span>
          <b>{isEs ? 'Español' : 'English'}</b>
          <span className="tiny muted">{isEs ? 'Toca el micrófono y habla' : 'Tap the mic and speak'}</span>
        </div>
      </div>
      <div ref={listRef} className="chat" style={{ flex: 1, overflowY: 'auto', padding: '12px 2px', minHeight: 90 }}>
        {turns.length === 0 && !interim && (
          <div className="muted small center" style={{ margin: 'auto' }}>
            {isEs ? 'Aquí aparecerá la conversación traducida.' : 'The translated conversation appears here.'}
          </div>
        )}
        {turns.map((t) => {
          const mine = t.speaker === lang;
          const text = isEs ? t.es : t.en;
          return (
            <div key={t.id} className={`bubble ${mine ? 'me' : 'them'}`} style={{ fontSize: mine ? 16 : 20 }}>
              {t.pending && !text ? <span className="typing"><i /><i /><i /></span> : <span className={isEs ? 'es' : ''}>{text}</span>}
              {!mine && text && (
                <div style={{ marginTop: 6 }}>
                  <SpeakButton text={text} lang={lang} size="xs" />
                </div>
              )}
            </div>
          );
        })}
        {interim && <div className="bubble me" style={{ opacity: 0.7 }}>{interim}…</div>}
      </div>
      <form
        className="row nowrap"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) {
            onSend(draft.trim(), lang);
            setDraft('');
          }
        }}
      >
        <MicButton
          lang={lang}
          size="lg"
          disabled={busy}
          onInterim={setInterim}
          onResult={(t) => {
            setInterim('');
            onSend(t, lang);
          }}
        />
        <input
          className="input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={isEs ? 'O escribe aquí…' : 'Or type here…'}
          aria-label={isEs ? 'Escribe en español' : 'Type in English'}
        />
        <button className="btn icon" type="submit" aria-label="Send" disabled={!draft.trim() || busy}>
          {busy ? <Loader2 className="spin" /> : <Send />}
        </button>
      </form>
    </section>
  );
}

export default function Conversation() {
  const settings = useStore((s) => s.settings);
  const bump = useStore((s) => s.bump);
  const addXp = useStore((s) => s.addXp);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [faceToFace, setFaceToFace] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [interimEs, setInterimEs] = useState('');
  const [interimEn, setInterimEn] = useState('');
  const counted = useRef(false);

  const send = async (text: string, lang: 'es' | 'en') => {
    const id = uid();
    setTurns((t) => [...t, { id, speaker: lang, es: lang === 'es' ? text : '', en: lang === 'en' ? text : '', pending: true }]);
    setBusy(true);
    try {
      const r = await translate(text, {
        from: lang,
        engine: settings.engine,
        aiKey: settings.aiKey,
        aiModel: settings.aiModel,
        register: settings.register,
      });
      setTurns((t) => t.map((x) => (x.id === id ? { ...x, [lang === 'es' ? 'en' : 'es']: r.text, pending: false } : x)));
      if (autoPlay) void say(r.text, r.to);
      if (!counted.current) {
        counted.current = true;
        bump('conversations');
      }
      addXp(2);
    } catch (e) {
      setTurns((t) => t.filter((x) => x.id !== id));
      toast(e instanceof Error ? e.message : 'Translation failed', '⚠️', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page wide" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 90px)', minHeight: 560 }}>
      <div className="row between" style={{ marginBottom: 12 }}>
        <div>
          <div className="eyebrow">Intérprete en vivo · Live interpreter</div>
          <div className="h2">Conversación cara a cara</div>
        </div>
        <div className="row">
          <button className={`btn sm ${faceToFace ? 'on' : ''}`} onClick={() => setFaceToFace((f) => !f)} title="Flip the top half for the person across the table">
            {faceToFace ? <FlipVertical2 /> : <Columns2 />} {faceToFace ? 'Cara a cara' : 'Lado a lado'}
          </button>
          <button className={`btn icon sm ${autoPlay ? 'on' : ''}`} onClick={() => setAutoPlay((a) => !a)} aria-label="Auto-play translations" title="Speak translations aloud">
            {autoPlay ? <Volume2 /> : <VolumeX />}
          </button>
          {turns.length > 0 && (
            <>
              <button className="btn icon sm" onClick={() => { const last = turns[turns.length - 1]; if (last) void say(last.speaker === 'en' ? last.es : last.en, last.speaker === 'en' ? 'es' : 'en'); }} aria-label="Repeat last" title="Repeat last translation"><RotateCcw /></button>
              <button className="btn icon sm" onClick={() => setTurns([])} aria-label="Clear conversation" title="Clear"><Trash2 /></button>
            </>
          )}
        </div>
      </div>
      {!sttSupported() && (
        <div className="callout warn" style={{ marginBottom: 12 }}>
          🎙️ Voice input isn’t supported in this browser — you can still type on each side. Chrome, Edge and Safari support speech.
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: faceToFace ? 'column' : 'row', gap: 12, flex: 1, minHeight: 0 }} className="convo">
        <Panel lang="es" turns={turns} onSend={send} busy={busy} flipped={faceToFace} interim={interimEs} setInterim={setInterimEs} />
        <Panel lang="en" turns={turns} onSend={send} busy={busy} flipped={false} interim={interimEn} setInterim={setInterimEn} />
      </div>
      <style>{`@media (max-width: 760px) { .convo { flex-direction: column !important; } }`}</style>
    </div>
  );
}
