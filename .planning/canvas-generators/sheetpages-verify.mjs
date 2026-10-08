// Sid, 2026-10-08 (README D29): checks the Sheet's real page boards (SheetPrintPage1 to 3) in WebKit (coarse pointer) and Chromium, as files that open on their own.
//   node sheetpages-verify.mjs <shots dir> <board.html> [<board.html> ...]      (a board written by sheetpages.py: the canvas's support.js line and font blob are dropped/pointed here; a snapshot needs neither)
// Per page and engine, in the page's own 816 x 1056 pixels: the ink's lowest point against 1008 (1056 less the 0.5 in bottom margin) and its left/right against 72 and 744; every step, step group (tbody), gauge, header row and the Total whole inside the content box;
// the header row (thead) and the Total (tfoot) counts; the words "continued" and "Ingredients" heading counts; the closing foot's geometry (rule width, gap under the last step, line height, font size, letter spacing). Writes one PNG per page and engine.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const SHOTS = path.resolve(process.argv[2]); const FILES = process.argv.slice(3).map((f) => path.resolve(f));
const FONT = 'file://' + path.resolve(HERE, '..', '..', 'app', 'public', 'fonts', 'caveat-regular.woff2'); await mkdir(SHOTS, { recursive: true });
const engines = { webkit: await webkit.launch(), chromium: await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }) };
const out = {};
for (const f of FILES) {
  let s = await readFile(f, 'utf8'); s = s.replace('<script src="./support.js"></script>\n', '').replace('<script src="./support.js"></script>', '').replaceAll('/_blob/37ac467ba5558024f5fb5a2e5c22a7bc', FONT);
  const tmp = path.join(SHOTS, '_' + path.basename(f)); await writeFile(tmp, s);   // fonts resolve from the file system whichever folder the copy is in
  for (const [name, br] of Object.entries(engines)) {
    const ctx = await br.newContext({ viewport: { width: 816, height: 1056 }, hasTouch: name === 'webkit', deviceScaleFactor: 2 }); const page = await ctx.newPage(); await page.emulateMedia({ media: 'print' });
    await page.goto('file://' + tmp); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);
    const r = await page.evaluate(() => {
      const sp = document.querySelector('.sp'); const S = sp.getBoundingClientRect(); const R = (e) => { const r = e.getBoundingClientRect(); return { t: r.top - S.top, b: r.bottom - S.top, l: r.left - S.left, r: r.right - S.left, h: r.height, w: r.width }; };
      const ink = [...sp.querySelectorAll('*')].filter((e) => { if (['SVG', 'path', 'line', 'rect', 'circle'].includes(e.tagName) || e.closest('svg')) return false; const k = getComputedStyle(e); const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()); return own || parseFloat(k.borderTopWidth) > 0 || parseFloat(k.borderBottomWidth) > 0 || e.tagName === 'svg'; });
      const svgs = [...sp.querySelectorAll('svg')];
      const rr = [...ink, ...svgs].map(R); const bottom = Math.max(...rr.map((x) => x.b)), left = Math.min(...rr.map((x) => x.l)), right = Math.max(...rr.map((x) => x.r));
      const whole = (sel) => [...sp.querySelectorAll(sel)].map((e) => { const x = R(e); return x.t >= 48 - 0.5 && x.b <= 1008 + 0.5; });
      const steps = [...sp.querySelectorAll('.mp-step')]; const last = steps.at(-1); const foot = sp.querySelector('.mp-foot');
      const o = { doc: [document.documentElement.scrollWidth, document.documentElement.scrollHeight], inkBottom: +bottom.toFixed(1), inkLeft: +left.toFixed(1), inkRight: +right.toFixed(1), spare: +(1008 - bottom).toFixed(1),
        stepsN: steps.length, stepIds: steps.map((e) => e.querySelector('.mp-n').textContent).join(','), stepsWhole: whole('.mp-step').every(Boolean), groups: sp.querySelectorAll('tbody').length, groupLabels: [...sp.querySelectorAll('.ingredient-table__step-head')].map((e) => e.firstChild.textContent), groupsWhole: whole('tbody').every(Boolean),
        gaugesN: sp.querySelectorAll('.formulation-note__rule').length, gaugeLabels: [...sp.querySelectorAll('.graduated-rule__label-word')].map((e) => e.textContent), gaugesWhole: whole('.formulation-note__rule').every(Boolean), basis: sp.querySelectorAll('.basis-note').length,
        thead: sp.querySelectorAll('thead').length, theadText: [...sp.querySelectorAll('thead th')].map((e) => e.textContent), tfoot: sp.querySelectorAll('tfoot').length, totalRows: [...sp.querySelectorAll('tfoot tr')].map((e) => e.getAttribute('aria-label')),
        h2: [...sp.querySelectorAll('h2')].map((e) => e.textContent), continued: /continued/i.test(sp.textContent), minFont: Math.min(...ink.map((e) => parseFloat(getComputedStyle(e).fontSize)).filter(Boolean)) * (S.width ? 16 / 15 : 1),
        art: R(sp.querySelector('.recipe-page')), tableBottom: sp.querySelector('table') ? +R(sp.querySelector('table')).b.toFixed(1) : null };
      if (foot) { const k = getComputedStyle(foot); const F = R(foot), L = R(last); o.foot = { text: foot.textContent, ruleX: [+F.l.toFixed(1), +F.r.toFixed(1)], w: +F.w.toFixed(1), gapUnderLastStep: +(F.t - L.b).toFixed(2), h: +F.h.toFixed(1), border: k.borderTopWidth + ' ' + k.borderTopStyle, pad: k.paddingTop, font: k.fontSize, ls: k.letterSpacing, family: k.fontFamily.split(',')[0], top: +F.t.toFixed(1), bottom: +F.b.toFixed(1), lastStepBottom: +L.b.toFixed(1), mt: k.marginTop, scale: 16 / 15 }; }
      return o;
    });
    await page.screenshot({ path: path.join(SHOTS, path.basename(f).replace(/\.(dc\.)?html$/, '') + '-' + name + '.png'), clip: { x: 0, y: 0, width: 816, height: 1056 } });
    out[path.basename(f) + ' ' + name] = r; console.log(path.basename(f), name, JSON.stringify(r)); await ctx.close();
  }
}
await engines.webkit.close(); await engines.chromium.close(); await writeFile(path.join(SHOTS, 'verify.json'), JSON.stringify(out, null, 1)); process.exit(0);
