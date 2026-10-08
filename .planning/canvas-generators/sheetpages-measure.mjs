// Sid, 2026-10-08 (Mark: "draw the real break"; Bishop's audit of sketch 010, gap 2; README D29): finds the real pagination of the Sheet for Olive Oil v1 by MEASURING the flowed Sheet board.
//   node sheetpages-measure.mjs <the Sheet board as a standalone file: .planning/sketches/010-bench-sheet/sheet-balance-col2.html>      -> sheetpages-measure.json
// For WebKit (coarse pointer) and Chromium at the two print content boxes, Chrome 672 x 960 and Safari 630 x 900 (README D20: @page margin .5in .75in; WebKit prints 1 CSS px as 0.8 pt), it reads the position of every unit the page rules may break between,
// in content coordinates (the article's top padding taken off): the Ingredients heading and header row, the four step groups (tbody) and the Total (tfoot) in column 1; the Balance gauges and its basis note in column 2; the Instructions heading and the ten steps.
// It then lays the pages by the rules D-06a, D-06b and D-07a give (the app's own print block, app.css): column 1 breaks between step groups only (a group never splits), the header row repeats alone, the Total goes with the last group and prints once;
// column 2 (Balance, README D29) breaks between gauges only, with no heading repeated; the Instructions follow the table's tail on the same page, in whole steps, 20 px (--gap-m) apart, and run on to the next page; the closing foot (D28) follows step 10.
// WebKit is the primary (Mark's iPad is WebKit); Chromium is read alongside it. Neither is the iPad.
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const FILE = path.resolve(process.argv[2]);
const engines = { webkit: await webkit.launch(), chromium: await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }) };
const CASES = [['safari630', 630, 900], ['chrome672', 672, 960]]; const GAP = 20; const res = {};
for (const [name, br] of Object.entries(engines)) {
  const ctx = await br.newContext({ viewport: { width: 1000, height: 1400 }, hasTouch: name === 'webkit', deviceScaleFactor: 1 }); const page = await ctx.newPage(); await page.emulateMedia({ media: 'print' });
  await page.goto('file://' + FILE); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);
  for (const [k, cw, H] of CASES) {
    const u = await page.evaluate((cw) => {
      const a = document.querySelector('article.recipe-page'); a.style.boxSizing = 'border-box'; a.style.width = (cw + 144) + 'px';
      const A = a.getBoundingClientRect(); const pt = parseFloat(getComputedStyle(a).paddingTop); const R = (e) => { const r = e.getBoundingClientRect(); return { t: +(r.top - A.top - pt).toFixed(2), b: +(r.bottom - A.top - pt).toFixed(2), h: +r.height.toFixed(2) }; };
      const t = a.querySelector('.ingredient-table'); const m = a.querySelector('.method-region'); const ol = m.querySelector('.mp-steps');
      // the closing foot (D28): a 12 px grotesk line, 1 px rule above, 6 px padding, 32 px margin above (the rules in sheetpages.py), put after step 10 to read its height
      const probe = document.createElement('div'); probe.className = 'mp-foot'; probe.style.cssText = 'margin-top:var(--gap-l);padding-top:var(--gap-xs);border-top:var(--rule-ink-field) solid var(--sheet-ink);font-family:var(--face-grotesk);font-size:var(--sheet-size-small-print);letter-spacing:0.02em'; probe.textContent = 'Olive Oil Ice Cream · Version 1 · 50 g oil · 800 g · K7QM-2X9D'; m.appendChild(probe);
      const foot = R(probe); probe.remove();
      const side = a.querySelector('.formulation-note-region'); side.style.alignSelf = 'start'; a.querySelector('.side-region').style.alignSelf = 'start';
      return { band: R(a.querySelector('.recipe-band')), before: R(a.querySelector('.before-region')), head: R(a.querySelector('.ingredient-table-region .region-name')), thead: R(t.querySelector('thead')), groups: [...t.querySelectorAll('tbody')].map((g) => ({ ...R(g), label: g.querySelector('.ingredient-table__step-head').textContent.trim().slice(0, 40), rows: g.querySelectorAll('tr').length })),
        tfoot: R(t.querySelector('tfoot')), balHead: R(side.querySelector('.region-name')), gauges: [...side.querySelectorAll('.formulation-note__rule')].map((g) => ({ ...R(g), label: g.querySelector('.graduated-rule__label-word').textContent })), basis: R(side.querySelector('.basis-note')),
        mHead: R(m.querySelector('.region-name')), mHeadMB: parseFloat(getComputedStyle(m.querySelector('.region-name')).marginBottom), steps: [...ol.children].map((s) => R(s).h), foot, gridGap: getComputedStyle(a).rowGap };
    }, cw);
    // lay the pages
    const G = u.groups, fits = (b) => b <= H + 0.01; let kk = 0; while (kk < G.length && fits(G[kk].b)) kk++; let gg = 0; while (gg < u.gauges.length && fits(u.gauges[gg].b)) gg++;
    const p1Left = kk ? G[kk - 1].b : u.thead.b; const p1Right = gg ? u.gauges[gg - 1].b : u.balHead.b; const p1Used = Math.max(p1Left, p1Right);
    const tailLeft = G.length > kk ? u.thead.h + (u.tfoot.b - G[kk].t) : 0; const tailRight = gg < u.gauges.length ? u.basis.b - u.gauges[gg].t : u.basis.h; const row = Math.max(tailLeft, tailRight);
    const pages = [[]]; let used = row + GAP + u.mHead.h + u.mHeadMB; let tailUsed = used, pi = 0;
    u.steps.forEach((h, i) => { const add = h + (pages[pi].length ? GAP : 0); if (used + add > H + 0.01 && pages[pi].length) { pi++; pages.push([]); used = 0; } used += pages[pi].length ? h + GAP : h; pages[pi].push(i + 1); if (pi === 0) tailUsed = used; });
    const footBottom = used + u.foot.h; const lastUsed = used;
    res[name + '_' + k] = { box: [cw, H], groupsOnPage1: kk, groupNames: G.map((g) => g.label), gaugesOnPage1: gg, page1UsedLeft: p1Left, page1UsedRight: p1Right, page1Used: p1Used, page1Spare: +(H - p1Used).toFixed(1), nextGroupBottom: G[kk] ? G[kk].b : null, nextGaugeBottom: u.gauges[gg] ? u.gauges[gg].b : null,
      tail: { left: +tailLeft.toFixed(1), right: +tailRight.toFixed(1), row: +row.toFixed(1), stepsStart: +(row + GAP + u.mHead.h + u.mHeadMB).toFixed(1) }, stepPages: pages.map((p) => p.length ? `${p[0]}-${p.at(-1)}` : ''), tailUsed: +tailUsed.toFixed(1), tailSpare: +(H - tailUsed).toFixed(1), nextStepH: u.steps[pages[0].length] ?? null,
      lastPageUsed: +lastUsed.toFixed(1), footH: u.foot.h, footEnd: +footBottom.toFixed(1), lastSpare: +(H - footBottom).toFixed(1), units: { groupsB: G.map((g) => g.b), groupsH: G.map((g) => g.h), gaugesB: u.gauges.map((g) => g.b), gaugesH: u.gauges.map((g) => g.h), thead: u.thead.h, tfoot: u.tfoot.h, basis: u.basis.h, balHead: u.balHead.h, bandB: u.band.b, beforeB: u.before.b, head: u.head, steps: u.steps, mHead: u.mHead.h + u.mHeadMB } };
  }
  await ctx.close();
}
await engines.webkit.close(); await engines.chromium.close();
await writeFile(path.join(HERE, 'sheetpages-measure.json'), JSON.stringify(res, null, 1));
for (const [k, v] of Object.entries(res)) { const { units, ...rest } = v; console.log(k, JSON.stringify(rest)); }
process.exit(0);
