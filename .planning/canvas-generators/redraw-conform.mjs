// Sid, 2026-10-04 (decision 41, question 2; Mark: redraw the other boards): the board against the built app, side by side, in WebKit (coarse pointer, as the boards are drawn).
//   node redraw-conform.mjs <dir holding the generated *.dc.html boards> [only]    -> prints every difference; "checks N off M"
// For each panel of each wide page board (final.py's BOARDS: state and width) the same page is opened in the built app (the preview server already on 127.0.0.1:4173, nothing started, nothing built) with the capture's own
// setup, and a list of elements is measured in both: the box (x, y, w, h from the shell's top left) and the computed values that decisions 33, 34, 38 and quick 261004-ly6 / ly7 / ly8 changed (radius, weight,
// face, margin, content of the dot, position, display). A difference is printed unless it is one the board draws on purpose (D3's grid, the Go to batch row's display and the open folds are the final design's
// not-yet-built parts: listed in OK_DIFF with the reason).
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const DIR = process.argv[2]; const ONLY = process.argv[3];
const R = { mex3: '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01', olive1: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89',
  under2: '/notebook/underbelly-light-base/underbelly-light-base-v2', base2: '/notebook/standard-base/standard-base-v2' };
const AS = { 'Whole Milk 3.3%': 503, 'Cocoa Powder': 16.4, 'Sucrose': 46, 'Dextrose': 45, 'Fructose': 4.5, 'Dried Skimmed Milk Powder': 34.8, 'Salt': null, 'Cream, heavy': 77, 'Vanilla Extract': null, 'Stabilizer Mix 4421': 2, 'Cinnamon': 2.3, 'Allulose': 37 };
const construct = (m) => { let sum = 0; for (const tr of document.querySelectorAll('.ingredient-table tbody > tr')) { const nc = tr.querySelector('.ingredient-table__col-name'); const num = tr.querySelectorAll('.ingredient-table__col-numeric'); if (!nc || num.length < 2) continue; const name = [...nc.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim(); if (m[name] === null) continue; num[0].innerHTML = `<span class="sheet-hand">${m[name]} g</span>`; sum += m[name]; } const f = document.querySelectorAll('.ingredient-table tfoot .ingredient-table__col-numeric')[0]; if (f) f.innerHTML = `<span class="sheet-hand">${Math.round(sum * 10) / 10} g</span>`; };
const SEL = ['.notebook-version__text', '.notebook-band > *', '.shell__head', '.shell__menu', '.shell__brand', '.shell__tools', '.shell__tools a', '.shell__rail', '.shell__place', '.shell__place[aria-current="page"]', '.recipe-page', '.headnote', '.ingredient-table-region', '.ingredient-table', '.ingredient-table thead th', '.side-region',
  '.notebook-band', '.notebook-version', '.notebook-version__details', '.version-row__reason', '.version-row__reason-label', '.notebook-version__acts .notebook-action', '.notebook-action', '.notebook-action--outline', '.notebook-jump', '.fold-row', '.fold-row__control', '.fold-row__count',
  '.notebook-history', '.notebook-log', '.batch-row__head', '.batch-row__head-acts', '.batch-row__head-acts > *', '.notebook-field input', '.notebook-field textarea', '.ink-field', '.prose-field', '.ingredient-table__remove-gap', '.ingredient-table__col-name .text-control', '.method-region', '.shell__main'];
const PROPS = ['display', 'position', 'borderTopLeftRadius', 'borderTopRightRadius', 'fontWeight', 'fontFamily', 'fontSize', 'lineHeight', 'color', 'backgroundColor', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'justifyContent', 'columnGap', 'rowGap', 'zIndex', 'top', 'borderBottomWidth', 'borderBottomColor', 'overflowY'];
const measure = ([SEL, PROPS, rootSel]) => {
  const root = document.querySelector(rootSel); const sh = root.getBoundingClientRect(); const out = { _shell: { w: +sh.width.toFixed(1), h: +sh.height.toFixed(1) } };
  for (const s of SEL) { const els = [...root.querySelectorAll(s)].filter((e) => e.getClientRects().length > 0).slice(0, 14);
    out[s] = els.map((e) => { const b = e.getBoundingClientRect(); const c = getComputedStyle(e); const o = { x: +(b.x - sh.x).toFixed(1), y: +(b.y - sh.y).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; for (const p of PROPS) o[p] = c[p];
      const bf = getComputedStyle(e, '::before').content; if (bf && bf !== 'none' && bf !== 'normal') o.before = bf; return o; }); }
  return out;
};
// UNBUILT (env, comma list: d3, jump, p3, dots): the parts of the final design the build did not have at the reading; the board draws them on top and the check lets exactly those boxes and values differ. An empty list is the strict check.
const UNBUILT = new Set((process.env.UNBUILT || '').split(',').filter(Boolean));
const D3_SEL = /^(\.ingredient-table|\.method-region|\.recipe-page|\.shell__main|_shell|\.side-region|\.notebook-band|\.notebook-log|\.notebook-history|\.headnote)/; const D3_KEYS = new Set(['y', 'h']);
const TOP = /^(\.shell__head|\.shell__menu|\.shell__brand|\.shell__tools|\.shell__rail|\.shell__place|\.headnote)/;
const shifted = UNBUILT.has('d3') || UNBUILT.has('jump') || UNBUILT.has('p3');
const intended = (W, s, k) =>
  (W < 724 && k === 'y' && s.startsWith('.shell__place')) ||                                  // the phone's tab row is fixed to the window's foot in the app and to the panel's foot in a drawing, which has no window
  (shifted && k === 'y' && !TOP.test(s)) ||                                                    // whatever sits below an unbuilt part moves with it
  (UNBUILT.has('d3') && W >= 724 && (s.startsWith('.ingredient-table') || (s === '.ink-field' && (k === 'x' || k === 'w')) || (D3_SEL.test(s) && D3_KEYS.has(k)))) ||
  (UNBUILT.has('p3') && W < 724 && (s.startsWith('.ingredient-table') || (D3_SEL.test(s) && D3_KEYS.has(k)))) ||
  (UNBUILT.has('jump') && W >= 724 && W <= 1365 && s === '.notebook-jump');
const A_SEL = /^(\.fold-row|\.notebook-jump|\.batch-row__head|\.notebook-log)/;
const introduced = (W, s, k) => UNBUILT.has('dots') && W < 724 && A_SEL.test(s) && ['x', 'w', 'h', 'justifyContent', 'columnGap', 'rowGap', 'before'].includes(k);
const SPECS = JSON.parse(await readFile(path.join(path.dirname(new URL(import.meta.url).pathname), 'redraw-specs.json'), 'utf8'));
const br = await webkit.launch(); let n = 0, bad = 0; const seen = {};
for (const spec of SPECS) {
  if (ONLY && !spec.board.includes(ONLY)) continue;
  for (const [state, W] of spec.panels) {
    const base = state.replace(/pen$/, '');
    // the built app
    const ctx = await br.newContext({ viewport: { width: W, height: 1000 }, hasTouch: true, deviceScaleFactor: 1 }); const page = await ctx.newPage(); page.setDefaultTimeout(10000);
    await page.goto('http://127.0.0.1:4173' + R[base], { waitUntil: 'networkidle' }); await page.waitForSelector('.ingredient-table');
    if (base === 'mex3' || base === 'under2') { await page.getByRole('button', { name: 'Show changes' }).first().click(); await page.getByRole('button', { name: 'Hide changes' }).first().waitFor(); }
    if (base === 'mex3') await page.evaluate(construct, AS);
    if (state.endsWith('pen')) { await page.getByRole('button', { name: 'Next version' }).first().click(); await page.getByLabel('Salt, grams', { exact: true }).waitFor().catch(() => {});
      if (state === 'mex3pen') for (const [l, v] of [['Whole Milk 3.3%', '540'], ['Sucrose', '44'], ['Cocoa Powder', '18']]) await page.getByLabel(l + ', grams', { exact: true }).fill(v);
      const edit = page.getByRole('button', { name: /edit this step/ }).nth(state === 'olive1pen' ? 2 : 0); if (await edit.count()) await edit.click(); await page.waitForTimeout(150); }
    if (W >= 984 && W < 1366) for (const label of ['Balance', 'Watch for']) { const b = page.locator('button[aria-expanded="false"]', { hasText: label }).first(); if (await b.count()) await b.click(); }
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(250);
    const app = await page.evaluate(measure, [SEL, PROPS, '.shell']); await ctx.close();
    // the board
    const bctx = await br.newContext({ viewport: { width: 3600, height: 1000 }, hasTouch: true, deviceScaleFactor: 1 });
    await bctx.route('**/caveat-regular.woff2', (r) => r.fulfill({ path: '/Users/mark/Documents/projects/sprinkles/app/public/fonts/caveat-regular.woff2', contentType: 'font/woff2' })); await bctx.route(/fonts\.googleapis/, (r) => r.fulfill({ contentType: 'text/css', body: '@font-face{font-family:Caveat;src:url(file:///Users/mark/Documents/projects/sprinkles/app/public/fonts/caveat-regular.woff2) format("woff2");font-weight:400}' })); await bctx.route(/fonts\.gstatic/, (r) => r.abort());   // the boards take Caveat from the Google link (offline here): the app's own file stands in
    const bp = await bctx.newPage(); await bp.goto('file://' + path.join(DIR, spec.board + '.html')); await bp.waitForTimeout(900); await bp.evaluate(() => document.fonts.ready);
    const brd = await bp.evaluate(measure, [SEL, PROPS, `.fp-win.fp-${state}-${W}${spec.suffix || ''} .shell`]).catch((e) => ({ error: String(e) })); await bctx.close();
    const label = `${spec.board} ${state} ${W}`;
    if (brd.error) { console.log('ERROR', label, brd.error.slice(0, 120)); bad++; continue; }
    for (const s of ['_shell', ...SEL]) {
      const a = s === '_shell' ? [app._shell] : app[s], b = s === '_shell' ? [brd._shell] : brd[s]; n++;
      if (a.length !== b.length && !intended(+label.split(' ').pop(), s, 'count')) { bad++; console.log('count', label, s, 'app', a.length, 'board', b.length); continue; }
      if (a.length !== b.length) continue; a.forEach((ea, i) => { for (const k of Object.keys(ea)) { const va = ea[k], vb = b[i][k]; n++;
        const num = typeof va === 'number'; const off = num ? Math.abs(va - vb) > 0.6 : va !== vb; if (off && !intended(+label.split(' ').pop(), s, k) && !introduced(+label.split(' ').pop(), s, k)) { bad++; console.log('diff', label, s + '[' + i + ']', k, 'app', va, 'board', vb); } } });
    }
  }
}
console.log('checks', n, 'off', bad); await br.close(); process.exit(0);
