/** Phrasebook — practical Mexican Spanish phrases. */

export interface Phrase {
  id: string;
  es: string;
  en: string;
  note?: string;
}

export interface PhraseCategory {
  id: string;
  es: string;
  en: string;
  emoji: string;
  phrases: Phrase[];
}

type P = [es: string, en: string, note?: string];

function cat(id: string, es: string, en: string, emoji: string, rows: P[]): PhraseCategory {
  return { id, es, en, emoji, phrases: rows.map(([e, n, note], i) => ({ id: `${id}-${i}`, es: e, en: n, note })) };
}

export const PHRASEBOOK: PhraseCategory[] = [
  cat('basicos', 'Básicos', 'Essentials', '⭐', [
    ['Sí / No', 'Yes / No'],
    ['Por favor', 'Please'],
    ['Muchas gracias', 'Thank you very much'],
    ['De nada', "You're welcome"],
    ['Perdón', 'Sorry', 'To apologize or get attention.'],
    ['Disculpe', 'Excuse me (formal)', 'To ask a stranger something.'],
    ['¿Mande?', 'Pardon? / Sorry, what?', 'The polite Mexican “what?”.'],
    ['No entiendo', "I don't understand"],
    ['¿Habla inglés?', 'Do you speak English?'],
    ['¿Puede hablar más despacio, por favor?', 'Can you speak more slowly, please?'],
    ['¿Cómo se dice … en español?', 'How do you say … in Spanish?'],
    ['¿Qué significa…?', 'What does … mean?'],
    ['Hablo un poco de español', 'I speak a little Spanish'],
    ['Estoy aprendiendo español', "I'm learning Spanish"],
    ['¿Me lo puede escribir?', 'Can you write it down for me?'],
  ]),
  cat('saludos', 'Saludos y cortesía', 'Greetings & manners', '🤝', [
    ['¡Buenos días!', 'Good morning!'],
    ['¡Buenas tardes!', 'Good afternoon!'],
    ['¡Buenas noches!', 'Good evening! / Good night!'],
    ['¡Buenas!', 'Hi! (any time of day)', 'Short and friendly.'],
    ['¿Qué tal?', "How's it going?"],
    ['¿Cómo le va?', 'How are you doing? (formal)'],
    ['Mucho gusto', 'Nice to meet you'],
    ['Igualmente', 'Likewise'],
    ['Con permiso', 'Excuse me (to pass or leave)'],
    ['Pásele', 'Come in / Go ahead', 'Shopkeepers say it to invite you in.'],
    ['¡Provecho!', 'Enjoy your meal!'],
    ['¡Salud!', 'Cheers! / Bless you!'],
    ['Que le vaya bien', 'Have a good one (formal)'],
    ['Que te vaya bien', 'Take care / Have a good one'],
    ['Nos vemos', 'See you'],
  ]),
  cat('restaurante', 'Restaurante y taquería', 'Restaurant & taquería', '🌮', [
    ['Una mesa para dos, por favor', 'A table for two, please'],
    ['¿Me trae la carta, por favor?', 'Could you bring me the menu, please?'],
    ['¿Qué me recomienda?', 'What do you recommend?'],
    ['¿Me da cuatro tacos al pastor?', 'Can I have four tacos al pastor?'],
    ['Con todo, por favor', 'With everything, please', 'Onion, cilantro, salsa.'],
    ['Sin cebolla y sin cilantro', 'No onion and no cilantro'],
    ['¿Pica mucho?', 'Is it very spicy?'],
    ['Que no pique, por favor', 'Not spicy, please'],
    ['Soy vegetariano / vegetariana', "I'm vegetarian"],
    ['¿Tiene algo sin carne?', 'Do you have anything without meat?'],
    ['Un agua de horchata, por favor', 'A horchata, please'],
    ['¿Me trae otra, por favor?', 'Could you bring me another one, please?'],
    ['La cuenta, por favor', 'The check, please'],
    ['¿Está incluida la propina?', 'Is the tip included?'],
    ['Para llevar, por favor', 'To go, please'],
    ['Estuvo riquísimo', 'It was delicious'],
    ['¿Qué lleva?', "What's in it?", 'Ask before ordering an unfamiliar dish.'],
    ['¿Me puede traer más tortillas?', 'Could you bring more tortillas?'],
  ]),
  cat('direcciones', 'Direcciones y transporte', 'Directions & transport', '🧭', [
    ['¿Dónde está el baño?', 'Where is the bathroom?'],
    ['¿Dónde está la estación del metro?', 'Where is the metro station?'],
    ['¿Cómo llego a…?', 'How do I get to…?'],
    ['¿Está cerca o lejos?', 'Is it near or far?'],
    ['Siga derecho', 'Go straight'],
    ['Dé vuelta a la izquierda', 'Turn left'],
    ['Dé vuelta a la derecha', 'Turn right'],
    ['En la esquina', 'At the corner'],
    ['A dos cuadras', 'Two blocks away'],
    ['¿Este camión va al centro?', 'Does this bus go downtown?'],
    ['¿Me avisa cuando lleguemos?', 'Can you tell me when we arrive?'],
    ['¡Bajan!', 'Getting off! (to the bus driver)', 'Shout it when you want the camión to stop.'],
    ['Lléveme a esta dirección, por favor', 'Take me to this address, please'],
    ['¿Cuánto cobra hasta el aeropuerto?', 'How much do you charge to the airport?'],
    ['Aquí está bien, gracias', 'Here is fine, thanks'],
  ]),
  cat('compras', 'Compras y dinero', 'Shopping & money', '🛍️', [
    ['¿Cuánto cuesta?', 'How much does it cost?'],
    ['¿Cuánto es?', 'How much is it?'],
    ['Está muy caro', "It's very expensive"],
    ['¿Me hace un descuento?', 'Can you give me a discount?'],
    ['¿Me lo deja en …?', 'Will you let me have it for …?', 'Polite haggling.'],
    ['Nada más estoy viendo', "I'm just looking"],
    ['¿Aceptan tarjeta?', 'Do you take cards?'],
    ['Pago en efectivo', "I'll pay in cash"],
    ['¿Tiene cambio de quinientos?', 'Do you have change for 500?'],
    ['¿Me da una bolsa?', 'Can I have a bag?'],
    ['¿Tiene otro color / otra talla?', 'Do you have another color / size?'],
    ['Me lo llevo', "I'll take it"],
    ['¿Dónde hay un cajero?', 'Where is there an ATM?'],
    ['¿Me da el ticket?', 'Can I have the receipt?'],
  ]),
  cat('hotel', 'Hotel', 'Hotel', '🏨', [
    ['Tengo una reservación', 'I have a reservation'],
    ['¿Tiene habitaciones disponibles?', 'Do you have rooms available?'],
    ['¿A qué hora es el check-out?', 'What time is check-out?'],
    ['¿Incluye el desayuno?', 'Is breakfast included?'],
    ['¿Cuál es la contraseña del wifi?', "What's the wifi password?"],
    ['No hay agua caliente', "There's no hot water"],
    ['El aire acondicionado no sirve', "The air conditioning doesn't work"],
    ['¿Me puede guardar las maletas?', 'Can you keep my luggage?'],
    ['¿Me puede pedir un taxi?', 'Can you call me a taxi?'],
  ]),
  cat('social', 'Hacer amigos', 'Making friends', '🫂', [
    ['¿De dónde eres?', 'Where are you from?'],
    ['Soy de Estados Unidos', "I'm from the United States"],
    ['¿A qué te dedicas?', 'What do you do (for work)?'],
    ['¿Qué te gusta hacer?', 'What do you like to do?'],
    ['¿Vamos por unos tacos?', 'Shall we go get some tacos?'],
    ['¿Me pasas tu número?', 'Can you give me your number?'],
    ['¿Tienes WhatsApp?', 'Do you have WhatsApp?', 'Everyone in Mexico uses WhatsApp.'],
    ['Me caes muy bien', 'I really like you (as a person)'],
    ['¡Qué padre!', 'How cool!'],
    ['¡Está buenísimo!', "It's so good!"],
    ['Te invito', "It's on me / My treat", 'Means you’re paying!'],
    ['¿Cómo te fue?', 'How did it go?'],
    ['¡Qué buena onda!', "That's so nice of you! / How cool!"],
    ['¿Qué planes tienes para el fin de semana?', 'What are your plans for the weekend?'],
    ['¡Salud!', 'Cheers!'],
  ]),
  cat('emergencias', 'Emergencias', 'Emergencies', '🚨', [
    ['¡Ayuda!', 'Help!'],
    ['¡Llame al 911!', 'Call 911!'],
    ['Necesito un doctor', 'I need a doctor'],
    ['¿Dónde está el hospital más cercano?', 'Where is the nearest hospital?'],
    ['Me robaron la cartera', 'My wallet was stolen'],
    ['Perdí mi pasaporte', 'I lost my passport'],
    ['Me siento mal', 'I feel sick / I don’t feel well'],
    ['Soy alérgico / alérgica a…', "I'm allergic to…"],
    ['Me duele aquí', 'It hurts here'],
    ['Estoy perdido / perdida', "I'm lost"],
    ['¿Me puede ayudar, por favor?', 'Can you help me, please?'],
    ['Llame a la policía', 'Call the police'],
    ['¡Aguas!', 'Watch out!'],
  ]),
  cat('amor', 'Romance', 'Romance', '❤️', [
    ['Me gustas mucho', 'I really like you'],
    ['Te quiero', 'I love you (affectionate)'],
    ['Te amo', 'I love you (deep, romantic)'],
    ['¿Quieres salir conmigo?', 'Do you want to go out with me?'],
    ['Eres muy guapo / guapa', "You're very handsome / pretty"],
    ['Te extraño', 'I miss you', 'Spain says “te echo de menos”.'],
    ['¿Quieres ser mi novio / novia?', 'Will you be my boyfriend / girlfriend?'],
  ]),
];

export const ALL_PHRASES: Phrase[] = PHRASEBOOK.flatMap((c) => c.phrases);
