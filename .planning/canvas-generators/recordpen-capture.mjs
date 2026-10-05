// Sid, 2026-10-04 (decision 40): captures the built app's batch log in three states for the record-pen App-context boards.
//   node recordpen-capture.mjs   -> recordpen-capture.json (keys state_W)
// WebKit, read from the preview server already on 127.0.0.1:4173 (the dist after quick 261004-ly7); no server is started here. Olive Oil v1 (its batch is tasted: the reading state).
// States: read (the log as it reads), blank (the pen open from Record another, the tasting not yet added), filled (Add tasting pressed, every field typed, stops, segments and two defects picked,
// the churn and tasting dates set to 2 and 4 Aug so no board carries the day it was captured). 1366 coarse (the log is the 350 column beside the Sheet) and 393 coarse (the phone).
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
const fill = async (p, label, v) => { await p.getByLabel(label).first().fill(v); };
const out = {}; const b = await webkit.launch();
for (const W of [1366, 393]) for (const state of ['read', 'blank', 'filled']) {
  const ctx = await b.newContext({ viewport: { width: W, height: 1000 }, hasTouch: true, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); p.setDefaultTimeout(10000);
  await p.goto(URL, { waitUntil: 'networkidle' }); await p.waitForSelector('.notebook-log'); await p.waitForTimeout(300);
  if (W === 393 && state === 'read') { /* the phone's log as it opens: folds closed */ }
  if (state !== 'read') {
    await p.getByRole('button', { name: /record another/i }).first().click(); await p.waitForTimeout(300);
    if (state === 'filled') {
      await p.getByRole('button', { name: /add tasting/i }).first().click(); await p.waitForTimeout(300);
      await fill(p, 'Time to draw temp., minutes', '12'); await fill(p, 'Out of machine, degrees Celsius', '-6'); await fill(p, 'Churn duration, minutes', '30');
      await fill(p, 'At the machine', 'bowl frozen overnight'); await fill(p, 'Ingredient notes', 'oil bottle opened 24 Jul');
      await fill(p, 'Tempering, minutes', '10'); await fill(p, 'Tasting temperature, degrees Celsius', '-12'); await fill(p, 'How did it turn out?', 'Soft, not greasy. The oil is strong.');
      await fill(p, 'Melt test, g lost at 20 min', '3'); await fill(p, 'Next time', 'churn 2 min longer');
      const seg = p.locator('.segmented__option'); await seg.nth(0).click(); await seg.nth(4).click(); await seg.nth(7).click();
      const stops = p.locator('.axis-mark__stop'); await stops.nth(2).click(); await stops.nth(8).click(); await stops.nth(14).click(); await stops.nth(18).click();
      await p.getByRole('button', { name: /coarse, icy/i }).click(); await p.getByRole('button', { name: /bitter/i }).click();
    }
    const dates = p.locator('.notebook-log input[type=date]'); await dates.nth(0).fill('2026-08-02'); if (state === 'filled') await dates.nth(1).fill('2026-08-04');
    await p.waitForTimeout(300);
  }
  await p.evaluate(() => document.fonts.ready); out[`${state}_${W}`] = await p.evaluate(grab);
  await ctx.close();
}
await b.close();
await writeFile(path.join(HERE, 'recordpen-capture.json'), JSON.stringify(out));
console.log(Object.entries(out).map(([k, v]) => k + ' ' + v.length).join('\n')); process.exit(0);
