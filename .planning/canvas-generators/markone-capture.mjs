// Sid, 2026-10-06, revised 2026-10-07 (D6a: a mark counts): captures the built app's batch log, because recordpen-capture.json (2026-10-04) predates the reading's tasting groups (quick 261005-txg) and the hand note (261005-wgz).
//   node markone-capture.mjs   -> markone-capture.json (keys state_W)
// WebKit, read from the preview server already on 127.0.0.1:4173 (the dist of 2026-10-06); no server is started here. Olive Oil v1 (its batch is tasted).
// States: pen (Record another, Add tasting pressed, nothing typed but the two dates: 2 and 4 Aug so no board carries the capture day);
//   pendraw, pentaste, penboth (the same pen with a mark in the draw group, in the tasting group, in both: Exit consistency Wet, soupy; Hardness 4 and the Greasy film chip);
//   readblank, readmarks, readscales (the log as it reads after a real Save batch through the pen: nothing in either group; the notes and marks of the old example; two scale marks and no note.
//   readnotes (2026-10-07, D9): the three notes of readmarks and no mark anywhere, so a pick can be drawn beside a written note.
//   The clock is fixed at 4 Aug 2026, the tasted date is left empty, and the fresh save's batch list and landing focus are stripped, so the three read as the seeded batch did.)
// 1366 coarse (the log is the 350 column beside the Sheet) and 393 coarse (the phone).
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const URL = 'http://127.0.0.1:4173/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const grab = () => { const log = document.querySelector('.notebook-log').cloneNode(true); const live = document.querySelector('.notebook-log');
  const lf = live.querySelectorAll('input, textarea'); const cf = log.querySelectorAll('input, textarea');
  lf.forEach((e, i) => { const c = cf[i]; if (e.tagName === 'TEXTAREA') c.textContent = e.value; else if (e.type === 'radio' || e.type === 'checkbox') { if (e.checked) c.setAttribute('checked', ''); else c.removeAttribute('checked'); } else c.setAttribute('value', e.value); });
  return log.outerHTML; };
// the pen's marks: draw = Exit consistency, taste = Hardness 4 and the Greasy film chip
const markDraw = async (p) => { await p.locator('.notebook-log label.segmented__option:has(input[value="Wet, soupy"])').click(); await p.waitForTimeout(150); };
const markTaste = async (p, chip) => { await p.locator('.notebook-log label.axis-mark__stop:has(input[name="axis-hardness"][value="4"])').click(); await p.waitForTimeout(150);
  if (chip) { await p.locator('.notebook-log button.chip-toggle', { hasText: 'Greasy film' }).click(); await p.waitForTimeout(150); } };
const openPen = async (p, tasted) => { await p.getByRole('button', { name: /record another/i }).first().click(); await p.waitForTimeout(300);
  await p.getByRole('button', { name: /add tasting/i }).first().click(); await p.waitForTimeout(300);
  const dates = p.locator('.notebook-log input[type=date]'); await dates.nth(0).fill('2026-08-02'); await dates.nth(1).fill(tasted ? '2026-08-04' : ''); await p.waitForTimeout(300); };
const fillMeasures = async (p) => { for (const [l, v] of [['Time to draw', '20'], ['Out of machine', '-6'], ['Churn duration', '30'], ['Tasting temperature', '-12'], ['Melt test', '3']]) await p.locator('.notebook-log input[aria-label^="' + l + '"]').fill(v); };
const strip = (html) => { // the fresh save's batch list (the first block, matched by depth) and landing focus, so the log reads as the seeded batch did
  const a = html.indexOf('<div class="batch-row__batch-list">'); let d = 0, i = a;
  for (const m of html.slice(a).matchAll(/<div\b|<\/div>/g)) { d += m[0] === '</div>' ? -1 : 1; if (d === 0) { i = a + m.index + 6; break; } }
  return (html.slice(0, a) + html.slice(i)).replace(' batch-row__head--after-list', '').replace(/ is-landing-focus" tabindex="-1" aria-label="[^"]*"/, '"'); };
const out = {}; const b = await webkit.launch();
const fresh = async (W) => { const ctx = await b.newContext({ viewport: { width: W, height: 1000 }, hasTouch: true, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); p.setDefaultTimeout(10000); await p.clock.setFixedTime(new Date('2026-08-04T12:00:00'));
  await p.goto(URL, { waitUntil: 'networkidle' }); await p.waitForSelector('.notebook-log'); await p.waitForTimeout(300); return [ctx, p]; };
const save = async (p) => { await p.locator('.notebook-log').getByRole('button', { name: /save batch/i }).click(); await p.waitForTimeout(700);
  for (const name of [/^batch/i, /^tasting/i]) { const f = p.locator('.notebook-log .fold-row').filter({ hasText: name }).first(); if (await f.count()) { if ((await f.getAttribute('aria-expanded')) === 'false') { await f.click(); await p.waitForTimeout(200); } } } };
for (const W of [1366, 393]) {
  for (const [key, draw, taste, chip] of [['pen', 0, 0, 0], ['pendraw', 1, 0, 0], ['pentaste', 0, 1, 1], ['penboth', 1, 1, 1]]) {
    const [ctx, p] = await fresh(W); await openPen(p, true);
    if (draw) await markDraw(p); if (taste) await markTaste(p, chip);
    await p.evaluate(() => document.fonts.ready); out[`${key}_${W}`] = await p.evaluate(grab); await ctx.close();
  }
  for (const key of ['readblank', 'readmarks', 'readscales', 'readnotes']) {
    const [ctx, p] = await fresh(W); await openPen(p, false); await fillMeasures(p);
    if (key === 'readmarks' || key === 'readnotes') {
      await p.locator('.notebook-log textarea[aria-label="At the machine"]').fill('Soft, not greasy');
      await p.locator('.notebook-log textarea[aria-label="Ingredient notes"]').fill('oil bottle opened 24 Jul');
      await p.locator('.notebook-log textarea[aria-label="How did it turn out?"]').fill('Soft, not greasy. The oil is strong.');
      if (key === 'readmarks') {
        await p.locator('.notebook-log label.axis-mark__stop:has(input[name="axis-sweetness"][value="4"])').click();
        await p.locator('.notebook-log label.axis-mark__stop:has(input[name="axis-oil"][value="4"])').click();
        await p.locator('.notebook-log button.chip-toggle', { hasText: 'Bitter' }).click();
      }
    }
    if (key === 'readscales') { await markDraw(p); await markTaste(p, false); }
    await save(p); await p.evaluate(() => document.fonts.ready); out[`${key}_${W}`] = strip(await p.evaluate(grab)); await ctx.close();
  }
}
await b.close();
await writeFile(path.join(HERE, 'markone-capture.json'), JSON.stringify(out));
console.log(Object.entries(out).map(([k, v]) => k + ' ' + v.length).join('\n')); process.exit(0);
