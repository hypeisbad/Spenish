/** Culture cards & Mexican holiday calendar. */

export interface CultureCard {
  id: string;
  title: string;
  emoji: string;
  tag: string;
  body: string;
  words: [string, string][];
}

export const CULTURE: CultureCard[] = [
  {
    id: 'muertos', title: 'Día de Muertos', emoji: '💀', tag: 'Fiesta · 1–2 nov',
    body: 'Families build ofrendas (altars) with photos, marigolds, candles, pan de muerto and the favorite foods of loved ones who have died, to welcome their souls home. Cemeteries fill with music, food and flowers. It is a celebration of memory and love, recognized by UNESCO as Intangible Cultural Heritage.',
    words: [['la ofrenda', 'altar'], ['el cempasúchil', 'marigold'], ['la calaverita', 'sugar skull / funny poem'], ['el panteón', 'cemetery']],
  },
  {
    id: 'posadas', title: 'Las Posadas', emoji: '🕯️', tag: 'Fiesta · 16–24 dic',
    body: 'Nine nights of celebrations reenacting Mary and Joseph’s search for shelter. Guests sing a call-and-response song at the door, then everyone comes in for ponche (hot fruit punch), tamales, and breaking piñatas.',
    words: [['el ponche', 'warm fruit punch'], ['la piñata', 'piñata'], ['los aguinaldos', 'treat bags / Christmas bonus'], ['pedir posada', 'to ask for shelter']],
  },
  {
    id: 'grito', title: 'El Grito de Independencia', emoji: '🇲🇽', tag: 'Fiesta · 15–16 sep',
    body: 'On the night of September 15, the president rings a bell at the National Palace and shouts “¡Viva México!” to commemorate Miguel Hidalgo’s 1810 call to independence. Plazas fill with people, pozole, tequila and fireworks. September 16 is Independence Day — not May 5!',
    words: [['¡Viva México!', 'Long live Mexico!'], ['el pozole', 'hominy stew'], ['los cohetes', 'fireworks'], ['las fiestas patrias', 'national holidays']],
  },
  {
    id: 'cinco-mayo', title: 'Cinco de Mayo', emoji: '⚔️', tag: 'Historia · 5 may',
    body: 'Commemorates the Mexican army’s 1862 victory over French forces at the Battle of Puebla. It is a regional observance in Puebla and much bigger in the United States than in most of Mexico.',
    words: [['la batalla', 'battle'], ['el ejército', 'army'], ['Puebla', 'city & state east of CDMX']],
  },
  {
    id: 'reyes', title: 'Día de Reyes', emoji: '👑', tag: 'Fiesta · 6 ene',
    body: 'The Three Kings bring gifts to children. Families share a rosca de reyes, a ring-shaped sweet bread with tiny baby figurines hidden inside. Whoever finds one hosts a tamal party on February 2, Día de la Candelaria.',
    words: [['la rosca', 'ring-shaped sweet bread'], ['el muñequito', 'little figurine'], ['la Candelaria', 'Candlemas (Feb 2)']],
  },
  {
    id: 'taco-pastor', title: 'El taco al pastor', emoji: '🌮', tag: 'Comida',
    body: 'Lebanese immigrants brought shawarma-style spit-roasting to Puebla and Mexico City in the early 20th century. Mexicans swapped lamb for pork, marinated it in chiles and achiote, and added pineapple. The result became the iconic taco of CDMX nights.',
    words: [['el trompo', 'vertical spit'], ['la piña', 'pineapple'], ['el taquero', 'taco maker'], ['con todo', 'with everything']],
  },
  {
    id: 'mole', title: 'El mole', emoji: '🍫', tag: 'Comida',
    body: '“Mole” comes from the Nahuatl “mōlli” (sauce). Mole poblano blends dozens of ingredients — dried chiles, spices, nuts, seeds and a touch of chocolate. Oaxaca is famous for its seven moles, including mole negro.',
    words: [['el mole poblano', 'Puebla-style mole'], ['el chile', 'chili pepper'], ['moler', 'to grind']],
  },
  {
    id: 'lucha', title: 'Lucha libre', emoji: '🤼', tag: 'Cultura',
    body: 'Acrobatic professional wrestling where masked luchadores battle as técnicos (good guys) or rudos (villains). Losing your mask in a “lucha de apuestas” is the ultimate humiliation. Arena México in CDMX is the sport’s cathedral.',
    words: [['el luchador', 'wrestler'], ['la máscara', 'mask'], ['los rudos', 'the villains'], ['los técnicos', 'the good guys']],
  },
  {
    id: 'mariachi', title: 'El mariachi', emoji: '🎺', tag: 'Música',
    body: 'Born in Jalisco, the mariachi ensemble combines violins, trumpets, the guitarrón (big bass guitar) and the vihuela. UNESCO named it Intangible Cultural Heritage in 2011. Plaza Garibaldi in CDMX is where you go to hire one at midnight.',
    words: [['el guitarrón', 'bass guitar'], ['la serenata', 'serenade'], ['el traje de charro', 'charro suit']],
  },
  {
    id: 'ahorita', title: 'Ahorita y el tiempo mexicano', emoji: '⏳', tag: 'Costumbres',
    body: '“Ahorita” can mean right now, in five minutes, later, or never. Social events often start later than announced, but business meetings and flights won’t wait. When in doubt, ask: “¿Ahorita ahorita, o ahorita al rato?”',
    words: [['ahorita', 'right now / in a while'], ['al rato', 'later'], ['ahora mismo', 'right this moment']],
  },
  {
    id: 'cortesia', title: 'La cortesía mexicana', emoji: '🙏', tag: 'Costumbres',
    body: 'Politeness matters: greet everyone with “buenos días”, say “con permiso” when passing, “provecho” to people eating, and use “¿mande?” instead of “¿qué?”. Requests are softened with “¿me podría…?” or “¿sería tan amable de…?”.',
    words: [['¿Mande?', 'Pardon?'], ['Con permiso', 'Excuse me'], ['¡Provecho!', 'Enjoy your meal!'], ['Para servirle', 'At your service']],
  },
  {
    id: 'nahuatl', title: 'Palabras del náhuatl', emoji: '🏺', tag: 'Idioma',
    body: 'Nahuatl, the language of the Mexica (Aztecs), is still spoken by over 1.5 million people and gave English and Spanish many words: chocolate (xocolatl), tomate (tomatl), aguacate (ahuacatl), chile (chīlli), chicle (tzictli), coyote (coyōtl) and more.',
    words: [['el tianguis', 'market (tianquiztli)'], ['el popote', 'straw (popotl)'], ['el guajolote', 'turkey (huexōlōtl)'], ['el cuate', 'buddy (cōātl, twin)']],
  },
  {
    id: 'regiones', title: 'Un país de regiones', emoji: '🗺️', tag: 'Geografía',
    body: 'Mexico has 32 federal entities and huge regional variety. Norteños speak fast and say “¡fierro!”, chilangos in CDMX love “güey”, tapatíos in Guadalajara are proud of birria and tequila, and Yucatecos mix Mayan words into their Spanish (“¡bomba!”, “xix” for leftovers).',
    words: [['norteño', 'from the north'], ['chilango', 'from CDMX'], ['tapatío', 'from Guadalajara'], ['yucateco', 'from Yucatán']],
  },
  {
    id: 'loteria', title: 'La Lotería', emoji: '🎴', tag: 'Juegos',
    body: 'A bingo-like game with illustrated cards. A caller (el gritón) sings a playful verse for each card — “¡El que le cantó a San Pedro!” means El Gallo. Players mark their tabla with beans; first to complete it shouts “¡Lotería!”. Try it in the Games section!',
    words: [['la tabla', 'game board'], ['el gritón', 'the caller'], ['los frijolitos', 'beans used as markers'], ['¡Lotería!', 'Bingo!']],
  },
];

