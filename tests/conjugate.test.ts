import { describe, expect, it } from 'vitest';
import { attachEnclitic, conjugate, gerund, participle } from '../src/lib/conjugate';
import { VERBS, findVerb } from '../src/data/verbs';

const c = (inf: string) => {
  const v = findVerb(inf);
  if (!v) throw new Error('missing verb ' + inf);
  return conjugate(v);
};
const t = (inf: string, tense: Parameters<typeof conjugate>[0] extends never ? never : string) =>
  c(inf).tenses[tense as keyof ReturnType<typeof conjugate>['tenses']].join(',');

// Expected tables written from standard references (RAE / common conjugation charts).
const TABLE: Record<string, Record<string, string>> = {
  hablar: {
    presente: 'hablo,hablas,habla,hablamos,habláis,hablan',
    preterito: 'hablé,hablaste,habló,hablamos,hablasteis,hablaron',
    imperfecto: 'hablaba,hablabas,hablaba,hablábamos,hablabais,hablaban',
    futuro: 'hablaré,hablarás,hablará,hablaremos,hablaréis,hablarán',
    condicional: 'hablaría,hablarías,hablaría,hablaríamos,hablaríais,hablarían',
    subjPresente: 'hable,hables,hable,hablemos,habléis,hablen',
    subjImperfecto: 'hablara,hablaras,hablara,habláramos,hablarais,hablaran',
  },
  comer: {
    presente: 'como,comes,come,comemos,coméis,comen',
    preterito: 'comí,comiste,comió,comimos,comisteis,comieron',
    imperfecto: 'comía,comías,comía,comíamos,comíais,comían',
    subjPresente: 'coma,comas,coma,comamos,comáis,coman',
    subjImperfecto: 'comiera,comieras,comiera,comiéramos,comierais,comieran',
  },
  vivir: {
    presente: 'vivo,vives,vive,vivimos,vivís,viven',
    preterito: 'viví,viviste,vivió,vivimos,vivisteis,vivieron',
    futuro: 'viviré,vivirás,vivirá,viviremos,viviréis,vivirán',
  },
  ser: {
    presente: 'soy,eres,es,somos,sois,son',
    preterito: 'fui,fuiste,fue,fuimos,fuisteis,fueron',
    imperfecto: 'era,eras,era,éramos,erais,eran',
    futuro: 'seré,serás,será,seremos,seréis,serán',
    subjPresente: 'sea,seas,sea,seamos,seáis,sean',
    subjImperfecto: 'fuera,fueras,fuera,fuéramos,fuerais,fueran',
  },
  estar: {
    presente: 'estoy,estás,está,estamos,estáis,están',
    preterito: 'estuve,estuviste,estuvo,estuvimos,estuvisteis,estuvieron',
    subjPresente: 'esté,estés,esté,estemos,estéis,estén',
    subjImperfecto: 'estuviera,estuvieras,estuviera,estuviéramos,estuvierais,estuvieran',
  },
  ir: {
    presente: 'voy,vas,va,vamos,vais,van',
    imperfecto: 'iba,ibas,iba,íbamos,ibais,iban',
    futuro: 'iré,irás,irá,iremos,iréis,irán',
    subjPresente: 'vaya,vayas,vaya,vayamos,vayáis,vayan',
  },
  haber: {
    presente: 'he,has,ha,hemos,habéis,han',
    preterito: 'hube,hubiste,hubo,hubimos,hubisteis,hubieron',
    futuro: 'habré,habrás,habrá,habremos,habréis,habrán',
    subjPresente: 'haya,hayas,haya,hayamos,hayáis,hayan',
  },
  tener: {
    presente: 'tengo,tienes,tiene,tenemos,tenéis,tienen',
    preterito: 'tuve,tuviste,tuvo,tuvimos,tuvisteis,tuvieron',
    futuro: 'tendré,tendrás,tendrá,tendremos,tendréis,tendrán',
    condicional: 'tendría,tendrías,tendría,tendríamos,tendríais,tendrían',
    subjPresente: 'tenga,tengas,tenga,tengamos,tengáis,tengan',
    subjImperfecto: 'tuviera,tuvieras,tuviera,tuviéramos,tuvierais,tuvieran',
  },
  hacer: {
    presente: 'hago,haces,hace,hacemos,hacéis,hacen',
    preterito: 'hice,hiciste,hizo,hicimos,hicisteis,hicieron',
    futuro: 'haré,harás,hará,haremos,haréis,harán',
    subjPresente: 'haga,hagas,haga,hagamos,hagáis,hagan',
  },
  poder: {
    presente: 'puedo,puedes,puede,podemos,podéis,pueden',
    preterito: 'pude,pudiste,pudo,pudimos,pudisteis,pudieron',
    futuro: 'podré,podrás,podrá,podremos,podréis,podrán',
    subjPresente: 'pueda,puedas,pueda,podamos,podáis,puedan',
  },
  decir: {
    presente: 'digo,dices,dice,decimos,decís,dicen',
    preterito: 'dije,dijiste,dijo,dijimos,dijisteis,dijeron',
    futuro: 'diré,dirás,dirá,diremos,diréis,dirán',
    subjPresente: 'diga,digas,diga,digamos,digáis,digan',
    subjImperfecto: 'dijera,dijeras,dijera,dijéramos,dijerais,dijeran',
  },
  querer: {
    presente: 'quiero,quieres,quiere,queremos,queréis,quieren',
    preterito: 'quise,quisiste,quiso,quisimos,quisisteis,quisieron',
    futuro: 'querré,querrás,querrá,querremos,querréis,querrán',
  },
  saber: {
    presente: 'sé,sabes,sabe,sabemos,sabéis,saben',
    preterito: 'supe,supiste,supo,supimos,supisteis,supieron',
    subjPresente: 'sepa,sepas,sepa,sepamos,sepáis,sepan',
    futuro: 'sabré,sabrás,sabrá,sabremos,sabréis,sabrán',
  },
  venir: {
    presente: 'vengo,vienes,viene,venimos,venís,vienen',
    preterito: 'vine,viniste,vino,vinimos,vinisteis,vinieron',
    futuro: 'vendré,vendrás,vendrá,vendremos,vendréis,vendrán',
    subjPresente: 'venga,vengas,venga,vengamos,vengáis,vengan',
  },
  poner: {
    presente: 'pongo,pones,pone,ponemos,ponéis,ponen',
    preterito: 'puse,pusiste,puso,pusimos,pusisteis,pusieron',
    futuro: 'pondré,pondrás,pondrá,pondremos,pondréis,pondrán',
  },
  salir: {
    presente: 'salgo,sales,sale,salimos,salís,salen',
    futuro: 'saldré,saldrás,saldrá,saldremos,saldréis,saldrán',
    subjPresente: 'salga,salgas,salga,salgamos,salgáis,salgan',
  },
  dar: {
    presente: 'doy,das,da,damos,dais,dan',
    preterito: 'di,diste,dio,dimos,disteis,dieron',
    subjPresente: 'dé,des,dé,demos,deis,den',
    subjImperfecto: 'diera,dieras,diera,diéramos,dierais,dieran',
  },
  ver: {
    presente: 'veo,ves,ve,vemos,veis,ven',
    preterito: 'vi,viste,vio,vimos,visteis,vieron',
    imperfecto: 'veía,veías,veía,veíamos,veíais,veían',
    subjPresente: 'vea,veas,vea,veamos,veáis,vean',
    futuro: 'veré,verás,verá,veremos,veréis,verán',
  },
  traer: {
    presente: 'traigo,traes,trae,traemos,traéis,traen',
    preterito: 'traje,trajiste,trajo,trajimos,trajisteis,trajeron',
    subjPresente: 'traiga,traigas,traiga,traigamos,traigáis,traigan',
  },
  caer: {
    presente: 'caigo,caes,cae,caemos,caéis,caen',
    preterito: 'caí,caíste,cayó,caímos,caísteis,cayeron',
  },
  oír: {
    presente: 'oigo,oyes,oye,oímos,oís,oyen',
    preterito: 'oí,oíste,oyó,oímos,oísteis,oyeron',
    futuro: 'oiré,oirás,oirá,oiremos,oiréis,oirán',
    subjPresente: 'oiga,oigas,oiga,oigamos,oigáis,oigan',
    subjImperfecto: 'oyera,oyeras,oyera,oyéramos,oyerais,oyeran',
  },
  leer: {
    presente: 'leo,lees,lee,leemos,leéis,leen',
    preterito: 'leí,leíste,leyó,leímos,leísteis,leyeron',
    subjImperfecto: 'leyera,leyeras,leyera,leyéramos,leyerais,leyeran',
  },
  construir: {
    presente: 'construyo,construyes,construye,construimos,construís,construyen',
    preterito: 'construí,construiste,construyó,construimos,construisteis,construyeron',
    subjPresente: 'construya,construyas,construya,construyamos,construyáis,construyan',
  },
  conocer: {
    presente: 'conozco,conoces,conoce,conocemos,conocéis,conocen',
    subjPresente: 'conozca,conozcas,conozca,conozcamos,conozcáis,conozcan',
    preterito: 'conocí,conociste,conoció,conocimos,conocisteis,conocieron',
  },
  conducir: {
    presente: 'conduzco,conduces,conduce,conducimos,conducís,conducen',
    preterito: 'conduje,condujiste,condujo,condujimos,condujisteis,condujeron',
  },
  pensar: {
    presente: 'pienso,piensas,piensa,pensamos,pensáis,piensan',
    subjPresente: 'piense,pienses,piense,pensemos,penséis,piensen',
    preterito: 'pensé,pensaste,pensó,pensamos,pensasteis,pensaron',
  },
  empezar: {
    presente: 'empiezo,empiezas,empieza,empezamos,empezáis,empiezan',
    preterito: 'empecé,empezaste,empezó,empezamos,empezasteis,empezaron',
    subjPresente: 'empiece,empieces,empiece,empecemos,empecéis,empiecen',
  },
  almorzar: {
    presente: 'almuerzo,almuerzas,almuerza,almorzamos,almorzáis,almuerzan',
    preterito: 'almorcé,almorzaste,almorzó,almorzamos,almorzasteis,almorzaron',
    subjPresente: 'almuerce,almuerces,almuerce,almorcemos,almorcéis,almuercen',
  },
  jugar: {
    presente: 'juego,juegas,juega,jugamos,jugáis,juegan',
    preterito: 'jugué,jugaste,jugó,jugamos,jugasteis,jugaron',
    subjPresente: 'juegue,juegues,juegue,juguemos,juguéis,jueguen',
  },
  volver: {
    presente: 'vuelvo,vuelves,vuelve,volvemos,volvéis,vuelven',
    subjPresente: 'vuelva,vuelvas,vuelva,volvamos,volváis,vuelvan',
  },
  dormir: {
    presente: 'duermo,duermes,duerme,dormimos,dormís,duermen',
    preterito: 'dormí,dormiste,durmió,dormimos,dormisteis,durmieron',
    subjPresente: 'duerma,duermas,duerma,durmamos,durmáis,duerman',
    subjImperfecto: 'durmiera,durmieras,durmiera,durmiéramos,durmierais,durmieran',
  },
  morir: { preterito: 'morí,moriste,murió,morimos,moristeis,murieron' },
  pedir: {
    presente: 'pido,pides,pide,pedimos,pedís,piden',
    preterito: 'pedí,pediste,pidió,pedimos,pedisteis,pidieron',
    subjPresente: 'pida,pidas,pida,pidamos,pidáis,pidan',
  },
  sentir: {
    presente: 'siento,sientes,siente,sentimos,sentís,sienten',
    preterito: 'sentí,sentiste,sintió,sentimos,sentisteis,sintieron',
    subjPresente: 'sienta,sientas,sienta,sintamos,sintáis,sientan',
  },
  preferir: {
    presente: 'prefiero,prefieres,prefiere,preferimos,preferís,prefieren',
    preterito: 'preferí,preferiste,prefirió,preferimos,preferisteis,prefirieron',
  },
  seguir: {
    presente: 'sigo,sigues,sigue,seguimos,seguís,siguen',
    preterito: 'seguí,seguiste,siguió,seguimos,seguisteis,siguieron',
    subjPresente: 'siga,sigas,siga,sigamos,sigáis,sigan',
  },
  elegir: {
    presente: 'elijo,eliges,elige,elegimos,elegís,eligen',
    subjPresente: 'elija,elijas,elija,elijamos,elijáis,elijan',
    preterito: 'elegí,elegiste,eligió,elegimos,elegisteis,eligieron',
  },
  escoger: {
    presente: 'escojo,escoges,escoge,escogemos,escogéis,escogen',
    subjPresente: 'escoja,escojas,escoja,escojamos,escojáis,escojan',
  },
  distinguir: { presente: 'distingo,distingues,distingue,distinguimos,distinguís,distinguen' },
  vencer: { presente: 'venzo,vences,vence,vencemos,vencéis,vencen' },
  buscar: {
    preterito: 'busqué,buscaste,buscó,buscamos,buscasteis,buscaron',
    subjPresente: 'busque,busques,busque,busquemos,busquéis,busquen',
  },
  llegar: {
    preterito: 'llegué,llegaste,llegó,llegamos,llegasteis,llegaron',
    subjPresente: 'llegue,llegues,llegue,lleguemos,lleguéis,lleguen',
  },
  averiguar: {
    preterito: 'averigüé,averiguaste,averiguó,averiguamos,averiguasteis,averiguaron',
    subjPresente: 'averigüe,averigües,averigüe,averigüemos,averigüéis,averigüen',
  },
  enviar: {
    presente: 'envío,envías,envía,enviamos,enviáis,envían',
    subjPresente: 'envíe,envíes,envíe,enviemos,enviéis,envíen',
    preterito: 'envié,enviaste,envió,enviamos,enviasteis,enviaron',
  },
  continuar: {
    presente: 'continúo,continúas,continúa,continuamos,continuáis,continúan',
    subjPresente: 'continúe,continúes,continúe,continuemos,continuéis,continúen',
  },
  andar: { preterito: 'anduve,anduviste,anduvo,anduvimos,anduvisteis,anduvieron' },
  traducir: { preterito: 'traduje,tradujiste,tradujo,tradujimos,tradujisteis,tradujeron' },
  estudiar: { presente: 'estudio,estudias,estudia,estudiamos,estudiáis,estudian' },
  levantarse: {
    presente: 'me levanto,te levantas,se levanta,nos levantamos,os levantáis,se levantan',
    preterito: 'me levanté,te levantaste,se levantó,nos levantamos,os levantasteis,se levantaron',
    perfecto: 'me he levantado,te has levantado,se ha levantado,nos hemos levantado,os habéis levantado,se han levantado',
  },
  sentarse: { presente: 'me siento,te sientas,se sienta,nos sentamos,os sentáis,se sientan' },
  vestirse: { presente: 'me visto,te vistes,se viste,nos vestimos,os vestís,se visten' },
  irse: { presente: 'me voy,te vas,se va,nos vamos,os vais,se van' },
};

