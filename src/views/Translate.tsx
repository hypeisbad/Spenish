import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftRight, Copy, Loader2, Share2, Sparkles, Star, Trash2, X, Repeat, ClipboardPaste, History, Wand2, Globe, WifiOff, Zap,
} from 'lucide-react';
import type { Route } from '../lib/router';
import { useStore } from '../lib/store';
import { translate, mexicanHints, PROVIDER_LABEL, type TranslateResult } from '../lib/translate';
import { detectLanguage, normalize, stripDiacritics } from '../lib/text';
import { SLANG } from '../data/slang';
import { toast, askConfirm } from '../lib/events';
import { IS_ARTIFACT, aiAvailable, useAiAvailable } from '../lib/host';
import { sfx } from '../lib/sound';
import { AccentBar, Bi, Flag, MicButton, PageHead, SaveButton, SpeakButton, Spice, TapText, say } from '../components/ui';

type Dir = 'auto' | 'en' | 'es';

function findSlang(text: string) {
  const hay = ' ' + stripDiacritics(normalize(text)) + ' ';
  return SLANG.filter((s) =>
    s.term.split(' / ').some((t) => {
      const k = stripDiacritics(normalize(t));
      return k.length > 2 && hay.includes(' ' + k + ' ');
    }),
  ).slice(0, 4);
}

