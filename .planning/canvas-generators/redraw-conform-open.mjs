// Sid, 2026-10-04 (decision 41, question 2): the fly-out drawn open (744-, 984- and 1366-sticky-nav) against the built app's own open fly-out, WebKit, coarse pointer, the window the board draws (1366 x 954, 984 x 768, 744 x 1133).
//   node redraw-conform-open.mjs <dir holding the snapshot boards>   -> prints every difference; "checks N off M"
// The build side: the preview server on 127.0.0.1:4173, the menu button pressed; the panel, the scrim, the bar and the places are measured from the window's top left. The board side: the right-hand panel (fp-sticky1-W) from its window's top left.
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const DIR = process.argv[2];
const SPECS = [[744, 1133, '744-sticky-nav', 1400], [984, 768, '984-sticky-nav', 2800], [1366, 954, '1366-sticky-nav', 640]];
const PROPS = ['display', 'position', 'zIndex', 'backgroundColor', 'boxShadow', 'fontWeight', 'borderTopLeftRadius', 'color', 'paddingLeft', 'height', 'width'];
const SEL = ['.shell__head', '.shell__menu', '.shell__brand', '.shell__tools', '.shell__rail--open', '.shell__scrim', '.shell__rail--open .shell__place', '.shell__rail--open .shell__place[aria-current="page"]'];
const measure = ([SEL, PROPS, rootSel, originSel]) => { const root = document.querySelector(rootSel); const o0 = originSel ? document.querySelector(originSel).getBoundingClientRect() : { x: 0, y: 0 }; const out = {};
  for (const s of SEL) out[s] = [...root.querySelectorAll(s)].filter((e) => e.getClientRects().length).slice(0, 8).map((e) => { const b = e.getBoundingClientRect(); const c = getComputedStyle(e); const r = { x: +(b.x - o0.x).toFixed(1), y: +(b.y - o0.y).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; for (const p of PROPS) r[p] = c[p]; return r; });
  return out; };
const br = await webkit.launch(); let n = 0, bad = 0;
for (const [W, H, file, scroll] of SPECS) {
  const ctx = await br.newContext({ viewport: { width: W, height: H }, hasTouch: true }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:4173/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89', { waitUntil: 'networkidle' }); await p.waitForSelector('.ingredient-table');
  await p.evaluate((y) => window.scrollTo(0, y), scroll); await p.waitForTimeout(200); await p.locator('.shell__menu').click(); await p.waitForSelector('.shell__rail--open'); await p.waitForTimeout(300);
  const app = await p.evaluate(measure, [SEL, PROPS, 'body', null]); await ctx.close();
  const bctx = await br.newContext({ viewport: { width: 3000, height: 1500 }, hasTouch: true });
  await bctx.route(/fonts\.googleapis/, (r) => r.fulfill({ contentType: 'text/css', body: '' })); const bp = await bctx.newPage();
  await bp.goto('file://' + path.join(DIR, file + '.html')); await bp.waitForTimeout(900);
  const brd = await bp.evaluate(measure, [SEL, PROPS, '.fp-sticky1-' + W, '.fp-sticky1-' + W]); await bctx.close();
  // the board draws the bar twice (the page's own, scrolled under the scrim, and the one fixed at the window's top over it) and places the panel and the scrim absolutely: a drawing has no viewport
  for (const s of SEL) { const a = app[s]; let b = brd[s]; if (/^\.shell__(head|menu|brand|tools)$/.test(s)) b = b.slice(-1); n++;
    if (a.length !== b.length) { bad++; console.log('count', file, s, 'app', a.length, 'board', b.length); continue; }
    a.forEach((ea, i) => { for (const k of Object.keys(ea)) { n++; const va = ea[k], vb = b[i][k]; /* the bar is sticky in the app and placed in a drawing; the button's padding is its :hover rule after the tap */ if (k === 'position' && /rail--open|scrim|^\.shell__head$/.test(s)) continue; if (k === 'paddingLeft' && s === '.shell__menu') continue; const off = typeof va === 'number' ? Math.abs(va - vb) > 0.6 : va !== vb; if (off) { bad++; console.log('diff', file, s + '[' + i + ']', k, 'app', va, 'board', vb); } } }); }
}
console.log('checks', n, 'off', bad); await br.close(); process.exit(0);
