/** Mexicanismos — slang dictionary with a "spice meter". */

export interface Slang {
  id: string;
  term: string;
  meaning: string;
  ex: string;
  exEn: string;
  spice: 1 | 2 | 3; // 1 family-friendly · 2 casual (friends) · 3 vulgar (know it, use carefully)
  region?: string;
  note?: string;
}

type S = [term: string, meaning: string, ex: string, exEn: string, spice: 1 | 2 | 3, note?: string, region?: string];

const rows: S[] = [
  ['¿Qué onda?', "What's up? / What's going on?", '¿Qué onda, cómo te fue?', "What's up, how did it go?", 1],
  ['chido', 'cool, great', '¡Qué chido tu carro!', 'Your car is so cool!', 1],
  ['padre / padrísimo', 'cool / awesome', 'La fiesta estuvo padrísima.', 'The party was awesome.', 1],
  ['la neta', 'the truth; for real', 'La neta, no sé.', "Honestly, I don't know.", 1, '“¿Neta?” = Really? / Seriously?'],
  ['órale', 'wow / OK / come on / let’s go', '¡Órale, qué rápido!', 'Wow, that was fast!', 1, 'Meaning depends on tone.'],
  ['ándale', 'come on / hurry up / exactly', 'Ándale, vámonos.', "Come on, let's go.", 1],
  ['¡Híjole!', 'Oh man! / Yikes!', '¡Híjole, se me olvidó!', 'Oh man, I forgot!', 1],
  ['ahorita', 'right now / in a bit / maybe never', 'Ahorita lo hago.', "I'll do it in a bit.", 1, 'The diminutive of “ahora” — famously elastic.'],
  ['¿Mande?', 'Pardon? / Sorry?', '—Oye. —¿Mande?', '—Hey. —Yes? / Pardon?', 1, 'Polite; saying just “¿Qué?” can sound rude.'],
  ['sale', 'OK / deal', '—¿A las ocho? —¡Sale!', '—At eight? —Deal!', 1],
  ['simón', 'yes, yeah', '—¿Vienes? —Simón.', '—Are you coming? —Yeah.', 2],
  ['nel', 'nope', '—¿Quieres? —Nel, gracias.', '—Want some? —Nope, thanks.', 2],
  ['la chamba', 'job, work', 'Tengo mucha chamba.', 'I have a lot of work.', 1, '“Chambear” = to work.'],
  ['la lana', 'money', 'No traigo lana.', "I don't have money on me.", 1],
  ['el cuate', 'buddy, friend', 'Es mi cuate de la prepa.', "He's my buddy from high school.", 1, 'From Nahuatl “cóatl” (twin).'],
  ['el/la carnal', 'brother / close friend', '¿Qué pasó, carnal?', "What's up, bro?", 2],
  ['el compa', 'buddy, pal', 'Voy con unos compas.', "I'm going with some buddies.", 1, 'Short for compadre.'],
  ['la chela', 'beer', '¿Unas chelas?', 'Some beers?', 1],
  ['la cruda', 'hangover', 'Traigo una cruda horrible.', 'I have a horrible hangover.', 1, '“Estar crudo” = to be hungover.'],
  ['fresa', 'posh, preppy, stuck-up', 'Ella es bien fresa.', "She's really posh.", 1],
  ['gacho', 'mean, uncool, awful', '¡Qué gacho!', "That's so mean!", 1],
  ['chafa', 'cheap, low-quality', 'Este cargador es bien chafa.', 'This charger is really crappy.', 1],
  ['codo', 'stingy (cheap person)', 'No seas codo, invita.', "Don't be stingy, treat us.", 1],
  ['¡Aguas!', 'Watch out! / Heads up!', '¡Aguas con el perro!', 'Watch out for the dog!', 1],
  ['¿A poco?', 'Really? / No way?', '¿A poco ya terminaste?', 'No way, you already finished?', 1],
  ['¡No manches!', 'No way! / You’re kidding!', '¡No manches, qué caro!', "No way, that's expensive!", 1, 'The clean version of a ruder phrase.'],
  ['¡Qué oso!', 'How embarrassing!', '¡Qué oso, me equivoqué de nombre!', 'How embarrassing, I got the name wrong!', 1],
  ['echar la hueva', 'to laze around', 'Hoy voy a echar la hueva.', "Today I'm going to laze around.", 2, '“Qué hueva” = what a drag.'],
  ['el chamaco / la chamaca', 'kid, youngster', 'Los chamacos están jugando.', 'The kids are playing.', 1],
  ['el chavo / la chava', 'young guy / young woman', 'Es un chavo muy amable.', "He's a very kind young guy.", 1],
  ['chilango', 'person from Mexico City', 'Es chilango de corazón.', "He's a chilango at heart.", 1, 'Once teasing, now worn with pride.', 'CDMX'],
  ['tapatío', 'person from Guadalajara', 'Los tapatíos aman la birria.', 'People from Guadalajara love birria.', 1, undefined, 'Jalisco'],
  ['regio', 'person from Monterrey', 'Es regia, habla muy rápido.', "She's from Monterrey, she talks fast.", 1, undefined, 'Nuevo León'],
  ['la plebe', 'the guys, the crew', '¿Dónde anda la plebe?', 'Where is the crew?', 2, undefined, 'Sinaloa / North'],
  ['¡Fierro!', "Let's go! / Go for it!", '¡Fierro, pariente!', "Let's go, buddy!", 2, undefined, 'North'],
  ['¡Bomba!', 'shouted to stop the music for a funny, flirty rhyme', '¡Bomba!', '(Yucatecan party tradition — then someone recites a verse)', 1, undefined, 'Yucatán'],
  ['el aventón', 'a ride (lift)', '¿Me das un aventón?', 'Can you give me a ride?', 1],
  ['la troca', 'pickup truck', 'Se subió a la troca.', 'He got into the truck.', 1, undefined, 'North'],
  ['el camión', 'bus', 'Me fui en camión.', 'I went by bus.', 1],
  ['el depa', 'apartment', 'Vente a mi depa.', 'Come over to my apartment.', 1],
  ['el refri', 'fridge', 'Hay chelas en el refri.', "There's beer in the fridge.", 1],
  ['el chisme', 'gossip', '¿Ya supiste el chisme?', 'Did you hear the gossip?', 1, '“Chismoso” = gossipy person.'],
  ['echar relajo', 'to goof around', 'Nos la pasamos echando relajo.', 'We spent the whole time goofing around.', 1],
  ['estar crudo', 'to be hungover', 'Estoy bien crudo.', "I'm so hungover.", 1],
  ['ponerse las pilas', 'to get your act together / wake up', '¡Ponte las pilas!', 'Get with it!', 1, 'Literally: put in your batteries.'],
  ['ni modo', 'oh well / no way around it', 'Ni modo, ya se fue el camión.', 'Oh well, the bus already left.', 1],
  ['¿Qué pedo?', "What's up? / What's the problem?", '¿Qué pedo, güey?', "What's up, dude?", 3, 'Very common among friends but vulgar. Never with elders or at work.'],
  ['güey / wey', 'dude, man (or "idiot" depending on tone)', 'No, güey, no fue así.', "No, dude, that's not how it was.", 2, 'Affectionate among friends; offensive to strangers.'],
  ['pinche', 'damn / lousy (intensifier)', 'El pinche tráfico.', 'The damn traffic.', 3, 'Vulgar intensifier. Recognize it; use with care.'],
  ['chingón', 'awesome, badass', '¡Está chingón!', "It's awesome!", 3, 'Vulgar but extremely common. Avoid in formal settings.'],
  ['¡Qué padre!', 'How cool!', '¡Qué padre que viniste!', 'How cool that you came!', 1],
  ['mamalón', 'awesome, impressive', 'Tu outfit está mamalón.', 'Your outfit is awesome.', 2],
  ['un chorro', 'a lot', 'Te quiero un chorro.', 'I love you a lot.', 1],
  ['tantito', 'a little bit', 'Espérame tantito.', 'Wait for me a little.', 1],
  ['¿Qué tranza?', "What's up?", '¿Qué tranza, carnal?', "What's up, bro?", 2],
  ['¿Cómo ves?', 'What do you think?', 'Vamos al cine, ¿cómo ves?', "Let's go to the movies, what do you think?", 1],
  ['está cañón', "it's tough / it's intense", 'Está cañón el tráfico hoy.', 'The traffic is brutal today.', 1],
  ['de pelos', 'awesome, perfect', '¡Quedó de pelos!', 'It turned out awesome!', 1],
  ['al chile', 'honestly, straight up', 'Al chile, no me gustó.', "Honestly, I didn't like it.", 2],
  ['naco', 'tacky, lowbrow (classist insult)', 'No digas “naco”, es ofensivo.', "Don't say “naco”, it's offensive.", 3, 'Classist and offensive. Know it so you understand it — don’t use it.'],
  ['¡Ay, wey!', 'Oh my god! / Whoa!', '¡Ay, wey, qué susto!', 'Whoa, what a scare!', 2],
  ['ya merito', 'almost there', 'Ya merito llegamos.', "We're almost there.", 1],
  ['¡Sobres!', "Let's do it! / Deal!", '—¿Vamos? —¡Sobres!', "—Shall we go? —Let's do it!", 2],
];