export default function Translate({ route }: { route: Route }) {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const history = useStore((s) => s.history);
  const favorites = useStore((s) => s.favorites);
  const addHistory = useStore((s) => s.addHistory);
  const clearHistory = useStore((s) => s.clearHistory);
  const toggleFavorite = useStore((s) => s.toggleFavorite);

  const [text, setText] = useState(route.query.get('q') ?? '');
  const [dir, setDir] = useState<Dir>('auto');
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [back, setBack] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [backLoading, setBackLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interim, setInterim] = useState('');
  const [tab, setTab] = useState<'history' | 'favorites'>('history');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastRun = useRef('');

  const srcLang: 'es' | 'en' = dir === 'auto' ? (text.trim() ? detectLanguage(text) : 'en') : dir;
  const aiOn = useAiAvailable(settings.aiKey);
  const usingAi = aiOn && (settings.engine === 'ai' || settings.engine === 'auto');

  const run = useCallback(
    async (input = text, opts: { speakOut?: boolean } = {}) => {
      const clean = input.trim();
      if (!clean) return;
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      lastRun.current = clean + '|' + dir + '|' + settings.engine + '|' + settings.register;
      setLoading(true);
      setError(null);
      setBack(null);
      try {
        const r = await translate(clean, {
          from: dir,
          engine: settings.engine,
          aiKey: settings.aiKey,
          aiModel: settings.aiModel,
          register: settings.register,
          signal: ctrl.signal,
        });
        if (ctrl.signal.aborted) return;
        setResult(r);
        addHistory({ src: clean, out: r.text, from: r.from, provider: r.provider });
        if (opts.speakOut ?? settings.autoSpeak) void say(r.text, r.to);
      } catch (e) {
        if (ctrl.signal.aborted) return;
        setError(e instanceof Error ? e.message : 'Translation failed');
        setResult(null);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    },
    [text, dir, settings.engine, settings.aiKey, settings.aiModel, settings.register, settings.autoSpeak, addHistory],
  );

  // Initial ?q=
  useEffect(() => {
    const q = route.query.get('q');
    if (q) void run(q);
    return () => abortRef.current?.abort();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Live translate while typing (online engines only; AI waits for Enter to save tokens)
  useEffect(() => {
    if (usingAi || settings.engine === 'ai') return;
    const clean = text.trim();
    if (!clean || clean.length > 1500) return;
    const sig = clean + '|' + dir + '|' + settings.engine + '|' + settings.register;
    if (sig === lastRun.current) return;
    const t = setTimeout(() => void run(clean, { speakOut: false }), 750);
    return () => clearTimeout(t);
  }, [text, dir, settings.engine, settings.register, usingAi, run]);

  const swap = () => {
    if (result) {
      setText(result.text);
      setDir(result.to);
      setResult(null);
      setBack(null);
      setTimeout(() => void run(result.text), 0);
    } else {
      setDir(srcLang === 'es' ? 'en' : 'es');
    }
    sfx.flip();
  };

  const backTranslate = async () => {
    if (!result) return;
    setBackLoading(true);
    try {
      const r = await translate(result.text, { from: result.to, engine: settings.engine === 'ai' ? 'ai' : settings.engine, aiKey: settings.aiKey, aiModel: settings.aiModel });
      setBack(r.text);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Back-translation failed', '⚠️', 'error');
    } finally {
      setBackLoading(false);
    }
  };

  const copy = async (t: string) => {
    try {
      await navigator.clipboard.writeText(t);
      toast('Copiado al portapapeles', '📋', 'success');
    } catch {
      toast('Couldn’t copy — select the text manually.', '⚠️', 'error');
    }
  };

  const paste = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) setText(t);
    } catch {
      toast('Clipboard access was blocked by the browser.', '⚠️', 'error');
    }
  };

  const share = async () => {
    if (!result) return;
    const body = `${text.trim()}\n→ ${result.text}`;
    if (navigator.share && !IS_ARTIFACT) {
      try {
        await navigator.share({ text: body, title: 'Spenish' });
      } catch (e) {
        if (!(e instanceof DOMException && e.name === 'AbortError')) void copy(body);
      }
    } else void copy(body);
  };

  const spanishOut = result?.to === 'es' ? result.text : null;
  const spanishIn = result ? (result.from === 'es' ? text : result.text) : srcLang === 'es' ? text : '';
  const hints = useMemo(() => (spanishOut ? mexicanHints(spanishOut) : []), [spanishOut]);
  const slang = useMemo(() => findSlang(spanishIn), [spanishIn]);
  const isFav = result ? !!favorites[(result.from === 'es' ? text.trim() : result.text).toLowerCase().trim()] : false;
  const favList = Object.values(favorites).sort((a, b) => b.ts - a.ts);

  const EngineIcon = { auto: Zap, ai: Sparkles, online: Globe, offline: WifiOff }[settings.engine];

  return (
    <div className="page">
      <PageHead
        eyebrow="Traductor · Translator"
        es="Traduce como chilango"
        en="Translate like a local"
        desc="English ↔ Mexican Spanish with voice, auto-detect, back-translation checks, slang spotting and Mexico-specific word hints."
        right={
          <div className="seg" role="radiogroup" aria-label="Translation engine">
            {(['auto', 'ai', 'online', 'offline'] as const).map((e) => (
              <button
                key={e}
                role="radio"
                aria-checked={settings.engine === e}
                className={settings.engine === e ? 'on' : ''}
                onClick={() => {
                  if (e === 'ai' && !aiAvailable(settings.aiKey)) {
                    toast(IS_ARTIFACT ? 'Claude isn’t available in this view.' : 'Add your Claude API key in Settings → AI to use AI translation.', '🔑', 'info');
                  }
                  setSettings({ engine: e });
                }}
              >
                {e === 'auto' ? <><Zap /> Auto</> : e === 'ai' ? <><Sparkles /> IA</> : e === 'online' ? <><Globe /> Online</> : <><WifiOff /> Offline</>}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid cols-2">
        {/* ---- Source ---- */}
        <div className="card">
          <div className="row between">
            <div className="seg" role="radiogroup" aria-label="Source language">
              <button className={dir === 'auto' ? 'on' : ''} onClick={() => setDir('auto')} role="radio" aria-checked={dir === 'auto'}>
                Detectar{dir === 'auto' && text.trim() ? ` · ${srcLang === 'es' ? '🇲🇽' : '🇺🇸'}` : ''}
              </button>
              <button className={dir === 'en' ? 'on' : ''} onClick={() => setDir('en')} role="radio" aria-checked={dir === 'en'}>🇺🇸 English</button>
              <button className={dir === 'es' ? 'on' : ''} onClick={() => setDir('es')} role="radio" aria-checked={dir === 'es'}>🇲🇽 Español</button>
            </div>
            <button className="btn icon sm" onClick={swap} aria-label="Swap languages" title="Swap"><ArrowLeftRight /></button>
          </div>
          <textarea
            ref={inputRef}
            className="textarea mt"
            style={{ minHeight: 170, fontSize: 19 }}
            placeholder={srcLang === 'es' ? 'Escribe algo en español…' : 'Type something in English… (or in Spanish!)'}
            value={interim || text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
                e.preventDefault();
                void run();
              }
            }}
            aria-label="Text to translate"
            maxLength={5000}
          />
          <div className="mt"><AccentBar target={inputRef} /></div>
          <div className="row between mt">
            <div className="row">
              {(dir === 'auto' ? (['en', 'es'] as const) : [dir]).map((l) => (
                <MicButton
                  key={l}
                  lang={l}
                  label={l === 'es' ? '🇲🇽 Hablar' : '🇺🇸 Speak'}
                  size="sm"
                  onInterim={(t) => setInterim(t)}
                  onResult={(t) => {
                    setInterim('');
                    setText(t);
                    if (dir === 'auto') setDir(l);
                    void run(t);
                  }}
                />
              ))}
              {text && <SpeakButton text={text} lang={srcLang} />}
              {!IS_ARTIFACT && <button className="btn icon sm ghost" onClick={paste} aria-label="Paste" title="Paste"><ClipboardPaste /></button>}
              {text && <button className="btn icon sm ghost" onClick={() => { setText(''); setResult(null); setError(null); setBack(null); inputRef.current?.focus(); }} aria-label="Clear" title="Clear"><X /></button>}
            </div>
            <div className="row">
              <span className="tiny muted">{text.length}/5000</span>
              <button className="btn primary" onClick={() => run()} disabled={!text.trim() || loading}>
                {loading ? <Loader2 className="spin" /> : <EngineIcon />} Traducir
              </button>
            </div>
          </div>
          {(usingAi || settings.engine === 'ai') && (
            <div className="row mt">
              <span className="tiny muted">Registro:</span>
              <div className="seg">
                {(['neutral', 'casual', 'slang', 'formal'] as const).map((r) => (
                  <button key={r} className={settings.register === r ? 'on' : ''} onClick={() => setSettings({ register: r })}>
                    {{ neutral: 'Neutral', casual: 'Casual (tú)', slang: 'Slang 🌶️', formal: 'Formal (usted)' }[r]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ---- Output ---- */}
        <div className="card" style={{ minHeight: 280 }} aria-live="polite">
          <div className="row between">
            <div className="row">
              <span className="chip">{result ? <Flag lang={result.to} /> : null} {result ? (result.to === 'es' ? 'Español (México)' : 'English') : srcLang === 'es' ? '🇺🇸 English' : '🇲🇽 Español (México)'}</span>
              {result && <span className={`chip ${result.provider === 'claude' ? 'accent' : result.provider === 'offline' ? 'warn' : ''}`}>{result.provider === 'claude' && <Sparkles />}{PROVIDER_LABEL[result.provider]}{result.approximate ? ' · approx.' : ''}</span>}
            </div>
            {loading && <Loader2 className="spin" style={{ width: 18, color: 'var(--muted)' }} />}
          </div>

          {!result && !error && !loading && (
            <div className="empty" style={{ padding: '36px 8px' }}>
              <div className="emoji-lg float" style={{ margin: '0 auto 10px' }}>🌮</div>
              <div className="soft">Your translation appears here.</div>
              <div className="tiny muted mt">Tip: press <span className="kbd">Enter</span> to translate · <span className="kbd">Shift+Enter</span> for a new line</div>
            </div>
          )}
          {loading && !result && (
            <div className="stack mt">
              <div className="shimmer skeleton-line" style={{ width: '90%' }} />
              <div className="shimmer skeleton-line" style={{ width: '70%' }} />
            </div>
          )}
          {error && <div className="callout warn mt">⚠️ {error}</div>}

          {result && (
            <div className="stack mt" style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .2s' }}>
              <div style={{ fontSize: 24, lineHeight: 1.4 }} className={result.to === 'es' ? 'es' : ''}>
                {result.to === 'es' ? <TapText text={result.text} /> : result.text}
              </div>
              {result.literal && result.literal !== result.text && (
                <div className="small muted"><b>Literal:</b> {result.literal}</div>
              )}
              <div className="row">
                <SpeakButton text={result.text} lang={result.to} />
                <SpeakButton text={result.text} lang={result.to} slow />
                <button className="btn icon sm" onClick={() => copy(result.text)} aria-label="Copy" title="Copy"><Copy /></button>
                <button
                  className={`btn icon sm ${isFav ? 'on' : ''}`}
                  aria-label="Favorite"
                  title="Favorite"
                  onClick={() => {
                    const es = result.from === 'es' ? text.trim() : result.text;
                    const en = result.from === 'es' ? result.text : text.trim();
                    const added = toggleFavorite(es, en);
                    toast(added ? 'Saved to favorites' : 'Removed from favorites', '⭐');
                  }}
                >
                  <Star fill={isFav ? 'currentColor' : 'none'} />
                </button>
                <SaveButton es={result.from === 'es' ? text.trim() : result.text} en={result.from === 'es' ? result.text : text.trim()} source="Traductor" />
                <button className="btn icon sm" onClick={share} aria-label="Share" title="Share"><Share2 /></button>
                <button className="btn sm" onClick={backTranslate} disabled={backLoading} title="Translate it back to check the meaning">
                  {backLoading ? <Loader2 className="spin" /> : <Repeat />} Verificar
                </button>
              </div>
              {back !== null && (
                <div className="callout">
                  <Repeat style={{ width: 18, height: 18, flex: 'none' }} />
                  <div><div className="tiny muted">Back-translation (meaning check)</div><b>{back}</b></div>
                </div>
              )}
              {result.alternatives && result.alternatives.length > 0 && (
                <div>
                  <div className="tiny muted" style={{ marginBottom: 6 }}>Alternativas</div>
                  <div className="row">
                    {result.alternatives.map((a) => (
                      <button key={a} className="chip" onClick={() => say(a, result.to)} title="Listen">🔊 {a}</button>
                    ))}
                  </div>
                </div>
              )}
              {result.notes && (
                <div className="callout mx"><Wand2 style={{ width: 18, height: 18, flex: 'none' }} /><div><b>Nota de Profe Lupita:</b> {result.notes}{result.formality ? <span className="chip" style={{ marginLeft: 8 }}>{result.formality}</span> : null}</div></div>
              )}
              {result.dict && result.dict.length > 0 && (
                <div className="stack sm">
                  {result.dict.slice(0, 3).map((d) => (
                    <div key={d.pos} className="small"><span className="chip" style={{ marginRight: 6 }}>{d.pos || 'other'}</span>{d.terms.slice(0, 6).join(', ')}</div>
                  ))}
                </div>
              )}
              {hints.length > 0 && (
                <div className="callout mx">
                  <span>🇲🇽</span>
                  <div>
                    <b>En México se dice:</b>{' '}
                    {hints.map((h, i) => (
                      <span key={h.word}>{i > 0 && ' · '}<s style={{ opacity: 0.6 }}>{h.word}</s> → <b>{h.mx}</b></span>
                    ))}
                    <div className="tiny" style={{ opacity: 0.8 }}>The translation used Spain-style words; Mexicans would say the alternatives.</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {slang.length > 0 && (
            <div className="stack sm mt">
              <div className="tiny muted">🌶️ Mexican slang detected</div>
              {slang.map((s) => (
                <div key={s.id} className="card tight flat" style={{ padding: 12 }}>
                  <div className="row between nowrap">
                    <b className="es">{s.term}</b>
                    <Spice level={s.spice} />
                  </div>
                  <div className="small soft">{s.meaning}</div>
                  {s.note && <div className="tiny muted">{s.note}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---- History / favorites ---- */}
      <div className="card mt-lg">
        <div className="row between">
          <div className="seg">
            <button className={tab === 'history' ? 'on' : ''} onClick={() => setTab('history')}><History /> Historial ({history.length})</button>
            <button className={tab === 'favorites' ? 'on' : ''} onClick={() => setTab('favorites')}><Star /> Favoritos ({favList.length})</button>
          </div>
          {tab === 'history' && history.length > 0 && (
            <button className="btn sm ghost" onClick={async () => { if (await askConfirm('¿Borrar el historial?', { detail: 'Clear all translation history on this device.', ok: 'Borrar', danger: true })) clearHistory(); }}><Trash2 /> Borrar</button>
          )}
        </div>
        <div className="list mt">
          {tab === 'history' &&
            (history.length ? (
              history.slice(0, 30).map((h) => (
                <div key={h.id} className="list-item" style={{ cursor: 'pointer' }} onClick={() => { setText(h.src); setDir(h.from); void run(h.src); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  <Flag lang={h.from} />
                  <div className="grow">
                    <div className="small" style={{ fontWeight: 600 }}>{h.src}</div>
                    <div className="small muted">{h.out}</div>
                  </div>
                  <SpeakButton text={h.from === 'es' ? h.src : h.out} size="xs" />
                </div>
              ))
            ) : (
              <div className="muted small">Your translations will be saved here.</div>
            ))}
          {tab === 'favorites' &&
            (favList.length ? (
              favList.map((f) => (
                <div key={f.es} className="list-item">
                  <span>⭐</span>
                  <div className="grow">
                    <div className="es" style={{ fontWeight: 600 }}>{f.es}</div>
                    <div className="small muted">{f.en}</div>
                  </div>
                  <SpeakButton text={f.es} size="xs" />
                  <SaveButton es={f.es} en={f.en} source="Favoritos" size="xs" />
                </div>
              ))
            ) : (
              <div className="muted small">Tap ⭐ on a translation to keep it here.</div>
            ))}
        </div>
      </div>
      <p className="tiny muted center mt">
        <Bi es="Las traducciones automáticas pueden tener errores — usa “Verificar” para comprobar el sentido." en="Machine translations can be imperfect — use “Verificar” to double-check meaning." />
      </p>
    </div>
  );
}
