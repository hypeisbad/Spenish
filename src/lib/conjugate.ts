/**
 * Spanish verb conjugation engine.
 *
 * Rule-based with explicit irregular data. Covers regular -ar/-er/-ir verbs,
 * boot stem changes (e→ie, o→ue, e→i, u→ue), -ir secondary changes, spelling
 * changes (c→qu, g→gu, z→c, g→j, gu→g, c→zc), -uir y-insertion, vowel-stem
 * preterites (leyó), accented -iar/-uar verbs, strong preterites, irregular
 * futures, reflexive verbs (including enclitic imperatives with correct
 * written accents), compound and progressive tenses.
 *
 * Person order everywhere: yo, tú, él/ella/usted, nosotros, vosotros, ellos/ellas/ustedes.
 */

export type StemChange = 'e>ie' | 'o>ue' | 'e>i' | 'u>ue';

export interface VerbDef {
  inf: string; // infinitive, reflexive verbs end in "se"
  en: string; // English gloss, e.g. "to speak"
  stem?: StemChange;
  accent?: 'í' | 'ú'; // enviar → envío, continuar → continúo
  yo?: string; // irregular yo present (tengo, conozco is automatic)
  pret?: string; // strong preterite stem (tuv, quis, dij…)
  fut?: string; // irregular future/conditional stem (tendr, har…)
  subj?: string; // irregular present subjunctive stem (sep, hay…)
  ger?: string; // irregular gerund
  part?: string; // irregular participle
  impTu?: string; // irregular tú affirmative imperative
  over?: Partial<Record<SimpleTense, (string | null)[]>>; // full overrides
  tags?: string[];
  mx?: string; // Mexico usage note
}

export type SimpleTense =
  | 'presente'
  | 'preterito'
  | 'imperfecto'
  | 'futuro'
  | 'condicional'
  | 'subjPresente'
  | 'subjImperfecto';

export type CompoundTense =
  | 'perfecto'
  | 'pluscuamperfecto'
  | 'futuroPerfecto'
  | 'condicionalPerfecto'
  | 'subjPerfecto'
  | 'progresivo';

export type TenseKey = SimpleTense | CompoundTense;

export const PERSONS = ['yo', 'tú', 'él/ella/usted', 'nosotros', 'vosotros', 'ellos/ustedes'] as const;
export const PERSONS_SHORT = ['yo', 'tú', 'él', 'nosotros', 'vosotros', 'ellos'] as const;
export const REFLEXIVE_PRONOUNS = ['me', 'te', 'se', 'nos', 'os', 'se'] as const;

export const TENSE_INFO: Record<TenseKey | 'imperativo', { es: string; en: string; hint: string }> = {
  presente: { es: 'Presente', en: 'Present', hint: 'I speak / I am speaking' },
  preterito: { es: 'Pretérito', en: 'Preterite', hint: 'I spoke (completed past) — the go-to past tense in Mexico' },
  imperfecto: { es: 'Copretérito (imperfecto)', en: 'Imperfect', hint: 'I used to speak / I was speaking' },
  futuro: { es: 'Futuro', en: 'Future', hint: 'I will speak (in speech, Mexicans often use "voy a + infinitive")' },
  condicional: { es: 'Pospretérito (condicional)', en: 'Conditional', hint: 'I would speak' },
  subjPresente: { es: 'Presente de subjuntivo', en: 'Present subjunctive', hint: '…that I speak (wishes, doubts, emotions)' },
  subjImperfecto: { es: 'Pretérito de subjuntivo', en: 'Imperfect subjunctive', hint: '…if I spoke / that I would speak' },
  perfecto: { es: 'Antepresente (perfecto)', en: 'Present perfect', hint: 'I have spoken' },
  pluscuamperfecto: { es: 'Antecopretérito (pluscuamperfecto)', en: 'Pluperfect', hint: 'I had spoken' },
  futuroPerfecto: { es: 'Antefuturo', en: 'Future perfect', hint: 'I will have spoken' },
  condicionalPerfecto: { es: 'Antepospretérito', en: 'Conditional perfect', hint: 'I would have spoken' },
  subjPerfecto: { es: 'Antepresente de subjuntivo', en: 'Present perfect subjunctive', hint: '…that I have spoken' },
  progresivo: { es: 'Presente progresivo', en: 'Present progressive', hint: 'I am speaking (right now)' },
  imperativo: { es: 'Imperativo', en: 'Imperative', hint: 'Speak! / Don’t speak!' },
};

