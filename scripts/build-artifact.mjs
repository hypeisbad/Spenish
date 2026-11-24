// Builds the claude.ai Artifact preview: one self-contained HTML page (JS, CSS and fonts inlined),
// without <html>/<head>/<body> wrappers (the Artifact viewer adds its own skeleton).
//   node scripts/build-artifact.mjs [outFile]
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2] ?? 'dist-artifact/spenish.html';
execSync('npx vite build --mode artifact', { stdio: 'inherit' });

const dir = 'dist-artifact';
const html = readFileSync(join(dir, 'index.html'), 'utf8');
const css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/g)].map((m) => readFileSync(join(dir, m[1]), 'utf8'));
const js = [...html.matchAll(/<script type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"[^>]*><\/script>/g)].map((m) => readFileSync(join(dir, m[1]), 'utf8'));
if (css.length !== 1 || js.length !== 1) throw new Error(`expected one css and one js bundle, got ${css.length}/${js.length}`);

const bootStyle = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '';
// Escape a literal U+FFFD (it only appears inside string literals) and any closing script tag.
const safeJs = js[0].replace(/\uFFFD/g, '\\uFFFD').replace(/<\/script/gi, '<\\/script');
const safeCss = css[0].replace(/<\/style/gi, '<\\/style');

const page = `<title>Spenish</title>
<meta name="theme-color" content="#07070d">
<meta name="description" content="All-in-one Mexican Spanish translator and learning app.">
<style>${bootStyle}</style>
<style>${safeCss}</style>
<div id="root"><div class="boot"><div><span>🌮</span>Cargando…</div></div></div>
<script type="module">${safeJs}</script>
`;
writeFileSync(out, page);
console.log(`wrote ${out} (${(page.length / 1024 / 1024).toFixed(2)} MB)`);
