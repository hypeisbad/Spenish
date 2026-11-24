/** Pronunciation coach content. */

export interface Drill {
  es: string;
  en: string;
  tip?: string;
}

export const SOUND_GUIDE: { sound: string; how: string; ex: string }[] = [
  { sound: 'a e i o u', how: 'Five pure, short vowels — never glide like English “ay” or “oh”.', ex: 'mesa · piso · luna' },
  { sound: 'r (single)', how: 'A quick tap of the tongue, like the “tt” in American “butter”.', ex: 'pero · caro · para' },
  { sound: 'rr / initial r', how: 'A rolled trill — several rapid taps.', ex: 'perro · carro · rojo' },
  { sound: 'll / y', how: 'In Mexico both sound like English “y” in “yes”.', ex: 'llamar · pollo · yo' },
  { sound: 'j / g (before e, i)', how: 'A breathy “h”, softer than Spain’s throaty sound.', ex: 'jugo · gente · México' },
  { sound: 'x in Mexican names', how: 'Usually “j/h” (México, Oaxaca), sometimes “s” (Xochimilco) or “sh” (Mayan names).', ex: 'México · Xochimilco · Xcaret' },
  { sound: 'c (before e, i) / z', how: 'Seseo: pronounced like “s” in Mexico (never “th” as in Spain).', ex: 'cielo · zapato · gracias' },
  { sound: 'ñ', how: 'Like “ny” in “canyon”.', ex: 'año · niño · señora' },
  { sound: 'h', how: 'Always silent.', ex: 'hola · hacer · ahorita' },
  { sound: 'tl', how: 'From Nahuatl — said as one sound at the start of a syllable.', ex: 'Tlaxcala · tlacoyo · Popocatépetl' },
  { sound: 'b / v', how: 'Same sound: “b” at the start, softer between vowels.', ex: 'vamos · bebé · uva' },
  { sound: 'd between vowels', how: 'Soft, like “th” in “this”.', ex: 'nada · cansado · todo' },
];

export const DRILL_SETS: { id: string; title: string; emoji: string; items: Drill[] }[] = [
  {
    id: 'basics', title: 'Frases básicas', emoji: '🗣️', items: [
      { es: 'Buenos días', en: 'Good morning' },
      { es: '¿Cómo estás?', en: 'How are you?' },
      { es: 'Mucho gusto', en: 'Nice to meet you' },
      { es: 'Muchas gracias', en: 'Thank you very much' },
      { es: '¿Dónde está el baño?', en: 'Where is the bathroom?' },
      { es: 'Me da dos tacos, por favor', en: 'Can I have two tacos, please' },
      { es: 'La cuenta, por favor', en: 'The check, please' },
      { es: 'No entiendo', en: "I don't understand" },
    ],
  },
  {
    id: 'rr', title: 'La erre', emoji: '🌀', items: [
      { es: 'perro', en: 'dog', tip: 'Roll it! Compare with “pero” (but).' },
      { es: 'carro', en: 'car' },
      { es: 'arroz', en: 'rice' },
      { es: 'el ferrocarril', en: 'the railroad' },
      { es: 'Ramón corre rápido', en: 'Ramón runs fast' },
    ],
  },
  {
    id: 'places', title: 'Lugares de México', emoji: '🗺️', items: [
      { es: 'México', en: 'Mexico', tip: 'The x sounds like a breathy h.' },
      { es: 'Oaxaca', en: 'Oaxaca', tip: 'wa-HA-ka' },
      { es: 'Guadalajara', en: 'Guadalajara' },
      { es: 'Xochimilco', en: 'Xochimilco', tip: 'so-chee-MEEL-ko' },
      { es: 'Michoacán', en: 'Michoacán' },
      { es: 'Chihuahua', en: 'Chihuahua' },
      { es: 'Teotihuacán', en: 'Teotihuacán' },
      { es: 'Popocatépetl', en: 'Popocatépetl', tip: 'po-po-ka-TEH-petl' },
      { es: 'Tlaquepaque', en: 'Tlaquepaque', tip: 'tla-keh-PA-keh' },
    ],
  },
  {
    id: 'trabalenguas', title: 'Trabalenguas', emoji: '🌪️', items: [
      { es: 'Tres tristes tigres tragaban trigo en un trigal', en: 'Three sad tigers were swallowing wheat in a wheat field' },
      { es: 'Erre con erre cigarro, erre con erre barril, rápido corren los carros cargados de azúcar del ferrocarril', en: 'R with r cigar, r with r barrel, fast run the cars loaded with sugar of the railroad' },
      { es: 'Pepe Pecas pica papas con un pico', en: 'Pepe Pecas chops potatoes with a pick' },
      { es: 'Como poco coco como, poco coco compro', en: 'Since I eat little coconut, I buy little coconut' },
      { es: 'Pablito clavó un clavito, ¿qué clavito clavó Pablito?', en: 'Little Pablo nailed a little nail, what little nail did little Pablo nail?' },
    ],
  },
  {
    id: 'slang', title: 'Suena chilango', emoji: '🤙', items: [
      { es: '¿Qué onda, güey?', en: "What's up, dude?" },
      { es: '¡No manches, está bien padre!', en: "No way, it's really cool!" },
      { es: 'Ahorita vengo', en: "I'll be right back" },
      { es: '¡Órale, qué chido!', en: 'Wow, how cool!' },
      { es: '¿Neta? ¡Qué oso!', en: 'Really? How embarrassing!' },
    ],
  },
];
