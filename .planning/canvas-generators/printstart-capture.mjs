// Sid, 2026-10-06 (Phase 4 D-00 as amended 2026-10-06): captures the built Sheet again, after Phase 03.7 moved Before you start above the Ingredients table, for the "Print formats" page's two starting-point boards.
//   npm --prefix app run build && node printstart-capture.mjs   -> printstart-capture.json
//     page1280  the whole shell at 1280, desktop (fine pointer), as the app opens its folds there      -> AsBuiltRecipePage.dc.html
//     sheet     the Sheet alone (article.recipe-page) from that same 1280 page: a desktop user prints from that window, so the markup carries the desktop fold states -> PrintStartingPoint.dc.html
//     facts     measurements of the real DOM: at 1280 screen, and at the letter page with the print block on (816 wide, print media emulated), WebKit and Chromium
// Olive Oil v1, the seeded recipe, with no batch (Mark, 2026-10-06: the starting point reads as the version alone, as for a next version that has no batch yet). The build has no route that shows a
// version with its batch out of view, so after the app seeds its store the version's one seeded batch is deleted from IndexedDB (store 'batches', index 'by-version') and the page is loaded again: what
// is captured is the build's own no-batch markup, not a hand edit. That removes the As made column and its hand figures, the as-made Total, the struck SKIPPED step 1, the hand notes on steps 8 and 9,
// the "Go to batch · Tasted" link in the band and the batch log. The markup is otherwise the build's own, left untouched.
// Served from app/dist on a throwaway 127.0.0.1 port by the 03.5 probe harness; Mark's preview on :4173 is never contacted and nothing is built here.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROUTE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const VERSION_ID = 'olive-oil-ice-cream-v1';
// the version's batches out of the store, so the build renders the version with no batch (this context's own throwaway IndexedDB; nothing else is touched)
const dropBatches = (vid = 'olive-oil-ice-cream-v1') => new Promise((res, rej) => { const o = indexedDB.open('sprinkles'); o.onerror = () => rej(o.error); o.onsuccess = () => { const db = o.result; const tx = db.transaction('batches', 'readwrite'); const st = tx.objectStore('batches'); const ids = []; const q = st.index('by-version').getAllKeys(vid); q.onsuccess = () => { for (const k of q.result) { ids.push(k); st.delete(k); } }; tx.oncomplete = () => { db.close(); res(ids); }; tx.onerror = () => rej(tx.error); }; });
const servers = await startServers();
const wk = await webkit.launch(); const cr = await chromium.launch({ executablePath: CHROME, headless: true });

async function open(browser, W, media) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 1000 }, hasTouch: false, deviceScaleFactor: 1 });
  await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await ctx.newPage(); page.setDefaultTimeout(10000);
  await page.goto(servers.appUrl + ROUTE, { waitUntil: 'networkidle' }); await page.waitForSelector('article.recipe-page .ingredient-table');
  const removed = await page.evaluate(dropBatches);
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('article.recipe-page .ingredient-table');
  await page.waitForTimeout(300); await page.evaluate(() => document.fonts.ready); page.removedBatches = removed;
  if (media) await page.emulateMedia({ media });
  return { ctx, page };
}
// what a reader sees, from the real DOM: order, placement, table shape, controls that are visible
const measure = () => {
  const a = document.querySelector('article.recipe-page'); const T = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
  const box = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };
  const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const table = a.querySelector('.ingredient-table'); const before = a.querySelector('.before-region'); const method = a.querySelector('.method-region'); const side = a.querySelector('.side-region');
  const tb = [...table.querySelectorAll('tbody')];
  return {
    article: box(a), cols: getComputedStyle(a).gridTemplateColumns.split(' ').length, areas: getComputedStyle(a).gridTemplateAreas,
    sections: [...a.children].map((c) => ({ cls: c.className, ...box(c) })),
    headings: [...a.querySelectorAll('h1, h2')].filter(vis).map((h) => ({ tag: h.tagName, text: T(h).replace(/Hide$|Show$/, ''), y: Math.round(h.getBoundingClientRect().top + scrollY) })),
    beforeAboveTable: !!before && before.getBoundingClientRect().bottom <= table.getBoundingClientRect().top, beforeBox: box(before), tableBox: box(table), methodBox: box(method), sideBox: box(side),
    thead: !!table.querySelector('thead'), theadRows: table.querySelectorAll('thead tr').length, theadCells: [...table.querySelectorAll('thead th')].map(T), tbodies: tb.length, tfoot: !!table.querySelector('tfoot'),
    groups: tb.map((b) => ({ head: T(b.querySelector('.ingredient-table__step-head')), rows: b.querySelectorAll('tr:not(.ingredient-table__step-head)').length })),
    totalText: T(table.querySelector('tfoot')), steps: a.querySelectorAll('.method-step').length, stepsWithStruck: a.querySelectorAll('.method-step__prose--struck').length,
    handSpans: a.querySelectorAll('.sheet-hand').length, handFace: (a.querySelector('.sheet-hand') ? getComputedStyle(a.querySelector('.sheet-hand')).fontFamily.slice(0, 40) + ' / ' + getComputedStyle(a.querySelector('.sheet-hand')).fontStyle : null),
    visibleControls: [...a.querySelectorAll('button, a, input, textarea, select, summary')].filter(vis).map((e) => e.tagName.toLowerCase() + ': ' + (T(e) || e.getAttribute('aria-label') || '')).slice(0, 20),
    hiddenAttr: a.querySelectorAll('[hidden]').length, tbodyOnlyOfType: table.querySelectorAll('tbody:not(:only-of-type)').length,
    docH: document.documentElement.scrollHeight,
  };
};

const out = { facts: {} };
for (const [name, browser] of [['webkit', wk], ['chromium', cr]]) {
  const { ctx, page } = await open(browser, 1280);
  const html = await page.evaluate(() => ({ shell: document.querySelector('.shell').outerHTML, sheet: document.querySelector('article.recipe-page').outerHTML, shellH: Math.ceil(document.querySelector('.shell').getBoundingClientRect().height) }));
  out.facts[name + '_1280_screen'] = await page.evaluate(measure);
  out.facts[name + '_removedBatches'] = page.removedBatches;
  if (name === 'webkit') { out.page1280 = html.shell; out.sheet = html.sheet; out.shellH = html.shellH; } else out.facts.chromiumMarkupEqualsWebkit = { shell: html.shell === out.page1280, sheet: html.sheet === out.sheet };
  await ctx.close();
  // the Sheet at the letter page's width with the print block on: the same 1280 markup (desktop fold state), laid out by the viewport that print gives it
  const p2 = await open(browser, 1280); await p2.page.setViewportSize({ width: 816, height: 1000 }); await p2.page.emulateMedia({ media: 'print' }); await p2.page.waitForTimeout(300);
  out.facts[name + '_816_print'] = await p2.page.evaluate(measure);
  await p2.ctx.close();
}
await wk.close(); await cr.close(); await servers.close();
await writeFile(path.join(HERE, 'printstart-capture.json'), JSON.stringify(out));
console.log(JSON.stringify(out.facts, null, 1).slice(0, 6000)); console.log('shell', out.page1280.length, 'sheet', out.sheet.length, 'shellH', out.shellH);
