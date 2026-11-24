/** Course content — Mexican Spanish. Each unit: vocab + example sentences. */

export interface VocabItem {
  id: string;
  es: string;
  en: string; // accepted answers separated by " / "
  emoji: string;
  note?: string;
}

export interface Sentence {
  es: string;
  en: string;
}

export interface Unit {
  id: string;
  es: string;
  en: string;
  emoji: string;
  color: string;
  desc: string;
  tip: string;
  items: VocabItem[];
  sentences: Sentence[];
}

type Row = [es: string, en: string, emoji: string, note?: string];

function unit(
  id: string,
  es: string,
  en: string,
  emoji: string,
  color: string,
  desc: string,
  tip: string,
  rows: Row[],
  sentences: [string, string][],
): Unit {
  return {
    id, es, en, emoji, color, desc, tip,
    items: rows.map(([e, n, em, note], i) => ({ id: `${id}-${i}`, es: e, en: n, emoji: em, note })),
    sentences: sentences.map(([e, n]) => ({ es: e, en: n })),
  };
}

export const UNITS: Unit[] = [
  unit('saludos', 'Saludos', 'Greetings', '👋', '#ff2e93', 'Say hi like a local, from formal to ¿qué onda?',
    'In Mexico people greet everyone when entering a small shop or waiting room: a quick “¡Buenas!” goes a long way.',
    [
      ['hola', 'hello / hi', '👋'],
      ['buenos días', 'good morning', '🌅'],
      ['buenas tardes', 'good afternoon', '🌇'],
      ['buenas noches', 'good evening / good night', '🌙'],
      ['¿qué onda?', "what's up?", '🤙', 'Casual, very Mexican.'],
      ['¿cómo estás?', 'how are you?', '🙂', 'Informal (tú).'],
      ['¿cómo está usted?', 'how are you? (formal)', '🎩', 'Use usted with elders, officials, strangers.'],
      ['bien, gracias', 'fine, thanks / good, thanks', '👍'],
      ['mucho gusto', 'nice to meet you / pleased to meet you', '🤝'],
      ['¿cómo te llamas?', "what's your name?", '📛'],
      ['me llamo…', 'my name is…', '🙋'],
      ['adiós', 'goodbye / bye', '👋'],
      ['nos vemos', 'see you', '👀'],
      ['hasta luego', 'see you later', '🕒'],
      ['por favor', 'please', '🙏'],
      ['gracias', 'thank you / thanks', '💐'],
      ['de nada', "you're welcome", '😊'],
      ['con permiso', 'excuse me (passing by)', '🚶', 'Said when you squeeze past someone or leave a table.'],
      ['¿mande?', 'pardon? / sorry?', '👂', 'The polite Mexican way to ask someone to repeat.'],
    ],
    [
      ['Hola, ¿cómo estás?', 'Hi, how are you?'],
      ['Buenos días, señora.', 'Good morning, ma’am.'],
      ['Me llamo Ana, mucho gusto.', 'My name is Ana, nice to meet you.'],
      ['Muchas gracias, nos vemos mañana.', 'Thank you very much, see you tomorrow.'],
      ['¿Qué onda? ¿Todo bien?', "What's up? All good?"],
      ['Con permiso, ¿puedo pasar?', 'Excuse me, may I come through?'],
    ]),

  unit('numeros', 'Números', 'Numbers', '🔢', '#ffa630', 'Count, pay, and ask prices without panic.',
    'Prices are written with “$” in Mexico too — it means pesos! Ask “¿Son pesos o dólares?” if unsure.',
    [
      ['uno', 'one', '1️⃣'],
      ['dos', 'two', '2️⃣'],
      ['tres', 'three', '3️⃣'],
      ['cuatro', 'four', '4️⃣'],
      ['cinco', 'five', '5️⃣'],
      ['seis', 'six', '6️⃣'],
      ['siete', 'seven', '7️⃣'],
      ['ocho', 'eight', '8️⃣'],
      ['nueve', 'nine', '9️⃣'],
      ['diez', 'ten', '🔟'],
      ['quince', 'fifteen', '🕒'],
      ['veinte', 'twenty', '💵'],
      ['cincuenta', 'fifty', '🪙'],
      ['cien', 'one hundred / a hundred', '💯'],
      ['mil', 'one thousand / a thousand', '🏦'],
      ['¿cuánto cuesta?', 'how much does it cost? / how much is it?', '🏷️'],
      ['el peso', 'peso', '💰'],
    ],
    [
      ['¿Cuánto cuesta el taco?', 'How much is the taco?'],
      ['Son veinte pesos.', "It's twenty pesos."],
      ['Quiero dos cafés, por favor.', 'I want two coffees, please.'],
      ['Tengo cien pesos.', 'I have a hundred pesos.'],
      ['Son cincuenta pesos en total.', "It's fifty pesos in total."],
    ]),

  unit('comida', 'Comida', 'Food & drinks', '🌮', '#19d3a2', 'The most delicious unit. Tacos, elotes, aguas frescas.',
    '“Agua fresca” is a cold drink made from fruit, rice (horchata) or hibiscus (jamaica) — not just water!',
    [
      ['el taco', 'taco', '🌮'],
      ['la tortilla', 'tortilla', '🫓'],
      ['el elote', 'corn on the cob / corn', '🌽', 'Mexican word; Spain says “mazorca”.'],
      ['los frijoles', 'beans', '🫘'],
      ['el aguacate', 'avocado', '🥑'],
      ['el chile', 'chili pepper / chili', '🌶️'],
      ['la salsa', 'salsa / sauce', '🥫'],
      ['el queso', 'cheese', '🧀'],
      ['el pollo', 'chicken', '🍗'],
      ['la carne', 'meat / beef', '🥩'],
      ['el pan dulce', 'sweet bread / pastry', '🥐'],
      ['el tamal', 'tamale', '🫔'],
      ['el agua', 'water', '💧', 'Feminine but uses “el”: el agua fría.'],
      ['el jugo', 'juice', '🧃', 'Mexican; Spain says “zumo”.'],
      ['el café', 'coffee', '☕'],
      ['la cerveza', 'beer', '🍺', 'Slang: “una chela”.'],
      ['delicioso', 'delicious', '😋'],
      ['picante', 'spicy / hot', '🔥'],
    ],
    [
      ['Me encantan los tacos al pastor.', 'I love tacos al pastor.'],
      ['¿Pica mucho la salsa?', 'Is the salsa very spicy?'],
      ['Quiero un jugo de naranja.', 'I want an orange juice.'],
      ['El elote con chile está delicioso.', 'The corn with chili is delicious.'],
      ['No como carne.', "I don't eat meat."],
      ['Un café de olla, por favor.', 'A café de olla, please.'],
    ]),

  unit('taqueria', 'En la taquería', 'Eating out', '🍽️', '#9b5de5', 'Order, customize, and pay like a regular.',
    'Tipping (la propina) of 10–15% is customary in sit-down restaurants. At street stands it’s appreciated but optional.',
    [
      ['¿me da…?', 'can I have…? / could you give me…?', '🙋', 'The polite Mexican way to order.'],
      ['¿me trae…?', 'could you bring me…?', '🛎️'],
      ['la cuenta', 'the check / the bill', '🧾'],
      ['la propina', 'tip', '💵'],
      ['el mesero', 'waiter', '🤵', 'Mexico: mesero/mesera. Spain: camarero.'],
      ['la mesa', 'table', '🪑'],
      ['para llevar', 'to go / takeaway', '🥡'],
      ['para aquí', 'for here', '🍽️'],
      ['con todo', 'with everything', '🧅', 'At a taco stand: onion, cilantro, salsa.'],
      ['sin cebolla', 'without onion / no onion', '🚫'],
      ['la orden', 'order / serving', '📋', '“Una orden de tacos” = a serving (usually 3–5).'],
      ['el menú', 'menu', '📜'],
      ['¡provecho!', 'enjoy your meal!', '🍴', 'Said to people eating — even strangers.'],
      ['la servilleta', 'napkin', '🧻'],
      ['el popote', 'straw', '🥤', 'Very Mexican (Nahuatl origin). Spain: pajita.'],
    ],
    [
      ['¿Me da tres tacos de pastor, por favor?', 'Can I have three pastor tacos, please?'],
      ['La cuenta, por favor.', 'The check, please.'],
      ['¿Para aquí o para llevar?', 'For here or to go?'],
      ['Con todo, pero sin cebolla.', 'With everything, but without onion.'],
      ['¿Me trae una servilleta?', 'Could you bring me a napkin?'],
      ['La comida estuvo muy rica.', 'The food was really good.'],
    ]),

  unit('familia', 'Familia', 'Family', '👨‍👩‍👧', '#4cc9f0', 'Family is everything — learn who’s who.',
    'Mexicans often call close friends of the family “tío/tía”, and grandma is lovingly “abuelita”.',
    [
      ['la mamá', 'mom / mother', '👩'],
      ['el papá', 'dad / father', '👨'],
      ['los papás', 'parents', '👪', 'In Mexico “mis papás” = my parents.'],
      ['el hermano', 'brother', '👦'],
      ['la hermana', 'sister', '👧'],
      ['el hijo', 'son', '👶'],
      ['la hija', 'daughter', '👧'],
      ['el abuelo', 'grandfather / grandpa', '👴'],
      ['la abuela', 'grandmother / grandma', '👵'],
      ['el tío', 'uncle', '🧔'],
      ['la tía', 'aunt', '👩‍🦱'],
      ['el primo', 'cousin (male)', '🧑'],
      ['la prima', 'cousin (female)', '👩'],
      ['el esposo', 'husband', '🤵'],
      ['la esposa', 'wife', '👰'],
      ['el novio', 'boyfriend', '💑'],
      ['la novia', 'girlfriend', '💕'],
    ],
    [
      ['Mi mamá cocina muy rico.', 'My mom cooks really well.'],
      ['Tengo dos hermanos y una hermana.', 'I have two brothers and one sister.'],
      ['Mis abuelos viven en Oaxaca.', 'My grandparents live in Oaxaca.'],
      ['¿Tienes hijos?', 'Do you have children?'],
      ['Mi prima es de Monterrey.', 'My cousin is from Monterrey.'],
    ]),

  unit('ciudad', 'La ciudad', 'Getting around', '🚌', '#ff4d6d', 'Buses, metro, directions — never get lost.',
    'In Mexico a city bus is “el camión” (not autobús). In CDMX the metro is cheap and fast but packed at rush hour.',
    [
      ['el camión', 'bus', '🚌', 'In Mexico, camión = bus (also truck).'],
      ['el metro', 'subway / metro', '🚇'],
      ['el taxi', 'taxi / cab', '🚕'],
      ['el carro', 'car', '🚗', 'Mexico: carro. Spain: coche.'],
      ['la calle', 'street', '🛣️'],
      ['la esquina', 'corner', '📐'],
      ['la cuadra', 'block (city block)', '🏘️'],
      ['a la derecha', 'to the right / on the right', '➡️'],
      ['a la izquierda', 'to the left / on the left', '⬅️'],
      ['derecho', 'straight ahead / straight', '⬆️'],
      ['la parada', 'stop (bus stop)', '🚏'],
      ['el boleto', 'ticket', '🎫', 'Mexico: boleto. Spain: billete.'],
      ['la banqueta', 'sidewalk', '🚶', 'Very Mexican. Spain: acera.'],
      ['el aeropuerto', 'airport', '✈️'],
      ['¿dónde está…?', 'where is…?', '📍'],
      ['cerca', 'near / close', '📌'],
      ['lejos', 'far', '🗺️'],
    ],
    [
      ['¿Dónde está la parada del camión?', 'Where is the bus stop?'],
      ['Siga derecho dos cuadras.', 'Go straight two blocks.'],
      ['Da vuelta a la derecha en la esquina.', 'Turn right at the corner.'],
      ['¿Está lejos el aeropuerto?', 'Is the airport far?'],
      ['Necesito un boleto para el metro.', 'I need a ticket for the metro.'],
    ]),

  unit('mercado', 'El mercado', 'Shopping', '🛍️', '#ffd166', 'Haggle at the tianguis like a pro.',
    'A “tianguis” is an open-air street market that pops up on a set day each week. Gentle haggling is OK; aggressive haggling is not.',
    [
      ['el mercado', 'market', '🏪'],
      ['el tianguis', 'street market / open-air market', '⛺', 'From Nahuatl tianquiztli.'],
      ['la tiendita', 'corner store / little shop', '🏬', 'The neighborhood shop for snacks and drinks.'],
      ['barato', 'cheap / inexpensive', '🤑'],
      ['caro', 'expensive', '💸'],
      ['el precio', 'price', '🏷️'],
      ['¿cuánto es?', 'how much is it?', '❓'],
      ['el cambio', 'change (money)', '🪙'],
      ['en efectivo', 'in cash / cash', '💵'],
      ['con tarjeta', 'by card / with card', '💳'],
      ['la bolsa', 'bag', '🛍️'],
      ['el kilo', 'kilo / kilogram', '⚖️'],
      ['¿me hace un descuento?', 'can you give me a discount?', '🤝'],
      ['la fruta', 'fruit', '🍉'],
      ['nada más', "that's all / just", '✋', '“Nada más eso” = Just that.'],
    ],
    [
      ['¿Cuánto es por todo?', 'How much for everything?'],
      ['¿Me da un kilo de tomates?', 'Can I have a kilo of tomatoes?'],
      ['¿Aceptan tarjeta?', 'Do you accept cards?'],
      ['Está muy caro, ¿me hace un descuento?', "It's very expensive, can you give me a discount?"],
      ['Nada más eso, gracias.', "That's all, thanks."],
    ]),

  unit('casa', 'La casa', 'Home', '🏠', '#06d6a0', 'Rooms, furniture and everyday home words.',
    'In Mexico a bedroom is “la recámara” and an apartment is “el departamento” (often “el depa”).',
    [
      ['la casa', 'house / home', '🏠'],
      ['el departamento', 'apartment', '🏢', 'Casual: el depa. Spain: piso.'],
      ['la recámara', 'bedroom', '🛏️', 'Very Mexican. Spain: dormitorio/habitación.'],
      ['la cocina', 'kitchen', '🍳'],
      ['el baño', 'bathroom', '🚽'],
      ['la sala', 'living room', '🛋️'],
      ['la alberca', 'swimming pool / pool', '🏊', 'Mexican; Spain says “piscina”.'],
      ['el refrigerador', 'refrigerator / fridge', '🧊', 'Casual: el refri.'],
      ['la cama', 'bed', '🛌'],
      ['la ventana', 'window', '🪟'],
      ['la puerta', 'door', '🚪'],
      ['la llave', 'key', '🔑'],
      ['la regadera', 'shower', '🚿', 'Mexico: regadera. Spain: ducha.'],
      ['el jardín', 'garden / yard', '🌷'],
    ],
    [
      ['Mi casa es tu casa.', 'My house is your house.'],
      ['El baño está al fondo a la derecha.', 'The bathroom is at the back on the right.'],
      ['Mi departamento tiene dos recámaras.', 'My apartment has two bedrooms.'],
      ['¿Dónde están las llaves?', 'Where are the keys?'],
      ['La comida está en el refri.', 'The food is in the fridge.'],
    ]),

  unit('tiempo', 'El tiempo', 'Time & weather', '⏰', '#118ab2', 'Days, ahorita, and the weather.',
    '“Ahorita” can mean right now… or in a while… or maybe never. Context and tone are everything!',
    [
      ['hoy', 'today', '📅'],
      ['mañana', 'tomorrow', '🌄', '“La mañana” = the morning.'],
      ['ayer', 'yesterday', '⏪'],
      ['ahorita', 'right now / in a bit', '⏳', 'Famously flexible in Mexico.'],
      ['ahora', 'now', '⏱️'],
      ['la semana', 'week', '🗓️'],
      ['el fin de semana', 'weekend', '🎉'],
      ['lunes', 'Monday', '1️⃣'],
      ['viernes', 'Friday', '🥳'],
      ['domingo', 'Sunday', '☀️'],
      ['temprano', 'early', '🐓'],
      ['tarde', 'late', '🌆'],
      ['hace calor', "it's hot", '🥵'],
      ['hace frío', "it's cold", '🥶'],
      ['está lloviendo', "it's raining", '🌧️'],
      ['¿qué hora es?', 'what time is it?', '🕰️'],
    ],
    [
      ['Ahorita vengo.', "I'll be right back."],
      ['Hoy hace mucho calor.', "It's very hot today."],
      ['Nos vemos el lunes.', 'See you on Monday.'],
      ['Mañana llego temprano.', "Tomorrow I'll arrive early."],
      ['¿Qué hora es? Son las tres.', "What time is it? It's three o'clock."],
    ]),

  unit('emociones', 'Emociones', 'Feelings & descriptions', '🎭', '#f15bb5', 'How you feel and what things are like.',
    'Use “estar” for feelings (estoy cansado) and “ser” for traits (es simpático). “¡Qué padre!” = How cool!',
    [
      ['feliz', 'happy', '😄'],
      ['contento', 'happy / glad / content', '😊'],
      ['triste', 'sad', '😢'],
      ['cansado', 'tired', '😴'],
      ['enojado', 'angry / mad', '😠', 'Mexico: enojado. Spain: enfadado.'],
      ['nervioso', 'nervous', '😬'],
      ['aburrido', 'bored / boring', '🥱'],
      ['emocionado', 'excited', '🤩'],
      ['bonito', 'pretty / nice', '🌸'],
      ['feo', 'ugly', '👹'],
      ['grande', 'big / large', '🐘'],
      ['chico', 'small / little', '🐭', 'In Mexico “chico” is very common for small.'],
      ['padre', 'cool / awesome', '😎', 'Slang adjective: ¡Qué padre! (nothing to do with father).'],
      ['simpático', 'nice / friendly', '🤗'],
      ['enamorado', 'in love', '😍'],
    ],
    [
      ['Estoy muy cansado hoy.', "I'm very tired today."],
      ['¡Qué padre está tu casa!', 'Your house is so cool!'],
      ['Mi hermana está enojada.', 'My sister is angry.'],
      ['El concierto estuvo increíble.', 'The concert was incredible.'],
      ['Estoy emocionado por el viaje.', "I'm excited about the trip."],
    ]),

  unit('verbos', 'Verbos clave', 'Essential verbs', '⚡', '#ff9f1c', 'The 16 verbs that power every conversation.',
    'Mexicans love “ir a + infinitive” for the future: “Voy a comer” (I’m going to eat).',
    [
      ['ser', 'to be (permanent)', '🧬'],
      ['estar', 'to be (state / location)', '📍'],
      ['tener', 'to have', '🤲'],
      ['ir', 'to go', '🏃'],
      ['hacer', 'to do / to make', '🛠️'],
      ['querer', 'to want / to love', '💖'],
      ['poder', 'can / to be able to', '💪'],
      ['saber', 'to know (facts)', '🧠'],
      ['conocer', 'to know (people / places)', '🤝'],
      ['hablar', 'to speak / to talk', '🗣️'],
      ['comer', 'to eat', '🍽️'],
      ['vivir', 'to live', '🏡'],
      ['platicar', 'to chat', '💬', 'Very Mexican!'],
      ['manejar', 'to drive', '🚗', 'Mexico: manejar. Spain: conducir.'],
      ['tomar', 'to take / to drink', '🥤'],
      ['necesitar', 'to need', '🆘'],
    ],
    [
      ['Voy a comer con mis amigos.', "I'm going to eat with my friends."],
      ['¿Puedes hablar más despacio?', 'Can you speak more slowly?'],
      ['No sé dónde está.', "I don't know where it is."],
      ['Quiero conocer Guadalajara.', 'I want to visit Guadalajara.'],
      ['Necesito un taxi.', 'I need a taxi.'],
      ['¿Platicamos mañana?', 'Shall we chat tomorrow?'],
    ]),

  unit('viajes', 'De viaje', 'Travel', '🧳', '#00bbf9', 'Hotels, beaches, pyramids and cenotes.',
    'Mexico has 35+ UNESCO World Heritage sites. A “cenote” is a natural sinkhole pool — swim in one in Yucatán!',
    [
      ['el hotel', 'hotel', '🏨'],
      ['la reservación', 'reservation / booking', '📝', 'Mexico: reservación. Spain: reserva.'],
      ['la habitación', 'room (hotel)', '🚪'],
      ['la maleta', 'suitcase', '🧳'],
      ['el pasaporte', 'passport', '🛂'],
      ['la playa', 'beach', '🏖️'],
      ['el cenote', 'cenote / sinkhole', '💦'],
      ['la pirámide', 'pyramid', '🔺'],
      ['el museo', 'museum', '🏛️'],
      ['el centro', 'downtown / city center', '🏙️'],
      ['el vuelo', 'flight', '🛫'],
      ['el mapa', 'map', '🗺️'],
      ['la salida', 'exit / departure', '🚪'],
      ['el recuerdo', 'souvenir / memory', '🎁'],
    ],
    [
      ['Tengo una reservación a nombre de Smith.', 'I have a reservation under the name Smith.'],
      ['¿A qué hora sale el vuelo?', 'What time does the flight leave?'],
      ['Queremos ir a la playa.', 'We want to go to the beach.'],
      ['¿Cómo llego al centro?', 'How do I get downtown?'],
      ['Perdí mi pasaporte.', 'I lost my passport.'],
    ]),

  unit('salud', 'Salud y emergencias', 'Health & emergencies', '🚑', '#ef476f', 'The phrases you hope you never need.',
    'Mexico’s emergency number is 911. Pharmacies (farmacias) are everywhere and many have a doctor’s office next door.',
    [
      ['¡ayuda!', 'help!', '🆘'],
      ['¡aguas!', 'watch out! / careful!', '⚠️', 'Mexican slang warning — like “heads up!”'],
      ['el doctor', 'doctor', '🩺'],
      ['la farmacia', 'pharmacy', '💊'],
      ['el hospital', 'hospital', '🏥'],
      ['me duele…', 'my … hurts', '🤕', '“Me duele la cabeza” = my head hurts.'],
      ['la cabeza', 'head', '🧠'],
      ['el estómago', 'stomach', '🤢'],
      ['estoy enfermo', "I'm sick / I am sick", '🤒'],
      ['la medicina', 'medicine', '💉'],
      ['la policía', 'police', '👮'],
      ['la alergia', 'allergy', '🤧'],
      ['la ambulancia', 'ambulance', '🚑'],
      ['¿me puede ayudar?', 'can you help me?', '🙏'],
    ],
    [
      ['Me duele mucho el estómago.', 'My stomach hurts a lot.'],
      ['¿Dónde hay una farmacia?', 'Where is there a pharmacy?'],
      ['Soy alérgico a los cacahuates.', "I'm allergic to peanuts."],
      ['Llame a una ambulancia, por favor.', 'Call an ambulance, please.'],
      ['¡Aguas con el carro!', 'Watch out for the car!'],
    ]),

  unit('trabajo', 'Trabajo y escuela', 'Work & school', '💼', '#8ac926', 'From la chamba to la junta.',
    '“La chamba” is slang for work/job. “Chambear” = to work. You’ll hear it everywhere.',
    [
      ['el trabajo', 'work / job', '💼'],
      ['la chamba', 'job / work (slang)', '👷', 'Very common Mexican slang.'],
      ['la oficina', 'office', '🏢'],
      ['la junta', 'meeting', '📊', 'Mexico: junta. Spain: reunión.'],
      ['el jefe', 'boss', '🧑‍💼'],
      ['la escuela', 'school', '🏫'],
      ['el maestro', 'teacher', '🧑‍🏫'],
      ['la tarea', 'homework / task', '📚'],
      ['la computadora', 'computer', '💻', 'Mexico: computadora. Spain: ordenador.'],
      ['el celular', 'cell phone / phone / mobile', '📱', 'Mexico: celular. Spain: móvil.'],
      ['el correo', 'email / mail', '📧'],
      ['la pluma', 'pen', '🖊️', 'Mexico: pluma. Spain: bolígrafo.'],
      ['el horario', 'schedule', '🗓️'],
    ],
    [
      ['Tengo mucha chamba hoy.', 'I have a lot of work today.'],
      ['La junta es a las diez.', 'The meeting is at ten.'],
      ['Te mando un correo.', "I'll send you an email."],
      ['Mi celular no tiene pila.', 'My phone has no battery.'],
      ['¿Me prestas una pluma?', 'Can I borrow a pen?'],
    ]),

  unit('slang', 'Slang chilango', 'Mexican slang', '🤙', '#ff006e', 'Talk like a local (with care!).',
    'Slang is about context. “Güey” between friends is affectionate — with your boss or a stranger, not so much.',
    [
      ['¿qué onda?', "what's up?", '🤙'],
      ['chido', 'cool / great', '😎'],
      ['padre', 'cool / awesome', '✨'],
      ['¡qué padre!', 'how cool!', '🤩'],
      ['la neta', 'the truth / for real', '💯', '“¿Neta?” = Really?'],
      ['güey', 'dude / man', '🧍', 'Between friends only.'],
      ['¡órale!', 'wow! / OK! / come on!', '😮', 'Super versatile.'],
      ['¡ándale!', 'come on! / hurry up! / exactly!', '🏃'],
      ['¡no manches!', 'no way! / you’re kidding!', '😱', 'Mild, safe for most company.'],
      ['la lana', 'money (slang)', '💸'],
      ['el cuate', 'buddy / friend', '🫂'],
      ['la chela', 'beer (slang)', '🍺'],
      ['¡híjole!', 'oh man! / yikes!', '😬'],
      ['sale', 'OK / deal', '👌', '“¿Nos vemos a las 8?” “¡Sale!”'],
      ['¡qué oso!', 'how embarrassing!', '🙈'],
      ['fresa', 'posh / preppy', '🍓', 'A stuck-up rich kid stereotype.'],
    ],
    [
      ['¿Qué onda, güey? ¿Todo chido?', "What's up, dude? All good?"],
      ['¡No manches! ¿Neta?', 'No way! Really?'],
      ['Ese concierto estuvo bien padre.', 'That concert was really cool.'],
      ['No traigo lana.', "I don't have any money on me."],
      ['¡Qué oso! Me caí en la calle.', 'How embarrassing! I fell in the street.'],
      ['¿Unas chelas el viernes? ¡Sale!', 'Some beers on Friday? Deal!'],
    ]),

  unit('cultura', 'Fiestas y cultura', 'Culture & celebrations', '💀', '#fb5607', 'Día de Muertos, posadas, mariachi and more.',
    'Día de Muertos (Nov 1–2) is a joyful celebration of loved ones who passed — not a Mexican Halloween.',
    [
      ['el Día de Muertos', 'Day of the Dead', '💀'],
      ['la ofrenda', 'altar offering / altar', '🕯️'],
      ['el cempasúchil', 'marigold', '🌼', 'Nahuatl word; the flower of the dead.'],
      ['la calavera', 'skull', '☠️'],
      ['el pan de muerto', 'bread of the dead', '🍞'],
      ['la piñata', 'piñata', '🪅'],
      ['la posada', 'posada (Christmas party)', '🎄', 'Dec 16–24 celebrations.'],
      ['el mariachi', 'mariachi', '🎺'],
      ['la quinceañera', "quinceañera (15th birthday)", '👗'],
      ['la fiesta', 'party', '🎉'],
      ['la lucha libre', 'Mexican wrestling', '🤼'],
      ['la máscara', 'mask', '🎭'],
      ['el tequila', 'tequila', '🥃'],
      ['¡Viva México!', 'long live Mexico!', '🇲🇽'],
    ],
    [
      ['Ponemos una ofrenda para mis abuelos.', 'We set up an altar for my grandparents.'],
      ['¡Dale, dale, dale, no pierdas el tino!', "Hit it, hit it, hit it, don't lose your aim!"],
      ['El mariachi toca en la plaza.', 'The mariachi plays in the square.'],
      ['Vamos a la lucha libre el domingo.', "We're going to the wrestling on Sunday."],
      ['El pan de muerto está riquísimo.', 'The bread of the dead is delicious.'],
    ]),
];

export const UNIT_MAP: Record<string, Unit> = Object.fromEntries(UNITS.map((u) => [u.id, u]));

/** Split a unit into lessons of ~5 items; the last lesson is a mixed review + sentences. */
export function lessonsFor(u: Unit): { title: string; items: VocabItem[]; review: boolean }[] {
  const per = 5;
  const chunks: VocabItem[][] = [];
  for (let i = 0; i < u.items.length; i += per) chunks.push(u.items.slice(i, i + per));
  // avoid a tiny last chunk
  if (chunks.length > 1 && chunks[chunks.length - 1].length < 3) {
    const last = chunks.pop()!;
    chunks[chunks.length - 1].push(...last);
  }
  const lessons = chunks.map((items, i) => ({ title: `Lección ${i + 1}`, items, review: false }));
  lessons.push({ title: 'Repaso final', items: u.items, review: true });
  return lessons;
}

export const ALL_VOCAB: VocabItem[] = UNITS.flatMap((u) => u.items);
