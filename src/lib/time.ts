import { numberToSpanish } from './numbers';

/** Hour word for 1–12 (feminine agreement with "hora": "la una"). */
function hourWord(h12: number): string {
  return h12 === 1 ? 'una' : numberToSpanish(h12);
}

function to12(h24: number): number {
  const h = h24 % 12;
  return h === 0 ? 12 : h;
}

/** Part of day, as commonly said in Mexico. */
export function periodOfDay(h24: number, m = 0): string {
  if (h24 === 12 && m === 0) return 'del día';
  if (h24 >= 1 && h24 < 6) return 'de la madrugada';
  if (h24 >= 6 && h24 < 12) return 'de la mañana';
  if (h24 >= 12 && h24 < 20) return 'de la tarde';
  return 'de la noche';
}

function minutesWord(m: number): string {
  if (m === 15) return 'cuarto';
  if (m === 30) return 'media';
  return numberToSpanish(m);
}

export interface SpanishTime {
  /** Main reading, e.g. "Son las tres y cuarto de la tarde" */
  main: string;
  /** Mexican "para" alternative for :35–:55, e.g. "Son veinte para las cuatro" */
  alt?: string;
  /** English gloss */
  en: string;
}

/** Tell the time the Mexican way. */
export function timeToSpanish(h24: number, m: number, withPeriod = true): SpanishTime {
  const h12 = to12(h24);
  const en = `${h12}:${String(m).padStart(2, '0')} ${h24 < 12 ? 'a.m.' : 'p.m.'}`;

  if (m === 0 && h24 === 0) return { main: 'Es medianoche', en: 'It’s midnight' };
  if (m === 0 && h24 === 12) return { main: 'Es mediodía', alt: 'Son las doce del día', en: 'It’s noon' };

  const verb = h12 === 1 ? 'Es la' : 'Son las';
  const period = withPeriod ? ` ${periodOfDay(h24, m)}` : '';
  const main = m === 0 ? `${verb} ${hourWord(h12)}${period}` : `${verb} ${hourWord(h12)} y ${minutesWord(m)}${period}`;

  let alt: string | undefined;
  if (m >= 35 && m % 5 === 0) {
    const nextH24 = (h24 + 1) % 24;
    const next12 = to12(nextH24);
    const left = 60 - m;
    const target = next12 === 1 ? 'la una' : `las ${hourWord(next12)}`;
    if (left === 15) alt = `Es cuarto para ${target}`;
    else alt = `Son ${numberToSpanish(left)} para ${target}`;
  }
  return { main, alt, en: `It’s ${en}` };
}

/** Live clock text for a given IANA zone (default CDMX). */
export function nowInZone(zone = 'America/Mexico_City', date = new Date()): { h: number; m: number; s: number; weekday: string; dateText: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone, hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const weekday = new Intl.DateTimeFormat('es-MX', { timeZone: zone, weekday: 'long' }).format(date);
  const dateText = new Intl.DateTimeFormat('es-MX', { timeZone: zone, day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  return { h: get('hour') % 24, m: get('minute'), s: get('second'), weekday, dateText };
}

export const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
export const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** "el lunes 24 de noviembre de 2026" */
export function dateToSpanish(d: Date): string {
  const day = d.getDate() === 1 ? 'primero' : String(d.getDate());
  return `el ${DAYS[d.getDay()]} ${day} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}
