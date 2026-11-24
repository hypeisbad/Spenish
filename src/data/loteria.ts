/**
 * Lotería — traditional Mexican bingo. Card names are traditional; the
 * caller's verses are the widely-known folk versions (many regional variants exist).
 * Artwork here is our own emoji-based design.
 */

export interface LoteriaCard {
  n: number;
  name: string;
  en: string;
  emoji: string;
  verse: string;
  verseEn: string;
}

type C = [name: string, en: string, emoji: string, verse: string, verseEn: string];

const rows: C[] = [
  ['El gallo', 'The rooster', '🐓', 'El que le cantó a San Pedro no le volverá a cantar.', 'The one who sang to Saint Peter will never sing again.'],
  ['El diablito', 'The little devil', '😈', 'Pórtate bien, cuatito, si no te lleva el coloradito.', 'Behave, buddy, or the little red one will take you.'],
  ['La dama', 'The lady', '💃', 'Puliendo el paso, por toda la calle real.', 'Strutting her stuff all along the main street.'],
  ['El catrín', 'The dandy', '🎩', 'Don Ferruco en la alameda, su bastón quería tirar.', 'Don Ferruco in the park wanted to toss his cane.'],
  ['El paraguas', 'The umbrella', '☂️', 'Para el sol y para el agua.', 'For the sun and for the rain.'],
  ['La sirena', 'The mermaid', '🧜‍♀️', 'Con los cantos de sirena, no te vayas a marear.', "Don't get dizzy from the mermaid's songs."],
  ['La escalera', 'The ladder', '🪜', 'Súbeme paso a pasito, no quieras pegar brinquitos.', "Take me up step by step, don't try to jump."],
  ['La botella', 'The bottle', '🍾', 'La herramienta del borracho.', "The drunkard's tool."],
  ['El barril', 'The barrel', '🛢️', 'Tanto bebió el albañil, que quedó como barril.', 'The bricklayer drank so much he ended up like a barrel.'],
  ['El árbol', 'The tree', '🌳', 'El que a buen árbol se arrima, buena sombra le cobija.', 'Lean on a good tree and good shade will cover you.'],
  ['El melón', 'The melon', '🍈', 'Me lo das o me lo quitas.', 'Give it to me or take it away.'],
  ['El valiente', 'The brave one', '🗡️', '¿Por qué le corres, cobarde, trayendo tan buen puñal?', 'Why do you run, coward, carrying such a fine dagger?'],
  ['El gorrito', 'The little bonnet', '🧢', 'Ponle su gorrito al nene, no se nos vaya a resfriar.', "Put the baby's bonnet on so he won't catch a cold."],
  ['La muerte', 'Death', '💀', 'La muerte tilica y flaca.', 'Death, skinny and scrawny.'],
  ['La pera', 'The pear', '🍐', 'El que espera, desespera.', 'He who waits, despairs.'],
  ['La bandera', 'The flag', '🇲🇽', 'Verde, blanco y colorado, la bandera del soldado.', "Green, white and red, the soldier's flag."],
  ['El bandolón', 'The mandolin', '🪕', 'Tocando su bandolón, está el mariachi Simón.', 'Mariachi Simón is playing his mandolin.'],
  ['El violoncello', 'The cello', '🎻', 'Creciendo se fue hasta el cielo, y como no fue violín, tuvo que ser violoncello.', "It grew up to the sky, and since it wasn't a violin, it had to be a cello."],
  ['El pájaro', 'The bird', '🐦', 'Tú me traes a puros brincos, como pájaro en la rama.', 'You keep me jumping like a bird on a branch.'],
  ['La mano', 'The hand', '✋', 'La mano de un criminal.', "A criminal's hand."],
  ['La bota', 'The boot', '👢', 'Una bota igual que la otra.', 'One boot just like the other.'],
  ['La luna', 'The moon', '🌙', 'El farol de los enamorados.', "The lovers' lantern."],
  ['El cotorro', 'The parrot', '🦜', 'Cotorro, cotorro, saca la pata, y empiézame a platicar.', 'Parrot, parrot, stick out your foot and start chatting with me.'],
  ['El borracho', 'The drunkard', '🥴', '¡Ah, qué borracho tan necio, ya no lo puedo aguantar!', "Oh, what a stubborn drunk, I can't stand him anymore!"],
  ['El corazón', 'The heart', '❤️', 'No me extrañes, corazón, que regreso en el camión.', "Don't miss me, sweetheart, I'll be back on the bus."],
  ['La sandía', 'The watermelon', '🍉', 'La barriga que Juan tenía era empacho de sandía.', "Juan's big belly was a watermelon bellyache."],
  ['El tambor', 'The drum', '🥁', 'No te arrugues, cuero viejo, que te quiero pa’ tambor.', "Don't wrinkle, old leather, I want you for a drum."],
  ['El camarón', 'The shrimp', '🦐', 'Camarón que se duerme, se lo lleva la corriente.', 'The shrimp that falls asleep gets carried away by the current.'],
  ['El músico', 'The musician', '🎺', 'El músico trompas de hule, ya no me quiere tocar.', "The rubber-lipped musician won't play for me anymore."],
  ['La araña', 'The spider', '🕷️', 'Atarántamela a palos, no me la dejes llegar.', "Stun it with a stick, don't let it reach me."],
  ['El soldado', 'The soldier', '💂', 'Uno, dos y tres, el soldado p’al cuartel.', 'One, two and three, the soldier off to the barracks.'],
  ['La estrella', 'The star', '⭐', 'La guía de los marineros.', "The sailors' guide."],
  ['El cazo', 'The saucepan', '🍳', 'El caso que te hago es poco.', 'I pay you little attention (a pun on caso/cazo).'],
  ['El mundo', 'The world', '🌎', 'Este mundo es una bola, y nosotros un bolón.', 'This world is a ball, and we are a big bunch.'],
  ['El nopal', 'The cactus', '🌵', 'Al nopal lo van a ver nomás cuando tiene tunas.', 'People only visit the cactus when it has fruit.'],
  ['El alacrán', 'The scorpion', '🦂', 'El que con la cola pica, le dan una paliza.', 'Whoever stings with its tail gets a beating.'],
  ['La rosa', 'The rose', '🌹', 'Rosita, Rosaura, ven que te quiero ahora.', 'Rosita, Rosaura, come, I love you now.'],
  ['La calavera', 'The skull', '☠️', 'Al pasar por el panteón, me encontré un calaverón.', 'Passing by the cemetery, I found a big skull.'],
  ['La campana', 'The bell', '🔔', 'Tú con la campana y yo con tu hermana.', "You with the bell and me with your sister."],
  ['El cantarito', 'The little jug', '🏺', 'Tanto va el cántaro al agua, que se quiebra y te moja las enaguas.', 'The jug goes to the water so often that it breaks and soaks your skirt.'],
  ['El venado', 'The deer', '🦌', 'Saltando va buscando, pero no ve nada.', 'It goes jumping and searching, but sees nothing.'],
  ['El sol', 'The sun', '☀️', 'La cobija de los pobres.', "The poor man's blanket."],
  ['La corona', 'The crown', '👑', 'El sombrero de los reyes.', "The kings' hat."],
  ['La chalupa', 'The canoe', '🛶', 'Rema que rema Lupita, sentada en su chalupita.', 'Lupita rows and rows, sitting in her little canoe.'],
  ['El pino', 'The pine tree', '🌲', 'Fresco y oloroso, en todo tiempo hermoso.', 'Fresh and fragrant, beautiful in every season.'],
  ['El pescado', 'The fish', '🐟', 'El que por la boca muere, aunque mudo fuera.', 'He who dies by his mouth, even if he were mute.'],
  ['La palma', 'The palm tree', '🌴', 'Palmero, sube a la palma y bájame un coco real.', 'Palm climber, go up the palm and bring me down a royal coconut.'],
  ['La maceta', 'The flowerpot', '🪴', 'El que nace pa’ maceta, no sale del corredor.', 'Whoever is born to be a flowerpot never leaves the hallway.'],
  ['La rana', 'The frog', '🐸', 'Al ver a la verde rana, qué susto se llevó.', 'Upon seeing the green frog, what a fright he got.'],
  ['El arpa', 'The harp', '🎼', 'Arpa vieja de mi suegra, ya no sirves pa’ tocar.', "My mother-in-law's old harp, you're no good for playing anymore."],
];

export const LOTERIA: LoteriaCard[] = rows.map(([name, en, emoji, verse, verseEn], i) => ({ n: i + 1, name, en, emoji, verse, verseEn }));
