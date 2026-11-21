// Sid, 2026-11-21 (Phase 12 Gate 2): measures p12g2.py's panels in WebKit with a coarse pointer (or Chromium) and writes p12g2-measure.json; prints each panel's facts, which is the
// board-against-build check for what the boards keep as built and the proof of what they leave out.
//   node p12g2-measure.mjs <out>/measure.html [chromium] [shots dir]
// Per panel: its natural height (desk panels), sideways overflow, the words of every control a person can see, and, on a panel with Tab numbers, the order Tab really walks
// in this engine against the numbers drawn on it. Per region kept as built: its width against the built app's (p12g2-capture.json).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const FILE = path.resolve(process.argv[2]); const useChromium = process.argv[3] === 'chromium'; const SHOTS = process.argv[4];
const CAP = JSON.parse(await readFile(path.join(HERE, 'p12g2-capture.json'), 'utf8'));
const br = useChromium ? await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }) : await webkit.launch();
const ctx = await br.newContext({ viewport: { width: 1400, height: 1100 }, hasTouch: true, deviceScaleFactor: 1 }); const page = await ctx.newPage();
await page.goto('file://' + FILE); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(500);
if (SHOTS) await mkdir(SHOTS, { recursive: true });
const out = {}; const rows = [];
for (const pid of await page.$$eval('[data-pid]', (els) => els.map((e) => e.getAttribute('data-pid')))) {
  const m = await page.evaluate((pid) => {
    document.querySelectorAll('[data-pid]').forEach((e) => { e.style.display = e.getAttribute('data-pid') === pid ? 'block' : 'none'; });
    const root = document.querySelector('[data-pid="' + pid + '"]'); const R = root.getBoundingClientRect(); const r1 = (n) => Math.round(n * 10) / 10;
    const words = (e) => [...e.childNodes].filter((n) => !(n.classList && n.classList.contains('dl-tab'))).map((n) => n.textContent).join('').trim();
    const seen = [...root.querySelectorAll('button, a, summary')].filter((e) => { const b = e.getBoundingClientRect(); return e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && b.bottom > R.top && b.top < R.bottom && b.right > R.left && b.left < R.right; });
    const W = (sel) => { const e = root.querySelector(sel); return e ? r1(e.getBoundingClientRect().width) : null; };
    return { w: Math.round(R.width), h: Math.ceil(root.firstElementChild.getBoundingClientRect().height), overflowX: Math.max(0, Math.round(root.scrollWidth - R.width)), controls: seen.map(words),
      small: seen.filter((e) => e.closest('.shell__main') || !root.querySelector('.shell__main')).map((e) => { const b = e.getBoundingClientRect(); return [words(e), r1(b.width), r1(b.height)]; }).filter((x) => x[2] < 44 && !/^(Sprinkles)$/.test(x[0])),
      ingW: W('.ingredient-table-region'), methodW: W('.method-region'), discs: [...root.querySelectorAll('.dl-tab')].length,
      notes: [...root.querySelectorAll('.notebook-version__draft, .place__note')].map((e) => { const b = e.getBoundingClientRect(); return [e.textContent, r1(b.width), r1(b.height), getComputedStyle(e).fontSize]; }) };
  }, pid);
  const tabs = +(await page.getAttribute(`[data-pid="${pid}"]`, 'data-tabs'));
  if (tabs) {      // walk Tab from the first numbered control; each stop must carry the next number
    const walk = await page.evaluate(() => { const root = [...document.querySelectorAll('[data-pid]')].find((e) => e.style.display === 'block'); const first = root.querySelector('button, textarea'); first.focus(); return true; });
    const got = [];
    for (let i = 0; i < tabs; i++) { got.push(await page.evaluate(() => { const e = document.activeElement; const d = e.tagName === 'BUTTON' ? e.querySelector('.dl-tab') : e.previousElementSibling; return d && d.classList.contains('dl-tab') ? +d.textContent : null; })); await page.keyboard.press('Tab'); }
    m.tabOrder = got.every((n, i) => n === i + 1) ? 'equal' : 'DIFFERS ' + JSON.stringify(got); void walk;
  }
  if (SHOTS) await page.locator(`[data-pid="${pid}"]`).screenshot({ path: path.join(SHOTS, pid + (useChromium ? '-chromium' : '') + '.png') });
  out[pid] = m;
  rows.push(`${pid}: ${m.w} x ${m.h}; ovx ${m.overflowX}; ${m.ingW ? 'ing ' + m.ingW + ' / built ' + CAP.ed_base.ingW + '; ' : ''}${m.methodW ? 'method ' + m.methodW + ' / built ' + CAP.ed_base.methodW + '; ' : ''}${tabs ? `Tab order of ${tabs} ${m.tabOrder}, ${m.discs} discs; ` : ''}${m.notes.length ? 'lines ' + JSON.stringify(m.notes) + '; ' : ''}controls ${m.controls.join(' | ')}${m.small.length ? '; under 44 high: ' + m.small.map((s) => s.join(' ')).join(', ') : ''}`);
}
await br.close();
await writeFile(path.join(HERE, useChromium ? 'p12g2-measure-chromium.json' : 'p12g2-measure.json'), JSON.stringify(out, null, 1));
console.log(rows.join('\n')); process.exit(0);
