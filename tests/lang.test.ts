import { describe, expect, it } from 'vitest';
import { numberToSpanish, pesosToSpanish } from '../src/lib/numbers';
import { timeToSpanish, dateToSpanish } from '../src/lib/time';
import { checkAnswer, detectLanguage, normalize, sentences, wordMatch, tokenize } from '../src/lib/text';
import { newCard, review } from '../src/lib/srs';

describe('numberToSpanish', () => {
  const cases: [number, string][] = [
    [0, 'cero'], [1, 'uno'], [15, 'quince'], [16, 'dieciséis'], [21, 'veintiuno'], [22, 'veintidós'],
    [23, 'veintitrés'], [26, 'veintiséis'], [30, 'treinta'], [31, 'treinta y uno'], [99, 'noventa y nueve'],
    [100, 'cien'], [101, 'ciento uno'], [115, 'ciento quince'], [200, 'doscientos'], [500, 'quinientos'],
    [555, 'quinientos cincuenta y cinco'], [700, 'setecientos'], [900, 'novecientos'], [1000, 'mil'],
    [1001, 'mil uno'], [1534, 'mil quinientos treinta y cuatro'], [2000, 'dos mil'], [21000, 'veintiún mil'],
    [31000, 'treinta y un mil'], [100000, 'cien mil'], [101000, 'ciento un mil'], [1_000_000, 'un millón'],
    [2_000_000, 'dos millones'], [21_000_000, 'veintiún millones'], [1_500_000, 'un millón quinientos mil'],
    [1_000_000_000, 'mil millones'], [2_500_000_000, 'dos mil quinientos millones'], [1e12, 'un billón'],
    [1810, 'mil ochocientos diez'], [2026, 'dos mil veintiséis'],
  ];
  for (const [n, w] of cases) it(String(n), () => expect(numberToSpanish(n)).toBe(w));
  it('apocope', () => {
    expect(numberToSpanish(1, true)).toBe('un');
    expect(numberToSpanish(21, true)).toBe('veintiún');
    expect(numberToSpanish(41, true)).toBe('cuarenta y un');
  });
  it('pesos', () => {
    expect(pesosToSpanish(1)).toBe('un peso');
    expect(pesosToSpanish(21)).toBe('veintiún pesos');
    expect(pesosToSpanish(45.5)).toBe('cuarenta y cinco pesos con cincuenta centavos');
    expect(pesosToSpanish(1_000_000)).toBe('un millón de pesos');
    expect(pesosToSpanish(0.01)).toBe('cero pesos con un centavo');
    expect(pesosToSpanish(1250)).toBe('mil doscientos cincuenta pesos');
  });
});

describe('timeToSpanish', () => {
  it('hours', () => {
    expect(timeToSpanish(13, 0).main).toBe('Es la una de la tarde');
    expect(timeToSpanish(15, 15).main).toBe('Son las tres y cuarto de la tarde');
    expect(timeToSpanish(9, 30).main).toBe('Son las nueve y media de la mañana');
    expect(timeToSpanish(21, 10).main).toBe('Son las nueve y diez de la noche');
    expect(timeToSpanish(3, 5).main).toBe('Son las tres y cinco de la madrugada');
    expect(timeToSpanish(0, 0).main).toBe('Es medianoche');
    expect(timeToSpanish(12, 0).main).toBe('Es mediodía');
    expect(timeToSpanish(1, 20).main).toBe('Es la una y veinte de la madrugada');
  });
  it('para alternative', () => {
    expect(timeToSpanish(15, 45).alt).toBe('Es cuarto para las cuatro');
    expect(timeToSpanish(7, 40).alt).toBe('Son veinte para las ocho');
    expect(timeToSpanish(12, 50).alt).toBe('Son diez para la una');
    expect(timeToSpanish(15, 20).alt).toBeUndefined();
  });
  it('dates', () => {
    expect(dateToSpanish(new Date(2026, 8, 16))).toBe('el miércoles 16 de septiembre de 2026');
    expect(dateToSpanish(new Date(2026, 0, 1))).toBe('el jueves primero de enero de 2026');
  });
});

describe('text', () => {
  it('normalize', () => {
    expect(normalize('¿Cómo estás?')).toBe('cómo estás');
    expect(normalize('¿Cómo estás?', { accents: false })).toBe('como estas');
    expect(normalize('Año', { accents: false })).toBe('año');
  });
  it('checkAnswer', () => {
    expect(checkAnswer('Hola', ['hola']).verdict).toBe('correct');
    expect(checkAnswer('como estas', ['¿Cómo estás?']).verdict).toBe('accent');
    expect(checkAnswer('the car', ['car']).verdict).toBe('correct');
    expect(checkAnswer('car', ['the car / automobile']).verdict).toBe('correct');
    expect(checkAnswer('automobile', ['the car / automobile']).verdict).toBe('correct');
    expect(checkAnswer('computadra', ['computadora']).verdict).toBe('typo');
    expect(checkAnswer('perro', ['gato']).verdict).toBe('wrong');
    expect(checkAnswer('', ['gato']).verdict).toBe('wrong');
    expect(checkAnswer('ano', ['año']).verdict).toBe('wrong');
    expect(checkAnswer('taco', ['el taco']).verdict).toBe('correct');
    expect(checkAnswer('la taco', ['el taco']).verdict).toBe('typo');
    expect(checkAnswer('el telefono celular', ['el teléfono celular']).verdict).toBe('accent');
    expect(checkAnswer('me llamo', ['me llamo…']).verdict).toBe('correct');
  });
  it('detectLanguage', () => {
    expect(detectLanguage('Where is the bathroom?')).toBe('en');
    expect(detectLanguage('¿Dónde está el baño?')).toBe('es');
    expect(detectLanguage('quiero dos tacos de pastor')).toBe('es');
    expect(detectLanguage('I want two tacos')).toBe('en');
    expect(detectLanguage('que onda guey')).toBe('es');
  });
  it('sentences', () => {
    expect(sentences('¿Qué onda? ¡Todo bien! Vámonos...')).toEqual(['¿Qué onda?', '¡Todo bien!', 'Vámonos...']);
  });
  it('wordMatch', () => {
    const r = wordMatch('Buenos días, ¿cómo está?', 'buenos dias como esta');
    expect(r.score).toBe(100);
    expect(r.words.every((w) => w.ok)).toBe(true);
    const r2 = wordMatch('tres tristes tigres', 'tres tigres');
    expect(r2.words.map((w) => w.ok)).toEqual([true, false, true]);
  });
  it('tokenize', () => {
    const t = tokenize('¡Hola, güey!');
    expect(t.filter((x) => x.word).map((x) => x.t)).toEqual(['Hola', 'güey']);
    expect(t.map((x) => x.t).join('')).toBe('¡Hola, güey!');
  });
});

describe('srs', () => {
  it('progresses intervals', () => {
    let c = newCard('x', 'hola', 'hello', 'test', undefined, 0);
    c = review(c, 2, 0);
    expect(c.interval).toBe(1);
    c = review(c, 2, 0);
    expect(c.interval).toBe(3);
    c = review(c, 2, 0);
    expect(c.interval).toBe(8);
    c = review(c, 0, 0);
    expect(c.interval).toBe(0);
    expect(c.lapses).toBe(1);
    expect(c.due).toBe(60000);
  });
});
