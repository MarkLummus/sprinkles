// Sid, 2026-11-15 (Phase 12 Gate 1; 12-CONTEXT.md D-06, D-07): captures the built app's record pen (tasting open), its reading and the two printed log pages for a
// recipe with its own scales and problems, so the Gate 1 boards (p12.py) start from the built page.
//   node p12-capture.mjs [dist, default app/dist]   -> p12-capture.json
// WebKit, coarse pointer, 1366 x 1024 and 393 x 852, app/dist served by the 03.5 probe harness on a throwaway 127.0.0.1 port (never Mark's preview on :4173; no Vite process).
// The build has no seeded recipe with a Low to high scale, so after the app seeds its store the Olive Oil v1 version record and its seeded batch are rewritten IN THIS
// CONTEXT'S OWN THROWAWAY IndexedDB (stores 'versions' and 'batches'; printstart-capture.mjs's precedent) to declare the example's scales and problems, and the page is
// loaded again: what is captured is the build's own markup for such a recipe, with a magnitude scale drawn as the build draws it today (as Right in the middle: the bug
// bug-p11-low-to-high-scale-centre-mark). p12.py then draws the decided Low to high form over it. Cases:
//   two    Body (thin, heavy; Right in the middle) and Coffee flavour (faint, strong; Low to high); problems Bitter, Burnt taste
//   one    Mint (faint, strong; Low to high) alone; problem Waxy chips
//   none   Mexican Chocolate v1 as seeded (declares nothing)
// The example words are Sid's, not Mark's and not in the data. The clock is fixed at 4 Aug 2026.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../milestones/v1-phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(process.argv[2] || path.join(HERE, '..', '..', 'app', 'dist'));
const D = (key, name, low, high, kind) => ({ key, name, low, high, kind, group: 'declared' });
const CASES = {
  two: { route: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', vid: 'olive-oil-ice-cream-v1', axes: [D('body', 'Body', 'thin', 'heavy', 'goldilocks'), D('coffee', 'Coffee flavour', 'faint', 'strong', 'magnitude')], flaws: ['Bitter', 'Burnt taste'], marks: { sweetness: 4, body: 4, coffee: 2 }, ticks: ['Bitter', 'Burnt taste'], pen: [['Body', 4], ['Coffee flavour', 2]] },
  one: { route: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', vid: 'olive-oil-ice-cream-v1', axes: [D('mint', 'Mint', 'faint', 'strong', 'magnitude')], flaws: ['Waxy chips'], marks: { sweetness: 4, mint: 5 }, ticks: ['Waxy chips'], pen: [['Mint', 5]] },
  none: { route: '/notebook/mexican-chocolate/mexican-chocolate-v1', vid: 'mexican-chocolate-v1', pen: [] },
};
// rewrite the version's declared scales and problems and its batches' snapshots and stored marks (this context's own IndexedDB only)
const inject = (c) => new Promise((res, rej) => { const o = indexedDB.open('sprinkles'); o.onerror = () => rej(o.error); o.onsuccess = () => { const db = o.result; const tx = db.transaction(['versions', 'batches'], 'readwrite');
  const vs = tx.objectStore('versions'); vs.get(c.vid).onsuccess = (e) => { const v = e.target.result; v.declaredAxes = c.axes; v.declaredFlaws = c.flaws; vs.put(v); };
  const bs = tx.objectStore('batches'); bs.index('by-version').getAll(c.vid).onsuccess = (e) => { for (const b of e.target.result) { b.snapshot.declaredAxes = c.axes; b.snapshot.declaredFlaws = c.flaws; if (b.tasting) { b.tasting.marks = c.marks; b.tasting.declaredDefects = c.ticks; } bs.put(b); } };
  tx.oncomplete = () => { db.close(); res(true); }; tx.onerror = () => rej(tx.error); }; });
const bake = (sel) => { const root = document.querySelector(sel);
  for (const i of root.querySelectorAll('input')) { if (i.type === 'radio' || i.type === 'checkbox') { if (i.checked) i.setAttribute('checked', ''); else i.removeAttribute('checked'); } else i.setAttribute('value', i.value); }
  for (const t of root.querySelectorAll('textarea')) t.textContent = t.value;
  return root.outerHTML; };
// the built geometry the boards are checked against: each scale in the pen, each cell and group in the reading
const penFacts = () => { const r1 = (n) => Math.round(n * 10) / 10; const B = (e) => { const b = e.getBoundingClientRect(); return { w: r1(b.width), h: r1(b.height) }; };
  const log = document.querySelector('.notebook-log'); const cs = (e, p) => getComputedStyle(e)[p];
  return { logW: r1(log.getBoundingClientRect().width),
    cues: [...log.querySelectorAll('.axes-cue, .defects-head .pen-caption, .defect-group .pen-caption')].map((e) => e.textContent.trim()),
    scales: [...log.querySelectorAll('.axis-mark')].map((a) => ({ name: a.querySelector('.axis-mark__name').textContent, cls: a.className, box: B(a), head: B(a.querySelector('.axis-mark__head')), stops: B(a.querySelector('.axis-mark__stops')), stop: B(a.querySelector('.axis-mark__stop')),
      anchors: B(a.querySelector('.axis-mark__anchors')), anchorWords: [...a.querySelectorAll('.axis-mark__anchors span')].map((s) => s.textContent), stopFont: cs(a.querySelector('.axis-mark__stop'), 'fontSize'), anchorFont: cs(a.querySelector('.axis-mark__anchors'), 'fontSize') + ' ' + cs(a.querySelector('.axis-mark__anchors'), 'fontStyle'),
      aria: [...a.querySelectorAll('input')].map((i) => i.getAttribute('aria-label')) })),
    chips: [...log.querySelectorAll('.chip-toggle')].map((c) => ({ t: c.textContent, ...B(c), top: r1(c.getBoundingClientRect().top - log.getBoundingClientRect().top) })) }; };
const readFacts = () => { const r1 = (n) => Math.round(n * 10) / 10; const t = document.querySelector('.tasting-reading'); if (!t) return null; const R = t.getBoundingClientRect();
  return { w: r1(R.width), h: r1(R.height), groups: [...t.querySelectorAll('.batch-row__group-label')].map((e) => e.tagName + ' ' + e.textContent.trim()),
    cells: [...t.querySelectorAll('.batch-row__cell')].map((c) => { const b = c.getBoundingClientRect(); return { label: c.querySelector('.batch-row__cell-label')?.textContent, value: c.querySelector('.batch-row__cell-value')?.textContent, x: r1(b.left - R.left), y: r1(b.top - R.top), w: r1(b.width), h: r1(b.height) }; }),
    problems: [...t.querySelectorAll('.tasting-reading__problems')].map((e) => ({ t: e.textContent, font: getComputedStyle(e).fontFamily.slice(0, 20), size: getComputedStyle(e).fontSize, color: getComputedStyle(e).color })) }; };
// the log pages on the print route: the markup, and each page's needed height at Safari's and Chrome's content widths (the body, its 16 px foot gap and the foot)
const printFacts = () => { const r1 = (n) => Math.round(n * 10) / 10; const out = [];
  for (const pg of document.querySelectorAll('.print-page--log')) { const lf = pg.querySelector('.lf'); const body = lf.querySelector('.lf-body'); const foot = lf.querySelector('.lf-foot'); const o = { title: lf.querySelector('.lf-title').textContent, lines: lf.querySelectorAll('.lf-line').length, srows: [...lf.querySelectorAll('.lf-srow')].map((s) => ({ name: s.querySelector('.axis-mark__name').textContent, h: r1(s.getBoundingClientRect().height), words: [...s.querySelectorAll('.lf-anchor, .lf-num')].map((x) => x.className.replace('lf-anchor ', '').replace('lf-num ', '') + ':' + x.textContent) })), boxes: [...lf.querySelectorAll('.lf-box')].length, need: {} };
    const keep = [pg.style.cssText, lf.style.cssText]; pg.style.transform = 'none'; pg.style.padding = '0'; pg.style.height = 'auto';
    for (const [k, w] of [['safari', 630], ['chrome', 672]]) { pg.style.width = w + 'px'; pg.style.paddingRight = '2px'; pg.style.boxSizing = 'border-box'; lf.style.height = 'auto'; o.need[k] = { body: r1(body.getBoundingClientRect().height), foot: r1(foot.getBoundingClientRect().height), total: r1(body.getBoundingClientRect().height + 16 + foot.getBoundingClientRect().height), problemsRowH: r1(lf.querySelector('.lf-mrow--plain')?.getBoundingClientRect().height ?? 0), lineH: r1(lf.querySelector('.lf-line').getBoundingClientRect().height) }; }
    pg.style.cssText = keep[0]; lf.style.cssText = keep[1]; out.push(o); }
  return out; };

const { appUrl, close } = await startServers({ appRoot: DIST }); const browser = await webkit.launch(); const out = { dist: DIST, at: new Date().toISOString() };
try {
  for (const [W, H] of [[1366, 1024], [393, 852]]) for (const [ck, c] of Object.entries(CASES)) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 724, deviceScaleFactor: 1 }); const page = await ctx.newPage(); page.setDefaultTimeout(12000);
    await page.clock.setFixedTime(new Date('2026-08-04T12:00:00'));
    const load = async (route, sel) => { await page.goto(appUrl + route, { waitUntil: 'load' }); await page.waitForSelector(sel); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400); };
    await load(c.route, '.notebook-log');
    if (c.axes) { await page.evaluate(inject, c); await load(c.route, '.notebook-log'); }
    // the reading: the seeded batch, the Tasting fold open
    const fold = page.locator('.notebook-log [aria-expanded="false"]').filter({ hasText: /^Tasting/ }).first();
    if (await fold.count()) { await fold.click(); await page.waitForTimeout(300); }
    out[`${ck}_read_${W}`] = { html: await page.evaluate(bake, '.notebook-log'), facts: await page.evaluate(readFacts) };
    // the print route's two log pages (once, at 1366)
    if (W === 1366) { await load(c.route + '/print', '.print-page--log'); out[`${ck}_print`] = { pages: await page.evaluate(() => [...document.querySelectorAll('.print-page--log')].map((p) => p.outerHTML)), facts: await page.evaluate(printFacts), engineClass: await page.evaluate(() => document.querySelector('.print-route').className) }; await load(c.route, '.notebook-log'); }
    // the pen: Record another, then Add tasting, then the example's marks and ticks
    const log = page.locator('.notebook-log');
    await log.getByRole('button', { name: /^Record (another|a batch)$/ }).first().click(); await page.waitForTimeout(400);
    await log.getByRole('button', { name: /add tasting/i }).first().click(); await page.waitForSelector('.notebook-log .axis-mark'); await page.waitForTimeout(400);
    out[`${ck}_penblank_${W}`] = { html: await page.evaluate(bake, '.notebook-log'), facts: await page.evaluate(penFacts) };
    for (const [name, stop] of c.pen) await log.locator('.axis-mark', { has: page.locator('.axis-mark__name', { hasText: new RegExp('^' + name + '$') }) }).locator('.axis-mark__stop').nth(stop - 1).click();
    for (const t of c.ticks ?? []) await log.locator('.chip-toggle', { hasText: new RegExp('^' + t + '$') }).click();
    await page.waitForTimeout(350);
    out[`${ck}_pen_${W}`] = { html: await page.evaluate(bake, '.notebook-log'), facts: await page.evaluate(penFacts) };
    await ctx.close();
  }
} finally { await browser.close(); await close(); }
await writeFile(path.join(HERE, 'p12-capture.json'), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) if (v && v.facts) console.log(k, JSON.stringify(v.facts).length);
process.exit(0);
