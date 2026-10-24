// Sid, 2026-10-23 (bug-save-notice-covers-title-393, Mark's note "a different kind/shape of notification toast?"): measures the as-built page notice right after Save batch
// and captures the shell for the noticeshape.py boards. WebKit, coarse pointer, 1366x1024 and 393x852. Serves a scratch build on a throwaway 127.0.0.1 port through the 03.5
// probe harness (never the :4173 preview, never a dev server).
//   node noticeshape-capture.mjs <scratch dist dir>   -> noticeshape-capture.json { "<W>": { html, facts } } and noticeshape-shots/<W>-{before,after,after+5s}.png
// Per width: Olive Oil v1, Record a batch, churn date, scroll the pen foot's Save batch into view (its page y is the "where the maker's eye is" reference), click it, then the
// notice's box, the recipe name's box, the overlap between them, the focused element, the scroll position the save left, and whether the notice has cleared 5.5 s later.
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../milestones/v1-phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(HERE, 'noticeshape-shots'); await mkdir(SHOTS, { recursive: true });
const V1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const dist = path.resolve(process.argv[2] || path.join(HERE, '..', '..', 'app', 'dist'));
const { appUrl, close } = await startServers({ appRoot: dist });
const b = await webkit.launch(); const out = {};
const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), pageY: +(r.y + window.scrollY).toFixed(1) }; };
try {
  for (const [W, H] of [[1366, 1024], [393, 852]]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 724, deviceScaleFactor: 1 });
    const p = await ctx.newPage(); p.setDefaultTimeout(15000);
    await p.goto(appUrl + V1, { waitUntil: 'networkidle' }); await p.waitForSelector('.notebook-log'); await p.waitForTimeout(300);
    await p.getByRole('button', { name: /^Record (another|a batch)$/ }).first().click(); await p.waitForSelector('.ingredient-table__as-made-field');
    await p.getByLabel('Churn date').fill('2026-10-22'); await p.waitForTimeout(200);
    const save = p.locator('.pen-foot .save-ceremony button', { hasText: 'Save batch' }).first();
    await save.scrollIntoViewIfNeeded(); await p.waitForTimeout(200);
    const before = await p.evaluate((R) => { const R2 = eval(R); const s = [...document.querySelectorAll('.pen-foot button')].find((e) => e.textContent.trim() === 'Save batch');
      return { scrollY: window.scrollY, docH: document.documentElement.scrollHeight, save: R2(s), head: R2(document.querySelector('.shell__head')), headPos: getComputedStyle(document.querySelector('.shell__head')).position,
        penH: (() => { const f = document.querySelector('.notebook-log'); return f ? Math.round(f.getBoundingClientRect().height) : null; })() }; }, R.toString());
    await p.screenshot({ path: path.join(SHOTS, `${W}-before.png`) });
    const url0 = p.url(); await save.click();
    await p.waitForFunction((u) => window.location.href !== u, url0); await p.waitForSelector('h2.region-name:has-text("Batch")'); await p.waitForTimeout(400);
    await p.evaluate(() => document.fonts.ready);
    const after = await p.evaluate((R) => { const R2 = eval(R); const n = document.querySelector('.page-status'); const nb = n.getBoundingClientRect();
      const name = document.querySelector('.notebook-recipe h1, .notebook-recipe__name, .headnote h1, .recipe-band h1') || document.querySelector('.notebook-band h1');
      const ov = (q) => { if (!q) return null; const r = q.getBoundingClientRect(); const x = Math.max(nb.x, r.x), y = Math.max(nb.y, r.y), x2 = Math.min(nb.right, r.right), y2 = Math.min(nb.bottom, r.bottom); return x2 > x && y2 > y ? { w: +(x2 - x).toFixed(1), h: +(y2 - y).toFixed(1) } : null; };
      const cs = getComputedStyle(n); const a = document.activeElement; const tabs = document.querySelector('.shell__tabs'); const hd = document.querySelector('.shell__head');
      const centre = document.elementFromPoint(nb.x + nb.width / 2, nb.y + nb.height / 2);
      const under = [...document.querySelectorAll('h1, h2, h3, p, button, a, input, .notebook-caption, .pen-caption')].filter((e) => e !== n && !n.contains(e) && ov(e)).map((e) => ({ tag: e.tagName, cls: e.className && e.className.baseVal === undefined ? e.className : '', text: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40), ov: ov(e) }));
      return { url: location.pathname, scrollY: window.scrollY, docH: document.documentElement.scrollHeight, text: n.textContent, notice: R2(n), anchor: R2(n.parentElement), font: cs.fontSize, lh: cs.lineHeight, pad: cs.padding, border: cs.borderTopWidth, bg: cs.backgroundColor, color: cs.color, z: cs.zIndex,
        name: { text: name ? name.textContent.trim() : null, box: R2(name), sel: name ? name.tagName + '.' + name.className : null, overlap: ov(name) }, under, focused: { tag: a.tagName, text: a.textContent.replace(/\s+/g, ' ').trim().slice(0, 40), box: R2(a) },
        head: R2(hd), headPos: hd ? getComputedStyle(hd).position : null, tabs: tabs && getComputedStyle(tabs).display !== 'none' ? R2(tabs) : null, hit: centre ? (centre.className || centre.tagName) : null,
        batchHead: R2([...document.querySelectorAll('h2.region-name')].find((e) => e.textContent.trim().startsWith('Batch'))) }; }, R.toString());
    await p.screenshot({ path: path.join(SHOTS, `${W}-after.png`) });
    const html = await p.evaluate(() => { const live = document.querySelector('.shell'); const root = live.cloneNode(true); const lf = live.querySelectorAll('input, textarea'); const cf = root.querySelectorAll('input, textarea');
      lf.forEach((e, i) => { const c = cf[i]; if (e.tagName === 'TEXTAREA') c.textContent = e.value; else if (e.type === 'radio' || e.type === 'checkbox') { if (e.checked) c.setAttribute('checked', ''); else c.removeAttribute('checked'); } else c.setAttribute('value', e.value); });
      return root.outerHTML; });
    await p.waitForTimeout(5300);
    const later = await p.evaluate(() => { const n = document.querySelector('.page-status'); return { text: n.textContent, h: n.getBoundingClientRect().height }; });
    await p.screenshot({ path: path.join(SHOTS, `${W}-after+5s.png`) });
    out[W] = { html, facts: { before, after, later } }; await ctx.close();
    console.log(W, JSON.stringify({ saveBefore: before.save, scrollBefore: before.scrollY, scrollAfter: after.scrollY, notice: after.notice, text: after.text, font: after.font, name: after.name, under: after.under, focused: after.focused, head: after.head, headPos: after.headPos, tabs: after.tabs, hit: after.hit, batchHead: after.batchHead, later }));
  }
} finally { await b.close(); await close(); }
await writeFile(path.join(HERE, 'noticeshape-capture.json'), JSON.stringify(out));
process.exit(0);
