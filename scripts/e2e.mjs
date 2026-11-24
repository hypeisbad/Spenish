// Interactive end-to-end checks (mocked network). Run against `vite` or `vite preview`.
//   BASE_URL=http://localhost:5173/ node scripts/e2e.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/';
const SHOTS = process.env.SHOTS ?? '';
const results = [];
const errors = [];
let googleMode = 'ok';

function check(name, cond, extra = '') {
  results.push(`${cond ? '✅' : '❌'} ${name}${extra ? ' — ' + extra : ''}`);
  if (!cond) process.exitCode = 1;
}

const json = (body) => ({ contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) });

async function setup(browser, opts = {}) {
  const ctx = await browser.newContext(opts.device ?? { viewport: { width: 1280, height: 860 } });
  await ctx.route('https://translate.googleapis.com/**', (r) => {
    if (googleMode === 'fail') return r.abort();
    const q = new URL(r.request().url()).searchParams.get('q');
    const tl = new URL(r.request().url()).searchParams.get('tl');
    const out = tl === 'es' ? '¿Dónde está el baño? Quiero un coche.' : 'Where is the bathroom?';
    return r.fulfill(json({ sentences: [{ trans: out, orig: q }], src: tl === 'es' ? 'en' : 'es', dict: [{ pos: 'noun', terms: ['bathroom', 'restroom'] }] }));
  });
  await ctx.route('https://api.mymemory.translated.net/**', (r) => {
    if (googleMode === 'fail') return r.abort();
    return r.fulfill(json({ responseStatus: 200, responseData: { translatedText: 'Hola amigo &#39;test&#39;' } }));
  });
  await ctx.route('https://api.frankfurter.app/**', (r) => r.fulfill(json({ rates: { MXN: 18.25 }, date: '2026-11-24' })));
  if (opts.onboarded !== false) {
    await ctx.addInitScript(() => {
      if (!localStorage.getItem('spenish-v1')) localStorage.setItem('spenish-v1', JSON.stringify({ state: { onboarded: true }, version: 1 }));
    });
  }
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('net::ERR_FAILED')) errors.push(`[console] ${page.url()} :: ${m.text().slice(0, 300)}`); });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${page.url()} :: ${e.message}`));
  return { ctx, page };
}

const go = async (page, route) => {
  await page.goto(BASE + '#' + route);
  await page.waitForSelector('.page', { timeout: 10000 });
  await page.waitForTimeout(250);
};
const store = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('spenish-v1') ?? '{}').state ?? {});

const browser = await chromium.launch();

/* 1. Onboarding */
{
  const { ctx, page } = await setup(browser, { onboarded: false });
  await page.goto(BASE);
  await page.getByRole('button', { name: /Vámonos/ }).click();
  await page.getByLabel('Your name').fill('Trip');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: /Serio/ }).click();
  await page.getByRole('button', { name: /Empezar! · Start/ }).click();
  await page.waitForTimeout(400);
  const h1 = await page.locator('h1.h1').first().textContent();
  const st = await store(page);
  check('Onboarding saves name & goal and greets by name', h1.includes('Trip') && st.settings?.dailyGoal === 100, h1);
  await ctx.close();
}

const { ctx, page } = await setup(browser);

/* 2. Translator: Google, Spain→Mexico hints, back-translation, history */
{
  await go(page, '/translate');
  await page.getByLabel('Text to translate').fill('Where is the bathroom? I want a car.');
  await page.keyboard.press('Enter');
  await page.waitForSelector('text=¿Dónde está el baño?', { timeout: 8000 });
  const hint = await page.locator('text=En México se dice').count();
  const provider = await page.locator('.chip', { hasText: 'Google' }).count();
  check('Translate EN→ES via Google', provider > 0);
  check('Spain-only word “coche” flagged with Mexican “carro”', hint > 0);
  await page.getByRole('button', { name: /Verificar/ }).click();
  await page.waitForSelector('text=Back-translation', { timeout: 5000 });
  check('Back-translation check works', true);
  const st = await store(page);
  check('Translation saved to history', (st.history ?? []).length >= 1);
  // Fallback chain: Google + MyMemory fail → offline dictionary
  googleMode = 'fail';
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.getByRole('radio', { name: /Español/ }).click();
  await page.getByLabel('Text to translate').fill('gracias');
  await page.keyboard.press('Enter');
  await page.waitForSelector('text=Offline dictionary', { timeout: 20000 });
  const out = await page.locator('.chip', { hasText: 'Offline' }).count();
  check('Falls back to offline dictionary when online services fail', out > 0);
  googleMode = 'ok';
  // slang detection
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.getByLabel('Text to translate').fill('¿Qué onda, güey? Está bien chido');
  await page.keyboard.press('Enter');
  await page.waitForSelector('text=Mexican slang detected', { timeout: 8000 });
  check('Mexican slang detected in input', true);
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/e2e-translate.png` });
}

