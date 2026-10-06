// Sid, 2026-10-05 (decision 57): board against build, side by side, in Playwright WebKit and system Chrome (both coarse; 1366 and 393), on throwaway 127.0.0.1 servers (never :4173; nothing is built).
//   node blocked-conform.mjs <dist copy> [widths] [engines]
// The app is driven by real clicks and fills to each state (Olive Oil v1, Next version, "v2", Whole milk's Step 3 amount blank / Heavy cream blank / "4o", Save) and, for the o_* panels, the same edit the capture made is laid
// on the live page. Each panel's table rows (labels, heights and tops within the table), field box, name cell, the ceremony form's height and the status text are compared with the live page's, within 1px.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { createServer } from 'node:http'; import { readFile } from 'node:fs/promises'; import { existsSync, statSync } from 'node:fs'; import path from 'node:path';
import { launch, openBoard, check, finish } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const DIST = path.resolve(process.argv[2]); const widths = (process.argv[3] || '1366,393').split(',').map(Number); const engines = (process.argv[4] || 'webkit,chrome').split(',');
const V1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1'; const BOARD = 'blocked-row-sentence.html';
const CT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json' };
const app = createServer(async (req, res) => { const u = new URL(req.url, 'http://x'); let f = path.join(DIST, decodeURIComponent(u.pathname)); const ok = (p) => existsSync(p) && statSync(p).isFile();
  if (!path.extname(u.pathname) && !ok(f)) f = path.join(DIST, 'index.html'); if (!ok(f) || !f.startsWith(DIST)) { res.writeHead(404); res.end('nf'); return; } res.writeHead(200, { 'Content-Type': CT[path.extname(f)] ?? 'application/octet-stream' }); res.end(await readFile(f)); });
