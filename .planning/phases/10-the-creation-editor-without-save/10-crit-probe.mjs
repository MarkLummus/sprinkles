// Sid, 2026-10-21: evidence for the Impeccable critique of the built creation editor's log column (/notebook/new at 1366x744, WebKit, coarse pointer),
// and the record pen's axes group as the standard it should match. Serves a scratch build (PROBE_DIST) on an ephemeral port; never 4173.
//   PROBE_DIST=<dist> LIVE_PORT=<impeccable live-server port> node 10-crit-probe.mjs <out dir>
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { library } from '../../../app/src/data/library.js';
import { blankCreateDraft, buildDraftRecord } from '../../../app/src/domain/draft.js';
import { writeFile } from 'node:fs/promises';
const OUT = process.argv[2]; const LIVE = process.env.LIVE_PORT;
const servers = await startServers({ appRoot: process.env.PROBE_DIST });
const browser = await webkit.launch();
const ctx = await browser.newContext({ viewport: { width: 1366, height: 744 }, hasTouch: true });
await ctx.route('**/*', (r) => { const h = new URL(r.request().url()).hostname; (h === '127.0.0.1' || h === 'localhost') ? r.continue() : r.abort(); });
const page = await ctx.newPage(); const console_ = []; page.on('console', (m) => console_.push(m.type() + ': ' + m.text()));
await page.goto(servers.appUrl + '/', { waitUntil: 'networkidle' }); await page.waitForSelector('.shell');
const ORIGINAL = Object.entries(library).map(([id, entry]) => ({ id, entry }));
const idb = async (fn, arg) => page.evaluate(fn, arg);
await idb(async (records) => { const db = await new Promise((res, rej) => { const q = indexedDB.open('sprinkles'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); await new Promise((res, rej) => { const tx = db.transaction('library', 'readwrite'); const st = tx.objectStore('library'); st.clear(); for (const r of records) st.put(r); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); db.close(); }, ORIGINAL);
const payload = { ...blankCreateDraft({ recipeId: 'vanilla', versionId: 'vanilla-v1', name: 'Vanilla' }), name: 'Vanilla', description: 'Plain and cold.',
  rows: [{ id: 'row-milk', libraryId: 'wholeMilk', portions: [{ step: 1, grams: '600' }] }, { id: 'row-cream', libraryId: 'heavyCream', portions: [{ step: 1, grams: '250' }] }],
  style: 'philadelphia', serveTempC: '-14', targets: { pod: ['14', '18'], fat: ['10', '18'], msnf: ['8', '12'], solids: ['36', '42'] },
  scales: [{ key: 'scale-crit-1', name: 'Creaminess', low: 'thin', high: 'rich', kind: 'goldilocks', group: 'declared' }], problems: ['Bitter'] };
const record = buildDraftRecord({ versionId: 'vanilla-v1', kind: 'create', payload, now: '2026-10-21T12:00:00.000Z' });
await idb(async (row) => { const db = await new Promise((res, rej) => { const q = indexedDB.open('sprinkles'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); await new Promise((res, rej) => { const tx = db.transaction('drafts', 'readwrite'); tx.objectStore('drafts').put(row); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); db.close(); }, record);
await page.goto(servers.appUrl + '/notebook/new', { waitUntil: 'networkidle' }); await page.waitForSelector('.notebook.mk-page'); await page.evaluate(() => document.fonts.ready);
const ROLES = [['Region name', '.mk-region .batch-row__head .region-name'], ['Clear', '.batch-row__head-acts .text-control'], ['Menu value', '.mk-menu'], ['Field caption', '.notebook-field .notebook-caption'], ['Field value', '.notebook-field .ink-field'], ['Targets caption', '.mk-region[aria-label="Style"] > .mk-body > .notebook-caption'], ['Band label', '.mk-band__label'], ['Group cue', '.mk-cue'], ['Core names', '.mk-core'], ['Card head', '.mk-card__head .notebook-caption'], ['remove', '.mk-card__head .text-control'], ['Kind caption', '.segmented-field__caption'], ['Kind cell', '.segmented__option'], ['Stops line', '.mk-stops'], ['Add link', '.mk-add'], ['Problem name field', '.mk-region[aria-label="Problems"] .ink-field']];
const BLOCKS = '.batch-row__head, .mk-cue, .mk-core, .mk-card__head, .mk-card > .notebook-field, .mk-pair, .segmented-field, .mk-stops, .mk-add-row, .mk-menu-wrap, .notebook-field, .mk-band';
const face = (e) => { const s = getComputedStyle(e); return `${s.fontSize}/${s.fontWeight} ${s.textTransform} ls ${s.letterSpacing} lh ${s.lineHeight} ${s.color}`; };
const measure = () => page.evaluate(({ ROLES, BLOCKS }) => {
  const log = document.querySelector('.notebook-log'); const r0 = log.getBoundingClientRect();
  const face = (e) => { const s = getComputedStyle(e); return `${s.fontSize}/${s.fontWeight} ${s.textTransform} ls ${s.letterSpacing} lh ${s.lineHeight} ${s.color}`; };
  const roles = ROLES.map(([role, sel]) => { const e = log.querySelector(sel); if (!e) return { role, missing: true }; const r = e.getBoundingClientRect(); return { role, text: e.textContent.trim().slice(0, 30), face: face(e), top: +(r.top + scrollY).toFixed(1), h: +r.height.toFixed(1) }; });
  const regions = [...log.querySelectorAll('.mk-region')].map((sec) => { const name = sec.getAttribute('aria-label'); const blocks = [...sec.querySelectorAll(BLOCKS)].filter((e) => !e.closest('.mk-band') || e.classList.contains('mk-band')).filter((e) => !(e.classList.contains('notebook-field') && e.closest('.mk-band'))).map((e) => ({ e, r: e.getBoundingClientRect() })).filter((b) => b.r.height > 0).sort((a, b) => a.r.top - b.r.top); const gaps = []; for (let i = 0; i + 1 < blocks.length; i++) { const a = blocks[i], c = blocks[i + 1]; if (c.r.top < a.r.bottom - 0.5) continue; gaps.push({ after: a.e.className.split(' ')[0] + ':' + a.e.textContent.trim().slice(0, 14), before: c.e.className.split(' ')[0] + ':' + c.e.textContent.trim().slice(0, 14), gap: +(c.r.top - a.r.bottom).toFixed(1) }); } const rr = sec.getBoundingClientRect(); return { name, top: +(rr.top + scrollY).toFixed(1), h: +rr.height.toFixed(1), gaps }; });
  const between = []; for (let i = 0; i + 1 < regions.length; i++) between.push({ from: regions[i].name, to: regions[i + 1].name, gap: +(regions[i + 1].top - (regions[i].top + regions[i].h)).toFixed(1) });
  return { logBox: { x: r0.x, w: r0.width, top: r0.top + scrollY, h: r0.height }, roles, regions, between, scrollH: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth };
}, { ROLES, BLOCKS });
const creation = await measure();
await page.screenshot({ path: OUT + '/crit-new-top.png' });
await page.evaluate(() => document.querySelector('.mk-region[aria-label="Scales"]').scrollIntoView()); await page.waitForTimeout(200);
await page.screenshot({ path: OUT + '/crit-new-scales.png' });
await page.screenshot({ path: OUT + '/crit-new-full.png', fullPage: true });
// the overlay: the critique's detector injected into the served route
let overlay = null;
if (LIVE) {
  await page.evaluate(() => window.scrollTo(0, 0));
  const pre = await page.evaluate(() => { document.title = 'Impeccable [Human]'; const s = document.createElement('script'); s.textContent = 'window.__imp_pre=1'; document.head.appendChild(s); return [document.title, window.__imp_pre]; });
  const n0 = console_.length;
  await page.evaluate((port) => { const s = document.createElement('script'); s.src = 'http://localhost:' + port + '/detect.js'; document.head.appendChild(s); }, LIVE);
  await page.waitForTimeout(3500);
  const nodes = await page.evaluate(() => [...document.querySelectorAll('[class*=impeccable], [id*=impeccable], [data-impeccable]')].length);
  overlay = { pre, nodes, console: console_.slice(n0).filter((m) => /impeccable|tiny|anti-pattern|^log|^startGroup|^endGroup/i.test(m)).slice(0, 80) };
  await page.screenshot({ path: OUT + '/crit-overlay.png' });
}
// the standard: the record pen's axes group on Olive Oil v1 (Record another, Add tasting)
await page.goto(servers.appUrl + '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', { waitUntil: 'networkidle' }); await page.waitForSelector('.notebook-log'); await page.waitForTimeout(300);
await page.getByRole('button', { name: /record another/i }).first().click(); await page.waitForTimeout(300);
await page.getByRole('button', { name: /add tasting/i }).first().click(); await page.waitForTimeout(400);
const pen = await page.evaluate(() => {
  const log = document.querySelector('.notebook-log'); const face = (e) => { const s = getComputedStyle(e); return `${s.fontSize}/${s.fontWeight} ${s.textTransform} ls ${s.letterSpacing} lh ${s.lineHeight} ${s.color}`; };
  const cues = [...log.querySelectorAll('.axes-cue')].map((c) => { const r = c.getBoundingClientRect(); const prev = c.previousElementSibling, next = c.nextElementSibling; const pr = prev && prev.getBoundingClientRect(), nr = next && next.getBoundingClientRect(); return { text: c.textContent.trim(), face: face(c), h: +r.height.toFixed(1), above: pr ? +(r.top - pr.bottom).toFixed(1) : null, abovePrev: prev && (prev.className + ':' + prev.textContent.trim().slice(0, 16)), below: nr ? +(nr.top - r.bottom).toFixed(1) : null, belowNext: next && (next.className + ':' + next.textContent.trim().slice(0, 16)) }; });
  const name = log.querySelector('.axis-mark__name'); const marks = [...log.querySelectorAll('.axis-mark')].slice(0, 3).map((m) => m.getBoundingClientRect());
  const grp = [...log.querySelectorAll('.axes-grid__group')].map((g) => g.getBoundingClientRect());
  const heads = [...log.querySelectorAll('.region-name, .batch-row__group-label, .pen-caption')].slice(0, 6).map((h) => h.className.split(' ')[0] + ' ' + h.textContent.trim().slice(0, 14) + ' ' + face(h));
  return { cues, axisName: name && { text: name.textContent.trim(), face: face(name) }, markPitch: marks.length > 1 ? +(marks[1].top - marks[0].top).toFixed(1) : null, markH: marks[0] && +marks[0].height.toFixed(1), groupGap: grp.length > 1 ? +(grp[1].top - grp[0].bottom).toFixed(1) : null, heads };
});
await page.evaluate(() => document.querySelector('.notebook-log .axes-cue')?.scrollIntoView({ block: 'start' })); await page.waitForTimeout(200);
await page.screenshot({ path: OUT + '/crit-pen-cues.png' });
await writeFile(OUT + '/crit-measure.json', JSON.stringify({ creation, pen, overlay }, null, 1));
console.log(JSON.stringify({ creation, pen, overlay }, null, 1));
await browser.close(); await servers.close(); process.exit(0);
