// Sid, 2026-10-06: measures the two starting-point boards in a real browser against the live built page, side by side (D-00: conformance is the board and the built app measured, never prose).
//   node printstart-measure.mjs <dir with AsBuiltRecipePage.dc.html and PrintStartingPoint.dc.html> [out json = printstart-measure.json]
// Each board is opened from a local copy with support.js dropped (the stylesheet is already inline) and the font pointed at app/public/fonts. The live page is app/dist on a throwaway 127.0.0.1 port.
//   A  the board at 1280 against the live page at 1280 (screen)                                             WebKit and Chromium
//   B  the board against the live page at 880 wide (article 816 wide, as the board's) with print media emulated and Balance and Watch for opened as the desktop window has them (the clicks stand in for the fold state a desktop window prints from)
// boardH (what printstart.py writes as the flow board's height) = the taller of the board's scrollHeight in WebKit and Chromium, rounded up to 10, plus 10.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(process.argv[2]); const OUT = process.argv[3] || path.join(HERE, 'printstart-measure.json');
const FONT = path.join(HERE, '..', '..', 'app', 'public', 'fonts', 'caveat-regular.woff2');
const ROUTE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
// the live page with Olive Oil v1's batches deleted from its throwaway store, as printstart-capture.mjs captures it
const dropBatches = (vid = 'olive-oil-ice-cream-v1') => new Promise((res, rej) => { const o = indexedDB.open('sprinkles'); o.onerror = () => rej(o.error); o.onsuccess = () => { const db = o.result; const tx = db.transaction('batches', 'readwrite'); const st = tx.objectStore('batches'); const q = st.index('by-version').getAllKeys(vid); q.onsuccess = () => { for (const k of q.result) st.delete(k); }; tx.oncomplete = () => { db.close(); res(); }; tx.onerror = () => rej(tx.error); }; });
const servers = await startServers();
const engines = { webkit: await webkit.launch(), chromium: await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }) };
const local = async (name) => { const h = (await readFile(path.join(DIR, name), 'utf8')).replace('<script src="./support.js"></script>', '').replaceAll('/_blob/37ac467ba5558024f5fb5a2e5c22a7bc', 'file://' + FONT); const p = path.join(DIR, '_local-' + name); await writeFile(p, h); return 'file://' + p; };

