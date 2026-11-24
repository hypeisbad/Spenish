import { useMemo, useState } from 'react';
import { Shuffle, Wand2 } from 'lucide-react';
import { conjugate, TENSE_INFO, type TenseKey } from '../lib/conjugate';
import { findVerb } from '../data/verbs';
import { useStore } from '../lib/store';
import { PageHead, SaveButton, SpeakButton, TapText } from '../components/ui';

interface LabVerb {
  inf: string;
  en: [base: string, s: string, past: string, pp: string, ing: string];
  comps: [es: string, en: string][];
}

const LAB_VERBS: LabVerb[] = [
  { inf: 'comer', en: ['eat', 'eats', 'ate', 'eaten', 'eating'], comps: [['tacos al pastor', 'tacos al pastor'], ['en el mercado', 'at the market'], ['con mi familia', 'with my family']] },
  { inf: 'hablar', en: ['speak', 'speaks', 'spoke', 'spoken', 'speaking'], comps: [['español', 'Spanish'], ['con el mesero', 'with the waiter'], ['por teléfono', 'on the phone']] },
  { inf: 'ir', en: ['go', 'goes', 'went', 'gone', 'going'], comps: [['a la playa', 'to the beach'], ['al centro', 'downtown'], ['a la fiesta', 'to the party']] },
  { inf: 'tener', en: ['have', 'has', 'had', 'had', 'having'], comps: [['dos hermanos', 'two brothers'], ['un carro nuevo', 'a new car'], ['mucho trabajo', 'a lot of work']] },
  { inf: 'querer', en: ['want', 'wants', 'wanted', 'wanted', 'wanting'], comps: [['un café de olla', 'a café de olla'], ['viajar a Oaxaca', 'to travel to Oaxaca'], ['aprender español', 'to learn Spanish']] },
  { inf: 'vivir', en: ['live', 'lives', 'lived', 'lived', 'living'], comps: [['en la Ciudad de México', 'in Mexico City'], ['cerca del mar', 'near the sea']] },
  { inf: 'comprar', en: ['buy', 'buys', 'bought', 'bought', 'buying'], comps: [['fruta en el tianguis', 'fruit at the street market'], ['boletos para el metro', 'tickets for the metro']] },
  { inf: 'bailar', en: ['dance', 'dances', 'danced', 'danced', 'dancing'], comps: [['salsa', 'salsa'], ['en la boda', 'at the wedding']] },
  { inf: 'trabajar', en: ['work', 'works', 'worked', 'worked', 'working'], comps: [['en una oficina', 'in an office'], ['los sábados', 'on Saturdays']] },
  { inf: 'tomar', en: ['drink', 'drinks', 'drank', 'drunk', 'drinking'], comps: [['agua de horchata', 'horchata'], ['un café', 'a coffee']] },
  { inf: 'hacer', en: ['do', 'does', 'did', 'done', 'doing'], comps: [['la tarea', 'the homework'], ['ejercicio', 'exercise']] },
  { inf: 'ver', en: ['watch', 'watches', 'watched', 'watched', 'watching'], comps: [['la lucha libre', 'the wrestling'], ['una película', 'a movie']] },
  { inf: 'escribir', en: ['write', 'writes', 'wrote', 'written', 'writing'], comps: [['un mensaje', 'a message'], ['un correo', 'an email']] },
  { inf: 'leer', en: ['read', 'reads', 'read', 'read', 'reading'], comps: [['un libro', 'a book'], ['el periódico', 'the newspaper']] },
  { inf: 'manejar', en: ['drive', 'drives', 'drove', 'driven', 'driving'], comps: [['al trabajo', 'to work'], ['por la carretera', 'on the highway']] },
  { inf: 'platicar', en: ['chat', 'chats', 'chatted', 'chatted', 'chatting'], comps: [['con mis amigos', 'with my friends'], ['toda la noche', 'all night']] },
  { inf: 'cocinar', en: ['cook', 'cooks', 'cooked', 'cooked', 'cooking'], comps: [['mole', 'mole'], ['para mi familia', 'for my family']] },
  { inf: 'viajar', en: ['travel', 'travels', 'traveled', 'traveled', 'traveling'], comps: [['a Cancún', 'to Cancún'], ['en camión', 'by bus']] },
  { inf: 'pedir', en: ['order', 'orders', 'ordered', 'ordered', 'ordering'], comps: [['unos tacos', 'some tacos'], ['la cuenta', 'the check']] },
  { inf: 'dormir', en: ['sleep', 'sleeps', 'slept', 'slept', 'sleeping'], comps: [['ocho horas', 'eight hours'], ['en una hamaca', 'in a hammock']] },
];