await new Promise((r) => app.listen(0, '127.0.0.1', r)); const appUrl = `http://127.0.0.1:${app.address().port}`;
const MSG = { whole2: 'Whole milk needs an amount, or remove it', cream: 'Heavy cream needs an amount, or remove it', nan: "Whole milk's amount is not a number" };
const FIELD = { whole2: 'Whole milk, grams, portion 2', cream: 'Heavy cream, grams', nan: 'Whole milk, grams, portion 2' }; const VAL = { whole2: '', cream: '', nan: '4o' };
// panel id -> [case, overlay, kind]
const PANELS = { 'a-row': ['whole2', 'none', 'table'], 'a-cer': ['whole2', 'none', 'form'], 'a-ver': [null, 'none', 'form'], 'o-row-whole2': ['whole2', 'row', 'table'], 'o-row-cream': ['cream', 'row', 'table'], 'o-row-nan': ['nan', 'row', 'table'], 'o-cer-whole2': ['whole2', 'ceremony', 'form'] };
const read = ({ label, sel, overlay, text }) => {
  const root = sel ? document.querySelector(sel) : document;
  if (!sel && overlay !== 'none') {   // the capture's edit, on the live page
    const inp = root.querySelector(`input[aria-label="${label}"]`); const tr = inp.closest('tr');
    if (overlay === 'row') { const nc = tr.querySelector('.ingredient-table__col-name'); const s = document.createElement('span'); s.className = 'field-error'; s.textContent = text; nc.appendChild(s); }
    else root.querySelector('.notebook-ceremony .form-status').textContent = text;
  }
  const T = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
  const table = root.querySelector('.ingredient-table'); const t0 = table.getBoundingClientRect(); const form = root.querySelector('.notebook-ceremony'); const f0 = form.getBoundingClientRect();
  const rows = [...table.querySelectorAll('tbody tr')].map((tr) => { const r = tr.getBoundingClientRect(); const inp = tr.querySelector('input'); const ib = inp ? inp.getBoundingClientRect() : null; const nc = tr.querySelector('.ingredient-table__col-name');
    return { label: T(tr).slice(0, 110), y: +(r.y - t0.y).toFixed(2), h: +r.height.toFixed(2), nameW: nc ? +nc.getBoundingClientRect().width.toFixed(2) : null, field: inp ? { v: inp.value, w: +ib.width.toFixed(2), h: +ib.height.toFixed(2), dy: +(ib.y - r.y).toFixed(2) } : null }; });
  const btn = [...form.querySelectorAll('.notebook-ceremony__actions button')].map((b) => +(b.getBoundingClientRect().y - f0.y).toFixed(2));
  return { rows, tableW: +t0.width.toFixed(2), formH: +f0.height.toFixed(2), formW: +f0.width.toFixed(2), status: T(form.querySelector('.form-status')), errors: [...form.querySelectorAll('.field-error')].map(T), btn };
};
async function drive(browser, width, c, overlay) {
  const context = await browser.newContext({ viewport: { width, height: width === 1366 ? 1024 : 800 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });
  await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await context.newPage(); page.setDefaultTimeout(10000); await page.goto(appUrl + V1, { waitUntil: 'networkidle' }); await page.waitForSelector('.notebook-log'); await page.waitForTimeout(300);
  await page.getByRole('button', { name: /next version/i }).first().click(); await page.waitForSelector('.ingredient-table.is-developing');
  if (c) { await page.getByLabel('Version name').fill('v2'); await page.getByLabel(FIELD[c], { exact: true }).fill(VAL[c]); }
  await page.getByRole('button', { name: 'Save as a new version', exact: true }).click(); await page.waitForTimeout(500); await page.evaluate(() => document.fonts.ready);
  const landed = await page.evaluate(() => scrollY);
  const r = await page.evaluate(read, { label: c ? FIELD[c] : null, sel: null, overlay, text: c ? MSG[c] : '' }); await context.close(); return { ...r, landed };
}
const failures = []; let n = 0; const ck = (c, l) => { n += 1; check(failures, c, l); };
const { repoUrl, close } = await startServers(); const browsers = { webkit: await webkit.launch(), chrome: await launch() };
try {
  for (const engine of engines) {
    const tol = engine === 'chrome' ? 2 : 1;   // Chrome reads the table 0.97px narrower than WebKit (decision 56), so a wrapped line can differ by a line; the tolerance is named, not hidden
    const { context: bctx, page: bpage } = await openBoard(browsers[engine], repoUrl, BOARD, { coarse: true }); await bpage.evaluate(() => document.fonts.ready); await bpage.waitForTimeout(500);
    for (const width of widths) for (const [pid, [c, overlay, kind]] of Object.entries(PANELS)) {
      const label = `${engine} ${width} ${pid}`; const app_ = await drive(browsers[engine], width, c, overlay);
      const P = await bpage.evaluate(read, { label: null, sel: `.fp-${pid}-${width}`, overlay: 'none', text: '' });
      if (kind === 'table') {
        ck(P.rows.length === app_.rows.length, `${label}: ${P.rows.length} panel rows equal the app's ${app_.rows.length}`);
        app_.rows.forEach((r, i) => { const p = P.rows[i]; if (!p) return;
          ck(Math.abs(p.h - r.h) <= tol, `${label}: row ${i} height ${r.h} within ${tol}px of the panel's ${p.h}`);
          ck(Math.abs(p.y - r.y) <= tol, `${label}: row ${i} top ${r.y} within ${tol}px of the panel's ${p.y}`);
          if (engine === 'webkit') ck(p.label === r.label, `${label}: row ${i} "${r.label}" equals the panel's "${p.label}"`);
          if (r.field && p.field) ck(Math.abs(p.field.w - r.field.w) <= tol && Math.abs(p.field.h - r.field.h) <= tol && p.field.v === r.field.v, `${label}: row ${i} field ${r.field.w}x${r.field.h} "${r.field.v}" within ${tol}px of the panel's ${p.field.w}x${p.field.h} "${p.field.v}"`); });
        ck(Math.abs(P.tableW - app_.tableW) <= tol, `${label}: table width ${app_.tableW} within ${tol}px of the panel's ${P.tableW}`);
      } else {
        ck(Math.abs(P.formH - app_.formH) <= tol, `${label}: form height ${app_.formH} within ${tol}px of the panel's ${P.formH}`);
        ck(Math.abs(P.formW - app_.formW) <= tol, `${label}: form width ${app_.formW} within ${tol}px of the panel's ${P.formW}`);
        ck(P.status === app_.status && JSON.stringify(P.errors) === JSON.stringify(app_.errors), `${label}: status "${app_.status}" / sentences ${JSON.stringify(app_.errors)} equal the panel's "${P.status}" / ${JSON.stringify(P.errors)}`);
        ck(app_.btn.every((y, i) => Math.abs(y - P.btn[i]) <= tol), `${label}: buttons' tops ${app_.btn} within ${tol}px of the panel's ${P.btn}`);
      }
      console.log(label.padEnd(26), kind === 'table' ? `${app_.rows.length} rows, table ${app_.tableW} wide, scrolled ${app_.landed}` : `form ${app_.formW}x${app_.formH}, status "${app_.status}"`);
    }
    await bctx.close();
  }
} finally { await Promise.all(Object.values(browsers).map((b) => b.close())); await close(); app.close(); }
finish(failures, n, 'blocked-conform'); process.exit(process.exitCode || 0);
