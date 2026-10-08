// Sid, 2026-10-07 (row draw-log-pages-vertical-space): measures the log pages' fit. For each engine (WebKit with a coarse pointer, Chromium) and each side:
//   natural content height with the foot, at Safari's content width 652 (limit 900) and Chrome's 696 (limit 960) with the D16 margin (0.75 in left, 0.5 in right); safari-old 675 and chrome-old 720 (the D8 margins) and safari-sym 630 and chrome-sym 672 (0.75 in both sides) for comparison; the board's own spare (816 x 1056, foot at the bottom); overflow to the right; smallest type; colours; boxes and lines.
//   node logfit-measure.mjs <dir from logfit.py>
import path from 'node:path';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const dir = path.resolve(process.argv[2]);
const GUARD = 2;   // D22: the page keeps 2 px clear of the content box's right edge, so WebKit's print does not clip the date box's right border; the content width is the case's width less this guard
const engines = { webkit: await webkit.launch(), chromium: await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }) };
for (const [n, br] of Object.entries(engines)) for (const f of ['p1.html', 'p2.html']) {
  const ctx = await br.newContext({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 1, hasTouch: n === 'webkit' }); const page = await ctx.newPage(); await page.emulateMedia({ media: 'print' }); await page.goto('file://' + path.join(dir, f)); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(200);
  const r = {};
  for (const [k, cw, lim, pl, pr] of [['safari', 630, 900, 72, 72], ['chrome', 672, 960, 72, 72], ['safari-d16', 652, 900, 72, 48], ['chrome-d16', 696, 960, 72, 48]]) {
    r[k] = await page.evaluate(([cw, pl, pr, GUARD]) => { const lf = document.querySelector('.lf'); lf.style.paddingLeft = pl + 'px'; lf.style.paddingRight = (pr + GUARD) + 'px'; lf.style.width = (cw + pl + pr) + 'px'; lf.style.height = 'auto'; const h = lf.getBoundingClientRect().height - 96; const body = lf.querySelector('.lf-body').getBoundingClientRect().height;
      const wrapped = [...lf.querySelectorAll('.lf-mrow, .lf-ghead')].filter((e) => e.getBoundingClientRect().height > 36).length; // D8 follow-on: the date box floats top right; clear = the gap between the box and whatever sits beside it (the title, the figure fields), and under = the first rule or row below the box starts at or below its bottom
      const bx = lf.querySelector('.lf-datebox').getBoundingClientRect(); const rr = (e) => { const g = document.createRange(); g.selectNodeContents(e); return g.getBoundingClientRect(); }; const beside = [...lf.querySelectorAll('.lf-title, .lf-field')].filter((e) => e.getBoundingClientRect().top < bx.bottom).map((e) => (e.classList.contains('lf-title') ? rr(e) : e.getBoundingClientRect()).right); const clear = Math.round((bx.left - Math.max(...beside)) * 10) / 10;
      return { h: Math.round(h * 10) / 10, body: Math.round(body * 10) / 10, ox: lf.scrollWidth - lf.clientWidth, wrapped, clear, boxH: Math.round(bx.height) }; }, [cw, pl, pr, GUARD]);
    r[k].lim = lim; r[k].spare = Math.round((lim - r[k].h) * 10) / 10;
  }
  r.board = await page.evaluate(() => { const lf = document.querySelector('.lf'); lf.style.paddingLeft = '72px'; lf.style.paddingRight = '74px'; lf.style.width = '816px'; lf.style.height = '1056px'; const foot = lf.querySelector('.lf-foot').getBoundingClientRect(); const b = lf.querySelector('.lf-body').getBoundingClientRect(); const fs = [...lf.querySelectorAll('*')].filter((e) => [...e.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim())).map((e) => parseFloat(getComputedStyle(e).fontSize));
    const cols = [...new Set([...lf.querySelectorAll('*')].flatMap((e) => { const s = getComputedStyle(e); return [s.color, s.borderBottomColor, s.borderTopColor].filter((c) => c !== 'rgba(0, 0, 0, 0)'); }))];
    return { spareAboveFoot: Math.round((foot.top - b.bottom) * 10) / 10, footBottom: Math.round(foot.bottom), minFont: Math.min(...fs), colours: cols, boxes: lf.querySelectorAll('.lf-box').length, lines: lf.querySelectorAll('.lf-line').length, stops: lf.querySelectorAll('.lf-stop').length }; });
  console.log(n, f, JSON.stringify(r)); await ctx.close();
}
await Promise.all(Object.values(engines).map((b) => b.close())); process.exit(0);
