// Sid, 2026-10-03 (decision 31, option D): measures C, D1 and D2 against today across every state the ingredient table has:
// reading, Show changes, As made, both, the pen (Next version open, untouched and with amounts changed) and the recording pen.
//   node ingredientopts-d-measure.mjs   -> ingredientopts-d-measure.json
// The forms are CSS injected into the real DOM of the built app (no app edit), WebKit and system Chrome, coarse pointer (the table is
// the same on a fine one), through the 03.5 harness's throwaway 127.0.0.1 servers. Besides the wraps and heights it records where the
// plan figure, the struck figure and the As made figure sit, relative to the table, so "the same place in every state" is a number.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const opt = await readFile(path.join(HERE, 'ingredient-options.css'), 'utf8');
const sec = (name) => { const m = opt.match(new RegExp('/\\* === ' + name + ' ===[^*]*\\*/([\\s\\S]*?)(?=/\\* === |$)')); if (!m) throw new Error('no section ' + name); return m[1]; };
const FORMS = { today: '', C: sec('C'), D1: sec('D') + sec('D1'), D1b: sec('D') + sec('D1') + sec('D1b'), D2: sec('D') + sec('D2') };

const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);   // re-measure just these forms and merge them into the existing JSON
const MEX3 = '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01';
const MEX4 = '/notebook/mexican-chocolate/mexican-chocolate-v4';
const OLIVE1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89';
const AS = { 'Whole Milk 3.3%': 503, 'Cocoa Powder': 16.4, 'Sucrose': 46, 'Dextrose': 45, 'Fructose': 4.5, 'Dried Skimmed Milk Powder': 34.8, 'Salt': null, 'Cream, heavy': 77, 'Vanilla Extract': null, 'Stabilizer Mix 4421': 2, 'Cinnamon': 2.3, 'Allulose': 37 };
const construct = (m) => {
  let sum = 0;
  for (const tr of document.querySelectorAll('.ingredient-table tbody > tr')) {
    const nc = tr.querySelector('.ingredient-table__col-name'); const num = tr.querySelectorAll('.ingredient-table__col-numeric');
    if (!nc || num.length < 2) continue;
    const name = [...nc.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
    if (m[name] === null) continue; num[0].innerHTML = `<span class="sheet-hand">${m[name]} g</span>`; sum += m[name];
  }
  const f = document.querySelectorAll('.ingredient-table tfoot .ingredient-table__col-numeric')[0];
  if (f) f.innerHTML = `<span class="sheet-hand">${Math.round(sum * 10) / 10} g</span>`;
};
const hasAsMade = () => [...document.querySelectorAll('.ingredient-table thead th')].some((h) => /as made/i.test(h.textContent));
const showChanges = async (p) => { await p.getByRole('button', { name: 'Show changes' }).first().click(); await p.getByRole('button', { name: 'Hide changes' }).first().waitFor(); };
// type new grams into three rows of the open pen, so the pen draws changed rows (struck parent before the field)
const editPen = async (p) => {
  for (const [label, v] of [['Whole Milk 3.3%', '540'], ['Sucrose', '44'], ['Cocoa Powder', '18']]) {
    const f = p.getByLabel(label + ', grams', { exact: true }); await f.fill(v);
  }
};
const STATES = [
  { id: 'reading (no batch)', route: MEX4 },
  { id: 'Show changes (no batch)', route: MEX4, prep: showChanges },
  { id: 'As made', route: MEX3, construct: true },
  { id: 'As made + Show changes', route: MEX3, prep: showChanges, construct: true },
  { id: 'pen, untouched', route: MEX3, prep: async (p) => { await p.getByRole('button', { name: 'Next version' }).first().click(); await p.getByLabel('Salt, grams', { exact: true }).waitFor(); } },
  { id: 'pen, amounts changed', route: MEX3, prep: async (p) => { await p.getByRole('button', { name: 'Next version' }).first().click(); await p.getByLabel('Salt, grams', { exact: true }).waitFor(); await editPen(p); } },
  { id: 'As made (Olive Oil v1, real figures)', route: OLIVE1 },
  { id: 'recording (Olive Oil v1)', route: OLIVE1, prep: async (p) => { await p.getByRole('button', { name: /^Record (another|a batch)$/ }).first().click(); await p.waitForSelector('.ingredient-table__as-made-field'); const f = p.locator('.ingredient-table__as-made-field'); for (const [i, v] of [[0, '118'], [1, '12'], [3, '0.5'], [5, '248']]) await f.nth(i).fill(v); } },
];
async function read() {
  await document.fonts.ready;
  const table = document.querySelector('.ingredient-table'); const T = table.getBoundingClientRect();
  const rel = (r) => (r ? { x: Math.round((r.left - T.left) * 10) / 10, y: Math.round((r.top - T.top) * 10) / 10, r: Math.round((r.right - T.left) * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 } : null);
  const lines = (cell) => { const tn = [...cell.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim()); if (!tn) return 0; const r = document.createRange(); r.selectNodeContents(tn); const tops = []; for (const q of r.getClientRects()) if (!tops.some((x) => Math.abs(x - q.top) < 3)) tops.push(q.top); return tops.length; };
  const names = [...table.querySelectorAll('tbody td.ingredient-table__col-name')]; const ls = names.map(lines);
  // the first row with a struck figure in the amount (Whole Milk when changes are on), else Whole Milk
  const rows = [...table.querySelectorAll('tbody > tr:not(.ingredient-table__step-head)')];
  const row = rows.find((tr) => /Whole Milk|Whole milk/.test(tr.textContent)) || rows[0];
  const am = row.querySelector('.ingredient-table__col-grams');
  // the plan figure is the last text node of the amount's span (" g" after the pen's field, "500 g" in the reading view): its right edge is where the amount ends
  const lastText = (el) => { const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let last = null; while (w.nextNode()) if (w.currentNode.textContent.trim()) last = w.currentNode; const r = document.createRange(); r.selectNodeContents(last); return r; };
  const planEl = lastText(am.querySelector('.ingredient-table__plan-grams'));
  const struck = am.querySelector('.struck-value');
  const asm = row.querySelector('.ingredient-table__as-made-field') || row.querySelector('.ingredient-table__col-numeric .sheet-hand');
  const nameCell = row.querySelector('.ingredient-table__col-name');
  return {
    region: Math.round(table.closest('.ingredient-table-region').getBoundingClientRect().width * 10) / 10,
    nameMin: Math.round(Math.min(...names.map((n) => n.getBoundingClientRect().width)) * 10) / 10,
    maxRows: Math.max(...ls), wrapped: names.map((n, i) => [[...n.childNodes].filter((c) => c.nodeType === 3).map((c) => c.textContent).join('').trim(), ls[i]]).filter((x) => x[1] > 1),
    tableH: Math.round(T.height), sheetH: Math.round(document.querySelector('.recipe-page').getBoundingClientRect().height),
    overflow: document.documentElement.scrollWidth - innerWidth,
    pos: { plan: rel(planEl.getBoundingClientRect()), field: rel(am.querySelector('input') && am.querySelector('input').getBoundingClientRect()), struck: rel(struck && struck.getBoundingClientRect()), asMade: rel(asm && asm.getBoundingClientRect()), nameX: rel(nameCell.getBoundingClientRect()).x },
  };
}
const servers = await startServers();
const out = [];
for (const [engine, mk] of [['webkit', () => webkit.launch()], ['chrome', () => launch()]]) {
  const browser = await mk();
  for (const width of [984, 1024, 1204, 1366]) for (const st of STATES) for (const [form, css] of Object.entries(FORMS)) {
    if (ONLY.length && !ONLY.includes(form)) continue;
    const ctx = await browser.newContext({ viewport: { width, height: 1100 }, hasTouch: true, deviceScaleFactor: 1 });
    await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
    const page = await ctx.newPage();
    try {
      await page.goto(servers.appUrl + st.route, { waitUntil: 'networkidle' }); await page.waitForSelector('.ingredient-table');
      if (st.prep) await st.prep(page);
      if (st.construct && await page.evaluate(hasAsMade)) await page.evaluate(construct, AS);
      if (css) await page.addStyleTag({ content: css });
      await page.waitForTimeout(80);
      out.push({ engine, width, state: st.id, form, ...(await page.evaluate(read)) });
    } catch (e) { out.push({ engine, width, state: st.id, form, error: String(e).slice(0, 200) }); }
    await ctx.close();
  }
  await browser.close();
}
await servers.close();
let keep = [];
if (ONLY.length) keep = JSON.parse(await readFile(path.join(HERE, 'ingredientopts-d-measure.json'), 'utf8')).filter((r) => !ONLY.includes(r.form));
await writeFile(path.join(HERE, 'ingredientopts-d-measure.json'), JSON.stringify(keep.concat(out)));
console.log('ok', out.length, 'errors', out.filter((r) => r.error).length);
