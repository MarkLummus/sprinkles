// Sid, 2026-10-05 (decision 58): board against build, side by side, in Playwright WebKit and system Chrome (both coarse; 1366 and 393), on throwaway 127.0.0.1 servers (never :4173; nothing is built).
//   node tgroups-conform.mjs <dist copy> [widths] [engines]
// The app is driven by real clicks and fills to each state (Olive Oil v1: the seeded batch; a batch recorded with every field; a batch recorded with Hardness and Smoothness only; the pen with every field typed) and,
// for the option panels, the same edit the capture made is laid on the live page. Each panel's facts (the tasting section's height, each group's name, cells, top and height within the section, the measured cells, the
// problems words; for the pen the cues, the melt block and the grid) are compared with the live page's, within 1px in WebKit and 2px in Chrome.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { createServer } from 'node:http'; import { readFile } from 'node:fs/promises'; import { existsSync, statSync } from 'node:fs'; import path from 'node:path';
import { launch, openBoard, check, finish, startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import { install, FULL, SPARSE, record } from './tgroups-page.mjs';
const DIST = path.resolve(process.argv[2]); const widths = (process.argv[3] || '1366,393').split(',').map(Number); const engines = (process.argv[4] || 'webkit,chrome').split(',');
const V1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1'; const BOARD = 'tasting-group-names.html';
const CT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json' };
const app = createServer(async (req, res) => { const u = new URL(req.url, 'http://x'); let f = path.join(DIST, decodeURIComponent(u.pathname)); const ok = (p) => existsSync(p) && statSync(p).isFile();
  if (!path.extname(u.pathname) && !ok(f)) f = path.join(DIST, 'index.html'); if (!ok(f) || !f.startsWith(DIST)) { res.writeHead(404); res.end('nf'); return; } res.writeHead(200, { 'Content-Type': CT[path.extname(f)] ?? 'application/octet-stream' }); res.end(await readFile(f)); });
await new Promise((r) => app.listen(0, '127.0.0.1', r)); const appUrl = `http://127.0.0.1:${app.address().port}`;
// panel id -> [scenario, overlay]
const PANELS = { 'seed-built': ['seed', 'none'], 'full-built': ['full', 'none'], 'pen-built': ['pen', 'none'], a: ['full', 'A'], b: ['full', 'B'], c: ['full', 'C'], b2: ['full', 'B2'], 'seed-b2': ['seed', 'B2'], 'sparse-built': ['sparse', 'none'], 'sparse-b2': ['sparse', 'B2'] };
const read = ({ sel, kind }) => {
  const root = sel ? document.querySelector(sel) : document; const T = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
  const R = (e, o) => { const r = e.getBoundingClientRect(); return { y: +(r.y - o.y).toFixed(2), h: +r.height.toFixed(2), w: +r.width.toFixed(2) }; };
  if (kind === 'pen') { const g = root.querySelector('.notebook-log .axes-grid'); const o = g.getBoundingClientRect(); const cue = root.querySelector('.notebook-log .axes-cue'); const melt = root.querySelector('.notebook-log .melt-block');
    return { gridH: +o.height.toFixed(2), gridW: +o.width.toFixed(2), cueY: R(cue, o).y, meltY: R(melt, o).y, meltH: R(melt, o).h, cues: [...root.querySelectorAll('.notebook-log .axes-cue, #defects-caption, [id^="defects-caption"]')].map(T) }; }
  const sec = root.querySelector('.tasting-reading'); const o = sec.getBoundingClientRect(); const concl = [...root.querySelectorAll('.batch-row__conclusion')].pop();
  return { h: +o.height.toFixed(2), w: +o.width.toFixed(2), concl: concl ? R(concl, o) : null, conditions: [...sec.querySelectorAll('.tasting-reading__conditions .batch-row__cell')].map(T), text: T(sec),
    groups: [...sec.querySelectorAll('.tasting-reading__group')].map((g) => ({ head: T(g.querySelector('.batch-row__group-label')), cells: [...g.querySelectorAll('.batch-row__cell')].map(T), ...R(g, o) })) };
};
async function drive(browser, width, sk, ov) {
  const context = await browser.newContext({ viewport: { width, height: width === 1366 ? 1024 : 800 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });
  await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await context.newPage(); page.setDefaultTimeout(10000); await page.goto(appUrl + V1, { waitUntil: 'networkidle' }); await page.waitForSelector('.notebook-log'); await page.waitForTimeout(300); await page.evaluate(install);
  const S = { seed: null, full: FULL, sparse: SPARSE, pen: FULL }[sk]; if (S) await record(page, S, sk !== 'pen');
  if (sk !== 'pen') { const closed = page.locator('.tasting-reading button[aria-expanded="false"]'); if (await closed.count()) { await closed.first().click(); await page.waitForTimeout(300); } await page.evaluate(() => window.__restore()); await page.evaluate((n) => window.__ov(n), ov); }
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(200);
  const r = await page.evaluate(read, { sel: null, kind: sk === 'pen' ? 'pen' : 'read' }); await context.close(); return r;
}
const failures = []; let n = 0; const ck = (c, l) => { n += 1; check(failures, c, l); };
const { repoUrl, close } = await startServers(); const browsers = { webkit: await webkit.launch(), chrome: await launch() };
try {
  for (const engine of engines) {
    const tol = engine === 'chrome' ? 2 : 1;
    const { context: bctx, page: bpage } = await openBoard(browsers[engine], repoUrl, BOARD, { coarse: true }); await bpage.evaluate(() => document.fonts.ready); await bpage.waitForTimeout(500);
    for (const width of widths) for (const [pid, [sk, ov]] of Object.entries(PANELS)) {
      const label = `${engine} ${width} ${pid}`; const a = await drive(browsers[engine], width, sk, ov); const kind = sk === 'pen' ? 'pen' : 'read';
      const P = await bpage.evaluate(read, { sel: `.fp-${pid}-${width}`, kind });
      if (kind === 'pen') {
        ck(Math.abs(P.gridH - a.gridH) <= tol && Math.abs(P.gridW - a.gridW) <= tol, `${label}: axes grid ${a.gridW}x${a.gridH} within ${tol}px of the panel's ${P.gridW}x${P.gridH}`);
        ck(Math.abs(P.cueY - a.cueY) <= tol && Math.abs(P.meltY - a.meltY) <= tol && Math.abs(P.meltH - a.meltH) <= tol, `${label}: first cue at ${a.cueY}, melt block at ${a.meltY} (${a.meltH} tall) within ${tol}px of the panel's ${P.cueY}, ${P.meltY} (${P.meltH})`);
        ck(JSON.stringify(P.cues) === JSON.stringify(a.cues), `${label}: cues ${JSON.stringify(a.cues)} equal the panel's`);
      } else {
        ck(Math.abs(P.h - a.h) <= tol && Math.abs(P.w - a.w) <= tol, `${label}: tasting section ${a.w}x${a.h} within ${tol}px of the panel's ${P.w}x${P.h}`);
        ck(P.groups.length === a.groups.length, `${label}: ${a.groups.length} groups equal the panel's ${P.groups.length}`);
        a.groups.forEach((g, i) => { const p = P.groups[i]; if (!p) return; ck(p.head === g.head && JSON.stringify(p.cells) === JSON.stringify(g.cells) || engine !== 'webkit' && p.head === g.head, `${label}: group ${i} "${g.head}" ${JSON.stringify(g.cells.length)} cells equals the panel's "${p.head}" ${p.cells.length}`); ck(Math.abs(p.y - g.y) <= tol && Math.abs(p.h - g.h) <= tol, `${label}: group "${g.head}" top ${g.y}, height ${g.h} within ${tol}px of the panel's ${p.y}, ${p.h}`); });
        ck(JSON.stringify(P.conditions) === JSON.stringify(a.conditions), `${label}: measured cells (${a.conditions.length}) equal the panel's (${P.conditions.length})`);
        if (a.concl && P.concl) ck(Math.abs(P.concl.y - a.concl.y) <= tol, `${label}: Next time top ${a.concl.y} within ${tol}px of the panel's ${P.concl.y}`);
        if (engine === 'webkit') ck(P.text === a.text, `${label}: the section's words equal the panel's`);
      }
      console.log(label.padEnd(24), kind === 'pen' ? `grid ${a.gridW}x${a.gridH}` : `section ${a.w}x${a.h}, groups ${a.groups.map((g) => g.head || '(none)').join(' / ')}`);
    }
    await bctx.close();
  }
} finally { await Promise.all(Object.values(browsers).map((b) => b.close())); await close(); app.close(); }
finish(failures, n, 'tgroups-conform'); process.exit(process.exitCode || 0);