export const SLANG: Slang[] = rows.map(([term, meaning, ex, exEn, spice, note, region], i) => ({
  id: `slang-${i}`, term, meaning, ex, exEn, spice, note, region,
}));

/** Spain vs Mexico vocabulary differences. */
export const SPAIN_VS_MEXICO: { en: string; mx: string; es: string; note?: string }[] = [
  { en: 'car', mx: 'el carro', es: 'el coche' },
  { en: 'computer', mx: 'la computadora', es: 'el ordenador' },
  { en: 'cell phone', mx: 'el celular', es: 'el móvil' },
  { en: 'juice', mx: 'el jugo', es: 'el zumo' },
  { en: 'glasses', mx: 'los lentes', es: 'las gafas' },
  { en: 'swimming pool', mx: 'la alberca', es: 'la piscina' },
  { en: 'bus', mx: 'el camión', es: 'el autobús' },
  { en: 'straw', mx: 'el popote', es: 'la pajita' },
  { en: 'potato', mx: 'la papa', es: 'la patata' },
  { en: 'OK / alright', mx: 'sale / órale', es: 'vale' },
  { en: 'you all', mx: 'ustedes', es: 'vosotros', note: 'Mexico never uses vosotros in daily speech.' },
  { en: 'to drive', mx: 'manejar', es: 'conducir' },
  { en: 'to chat', mx: 'platicar', es: 'charlar' },
  { en: 'to rent', mx: 'rentar', es: 'alquilar' },
  { en: 'to get angry', mx: 'enojarse', es: 'enfadarse' },
  { en: 'bedroom', mx: 'la recámara', es: 'el dormitorio' },
  { en: 'apartment', mx: 'el departamento', es: 'el piso' },
  { en: 'jacket', mx: 'la chamarra', es: 'la chaqueta' },
  { en: 'sidewalk', mx: 'la banqueta', es: 'la acera' },
  { en: 'ticket', mx: 'el boleto', es: 'el billete' },
  { en: 'avocado', mx: 'el aguacate', es: 'el aguacate', note: 'Same! (Argentina says palta)' },
  { en: 'peanut', mx: 'el cacahuate', es: 'el cacahuete' },
  { en: 'corn (cob)', mx: 'el elote', es: 'la mazorca' },
  { en: 'trunk (car)', mx: 'la cajuela', es: 'el maletero' },
  { en: 'pen', mx: 'la pluma', es: 'el bolígrafo' },
  { en: 'meeting', mx: 'la junta', es: 'la reunión' },
  { en: 'waiter', mx: 'el mesero', es: 'el camarero' },
  { en: 'shower', mx: 'la regadera', es: 'la ducha' },
  { en: 'cool!', mx: '¡qué padre! / ¡qué chido!', es: '¡qué guay!' },
  { en: 'dude', mx: 'güey', es: 'tío' },
  { en: 'kid', mx: 'el chamaco / el niño', es: 'el chaval / el crío' },
  { en: 'money (slang)', mx: 'la lana', es: 'la pasta' },
  { en: 'work (slang)', mx: 'la chamba', es: 'el curro' },
  { en: 'to pick up / to grab', mx: 'agarrar', es: 'coger', note: 'In Mexico “coger” is vulgar slang — use “agarrar” or “tomar”!' },
  { en: 'sandwich (on a roll)', mx: 'la torta', es: 'el bocadillo', note: 'In Spain “torta” can mean a slap!' },
  { en: 'refrigerator', mx: 'el refri', es: 'la nevera' },
  { en: 'reservation', mx: 'la reservación', es: 'la reserva' },
  { en: 'I miss you', mx: 'te extraño', es: 'te echo de menos' },
];

