// Sid, 2026-10-05 (decision 58): captures the built app's tasting, read and recorded, for the boards that draw the reading state's groups under the record pen's three names. It serves a COPY of app/dist (argv[2]) on a
// throwaway 127.0.0.1 port, so Mark's preview on :4173 is never touched and nothing is built.
//   node tgroups-capture.mjs <dist copy>  -> tgroups-capture.json  { "<scenario>_<overlay>_<W>": { html, facts } }   WebKit, coarse pointer, 1366 and 393; Olive Oil v1.
// Scenarios: seed (the seeded batch as it reads: Sweetness and Oil marked, Bitter, melt test 3 g), full (a batch recorded with all six axes, all five problems, melt test and style), sparse (a batch recorded with Hardness
// and Smoothness only, no problem, no melt), pen (the record pen with that full tasting typed, before Save). Real clicks and fills. Overlays (o_*) are the browser's edit of the page the same state is in (the groups
// renamed and regrouped as the option draws them), applied to the live DOM and then cloned; the section is restored between overlays. Nothing here is a build.
import { writeFile, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const DIST = path.resolve(process.argv[2]);
const V1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const CT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json' };
const srv = createServer(async (req, res) => { const u = new URL(req.url, 'http://x'); let f = path.join(DIST, decodeURIComponent(u.pathname)); const ok = (p) => existsSync(p) && statSync(p).isFile();
  if (!path.extname(u.pathname) && !ok(f)) f = path.join(DIST, 'index.html'); if (!ok(f) || !f.startsWith(DIST)) { res.writeHead(404); res.end('nf'); return; } res.writeHead(200, { 'Content-Type': CT[path.extname(f)] ?? 'application/octet-stream' }); res.end(await readFile(f)); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r)); const URL0 = `http://127.0.0.1:${srv.address().port}`;
import { install, grab, rects, FULL, SPARSE, record } from './tgroups-page.mjs';
const SCEN = { seed: { rec: null, ovs: ['none', 'B2'], kind: 'read' }, full: { rec: FULL, ovs: ['none', 'A', 'B', 'C', 'B2'], kind: 'read' }, sparse: { rec: SPARSE, ovs: ['none', 'B2'], kind: 'read' }, pen: { rec: FULL, ovs: ['none'], kind: 'pen' } };
const out = {}; const b = await webkit.launch();
try {
  for (const W of [1366, 393]) for (const [sk, sc] of Object.entries(SCEN)) {
    const context = await b.newContext({ viewport: { width: W, height: W === 1366 ? 1024 : 800 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });
    await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
    const page = await context.newPage(); page.setDefaultTimeout(10000); await page.goto(URL0 + V1, { waitUntil: 'networkidle' }); await page.waitForSelector('.notebook-log'); await page.waitForTimeout(300);
    await page.evaluate(install);
    if (sc.rec) await record(page, sc.rec, sc.kind === 'read');
    if (sc.kind === 'read') { const closed = page.locator('.tasting-reading button[aria-expanded="false"]'); if (await closed.count()) { await closed.first().click(); await page.waitForTimeout(300); } await page.evaluate(() => window.__restore()); }
    await page.evaluate(() => document.fonts.ready);
    for (const ov of sc.ovs) {
      if (sc.kind === 'read') { await page.evaluate(() => window.__restore()); await page.evaluate((n) => window.__ov(n), ov); }
      await page.waitForTimeout(150);
      const html = await page.evaluate(grab); await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(150);
      const facts = await page.evaluate(rects, sc.kind);
      out[`${sk}_${ov}_${W}`] = { html, facts };
    }
    await context.close();
  }
} finally { await b.close(); srv.close(); }
await writeFile(path.join(HERE, 'tgroups-capture.json'), JSON.stringify(out));
for (const [k, v] of Object.entries(out)) { const f = v.facts; console.log(k.padEnd(18), v.html.length, f.section ? `section ${f.section.h} groups ${f.groups.map((g) => g.head + '[' + g.cells.length + ']').join(' | ')} cond ${f.conditions.length}` : `pen cue ${JSON.stringify(f.cues)} ${f.cueFace}`); }
process.exit(0);
