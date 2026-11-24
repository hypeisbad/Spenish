// End-to-end smoke test: visits every route in Chromium and fails on console/page errors.
// Usage: npm run build && npx vite preview --port 4173 & node scripts/smoke.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/';
const OUT = process.env.SHOTS ?? '';
const ROUTES = [
  '/', '/translate', '/conversation', '/scan', '/learn', '/lesson/saludos/0', '/lesson/comida/final', '/review',
  '/verbs', '/verbs/tener', '/verbs/levantarse', '/lab', '/grammar', '/grammar/ser-estar', '/speak', '/tutor',
  '/scenario/taqueria', '/games', '/games/loteria', '/games/memorama', '/games/lluvia', '/games/numeros',
  '/games/relampago', '/stories', '/stories/llorona', '/phrases', '/slang', '/culture', '/tools', '/dictionary?q=fuimos',
  '/progress', '/settings', '/does-not-exist',
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
// Mock external translation/rate APIs so the test is deterministic and offline-safe.
await ctx.route('https://translate.googleapis.com/**', (r) =>
  r.fulfill({ contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ sentences: [{ trans: '¿Dónde está el baño?', orig: 'Where is the bathroom?' }], src: 'en' }) }));
await ctx.route('https://api.frankfurter.app/**', (r) =>
  r.fulfill({ contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ rates: { MXN: 18.25 }, date: '2026-11-24' }) }));
await ctx.addInitScript(() => {
  localStorage.setItem('spenish-v1', JSON.stringify({ state: { onboarded: true }, version: 1 }));
});
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(`[console] ${page.url()} :: ${m.text()}`); });
page.on('pageerror', (e) => errors.push(`[pageerror] ${page.url()} :: ${e.message}`));

for (const r of ROUTES) {
  process.stdout.write(r + ' ');
  await page.goto(BASE + '#' + r);
  await page.waitForSelector('.page', { timeout: 10000 });
  await page.waitForTimeout(350);
  const h = await page.evaluate(() => document.querySelector('.page')?.textContent?.length ?? 0);
  if (h < 20) errors.push(`[empty] ${r}`);
  if (OUT) await page.screenshot({ path: `${OUT}/${r.replace(/[^a-z0-9]+/gi, '_') || 'home'}.png` });
}
await browser.close();
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`OK — ${ROUTES.length} routes rendered with no errors`);
