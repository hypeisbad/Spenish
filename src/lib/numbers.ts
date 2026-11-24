/** Spanish number words (Mexican usage — "mil millones" for 10^9, "billón" for 10^12). */

const UNITS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
const TEENS = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
const TWENTIES = [
  'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro',
  'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve',
];
const TENS = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const HUNDREDS = [
  '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos',
  'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos',
];

/** 0–999. `apocope` turns a final "uno" into "un" (before a noun, mil, millón). */
function below1000(n: number, apocope: boolean): string {
  if (n === 0) return '';
  if (n === 100) return 'cien';
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h) parts.push(HUNDREDS[h]);
  if (rest) parts.push(below100(rest, apocope));
  return parts.join(' ');
}

function below100(n: number, apocope: boolean): string {
  let w: string;
  if (n < 10) w = UNITS[n];
  else if (n < 20) w = TEENS[n - 10];
  else if (n < 30) w = TWENTIES[n - 20];
  else {
    const t = Math.floor(n / 10);
    const u = n % 10;
    w = u ? `${TENS[t]} y ${UNITS[u]}` : TENS[t];
  }
  if (apocope) {
    if (w === 'veintiuno') return 'veintiún';
    if (w.endsWith('uno')) return w.slice(0, -3) + 'un';
  }
  return w;
}

/** Integer 0 ≤ n < 10^15 to words. `apocope` for use before a masculine noun ("un peso", "veintiún pesos"). */
export function numberToSpanish(n: number, apocope = false): string {
  if (!Number.isFinite(n)) throw new Error('Invalid number');
  n = Math.trunc(Math.abs(n));
  if (n === 0) return 'cero';
  if (n >= 1e15) throw new Error('Number too large');

  const billones = Math.floor(n / 1e12);
  const millones = Math.floor((n % 1e12) / 1e6); // up to 999,999 → "mil millones" style
  const miles = Math.floor((n % 1e6) / 1000);
  const resto = n % 1000;
  const parts: string[] = [];

  if (billones) parts.push(billones === 1 ? 'un billón' : `${thousandsGroup(billones)} billones`);
  if (millones) parts.push(millones === 1 ? 'un millón' : `${thousandsGroup(millones)} millones`);
  if (miles) parts.push(miles === 1 ? 'mil' : `${below1000(miles, true)} mil`);
  if (resto) parts.push(below1000(resto, apocope));
  return parts.join(' ');
}

/** 1–999,999 used before "millones"/"billones" (always apocopated: veintiún millones). */
function thousandsGroup(n: number): string {
  const th = Math.floor(n / 1000);
  const r = n % 1000;
  const parts: string[] = [];
  if (th) parts.push(th === 1 ? 'mil' : `${below1000(th, true)} mil`);
  if (r) parts.push(below1000(r, true));
  return parts.join(' ');
}

/** "$1,250.50" → "mil doscientos cincuenta pesos con cincuenta centavos" */
export function pesosToSpanish(amount: number): string {
  const total = Math.round(Math.abs(amount) * 100);
  const pesos = Math.floor(total / 100);
  const centavos = total % 100;
  const millionsExact = pesos >= 1e6 && pesos % 1e6 === 0;
  let p = pesos === 1 ? 'un peso' : `${numberToSpanish(pesos, true)} ${millionsExact ? 'de pesos' : 'pesos'}`;
  if (pesos === 0) p = 'cero pesos';
  if (!centavos) return p;
  const c = centavos === 1 ? 'un centavo' : `${numberToSpanish(centavos, true)} centavos`;
  return `${p} con ${c}`;
}

/** Ordinals 1–10 (masculine), commonly used. */
export const ORDINALS = ['primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto', 'séptimo', 'octavo', 'noveno', 'décimo'];

/** Format with Mexican conventions: comma thousands, dot decimals. */
export function formatMx(n: number, decimals = 0): string {
  return n.toLocaleString('es-MX', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