const SUBJECTS: { es: string; en: string; p: number; third: boolean; be: 'am' | 'is' | 'are'; have: 'have' | 'has' }[] = [
  { es: 'yo', en: 'I', p: 0, third: false, be: 'am', have: 'have' },
  { es: 'tú', en: 'you', p: 1, third: false, be: 'are', have: 'have' },
  { es: 'él', en: 'he', p: 2, third: true, be: 'is', have: 'has' },
  { es: 'ella', en: 'she', p: 2, third: true, be: 'is', have: 'has' },
  { es: 'usted', en: 'you (formal)', p: 2, third: false, be: 'are', have: 'have' },
  { es: 'nosotros', en: 'we', p: 3, third: false, be: 'are', have: 'have' },
  { es: 'ellos', en: 'they', p: 5, third: false, be: 'are', have: 'have' },
  { es: 'ustedes', en: 'you all', p: 5, third: false, be: 'are', have: 'have' },
];

type LabTense = 'presente' | 'preterito' | 'imperfecto' | 'futuro' | 'condicional' | 'irA' | 'progresivo' | 'perfecto' | 'subjPresente';
const LAB_TENSES: { id: LabTense; es: string; en: string }[] = [
  { id: 'presente', es: 'Presente', en: 'Present' },
  { id: 'preterito', es: 'Pretérito', en: 'Past (completed)' },
  { id: 'imperfecto', es: 'Copretérito', en: 'Used to…' },
  { id: 'irA', es: 'Ir a + inf.', en: 'Going to…' },
  { id: 'futuro', es: 'Futuro', en: 'Will…' },
  { id: 'condicional', es: 'Condicional', en: 'Would…' },
  { id: 'progresivo', es: 'Progresivo', en: '…-ing now' },
  { id: 'perfecto', es: 'Antepresente', en: 'Have …-ed' },
  { id: 'subjPresente', es: 'Ojalá + subj.', en: 'Hopefully…' },
];

const IR_PRESENT = ['voy', 'vas', 'va', 'vamos', 'vais', 'van'];

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function buildSentence(lv: LabVerb, subjIdx: number, tense: LabTense, comp: number, neg: boolean, question: boolean, showPronoun: boolean) {
  const def = findVerb(lv.inf)!;
  const c = conjugate(def);
  const s = SUBJECTS[subjIdx];
  const [es, enComp] = lv.comps[comp] ?? lv.comps[0];
  let verb: string;
  if (tense === 'irA') verb = `${IR_PRESENT[s.p]} a ${lv.inf}`;
  else verb = c.tenses[tense as TenseKey][s.p];
  const isQ = question && tense !== 'subjPresente';
  const pron = showPronoun || ['él', 'ella', 'usted', 'ustedes', 'ellos'].includes(s.es) ? s.es + ' ' : '';
  let esCore = `${pron}${neg ? 'no ' : ''}${verb} ${es}`;
  if (tense === 'subjPresente') esCore = `ojalá que ${esCore}`;
  const esText = isQ ? `¿${cap(esCore)}?` : `${cap(esCore)}.`;

  // English
  const [base, third, past, pp, ing] = lv.en;
  const subj = s.en.replace(' (formal)', '');
  // aux-based English: statement / negative / question / negative question
  const withAux = (pos: string, negC: string, main: string, plainStatement?: string) => {
    if (isQ) {
      if (!neg) return `${pos} ${subj} ${main}`;
      return pos === 'am' ? `am ${subj} not ${main}` : `${negC} ${subj} ${main}`;
    }
    if (neg) return pos === 'am' ? `${subj} am not ${main}` : `${subj} ${negC} ${main}`;
    return plainStatement ?? `${subj} ${pos} ${main}`;
  };
  const beNeg = s.be === 'am' ? 'am not' : s.be === 'is' ? "isn't" : "aren't";
  let en: string;
  switch (tense) {
    case 'presente':
      en = withAux(s.third ? 'does' : 'do', s.third ? "doesn't" : "don't", base, `${subj} ${s.third ? third : base}`);
      break;
    case 'preterito':
      en = withAux('did', "didn't", base, `${subj} ${past}`);
      break;
    case 'imperfecto':
      en = withAux('did', "didn't", `use to ${base}`, `${subj} used to ${base}`);
      break;
    case 'futuro':
      en = withAux('will', "won't", base);
      break;
    case 'condicional':
      en = withAux('would', "wouldn't", base);
      break;
    case 'irA':
      en = withAux(s.be, beNeg, `going to ${base}`);
      break;
    case 'progresivo':
      en = withAux(s.be, beNeg, ing);
      break;
    case 'perfecto':
      en = withAux(s.have, s.have === 'has' ? "hasn't" : "haven't", pp);
      break;
    case 'subjPresente':
      en = `hopefully ${subj} ${neg ? (s.third ? "doesn't " : "don't ") + base : s.third ? third : base}`;
      break;
  }
  en = `${en} ${enComp}`;
  const enText = cap(en.replace(/^i /, 'I ').replace(/ i /g, ' I ')) + (isQ ? '?' : '.');
  return { es: esText, en: enText, verb, tenseLabel: tense === 'irA' ? 'ir a + infinitivo' : TENSE_INFO[tense as TenseKey].es };
}

