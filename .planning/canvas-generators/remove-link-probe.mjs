// Sid, 2026-10-03 (Mark: "1600-pen: the remove link on Whole milk ... is below all the other lines instead of being next to estimated").
// Measures the real built app: Olive Oil v1, Next version pen open, the split rows (Whole milk 120 + 250.4, Sucrose 12 + 64): where the remove link sits against the name, the estimated tag and the portion line.
//   node remove-link-probe.mjs -> remove-link-probe.json
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OLIVE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89';
const WIDTHS = [393, 723, 744, 984, 1024, 1366, 1600];
const servers = await startServers(); const out = [];
for (const [eng, launch] of (process.env.ENG === 'chrome' ? [['chrome', () => chromium.launch({ channel: 'chrome' })]] : [['webkit', () => webkit.launch()]])) {
  const browser = await launch();
  for (const coarse of (process.env.ENG === 'chrome' ? [false] : [true])) for (const W of (process.env.ENG === 'chrome' ? [393, 1024, 1600] : WIDTHS)) {
    const ctx = await browser.newContext({ viewport: { width: W, height: 1000 }, hasTouch: coarse, isMobile: false, deviceScaleFactor: 1 });
    await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
    const page = await ctx.newPage(); page.setDefaultTimeout(15000); console.error(eng, coarse, W);
    await page.goto(servers.appUrl + OLIVE, { waitUntil: 'networkidle' }); await page.waitForSelector('.ingredient-table');
    await page.getByRole('button', { name: 'Next version' }).first().click(); await page.getByLabel('Salt, grams', { exact: true }).waitFor().catch(() => {});
    await page.waitForTimeout(150);
    const rows = await page.evaluate(() => [...document.querySelectorAll('.ingredient-table tbody > tr')].filter((tr) => tr.querySelector('.ingredient-table__portion-note') && tr.querySelector('.ingredient-table__col-name button')).map((tr) => {
      const n = tr.querySelector('.ingredient-table__col-name'); const nr = n.getBoundingClientRect(); const btn = n.querySelector('button').getBoundingClientRect();
      const note = n.querySelector('.ingredient-table__portion-note'); const noteR = note.getBoundingClientRect(); const chip = n.querySelector('.target-chip'); const chipR = chip && chip.getBoundingClientRect();
      const first = document.createRange(); first.selectNodeContents(n.firstChild); const fr = first.getClientRects()[0];
      return { name: n.firstChild.textContent.trim(), noteDisplay: getComputedStyle(note).display, nameLineTop: Math.round(fr.top - nr.top), chipTop: chipR && Math.round(chipR.top - nr.top), noteTop: Math.round(noteR.top - nr.top), btnTop: Math.round(btn.top - nr.top), btnLeft: Math.round(btn.left - nr.left), onNameLine: btn.top < noteR.top, cellH: Math.round(nr.height), cellW: Math.round(nr.width) };
    }));
    out.push({ eng, coarse, W, rows });
    await ctx.close();
  }
  await browser.close();
}
await servers.close();
await writeFile(path.join(HERE, 'remove-link-probe-' + (process.env.ENG || 'webkit') + '.json'), JSON.stringify(out, null, 1));
for (const o of out) console.log(o.eng, o.coarse ? 'coarse' : 'fine', o.W, JSON.stringify(o.rows.map((r) => [r.name, r.noteDisplay, 'btnTop', r.btnTop, 'noteTop', r.noteTop, r.onNameLine ? 'ON NAME LINE' : 'below note'])));