export interface Holiday {
  name: string;
  en: string;
  emoji: string;
  date: (year: number) => Date;
  desc: string;
}

function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const d = new Date(year, month, 1);
  const offset = (weekday - d.getDay() + 7) % 7;
  return new Date(year, month, 1 + offset + (n - 1) * 7);
}

/** Anonymous Gregorian algorithm (Meeus/Jones/Butcher). */
export function easter(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

export const HOLIDAYS: Holiday[] = [
  { name: 'Año Nuevo', en: "New Year's Day", emoji: '🎆', date: (y) => new Date(y, 0, 1), desc: 'Eat 12 grapes at midnight — one wish per grape.' },
  { name: 'Día de Reyes', en: 'Three Kings Day', emoji: '👑', date: (y) => new Date(y, 0, 6), desc: 'Rosca de reyes and gifts for kids.' },
  { name: 'Día de la Candelaria', en: 'Candlemas', emoji: '🫔', date: (y) => new Date(y, 1, 2), desc: 'Whoever found the baby in the rosca buys the tamales.' },
  { name: 'Día de la Constitución', en: 'Constitution Day', emoji: '📜', date: (y) => nthWeekday(y, 1, 1, 1), desc: 'Observed the first Monday of February.' },
  { name: 'Día del Amor y la Amistad', en: "Valentine's Day", emoji: '💘', date: (y) => new Date(y, 1, 14), desc: 'Love AND friendship — friends exchange gifts too.' },
  { name: 'Día de la Bandera', en: 'Flag Day', emoji: '🇲🇽', date: (y) => new Date(y, 1, 24), desc: 'Honoring the green, white and red.' },
  { name: 'Natalicio de Benito Juárez', en: "Benito Juárez's Birthday", emoji: '⚖️', date: (y) => nthWeekday(y, 2, 1, 3), desc: 'Observed the third Monday of March.' },
  { name: 'Viernes Santo', en: 'Good Friday', emoji: '✝️', date: (y) => { const e = easter(y); return new Date(e.getFullYear(), e.getMonth(), e.getDate() - 2); }, desc: 'Semana Santa: processions and beach vacations.' },
  { name: 'Día del Niño', en: "Children's Day", emoji: '🧒', date: (y) => new Date(y, 3, 30), desc: 'Schools throw parties for kids.' },
  { name: 'Día del Trabajo', en: 'Labor Day', emoji: '🛠️', date: (y) => new Date(y, 4, 1), desc: 'National holiday.' },
  { name: 'Batalla de Puebla', en: 'Cinco de Mayo', emoji: '⚔️', date: (y) => new Date(y, 4, 5), desc: 'Victory over the French in 1862.' },
  { name: 'Día de las Madres', en: "Mother's Day", emoji: '💐', date: (y) => new Date(y, 4, 10), desc: 'Always May 10 in Mexico — serenatas for mom!' },
  { name: 'Día del Padre', en: "Father's Day", emoji: '👔', date: (y) => nthWeekday(y, 5, 0, 3), desc: 'Third Sunday of June.' },
  { name: 'El Grito', en: 'Independence Eve', emoji: '🔔', date: (y) => new Date(y, 8, 15), desc: '¡Viva México! at 11 pm in every plaza.' },
  { name: 'Día de la Independencia', en: 'Independence Day', emoji: '🇲🇽', date: (y) => new Date(y, 8, 16), desc: 'Parades and fiestas patrias.' },
  { name: 'Día de Muertos', en: 'Day of the Dead', emoji: '💀', date: (y) => new Date(y, 10, 2), desc: 'Ofrendas, marigolds and cemetery vigils (Nov 1–2).' },
  { name: 'Día de la Revolución', en: 'Revolution Day', emoji: '🐎', date: (y) => nthWeekday(y, 10, 1, 3), desc: 'Observed the third Monday of November.' },
  { name: 'Día de la Virgen de Guadalupe', en: 'Our Lady of Guadalupe', emoji: '🌹', date: (y) => new Date(y, 11, 12), desc: 'Millions of pilgrims visit the Basílica in CDMX.' },
  { name: 'Las Posadas', en: 'Las Posadas begin', emoji: '🕯️', date: (y) => new Date(y, 11, 16), desc: 'Nine nights of piñatas, ponche and song.' },
  { name: 'Nochebuena', en: 'Christmas Eve', emoji: '🎄', date: (y) => new Date(y, 11, 24), desc: 'The big family dinner is on the 24th.' },
  { name: 'Navidad', en: 'Christmas Day', emoji: '🎁', date: (y) => new Date(y, 11, 25), desc: 'Recalentado: eating last night’s leftovers!' },
  { name: 'Día de los Santos Inocentes', en: "Mexico's April Fools'", emoji: '🃏', date: (y) => new Date(y, 11, 28), desc: 'Pranks! Don’t lend anything today.' },
];

/** Upcoming holidays from `from` (inclusive of today). */
export function upcomingHolidays(from = new Date(), count = 3): { h: Holiday; date: Date; days: number }[] {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const list: { h: Holiday; date: Date; days: number }[] = [];
  for (const y of [today.getFullYear(), today.getFullYear() + 1]) {
    for (const h of HOLIDAYS) {
      const d = h.date(y);
      const days = Math.round((d.getTime() - today.getTime()) / 86400000);
      if (days >= 0) list.push({ h, date: d, days });
    }
  }
  return list.sort((a, b) => a.days - b.days).slice(0, count);
}