const ENDINGS: Record<'ar' | 'er' | 'ir', Record<SimpleTense | 'pretStrong', string[]>> = {
  ar: {
    presente: ['o', 'as', 'a', 'amos', 'áis', 'an'],
    preterito: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'],
    imperfecto: ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'],
    futuro: ['é', 'ás', 'á', 'emos', 'éis', 'án'],
    condicional: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    subjPresente: ['e', 'es', 'e', 'emos', 'éis', 'en'],
    subjImperfecto: ['ra', 'ras', 'ra', 'ramos', 'rais', 'ran'],
    pretStrong: ['e', 'iste', 'o', 'imos', 'isteis', 'ieron'],
  },
  er: {
    presente: ['o', 'es', 'e', 'emos', 'éis', 'en'],
    preterito: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
    imperfecto: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    futuro: ['é', 'ás', 'á', 'emos', 'éis', 'án'],
    condicional: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    subjPresente: ['a', 'as', 'a', 'amos', 'áis', 'an'],
    subjImperfecto: ['ra', 'ras', 'ra', 'ramos', 'rais', 'ran'],
    pretStrong: ['e', 'iste', 'o', 'imos', 'isteis', 'ieron'],
  },
  ir: {
    presente: ['o', 'es', 'e', 'imos', 'ís', 'en'],
    preterito: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
    imperfecto: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    futuro: ['é', 'ás', 'á', 'emos', 'éis', 'án'],
    condicional: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    subjPresente: ['a', 'as', 'a', 'amos', 'áis', 'an'],
    subjImperfecto: ['ra', 'ras', 'ra', 'ramos', 'rais', 'ran'],
    pretStrong: ['e', 'iste', 'o', 'imos', 'isteis', 'ieron'],
  },
};

const HABER: Record<'perfecto' | 'pluscuamperfecto' | 'futuroPerfecto' | 'condicionalPerfecto' | 'subjPerfecto', string[]> = {
  perfecto: ['he', 'has', 'ha', 'hemos', 'habéis', 'han'],
  pluscuamperfecto: ['había', 'habías', 'había', 'habíamos', 'habíais', 'habían'],
  futuroPerfecto: ['habré', 'habrás', 'habrá', 'habremos', 'habréis', 'habrán'],
  condicionalPerfecto: ['habría', 'habrías', 'habría', 'habríamos', 'habríais', 'habrían'],
  subjPerfecto: ['haya', 'hayas', 'haya', 'hayamos', 'hayáis', 'hayan'],
};
const ESTAR_PRESENT = ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'];

const BOOT = [0, 1, 2, 5];
const ACCENT_MAP: Record<string, string> = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };
const UNACCENT_MAP: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' };

export function stripAccents(s: string): string {
  return s.replace(/[áéíóú]/g, (c) => UNACCENT_MAP[c] ?? c);
}

export interface Parsed {
  base: string; // infinitive without "se"
  reflexive: boolean;
  type: 'ar' | 'er' | 'ir';
  stem: string; // base without ending (no accent: oír → o)
}

export function parseInfinitive(inf: string): Parsed {
  let base = inf.trim().toLowerCase();
  let reflexive = false;
  if (base.length >= 4 && /[aeií]rse$/.test(base)) {
    reflexive = true;
    base = base.slice(0, -2);
  }
  const ending = stripAccents(base.slice(-2));
  if (ending !== 'ar' && ending !== 'er' && ending !== 'ir') {
    throw new Error(`Not a Spanish infinitive: ${inf}`);
  }
  return { base, reflexive, type: ending, stem: base.slice(0, -2) };
}

