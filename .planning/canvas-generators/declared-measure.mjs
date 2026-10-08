// Sid, 2026-10-07 (row draw-recipe-declared-notation; README D25): measures declared.py's probe (every app panel at its natural size) in WebKit with a coarse pointer (or Chromium), and writes declared-measure.json:
// per panel the crop (the .axes-grid of the pen, the .tasting-reading section of the reading: top and height) and each marked element's top and height, relative to the panel; the board draws its gutter bars from these.
//   node declared-measure.mjs <dir holding declared-probe.html> [chromium]
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(process.argv[2]); const useChromium = process.argv[3] === 'chromium';
const br = useChromium ? await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }) : await webkit.launch();
const ctx = await br.newContext({ viewport: { width: 1400, height: 1000 }, hasTouch: true, deviceScaleFactor: 1 }); const page = await ctx.newPage();
await page.goto('file://' + path.join(DIR, 'declared-probe.html')); await page.waitForTimeout(400);
const pids = await page.$$eval('[data-pid]', (els) => els.map((e) => e.getAttribute('data-pid')));
const out = {};
for (const pid of pids) {
  out[pid] = await page.evaluate((pid) => {
    document.querySelectorAll('[data-pid]').forEach((e) => { e.style.display = e.getAttribute('data-pid') === pid ? 'block' : 'none'; });
    const root = document.querySelector('[data-pid="' + pid + '"]'); const R = root.getBoundingClientRect(); const r1 = (n) => Math.round(n * 10) / 10;
    const c = root.querySelector('.' + root.getAttribute('data-crop')).getBoundingClientRect();
    const tags = [...root.querySelectorAll('[data-gd]')].map((e) => { const b = e.getBoundingClientRect(); const [kind, label] = e.getAttribute('data-gd').split('|'); return { kind, label, top: r1(b.top - R.top), h: r1(b.height), text: e.textContent.trim().slice(0, 60) }; });
    const words = [...root.querySelectorAll('.axis-mark__name, .chip-toggle, .batch-row__cell-label, .tasting-reading__problems, .axes-cue, .batch-row__group-label')].map((e) => e.textContent.trim());
    return { w: Math.round(R.width), h: Math.ceil(R.height), cropTop: Math.floor(c.top - R.top) - 8, cropH: Math.ceil(c.height) + 16, overflowX: Math.max(0, Math.round(root.scrollWidth - R.width)), tags, words };
  }, pid);
}
await br.close();
await writeFile(path.join(HERE, useChromium ? 'declared-measure-chromium.json' : 'declared-measure.json'), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k, v.w, 'crop', v.cropTop, v.cropH, 'ovx', v.overflowX, v.tags.map((t) => t.kind + ':' + t.text.slice(0, 14) + '@' + t.top + '+' + t.h).join(' | '));
process.exit(0);
