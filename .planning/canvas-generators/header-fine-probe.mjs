// Sid, 2026-10-03: the sticky header at 1590 and up is a mouse window in practice; its height there (no menu button) with a fine pointer, as built and with the HDR rules. node header-fine-probe.mjs
import { fileURLToPath } from 'node:url'; import path from 'node:path'; import { readFileSync } from 'node:fs';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const nav = readFileSync(HERE + '/nav-candidates.css', 'utf8'); const HDR = nav.match(/\/\* === HDR ===[^*]*\*\/([\s\S]*?)(?=\/\* === |$)/)[1];
const OLIVE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89';
const s = await startServers();
for (const [eng, br] of [['webkit', await webkit.launch()], ['chrome', await chromium.launch({ channel: 'chrome' })]]) for (const [W, touch] of [[1600, false], [1600, true], [1920, false]]) {
  const ctx = await br.newContext({ viewport: { width: W, height: 900 }, hasTouch: touch }); const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  await p.goto(s.appUrl + OLIVE, { waitUntil: 'networkidle' });
  const a = await p.evaluate(() => Math.round(document.querySelector('.shell__head').getBoundingClientRect().height * 10) / 10);
  await p.addStyleTag({ content: HDR });
  const b = await p.evaluate(() => { const h = document.querySelector('.shell__head'); const t = [...h.querySelectorAll('a,button')].map((e) => Math.round(e.getBoundingClientRect().height)); return { h: Math.round(h.getBoundingClientRect().height * 10) / 10, controls: t }; });
  console.log(eng, W, touch ? 'coarse' : 'fine', 'as built', a, 'with HDR', JSON.stringify(b));
  await ctx.close();
}
await s.close(); process.exit(0);
