// Sid, 2026-10-23 (decide-p10-control-text-size, held by Mark for the board): the pen's choice controls at one size, measured in the real app.
// Serves a scratch build (PROBE_DIST) on an ephemeral 127.0.0.1 port through 08-walk-server.mjs; never 4173, no Vite. Playwright WebKit at
// 1366 x 744 coarse (the iPad's engine, width and pointer), 1366 x 744 fine and 393 x 852 coarse. The record pen with its tasting is filled as
// p-pen-rhythm-capture.mjs fills it (Mexican Chocolate v4). For each candidate rule set (as built 13/15; both 15; both 14; 15 with the pen's
// --sheet-seg-pad-x at --gap-xs) it injects the rules as a <style> and reads every segmented control in the pen (its column width, each option's
// box, the options' summed width, the rows it takes), every axis stop's size and box, and the pen's height; it also screenshots the churn and
// tasting choice controls of each candidate into p-pen-rhythm-shots/.   PROBE_DIST=<dist> node p-pen-rhythm-size-probe.mjs -> p-pen-rhythm-size-probe.json
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(HERE, 'p-pen-rhythm-shots'); await mkdir(SHOTS, { recursive: true });
const PEN = '.notebook-log .batch-margin--pen';
export const CANDIDATES = {
  b: '',
  s15: `${PEN} .axis-mark__stop, ${PEN} .segmented__option { font-size: var(--sheet-size-table-body); }`,
  s14: `${PEN} .axis-mark__stop, ${PEN} .segmented__option { font-size: var(--app-size-meta); }`,
  s15p: `${PEN} .axis-mark__stop, ${PEN} .segmented__option { font-size: var(--sheet-size-table-body); }\n${PEN} { --sheet-seg-pad-x: var(--gap-xs); }`,
};
const CONFIGS = [['1366c', 1366, 744, true], ['1366f', 1366, 744, false], ['393c', 393, 852, true]];
const servers = await startServers({ appRoot: process.env.PROBE_DIST });
const browser = await webkit.launch();
const out = {};
for (const [cfg, W, H, coarse] of CONFIGS) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: coarse });
  await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await ctx.newPage();
  const log = () => page.locator('.notebook-log');
  const settle = (ms = 350) => page.waitForTimeout(ms);
  await page.goto(servers.appUrl + '/notebook/mexican-chocolate/mexican-chocolate-v4', { waitUntil: 'networkidle' });
  await page.waitForSelector('.notebook-log'); await page.evaluate(() => document.fonts.ready); await settle();
  for (let i = 0; i < 4 && !(await log().locator('.batch-margin--pen').count()); i++) { await log().getByRole('button', { name: /record a batch/i }).first().click(); await settle(); }
  await log().locator('input[type="date"]').first().fill('2026-10-18');
  await log().getByLabel('Out of machine').fill('-7');
  await log().getByLabel('Churn duration').fill('28');
  await log().getByLabel('At the machine').fill('Soft, held its shape');
  await log().getByLabel('Ingredient notes').fill('Cocoa tin opened 1 Oct');
  await log().locator('.segmented__option', { hasText: 'Smooth ribbon' }).click();
  await log().locator('.segmented__option', { hasText: 'Medium, standard' }).click();
  await log().getByRole('button', { name: /add tasting/i }).first().click(); await settle();
  await log().locator('input[type="date"]').nth(1).fill('2026-10-19');
  await log().getByLabel('Tempering').fill('10');
  await log().getByLabel('Tasting temperature').fill('-12');
  await log().getByLabel('How did it turn out?').fill('Rich, a chalky finish');
  await log().getByLabel('Melt test').fill('4');
  await log().locator('.segmented__option', { hasText: 'Creamy puddle' }).click();
  await log().getByLabel('Next time').fill('Less cinnamon');
  await log().locator('.axis-mark').nth(0).locator('.axis-mark__stop').nth(3).click();
  await log().locator('.axis-mark').nth(2).locator('.axis-mark__stop').nth(1).click();
  await log().locator('.chip-toggle').first().click();
  await settle();
  const pointer = await page.evaluate(() => matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine');
  out[cfg] = { width: W, pointer, candidates: {} };
  for (const [cand, css] of Object.entries(CANDIDATES)) {
    await page.evaluate((css) => { let s = document.getElementById('sid-cand'); if (!s) { s = document.createElement('style'); s.id = 'sid-cand'; document.head.appendChild(s); } s.textContent = css; }, css);
    await settle(120);
    const m = await page.evaluate(() => {
      const pen = document.querySelector('.notebook-log .batch-margin--pen'); const pr = pen.getBoundingClientRect();
      const nameOf = (seg) => { const f = seg.closest('.segmented-field'); const h = f && f.querySelector('.segmented-field__head'); return (h ? h.querySelector('.pen-caption, .axes-cue, span') : f && f.querySelector('.pen-caption'))?.textContent.trim().slice(0, 24) || seg.closest('.field-row__label')?.querySelector('.pen-caption')?.textContent.trim().slice(0, 24) || '?'; };
      const segs = [...pen.querySelectorAll('.segmented')].map((seg) => {
        const r = seg.getBoundingClientRect(); const opts = [...seg.querySelectorAll('.segmented__option')];
        const boxes = opts.map((o) => { const b = o.getBoundingClientRect(); return { text: o.textContent.trim(), w: +b.width.toFixed(1), h: +b.height.toFixed(1), top: +(b.top - pr.top).toFixed(1), size: getComputedStyle(o).fontSize, padX: getComputedStyle(o).paddingLeft }; });
        const rows = new Set(boxes.map((b) => Math.round(b.top))).size;
        const sum = boxes.reduce((a, b) => a + b.w, 0) - (opts.length - 1) * 1;      // the shared hairlines overlap by 1 (margin-right -1)
        return { name: nameOf(seg), column: +r.width.toFixed(1), options: boxes, sum: +sum.toFixed(1), rows, top: +(r.top - pr.top).toFixed(1), height: +r.height.toFixed(1) };
      });
      const stops = [...pen.querySelectorAll('.axis-mark__stop')].map((s) => { const b = s.getBoundingClientRect(); return { w: +b.width.toFixed(1), h: +b.height.toFixed(1), size: getComputedStyle(s).fontSize }; });
      const fields = [...pen.querySelectorAll('.ink-field')].map((f) => getComputedStyle(f).fontSize);
      const cues = [...pen.querySelectorAll('.axes-cue')].map((f) => getComputedStyle(f).fontSize + '/' + getComputedStyle(f).fontWeight);
      const first = (sel) => { const e = pen.querySelector(sel); const b = e.getBoundingClientRect(); return { top: +(b.top - pr.top).toFixed(1), bottom: +(b.bottom - pr.top).toFixed(1) }; };
      return { penHeight: +pr.height.toFixed(1), penTop: +(pr.top + scrollY).toFixed(1), penLeft: +pr.left.toFixed(1), penWidth: +pr.width.toFixed(1), segs, stops: { n: stops.length, sizes: [...new Set(stops.map((s) => s.size))], boxes: [...new Set(stops.map((s) => s.w + 'x' + s.h))] }, fields: [...new Set(fields)], cues: [...new Set(cues)],
        churn: { from: first('.mo-group[data-mo="atdraw"]').top, to: first('.mo-end') ? first('.mo-end').top : null },
        atdraw: first('.mo-group[data-mo="atdraw"]'), axes: first('.axes-grid') };
    });
    out[cfg].candidates[cand] = m;
    // screenshots: the churn choice controls (At draw to the Tasting head) and the tasting's (Melt style to the first axis)
    const segTops = m.segs.map((s) => s.top);
    const crop = async (name, y0, y1) => {
      await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, m.penTop + y0 - 8 - 80));      // 80 clears the sticky header bar (57 at 1366) so the crop's top is not under it
      await settle(150);
      const pr = await page.evaluate(() => { const r = document.querySelector('.notebook-log .batch-margin--pen').getBoundingClientRect(); return { top: r.top, left: r.left, width: r.width }; });
      const top = pr.top + y0 - 8; const h = Math.min(y1 - y0 + 16, H - 10);
      if (top < 0 || top + h > H) return;
      await page.screenshot({ path: path.join(SHOTS, `${cfg}-${cand}-${name}.png`), clip: { x: Math.max(0, pr.left - 8), y: top, width: pr.width + 16, height: h } });
    };
    await crop('churn', segTops[0], m.segs[2].top + m.segs[2].height);
    await crop('tasting', m.segs[3].top, m.axes.top + 140);
  }
  await ctx.close();
}
await writeFile(path.join(HERE, 'p-pen-rhythm-size-probe.json'), JSON.stringify(out, null, 1));
for (const [cfg, c] of Object.entries(out)) for (const [cand, m] of Object.entries(c.candidates)) {
  console.log(`${cfg} ${c.pointer} ${cand}: pen ${m.penHeight} tall, stops ${m.stops.sizes.join('/')} ${m.stops.boxes.join('/')}, fields ${m.fields.join('/')}, cues ${m.cues.join('/')}`);
  for (const s of m.segs) console.log(`   ${s.name.padEnd(18)} ${String(s.rows).padStart(1)} row${s.rows > 1 ? 's' : ' '}  sum ${String(s.sum).padStart(6)} / col ${s.column}  opt ${s.options[0].size} pad ${s.options[0].padX}  [${s.options.map((o) => o.w + 'x' + o.h).join(' ')}]`);
}
await browser.close(); await servers.close(); process.exit(0);
