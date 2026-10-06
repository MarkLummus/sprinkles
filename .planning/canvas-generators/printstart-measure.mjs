// Sid, 2026-10-06: measures the two starting-point boards in a real browser against the live built page, side by side (D-00: conformance is the board and the built app measured, never prose).
//   node printstart-measure.mjs <dir with AsBuiltRecipePage.dc.html and PrintStartingPoint.dc.html> [out json = printstart-measure.json]
// Each board is opened from a local copy with support.js dropped (the stylesheet is already inline) and the font pointed at app/public/fonts. The live page is app/dist on a throwaway 127.0.0.1 port.
//   A  the board at 1280 against the live page at 1280 (screen)                                             WebKit and Chromium
//   B  the board against the live page at 880 wide (article 816 wide, as the board's) with print media emulated and Balance and Watch for opened as the desktop window has them (the clicks stand in for the fold state a desktop window prints from)
// boardH (what printstart.py writes as the flow board's height) = the taller of the board's scrollHeight in WebKit and Chromium, rounded up to 10, plus 10.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(process.argv[2]); const OUT = process.argv[3] || path.join(HERE, 'printstart-measure.json');
const FONT = path.join(HERE, '..', '..', 'app', 'public', 'fonts', 'caveat-regular.woff2');
const ROUTE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const servers = await startServers();
const engines = { webkit: await webkit.launch(), chromium: await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }) };
const local = async (name) => { const h = (await readFile(path.join(DIR, name), 'utf8')).replace('<script src="./support.js"></script>', '').replaceAll('/_blob/37ac467ba5558024f5fb5a2e5c22a7bc', 'file://' + FONT); const p = path.join(DIR, '_local-' + name); await writeFile(p, h); return 'file://' + p; };

const sheetFacts = () => {
  const a = document.querySelector('article.recipe-page'); const A = a.getBoundingClientRect(); const T = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
  const rel = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left - A.left), Math.round(r.top - A.top), Math.round(r.width), Math.round(r.height)]; };
  const table = a.querySelector('.ingredient-table'); const before = a.querySelector('.before-region');
  return {
    article: [Math.round(A.width), Math.round(A.height)], sections: Object.fromEntries([...a.children].map((c) => [c.className.split(' ')[0], rel(c)])),
    headings: [...a.querySelectorAll('h1, h2')].map((h) => [T(h).replace(/(Hide|Show)$/, ''), rel(h)[1]]),
    beforeAboveTable: before.getBoundingClientRect().bottom <= table.getBoundingClientRect().top, beforeTextFirst: T(before).slice(0, 60),
    thead: !!table.querySelector('thead'), theadCells: [...table.querySelectorAll('thead th')].map(T), tbodies: table.querySelectorAll('tbody').length, tfoot: !!table.querySelector('tfoot'),
    rows: [...table.querySelectorAll('tbody tr')].map((r) => rel(r)[1]), steps: a.querySelectorAll('.method-step').length, hiddenAttr: document.querySelectorAll('[hidden]').length,
    handFace: (a.querySelector('.sheet-hand') ? getComputedStyle(a.querySelector('.sheet-hand')).fontStyle : null),
  };
};
const diff = (a, b) => {
  const d = [];
  for (const k of Object.keys(a.sections)) { const x = a.sections[k], y = b.sections[k]; if (!y || x.some((v, i) => Math.abs(v - y[i]) > 2)) d.push(`${k}: board ${x} live ${y}`); }
  if (a.rows.length !== b.rows.length || a.rows.some((v, i) => Math.abs(v - b.rows[i]) > 2)) d.push('ingredient rows differ');
  if (Math.abs(a.article[1] - b.article[1]) > 2) d.push(`article height: board ${a.article[1]} live ${b.article[1]}`);
  return d;
};
const result = {};
for (const [name, br] of Object.entries(engines)) {
  const mk = async (W, media) => { const ctx = await br.newContext({ viewport: { width: W, height: 1000 }, hasTouch: false, deviceScaleFactor: 1 }); await ctx.route('**/*', (r) => (['127.0.0.1', ''].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort())); const page = await ctx.newPage(); if (media) await page.emulateMedia({ media }); return { ctx, page }; };
  const live = async (W, media, open) => { const { ctx, page } = await mk(W, null); await page.goto(servers.appUrl + ROUTE, { waitUntil: 'networkidle' }); await page.waitForSelector('article.recipe-page .ingredient-table'); await page.evaluate(() => document.fonts.ready);
    if (open) { await page.setViewportSize({ width: W, height: 1000 }); for (const n of ['Balance', 'Watch for']) { const b = page.locator('article.recipe-page .side-region').getByRole('button', { name: new RegExp('^' + n) }).first(); if ((await b.getAttribute('aria-expanded')) === 'false') await b.click(); } }
    if (media) await page.emulateMedia({ media }); await page.waitForTimeout(300); const f = await page.evaluate(sheetFacts); const sh = await page.evaluate(() => ({ docH: document.documentElement.scrollHeight, shellH: Math.ceil(document.querySelector('.shell').getBoundingClientRect().height) })); await ctx.close(); return { f, sh }; };
  // A
  { const { ctx, page } = await mk(1280); await page.goto(await local('AsBuiltRecipePage.dc.html')); await page.waitForTimeout(500); await page.evaluate(() => document.fonts.ready);
    const f = await page.evaluate(sheetFacts); const sh = await page.evaluate(() => ({ docH: document.documentElement.scrollHeight, shellH: Math.ceil(document.querySelector('.shell').getBoundingClientRect().height), fonts: [...document.fonts].map((x) => x.family + ':' + x.status) }));
    const lv = await live(1280); result[name + '_A'] = { board: f, boardDoc: sh, live: lv.f, liveDoc: lv.sh, diff: diff(f, lv.f) }; await ctx.close(); }
  // B: the board against the live page at 880 (article 816), print media, the two folds open
  { const { ctx, page } = await mk(816, 'print'); await page.goto(await local('PrintStartingPoint.dc.html')); await page.waitForTimeout(500);
    const f = await page.evaluate(sheetFacts); const sh = await page.evaluate(() => ({ docH: document.documentElement.scrollHeight, bodyH: document.body.getBoundingClientRect().height }));
    const lv = await live(880, 'print', true); result[name + '_B'] = { board: f, boardDoc: sh, live: lv.f, diff: diff(f, lv.f) }; await ctx.close(); }
}
await engines.webkit.close(); await engines.chromium.close(); await servers.close();
result.boardH = Math.ceil(Math.max(result.chromium_B.boardDoc.docH, result.webkit_B.boardDoc.docH) / 10) * 10 + 10;
await writeFile(OUT, JSON.stringify(result, null, 1));
for (const k of Object.keys(result)) if (k !== 'boardH') console.log(k, 'diff:', JSON.stringify(result[k].diff), 'board article', result[k].board.article, 'live', result[k].live.article, 'doc', JSON.stringify(result[k].boardDoc));
console.log('boardH', result.boardH);