/** Replace the last occurrence of `from` in `s` with `to`. */
function replaceLast(s: string, from: string, to: string): string {
  const i = s.lastIndexOf(from);
  if (i < 0) return s;
  return s.slice(0, i) + to + s.slice(i + from.length);
}

function bootStem(stem: string, change: StemChange): string {
  switch (change) {
    case 'e>ie':
      return replaceLast(stem, 'e', 'ie');
    case 'o>ue':
      return replaceLast(stem, 'o', 'ue');
    case 'e>i':
      return replaceLast(stem, 'e', 'i');
    case 'u>ue':
      return replaceLast(stem, 'u', 'ue');
  }
}

/** -ir verbs: e→i / o→u in preterite 3rd persons, gerund, subjunctive nosotros/vosotros. */
function secondaryStem(stem: string, change: StemChange | undefined, type: Parsed['type']): string {
  if (type !== 'ir' || !change) return stem;
  if (change === 'e>ie' || change === 'e>i') return replaceLast(stem, 'e', 'i');
  if (change === 'o>ue') return replaceLast(stem, 'o', 'u');
  return stem;
}

/** Spelling fixes when a stem meets an ending starting with e/é (for -ar) — c→qu, g→gu, z→c, gu→gü. */
function softenBeforeE(stem: string): string {
  if (stem.endsWith('gu')) return stem.slice(0, -2) + 'gü';
  if (stem.endsWith('c')) return stem.slice(0, -1) + 'qu';
  if (stem.endsWith('g')) return stem.slice(0, -1) + 'gu';
  if (stem.endsWith('z')) return stem.slice(0, -1) + 'c';
  return stem;
}

/** Spelling fixes when a stem meets an ending starting with o/a (for -er/-ir) — g→j, gu→g, c→z (consonant+cer). */
function hardenBeforeOA(stem: string): string {
  if (stem.endsWith('gu')) return stem.slice(0, -2) + 'g'; // seguir → sigo
  if (stem.endsWith('g')) return stem.slice(0, -1) + 'j'; // escoger → escojo
  if (/[^aeiou]c$/.test(stem)) return stem.slice(0, -1) + 'z'; // vencer → venzo
  return stem;
}

function isVowel(c: string | undefined): boolean {
  return !!c && /[aeiouáéíóú]/.test(c);
}

/** Stem ends in a pronounced vowel (leer → le, oír → o, construir → constru) — but not the silent u of gu/qu (seguir). */
function endsInVowelSound(stem: string): boolean {
  if (/[gq]u$/.test(stem)) return false;
  return isVowel(stem[stem.length - 1]);
}

/** Put a written accent on the last weak vowel i/u of the stem (enviar → envi → enví). */
function accentLastWeak(stem: string, v: 'í' | 'ú'): string {
  const plain = v === 'í' ? 'i' : 'u';
  return replaceLast(stem, plain, v);
}

function attach(stem: string, ending: string, type: Parsed['type'], tense: SimpleTense): string {
  const first = ending[0];
  if (type === 'ar' && (first === 'e' || first === 'é')) {
    // subjunctive & preterite yo of -car/-gar/-zar/-guar
    if (tense === 'subjPresente' || tense === 'preterito') return softenBeforeE(stem) + ending;
  }
  if ((type === 'er' || type === 'ir') && /[oaáó]/.test(first) && (tense === 'presente' || tense === 'subjPresente')) {
    return hardenBeforeOA(stem) + ending;
  }
  return stem + ending;
}

/** Does this verb have a yo form that differs from the regular stem (and drives the subjunctive)? */
function irregularYo(def: VerbDef, p: Parsed): string | null {
  if (def.yo) return def.yo;
  const { stem, type, base } = p;
  // -cer / -cir after a vowel → -zco (conocer, conducir, parecer) — not hacer/decir (they have def.yo)
  if ((type === 'er' || type === 'ir') && /[aeiou]c$/.test(stem) && !['mecer', 'cocer'].includes(base)) {
    return stem.slice(0, -1) + 'zco';
  }
  // -uir (not -guir/-quir) → -uyo
  if (type === 'ir' && /[^gq]u$/.test(stem)) return stem + 'yo';
  return null;
}

