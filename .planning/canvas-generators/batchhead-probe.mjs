// Sid, 2026-10-05 (decision 50): the Batch section with a Show/Hide and the Tasting head's timestamp, tried on the built page (its DOM edited in the browser, one rule added), read and captured.
//   node batchhead-probe.mjs [chromium]  -> batchhead-probe[-chromium].json (numbers) and, in WebKit, batchhead-capture.json (the shell's markup: built_W, open_W, closed_W)
// Olive Oil v1 with its tasted batch. The edit: the head's Batch word and its date become the fold row the Tasting head is (label, Show or Hide, a dot, the date), in an h2 like Tasting's; Correct and Record another stay in the head's acts group; the
// batch's body (.batch-margin) goes inside #fold-batch, hidden when the fold is closed. The rule: the lead takes the whole row where the acts wrap (the log column narrower than 447px: the phone's 353 and the 350px log column from 1366; a container query on the log) so the fold row is a full-row control as the others are; elsewhere it is as wide as its words and the acts follow the date.
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const eng = process.argv[2] === 'chromium' ? chromium : webkit;
const URL_ = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89';
const RULE = `
.notebook-log { container-type: inline-size; }
.notebook-log .batch-row__head { row-gap: 0; align-items: center; }
.notebook-log .batch-row__head-lead .region-name { margin: 0; flex: 0 1 auto; }
.notebook-log .batch-row__head-lead .fold-row { width: auto; }
@container (max-width: 446px) {
  .notebook-log .batch-row__head-lead { flex: 0 0 100%; }
  .notebook-log .batch-row__head-lead .region-name { flex: 1 1 auto; }
  .notebook-log .batch-row__head-lead .fold-row { width: 100%; }
}`;
const edit = (open) => {
  const head = document.querySelector('.batch-row__head'); const h2 = head.querySelector('h2'); const date = head.querySelector('.batch-row__date'); const text = date.textContent;
  h2.textContent = ''; h2.insertAdjacentHTML('afterbegin', `<button type="button" class="fold-row" aria-expanded="${open}" aria-controls="fold-batch" aria-label="Batch, ${open ? 'Hide' : 'Show'}, ${text}" tabindex="0"><span class="fold-row__head">Batch<span class="fold-row__control">${open ? 'Hide' : 'Show'}</span></span><span class="fold-row__count">${text}</span></button>`);
  date.remove(); const body = document.querySelector('.batch-margin'); const wrap = document.createElement('div'); wrap.id = 'fold-batch'; if (!open) wrap.hidden = true; body.replaceWith(wrap); wrap.appendChild(body);
};
const br = await eng.launch(eng === chromium ? { channel: 'chrome' } : {}); const out = {}; const cap = {};
for (const W of [393, 723, 724, 1024, 1366]) for (const v of ['built', 'open', 'closed']) {
  const ctx = await br.newContext({ viewport: { width: W, height: 1000 }, hasTouch: eng === webkit, deviceScaleFactor: 1 }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:4173' + URL_, { waitUntil: 'networkidle' }); await p.waitForSelector('.batch-row__head'); await p.evaluate(() => document.fonts.ready);
  if (v !== 'built') { await p.evaluate(edit, v === 'open'); await p.addStyleTag({ content: RULE }); } await p.waitForTimeout(150);
  out[`${v}_${W}`] = await p.evaluate(() => { const log = document.querySelector('.notebook-log'); const lb = log.getBoundingClientRect(); const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: +(b.x - lb.x).toFixed(2), y: +(b.y - lb.y).toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) }; };
    const ink = (el) => { if (!el) return null; const g = document.createRange(); g.selectNodeContents(el); const rs = [...g.getClientRects()]; return rs.length ? [+(Math.min(...rs.map((q) => q.left)) - lb.x).toFixed(2), +(Math.max(...rs.map((q) => q.right)) - lb.x).toFixed(2)] : null; };
    const head = document.querySelector('.batch-row__head'); const sh = document.querySelector('.shell').getBoundingClientRect(); const abs = (e) => { const b = e.getBoundingClientRect(); return { x: +(b.x - sh.x).toFixed(2), y: +(b.y - sh.y).toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) }; }; const fr = head.querySelector('.fold-row'); const tast = document.querySelector('.tasting-reading .fold-row'); const cnt = (fr || head).querySelector('.fold-row__count, .batch-row__date'); const css = (e) => { const c = getComputedStyle(e); return { fs: c.fontSize, color: c.color }; };
    return { headAbs: abs(head), logAbs: abs(log), tastingAbs: abs(document.querySelector('.tasting-reading')), head: r(head), lead: r(head.querySelector('.batch-row__head-lead')), fold: r(fr), foldInk: ink(fr), label: ink(fr && fr.querySelector('.fold-row__head')), count: r(cnt), countInk: ink(cnt), countCss: css(cnt), dot: fr ? getComputedStyle(cnt, '::before').content : null, acts: r(head.querySelector('.batch-row__head-acts')), correctInk: ink(head.querySelector('.batch-row__correct')), recordInk: ink(head.querySelector('.batch-row__record')), body: r(document.querySelector('.batch-margin')), bodyShown: !!document.querySelector('.batch-margin') && document.querySelector('.batch-margin').getClientRects().length > 0, section: r(document.querySelector('.batch-row')), log: r(log), tastingRow: r(tast), tastingCountInk: ink(tast && tast.querySelector('.fold-row__count')), tastingCountCss: tast ? css(tast.querySelector('.fold-row__count')) : null, doc: document.documentElement.scrollHeight }; });
  if (eng === webkit) cap[`${v}_${W}`] = await p.evaluate(() => document.querySelector('.shell').outerHTML);
  await ctx.close();
}
await br.close(); await writeFile(path.join(HERE, process.argv[2] === 'chromium' ? 'batchhead-probe-chromium.json' : 'batchhead-probe.json'), JSON.stringify(out, null, 1)); if (eng === webkit) await writeFile(path.join(HERE, 'batchhead-capture.json'), JSON.stringify(cap));
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(12), 'head', v.head.h, 'lead', v.lead.h, 'fold', v.fold && `${v.fold.x},${v.fold.w}x${v.fold.h}`, 'count ink', v.countInk, v.countCss.fs, v.countCss.color, 'acts', v.acts && `${v.acts.x},${v.acts.y} ${v.acts.w}`, 'correct', v.correctInk, 'body', v.bodyShown, 'section', v.section.h, 'doc', v.doc);
