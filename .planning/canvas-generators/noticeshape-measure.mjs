// Sid, 2026-10-23 (bug-save-notice-covers-title-393): measures each candidate notice shape (noticeshape-options.json) in the real app, in WebKit, by injecting the option's
// rules into the live page right after Save batch; nothing under app/ is touched. Serves a scratch build on a throwaway 127.0.0.1 port through the 03.5 probe harness.
//   node noticeshape-measure.mjs <scratch dist dir>   -> noticeshape-measure.json { "<opt>_<W>": { notice, font, covers, toFocus, toTabs, toHead, scrollY, atTop } }
// Per option and width (1366x1024, 393x852, coarse): the notice's viewport box, its font size, every text element it covers (with the covered area), the gap from the
// focused Batch heading, from the bar's bottom edge and from the tab row, at the scroll position the save left; then the same box with the page scrolled to the top
// (the bug's own observation at 393: the band's recipe name).
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../milestones/v1-phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OPTS = JSON.parse(await readFile(path.join(HERE, 'noticeshape-options.json'), 'utf8'));
const V1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const dist = path.resolve(process.argv[2] || path.join(HERE, '..', '..', 'app', 'dist'));
const { appUrl, close } = await startServers({ appRoot: dist });
const b = await webkit.launch(); const out = {};
const measure = () => {
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
  const n = document.querySelector('.page-status'); const nb = n.getBoundingClientRect(); const cs = getComputedStyle(n);
  const ov = (q) => { const r = q.getBoundingClientRect(); const x = Math.max(nb.x, r.x), y = Math.max(nb.y, r.y), x2 = Math.min(nb.right, r.right), y2 = Math.min(nb.bottom, r.bottom); return x2 > x && y2 > y ? { w: +(x2 - x).toFixed(1), h: +(y2 - y).toFixed(1) } : null; };
  const leaf = (e) => [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()) || /^(INPUT|BUTTON|A)$/.test(e.tagName);
  const covers = [...document.querySelectorAll('.shell__main *')].filter((e) => e !== n && !n.contains(e) && !e.closest('.page-status') && leaf(e) && ov(e)).map((e) => ({ tag: e.tagName, cls: typeof e.className === 'string' ? e.className.split(' ')[0] : '', text: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40), ov: ov(e) }));
  const f = document.activeElement; const fb = f.getBoundingClientRect(); const hd = document.querySelector('.shell__head'); const hb = hd.getBoundingClientRect(); const tabs = document.querySelector('.shell__tabs'); const tb = tabs && getComputedStyle(tabs).display !== 'none' ? tabs.getBoundingClientRect() : null;
  const name = document.querySelector('.notebook-recipe__name');
  // 2026-10-24: the colours the card stands on and in (Mark: the Sheet-styled card is lost against the Sheet), for the contrast figures on the board
  const sheet = document.querySelector('.recipe-page'); const under = document.elementsFromPoint(nb.x + nb.width / 2, nb.y + nb.height / 2).filter((e) => e !== n && !n.contains(e));
  const bgOf = (e) => { for (let el = e; el; el = el.parentElement) { const c = getComputedStyle(el).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return { color: c, on: el.className && typeof el.className === 'string' ? el.className.split(' ')[0] : el.tagName }; } return null; };
  const colours = { background: cs.backgroundColor, color: cs.color, border: cs.borderTopWidth + ' ' + cs.borderTopColor, radius: cs.borderTopLeftRadius, shadow: cs.boxShadow, sheet: sheet ? getComputedStyle(sheet).backgroundColor : null, app: getComputedStyle(document.querySelector('.shell') || document.body).backgroundColor, under: under.length ? bgOf(under[0]) : null };
  return { notice: R(n), font: cs.fontSize, lh: cs.lineHeight, pad: cs.padding, colours, covers, scrollY: window.scrollY, focused: { text: f.textContent.replace(/\s+/g, ' ').trim().slice(0, 30), box: R(f) },
    toFocus: +(nb.y > fb.bottom ? nb.y - fb.bottom : fb.y - nb.bottom).toFixed(1), toHead: +(nb.y - hb.bottom).toFixed(1), headVisible: hb.bottom > 0, toTabs: tb ? +(tb.y - nb.bottom).toFixed(1) : null, tabs: tb ? R(tabs) : null,
    toViewportBottom: +(window.innerHeight - nb.bottom).toFixed(1), toEnd: +(window.innerWidth - nb.right).toFixed(1), name: { box: R(name), ov: name ? ov(name) : null } };
};
try {
  for (const [W, H] of [[1366, 1024], [393, 852]]) for (const [opt, css] of Object.entries(OPTS)) {
    if (opt === '_') continue;
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 724, deviceScaleFactor: 1 });
    const p = await ctx.newPage(); p.setDefaultTimeout(15000);
    await p.goto(appUrl + V1, { waitUntil: 'networkidle' }); await p.waitForSelector('.notebook-log'); await p.waitForTimeout(300);
    await p.getByRole('button', { name: /^Record (another|a batch)$/ }).first().click(); await p.waitForSelector('.ingredient-table__as-made-field');
    await p.getByLabel('Churn date').fill('2026-10-22'); await p.waitForTimeout(200);
    const save = p.locator('.pen-foot .save-ceremony button', { hasText: 'Save batch' }).first(); await save.scrollIntoViewIfNeeded(); await p.waitForTimeout(200);
    const url0 = p.url(); await save.click();
    await p.waitForFunction((u) => window.location.href !== u, url0); await p.waitForSelector('h2.region-name:has-text("Batch")');
    if (css) await p.addStyleTag({ content: css });
    await p.waitForTimeout(400); await p.evaluate(() => document.fonts.ready);
    const landed = await p.evaluate(measure);
    await p.screenshot({ path: path.join(HERE, 'noticeshape-shots', `${opt}-${W}.png`) });
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(200);
    const atTop = await p.evaluate(measure);
    out[`${opt}_${W}`] = { ...landed, atTop: { notice: atTop.notice, covers: atTop.covers, name: atTop.name, toHead: atTop.toHead } };
    console.log(opt, W, JSON.stringify({ notice: landed.notice, font: landed.font, toFocus: landed.toFocus, toHead: landed.toHead, toTabs: landed.toTabs, toBottom: landed.toViewportBottom, covers: landed.covers.map((c) => c.text), atTopCovers: atTop.covers.map((c) => c.text), nameOv: atTop.name.ov }));
    await ctx.close();
  }
} finally { await b.close(); await close(); }
await writeFile(path.join(HERE, 'noticeshape-measure.json'), JSON.stringify(out, null, 1));
process.exit(0);