describe('conjugation tables', () => {
  for (const [inf, tenses] of Object.entries(TABLE)) {
    for (const [tense, expected] of Object.entries(tenses)) {
      it(`${inf} · ${tense}`, () => {
        expect(t(inf, tense)).toBe(expected);
      });
    }
  }
});

describe('compound & progressive', () => {
  it('perfecto / progresivo', () => {
    expect(c('comer').tenses.perfecto[0]).toBe('he comido');
    expect(c('escribir').tenses.pluscuamperfecto[3]).toBe('habíamos escrito');
    expect(c('hacer').tenses.subjPerfecto[1]).toBe('hayas hecho');
    expect(c('leer').tenses.progresivo[0]).toBe('estoy leyendo');
    expect(c('dormir').tenses.progresivo[2]).toBe('está durmiendo');
    expect(c('decir').tenses.futuroPerfecto[5]).toBe('habrán dicho');
  });
});

describe('gerunds & participles', () => {
  const G: Record<string, string> = {
    hablar: 'hablando', comer: 'comiendo', vivir: 'viviendo', leer: 'leyendo', oír: 'oyendo',
    traer: 'trayendo', construir: 'construyendo', ir: 'yendo', pedir: 'pidiendo', dormir: 'durmiendo',
    decir: 'diciendo', venir: 'viniendo', poder: 'pudiendo', seguir: 'siguiendo', sentir: 'sintiendo',
    caer: 'cayendo', creer: 'creyendo', morir: 'muriendo', ser: 'siendo', ver: 'viendo',
  };
  for (const [inf, g] of Object.entries(G)) it(`gerund ${inf}`, () => expect(gerund(findVerb(inf)!)).toBe(g));
  const P: Record<string, string> = {
    hablar: 'hablado', comer: 'comido', vivir: 'vivido', leer: 'leído', oír: 'oído', traer: 'traído',
    construir: 'construido', hacer: 'hecho', decir: 'dicho', escribir: 'escrito', abrir: 'abierto',
    volver: 'vuelto', poner: 'puesto', ver: 'visto', morir: 'muerto', romper: 'roto', ir: 'ido',
    ser: 'sido', caer: 'caído', creer: 'creído', seguir: 'seguido', resolver: 'resuelto',
  };
  for (const [inf, p] of Object.entries(P)) it(`participle ${inf}`, () => expect(participle(findVerb(inf)!)).toBe(p));
});

