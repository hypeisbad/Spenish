import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Download, Eye, EyeOff, KeyRound, Loader2, Upload, Trash2, Volume2, Sparkles, Smartphone, Check } from 'lucide-react';
import { useStore } from '../lib/store';
import { loadVoices, spanishVoices, ttsSupported } from '../lib/speech';
import { AI_MODELS, streamChat } from '../lib/ai';
import { toast, askConfirm } from '../lib/events';
import { IS_ARTIFACT, getHost, useHost } from '../lib/host';
import { PageHead, Switch, say } from '../components/ui';

function Row({ title, desc, children }: { title: string; desc?: ReactNode; children: ReactNode }) {
  return (
    <div className="list-item" style={{ gap: 16, flexWrap: 'wrap' }}>
      <div className="grow" style={{ minWidth: 200 }}>
        <div style={{ fontWeight: 600 }}>{title}</div>
        {desc && <div className="small muted">{desc}</div>}
      </div>
      <div className="row">{children}</div>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export default function Settings() {
  const s = useStore((x) => x.settings);
  const set = useStore((x) => x.setSettings);
  const exportData = useStore((x) => x.exportData);
  const importData = useStore((x) => x.importData);
  const resetAll = useStore((x) => x.resetAll);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [keyDraft, setKeyDraft] = useState(s.aiKey);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [install, setInstall] = useState<BeforeInstallPromptEvent | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const host = useHost();

  useEffect(() => {
    void loadVoices().then(() => setVoices(spanishVoices()));
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstall(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const testKey = async () => {
    const key = keyDraft.trim();
    if (!key) return;
    setTesting(true);
    try {
      let reply = '';
      await streamChat({
        apiKey: key,
        model: s.aiModel,
        system: 'Reply with one short, friendly sentence in Mexican Spanish.',
        messages: [{ role: 'user', content: 'Saluda en una frase corta.' }],
        onText: (d) => (reply += d),
      });
      set({ aiKey: key });
      toast(`¡Conectado! ${reply.trim().slice(0, 80)}`, '✨', 'success');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Key test failed', '⚠️', 'error');
    } finally {
      setTesting(false);
    }
  };

  const download = async () => {
    if (IS_ARTIFACT) {
      const dl = getHost().downloads;
      if (!dl) {
        toast('Saving files isn’t available in this view.', '⚠️', 'error');
        return;
      }
      try {
        const r = await dl.save({ filename: `spenish-backup-${new Date().toISOString().slice(0, 10)}.json`, data: exportData() });
        if (r.status === 'saved') toast('Backup saved', '💾', 'success');
      } catch (e) {
        if ((e as { code?: string })?.code !== 'cancelled') toast('The backup wasn’t saved.', '⚠️', 'error');
      }
      return;
    }
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spenish-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Backup downloaded', '💾', 'success');
  };

  const onImport = async (f: File | undefined) => {
    if (!f) return;
    try {
      importData(await f.text());
      toast('Progress restored', '✅', 'success');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Import failed', '⚠️', 'error');
    }
  };

  const ACCENTS = [
    { id: 'rosa', es: 'Rosa mexicano', c: 'linear-gradient(135deg,#ff2e93,#ffa630)' },
    { id: 'cempasuchil', es: 'Cempasúchil', c: 'linear-gradient(135deg,#ff9f1c,#ff2e93)' },
    { id: 'jade', es: 'Jade', c: 'linear-gradient(135deg,#19d3a2,#4cc9f0)' },
    { id: 'talavera', es: 'Talavera', c: 'linear-gradient(135deg,#4c8dff,#4cc9f0)' },
  ] as const;

  return (
    <div className="page narrow">
      <PageHead eyebrow="Ajustes · Settings" es="Hazlo tuyo" en="Make it yours" />

      <section className="card">
        <div className="card-title">👤 Perfil</div>
        <div className="list">
          <Row title="Nombre" desc="Profe Lupita and the home screen will greet you by name.">
            <input className="input" style={{ width: 200 }} value={s.name} onChange={(e) => set({ name: e.target.value })} placeholder="Tu nombre" aria-label="Name" />
          </Row>
          <Row title="Meta diaria" desc="XP per day to keep your streak glowing.">
            <div className="seg">{[20, 50, 100, 200].map((g) => <button key={g} className={s.dailyGoal === g ? 'on' : ''} onClick={() => set({ dailyGoal: g })}>{g}</button>)}</div>
          </Row>
        </div>
      </section>

      <section className="card mt">
        <div className="card-title"><Volume2 /> Voz</div>
        <div className="list">
          <Row title="Voz en español" desc={ttsSupported() ? (voices.length ? `${voices.length} Spanish voices on this device. Mexican (es-MX) voices are listed first.` : 'No Spanish voice found — your browser will use its default.') : 'Text-to-speech is not supported in this browser.'}>
            <select className="select" style={{ maxWidth: 260 }} value={s.voiceURI ?? ''} onChange={(e) => set({ voiceURI: e.target.value || null })} aria-label="Spanish voice">
              <option value="">Automática (mejor es-MX)</option>
              {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} · {v.lang}</option>)}
            </select>
            <button className="btn icon sm" onClick={() => say('¡Hola! ¿Qué onda? Bienvenido a Spenish.')} aria-label="Test voice"><Volume2 /></button>
          </Row>
          <Row title="Velocidad" desc={`${Math.round(s.rate * 100)}% — slower helps beginners.`}>
            <input type="range" min={0.6} max={1.3} step={0.05} value={s.rate} onChange={(e) => set({ rate: Number(e.target.value) })} style={{ width: 180 }} aria-label="Speech rate" />
          </Row>
          <Row title="Pronunciar automáticamente" desc="Speak new words and translations aloud.">
            <Switch checked={s.autoSpeak} onChange={(v) => set({ autoSpeak: v })} label="Auto speak" />
          </Row>
        </div>
      </section>

      {IS_ARTIFACT ? (
      <section className="card mt">
        <div className="card-title"><Sparkles /> Inteligencia artificial (Claude)</div>
        <p className="small soft" style={{ marginTop: 0 }}>
          In this preview, Claude is built in: Profe Lupita, AI translations and photo reading use your own Claude account, with no API key.
          The first time, you’ll be asked to allow it.
        </p>
        <div className="row">{host.sample ? <span className="chip ok"><Check /> Claude disponible</span> : <span className="chip warn">{host.ready ? 'Claude isn’t available in this view' : 'Conectando…'}</span>}</div>
        <div className="list mt">
          <Row title="Motor de traducción" desc="Auto uses Claude here, with the offline dictionary as a fallback.">
            <div className="seg">
              {(['auto', 'ai', 'offline'] as const).map((e) => <button key={e} className={s.engine === e ? 'on' : ''} onClick={() => set({ engine: e })}>{{ auto: 'Auto', ai: 'IA', offline: 'Offline' }[e]}</button>)}
            </div>
          </Row>
        </div>
      </section>
      ) : (
      <section className="card mt">
        <div className="card-title"><Sparkles /> Inteligencia artificial (Claude)</div>
        <p className="small soft" style={{ marginTop: 0 }}>
          Optional. Unlocks Profe Lupita (AI tutor &amp; free role-play), AI translations with nuance and slang control, and photo reading.
          Your key stays in this browser’s storage and is sent only to api.anthropic.com. Usage is billed to your Anthropic account.
        </p>
        <div className="row nowrap">
          <div className="row nowrap grow" style={{ position: 'relative' }}>
            <KeyRound style={{ position: 'absolute', left: 14, width: 18, color: 'var(--muted)' }} />
            <input className="input" style={{ paddingLeft: 42 }} type={showKey ? 'text' : 'password'} value={keyDraft} onChange={(e) => setKeyDraft(e.target.value)} placeholder="sk-ant-…" aria-label="Claude API key" autoComplete="off" />
          </div>
          <button className="btn icon" onClick={() => setShowKey((v) => !v)} aria-label={showKey ? 'Hide key' : 'Show key'}>{showKey ? <EyeOff /> : <Eye />}</button>
        </div>
        <div className="row mt">
          <button className="btn primary sm" onClick={testKey} disabled={!keyDraft.trim() || testing}>{testing ? <Loader2 className="spin" /> : <Check />} Guardar y probar</button>
          {s.aiKey && <button className="btn sm" onClick={() => { set({ aiKey: '' }); setKeyDraft(''); toast('API key removed', '🗑️'); }}><Trash2 /> Quitar</button>}
          {s.aiKey && <span className="chip ok"><Check /> Activa</span>}
          <a className="small" href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{ marginLeft: 'auto' }}>Get a key →</a>
        </div>
        <div className="list mt">
          <Row title="Modelo" desc="Opus is the smartest; Haiku is fastest and cheapest.">
            <select className="select" value={s.aiModel} onChange={(e) => set({ aiModel: e.target.value })} aria-label="Model">
              {AI_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label} — {m.hint}</option>)}
            </select>
          </Row>
          <Row title="Motor de traducción" desc="Auto uses Claude when a key is set, otherwise Google → MyMemory (es-MX) → offline dictionary.">
            <div className="seg">
              {(['auto', 'ai', 'online', 'offline'] as const).map((e) => <button key={e} className={s.engine === e ? 'on' : ''} onClick={() => set({ engine: e })}>{{ auto: 'Auto', ai: 'IA', online: 'Online', offline: 'Offline' }[e]}</button>)}
            </div>
          </Row>
        </div>
      </section>
      )}

      <section className="card mt">
        <div className="card-title">🎨 Apariencia y aprendizaje</div>
        <div className="list">
          <Row title="Color de acento">
            {ACCENTS.map((a) => (
              <button key={a.id} onClick={() => set({ accent: a.id })} aria-label={a.es} title={a.es} style={{ width: 34, height: 34, borderRadius: 12, border: s.accent === a.id ? '2px solid #fff' : '2px solid transparent', background: a.c, boxShadow: s.accent === a.id ? '0 0 16px rgba(255,255,255,.35)' : 'none' }} />
            ))}
          </Row>
          <Row title="Modo inmersión" desc="Hide English helper labels across the app — Spanish only.">
            <Switch checked={s.immersion} onChange={(v) => set({ immersion: v })} label="Immersion mode" />
          </Row>
          <Row title="Mostrar “vosotros”" desc="Spain-only form. Mexico always uses ustedes.">
            <Switch checked={s.showVosotros} onChange={(v) => set({ showVosotros: v })} label="Show vosotros" />
          </Row>
          <Row title="Nivel de picante del slang" desc="🌶️🌶️🌶️ shows vulgar slang (for recognition).">
            <div className="seg">{([1, 2, 3] as const).map((n) => <button key={n} className={s.spiceMax === n ? 'on' : ''} onClick={() => set({ spiceMax: n })}>{'🌶️'.repeat(n)}</button>)}</div>
          </Row>
          <Row title="Efectos de sonido">
            <Switch checked={s.sfx} onChange={(v) => set({ sfx: v })} label="Sound effects" />
          </Row>
          <Row title="Vibración" desc="Haptic feedback on supported phones.">
            <Switch checked={s.haptics} onChange={(v) => set({ haptics: v })} label="Haptics" />
          </Row>
          <Row title="Reducir animaciones">
            <Switch checked={s.reduceMotion} onChange={(v) => set({ reduceMotion: v })} label="Reduce motion" />
          </Row>
        </div>
      </section>

      <section className="card mt">
        <div className="card-title">💾 Datos</div>
        <p className="small soft" style={{ marginTop: 0 }}>Everything is stored locally on this device. Back it up or move it to another device.</p>
        <div className="row">
          <button className="btn sm" onClick={download}><Download /> Exportar progreso</button>
          <button className="btn sm" onClick={() => fileRef.current?.click()}><Upload /> Importar</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => onImport(e.target.files?.[0])} />
          {install && <button className="btn sm primary" onClick={async () => { await install.prompt(); setInstall(null); }}><Smartphone /> Instalar app</button>}
          <button className="btn sm bad" style={{ marginLeft: 'auto' }} onClick={async () => { if (await askConfirm('¿Reiniciar todo?', { detail: 'This erases all progress, flashcards and history on this device. It cannot be undone.', ok: 'Reiniciar', danger: true })) { resetAll(); toast('Progress reset', '🧹'); } }}><Trash2 /> Reiniciar todo</button>
        </div>
        {!install && !IS_ARTIFACT && <div className="tiny muted mt">📱 Install: on iPhone tap Share → “Add to Home Screen”; on Android/desktop Chrome use the install icon in the address bar.</div>}
      </section>

      <section className="card mt">
        <div className="card-title">⌨️ Atajos</div>
        <div className="list small">
          <Row title="Buscar / traducir desde cualquier lugar"><span className="kbd">⌘ K</span><span className="kbd">Ctrl K</span><span className="kbd">/</span></Row>
          <Row title="Responder en ejercicios"><span className="kbd">1</span><span className="kbd">2</span><span className="kbd">3</span><span className="kbd">4</span><span className="kbd">Enter</span></Row>
          <Row title="Voltear tarjeta / calificar"><span className="kbd">Space</span><span className="kbd">1–4</span></Row>
        </div>
      </section>
      <p className="tiny muted center mt">Spenish v1.0 · Hecho con 🌮 y mucho cariño</p>
    </div>
  );
}
