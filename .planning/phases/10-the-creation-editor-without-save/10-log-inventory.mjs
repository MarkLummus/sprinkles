// Sid, 2026-10-21: inventory of every grouped surface in aside.notebook-log on the built app at 1366 (WebKit, coarse pointer): for each state, every labelled
// element in the log in document order with its face (size/weight/case/tracking/line/colour) and the gap to the element before it, plus the log's outerHTML
// for the ladder board. Serves a scratch build (PROBE_DIST) on an ephemeral port; never 4173.
//   PROBE_DIST=<dist> node 10-log-inventory.mjs <out dir>   -> <out>/log-inventory.json, <out>/log-capture.json, <out>/inv-<state>.png
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { library } from '../../../app/src/data/library.js';
import { blankCreateDraft, buildDraftRecord } from '../../../app/src/domain/draft.js';
import { writeFile } from 'node:fs/promises';
const OUT = process.argv[2];
const servers = await startServers({ appRoot: process.env.PROBE_DIST });
const browser = await webkit.launch();
const ctx = await browser.newContext({ viewport: { width: 1366, height: 744 }, hasTouch: true });
await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
const page = await ctx.newPage();
await page.goto(servers.appUrl + '/', { waitUntil: 'networkidle' }); await page.waitForSelector('.shell');
const ORIGINAL = Object.entries(library).map(([id, entry]) => ({ id, entry }));
await page.evaluate(async (records) => { const db = await new Promise((res, rej) => { const q = indexedDB.open('sprinkles'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); await new Promise((res, rej) => { const tx = db.transaction('library', 'readwrite'); const st = tx.objectStore('library'); st.clear(); for (const r of records) st.put(r); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); db.close(); }, ORIGINAL);
const payload = { ...blankCreateDraft({ recipeId: 'vanilla', versionId: 'vanilla-v1', name: 'Vanilla' }), name: 'Vanilla', description: 'Plain and cold.',
  rows: [{ id: 'row-milk', libraryId: 'wholeMilk', portions: [{ step: 1, grams: '600' }] }, { id: 'row-cream', libraryId: 'heavyCream', portions: [{ step: 1, grams: '250' }] }],
  style: 'philadelphia', serveTempC: '-14', targets: { pod: ['14', '18'], fat: ['10', '18'], msnf: ['8', '12'], solids: ['36', '42'] },
  scales: [{ key: 'scale-crit-1', name: 'Creaminess', low: 'thin', high: 'rich', kind: 'goldilocks', group: 'declared' }], problems: ['Bitter'] };
const record = buildDraftRecord({ versionId: 'vanilla-v1', kind: 'create', payload, now: '2026-10-21T12:00:00.000Z' });
await page.evaluate(async (row) => { const db = await new Promise((res, rej) => { const q = indexedDB.open('sprinkles'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); await new Promise((res, rej) => { const tx = db.transaction('drafts', 'readwrite'); tx.objectStore('drafts').put(row); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); db.close(); }, record);

const inventory = () => page.evaluate(() => {
  const log = document.querySelector('.notebook-log'); if (!log) return null;
  const face = (e) => { const s = getComputedStyle(e); return { size: s.fontSize, weight: s.fontWeight, tt: s.textTransform, ls: s.letterSpacing, lh: s.lineHeight, color: s.color, ff: /Georgia/.test(s.fontFamily) ? 'text' : /Caveat/.test(s.fontFamily) ? 'hand' : 'grotesk' }; };
  const own = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
  const items = [];
  for (const e of log.querySelectorAll('*')) {
    const tag = e.tagName.toLowerCase(); if (['svg', 'path', 'option', 'legend'].includes(tag)) continue;
    const text = own(e); const isCtl = ['input', 'select', 'textarea', 'button'].includes(tag);
    if (!text && !isCtl) continue;
    const r = e.getBoundingClientRect(); if (r.height === 0) continue;
    items.push({ tag, cls: e.className && typeof e.className === 'string' ? e.className.split(' ').slice(0, 2).join('.') : '', text: (text || e.value || e.getAttribute('aria-label') || '').slice(0, 28), top: +(r.top + scrollY).toFixed(1), bottom: +(r.bottom + scrollY).toFixed(1), h: +r.height.toFixed(1), x: +(r.left - log.getBoundingClientRect().left).toFixed(0), ...face(e) });
  }
  items.sort((a, b) => a.top - b.top || a.x - b.x);
  let prevBottom = null;
  for (const it of items) { it.gap = prevBottom === null ? null : +(it.top - prevBottom).toFixed(1); prevBottom = Math.max(prevBottom ?? 0, it.bottom); }
  // the log's markup with the live field values written into attributes (React keeps them on the DOM properties only)
  const root = log.cloneNode(true); const lf = log.querySelectorAll('input, textarea, select'); const cf = root.querySelectorAll('input, textarea, select');
  lf.forEach((e, i) => { const c = cf[i]; if (e.tagName === 'TEXTAREA') c.textContent = e.value; else if (e.tagName === 'SELECT') { [...c.options].forEach((o, j) => { if (j === e.selectedIndex) o.setAttribute('selected', ''); else o.removeAttribute('selected'); }); } else if (e.type === 'radio' || e.type === 'checkbox') { if (e.checked) c.setAttribute('checked', ''); else c.removeAttribute('checked'); } else c.setAttribute('value', e.value); });
  return { logTop: log.getBoundingClientRect().top + scrollY, logH: log.getBoundingClientRect().height, items, html: root.outerHTML };
});
const states = {}; const html = {};
const take = async (name) => { const inv = await inventory(); if (!inv) { states[name] = null; return; } html[name] = inv.html; delete inv.html; states[name] = inv; await page.evaluate(() => document.querySelector('.notebook-log').scrollIntoView({ block: 'start' })); await page.waitForTimeout(150); await page.screenshot({ path: `${OUT}/inv-${name}.png` }); };
await page.goto(servers.appUrl + '/notebook/new', { waitUntil: 'networkidle' }); await page.waitForSelector('.notebook.mk-page'); await page.evaluate(() => document.fonts.ready); await take('creation');
const OLIVE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
await page.goto(servers.appUrl + OLIVE, { waitUntil: 'networkidle' }); await page.waitForSelector('.notebook-log'); await page.waitForTimeout(300); await take('reading-olive');
await page.getByRole('button', { name: /next version/i }).first().click(); await page.waitForTimeout(400); await take('version-pen');
await page.goto(servers.appUrl + OLIVE, { waitUntil: 'networkidle' }); await page.waitForSelector('.notebook-log'); await page.waitForTimeout(300);
await page.getByRole('button', { name: /record another/i }).first().click(); await page.waitForTimeout(400); await take('record-pen');
await page.getByRole('button', { name: /add tasting/i }).first().click(); await page.waitForTimeout(400); await take('tasting-pen');
await page.goto(servers.appUrl + '/notebook/mexican-chocolate/mexican-chocolate-v3', { waitUntil: 'networkidle' }); await page.waitForSelector('.notebook-log'); await page.waitForTimeout(300); await take('reading-mex3');
await writeFile(OUT + '/log-inventory.json', JSON.stringify(states, null, 1)); await writeFile(OUT + '/log-capture.json', JSON.stringify(html, null, 1));
for (const [k, v] of Object.entries(states)) { if (!v) { console.log(k, 'NO LOG'); continue; } console.log(`\n== ${k} (log ${Math.round(v.logH)} tall, ${v.items.length} items)`); for (const it of v.items) console.log(`${String(it.gap ?? '').padStart(6)} | ${it.tag}.${it.cls} "${it.text}" | ${it.ff} ${it.size}/${it.weight} ${it.tt} ls ${it.ls} lh ${it.lh} ${it.color} h${it.h} x${it.x}`); }
await browser.close(); await servers.close(); process.exit(0);