function presentForms(def: VerbDef, p: Parsed): string[] {
  const { stem, type } = p;
  const end = ENDINGS[type].presente;
  const yoIrr = irregularYo(def, p);
  const isUir = type === 'ir' && /[^gq]u$/.test(stem);
  return end.map((e, i) => {
    if (i === 0 && yoIrr) return yoIrr;
    let s = stem;
    if (def.stem && BOOT.includes(i)) s = bootStem(stem, def.stem);
    if (def.accent && BOOT.includes(i)) s = accentLastWeak(s, def.accent);
    if (isUir && i !== 3 && i !== 4) s = s + 'y';
    return attach(s, e, type, 'presente');
  });
}

function subjunctiveForms(def: VerbDef, p: Parsed): string[] {
  const { stem, type } = p;
  const end = ENDINGS[type].subjPresente;
  if (def.subj) return end.map((e) => def.subj + e);
  const yoIrr = irregularYo(def, p);
  if (yoIrr && yoIrr.endsWith('o')) {
    const ys = yoIrr.slice(0, -1);
    return end.map((e) => ys + e);
  }
  return end.map((e, i) => {
    let s = stem;
    if (def.stem) {
      if (BOOT.includes(i)) s = bootStem(stem, def.stem);
      else s = secondaryStem(stem, def.stem, type);
    }
    if (def.accent && BOOT.includes(i)) s = accentLastWeak(s, def.accent);
    return attach(s, e, type, 'subjPresente');
  });
}

function preteriteForms(def: VerbDef, p: Parsed): string[] {
  const { stem, type } = p;
  if (def.pret) {
    const ps = def.pret;
    const strong = ENDINGS[type].pretStrong.slice();
    const jStem = ps.endsWith('j');
    return strong.map((e, i) => {
      let ending = e;
      if (i === 5 && jStem) ending = 'eron'; // dijeron, trajeron, condujeron
      let form = ps + ending;
      if (i === 2 && ps.endsWith('c')) form = ps.slice(0, -1) + 'zo'; // hizo
      return form;
    });
  }
  const end = ENDINGS[type].preterito;
  const vowelStem = (type === 'er' || type === 'ir') && endsInVowelSound(stem);
  const uStem = type === 'ir' && /[^gq]u$/.test(stem);
  return end.map((e, i) => {
    let s = stem;
    let ending = e;
    if ((i === 2 || i === 5) && def.stem) s = secondaryStem(stem, def.stem, type);
    if (vowelStem) {
      if (i === 2) ending = 'yó';
      else if (i === 5) ending = 'yeron';
      else if (!uStem) ending = ending.replace(/^i/, 'í'); // leíste, leímos, oísteis
    }
    return attach(s, ending, type, 'preterito');
  });
}

function imperfectForms(p: Parsed): string[] {
  return ENDINGS[p.type].imperfecto.map((e) => p.stem + e);
}

function futureStem(def: VerbDef, p: Parsed): string {
  return def.fut ?? stripAccents(p.base);
}

function imperfectSubjunctive(pret3pl: string): string[] {
  const s = pret3pl.slice(0, -3); // hablaron → habla
  const nos = s.slice(0, -1) + (ACCENT_MAP[s[s.length - 1]] ?? s[s.length - 1]);
  return ['ra', 'ras', 'ra', 'ramos', 'rais', 'ran'].map((e, i) => (i === 3 ? nos + e : s + e));
}

export function gerund(def: VerbDef): string {
  if (def.ger) return def.ger;
  const p = parseInfinitive(def.inf);
  if (p.type === 'ar') return p.stem + 'ando';
  const s = secondaryStem(p.stem, def.stem, p.type);
  if (endsInVowelSound(s)) return s + 'yendo';
  return s + 'iendo';
}

export function participle(def: VerbDef): string {
  if (def.part) return def.part;
  const p = parseInfinitive(def.inf);
  if (p.type === 'ar') return p.stem + 'ado';
  const last = p.stem[p.stem.length - 1];
  if (/[aeo]/.test(last ?? '')) return p.stem + 'ído'; // leído, traído, oído
  return p.stem + 'ido';
}