describe('imperatives', () => {
  const aff = (inf: string) => c(inf).imperative.affirmative.slice(1).join(',');
  const neg = (inf: string) => c(inf).imperative.negative.slice(1).join(',');
  it('regular', () => {
    expect(aff('hablar')).toBe('habla,hable,hablemos,hablad,hablen');
    expect(neg('hablar')).toBe('no hables,no hable,no hablemos,no habléis,no hablen');
    expect(aff('comer')).toBe('come,coma,comamos,comed,coman');
    expect(aff('escribir')).toBe('escribe,escriba,escribamos,escribid,escriban');
  });
  it('irregular tú', () => {
    const tu = (inf: string) => c(inf).imperative.affirmative[1];
    expect(['decir', 'hacer', 'ir', 'poner', 'salir', 'ser', 'tener', 'venir'].map(tu).join(',')).toBe('di,haz,ve,pon,sal,sé,ten,ven');
    expect(tu('pensar')).toBe('piensa');
    expect(tu('dormir')).toBe('duerme');
    expect(tu('oír')).toBe('oye');
    expect(tu('estar')).toBe('está');
  });
  it('ir nosotros', () => {
    expect(c('ir').imperative.affirmative[3]).toBe('vamos');
    expect(c('ir').imperative.negative[3]).toBe('no vayamos');
  });
  it('reflexive with enclitics', () => {
    expect(aff('levantarse')).toBe('levántate,levántese,levantémonos,levantaos,levántense');
    expect(neg('levantarse')).toBe('no te levantes,no se levante,no nos levantemos,no os levantéis,no se levanten');
    expect(aff('sentarse')).toBe('siéntate,siéntese,sentémonos,sentaos,siéntense');
    expect(aff('acostarse')).toBe('acuéstate,acuéstese,acostémonos,acostaos,acuéstense');
    expect(aff('quedarse')).toBe('quédate,quédese,quedémonos,quedaos,quédense');
    expect(aff('vestirse')).toBe('vístete,vístase,vistámonos,vestíos,vístanse');
    expect(aff('divertirse')).toBe('diviértete,diviértase,divirtámonos,divertíos,diviértanse');
    expect(aff('dormirse')).toBe('duérmete,duérmase,durmámonos,dormíos,duérmanse');
    expect(aff('ponerse')).toBe('ponte,póngase,pongámonos,poneos,pónganse');
    expect(aff('irse')).toBe('vete,váyase,vámonos,idos,váyanse');
    expect(aff('preocuparse')).toBe('preocúpate,preocúpese,preocupémonos,preocupaos,preocúpense');
    expect(aff('despertarse')).toBe('despiértate,despiértese,despertémonos,despertaos,despiértense');
  });
  it('reflexive gerunds', () => {
    expect(c('levantarse').gerund).toBe('levantándose');
    expect(c('dormirse').gerund).toBe('durmiéndose');
    expect(c('irse').gerund).toBe('yéndose');
    expect(c('vestirse').gerund).toBe('vistiéndose');
  });
  it('enclitic helper', () => {
    expect(attachEnclitic('di', 'me')).toBe('dime');
    expect(attachEnclitic('haz', 'lo')).toBe('hazlo');
    expect(attachEnclitic('dé', 'me')).toBe('deme');
    expect(attachEnclitic('está', 'te')).toBe('estate');
    expect(attachEnclitic('escribe', 'me')).toBe('escríbeme');
    expect(attachEnclitic('compra', 'lo')).toBe('cómpralo');
    expect(attachEnclitic('pruebe', 'lo')).toBe('pruébelo');
  });
});

describe('cache isolation', () => {
  it('a bare definition with the same infinitive is conjugated regularly (used to highlight irregulars)', () => {
    conjugate(findVerb('tener')!);
    expect(conjugate({ inf: 'tener', en: '' }).tenses.preterito[0]).toBe('tení');
    expect(conjugate(findVerb('tener')!).tenses.preterito[0]).toBe('tuve');
  });
});

describe('every catalogued verb conjugates without throwing', () => {
  for (const v of VERBS) {
    it(v.inf, () => {
      const r = conjugate(v);
      for (const forms of Object.values(r.tenses)) {
        expect(forms).toHaveLength(6);
        for (const f of forms) expect(f).toMatch(/^[a-záéíóúñü ]+$/);
      }
    });
  }
  it('has no duplicate infinitives', () => {
    const set = new Set(VERBS.map((v) => v.inf));
    expect(set.size).toBe(VERBS.length);
  });
});
