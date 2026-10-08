// Sid, 2026-10-08 (Mark's List row look-sketch-010-snapshot-contract): measures the Sheet board with the method treatment in its Instructions (sheetedits.method_treatment).
//   node sheetmethod-measure.mjs <the board as a local file: PrintStartingPointBalanceCol2.dc.html with support.js dropped and the font pointed at app/public/fonts>
// WebKit (coarse pointer) and Chromium at the board's 816 and at the print content widths 672 (Chrome) and 630 (Safari) plus the 0.75 in sides (article 816 and 774): the Sheet's height, the Instructions' top and height,
// each step's height against the method pages' (the same step must be the same height), overflow, smallest type, colours, whether Why and the aside are upright, the tag row and the aside rule.
// Writes sheetmethod-measure.json (boardH_col2 = the taller engine's scrollHeight at 816, rounded up to 10, plus 10, which printstart.py reads over printstart-measure.json).
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const FILE = path.resolve(process.argv[2]);
const engines = { webkit: await webkit.launch(), chromium: await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }) };
const res = {};
for (const [name, br] of Object.entries(engines)) {
  const ctx = await br.newContext({ viewport: { width: 1000, height: 1400 }, hasTouch: name === 'webkit', deviceScaleFactor: 1 }); const page = await ctx.newPage(); await page.emulateMedia({ media: 'print' });
  await page.goto('file://' + FILE); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);
  for (const [k, W] of [['board816', 816], ['chrome672', 816], ['safari630', 774]]) {
    res[name + '_' + k] = await page.evaluate((W) => {
      const a = document.querySelector('article.recipe-page'); a.style.width = W + 'px'; a.style.boxSizing = 'border-box'; const r = (e) => e.getBoundingClientRect(); const A = r(a);
      const m = a.querySelector('.method-region'); const steps = [...m.querySelectorAll('.mp-step')];
      const fs = [...m.querySelectorAll('*')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())).map((e) => parseFloat(getComputedStyle(e).fontSize));
      const cols = [...new Set([...m.querySelectorAll('*')].flatMap((e) => { const s = getComputedStyle(e); return [s.color, s.borderLeftColor, s.textDecorationColor].filter((c) => c && c !== 'rgba(0, 0, 0, 0)'); }))];
      const why = [...m.querySelectorAll('.mp-why')], aside = [...m.querySelectorAll('.mp-aside')], tags = [...m.querySelectorAll('.mp-tag')];
      const st = (e) => getComputedStyle(e);
      return { sheetH: Math.round(a.scrollHeight), docH: document.documentElement.scrollHeight, methodTop: Math.round(r(m).top - A.top), methodH: Math.round(r(m).height), methodW: Math.round(r(m).width),
        stepHeights: steps.map((s) => Math.round(r(s).height * 10) / 10), headH: Math.round(r(m.querySelector('h2')).height), over: [...a.querySelectorAll('*')].filter((e) => r(e).right > A.right - parseFloat(st(a).paddingRight) + 0.5 && r(e).width > 0).length, ox: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        minFont: Math.min(...fs), colours: cols, why: why.length, aside: aside.length, tags: tags.length, whyStyle: [...new Set(why.map((e) => st(e).fontStyle))], asideStyle: [...new Set(aside.map((e) => st(e).fontStyle))],
        whyLabel: why.map((e) => e.querySelector('.mp-why__label').textContent + '|' + st(e.querySelector('.mp-why__label')).textTransform), asideRule: [...new Set(aside.map((e) => st(e).borderLeftWidth + ' ' + st(e).borderLeftStyle))],
        tagValue: [...new Set(tags.map((e) => st(e.querySelector('.mp-tag__value')).fontWeight + ' ' + st(e.querySelector('.mp-tag__value')).textDecorationLine))], numX: Math.round(r(steps[0].querySelector('.mp-n')).left - r(m).left), textX: Math.round(r(steps[0].querySelector('.mp-lead')).left - r(m).left),
        text: [m.textContent.replace(/\s+/g, ' ').trim().length], italicAny: [...m.querySelectorAll('*')].filter((e) => st(e).fontStyle === 'italic').length, chips: m.querySelectorAll('.target-chip, .method-step').length };
    }, W);
  }
  await ctx.close();
}
await engines.webkit.close(); await engines.chromium.close();
res.boardH_col2 = Math.ceil(Math.max(res.webkit_board816.docH, res.chromium_board816.docH) / 10) * 10 + 10;
await writeFile(path.join(HERE, 'sheetmethod-measure.json'), JSON.stringify(res, null, 1));
for (const k of Object.keys(res)) console.log(k, JSON.stringify(res[k]).slice(0, 900));
process.exit(0);
