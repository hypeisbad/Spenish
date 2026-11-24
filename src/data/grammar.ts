/** Grammar guides with examples and mini-quizzes. */

export interface GrammarTopic {
  id: string;
  title: string;
  titleEn: string;
  emoji: string;
  level: 'A1' | 'A2' | 'B1';
  summary: string;
  sections: { h: string; p: string; ex?: [string, string][] }[];
  quiz: { q: string; options: string[]; answer: number; why: string }[];
}

export const GRAMMAR: GrammarTopic[] = [
  {
    id: 'ser-estar', title: 'Ser vs. Estar', titleEn: 'Two ways to say “to be”', emoji: '⚖️', level: 'A1',
    summary: 'Ser = what something IS (identity, origin, time). Estar = how or where something is (states, location).',
    sections: [
      { h: 'Use SER for…', p: 'Identity, profession, origin, characteristics, time and dates, what something is made of.',
        ex: [['Soy de Chicago.', "I'm from Chicago."], ['Ella es doctora.', "She's a doctor."], ['Son las cinco.', "It's five o'clock."], ['La casa es grande.', 'The house is big.']] },
      { h: 'Use ESTAR for…', p: 'Location, temporary states, emotions, results of a change, and the progressive (estoy comiendo).',
        ex: [['Estoy en el Zócalo.', "I'm in the Zócalo."], ['Estoy cansado.', "I'm tired."], ['La sopa está fría.', 'The soup is cold.'], ['Estamos comiendo.', "We're eating."]] },
      { h: 'Meaning changes!', p: 'Some adjectives change meaning depending on the verb.',
        ex: [['Es aburrido.', "He's boring."], ['Está aburrido.', "He's bored."], ['Es listo.', "He's smart."], ['Está listo.', "He's ready."], ['La comida está rica.', 'The food tastes great.']] },
      { h: 'Events', p: 'Where an event takes place uses SER, even though it’s a location.', ex: [['La fiesta es en mi casa.', 'The party is at my house.']] },
    ],
    quiz: [
      { q: 'Mi mamá ___ maestra.', options: ['es', 'está'], answer: 0, why: 'Profession → ser.' },
      { q: '¿Dónde ___ el baño?', options: ['es', 'está'], answer: 1, why: 'Location → estar.' },
      { q: 'Hoy ___ muy cansada.', options: ['soy', 'estoy'], answer: 1, why: 'Temporary state → estar.' },
      { q: 'La fiesta ___ en el salón.', options: ['es', 'está'], answer: 0, why: 'Events take place → ser.' },
    ],
  },
  {
    id: 'por-para', title: 'Por vs. Para', titleEn: 'For, by, through…', emoji: '🔀', level: 'A2',
    summary: 'Para points to a goal or destination. Por looks at cause, exchange, duration, or route.',
    sections: [
      { h: 'PARA → destination & purpose', p: 'Goal, recipient, deadline, destination, purpose (in order to).',
        ex: [['Este regalo es para ti.', 'This gift is for you.'], ['Salgo para Cancún.', "I'm leaving for Cancún."], ['Estudio para aprender.', 'I study (in order) to learn.'], ['Es para el lunes.', "It's due Monday."]] },
      { h: 'POR → cause, exchange, route', p: 'Reason, exchange/price, duration, through/along, means, “per”.',
        ex: [['Gracias por todo.', 'Thanks for everything.'], ['Lo compré por cien pesos.', 'I bought it for 100 pesos.'], ['Caminamos por el parque.', 'We walked through the park.'], ['Te llamo por teléfono.', "I'll call you on the phone."]] },
      { h: 'Set phrases', p: 'Memorize these: por favor, por fin, por eso, por ejemplo, por supuesto, para siempre.' },
    ],
    quiz: [
      { q: 'Gracias ___ la comida.', options: ['por', 'para'], answer: 0, why: 'Reason/exchange → por.' },
      { q: 'El café es ___ mi papá.', options: ['por', 'para'], answer: 1, why: 'Recipient → para.' },
      { q: 'Trabajo ___ ganar lana.', options: ['por', 'para'], answer: 1, why: 'Purpose (in order to) → para.' },
      { q: 'Pasamos ___ Guadalajara.', options: ['por', 'para'], answer: 0, why: 'Through/via → por.' },
    ],
  },
  {
    id: 'preterito-imperfecto', title: 'Pretérito vs. Copretérito', titleEn: 'Preterite vs. imperfect', emoji: '🎞️', level: 'B1',
    summary: 'Pretérito = completed events (the plot). Imperfecto = background, habits, descriptions (the scenery).',
    sections: [
      { h: 'Pretérito: what happened', p: 'Single, completed actions with a clear beginning or end.',
        ex: [['Ayer comí pozole.', 'Yesterday I ate pozole.'], ['Llegué a las ocho.', 'I arrived at eight.'], ['Vivimos en Mérida dos años.', 'We lived in Mérida for two years.']] },
      { h: 'Imperfecto: how it used to be', p: 'Habits, ongoing past actions, descriptions, age, time, feelings.',
        ex: [['De niño, jugaba fut todos los días.', 'As a kid, I used to play soccer every day.'], ['Era la una y llovía.', 'It was one o’clock and it was raining.'], ['Tenía diez años.', 'I was ten years old.']] },
      { h: 'Together', p: 'The imperfect sets the scene; the preterite interrupts it.', ex: [['Dormía cuando sonó el teléfono.', 'I was sleeping when the phone rang.']] },
      { h: '🇲🇽 Mexico tip', p: 'For completed actions today, Mexicans usually use the preterite (“Hoy comí tacos”), while Spain prefers “he comido”.' },
    ],
    quiz: [
      { q: 'Cuando era niño, ___ en Puebla.', options: ['viví', 'vivía'], answer: 1, why: 'Background/habit → imperfecto.' },
      { q: 'Ayer ___ una película.', options: ['vi', 'veía'], answer: 0, why: 'Completed action → pretérito.' },
      { q: '___ las diez de la noche.', options: ['Fueron', 'Eran'], answer: 1, why: 'Time in the past → imperfecto.' },
      { q: 'Leía cuando mi mamá ___.', options: ['llegó', 'llegaba'], answer: 0, why: 'Interrupting event → pretérito.' },
    ],
  },
  {
    id: 'genero', title: 'Género y artículos', titleEn: 'Gender & articles', emoji: '⚧️', level: 'A1',
    summary: 'Every noun is masculine or feminine. Articles and adjectives agree with it.',
    sections: [
      { h: 'Articles', p: 'el (m. sing.), la (f. sing.), los (m. pl.), las (f. pl.) · un, una, unos, unas.', ex: [['el taco', 'the taco'], ['la tortilla', 'the tortilla'], ['unos tacos', 'some tacos']] },
      { h: 'Patterns', p: 'Usually -o is masculine, -a feminine. Words in -ción, -dad, -tad are feminine. Many in -ma are masculine.',
        ex: [['la canción', 'the song'], ['la ciudad', 'the city'], ['el problema', 'the problem'], ['el día', 'the day'], ['la mano', 'the hand']] },
      { h: 'Feminine words starting with stressed a-', p: 'They take “el” in the singular for sound, but stay feminine.', ex: [['el agua fría', 'the cold water'], ['las aguas frescas', 'the fresh fruit drinks']] },
    ],
    quiz: [
      { q: '___ problema', options: ['el', 'la'], answer: 0, why: 'Problema is masculine (from Greek -ma).' },
      { q: '___ ciudad', options: ['el', 'la'], answer: 1, why: '-dad words are feminine.' },
      { q: 'el agua ___', options: ['frío', 'fría'], answer: 1, why: 'Agua is feminine; it just takes “el”.' },
    ],
  },
  {
    id: 'usted', title: 'Tú, usted y ustedes', titleEn: 'Formal vs. informal you', emoji: '🎩', level: 'A1',
    summary: 'Use tú with friends and peers, usted for respect. In Mexico, ustedes is THE plural “you” — always.',
    sections: [
      { h: 'Tú', p: 'Friends, family, kids, people your age in casual settings.', ex: [['¿Cómo estás?', 'How are you?']] },
      { h: 'Usted', p: 'Elders, strangers, officials, service settings, and many workplaces. Conjugate like él/ella.', ex: [['¿Cómo está usted?', 'How are you? (formal)'], ['¿Me puede ayudar?', 'Can you help me?']] },
      { h: 'Ustedes', p: 'Plural “you” for any group, formal or not. Vosotros is only used in Spain.', ex: [['¿Ustedes quieren algo?', 'Do you (all) want anything?']] },
      { h: '🇲🇽 Tip', p: 'Mexicans often use usted with older family members and even with children affectionately. When in doubt, start with usted.' },
    ],
    quiz: [
      { q: 'To an older stranger: ¿Cómo ___?', options: ['estás', 'está'], answer: 1, why: 'Respect → usted (está).' },
      { q: 'To a group of friends in Mexico: ¿___ vienen?', options: ['Vosotros', 'Ustedes'], answer: 1, why: 'Mexico uses ustedes for all plural “you”.' },
    ],
  },
  {
    id: 'gustar', title: 'Gustar y compañía', titleEn: 'Saying what you like', emoji: '❤️', level: 'A1',
    summary: '“Me gusta” literally means “it pleases me”. The verb agrees with the thing liked.',
    sections: [
      { h: 'Structure', p: '(A mí) me / te / le / nos / les + gusta (singular) / gustan (plural).',
        ex: [['Me gusta el café.', 'I like coffee.'], ['Me gustan los tacos.', 'I like tacos.'], ['¿Te gusta bailar?', 'Do you like to dance?'], ['A ella le gusta leer.', 'She likes to read.']] },
      { h: 'Similar verbs', p: 'encantar (to love), interesar, importar, doler (to hurt), caer bien/mal (to like/dislike someone).',
        ex: [['Me encanta México.', 'I love Mexico.'], ['Me duelen los pies.', 'My feet hurt.'], ['Tu primo me cae muy bien.', 'I really like your cousin.']] },
    ],
    quiz: [
      { q: 'Me ___ las enchiladas.', options: ['gusta', 'gustan'], answer: 1, why: 'Plural thing → gustan.' },
      { q: '¿A ti ___ gusta el fut?', options: ['te', 'le'], answer: 0, why: 'A ti → te.' },
      { q: 'Me ___ la cabeza.', options: ['duele', 'duelen'], answer: 0, why: 'Singular (la cabeza) → duele.' },
    ],
  },
  {
    id: 'ir-a', title: 'Ir a + infinitivo', titleEn: 'The everyday future', emoji: '🚀', level: 'A1',
    summary: 'voy / vas / va / vamos / van + a + infinitive = going to do something. It’s how Mexicans talk about the future.',
    sections: [
      { h: 'Formula', p: 'Conjugate ir in the present + a + infinitive.', ex: [['Voy a comer.', "I'm going to eat."], ['¿Vas a venir?', 'Are you going to come?'], ['Vamos a ver.', "We'll see."]] },
      { h: 'Simple future', p: 'The simple future (comeré) exists but sounds more formal — or expresses a guess: ¿Dónde estará? (Where could it be?)' },
    ],
    quiz: [
      { q: 'Mañana ___ a viajar a Cancún.', options: ['voy', 'soy'], answer: 0, why: 'Ir (voy) + a + infinitive.' },
      { q: 'Ellos van a ___ tacos.', options: ['comen', 'comer'], answer: 1, why: 'After “a” use the infinitive.' },
    ],
  },
  {
    id: 'subjuntivo', title: 'El subjuntivo', titleEn: 'The subjunctive mood', emoji: '🌈', level: 'B1',
    summary: 'Used after expressions of wishes, emotions, doubt, and certain conjunctions — when the action is not a plain fact.',
    sections: [
      { h: 'Triggers (WEIRDO)', p: 'Wishes, Emotions, Impersonal expressions, Recommendations, Doubt/Denial, Ojalá.',
        ex: [['Quiero que vengas.', 'I want you to come.'], ['Me alegra que estés aquí.', "I'm glad you're here."], ['Es importante que descanses.', "It's important that you rest."], ['Ojalá que no llueva.', 'Hopefully it won’t rain.'], ['No creo que sea cierto.', "I don't think it's true."]] },
      { h: 'Future time clauses', p: 'After cuando, en cuanto, hasta que… referring to the future.', ex: [['Cuando llegues, me avisas.', 'When you arrive, let me know.']] },
      { h: 'How to form it', p: 'Take the yo present, drop -o, add the “opposite” vowel: hablar → hable, comer → coma, tener (tengo) → tenga.' },
    ],
    quiz: [
      { q: 'Quiero que tú ___ conmigo.', options: ['vienes', 'vengas'], answer: 1, why: 'Wish with a different subject → subjunctive.' },
      { q: 'Ojalá que ___ buen clima.', options: ['hace', 'haga'], answer: 1, why: 'Ojalá always triggers the subjunctive.' },
      { q: 'Creo que ___ razón.', options: ['tienes', 'tengas'], answer: 0, why: 'Belief (creo que) → indicative.' },
    ],
  },
  {
    id: 'diminutivos', title: 'Diminutivos mexicanos', titleEn: 'The magic of -ito', emoji: '🤏', level: 'A2',
    summary: 'Mexicans add -ito/-ita to almost anything to sound warm, polite, or to soften a request.',
    sections: [
      { h: 'Everyday examples', p: 'Diminutives soften and add affection.',
        ex: [['Un cafecito', 'A little coffee (a nice coffee)'], ['Espérame tantito.', 'Wait for me a little bit.'], ['Ahorita vuelvo.', "I'll be right back."], ['¿Me da una bolsita?', 'Could I have a little bag?'], ['Mi abuelita', 'My grandma (dear)']] },
      { h: 'Forming it', p: '-o/-a → -ito/-ita (casa → casita). After e/n/r → -cito (café → cafecito, mujer → mujercita). c/g/z change: chico → chiquito, amigo → amiguito, taza → tacita.' },
      { h: 'Even adverbs!', p: 'ahora → ahorita, cerca → cerquita, luego → lueguito, adiós → adiosito.' },
    ],
    quiz: [
      { q: 'café → ___', options: ['cafeito', 'cafecito'], answer: 1, why: 'Words ending in -e add -cito.' },
      { q: 'chico → ___', options: ['chiquito', 'chicito'], answer: 0, why: 'c → qu before -ito.' },
    ],
  },
  {
    id: 'pronombres', title: 'Pronombres de objeto', titleEn: 'Object pronouns', emoji: '🎯', level: 'B1',
    summary: 'lo/la/los/las replace direct objects; le/les indirect objects. Together, le/les becomes se: se lo doy.',
    sections: [
      { h: 'Direct objects', p: 'Replace the thing: me, te, lo, la, nos, los, las.', ex: [['¿Tienes la llave? Sí, la tengo.', 'Do you have the key? Yes, I have it.']] },
      { h: 'Indirect objects', p: 'To/for whom: me, te, le, nos, les.', ex: [['Le doy el dinero.', 'I give him the money.']] },
      { h: 'Both together', p: 'Indirect first; le/les → se before lo/la.', ex: [['Se lo doy.', 'I give it to him.'], ['¿Me lo pasas?', 'Can you pass it to me?']] },
      { h: 'Attach to commands', p: 'Affirmative commands attach pronouns (with an accent): Dámelo. Negative ones go before: No me lo des.' },
    ],
    quiz: [
      { q: '¿El libro? Sí, ___ tengo.', options: ['lo', 'la'], answer: 0, why: 'El libro → lo.' },
      { q: 'Le doy la carta → ___ doy.', options: ['Le la', 'Se la'], answer: 1, why: 'le + la → se la.' },
    ],
  },
  {
    id: 'preguntas', title: 'Hacer preguntas', titleEn: 'Asking questions', emoji: '❓', level: 'A1',
    summary: 'Question words carry an accent and Spanish uses opening marks: ¿…? and ¡…!',
    sections: [
      { h: 'Question words', p: '¿Qué? (what) ¿Quién? (who) ¿Dónde? (where) ¿Cuándo? (when) ¿Cómo? (how) ¿Cuánto? (how much) ¿Cuál? (which) ¿Por qué? (why)',
        ex: [['¿Dónde vives?', 'Where do you live?'], ['¿Cuánto cuesta?', 'How much is it?'], ['¿Por qué no?', 'Why not?'], ['¿Cuál prefieres?', 'Which one do you prefer?']] },
      { h: 'Yes/No questions', p: 'Just raise your intonation — no word order change needed.', ex: [['¿Tienes hambre?', 'Are you hungry?']] },
      { h: '🇲🇽 ¿Mande?', p: 'If you didn’t catch something, say “¿Mande?” — it’s the polite Mexican “pardon?”. A bare “¿Qué?” can sound abrupt.' },
    ],
    quiz: [
      { q: '¿___ cuesta el boleto?', options: ['Cuánto', 'Cuándo'], answer: 0, why: 'Price → cuánto.' },
      { q: '¿___ es tu cumpleaños?', options: ['Dónde', 'Cuándo'], answer: 1, why: 'Time → cuándo.' },
    ],
  },
];

export const GRAMMAR_MAP: Record<string, GrammarTopic> = Object.fromEntries(GRAMMAR.map((g) => [g.id, g]));
