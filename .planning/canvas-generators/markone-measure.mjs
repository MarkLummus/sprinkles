// Sid, 2026-10-06, revised 2026-10-07 (D11b: the taste crop runs to the save buttons when the scales are gone; nextTop, nextBottom, saveTop and saveBottom measured; D11: the draw crop runs to the tasting head and the taste crop to Next time when the scales are gone; nextTop, headTop and meltBottom added; D10: the hint's height, line and right edge, and the options' border style; D6b: no See below, no hint; D9: axesTop added for the From freezer jump, the notes stay): measures markone.py's probe (every panel at its natural size) in WebKit with a coarse pointer, and writes markone-measure.json: each panel's height and the anchors the board's crops use.
//   node markone-measure.mjs <dir holding markone-probe.html> [chromium]
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(process.argv[2]); const useChromium = process.argv[3] === 'chromium';
const br = useChromium ? await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }) : await webkit.launch();
const ctx = await br.newContext({ viewport: { width: 1400, height: 1000 }, hasTouch: true, deviceScaleFactor: 1 }); const page = await ctx.newPage();
await page.goto('file://' + path.join(DIR, 'markone-probe.html')); await page.waitForTimeout(400);
const pids = await page.$$eval('[data-pid]', (els) => els.map((e) => e.getAttribute('data-pid')));
const out = {};
for (const pid of pids) {
  out[pid] = await page.evaluate((pid) => {
    document.querySelectorAll('[data-pid]').forEach((e) => { e.style.display = e.getAttribute('data-pid') === pid ? 'block' : 'none'; });
    const root = document.querySelector('[data-pid="' + pid + '"]'); const R = root.getBoundingClientRect(); const rel = (e) => (e ? Math.round((e.getBoundingClientRect().bottom - R.top) * 10) / 10 : null); const top = (e) => (e ? Math.round((e.getBoundingClientRect().top - R.top) * 10) / 10 : null);
    const lab = (t) => [...root.querySelectorAll('.pen-caption')].find((e) => e.textContent.trim() === t);
    const g1 = root.querySelector('[data-mo="atdraw"]'), g2 = root.querySelector('[data-mo="fromfreezer"]'); const axes = [...root.querySelectorAll('.axis-mark')];
    const f = (g) => g && { opts: [...g.querySelectorAll('.segmented__option')].map((o) => { const i = o.querySelector('input'); return o.textContent.trim() + (i.checked ? ' [on]' : '') + (i.disabled ? ' [off]' : ''); }), clear: !!g.querySelector('.segmented-field__clear'), top: top(g), bottom: rel(g), headH: Math.round(g.querySelector('.segmented-field__head').getBoundingClientRect().height), segTop: top(g.querySelector('.segmented')), segH: Math.round(g.querySelector('.segmented').getBoundingClientRect().height), hint: (() => { const x = g.querySelector('.mo-hint'); if (!x) return null; const r = x.getBoundingClientRect(), c = g.querySelector('.segmented-field__caption').getBoundingClientRect(), hd = g.querySelector('.segmented-field__head').getBoundingClientRect(); return { h: Math.round(r.height), right: Math.round(hd.right - r.right), sameLine: Math.abs(r.bottom - c.bottom) < 3, text: x.textContent }; })(), dashed: [...g.querySelectorAll('.segmented__option')].map((o) => getComputedStyle(o).borderTopStyle).join('/') };
    const ing = lab('Ingredient notes'); const melt = root.querySelector('.melt-block'); const th = root.querySelector('.tasting-head');
    return { h: Math.ceil(R.height), w: Math.round(R.width), overflowX: Math.max(0, Math.round(root.scrollWidth - R.width)), drawEnd: th ? rel(th) : null, tasteTop: th ? top(th) : null, tasteCrop: axes[1] ? rel(axes[1]) : rel(root.querySelector('.save-ceremony')),
      atdraw: f(g1), fromfreezer: f(g2), meltTop: top(melt), axesTop: top(root.querySelector('.axes-grid')), exitTop: top(root.querySelector('.segmented-field:not(.mo-group)')), noteTop: top(lab('At the machine')), ingTop: top(ing), howTop: top(lab('How did it turn out?')), nextTop: top(lab('Next time')), headTop: top(th), meltBottom: rel(melt), nextBottom: lab('Next time') ? rel(lab('Next time').closest('label')) : null, saveTop: top(root.querySelector('.save-ceremony')), saveBottom: rel(root.querySelector('.save-ceremony')) };
  }, pid);
}
await br.close();
await writeFile(path.join(HERE, useChromium ? 'markone-measure-chromium.json' : 'markone-measure.json'), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k, JSON.stringify({ h: v.h, ovx: v.overflowX, drawEnd: v.drawEnd, tasteTop: v.tasteTop, tasteCrop: v.tasteCrop, exitTop: v.exitTop, axesTop: v.axesTop, noteTop: v.noteTop, howTop: v.howTop, ingTop: v.ingTop, meltTop: v.meltTop, nextTop: v.nextTop, saveTop: v.saveTop, saveBottom: v.saveBottom, ad: v.atdraw && [v.atdraw.top, v.atdraw.headH, v.atdraw.segH, v.atdraw.bottom, v.atdraw.hint && [v.atdraw.hint.h, v.atdraw.hint.right, v.atdraw.hint.sameLine], v.atdraw.dashed], ff: v.fromfreezer && [v.fromfreezer.top, v.fromfreezer.headH, v.fromfreezer.segH, v.fromfreezer.bottom, v.fromfreezer.hint && [v.fromfreezer.hint.h, v.fromfreezer.hint.right, v.fromfreezer.hint.sameLine], v.fromfreezer.dashed], ado: v.atdraw && v.atdraw.opts, ffo: v.fromfreezer && v.fromfreezer.opts }));
process.exit(0);