export default function SentenceLab() {
  const addXp = useStore((s) => s.addXp);
  const [vi, setVi] = useState(0);
  const [si, setSi] = useState(0);
  const [tense, setTense] = useState<LabTense>('presente');
  const [ci, setCi] = useState(0);
  const [neg, setNeg] = useState(false);
  const [q, setQ] = useState(false);
  const [pron, setPron] = useState(true);
  const lv = LAB_VERBS[vi];
  const out = useMemo(() => buildSentence(lv, si, tense, Math.min(ci, lv.comps.length - 1), neg, q, pron), [lv, si, tense, ci, neg, q, pron]);

  const random = () => {
    const v = Math.floor(Math.random() * LAB_VERBS.length);
    setVi(v);
    setSi(Math.floor(Math.random() * SUBJECTS.length));
    setTense(LAB_TENSES[Math.floor(Math.random() * LAB_TENSES.length)].id);
    setCi(Math.floor(Math.random() * LAB_VERBS[v].comps.length));
    setNeg(Math.random() < 0.25);
    setQ(Math.random() < 0.25);
    addXp(1);
  };

  return (
    <div className="page">
      <PageHead
        eyebrow="Laboratorio · Sentence lab"
        es="Frases que se conjugan solas"
        en="Sentences that conjugate themselves"
        desc="Pick a subject, a verb and a tense — the conjugation engine builds a grammatically correct Mexican Spanish sentence and its English equivalent, live."
        right={<button className="btn primary" onClick={random}><Shuffle /> ¡Sorpréndeme!</button>}
      />
      <div className="card hero" style={{ marginBottom: 16 }}>
        <div className="row between nowrap" style={{ alignItems: 'flex-start' }}>
          <div className="grow">
            <div className="tiny muted" style={{ marginBottom: 6 }}><Wand2 style={{ display: 'inline', width: 14, verticalAlign: -2 }} /> {out.tenseLabel} · <b className="es" style={{ color: 'var(--accent)' }}>{out.verb}</b></div>
            <div className="es" style={{ fontSize: 'clamp(26px, 5vw, 40px)', lineHeight: 1.25 }}><TapText text={out.es} /></div>
            <div className="h3 soft mt">{out.en}</div>
          </div>
          <div className="stack sm">
            <SpeakButton text={out.es} />
            <SpeakButton text={out.es} slow />
            <SaveButton es={out.es} en={out.en} source="Laboratorio" />
          </div>
        </div>
      </div>
      <div className="grid cols-2">
        <div className="card">
          <div className="card-title">1 · Sujeto</div>
          <div className="row">
            {SUBJECTS.map((s, i) => <button key={s.es} className={`chip ${si === i ? 'on' : ''}`} onClick={() => setSi(i)}>{s.es} <span className="muted">· {s.en}</span></button>)}
          </div>
          <div className="card-title mt">2 · Verbo</div>
          <div className="row">
            {LAB_VERBS.map((v, i) => <button key={v.inf} className={`chip ${vi === i ? 'on' : ''}`} onClick={() => { setVi(i); setCi(0); }}>{v.inf}</button>)}
          </div>
          <div className="card-title mt">3 · Complemento</div>
          <div className="row">
            {lv.comps.map(([es, en], i) => <button key={es} className={`chip ${ci === i ? 'on' : ''}`} onClick={() => setCi(i)}>{es} <span className="muted">· {en}</span></button>)}
          </div>
        </div>
        <div className="card">
          <div className="card-title">4 · Tiempo</div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {LAB_TENSES.map((t) => (
              <button key={t.id} className={`choice ${tense === t.id ? 'sel' : ''}`} style={{ padding: '10px 12px', flexDirection: 'column', alignItems: 'flex-start', gap: 0 }} onClick={() => setTense(t.id)}>
                <b style={{ fontSize: 14.5 }}>{t.es}</b>
                <span className="tiny muted">{t.en}</span>
              </button>
            ))}
          </div>
          <div className="card-title mt">5 · Opciones</div>
          <div className="row">
            <button className={`chip ${neg ? 'on' : ''}`} onClick={() => setNeg((n) => !n)}>🚫 Negativo (no)</button>
            <button className={`chip ${q ? 'on' : ''}`} onClick={() => setQ((x) => !x)} disabled={tense === 'subjPresente'}>❓ Pregunta</button>
            <button className={`chip ${pron ? 'on' : ''}`} onClick={() => setPron((x) => !x)}>👤 Mostrar pronombre</button>
          </div>
          <div className="callout mt small">💡 Spanish often drops subject pronouns because the verb ending already says who: <i>“Como tacos”</i> = I eat tacos. Toggle “Mostrar pronombre” to see it.</div>
        </div>
      </div>
    </div>
  );
}
