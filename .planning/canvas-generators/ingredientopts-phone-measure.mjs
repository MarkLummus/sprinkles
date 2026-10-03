// Sid, 2026-10-03 (decision 31, D3 on the phone): the built app below 724 with the struck figure moved to the third line
// (plan / As made / struck), in-page, no app edit. WebKit and system Chrome through the 03.5 harness's throwaway 127.0.0.1 servers.
//   node ingredientopts-phone-measure.mjs   -> ingredientopts-phone-measure.json
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const opt = await readFile(path.join(HERE, 'ingredient-options.css'), 'utf8');
const sec = (name) => { const r = opt.match(new RegExp('/\\* === ' + name + ' ===[^*]*\\*/([\\s\\S]*?)(?=/\\* === |$)')); if (!r) throw new Error('no section ' + name); return r[1]; };
const FORMS = { today: '', P3: sec('P3') };
const MEX3 = '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01';
const MEX4 = '/notebook/mexican-chocolate/mexican-chocolate-v4';
const AS = { 'Whole Milk 3.3%': 503, 'Cocoa Powder': 16.4, 'Sucrose': 46, 'Dextrose': 45, 'Fructose': 4.5, 'Dried Skimmed Milk Powder': 34.8, 'Salt': null, 'Cream, heavy': 77, 'Vanilla Extract': null, 'Stabilizer Mix 4421': 2, 'Cinnamon': 2.3, 'Allulose': 37 };
const construct = (m) => { let sum = 0; for (const tr of document.querySelectorAll('.ingredient-table tbody > tr')) { const nc = tr.querySelector('.ingredient-table__col-name'); const num = tr.querySelectorAll('.ingredient-table__col-numeric'); if (!nc || num.length < 2) continue; const name = [...nc.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim(); if (m[name] === null) continue; num[0].innerHTML = `<span class="sheet-hand">${m[name]} g</span>`; sum += m[name]; } const f = document.querySelectorAll('.ingredient-table tfoot .ingredient-table__col-numeric')[0]; if (f) f.innerHTML = `<span class="sheet-hand">${Math.round(sum * 10) / 10} g</span>`; };
const showChanges = async (p) => { await p.getByRole('button', { name: 'Show changes' }).first().click(); await p.getByRole('button', { name: 'Hide changes' }).first().waitFor(); };
const openPen = async (p) => { await p.getByRole('button', { name: 'Next version' }).first().click(); await p.getByLabel('Salt, grams', { exact: true }).waitFor(); };
const STATES = [
  { id: 'reading (no batch)', route: MEX4 },
  { id: 'Show changes (no batch)', route: MEX4, prep: showChanges },
  { id: 'As made', route: MEX3, construct: true },
  { id: 'As made + Show changes', route: MEX3, prep: showChanges, construct: true },
  { id: 'pen, untouched', route: MEX4, prep: openPen },
  { id: 'pen, amounts changed', route: MEX4, prep: async (p) => { await openPen(p); for (const [l, v] of [['Whole Milk 3.3%', '600'], ['Sucrose', '36'], ['Cocoa Powder', '45']]) await p.getByLabel(l + ', grams', { exact: true }).fill(v); } },
  { id: 'removed row', route: MEX4, prep: showChanges, removed: true },
];
async function read() {
  await document.fonts.ready;
  const table = document.querySelector('.ingredient-table'); const T = table.getBoundingClientRect();
  const rel = (r) => (r ? { x: Math.round((r.left - T.left) * 10) / 10, y: Math.round((r.top - T.top) * 10) / 10, r: Math.round((r.right - T.left) * 10) / 10, b: Math.round((r.bottom - T.top) * 10) / 10 } : null);
  const rows = [...table.querySelectorAll('tbody > tr:not(.ingredient-table__step-head)')];
  const row = rows.find((tr) => /Whole Milk/.test(tr.textContent)) || rows[0];
  const lastText = (el) => { const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let last = null; while (w.nextNode()) if (w.currentNode.textContent.trim()) last = w.currentNode; if (!last) return null; const r = document.createRange(); r.selectNodeContents(last); return r.getBoundingClientRect(); };
  const am = row.querySelector('.ingredient-table__col-grams');
  const planRect = (() => { const sp = am.querySelector('.ingredient-table__plan-grams'); const tns = []; const w = document.createTreeWalker(sp, NodeFilter.SHOW_TEXT); while (w.nextNode()) if (w.currentNode.textContent.trim() && !w.currentNode.parentElement.closest('.struck-value')) tns.push(w.currentNode); const last = tns[tns.length - 1]; if (!last) return null; const r = document.createRange(); r.selectNodeContents(last); return r.getBoundingClientRect(); })();
  const struck = am.querySelector('.struck-value'); const asm = row.querySelector('.ingredient-table__col-numeric .sheet-hand');
  const share = row.querySelector('.ingredient-table__col-numeric:last-child'); const shareStruck = share.querySelector('.struck-value');
  const shareCur = (() => { const w = document.createTreeWalker(share, NodeFilter.SHOW_TEXT); const out = []; while (w.nextNode()) if (w.currentNode.textContent.trim() && !w.currentNode.parentElement.closest('.struck-value')) out.push(w.currentNode); const last = out[out.length - 1]; if (!last) return null; const r = document.createRange(); r.selectNodeContents(last); return r.getBoundingClientRect(); })();
  const names = [...table.querySelectorAll('tbody td.ingredient-table__col-name')];
  const tops = rows.map((tr) => Math.round((tr.getBoundingClientRect().top - T.top) * 10) / 10);
  const foot = table.querySelector('tfoot tr');
  const overlap = (a, b) => { const A = a.getBoundingClientRect(), B = b.getBoundingClientRect(); return !(A.right <= B.left + 0.5 || B.right <= A.left + 0.5 || A.bottom <= B.top + 0.5 || B.bottom <= A.top + 0.5); };
  let collisions = 0; for (const tr of rows) { const cells = [...tr.children].filter((c) => c.getBoundingClientRect().width > 0); for (let i = 0; i < cells.length; i++) for (let j = i + 1; j < cells.length; j++) if (overlap(cells[i], cells[j])) collisions++; }
  return {
    nameMin: Math.round(Math.min(...names.map((n) => n.getBoundingClientRect().width)) * 10) / 10,
    tableH: Math.round(T.height), footH: Math.round(foot.getBoundingClientRect().height * 10) / 10, overflow: document.documentElement.scrollWidth - innerWidth,
    pitch: tops.slice(1, 5).map((t, i) => Math.round((t - tops[i]) * 10) / 10), collisions,
    pos: { plan: rel(planRect), struck: rel(struck && struck.getBoundingClientRect()), asMade: rel(asm && asm.getBoundingClientRect()), shareStruck: rel(shareStruck && shareStruck.getBoundingClientRect()), shareCur: rel(shareCur), name: rel(row.querySelector('.ingredient-table__col-name').getBoundingClientRect()), field: rel(am.querySelector('input') && am.querySelector('input').getBoundingClientRect()) },
  };
}
const REMOVED = '<td class="ingredient-table__col-grams"><span class="ingredient-table__plan-grams"><span class="struck-value">1 g</span></span></td><td class="ingredient-table__col-name"><span class="struck-value">Salt</span><span class="target-chip ingredient-table__flag"><span class="target-chip__value">estimated</span></span></td><td class="ingredient-table__col-numeric"><span class="struck-value">0.1%</span></td>';
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const servers = await startServers();
const out = [];
const CASES = [[320, true], [375, true], [393, true], [428, true], [723, true], [723, false]];
for (const [engine, mk] of [['webkit', () => webkit.launch()], ['chrome', () => launch()]]) {
  const browser = await mk();
  for (const [width, coarse] of CASES) for (const st of STATES) for (const [form, css] of Object.entries(FORMS)) {
    if (ONLY.length && !ONLY.includes(form)) continue;
    const ctx = await browser.newContext({ viewport: { width, height: 1100 }, hasTouch: coarse, deviceScaleFactor: 1 });
    await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
    const page = await ctx.newPage();
    try {
      await page.goto(servers.appUrl + st.route, { waitUntil: 'networkidle' }); await page.waitForSelector('.ingredient-table');
      if (st.prep) await st.prep(page);
      if (st.construct && await page.evaluate(() => [...document.querySelectorAll('.ingredient-table thead th')].some((h) => /as made/i.test(h.textContent)) || !!document.querySelector('.ingredient-table .ingredient-table__col-numeric:nth-last-child(2)'))) await page.evaluate(construct, AS);
      if (st.removed) await page.evaluate((h) => { const tr = [...document.querySelectorAll('.ingredient-table tbody tr')].find((t) => t.textContent.includes('Salt')); tr.innerHTML = h; }, REMOVED);
      if (css) await page.addStyleTag({ content: css });
      await page.waitForTimeout(80);
      out.push({ engine, width, coarse, state: st.id, form, ...(await page.evaluate(read)) });
    } catch (e) { out.push({ engine, width, coarse, state: st.id, form, error: String(e).slice(0, 200) }); }
    await ctx.close();
  }
  await browser.close();
}
await servers.close();
let keep = [];
if (ONLY.length) keep = JSON.parse(await readFile(path.join(HERE, 'ingredientopts-phone-measure.json'), 'utf8')).filter((r) => !ONLY.includes(r.form));
await writeFile(path.join(HERE, 'ingredientopts-phone-measure.json'), JSON.stringify(keep.concat(out)));
console.log('ok', out.length, 'errors', out.filter((r) => r.error).length);
