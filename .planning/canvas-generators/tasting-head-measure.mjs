// Sid, 2026-10-25 (Mark: "I want Tasting to be treated as a region like Batch ... make it look like a peer to the Batch"): measures the as-built pen heads, Batch and
// Tasting, on both entry paths (Record another then Add tasting on Olive Oil v1; Record a tasting on Mexican Chocolate v3, an untasted batch) at 1366 coarse and 393,
// in WebKit on a scratch build served through the 03.5 probe harness. Nothing under app/ is touched.   node tasting-head-measure.mjs <scratch dist> -> tasting-head-measure.json
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../milestones/v1-phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(process.argv[2]);
const { appUrl, close } = await startServers({ appRoot: dist });
const b = await webkit.launch(); const out = {};
const measure = () => {
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: +r.x.toFixed(1), y: +(r.y + window.scrollY).toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
  const face = (e) => { if (!e) return null; const s = getComputedStyle(e); return { tag: e.tagName.toLowerCase(), size: s.fontSize, weight: s.fontWeight, lh: s.lineHeight, color: s.color, transform: s.textTransform, tracking: s.letterSpacing, text: e.textContent.trim().slice(0, 40) }; };
  const log = document.querySelector('.notebook-log'); const pen = log.querySelector('.batch-margin--pen') || log;
  const bh = log.querySelector('.batch-row__head'); const bname = bh && bh.querySelector('.region-name');
  const th = log.querySelector('.tasting-head'); const tname = th && th.querySelector('.region-name'); const status = th && th.querySelector('.tasting-status'); const remove = th && th.querySelector('.tasting-head__remove');
  const prev = th && th.previousElementSibling; const prevBox = prev ? R(prev) : null;
  const next = th && th.nextElementSibling; const nextCap = next && (next.querySelector('.pen-caption') || next);
  const firstCapAfterBatch = (() => { let e = bh && bh.nextElementSibling; while (e && !e.querySelector('.pen-caption, .ink-field')) e = e.nextElementSibling; return e && (e.querySelector('.pen-caption') || e); })();
  const outline = [...log.querySelectorAll('h2, h3, h4')].map((h) => h.tagName.toLowerCase() + ' ' + h.textContent.trim().replace(/\s+/g, ' ').slice(0, 30) + (h.className ? ' .' + h.className.split(' ')[0] : ''));
  const rules = th ? { tastingHead: { marginTop: getComputedStyle(th).marginTop, marginBottom: getComputedStyle(th).marginBottom, borderTop: getComputedStyle(th).borderTopWidth + ' ' + getComputedStyle(th).borderTopColor, paddingTop: getComputedStyle(th).paddingTop } } : {};
  const sep = log.querySelector('.batch-row__head').parentElement; const sepRule = getComputedStyle(sep).borderTopWidth;
  return { scrollY: window.scrollY, batchHead: { box: R(bh), name: face(bname), nameBox: R(bname), toFirstCaption: firstCapAfterBatch ? +(R(firstCapAfterBatch).y - R(bname).y - R(bname).h).toFixed(1) : null, firstCaption: firstCapAfterBatch ? firstCapAfterBatch.textContent.trim().slice(0, 20) : null },
    tastingHead: th ? { box: R(th), name: face(tname), nameBox: R(tname), status: { box: R(status), face: face(status) }, remove: { box: R(remove), face: face(remove) }, fromPrev: prevBox ? +(R(th).y - prevBox.y - prevBox.h).toFixed(1) : null, prev: prev ? (prev.className || prev.tagName).toString().split(' ')[0] + ':' + prev.textContent.trim().slice(0, 24) : null, toNextCaption: nextCap ? +(R(nextCap).y - R(tname).y - R(tname).h).toFixed(1) : null, nextCaption: nextCap ? nextCap.textContent.trim().slice(0, 20) : null, rules } : null,
    cells: (() => {      // 2026-10-25 addendum (Mark: "Tasting temperature" is redundant and keeps the row from sharing with Tempering and Tasted): the three in the pen's field row and the reading's cells
      const row = [...log.querySelectorAll('.field-row')].find((r) => /Tasted/.test(r.textContent)); const pen = row ? [...row.querySelectorAll('.field-row__label')].map((l) => ({ label: l.querySelector('.pen-caption')?.textContent.trim(), box: R(l), captionBox: R(l.querySelector('.pen-caption')), captionLines: Math.round(l.querySelector('.pen-caption').getBoundingClientRect().height / parseFloat(getComputedStyle(l.querySelector('.pen-caption')).lineHeight)), captionTextW: (() => { const r = document.createRange(); r.selectNodeContents(l.querySelector('.pen-caption')); return +r.getBoundingClientRect().width.toFixed(1); })() })) : null;
      const reading = [...log.querySelectorAll('.batch-row__cell')].filter((c) => /Tempering|Tasting temperature/.test(c.textContent)).map((c) => ({ label: c.querySelector('.batch-row__cell-label')?.textContent.trim(), box: R(c), labelBox: R(c.querySelector('.batch-row__cell-label')) }));
      const fold = [...log.querySelectorAll('.fold-row')].map((f) => ({ text: f.textContent.trim().replace(/\s+/g, ' ').slice(0, 40), box: R(f) }));
      return { pen, reading, fold, logWidth: +log.getBoundingClientRect().width.toFixed(1) }; })(),
    outline, focused: document.activeElement ? (document.activeElement.tagName + ' ' + (document.activeElement.getAttribute('aria-label') || document.activeElement.textContent.trim().slice(0, 30))) : null, penWidth: pen.getBoundingClientRect().width };
};
try {
  for (const [W, H] of [[1366, 1024], [393, 852]]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 724, deviceScaleFactor: 1 });
    const p = await ctx.newPage(); p.setDefaultTimeout(15000);
    // the reading state first (Olive Oil v1's tasted batch, before any pen leaves a kept draft): the Tasting fold open, its cells
    await p.goto(appUrl + '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', { waitUntil: 'networkidle' }); await p.waitForSelector('.notebook-log'); await p.waitForTimeout(300);
    { const tf = p.locator('.tasting-reading .fold-row'); if (await tf.count() && await tf.getAttribute('aria-expanded') === 'false') { await tf.click(); await p.waitForTimeout(300); } }
    out[`reading_${W}`] = await p.evaluate(measure);
    await p.locator('.tasting-reading').scrollIntoViewIfNeeded(); await p.waitForTimeout(200); await p.screenshot({ path: path.join(HERE, 'tasting-head-shots', `reading-${W}.png`) });
    // path 1: Record another, then Add tasting
    await p.goto(appUrl + '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', { waitUntil: 'networkidle' }); await p.waitForSelector('.notebook-log'); await p.waitForTimeout(300);
    await p.getByRole('button', { name: /^Record (another|a batch)$/ }).first().click(); await p.waitForSelector('.ingredient-table__as-made-field'); await p.waitForTimeout(300);
    out[`churn_${W}`] = await p.evaluate(measure);
    await p.getByRole('button', { name: 'Add tasting' }).first().click(); await p.waitForSelector('.tasting-head'); await p.waitForTimeout(300);
    out[`addtasting_${W}`] = await p.evaluate(measure);
    await p.locator('.tasting-head').scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, -200)); await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(HERE, 'tasting-head-shots', `addtasting-${W}.png`) });
    // the addendum's relabel, measured in the real app: the three captions with "Temperature" for "Tasting temperature"
    await p.evaluate(() => { for (const c of document.querySelectorAll('.notebook-log .pen-caption')) if (c.textContent.trim() === 'Tasting temperature') c.textContent = 'Temperature'; }); await p.waitForTimeout(200);
    out[`relabel_${W}`] = { cells: (await p.evaluate(measure)).cells };
    // path 2: Record a tasting on an untasted batch, from Home's row act (RecipeList.jsx; the band carries it only below 724)
    await p.goto(appUrl + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(400);      // Home's row act (RecipeList.jsx RowActions)
    await p.getByRole('link', { name: 'Record a tasting' }).first().click();
    await p.waitForSelector('.tasting-head'); await p.waitForTimeout(400);
    out[`recordtasting_${W}`] = await p.evaluate(measure);
    await p.locator('.tasting-head').scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, -200)); await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(HERE, 'tasting-head-shots', `recordtasting-${W}.png`) });
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(HERE, 'tasting-head-shots', `recordtasting-${W}-top.png`) });
    await ctx.close();
  }
} finally { await b.close(); await close(); }
await writeFile(path.join(HERE, 'tasting-head-measure.json'), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k, JSON.stringify(v));
process.exit(0);
