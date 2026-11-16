// Sid, 2026-11-15 (Phase 12 Gate 1): measures p12.py's panels and pages in WebKit with a coarse pointer (or Chromium) and writes p12-measure.json; prints each board panel beside the built app's
// own figures (p12-capture.json), which is the board-against-build check for what the boards keep as built.
//   node p12-measure.mjs <out>/measure.html [chromium]     (measure-print.html beside it holds the pages)
// Per app panel: the crop (the scales and problems of the pen, the Tasting section of the reading) and each scale's, chip's and cell's box. Per page: lines, each scale row's height, the problems row,
// and the height the page needs at Safari's content width 630 (limit 900, less the 90 px clipboard drop on a drawn page) and Chrome's 672 (limit 960, less 96).
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const FILE = path.resolve(process.argv[2]); const useChromium = process.argv[3] === 'chromium';
const CAP = JSON.parse(await readFile(path.join(HERE, 'p12-capture.json'), 'utf8'));
const br = useChromium ? await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }) : await webkit.launch();
const ctx = await br.newContext({ viewport: { width: 1400, height: 1000 }, hasTouch: true, deviceScaleFactor: 1 }); const page = await ctx.newPage();
await page.goto('file://' + FILE); await page.waitForTimeout(400);
const out = {};
for (const pid of await page.$$eval('[data-pid]', (els) => els.map((e) => e.getAttribute('data-pid')))) {
  out[pid] = await page.evaluate((pid) => {
    document.querySelectorAll('[data-pid]').forEach((e) => { e.style.display = e.getAttribute('data-pid') === pid ? 'block' : 'none'; });
    const root = document.querySelector('[data-pid="' + pid + '"]'); const R = root.getBoundingClientRect(); const r1 = (n) => Math.round(n * 10) / 10; const B = (e) => { const b = e.getBoundingClientRect(); return { w: r1(b.width), h: r1(b.height) }; };
    const c = root.querySelector('.' + root.getAttribute('data-crop')).getBoundingClientRect(); const log = root.querySelector('.notebook-log'); const L = log.getBoundingClientRect(); const t = root.querySelector('.tasting-reading'); const T = t && t.getBoundingClientRect();
    return { w: Math.round(R.width), cropTop: Math.floor(c.top - R.top) - 8, cropH: Math.ceil(c.height) + 16, overflowX: Math.max(0, Math.round(root.scrollWidth - R.width)), logW: r1(L.width),
      cues: [...log.querySelectorAll('.axes-cue, .defects-head .pen-caption, .defect-group .pen-caption')].map((e) => e.textContent.trim()),
      scales: [...log.querySelectorAll('.axis-mark')].map((a) => ({ name: a.querySelector('.axis-mark__name').textContent, box: B(a), head: B(a.querySelector('.axis-mark__head')), stops: B(a.querySelector('.axis-mark__stops')), stop: B(a.querySelector('.axis-mark__stop')), anchors: B(a.querySelector('.axis-mark__anchors')),
        anchorWords: [...a.querySelectorAll('.axis-mark__anchors span')].map((s) => s.textContent), anchorX: [...a.querySelectorAll('.axis-mark__anchors span')].map((s) => r1(s.getBoundingClientRect().left - a.getBoundingClientRect().left) + '-' + r1(s.getBoundingClientRect().right - a.getBoundingClientRect().left)), aria: [...a.querySelectorAll('input')].map((i) => i.getAttribute('aria-label')) })),
      chips: [...log.querySelectorAll('.chip-toggle')].map((c) => ({ t: c.textContent, ...B(c), top: r1(c.getBoundingClientRect().top - L.top) })),
      read: t ? { w: r1(T.width), h: r1(T.height), groups: [...t.querySelectorAll('.batch-row__group-label')].map((e) => e.tagName + ' ' + e.textContent.trim()), cells: [...t.querySelectorAll('.batch-row__cell')].map((c) => { const b = c.getBoundingClientRect(); return { label: c.querySelector('.batch-row__cell-label')?.textContent, value: c.querySelector('.batch-row__cell-value')?.textContent, x: r1(b.left - T.left), y: r1(b.top - T.top), w: r1(b.width), h: r1(b.height) }; }) } : null };
  }, pid);
}
// board against build, for what the boards keep as built
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b); const rows = [];
for (const [pid, m] of Object.entries(out)) { const [kind, ck, W] = pid.split('-'); if (kind === 'rb') continue; const f = CAP[`${ck}_${kind}_${W}`].facts;
  if (kind === 'pen') { const bs = f.scales.map((s) => [s.name, s.box, s.head, s.stops, s.stop, s.anchors]); const ms = m.scales.map((s) => [s.name, s.box, s.head, s.stops, s.stop, s.anchors]);
    rows.push(`${pid}: log ${m.logW} / built ${f.logW}; ${ms.length} scales, boxes ${same(bs, ms) ? 'equal' : 'DIFFER ' + JSON.stringify(ms.filter((x, i) => !same(x, bs[i])))}; chips ${same(f.chips, m.chips) ? 'equal' : 'DIFFER'}; cues ${same(f.cues, m.cues) ? 'equal' : 'DIFFER'}; crop ${m.cropTop}+${m.cropH}; ovx ${m.overflowX}`);
    for (const s of m.scales.filter((s) => s.anchorWords.length !== 3)) rows.push(`   Low to high ${s.name}: anchors ${s.anchorWords.join(' | ')} at ${s.anchorX.join(', ')} of ${s.stops.w}; box ${s.box.h}; names ${s.aria.join(' / ')}`); }
  else { const strip = (r) => r.cells.map((c) => [c.label, c.x, c.y, c.w, c.h]); rows.push(`${pid}: reading ${m.read.w} x ${m.read.h} / built ${f.w} x ${f.h}; groups ${same(f.groups, m.read.groups) ? 'equal' : 'DIFFER'}; cell boxes ${same(strip(f), strip(m.read)) ? 'equal' : 'DIFFER'}; values ${m.read.cells.filter((c) => c.value).map((c) => c.label + '=' + c.value).join(', ')}; crop ${m.cropTop}+${m.cropH}`); } }
