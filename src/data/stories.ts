/** Graded readers — original short stories in Mexican Spanish. */

export interface Story {
  id: string;
  title: string;
  titleEn: string;
  level: 'A1' | 'A2' | 'B1';
  emoji: string;
  minutes: number;
  sentences: { es: string; en: string }[];
  glossary: Record<string, string>;
  questions: { q: string; qEn: string; options: string[]; answer: number }[];
}

type L = [string, string];

function story(s: Omit<Story, 'sentences'> & { lines: L[] }): Story {
  const { lines, ...rest } = s;
  return { ...rest, sentences: lines.map(([es, en]) => ({ es, en })) };
}

export const STORIES: Story[] = [
  story({
    id: 'tacos-medianoche', title: 'Tacos a medianoche', titleEn: 'Midnight tacos', level: 'A1', emoji: '🌮', minutes: 2,
    lines: [
      ['Son las doce de la noche.', 'It is twelve midnight.'],
      ['Ana y Luis tienen mucha hambre.', 'Ana and Luis are very hungry.'],
      ['Caminan a la taquería de la esquina.', 'They walk to the taquería on the corner.'],
      ['El taquero dice: “¡Buenas noches! ¿Qué les doy?”', 'The taco maker says: “Good evening! What can I get you?”'],
      ['Ana pide cuatro tacos al pastor con todo.', 'Ana orders four tacos al pastor with everything.'],
      ['Luis pide tres tacos de suadero sin cebolla.', 'Luis orders three suadero tacos without onion.'],
      ['La salsa verde pica mucho.', 'The green salsa is very spicy.'],
      ['Luis toma agua de horchata.', 'Luis drinks horchata.'],
      ['Los tacos están deliciosos.', 'The tacos are delicious.'],
      ['Ana paga ochenta pesos.', 'Ana pays eighty pesos.'],
      ['“¡Gracias, joven! ¡Provecho!”, dice el taquero.', '“Thank you, young man! Enjoy!”, says the taco maker.'],
    ],
    glossary: {
      son: 'it is (for time)', noche: 'night', tienen: 'they have', hambre: 'hunger', caminan: 'they walk',
      taquería: 'taco shop', esquina: 'corner', taquero: 'taco maker', dice: 'says', les: 'to you (all)', doy: 'I give',
      pide: 'orders / asks for', todo: 'everything', sin: 'without', cebolla: 'onion', pica: 'is spicy', mucho: 'a lot',
      toma: 'drinks', están: 'are', deliciosos: 'delicious', paga: 'pays', ochenta: 'eighty', joven: 'young man (polite address)',
      suadero: 'suadero (beef cut)', verde: 'green', provecho: 'enjoy your meal',
    },
    questions: [
      { q: '¿Qué hora es?', qEn: 'What time is it?', options: ['Las doce de la noche', 'Las doce del día', 'Las ocho de la noche'], answer: 0 },
      { q: '¿Qué toma Luis?', qEn: 'What does Luis drink?', options: ['Café', 'Agua de horchata', 'Cerveza'], answer: 1 },
      { q: '¿Cuánto paga Ana?', qEn: 'How much does Ana pay?', options: ['Ochenta pesos', 'Dieciocho pesos', 'Ocho pesos'], answer: 0 },
    ],
  }),
  story({
    id: 'mi-familia', title: 'Mi familia de Puebla', titleEn: 'My family from Puebla', level: 'A1', emoji: '👨‍👩‍👧‍👦', minutes: 2,
    lines: [
      ['Hola, me llamo Diego y soy de Puebla.', 'Hi, my name is Diego and I am from Puebla.'],
      ['Tengo veinte años.', 'I am twenty years old.'],
      ['Vivo con mis papás y mi hermana Sofía.', 'I live with my parents and my sister Sofía.'],
      ['Mi papá es maestro y mi mamá es doctora.', 'My dad is a teacher and my mom is a doctor.'],
      ['Sofía tiene quince años y le encanta bailar.', 'Sofía is fifteen and she loves to dance.'],
      ['Los domingos comemos en casa de mis abuelos.', 'On Sundays we eat at my grandparents’ house.'],
      ['Mi abuela cocina mole poblano.', 'My grandma cooks mole poblano.'],
      ['¡Es el mejor mole del mundo!', 'It is the best mole in the world!'],
      ['Después de comer, platicamos toda la tarde.', 'After eating, we chat all afternoon.'],
    ],
    glossary: {
      llamo: 'I call (myself)', soy: 'I am', tengo: 'I have', años: 'years', vivo: 'I live', papás: 'parents',
      hermana: 'sister', maestro: 'teacher', doctora: 'doctor (female)', encanta: 'loves (lit. enchants)', bailar: 'to dance',
      domingos: 'Sundays', comemos: 'we eat', abuelos: 'grandparents', abuela: 'grandmother', cocina: 'cooks',
      mejor: 'best', mundo: 'world', después: 'after', platicamos: 'we chat', tarde: 'afternoon', toda: 'all / whole',
      mole: 'mole (rich chili-chocolate sauce)', poblano: 'from Puebla', quince: 'fifteen', veinte: 'twenty',
    },
    questions: [
      { q: '¿De dónde es Diego?', qEn: 'Where is Diego from?', options: ['De Oaxaca', 'De Puebla', 'De Monterrey'], answer: 1 },
      { q: '¿Qué le encanta a Sofía?', qEn: 'What does Sofía love?', options: ['Cocinar', 'Bailar', 'Leer'], answer: 1 },
      { q: '¿Qué cocina la abuela?', qEn: 'What does grandma cook?', options: ['Pozole', 'Tamales', 'Mole poblano'], answer: 2 },
    ],
  }),
  story({
    id: 'tianguis', title: 'Un domingo en el tianguis', titleEn: 'A Sunday at the street market', level: 'A2', emoji: '🍉', minutes: 3,
    lines: [
      ['Cada domingo, mi calle se convierte en un tianguis.', 'Every Sunday, my street turns into a street market.'],
      ['Desde temprano, los vendedores ponen sus puestos de colores.', 'From early on, the vendors set up their colorful stalls.'],
      ['Hay de todo: fruta, ropa, juguetes y hasta plantas.', 'There is everything: fruit, clothes, toys and even plants.'],
      ['Primero, compré un kilo de mangos.', 'First, I bought a kilo of mangoes.'],
      ['El señor me dijo: “Pruébelo, güerita, está bien dulce.”', 'The man told me: “Try it, blondie, it’s really sweet.”'],
      ['Después busqué una chamarra para el invierno.', 'Then I looked for a jacket for the winter.'],
      ['Costaba trescientos pesos, pero le pregunté: “¿Me la deja en doscientos cincuenta?”', 'It cost three hundred pesos, but I asked him: “Will you let me have it for two hundred fifty?”'],
      ['El vendedor sonrió y dijo: “Ándele pues.”', 'The vendor smiled and said: “Alright then.”'],
      ['Al final, comí una quesadilla de flor de calabaza.', 'At the end, I ate a squash-blossom quesadilla.'],
      ['Regresé a casa con las bolsas llenas y muy contenta.', 'I went back home with full bags and very happy.'],
    ],
    glossary: {
      cada: 'every', calle: 'street', convierte: 'turns into', vendedores: 'vendors', puestos: 'stalls', colores: 'colors',
      ropa: 'clothes', juguetes: 'toys', hasta: 'even / until', plantas: 'plants', compré: 'I bought', dijo: 'said / told',
      pruébelo: 'try it (formal)', güerita: 'blondie (friendly term for light-skinned person)', dulce: 'sweet', busqué: 'I looked for',
      chamarra: 'jacket', invierno: 'winter', costaba: 'it cost', pregunté: 'I asked', deja: 'leave / let have', sonrió: 'smiled',
      ándele: 'alright / go on (formal of ándale)', pues: 'then / well', comí: 'I ate', flor: 'flower', calabaza: 'squash',
      regresé: 'I returned', llenas: 'full', contenta: 'happy (female)', temprano: 'early', tianguis: 'street market',
    },
    questions: [
      { q: '¿Cuándo hay tianguis?', qEn: 'When is there a market?', options: ['Los sábados', 'Los domingos', 'Todos los días'], answer: 1 },
      { q: '¿Cuánto costaba la chamarra?', qEn: 'How much did the jacket cost?', options: ['250 pesos', '300 pesos', '350 pesos'], answer: 1 },
      { q: '¿Qué comió al final?', qEn: 'What did she eat at the end?', options: ['Una quesadilla', 'Un taco', 'Un mango'], answer: 0 },
    ],
  }),
  story({
    id: 'metro', title: 'Perdido en el metro', titleEn: 'Lost in the metro', level: 'A2', emoji: '🚇', minutes: 3,
    lines: [
      ['Mark llegó a la Ciudad de México el lunes.', 'Mark arrived in Mexico City on Monday.'],
      ['Quería ir al Zócalo, pero tomó la línea equivocada.', 'He wanted to go to the Zócalo, but he took the wrong line.'],
      ['El vagón estaba lleno y hacía mucho calor.', 'The train car was full and it was very hot.'],
      ['Le preguntó a una señora: “Disculpe, ¿esta línea va al Zócalo?”', 'He asked a lady: “Excuse me, does this line go to the Zócalo?”'],
      ['La señora le contestó amablemente: “No, joven. Bájese en la siguiente y cambie a la línea dos.”', 'The lady kindly answered: “No, young man. Get off at the next one and change to line two.”'],
      ['Mark le dio las gracias y se bajó.', 'Mark thanked her and got off.'],
      ['En la línea dos, un vendedor gritaba: “¡Lleve, lleve, chicles a diez pesos!”', 'On line two, a vendor was shouting: “Get them, get them, gum for ten pesos!”'],
      ['Por fin llegó al Zócalo.', 'Finally he arrived at the Zócalo.'],
      ['Vio la enorme bandera y la Catedral.', 'He saw the enormous flag and the Cathedral.'],
      ['Pensó: “Me perdí, pero valió la pena.”', 'He thought: “I got lost, but it was worth it.”'],
    ],
    glossary: {
      llegó: 'arrived', quería: 'wanted', tomó: 'took', línea: 'line', equivocada: 'wrong', vagón: 'train car', estaba: 'was',
      lleno: 'full', hacía: 'it was (weather)', calor: 'heat', preguntó: 'asked', señora: 'lady / ma’am', disculpe: 'excuse me',
      contestó: 'answered', amablemente: 'kindly', bájese: 'get off (formal)', siguiente: 'next', cambie: 'change (formal)',
      dio: 'gave', bajó: 'got off', gritaba: 'was shouting', lleve: 'take / buy (vendor’s call)', chicles: 'chewing gum',
      fin: 'end', 'por fin': 'finally', vio: 'saw', enorme: 'huge', bandera: 'flag', pensó: 'thought', perdí: 'I got lost',
      valió: 'was worth', pena: 'pain / sorrow', zócalo: 'main square (of CDMX)', catedral: 'cathedral',
    },
    questions: [
      { q: '¿Adónde quería ir Mark?', qEn: 'Where did Mark want to go?', options: ['Al aeropuerto', 'Al Zócalo', 'A Coyoacán'], answer: 1 },
      { q: '¿A qué línea tenía que cambiar?', qEn: 'Which line did he need to change to?', options: ['La línea uno', 'La línea dos', 'La línea tres'], answer: 1 },
      { q: '¿Qué vendía el vendedor?', qEn: 'What was the vendor selling?', options: ['Chicles', 'Tacos', 'Boletos'], answer: 0 },
    ],
  }),
  story({
    id: 'ofrenda', title: 'La ofrenda de la abuela', titleEn: "Grandma's altar", level: 'B1', emoji: '🕯️', minutes: 4,
    lines: [
      ['Cada año, a finales de octubre, mi familia pone una ofrenda en la sala.', 'Every year, at the end of October, my family sets up an altar in the living room.'],
      ['Este año es especial, porque es el primer Día de Muertos sin mi abuelo.', 'This year is special, because it is the first Day of the Dead without my grandfather.'],
      ['Mi abuela me pidió que la ayudara a decorarla.', 'My grandmother asked me to help her decorate it.'],
      ['Pusimos flores de cempasúchil, velas y papel picado de muchos colores.', 'We put marigold flowers, candles and colorful cut paper.'],
      ['Según la tradición, el olor de las flores guía a las almas a casa.', 'According to tradition, the scent of the flowers guides the souls home.'],
      ['También pusimos su foto, pan de muerto y una taza de café de olla, porque era su bebida favorita.', 'We also put his photo, bread of the dead and a cup of café de olla, because it was his favorite drink.'],
      ['Mi abuela me contó que él siempre cantaba mientras cocinaba.', 'My grandmother told me that he always sang while he cooked.'],
      ['Esa noche, toda la familia se reunió para recordarlo con historias y risas.', 'That night, the whole family got together to remember him with stories and laughter.'],
      ['No fue una noche triste; fue una noche llena de amor.', 'It was not a sad night; it was a night full of love.'],
      ['Ahora entiendo que, mientras lo recordemos, nunca se irá del todo.', 'Now I understand that, as long as we remember him, he will never be completely gone.'],
    ],
    glossary: {
      finales: 'end (of a period)', octubre: 'October', pone: 'puts / sets up', ofrenda: 'altar offering', sala: 'living room',
      especial: 'special', primer: 'first', pidió: 'asked', ayudara: 'help (subjunctive)', decorarla: 'to decorate it',
      pusimos: 'we put', flores: 'flowers', cempasúchil: 'marigold', velas: 'candles', 'papel picado': 'perforated paper banners',
      según: 'according to', tradición: 'tradition', olor: 'smell / scent', guía: 'guides', almas: 'souls', foto: 'photo',
      taza: 'cup', bebida: 'drink', contó: 'told', siempre: 'always', cantaba: 'used to sing', mientras: 'while / as long as',
      cocinaba: 'cooked', reunió: 'got together', recordarlo: 'to remember him', historias: 'stories', risas: 'laughter',
      triste: 'sad', llena: 'full', amor: 'love', entiendo: 'I understand', recordemos: 'we remember (subjunctive)',
      nunca: 'never', irá: 'will go', 'del todo': 'completely', abuela: 'grandmother', abuelo: 'grandfather',
    },
    questions: [
      { q: '¿Por qué es especial este año?', qEn: 'Why is this year special?', options: ['Porque es el primero sin el abuelo', 'Porque viajan a Oaxaca', 'Porque no hay ofrenda'], answer: 0 },
      { q: 'Según la tradición, ¿qué guía a las almas?', qEn: 'According to tradition, what guides the souls?', options: ['Las velas', 'El olor de las flores', 'La música'], answer: 1 },
      { q: '¿Cuál era la bebida favorita del abuelo?', qEn: "What was grandpa's favorite drink?", options: ['Tequila', 'Chocolate', 'Café de olla'], answer: 2 },
    ],
  }),
  story({
    id: 'llorona', title: 'La leyenda de la Llorona', titleEn: 'The legend of La Llorona', level: 'B1', emoji: '👻', minutes: 4,
    lines: [
      ['En México, casi todos los niños conocen la leyenda de la Llorona.', 'In Mexico, almost every child knows the legend of La Llorona.'],
      ['Dicen que hace muchos años vivía una mujer junto a un río.', 'They say that many years ago a woman lived next to a river.'],
      ['En un momento de desesperación, perdió a sus hijos en el agua.', 'In a moment of desperation, she lost her children in the water.'],
      ['Cuando se dio cuenta de lo que había pasado, lloró sin consuelo.', 'When she realized what had happened, she cried inconsolably.'],
      ['Desde entonces, su alma vaga por las calles y los ríos durante la noche.', 'Since then, her soul wanders the streets and rivers at night.'],
      ['La gente cuenta que se escucha un grito terrible: “¡Ay, mis hijos!”', 'People say a terrible cry is heard: “Oh, my children!”'],
      ['Las abuelas les dicen a los niños que no salgan solos de noche.', 'Grandmothers tell children not to go out alone at night.'],
      ['Algunos dicen que es solo un cuento para asustar.', 'Some say it is only a tale to scare people.'],
      ['Otros juran que la han oído cerca del agua.', 'Others swear they have heard her near the water.'],
      ['Y tú, ¿te atreverías a caminar junto al río a medianoche?', 'And you, would you dare to walk by the river at midnight?'],
    ],
    glossary: {
      casi: 'almost', niños: 'children', conocen: 'know', leyenda: 'legend', llorona: 'weeping woman', dicen: 'they say',
      vivía: 'lived', mujer: 'woman', junto: 'next to', río: 'river', momento: 'moment', desesperación: 'desperation',
      perdió: 'lost', hijos: 'children / sons', 'se dio cuenta': 'realized', había: 'had', pasado: 'happened', lloró: 'cried',
      consuelo: 'consolation', entonces: 'then', 'desde entonces': 'since then', alma: 'soul', vaga: 'wanders',
      durante: 'during', gente: 'people', cuenta: 'tells', escucha: 'is heard / listens', grito: 'scream / cry',
      terrible: 'terrible', salgan: 'go out (subjunctive)', solos: 'alone', algunos: 'some', cuento: 'tale / story',
      asustar: 'to scare', otros: 'others', juran: 'swear', oído: 'heard', cerca: 'near', atreverías: 'would you dare',
      medianoche: 'midnight', caminar: 'to walk',
    },
    questions: [
      { q: '¿Dónde vivía la mujer?', qEn: 'Where did the woman live?', options: ['En una montaña', 'Junto a un río', 'En el centro'], answer: 1 },
      { q: '¿Qué grita la Llorona?', qEn: 'What does La Llorona cry out?', options: ['¡Ay, mis hijos!', '¡Ayuda!', '¡Aguas!'], answer: 0 },
      { q: '¿Qué les dicen las abuelas a los niños?', qEn: 'What do grandmothers tell children?', options: ['Que coman', 'Que no salgan solos de noche', 'Que duerman temprano'], answer: 1 },
    ],
  }),
];

export const STORY_MAP: Record<string, Story> = Object.fromEntries(STORIES.map((s) => [s.id, s]));