/** Spain-only words that may appear in machine translations, with Mexican alternatives. */
export const SPAIN_TO_MX_HINTS: Record<string, string> = {
  coche: 'carro', coches: 'carros', ordenador: 'computadora', ordenadores: 'computadoras', móvil: 'celular',
  móviles: 'celulares', zumo: 'jugo', zumos: 'jugos', gafas: 'lentes', piscina: 'alberca', piscinas: 'albercas',
  pajita: 'popote', patata: 'papa', patatas: 'papas', vosotros: 'ustedes', vosotras: 'ustedes',
  conducir: 'manejar', conduce: 'maneja', conduzco: 'manejo', alquilar: 'rentar', alquiler: 'renta', enfadado: 'enojado',
  enfadada: 'enojada', enfadarse: 'enojarse', dormitorio: 'recámara', chaqueta: 'chamarra', acera: 'banqueta',
  cacahuete: 'cacahuate', cacahuetes: 'cacahuates', maletero: 'cajuela',
  bolígrafo: 'pluma', camarero: 'mesero', camarera: 'mesera', ducha: 'regadera', guay: 'padre / chido', coger: 'agarrar / tomar', nevera: 'refri', charlar: 'platicar', 
  habéis: 'han (ustedes)', tenéis: 'tienen (ustedes)', sois: 'son (ustedes)', estáis: 'están (ustedes)', queréis: 'quieren (ustedes)',
  podéis: 'pueden (ustedes)', vais: 'van (ustedes)', os: 'les / los (ustedes)',
};