const cache = new WeakMap<VerbDef, Record<SimpleTense, string[]>>();

/** Non-reflexive simple-tense forms (no pronouns). */
export function simpleTenses(def: VerbDef): Record<SimpleTense, string[]> {
  const hit = cache.get(def);
  if (hit) return hit;
  const p = parseInfinitive(def.inf);
  const fs = futureStem(def, p);
  const out: Record<SimpleTense, string[]> = {
    presente: presentForms(def, p),
    preterito: preteriteForms(def, p),
    imperfecto: imperfectForms(p),
    futuro: ENDINGS.ar.futuro.map((e) => fs + e),
    condicional: ENDINGS.ar.condicional.map((e) => fs + e),
    subjPresente: subjunctiveForms(def, p),
    subjImperfecto: [],
  };
  if (def.over) {
    for (const [k, arr] of Object.entries(def.over) as [SimpleTense, (string | null)[]][]) {
      if (k === 'subjImperfecto') continue;
      out[k] = out[k].map((f, i) => arr[i] ?? f);
    }
  }
  out.subjImperfecto = imperfectSubjunctive(out.preterito[5]);
  if (def.over?.subjImperfecto) {
    out.subjImperfecto = out.subjImperfecto.map((f, i) => def.over!.subjImperfecto![i] ?? f);
  }
  cache.set(def, out);
  return out;
}

/* ---------- Stress & enclitic pronouns (levántate, siéntese, sentémonos) ---------- */

interface Nucleus {
  start: number;
  end: number; // exclusive
}

/** Find syllable nuclei (vowel groups, splitting strong-strong hiatus). Silent u in que/qui/gue/gui is skipped. */
export function nuclei(word: string): Nucleus[] {
  const w = word.toLowerCase();
  const res: Nucleus[] = [];
  const strong = (c: string) => /[aeoáéó]/.test(c);
  const accentedWeak = (c: string) => /[íú]/.test(c);
  let i = 0;
  while (i < w.length) {
    const c = w[i];
    const silentU = c === 'u' && (w[i - 1] === 'q' || w[i - 1] === 'g') && /[eiéí]/.test(w[i + 1] ?? '');
    if (isVowel(c) && !silentU) {
      let j = i + 1;
      while (j < w.length && isVowel(w[j])) {
        const prev = w[j - 1];
        const cur = w[j];
        // hiatus: two strong vowels, or an accented weak vowel next to a vowel
        if ((strong(prev) && strong(cur)) || accentedWeak(cur) || accentedWeak(prev)) break;
        j++;
      }
      res.push({ start: i, end: j });
      i = j;
    } else {
      i++;
    }
  }
  return res;
}

/** Index (into nuclei) of the stressed syllable. */
function stressIndex(word: string, nu: Nucleus[]): number {
  for (let k = 0; k < nu.length; k++) {
    const seg = word.slice(nu[k].start, nu[k].end);
    if (/[áéíóú]/.test(seg)) return k;
  }
  if (nu.length <= 1) return 0;
  return /[aeiouns]$/.test(word) ? nu.length - 2 : nu.length - 1;
}

function accentNucleus(word: string, n: Nucleus): string {
  const seg = word.slice(n.start, n.end);
  let idx = -1;
  for (let k = 0; k < seg.length; k++) if (/[aeo]/.test(seg[k])) idx = k;
  if (idx < 0) idx = seg.length - 1; // ui / iu → second vowel
  const accented = seg.slice(0, idx) + (ACCENT_MAP[seg[idx]] ?? seg[idx]) + seg.slice(idx + 1);
  return word.slice(0, n.start) + accented + word.slice(n.end);
}

