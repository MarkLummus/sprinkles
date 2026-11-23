// Sid, 2026-11-22 (Phase 12 round two, the three redraws): measures p12r2.py's panels in WebKit with a coarse pointer (or Chromium) and writes p12r2-measure.json; prints each
// panel's facts. Its own file, so p12g2-measure.json stays as it is.
//   node p12r2-measure.mjs <out>/measure.html [chromium] [shots dir]
// Per panel: its natural height, sideways overflow, the words and box of every control a person can see, and every line the redraws add or reword (its words, width, height, line
// count and type size).
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const FILE = path.resolve(process.argv[2]); const useChromium = process.argv[3] === 'chromium'; const SHOTS = process.argv[4];
const br = useChromium ? await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }) : await webkit.launch();
const ctx = await br.newContext({ viewport: { width: 1400, height: 1300 }, hasTouch: true, deviceScaleFactor: 1 }); const page = await ctx.newPage();
await page.goto('file://' + FILE); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(500);
if (SHOTS) await mkdir(SHOTS, { recursive: true });
const out = {}; const rows = [];
for (const pid of await page.$$eval('[data-pid]', (els) => els.map((e) => e.getAttribute('data-pid')))) {
  const m = await page.evaluate((pid) => {
    document.querySelectorAll('[data-pid]').forEach((e) => { e.style.display = e.getAttribute('data-pid') === pid ? 'block' : 'none'; });
    const root = document.querySelector('[data-pid="' + pid + '"]'); const R = root.getBoundingClientRect(); const r1 = (n) => Math.round(n * 10) / 10;
    const words = (e) => [...e.childNodes].filter((n) => !(n.classList && (n.classList.contains('dl-tab') || n.classList.contains('dl-flag')))).map((n) => n.textContent).join('').trim();
    const seen = [...root.querySelectorAll('.shell__main button, .shell__main a, .shell__main summary, .recipe-page button')].filter((e) => { const b = e.getBoundingClientRect(); return e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && b.bottom > R.top && b.top < R.bottom; });
    return { w: Math.round(R.width), h: Math.ceil(root.firstElementChild.getBoundingClientRect().height), overflowX: Math.max(0, Math.round(root.scrollWidth - R.width)),
      controls: seen.map((e) => { const b = e.getBoundingClientRect(); return [words(e).slice(0, 40), r1(b.width), r1(b.height)]; }),
      lines: [...root.querySelectorAll('.home__lead-draft, .notebook-version__draft, .place__note, .place__for, .pick__where, .pick__head .pen-caption')].map((e) => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); const lh = parseFloat(s.lineHeight) || parseFloat(s.fontSize) * 1.2; const range = document.createRange(); range.selectNodeContents(e); const tops = new Set([...range.getClientRects()].map((c) => Math.round(c.top)));
        return { cls: e.className, words: e.textContent, w: r1(b.width), h: r1(b.height), lines: tops.size, font: `${s.fontSize}/${s.fontWeight}`, color: s.color, lh: r1(lh) }; }) };
  }, pid);
  if (SHOTS) await page.locator(`[data-pid="${pid}"]`).screenshot({ path: path.join(SHOTS, pid + (useChromium ? '-chromium' : '') + '.png') });
  out[pid] = m;
  rows.push(`${pid}: ${m.w} x ${m.h}; ovx ${m.overflowX}; lines ${m.lines.map((l) => `[${l.cls}] "${l.words}" ${l.w} x ${l.h}, ${l.lines} line(s), ${l.font}`).join(' ; ')}; controls ${m.controls.map((c) => c.join(' ')).join(' | ')}`);
}
await br.close();
await writeFile(path.join(HERE, useChromium ? 'p12r2-measure-chromium.json' : 'p12r2-measure.json'), JSON.stringify(out, null, 1));
console.log(rows.join('\n')); process.exit(0);