// the pages
await page.goto('file://' + path.join(path.dirname(FILE), 'measure-print.html')); await page.emulateMedia({ media: 'print' }); await page.waitForTimeout(400);
for (const pid of await page.$$eval('[data-page]', (els) => els.map((e) => e.getAttribute('data-page')))) {
  const m = await page.evaluate((pid) => {
    document.querySelectorAll('[data-page]').forEach((e) => { e.style.display = e.getAttribute('data-page') === pid ? 'block' : 'none'; });
    const root = document.querySelector('[data-page="' + pid + '"]'); const pg = root.querySelector('.print-page--log'); const lf = pg.querySelector('.lf'); const body = lf.querySelector('.lf-body'); const foot = lf.querySelector('.lf-foot'); const r1 = (n) => Math.round(n * 10) / 10;
    const o = { drawn: root.getAttribute('data-drawn') === '1', title: lf.querySelector('.lf-title').textContent, lines: lf.querySelectorAll('.lf-line').length, boxes: lf.querySelectorAll('.lf-box').length,
      srows: [...lf.querySelectorAll('.lf-srow')].map((s) => ({ name: s.querySelector('.axis-mark__name').textContent, h: r1(s.getBoundingClientRect().height), words: [...s.querySelectorAll('.lf-anchor, .lf-num')].map((x) => x.className.replace('lf-anchor ', '').replace('lf-num ', '') + ':' + x.textContent),
        under: [...s.querySelectorAll('.lf-n2, .lf-n3, .lf-n4, .lf-mid')].map((x) => { const b = x.getBoundingClientRect(); const k = x.classList.contains('lf-mid') ? 3 : +x.textContent; const tk = s.querySelector('.lf-tick--' + k).getBoundingClientRect(); return r1((b.left + b.right) / 2 - tk.left); }) })) };
    pg.style.transform = 'none'; pg.style.padding = '0 2px 0 0'; pg.style.height = 'auto'; pg.style.boxSizing = 'border-box'; lf.style.height = 'auto';
    for (const [k, w] of [['safari', 630], ['chrome', 672]]) { pg.style.width = w + 'px'; const row = lf.querySelector('.lf-mrow--plain .lf-mark'); const opts = row ? [...row.querySelectorAll('.lf-opt')] : [];
      o[k] = { body: r1(body.getBoundingClientRect().height), total: r1(body.getBoundingClientRect().height + 16 + foot.getBoundingClientRect().height), problemsRowH: row ? r1(row.getBoundingClientRect().height) : 0, problemsSlack: row ? r1(row.getBoundingClientRect().right - opts[opts.length - 1].getBoundingClientRect().right) : null }; }
    return o; }, pid);
  m.safari.limit = 900 - (m.drawn ? 90 : 0); m.chrome.limit = 960 - (m.drawn ? 96 : 0); for (const k of ['safari', 'chrome']) m[k].spare = Math.round((m[k].limit - m[k].total) * 10) / 10;
  out[pid] = m;
  rows.push(`${pid}: ${m.title}, ${m.lines} lines, ${m.boxes} boxes; safari ${m.safari.total} of ${m.safari.limit} (spare ${m.safari.spare}); chrome ${m.chrome.total} of ${m.chrome.limit} (spare ${m.chrome.spare}); problems row ${m.safari.problemsRowH} high, ${m.safari.problemsSlack} slack at 630; scale rows ${[...new Set(m.srows.map((s) => s.h))].join('/')}` + m.srows.filter((s) => !s.words.some((w) => w === 'lf-mid:right')).map((s) => `\n   Low to high ${s.name}: ${s.h} high; ${s.words.join(' ')}; under the ticks ${s.under.length ? 'numbers, off their ticks by ' + s.under.join(', ') + ' px' : 'nothing'}`).join(''));
}
await br.close();
await writeFile(path.join(HERE, useChromium ? 'p12-measure-chromium.json' : 'p12-measure.json'), JSON.stringify(out, null, 1));
console.log(rows.join('\n')); process.exit(0);
