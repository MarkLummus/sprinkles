// Sid, 2026-10-07 (D14): the reading's order checked in the DOM, not by eye. For every reading panel (r1 to r5, 350 and 393) it lists the labels in document order, then closes the Tasting fold
// (display none on its panel) and measures what is still on the page.
//   node markone-order.mjs <dir holding markone-probe.html> [chromium]
import path from 'node:path';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const DIR = path.resolve(process.argv[2]); const useChromium = process.argv[3] === 'chromium';
const br = useChromium ? await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }) : await webkit.launch();
const ctx = await br.newContext({ viewport: { width: 1400, height: 1000 }, hasTouch: true, deviceScaleFactor: 1 }); const page = await ctx.newPage();
await page.goto('file://' + path.join(DIR, 'markone-probe.html')); await page.waitForTimeout(400);
const pids = (await page.$$eval('[data-pid]', (els) => els.map((e) => e.getAttribute('data-pid')))).filter((p) => /^r\d-/.test(p));
const DRAW = ['Out of machine', 'Churn duration'];   // D17: Time to draw temp. is dropped
const exp = { r1: [...DRAW, 'At draw', 'Tempering', 'Tasting temperature', 'Melt test', 'Melt style', 'From freezer', 'Next time'],
  r2: [...DRAW, 'At draw', 'Tempering', 'Tasting temperature', 'Melt test', 'Melt style', 'From freezer', 'Next time'],
  r3: [...DRAW, '[note]', '[note]', 'At draw', 'Tempering', 'Tasting temperature', '[note]', 'Melt test', 'Melt style', 'From freezer', 'Next time'],
  r4: [...DRAW, '[note]', '[note]', 'Exit consistency', 'Airiness', 'Tempering', 'Tasting temperature', '[note]', 'Melt test', 'Melt style', '[scales]', 'Any problems?', 'Next time'],
  r5: [...DRAW, 'Exit consistency', 'Airiness', 'Tempering', 'Tasting temperature', 'Melt test', 'Melt style', '[scales]', 'Next time'] };
let bad = 0;
for (const pid of pids) {
  const r = await page.evaluate((pid) => {
    document.querySelectorAll('[data-pid]').forEach((e) => { e.style.display = e.getAttribute('data-pid') === pid ? 'block' : 'none'; });
    const root = document.querySelector('[data-pid="' + pid + '"]');
    const seq = []; const fold = root.querySelector('[id^="fold-tasting"]'); const sec = root.querySelector('.tasting-reading');
    root.querySelectorAll('.batch-row__cell-label, .batch-row__note, .tasting-reading__note, .batch-row__group-label, .tasting-reading__axes').forEach((e) => {
      if (e.closest('.fold-row')) return;
      if (e.matches('.batch-row__note, .tasting-reading__note')) seq.push('[note]');
      else if (e.matches('.tasting-reading__axes')) { if (!seq.includes('[scales]')) seq.push('[scales]'); }
      else if (e.closest('.tasting-reading__axes')) return;
      else if (e.matches('.batch-row__group-label--cue')) return;
      else seq.push(e.textContent.trim());
    });
    const nt = [...root.querySelectorAll('.batch-row__group-label')].find((e) => e.textContent.trim() === 'Next time'); const R = root.getBoundingClientRect();
    const before = Math.round(nt.getBoundingClientRect().top - R.top);
    const outside = !fold.contains(nt) && !sec.contains(nt);
    fold.style.display = 'none';
    const R2 = root.getBoundingClientRect(); const t2 = nt.getBoundingClientRect();
    return { seq, outside, visibleClosed: t2.height > 0 && t2.bottom <= R2.bottom, closedH: Math.round(R2.height), nextTopOpen: before };
  }, pid);
  const e = exp[pid.split('-')[0]]; const norm = r.seq.map((s) => (s === 'Any problems?' ? s : s));
  const ok = JSON.stringify(norm) === JSON.stringify(e) && r.outside && r.visibleClosed;
  if (!ok) { bad++; console.log('MISMATCH', pid, '\n got', JSON.stringify(norm), '\n exp', JSON.stringify(e)); }
  console.log(pid, ok ? 'ok' : 'FAIL', 'nextOutsideFold', r.outside, 'visibleWithFoldClosed', r.visibleClosed, 'closedH', r.closedH);
}
await br.close(); console.log(bad ? bad + ' failed' : 'all ' + pids.length + ' panels in order'); process.exit(bad ? 1 : 0);
