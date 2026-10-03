// Sid, 2026-10-03 (decision 32, "Measures table"; Mark: "do we have a table of measures? with all folds open, and at the iPad portrait and landscape widths, what is screen height?").
//   node measures-table.mjs   -> ladder-measures.json ; measures-table.py then writes ladder-measures.csv, measures-table.html and the README section from it.
// ONE recipe per block, identical rules inside a block, every fold open (all `aria-expanded="false"` buttons in the page, repeatedly), coarse pointer, WebKit and
// system Chrome, the built app (dist of 2026-10-03) through the 03.5 harness's throwaway 127.0.0.1 servers (never :4173 or :8011; no Vite). The candidates are the app's own
// rules moved in-page (ladder-measure.mjs, nav-candidates.css); the ingredient table is the D3 grid with As made as the first column from 724 up (Mark's standing preference).
//   Block A: Mexican Chocolate v3 (a parent, a batch in view, constructed As made figures, Show changes ON); short Instructions (1 step), empty Before you start.
//   Block B: Olive Oil v1 (its batch's real As made figures; no parent, so no Show changes); long Instructions (10 steps), 2 notes, 4 step heads.
// The viewport height is an ESTIMATE of Safari's visible area, not measured on Mark's device: the screen height less 70px (the status bar and Safari's compact tab and address bar).
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const rd = (f) => readFile(path.join(HERE, f), 'utf8');
const sec = (css, name) => { const r = css.match(new RegExp('/\\* === ' + name + ' ===[^*]*\\*/([\\s\\S]*?)(?=/\\* === |$)')); if (!r) throw new Error('no ' + name); return r[1]; };
const opt = await rd('ingredient-options.css'), nav = await rd('nav-candidates.css');
const D3 = sec(opt, 'D') + sec(opt, 'D2') + sec(opt, 'D3');
const appcss = await rd('../../app/src/styles/app.css'), shellcss = await rd('../../app/src/styles/shell.css');
const block = (css, cond) => { const i = css.indexOf('@media ' + cond + ' {'); if (i < 0) throw new Error('no block ' + cond); let k = css.indexOf('{', i), d = 1, m = k + 1; while (d) { d += (css[m] === '{') - (css[m] === '}'); m++; } return css.slice(k + 1, m - 1); };
const SHEET_ONE_COL = block(appcss, '(max-width: 983.98px)');
const TAB_ROW = block(shellcss, '(max-width: 983.98px)');
const TAB_KEEP_TOOLS = TAB_ROW.replace(/\.shell__tools > \.shell__place \{\s*display: none;\s*\}/, '');
if (TAB_KEEP_TOOLS === TAB_ROW) throw new Error('tools rule not found');
const KEBAB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg>';
const addNavDom = ({ kind, kebab }) => {
  if (kind === 'f') { const rail = document.querySelector('.shell__rail'); const b = document.createElement('button'); b.type = 'button'; b.className = 'shell__rail-toggle'; b.setAttribute('aria-label', 'Show place names'); b.setAttribute('aria-expanded', 'false'); b.tabIndex = 0; b.innerHTML = kebab; rail.prepend(b); }
  else { const head = document.querySelector('.shell__head'); const lead = document.createElement('div'); lead.className = 'shell__lead'; const b = document.createElement('button'); b.type = 'button'; b.className = 'shell__menu'; b.setAttribute('aria-label', 'Places'); b.setAttribute('aria-expanded', 'false'); b.tabIndex = 0; b.innerHTML = kebab; const brand = head.firstElementChild; head.prepend(lead); lead.append(b, brand); }
};
const MEX3 = '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01';
const OLIVE1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89';
const AS = { 'Whole Milk 3.3%': 503, 'Cocoa Powder': 16.4, 'Sucrose': 46, 'Dextrose': 45, 'Fructose': 4.5, 'Dried Skimmed Milk Powder': 34.8, 'Salt': null, 'Cream, heavy': 77, 'Vanilla Extract': null, 'Stabilizer Mix 4421': 2, 'Cinnamon': 2.3, 'Allulose': 37 };
const construct = (m) => { let sum = 0; for (const tr of document.querySelectorAll('.ingredient-table tbody > tr')) { const nc = tr.querySelector('.ingredient-table__col-name'); const num = tr.querySelectorAll('.ingredient-table__col-numeric'); if (!nc || num.length < 2) continue; const name = [...nc.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim(); if (m[name] === null) continue; num[0].innerHTML = `<span class="sheet-hand">${m[name]} g</span>`; sum += m[name]; } const f = document.querySelectorAll('.ingredient-table tfoot .ingredient-table__col-numeric')[0]; if (f) f.innerHTML = `<span class="sheet-hand">${Math.round(sum * 10) / 10} g</span>`; };
const BLOCKS = [{ id: 'A', recipe: 'Mexican Chocolate v3', route: MEX3, changes: true, construct: true, label: 'short Instructions (1 step), empty Before you start; a parent, Show changes on, constructed As made figures' },
                { id: 'B', recipe: 'Olive Oil v1', route: OLIVE1, changes: false, construct: false, label: 'long Instructions (10 steps), 2 notes, 4 step heads; its batch\'s real As made figures; no parent, so no Show changes' }];
// [label, width, height (the screen, in points)]
const WINDOWS = [['iPad mini portrait', 744, 1133], ['11in iPad Pro portrait', 834, 1194], ['12.9in iPad Pro portrait', 1024, 1366], ['iPad mini landscape', 1133, 744], ['11in iPad Pro landscape', 1194, 834], ['12.9in iPad Pro landscape', 1366, 1024]];
const CHROME_UI = 70;
const JUMP = nav.match(/\/\* === JUMP ===[^*]*\*\/([\s\S]*?)(?=\/\* === |$)/)[1];
const HDR = nav.match(/\/\* === HDR ===[^*]*\*\/([\s\S]*?)(?=\/\* === |$)/)[1].replace('html{scroll-padding-top:57px}', ''); const HDR724 = nav.match(/\/\* === HDR724 ===[^*]*\*\/([\s\S]*?)(?=\/\* === |$)/)[1];
const ONLY = process.env.CAND_ONLY || '';   // re-measure just this candidate and merge it into the existing JSON
const CANDS = ['today', 'L', 'f collapsed', 'f expanded', 'g closed', 'final'];   // 'final724' (the sticky bar and the fly-out from 724 to 983) runs on the windows below 984 only
function spec(cand, W) {
  let css = '', dom = null, vw = W, note = '';
  if (cand === 'final') {      // decision 33: g closed (the fly-out from 984; the tab row below), the Go to batch row from 724 to 1365, D3 from 724
    css = (W >= 984 ? nav.match(/\/\* === G ===[^*]*\*\/([\s\S]*?)(?=\/\* === |$)/)[1] + HDR : '') + (W <= 1365 ? JUMP : '');
    return { css, dom: W >= 984 ? 'g' : null, vw, note: '' };
  }
  if (cand === 'final724') {   // option: the sticky bar and the fly-out in place of the tab row, 724 to 983
    css = nav.match(/\/\* === G ===[^*]*\*\/([\s\S]*?)(?=\/\* === |$)/)[1] + HDR + HDR724 + JUMP;
    return { css, dom: 'g', vw, note: 'option: the bar and the fly-out instead of the tab row' };
  }
  if (W < 984) return { css, dom, vw, same: true };       // below 984 every candidate is the bottom tab row as built
  if (cand === 'L' && W < 1590) css = TAB_KEEP_TOOLS;
  if (cand === 'f collapsed') { css = nav.match(/\/\* === F ===[^*]*\*\/([\s\S]*?)(?=\/\* === |$)/)[1]; dom = 'f'; }
  if (cand === 'f expanded') { css = nav.match(/\/\* === FX ===[^*]*\*\/([\s\S]*?)(?=\/\* === |$)/)[1]; dom = 'f'; if (W < 1208) css += SHEET_ONE_COL; if (W === 1366) { vw = 1365; note = 'measured at 1365 (the log below), 1px narrower'; } }
  if (cand === 'g closed') { css = nav.match(/\/\* === G ===[^*]*\*\/([\s\S]*?)(?=\/\* === |$)/)[1]; dom = 'g'; }
  return { css, dom, vw, note };
}
async function openFolds(page) { for (let k = 0; k < 4; k++) { const n = await page.evaluate(() => { const bs = [...document.querySelectorAll('main button[aria-expanded="false"], .shell__main button[aria-expanded="false"]')]; bs.forEach((b) => b.click()); return bs.length; }); if (!n) break; await page.waitForTimeout(120); } }
async function read() {
  await document.fonts.ready;
  const abs = (el) => (el ? Math.round(el.getBoundingClientRect().top + scrollY) : null);
  const w = (el) => (el && getComputedStyle(el).display !== 'none' ? Math.round(el.getBoundingClientRect().width * 10) / 10 : 0);
  const heading = (txt) => [...document.querySelectorAll('h2')].find((h) => h.textContent.replace(/Hide|Show/g, '').trim() === txt);
  const table = document.querySelector('.ingredient-table'); const region = document.querySelector('.ingredient-table-region'); const side = document.querySelector('.side-region'); const log = document.querySelector('.notebook-log'); const sheet = document.querySelector('.recipe-page');
  const lines = (cell) => { const tn = [...cell.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim()); if (!tn) return 0; const r = document.createRange(); r.selectNodeContents(tn); const tops = []; for (const q of r.getClientRects()) if (!tops.some((x) => Math.abs(x - q.top) < 3)) tops.push(q.top); return tops.length; };
  const names = [...table.querySelectorAll('tbody td.ingredient-table__col-name')]; const ls = names.map(lines);
  const rail = document.querySelector('.shell__rail'); const railW = w(rail); const tabs = getComputedStyle(document.querySelector('.shell__tabs')).display !== 'none';
  const method = document.querySelector('.method-region'); const tf = table.querySelector('tfoot tr');
  const R = region.getBoundingClientRect(), S = side.getBoundingClientRect(), Sh = sheet.getBoundingClientRect(), L = log.getBoundingClientRect();
  const twoCol = S.left >= R.right - 1;
  return {
    nav: tabs ? 'tab row' : (railW ? `rail ${Math.round(railW)}` : 'no rail'), sheetW: Math.round(Sh.width * 10) / 10, tableW: Math.round(R.width * 10) / 10, balanceW: Math.round(S.width * 10) / 10, sheetCols: twoCol ? 'two columns' : 'one column',
    balance: twoCol ? 'beside' : 'below', logPos: L.left >= Sh.right - 5 ? 'beside' : 'below', logW: Math.round(L.width),
    nameMin: Math.round(Math.min(...names.map((n) => n.getBoundingClientRect().width)) * 10) / 10, maxRows: Math.max(...ls), wrapped: names.map((n, i) => [[...n.childNodes].filter((c) => c.nodeType === 3).map((c) => c.textContent).join('').trim(), ls[i]]).filter((x) => x[1] > 1),
    docH: document.documentElement.scrollHeight, yIng: abs(heading('Ingredients')), yTableBottom: Math.round(table.getBoundingClientRect().bottom + scrollY), yTotal: abs(tf), yBal: abs(heading('Balance')), yLog: abs(log), yInstr: abs(heading('Instructions')),
    methodH: method ? Math.round(method.getBoundingClientRect().height) : 0, overflow: document.documentElement.scrollWidth - innerWidth,
  };
}
async function measure(browser, servers, blk, win, cand) {
  const [label, W, H] = win; const sp = spec(cand, W); const vis = H - CHROME_UI;
  const ctx = await browser.newContext({ viewport: { width: sp.vw, height: vis }, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await ctx.newPage();
  const setup = async () => {
    await page.goto(servers.appUrl + blk.route, { waitUntil: 'networkidle' }); await page.waitForSelector('.ingredient-table');
    if (blk.changes) { await page.getByRole('button', { name: 'Show changes' }).first().click(); await page.getByRole('button', { name: 'Hide changes' }).first().waitFor(); }
    if (blk.construct) await page.evaluate(construct, AS);
    if (sp.dom) await page.evaluate(addNavDom, { kind: sp.dom, kebab: KEBAB });
    await page.addStyleTag({ content: sp.css + (W >= 724 ? D3 : '') });
  };
  await setup(); await openFolds(page); await page.waitForTimeout(100);
  const m = await page.evaluate(read);
  // the record pen: Record another, then Add tasting, on a fresh load (the state above stays pure); folds opened as above
  await setup(); await openFolds(page);
  await page.getByRole('button', { name: /^Record another$/ }).first().click(); await page.waitForTimeout(250);
  const pen = await page.evaluate(() => { const log = document.querySelector('.notebook-log'); const p = log.querySelector('.batch-margin--pen'); return { penH: p ? Math.round(p.getBoundingClientRect().height) : null, logH: Math.round(log.getBoundingClientRect().height) }; });
  let pen2 = { penH: null, logH: null };
  const t = page.getByRole('button', { name: /Add tasting/ }).first();
  if (await t.count()) { await t.click(); await page.waitForTimeout(250); pen2 = await page.evaluate(() => { const log = document.querySelector('.notebook-log'); const p = log.querySelector('.batch-margin--pen'); return { penH: p ? Math.round(p.getBoundingClientRect().height) : null, logH: Math.round(log.getBoundingClientRect().height) }; }); }
  await ctx.close();
  return { ...m, vis, screenH: H, note: sp.note || '', same: !!sp.same, penH: pen.penH, penLogH: pen.logH, penTastingH: pen2.penH, penTastingLogH: pen2.logH };
}
const servers = await startServers(); const out = [];
for (const [engine, mk] of [['webkit', () => webkit.launch()], ['chrome', () => launch()]]) {
  const browser = await mk();
  for (const blk of BLOCKS) for (const win of WINDOWS) for (const cand of (ONLY ? (ONLY === 'final724' && win[1] >= 984 ? [] : [ONLY]) : (win[1] < 984 ? ['today', 'final'] : CANDS))) {
    try { out.push({ engine, block: blk.id, recipe: blk.recipe, window: win[0], W: win[1], H: win[2], cand, ...(await measure(browser, servers, blk, win, cand)) }); }
    catch (e) { out.push({ engine, block: blk.id, window: win[0], W: win[1], H: win[2], cand, error: String(e).slice(0, 200) }); }
  }
  await browser.close();
}
await servers.close();
let rows = out;
if (ONLY) { const prev = JSON.parse(await readFile(path.join(HERE, 'ladder-measures.json'), 'utf8')); rows = prev.rows.filter((r) => r.cand !== ONLY).concat(out); }
await writeFile(path.join(HERE, 'ladder-measures.json'), JSON.stringify({ blocks: BLOCKS, windows: WINDOWS, chromeUi: CHROME_UI, rows }));
console.log('ok', out.length, 'errors', out.filter((r) => r.error).length);
