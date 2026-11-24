/** Offline role-play scenarios — branching dialogues you can speak or tap. */

export interface ScenarioOption {
  es: string;
  en: string;
  next: string;
  good: boolean;
  feedback?: string;
}

export interface ScenarioNode {
  npc: string;
  npcEn: string;
  options?: ScenarioOption[];
  end?: boolean;
}

export interface Scenario {
  id: string;
  title: string;
  titleEn: string;
  emoji: string;
  who: string;
  whoEmoji: string;
  setting: string;
  level: 'A1' | 'A2' | 'B1';
  start: string;
  nodes: Record<string, ScenarioNode>;
  aiPrompt: string; // used by the AI tutor for a free-form version
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'taqueria', title: 'En la taquería', titleEn: 'At the taco stand', emoji: '🌮', who: 'Don Chuy, el taquero', whoEmoji: '👨‍🍳',
    setting: 'A busy taco stand in Mexico City at 11 pm. The trompo of al pastor is spinning.', level: 'A1', start: 'a',
    aiPrompt: 'You are Don Chuy, a friendly taquero at a late-night taco stand in Mexico City. Take the customer’s order (tacos al pastor, suadero, bistec, campechanos), ask “¿con todo?”, offer drinks (refresco, agua de horchata, jamaica) and handle payment.',
    nodes: {
      a: { npc: '¡Buenas noches, joven! ¿Qué le damos?', npcEn: 'Good evening, young man! What can we get you?', options: [
        { es: 'Me da cuatro tacos al pastor, por favor.', en: 'Can I have four tacos al pastor, please?', next: 'b', good: true },
        { es: 'Yo quiero tacos.', en: 'I want tacos.', next: 'a2', good: true, feedback: 'Works, but “¿Me da…?” sounds more polite and natural.' },
        { es: 'Dame la cuenta.', en: 'Give me the check.', next: 'a3', good: false, feedback: 'You haven’t ordered yet! Ask for tacos first.' },
      ] },
      a2: { npc: '¡Claro! ¿De qué los quiere? Tenemos pastor, suadero y bistec.', npcEn: 'Sure! What kind? We have pastor, suadero and steak.', options: [
        { es: 'De pastor, por favor. Cuatro.', en: 'Pastor, please. Four.', next: 'b', good: true },
        { es: 'Dos de suadero y dos de bistec.', en: 'Two suadero and two steak.', next: 'b', good: true },
      ] },
      a3: { npc: 'Jaja, ¡todavía no ha pedido nada! ¿Qué le sirvo?', npcEn: "Haha, you haven't ordered anything yet! What can I serve you?", options: [
        { es: 'Perdón. Cuatro tacos al pastor, por favor.', en: 'Sorry. Four tacos al pastor, please.', next: 'b', good: true },
      ] },
      b: { npc: '¿Con todo?', npcEn: 'With everything?', options: [
        { es: 'Sí, con todo, por favor.', en: 'Yes, with everything, please.', next: 'c', good: true },
        { es: 'Sin cebolla, por favor.', en: 'Without onion, please.', next: 'c', good: true },
        { es: 'Con todo, ¿pero la salsa pica mucho?', en: 'With everything, but is the salsa very spicy?', next: 'b2', good: true },
      ] },
      b2: { npc: 'La roja pica poquito, pero la verde sí pica, ¡aguas!', npcEn: 'The red one is a little spicy, but the green one is really spicy, watch out!', options: [
        { es: 'Entonces con salsa roja, por favor.', en: 'Then with red salsa, please.', next: 'c', good: true },
        { es: '¡Me encanta el picante! La verde.', en: 'I love spicy food! The green one.', next: 'c', good: true },
      ] },
      c: { npc: '¿Y de tomar?', npcEn: 'And to drink?', options: [
        { es: 'Un agua de horchata, por favor.', en: 'A horchata, please.', next: 'd', good: true },
        { es: 'Un refresco, por favor.', en: 'A soda, please.', next: 'd', good: true },
        { es: 'Nada, gracias.', en: 'Nothing, thanks.', next: 'd', good: true },
      ] },
      d: { npc: 'Aquí tiene. ¡Provecho!', npcEn: 'Here you go. Enjoy!', options: [
        { es: '¡Gracias! ¿Cuánto es?', en: 'Thanks! How much is it?', next: 'e', good: true },
        { es: '¡Están buenísimos! ¿Cuánto le debo?', en: 'They’re so good! How much do I owe you?', next: 'e', good: true },
      ] },
      e: { npc: 'Son noventa pesos, joven.', npcEn: "It's ninety pesos, young man.", options: [
        { es: 'Aquí tiene. Quédese con el cambio.', en: 'Here you go. Keep the change.', next: 'end', good: true },
        { es: '¿Acepta tarjeta?', en: 'Do you take cards?', next: 'e2', good: true },
      ] },
      e2: { npc: 'No, nada más efectivo. Pero hay un cajero en la esquina.', npcEn: "No, cash only. But there's an ATM on the corner.", options: [
        { es: 'Ah, no se preocupe, sí traigo efectivo. Aquí tiene.', en: "Oh, don't worry, I do have cash. Here you go.", next: 'end', good: true },
      ] },
      end: { npc: '¡Muchas gracias! ¡Vuelva pronto!', npcEn: 'Thank you so much! Come back soon!', end: true },
    },
  },
  {
    id: 'taxi', title: 'En el taxi', titleEn: 'Taking a taxi', emoji: '🚕', who: 'Lupita, la taxista', whoEmoji: '👩‍✈️',
    setting: 'You hop into an authorized airport taxi in Guadalajara.', level: 'A1', start: 'a',
    aiPrompt: 'You are Lupita, a chatty taxi driver in Guadalajara. Ask where the passenger is going, chat about the city (birria, tequila, mariachi, Tlaquepaque), and handle the fare.',
    nodes: {
      a: { npc: 'Buenas tardes. ¿A dónde lo llevo?', npcEn: 'Good afternoon. Where can I take you?', options: [
        { es: 'Al centro, por favor. Al hotel Morales.', en: 'Downtown, please. To the Hotel Morales.', next: 'b', good: true },
        { es: 'Lléveme a esta dirección, por favor.', en: 'Take me to this address, please.', next: 'b', good: true },
      ] },
      b: { npc: 'Con gusto. ¿Es su primera vez en Guadalajara?', npcEn: 'Gladly. Is it your first time in Guadalajara?', options: [
        { es: 'Sí, es mi primera vez. ¿Qué me recomienda?', en: "Yes, it's my first time. What do you recommend?", next: 'c', good: true },
        { es: 'No, vine el año pasado.', en: 'No, I came last year.', next: 'c2', good: true },
      ] },
      c: { npc: 'Tiene que probar la birria y visitar Tlaquepaque. ¡Hay mariachi todos los días!', npcEn: 'You have to try birria and visit Tlaquepaque. There’s mariachi every day!', options: [
        { es: '¡Qué padre! ¿Está lejos Tlaquepaque?', en: 'How cool! Is Tlaquepaque far?', next: 'd', good: true },
        { es: '¿Qué es la birria?', en: 'What is birria?', next: 'c3', good: true },
      ] },
      c2: { npc: '¡Qué bien! Entonces ya conoce la birria, ¿verdad?', npcEn: 'Great! So you already know birria, right?', options: [
        { es: '¡Claro! Me encantó.', en: 'Of course! I loved it.', next: 'd', good: true },
      ] },
      c3: { npc: 'Es un guiso de carne de chivo o res con chiles. ¡Riquísimo para la cruda!', npcEn: 'It’s a stew of goat or beef with chiles. Delicious for a hangover!', options: [
        { es: 'Jaja, ¡la voy a probar!', en: "Haha, I'm going to try it!", next: 'd', good: true },
      ] },
      d: { npc: 'Ya llegamos. Son ciento ochenta pesos.', npcEn: "We're here. It's one hundred eighty pesos.", options: [
        { es: 'Aquí tiene. ¡Muchas gracias por las recomendaciones!', en: 'Here you go. Thanks a lot for the recommendations!', next: 'end', good: true },
        { es: '¿Me da un recibo, por favor?', en: 'Can I have a receipt, please?', next: 'end', good: true },
      ] },
      end: { npc: '¡Para servirle! Que disfrute Guadalajara.', npcEn: 'At your service! Enjoy Guadalajara.', end: true },
    },
  },
  {
    id: 'mercado', title: 'Regateo en el mercado', titleEn: 'Haggling at the market', emoji: '🧺', who: 'Doña Mari, artesana', whoEmoji: '👵',
    setting: 'A craft market in Oaxaca. You love a hand-embroidered blouse.', level: 'A2', start: 'a',
    aiPrompt: 'You are Doña Mari, an artisan selling hand-embroidered blouses and alebrijes at a market in Oaxaca. Be warm, explain the craftsmanship, and allow gentle, respectful haggling (you can drop the price about 10%).',
    nodes: {
      a: { npc: 'Pásele, güerita, pásele. ¿Qué le enseño?', npcEn: 'Come in, come in. What can I show you?', options: [
        { es: '¿Cuánto cuesta esta blusa?', en: 'How much does this blouse cost?', next: 'b', good: true },
        { es: 'Nada más estoy viendo, gracias.', en: "I'm just looking, thanks.", next: 'a2', good: true },
      ] },
      a2: { npc: 'Con confianza. Todo está bordado a mano.', npcEn: 'Take your time. Everything is hand-embroidered.', options: [
        { es: '¡Qué bonito! ¿Cuánto cuesta esta blusa?', en: 'How pretty! How much is this blouse?', next: 'b', good: true },
      ] },
      b: { npc: 'Esa está en ochocientos pesos. Me tardé tres semanas en bordarla.', npcEn: 'That one is eight hundred pesos. It took me three weeks to embroider.', options: [
        { es: '¡Está preciosa! ¿Me la deja en setecientos?', en: "It's gorgeous! Will you let me have it for seven hundred?", next: 'c', good: true },
        { es: '¡Qué cara! Le doy doscientos.', en: "So expensive! I'll give you two hundred.", next: 'b2', good: false, feedback: 'Too aggressive — handmade work deserves respect. Offer ~10% less.' },
      ] },
      b2: { npc: 'Ay, no, marchanta. Es trabajo hecho a mano, no puedo.', npcEn: "Oh no, dear customer. It's handmade work, I can't.", options: [
        { es: 'Tiene razón, perdón. ¿Me la deja en setecientos cincuenta?', en: "You're right, sorry. Would you take seven hundred fifty?", next: 'c', good: true },
      ] },
      c: { npc: 'Mmm… Se la dejo en setecientos cincuenta, pero porque me cayó bien.', npcEn: 'Hmm… I’ll let you have it for seven fifty, but only because I like you.', options: [
        { es: '¡Trato hecho! Me la llevo.', en: "Deal! I'll take it.", next: 'd', good: true },
        { es: '¿Y si me llevo dos?', en: 'And what if I take two?', next: 'c2', good: true },
      ] },
      c2: { npc: '¡Ándale! Dos en mil cuatrocientos.', npcEn: 'Go on then! Two for one thousand four hundred.', options: [
        { es: '¡Perfecto! Me llevo dos.', en: "Perfect! I'll take two.", next: 'd', good: true },
      ] },
      d: { npc: '¿Le doy una bolsita?', npcEn: 'Shall I give you a little bag?', options: [
        { es: 'Sí, por favor. ¡Muchas gracias, doña Mari!', en: 'Yes, please. Thank you so much, Doña Mari!', next: 'end', good: true },
        { es: 'No, gracias, traigo mi bolsa.', en: 'No thanks, I have my bag.', next: 'end', good: true },
      ] },
      end: { npc: 'Gracias a usted. ¡Que Dios la bendiga!', npcEn: 'Thank you. God bless you!', end: true },
    },
  },
  {
    id: 'farmacia', title: 'En la farmacia', titleEn: 'At the pharmacy', emoji: '💊', who: 'El Dr. Ramírez', whoEmoji: '🧑‍⚕️',
    setting: 'You ate too many street tacos. A pharmacy with a small doctor’s office.', level: 'A2', start: 'a',
    aiPrompt: 'You are Dr. Ramírez at a consultorio next to a pharmacy in Mexico. Ask about symptoms, give simple advice, and recommend electrolytes (suero) and rest. Keep it gentle and simple.',
    nodes: {
      a: { npc: 'Buenas tardes, pase. ¿Qué le pasa?', npcEn: 'Good afternoon, come in. What’s wrong?', options: [
        { es: 'Me duele mucho el estómago.', en: 'My stomach hurts a lot.', next: 'b', good: true },
        { es: 'Me siento mal desde ayer.', en: "I've been feeling sick since yesterday.", next: 'b', good: true },
      ] },
      b: { npc: '¿Tiene fiebre? ¿Qué comió ayer?', npcEn: 'Do you have a fever? What did you eat yesterday?', options: [
        { es: 'No tengo fiebre. Comí muchos tacos en la calle.', en: "I don't have a fever. I ate a lot of street tacos.", next: 'c', good: true },
        { es: 'Creo que sí tengo un poco de fiebre.', en: 'I think I do have a little fever.', next: 'c', good: true },
      ] },
      c: { npc: 'Tome mucho suero y descanse. Le voy a dar esta medicina, una pastilla cada ocho horas.', npcEn: "Drink lots of electrolyte solution and rest. I'll give you this medicine, one pill every eight hours.", options: [
        { es: '¿Cada ocho horas? ¿Por cuántos días?', en: 'Every eight hours? For how many days?', next: 'd', good: true },
        { es: 'Gracias, doctor. ¿Cuánto le debo?', en: 'Thanks, doctor. How much do I owe you?', next: 'e', good: true },
      ] },
      d: { npc: 'Por tres días. Si no mejora, regrese.', npcEn: "For three days. If you don't get better, come back.", options: [
        { es: 'Muy bien. ¿Cuánto le debo?', en: 'Very well. How much do I owe you?', next: 'e', good: true },
      ] },
      e: { npc: 'La consulta son cincuenta pesos y la medicina la paga en la farmacia.', npcEn: 'The consultation is fifty pesos and you pay for the medicine at the pharmacy.', options: [
        { es: 'Perfecto, muchas gracias.', en: 'Perfect, thank you very much.', next: 'end', good: true },
      ] },
      end: { npc: 'Que se mejore pronto.', npcEn: 'Get well soon.', end: true },
    },
  },
  {
    id: 'fiesta', title: 'Una fiesta en Coyoacán', titleEn: 'A party in Coyoacán', emoji: '🎉', who: 'Mateo, un chavo chilango', whoEmoji: '🧑‍🎤',
    setting: 'A friend’s birthday party in Coyoacán, Mexico City. Mateo walks up to you.', level: 'B1', start: 'a',
    aiPrompt: 'You are Mateo, a 25-year-old chilango at a birthday party in Coyoacán. Use casual Mexican slang (qué onda, chido, neta, güey with friends) and make small talk: where they’re from, music, food, plans in CDMX.',
    nodes: {
      a: { npc: '¡Qué onda! No te conozco, ¿eres amigo de Sofi?', npcEn: "What's up! I don't know you — are you Sofi's friend?", options: [
        { es: '¡Qué onda! Sí, trabajamos juntos. Me llamo Alex.', en: "What's up! Yes, we work together. My name is Alex.", next: 'b', good: true },
        { es: 'Buenos días, señor. ¿Cómo está usted?', en: 'Good morning, sir. How are you?', next: 'a2', good: false, feedback: 'Too formal for a party with peers — and it’s night! Try “¡Qué onda!”.' },
      ] },
      a2: { npc: 'Jaja, ¿señor? ¡Tranqui, aquí todos nos hablamos de tú! ¿Cómo te llamas?', npcEn: "Haha, sir? Relax, everyone uses tú here! What's your name?", options: [
        { es: 'Jaja, perdón. Me llamo Alex. Trabajo con Sofi.', en: 'Haha, sorry. My name is Alex. I work with Sofi.', next: 'b', good: true },
      ] },
      b: { npc: '¡Mucho gusto, Alex! Yo soy Mateo. ¿Y de dónde eres? Tu acento suena gringo, jaja.', npcEn: "Nice to meet you, Alex! I'm Mateo. Where are you from? Your accent sounds American, haha.", options: [
        { es: 'Soy de Texas, pero vivo aquí desde hace seis meses.', en: "I'm from Texas, but I've been living here for six months.", next: 'c', good: true },
        { es: 'Jaja, ¡la neta sí! Soy de California.', en: "Haha, honestly yes! I'm from California.", next: 'c', good: true },
      ] },
      c: { npc: '¡Qué chido! ¿Y qué es lo que más te gusta de la ciudad?', npcEn: 'How cool! And what do you like most about the city?', options: [
        { es: 'La comida, sin duda. ¡Los tacos de canasta son lo máximo!', en: 'The food, no doubt. Tacos de canasta are the best!', next: 'd', good: true },
        { es: 'Me encanta que siempre hay algo que hacer.', en: 'I love that there’s always something to do.', next: 'd', good: true },
      ] },
      d: { npc: '¡Neta! Oye, el sábado vamos a ir a la lucha libre a la Arena México. ¿Te late?', npcEn: "For real! Hey, on Saturday we're going to the wrestling at Arena México. Are you in?", options: [
        { es: '¡Claro que sí! ¿A qué hora nos vemos?', en: 'Of course! What time shall we meet?', next: 'e', good: true },
        { es: '¡Sale! Pásame tu WhatsApp y nos ponemos de acuerdo.', en: "Deal! Give me your WhatsApp and we'll sort it out.", next: 'e', good: true },
      ] },
      e: { npc: '¡Va! Te mando mensaje. ¡Qué buena onda conocerte!', npcEn: "Cool! I'll text you. So great to meet you!", end: true },
    },
  },
];

export const SCENARIO_MAP: Record<string, Scenario> = Object.fromEntries(SCENARIOS.map((s) => [s.id, s]));