/* 3. Full lesson flow */
{
  await go(page, '/lesson/saludos/0');
  await page.getByRole('button', { name: /Saltar/ }).click();
  for (let step = 0; step < 60; step++) {
    if (await page.getByRole('button', { name: /Repetir/ }).count()) break;
    const cont = page.getByRole('button', { name: /Continuar/ });
    if (await cont.count()) { await cont.click(); continue; }
    if (await page.getByRole('button', { name: /No puedo hablar/ }).count()) { await page.getByRole('button', { name: /No puedo hablar/ }).click(); continue; }
    if (await page.getByLabel('Your answer').count()) {
      await page.getByLabel('Your answer').fill('hola');
      await page.getByRole('button', { name: 'Comprobar' }).click();
      continue;
    }
    if (await page.locator('.tiles-bank').count()) {
      await page.locator('.tiles-bank .wtile').first().click();
      await page.getByRole('button', { name: 'Comprobar' }).click();
      continue;
    }
    if (await page.locator('text=Une las parejas').count()) {
      const left = page.locator('.grid .stack.sm').first().locator('button.choice');
      const right = page.locator('.grid .stack.sm').nth(1).locator('button.choice');
      const n = await left.count();
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (await left.nth(i).isDisabled()) break;
          if (await right.nth(j).isDisabled()) continue;
          await left.nth(i).click();
          await right.nth(j).click();
          await page.waitForTimeout(120);
        }
      }
      await page.waitForTimeout(600);
      continue;
    }
    const choice = page.locator('button.choice:not([disabled])');
    if (await choice.count()) { await choice.first().click(); continue; }
    await page.waitForTimeout(200);
  }
  const done = await page.getByRole('button', { name: /Repetir/ }).count();
  const st = await store(page);
  check('Lesson can be completed end-to-end', done > 0 && !!st.lessons?.['saludos:0'], `xp=${st.xp}`);
  check('Lesson words added to the flashcard deck', Object.keys(st.srs ?? {}).length >= 5, `${Object.keys(st.srs ?? {}).length} cards`);
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/e2e-lesson-done.png` });
}

/* 4. Flashcard review */
{
  await go(page, '/review');
  await page.getByRole('button', { name: /Empezar repaso/ }).click();
  for (let i = 0; i < 12; i++) {
    if (!(await page.getByRole('button', { name: 'Mostrar respuesta' }).count())) break;
    await page.getByRole('button', { name: 'Mostrar respuesta' }).click();
    await page.waitForTimeout(150);
    await page.getByRole('button', { name: /Bien/ }).click();
    await page.waitForTimeout(120);
  }
  const st = await store(page);
  check('Spaced-repetition review grades cards', (st.stats?.reviews ?? 0) >= 5, `${st.stats?.reviews} reviews`);
}

/* 5. Verb drill */
{
  await go(page, '/verbs/hablar');
  await page.getByRole('button', { name: /Practicar/ }).click();
  await page.getByLabel('Conjugated form').fill('hablo');
  await page.getByRole('button', { name: 'Comprobar' }).click();
  await page.waitForSelector('.feedback', { timeout: 3000 });
  check('Verb drill gives feedback', true);
  await go(page, '/verbs/tener');
  const irr = await page.locator('.chip', { hasText: 'formas irregulares' }).count();
  check('Irregular verb forms are detected & highlighted', irr > 0);
}

/* 6. Games */
{
  await go(page, '/games/loteria');
  await page.getByRole('button', { name: /Empezar/ }).click();
  await page.waitForSelector('text=Carta 1 de', { timeout: 4000 });
  check('Lotería caller draws cards', true);
  await page.getByRole('button', { name: /Pausa/ }).click();
  await go(page, '/games/memorama');
  const cards = page.locator('.flash[role=button]');
  await cards.nth(0).click();
  await cards.nth(1).click();
  await page.waitForTimeout(300);
  check('Memorama counts moves', (await page.locator('.chip', { hasText: 'Movimientos: 1' }).count()) > 0);
  await go(page, '/games/relampago');
  await page.getByRole('button', { name: /Arrancar/ }).click();
  await page.locator('button.choice').first().click();
  await page.waitForTimeout(250);
  const total = await page.evaluate(() => document.querySelector('.card.hero')?.textContent ?? '');
  check('Conjugation sprint runs', total.includes('+'));
  await go(page, '/games/numeros');
  await page.getByLabel('Your answer').fill('42');
  await page.getByRole('button', { name: 'Comprobar' }).click();
  await page.waitForSelector('.feedback', { timeout: 3000 });
  check('Number listening game checks answers', true);
}

/* 7. Command palette */
{
  await go(page, '/');
  await page.keyboard.press('Control+k');
  await page.getByRole('textbox', { name: 'Search' }).fill('tacos al pastor');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  check('Command palette → translate', page.url().includes('translate?q=tacos'));
}

/* 8. Settings: immersion + accent */
{
  await go(page, '/settings');
  await page.getByLabel('Immersion mode').check({ force: true });
  await page.waitForTimeout(200);
  const hidden = await page.evaluate(() => {
    const el = document.querySelector('.bi-en');
    return el ? getComputedStyle(el).display === 'none' : false;
  });
  check('Immersion mode hides English helper labels', hidden);
  await page.getByLabel('Immersion mode').uncheck({ force: true });
  await page.getByRole('button', { name: 'Jade' }).click();
  const acc = await page.evaluate(() => document.documentElement.dataset.accent);
  check('Accent theme switches', acc === 'jade');
}

/* 9. AI tutor with a mocked Claude streaming API */
{
  let captured = null;
  await ctx.route('https://api.anthropic.com/**', async (r) => {
    const req = r.request();
    const body = JSON.parse(req.postData() ?? '{}');
    captured = { headers: req.headers(), body };
    if (body.stream) {
      const ev = (type, data) => `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`;
      const text = '¡Hola, Trip! ¿Qué vas a comer hoy?\n§EN§ Hi, Trip! What are you going to eat today?\n§FIX§ ¡Perfecto! Tip: di “¿Qué onda?” con amigos.';
      const sse =
        ev('message_start', { message: { id: 'msg_1', type: 'message', role: 'assistant', model: body.model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 1 } } }) +
        ev('content_block_start', { index: 0, content_block: { type: 'text', text: '' } }) +
        ev('content_block_delta', { index: 0, delta: { type: 'text_delta', text: text.slice(0, 20) } }) +
        ev('content_block_delta', { index: 0, delta: { type: 'text_delta', text: text.slice(20) } }) +
        ev('content_block_stop', { index: 0 }) +
        ev('message_delta', { delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 30 } }) +
        ev('message_stop', {});
      return r.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*' }, body: sse });
    }
    const payload = { translation: '¿Qué onda, güey?', alternatives: ['¿Qué tal, amigo?'], literal: 'What wave, dude?', notes: 'Very casual Mexican greeting.', formality: 'informal' };
    return r.fulfill(json({ id: 'msg_2', type: 'message', role: 'assistant', model: body.model, content: [{ type: 'text', text: JSON.stringify(payload) }], stop_reason: 'end_turn', stop_sequence: null, usage: { input_tokens: 5, output_tokens: 5 } }));
  });
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('spenish-v1'));
    raw.state.settings = { ...(raw.state.settings ?? {}), aiKey: 'sk-ant-test-key', autoSpeak: false };
    localStorage.setItem('spenish-v1', JSON.stringify(raw));
  });
  await page.reload();
  await go(page, '/tutor');
  await page.getByLabel('Message').fill('Hola Profe, quiero practicar.');
  await page.keyboard.press('Enter');
  await page.waitForSelector('text=¿Qué vas a comer hoy?', { timeout: 10000 });
  await page.waitForSelector('.fix', { timeout: 5000 });
  check('AI tutor streams a reply with corrections', true);
  check('Uses claude-opus-5-5 with low effort', captured?.body?.model === 'claude-opus-5-5' && captured?.body?.output_config?.effort === 'low');
  check('Server-side refusal fallback enabled', captured?.body?.fallbacks === 'default' && String(captured?.headers?.['anthropic-beta'] ?? '').includes('server-side-fallback-2026-07-01'));
  // AI translation (structured JSON output)
  await go(page, '/translate');
  await page.getByRole('radio', { name: /IA/ }).click();
  await page.getByLabel('Text to translate').fill("What's up, dude?");
  await page.keyboard.press('Enter');
  await page.waitForSelector('text=Nota de Profe Lupita', { timeout: 10000 });
  check('AI translation shows nuance notes & alternatives', (await page.locator('text=¿Qué tal, amigo?').count()) > 0);
  check('AI translation requests JSON schema output', captured?.body?.output_config?.format?.type === 'json_schema');
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/e2e-ai-translate.png` });
}
await ctx.close();

/* 10. Mobile layout: no horizontal overflow */
{
  const { ctx: m, page: p } = await setup(browser, { device: devices['iPhone 13'] });
  const overflow = [];
  for (const r of ['/', '/translate', '/learn', '/games/loteria', '/verbs/ser', '/conversation', '/tools', '/progress', '/lesson/comida/0']) {
    await go(p, r);
    const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (o > 1) overflow.push(`${r} (+${o}px)`);
    if (SHOTS) await p.screenshot({ path: `${SHOTS}/m${r.replace(/[^a-z0-9]+/gi, '_')}.png` });
  }
  check('Mobile: no horizontal scroll on key screens', overflow.length === 0, overflow.join(', '));
  await m.close();
}

await browser.close();
console.log(results.join('\n'));
if (errors.length) {
  console.log('\nConsole/page errors:\n' + errors.join('\n'));
  process.exitCode = 1;
}
