// Sid, 2026-10-05 (decision 48): reads the ingredients table's head as the build draws it (two lines), with the one-line rule (A) and with the one-line rule and Ingredient over the names (B), for the option board's crops and captions.
//   node onehead-opts.mjs  -> onehead-opts.json  { variant_state: { region, tr, ths: [{text, box, ink}], nameInk, planInk, rows4 } }   (WebKit; Olive Oil v1 with its batch at 1366 coarse; Standard Base v2, no batch, at 1600 fine)
import { writeFile, readFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const sec = (name) => readFile(path.join(HERE, 'ingredient-options.css'), 'utf8').then((s) => s.match(new RegExp('/\\* === ' + name + ' ===[^*]*\\*/([\\s\\S]*?)(?=/\\* === |$)'))[1]);
const ONE = await sec('ONEHEAD'); const NAMES = await sec('ONEHEADB');
const V = { two: '', A: ONE, B: ONE + NAMES };
const PAGES = { batch: ['/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89', 1366, true], none: ['/notebook/standard-base/standard-base-v2', 1600, false] };
const br = await webkit.launch(); const out = {};
for (const [pk, [url, W, coarse]] of Object.entries(PAGES)) for (const [vk, css] of Object.entries(V)) {
  const ctx = await br.newContext({ viewport: { width: W, height: 1000 }, hasTouch: coarse, deviceScaleFactor: 1 }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:4173' + url, { waitUntil: 'networkidle' }); await p.waitForSelector('.ingredient-table'); await p.evaluate(() => document.fonts.ready);
  if (css) await p.addStyleTag({ content: '@media screen and (min-width:724px){' + css + '}' }); await p.waitForTimeout(100);
  out[`${vk}_${pk}`] = await p.evaluate(() => { const r = (e) => { const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(2), y: +b.y.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) }; };
    const ink = (el) => { const g = document.createRange(); g.selectNodeContents(el); const rs = [...g.getClientRects()]; return rs.length ? [+Math.min(...rs.map((q) => q.left)).toFixed(2), +Math.max(...rs.map((q) => q.right)).toFixed(2)] : null; };
    const t = document.querySelector('.ingredient-table'); const reg = t.closest('.ingredient-table-region'); const row = t.querySelector('tbody tr:not(.ingredient-table__step-head)'); const rows = [...t.querySelectorAll('tbody tr')].slice(0, 5); const last = rows[rows.length - 1];
    return { region: r(reg), table: r(t), tr: r(t.querySelector('thead tr')), ths: [...t.querySelectorAll('thead th')].map((h) => ({ text: h.textContent.trim(), box: r(h), ink: ink(h) })), planInk: ink(row.querySelector('.ingredient-table__col-grams')), nameInk: ink(row.querySelector('.ingredient-table__col-name')), headingInk: ink(reg.querySelector('h2')), cropBottom: +(last.getBoundingClientRect().bottom).toFixed(2) }; });
  await ctx.close();
}
await br.close(); await writeFile(path.join(HERE, 'onehead-opts.json'), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k, 'tr', v.tr.h, 'region', JSON.stringify(v.region), 'crop bottom', v.cropBottom, '|', v.ths.map((h) => `${h.text} ${h.ink}`).join(' | '), '| plan', v.planInk, 'name', v.nameInk, 'heading', v.headingInk);