/** Attach a clitic pronoun to a verb form with correct orthography (levanta + te → levántate). */
export function attachEnclitic(form: string, clitic: string): string {
  const si = stressIndex(form, nuclei(form));
  let base = form;
  if (clitic === 'nos' && base.endsWith('mos')) base = base.slice(0, -1); // sentemos + nos → sentémonos
  if (clitic === 'os' && base.endsWith('d')) base = base.slice(0, -1); // levantad + os → levantaos
  const combined = base + clitic;
  const nuC = nuclei(combined);
  const m = /[áéíóú]/.exec(base);
  if (m && /[íú]/.test(m[0]) && (isVowel(base[m.index - 1]) || isVowel(base[m.index + 1]))) {
    return combined; // hiatus accent must stay (ríete)
  }
  const plain = stripAccents(combined);
  const fromEnd = nuC.length - 1 - si; // 0 = last syllable, 1 = penultimate…
  if (fromEnd >= 2) return accentNucleus(plain, nuC[si]);
  return plain;
}

/* ---------- Public API ---------- */

export interface Conjugation {
  def: VerbDef;
  reflexive: boolean;
  gerund: string;
  participle: string;
  tenses: Record<TenseKey, string[]>;
  imperative: { affirmative: (string | null)[]; negative: (string | null)[] };
}

export function conjugate(def: VerbDef): Conjugation {
  const p = parseInfinitive(def.inf);
  const st = simpleTenses(def);
  const ger = gerund(def);
  const part = participle(def);
  const refl = p.reflexive;
  const withPron = (forms: string[]) => (refl ? forms.map((f, i) => `${REFLEXIVE_PRONOUNS[i]} ${f}`) : forms);

  const tenses = {} as Record<TenseKey, string[]>;
  (Object.keys(st) as SimpleTense[]).forEach((k) => (tenses[k] = withPron(st[k])));
  (Object.keys(HABER) as (keyof typeof HABER)[]).forEach((k) => {
    tenses[k] = withPron(HABER[k].map((h) => `${h} ${part}`));
  });
  tenses.progresivo = withPron(ESTAR_PRESENT.map((e) => `${e} ${ger}`));

  // Imperative: [yo(null), tú, usted, nosotros, vosotros, ustedes]
  const subj = st.subjPresente;
  const tuAff = def.impTu ?? st.presente[2];
  const vosAff = stripAccents(p.base).slice(0, -1) + 'd'; // hablad, comed, id, oíd handled below
  const affBare: (string | null)[] = [null, tuAff, subj[2], subj[3], p.base === 'oír' ? 'oíd' : vosAff, subj[5]];
  if (p.base === 'ir') affBare[3] = 'vamos';
  if (p.base === 'haber') {
    affBare.fill(null);
  }
  let affirmative: (string | null)[] = affBare;
  if (refl) {
    const cl = ['', 'te', 'se', 'nos', 'os', 'se'];
    affirmative = affBare.map((f, i) => {
      if (!f) return null;
      if (i === 4) {
        // vosotros: levantad + os → levantaos; irse → idos
        if (p.base === 'ir') return 'idos';
        const stemPart = f.slice(0, -1);
        return (p.type === 'ir' ? stemPart.replace(/i$/, 'í') : stemPart) + 'os';
      }
      if (p.base === 'ir' && i === 3) return 'vámonos';
      return attachEnclitic(f, cl[i]);
    });
  }
  const negative: (string | null)[] = [null, ...[1, 2, 3, 4, 5].map((i) => {
    if (p.base === 'haber') return null;
    const pron = refl ? `${REFLEXIVE_PRONOUNS[i]} ` : '';
    return `no ${pron}${subj[i]}`;
  })];

  return {
    def,
    reflexive: refl,
    gerund: refl ? attachEnclitic(ger, 'se') : ger,
    participle: part,
    tenses,
    imperative: { affirmative, negative },
  };
}

/** Convenience: get a single form. person 0-5. Returns forms WITH reflexive pronouns. */
export function form(def: VerbDef, tense: TenseKey, person: number): string {
  return conjugate(def).tenses[tense][person];
}

export const SIMPLE_TENSES: SimpleTense[] = [
  'presente',
  'preterito',
  'imperfecto',
  'futuro',
  'condicional',
  'subjPresente',
  'subjImperfecto',
];
export const COMPOUND_TENSES: CompoundTense[] = [
  'progresivo',
  'perfecto',
  'pluscuamperfecto',
  'futuroPerfecto',
  'condicionalPerfecto',
  'subjPerfecto',
];
