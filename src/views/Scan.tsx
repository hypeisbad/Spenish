import { useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, Sparkles, ScanText, KeyRound } from 'lucide-react';
import { useStore } from '../lib/store';
import { aiReadImage, type VisionResult } from '../lib/ai';
import { translate } from '../lib/translate';
import { toast } from '../lib/events';
import { PageHead, SaveButton, SpeakButton } from '../components/ui';

async function downscale(file: File, max = 1568): Promise<{ dataUrl: string; base64: string }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error('Could not read that image.'));
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');
    ctx.drawImage(img, 0, 0, w, h);
    const dataUrl = c.toDataURL('image/jpeg', 0.86);
    return { dataUrl, base64: dataUrl.split(',')[1] };
  } finally {
    URL.revokeObjectURL(url);
  }
}

type TesseractModule = { recognize: (img: string, langs: string, opts?: { logger?: (m: { status: string; progress: number }) => void }) => Promise<{ data: { text: string } }> };

export default function Scan() {
  const settings = useStore((s) => s.settings);
  const addXp = useStore((s) => s.addXp);
  const [img, setImg] = useState<{ dataUrl: string; base64: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [vision, setVision] = useState<VisionResult | null>(null);
  const [ocr, setOcr] = useState<{ text: string; translation: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const hasKey = !!settings.aiKey;

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setVision(null);
    setOcr(null);
    try {
      const d = await downscale(f);
      setImg(d);
      void process(d);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not load image', '⚠️', 'error');
    }
  };

  const process = async (d: { dataUrl: string; base64: string }, forceOcr = false) => {
    setBusy(true);
    try {
      if (hasKey && !forceOcr) {
        setProgress('Profe Lupita está leyendo la imagen…');
        const r = await aiReadImage({ apiKey: settings.aiKey, model: settings.aiModel, base64: d.base64, mediaType: 'image/jpeg' });
        setVision(r);
      } else {
        setProgress('Cargando OCR en el dispositivo…');
        const url = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.esm.min.js';
        const mod = (await import(/* @vite-ignore */ url)) as { default: TesseractModule };
        const res = await mod.default.recognize(d.dataUrl, 'spa+eng', {
          logger: (m) => setProgress(`${m.status} ${Math.round((m.progress ?? 0) * 100)}%`),
        });
        const text = res.data.text.replace(/\n{2,}/g, '\n').trim();
        if (!text) throw new Error('No text found in the image. Try a sharper, closer photo.');
        setProgress('Traduciendo…');
        const tr = await translate(text, { from: 'auto', engine: settings.engine === 'ai' ? 'online' : settings.engine, aiKey: settings.aiKey, aiModel: settings.aiModel });
        setOcr({ text, translation: tr.text });
      }
      addXp(5);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Scanning failed', '⚠️', 'error');
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

  return (
    <div className="page">
      <PageHead
        eyebrow="Escáner · Scan & translate"
        es="Lee menús y letreros"
        en="Read menus & signs"
        desc="Snap a taquería menu, a street sign or a product label. With an AI key, Claude reads and explains it (even unfamiliar dishes). Without one, on-device OCR extracts the text and translates it."
      />
      <div className="grid cols-2">
        <div className="card">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          {img ? (
            <img src={img.dataUrl} alt="Your photo" style={{ width: '100%', borderRadius: 16, maxHeight: 420, objectFit: 'contain', background: '#000' }} />
          ) : (
            <button
              className="empty"
              style={{ width: '100%', border: '2px dashed var(--line-2)', borderRadius: 18, background: 'transparent', cursor: 'pointer' }}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void onFile(e.dataTransfer.files?.[0]);
              }}
            >
              <div className="emoji-xl float" style={{ margin: '0 auto 12px' }}>📸</div>
              <div className="h3" style={{ color: 'var(--text)' }}>Drop a photo or tap to choose</div>
              <div className="small">JPG, PNG or WebP</div>
            </button>
          )}
          <div className="row mt">
            <button className="btn primary" onClick={() => camRef.current?.click()}><Camera /> Tomar foto</button>
            <button className="btn" onClick={() => fileRef.current?.click()}><ImagePlus /> Elegir imagen</button>
            {img && hasKey && <button className="btn sm ghost" disabled={busy} onClick={() => process(img, true)}><ScanText /> Use on-device OCR</button>}
          </div>
          <div className={`callout mt ${hasKey ? 'mx' : ''}`}>
            {hasKey ? <Sparkles style={{ width: 18, flex: 'none' }} /> : <KeyRound style={{ width: 18, flex: 'none' }} />}
            <span className="small">
              {hasKey ? 'Using Claude Vision — best for menus, handwriting and context.' : <>On-device OCR mode. <a href="#/settings">Add a Claude API key</a> for smarter reading with dish explanations.</>}
            </span>
          </div>
        </div>
        <div className="card" aria-live="polite">
          {busy && (
            <div className="center" style={{ padding: 40 }}>
              <Loader2 className="spin" style={{ width: 36, height: 36, margin: '0 auto', color: 'var(--accent)' }} />
              <div className="soft mt">{progress}</div>
            </div>
          )}
          {!busy && !vision && !ocr && <div className="empty"><div className="emoji-lg" style={{ margin: '0 auto 10px' }}>🧾</div>Results will appear here.</div>}
          {!busy && vision && (
            <div className="stack">
              <div className="row"><span className="chip accent"><Sparkles /> {vision.detected}</span></div>
              <div className="soft">{vision.summary}</div>
              <div className="list">
                {vision.items.map((it, i) => (
                  <div key={i} className="list-item">
                    <div className="grow">
                      <div className="es" style={{ fontWeight: 600, fontSize: 17 }}>{it.es}</div>
                      <div className="small muted">{it.en}</div>
                    </div>
                    <SpeakButton text={it.es} size="xs" />
                    <SaveButton es={it.es} en={it.en} source="Escáner" size="xs" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {!busy && ocr && (
            <div className="stack">
              <div>
                <div className="tiny muted">Texto detectado</div>
                <div className="es" style={{ whiteSpace: 'pre-wrap', fontSize: 17 }}>{ocr.text}</div>
                <div className="row mt"><SpeakButton text={ocr.text} /></div>
              </div>
              <hr className="divider" />
              <div>
                <div className="tiny muted">Traducción</div>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: 17 }}>{ocr.translation}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