const sheetFacts = () => {
  const a = document.querySelector('article.recipe-page'); const A = a.getBoundingClientRect(); const T = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
  const rel = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left - A.left), Math.round(r.top - A.top), Math.round(r.width), Math.round(r.height)]; };
  const table = a.querySelector('.ingredient-table'); const before = a.querySelector('.before-region');
  return {
    article: [Math.round(A.width), Math.round(A.height)], sections: Object.fromEntries([...a.children].map((c) => [c.className.split(' ')[0], rel(c)])),
    headings: [...a.querySelectorAll('h1, h2')].map((h) => [T(h).replace(/(Hide|Show)$/, ''), rel(h)[1]]),
    beforeAboveTable: before.getBoundingClientRect().bottom <= table.getBoundingClientRect().top, beforeTextFirst: T(before).slice(0, 60),
    thead: !!table.querySelector('thead'), theadCells: [...table.querySelectorAll('thead th')].map(T), tbodies: table.querySelectorAll('tbody').length, tfoot: !!table.querySelector('tfoot'),
    rows: [...table.querySelectorAll('tbody tr')].map((r) => rel(r)[1]), steps: a.querySelectorAll('.method-step').length, hiddenAttr: document.querySelectorAll('[hidden]').length,
    handFace: (a.querySelector('.sheet-hand') ? getComputedStyle(a.querySelector('.sheet-hand')).fontStyle : null),
  };
};
// the printed table after Mark's edits: its column widths, the head, how many portion lines wrap past one line, the smallest type in it
const tableFacts = () => {
  const t = document.querySelector('.ingredient-table'); const T = (e) => e.textContent.replace(/\s+/g, ' ').trim();
  const rows = [...t.querySelectorAll('tbody tr[aria-label]')];
  const lineH = (td) => parseFloat(getComputedStyle(td).lineHeight) || 18;
  const wraps = rows.filter((r) => { const n = r.querySelector('.ingredient-table__col-name'); const first = n.firstChild; const range = document.createRange(); range.selectNodeContents(first); return range.getClientRects().length > 1; }).map((r) => r.getAttribute('aria-label'));
  const first = rows[0];
  return { width: Math.round(t.getBoundingClientRect().width), head: [...t.querySelectorAll('thead th')].map(T), cols: [...first.children].map((c) => [c.className.split(' ').pop(), Math.round(c.getBoundingClientRect().width)]),
    rowHeights: rows.map((r) => Math.round(r.getBoundingClientRect().height)), nameWraps: wraps, minFont: Math.min(...[...t.querySelectorAll('*')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())).map((e) => parseFloat(getComputedStyle(e).fontSize))),
    shareCells: t.querySelectorAll('.ingredient-table__col-numeric').length, asMadeCells: t.querySelectorAll('tbody .ps-asmade').length, ticks: t.querySelectorAll('tbody .ps-tick').length, watchFor: !!document.querySelector('.margin-region'), balance: !!document.querySelector('.side-region') };
};
const diff = (a, b) => {
  const d = [];
  for (const k of Object.keys(a.sections)) { const x = a.sections[k], y = b.sections[k]; if (!y || x.some((v, i) => Math.abs(v - y[i]) > 2)) d.push(`${k}: board ${x} live ${y}`); }
  if (a.rows.length !== b.rows.length || a.rows.some((v, i) => Math.abs(v - b.rows[i]) > 2)) d.push('ingredient rows differ');
  if (Math.abs(a.article[1] - b.article[1]) > 2) d.push(`article height: board ${a.article[1]} live ${b.article[1]}`);
  return d;
};
const result = {};
for (const [name, br] of Object.entries(engines)) {
  const mk = async (W, media) => { const ctx = await br.newContext({ viewport: { width: W, height: 1000 }, hasTouch: false, deviceScaleFactor: 1 }); await ctx.route('**/*', (r) => (['127.0.0.1', ''].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort())); const page = await ctx.newPage(); if (media) await page.emulateMedia({ media }); return { ctx, page }; };
  const live = async (W, media, open) => { const { ctx, page } = await mk(W, null); await page.goto(servers.appUrl + ROUTE, { waitUntil: 'networkidle' }); await page.waitForSelector('article.recipe-page .ingredient-table'); await page.evaluate(dropBatches); await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('article.recipe-page .ingredient-table'); await page.evaluate(() => document.fonts.ready);
    if (open) { await page.setViewportSize({ width: W, height: 1000 }); for (const n of ['Balance', 'Watch for']) { const b = page.locator('article.recipe-page .side-region').getByRole('button', { name: new RegExp('^' + n) }).first(); if ((await b.getAttribute('aria-expanded')) === 'false') await b.click(); } }
    if (media) await page.emulateMedia({ media }); await page.waitForTimeout(300); const f = await page.evaluate(sheetFacts); const sh = await page.evaluate(() => ({ docH: document.documentElement.scrollHeight, shellH: Math.ceil(document.querySelector('.shell').getBoundingClientRect().height) })); await ctx.close(); return { f, sh }; };
  // A
  { const { ctx, page } = await mk(1280); await page.goto(await local('AsBuiltRecipePage.dc.html')); await page.waitForTimeout(500); await page.evaluate(() => document.fonts.ready);
    const f = await page.evaluate(sheetFacts); const sh = await page.evaluate(() => ({ docH: document.documentElement.scrollHeight, shellH: Math.ceil(document.querySelector('.shell').getBoundingClientRect().height), fonts: [...document.fonts].map((x) => x.family + ':' + x.status) }));
    const lv = await live(1280); result[name + '_A'] = { board: f, boardDoc: sh, live: lv.f, liveDoc: lv.sh, diff: diff(f, lv.f) }; await ctx.close(); }
  // B: Mark's edits (sheetedits.py) changed the table and removed the side column, so only the parts the edits leave alone are compared with the live page (at 880, article 816, print,
  // folds open): the band, Before you start and the Instructions, by width and height (their y moves with the shorter table). The table and Balance have no live counterpart now.
  { const { ctx, page } = await mk(816, 'print'); await page.goto(await local('PrintStartingPoint.dc.html')); await page.waitForTimeout(500);
    const f = await page.evaluate(sheetFacts); const sh = await page.evaluate(() => ({ docH: document.documentElement.scrollHeight }));
    const lv = await live(880, 'print', true);
    const kept = ['recipe-band', 'before-region', 'method-region'].filter((k) => { const x = f.sections[k], y = lv.f.sections[k]; return !y || Math.abs(x[2] - y[2]) > 2 || Math.abs(x[3] - y[3]) > 2; }).map((k) => `${k}: board ${f.sections[k]} live ${lv.f.sections[k]}`);
    result[name + '_B'] = { board: f, boardDoc: sh, live: lv.f, diff: kept, table: await page.evaluate(tableFacts) }; await ctx.close(); }
  { const { ctx, page } = await mk(816, 'print'); await page.goto(await local('PrintStartingPointBalanceCol2.dc.html')); await page.waitForTimeout(500);
    result[name + '_C'] = { board: await page.evaluate(sheetFacts), boardDoc: await page.evaluate(() => ({ docH: document.documentElement.scrollHeight })), diff: [], table: await page.evaluate(tableFacts),
      cols: await page.evaluate(() => { const a = document.querySelector('article.recipe-page'); const r = (s) => { const e = a.querySelector(s); return e ? Math.round(e.getBoundingClientRect().width) : null; }; return { grid: getComputedStyle(a).gridTemplateColumns, table: r('.ingredient-table'), side: r('.side-region'), rule: r('.graduated-rule'), balanceButtons: a.querySelectorAll('.side-region .fold-row').length, watchFor: !!a.querySelector('.margin-region') }; }) };
    await ctx.close(); }
  // the log's two sides: a fixed letter page, so the content must end above the foot, and the type is never shrunk to make it fit
  for (const f of ['BatchLogForm.dc.html', 'TastingLogForm.dc.html']) {
    const { ctx, page } = await mk(816, 'print'); await page.goto(await local(f)); await page.waitForTimeout(300);
    result[name + '_' + f.replace('.dc.html', '')] = await page.evaluate(() => {
      const lf = document.querySelector('.lf'); const foot = lf.querySelector('.lf-foot'); const kids = [...lf.children].filter((k) => k !== foot);
      const last = Math.max(...kids.map((k) => k.getBoundingClientRect().bottom)); const ft = foot.getBoundingClientRect();
      const fs = [...lf.querySelectorAll('*')].filter((e) => e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())).map((e) => parseFloat(getComputedStyle(e).fontSize));
      const colours = [...new Set([...lf.querySelectorAll('*')].flatMap((e) => { const s = getComputedStyle(e); return [s.color, s.borderBottomColor].filter((c) => c !== 'rgba(0, 0, 0, 0)'); }))];
      return { scrollH: lf.scrollHeight, contentBottom: Math.round(last), footTop: Math.round(ft.top), footBottom: Math.round(ft.bottom), spare: Math.round(ft.top - last), minFont: Math.min(...fs), colours, lines: lf.querySelectorAll('.lf-line').length, boxes: lf.querySelectorAll('.lf-box').length, stops: lf.querySelectorAll('.lf-stop').length };
    });
    await ctx.close();
  }
}
await engines.webkit.close(); await engines.chromium.close(); await servers.close();
result.boardH = Math.ceil(Math.max(result.chromium_B.boardDoc.docH, result.webkit_B.boardDoc.docH) / 10) * 10 + 10;
result.boardH_col2 = Math.ceil(Math.max(result.chromium_C.boardDoc.docH, result.webkit_C.boardDoc.docH) / 10) * 10 + 10;
await writeFile(OUT, JSON.stringify(result, null, 1));
for (const k of Object.keys(result)) if (k.includes('Form')) console.log(k, JSON.stringify(result[k])); else if (!k.startsWith('boardH')) console.log(k, 'diff:', JSON.stringify(result[k].diff), 'board article', result[k].board.article, 'live', result[k].live?.article, 'doc', JSON.stringify(result[k].boardDoc));
console.log('boardH', result.boardH, 'boardH_col2', result.boardH_col2);
for (const k of ['webkit_B', 'chromium_B', 'webkit_C', 'chromium_C']) console.log(k, JSON.stringify(result[k].table), JSON.stringify(result[k].cols || ''));
