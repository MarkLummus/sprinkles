// Sid, 2026-10-04 (decision 34, "Small info labels at wide widths"): measures, in the built app, the distance between a row's left label and the small info text at its far end.
//   node far-end-probe.mjs  -> far-end-probe.json   (WebKit, coarse pointer for the iPad widths; the server is a throwaway 127.0.0.1 one)
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROUTES = { mex3: '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01', olive1: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89',
  mocha3: '/notebook/mocha/mocha-v3', coconut2: '/notebook/coconut/coconut-v2', straw: '/notebook/strawberry/strawberry-v2-1', pine: '/notebook/pineapple/pineapple-v1' };
const WIDTHS = (process.env.W || '393,744,984,1366,1600,1920').split(',').map(Number);
const which = (process.env.R || 'mex3,olive1').split(',');
const collect = () => {
  const out = []; const R = (e) => e.getBoundingClientRect(); const textRight = (e) => { const r = document.createRange(); r.selectNodeContents(e); const rs = [...r.getClientRects()].filter((x) => x.width > 0); return rs.length ? Math.max(...rs.map((x) => x.right)) : R(e).right; };
  const textLeft = (e) => { const r = document.createRange(); r.selectNodeContents(e); const rs = [...r.getClientRects()].filter((x) => x.width > 0); return rs.length ? Math.min(...rs.map((x) => x.left)) : R(e).left; };
  const vis = (e) => e && getComputedStyle(e).display !== 'none' && R(e).width > 0;
  const add = (kase, left, right, row, kind) => { if (!vis(left) || !vis(right)) return; const L = textRight(left), Rl = textLeft(right); const a = R(left), b = R(right); const same = b.top < a.bottom - 2 && a.top < b.bottom - 2; out.push({ kase, leftText: left.textContent.trim().slice(0, 30), rightText: right.textContent.trim().slice(0, 34), gap: same ? Math.round(Rl - L) : null, stacked: !same, rowW: Math.round(R(row).width), kind }); };
  for (const f of document.querySelectorAll('.fold-row')) { const cap = f.querySelector('.fold-row__head'); const ctl = f.querySelector('.fold-row__control'); const cnt = f.querySelector('.fold-row__count'); const name = (cap.firstChild.textContent || '').trim(); if (cnt) add('Fold row: ' + name, ctl, cnt, f, 'count/date'); else if (vis(f)) out.push({ kase: 'Fold row: ' + name + ' (no far text)', leftText: name, rightText: '', gap: null, rowW: Math.round(R(f).width), kind: 'none' }); }
  for (const j of document.querySelectorAll('.notebook-jump')) add('Go to batch row', j.querySelector('.notebook-jump__control'), j.querySelector('.notebook-jump__status'), j, 'state');
  for (const h of document.querySelectorAll('.batch-row__head')) { const lead = h.querySelector('.batch-row__head-lead'); const acts = h.querySelector('.batch-row__head-acts'); if (lead && acts) add('Batch log head: date to Correct / Record another', lead.lastElementChild, acts, h, 'date to actions'); }
  const hd = document.querySelector('.shell__head'); if (hd) { const brand = hd.querySelector('.shell__brand'); const tools = hd.querySelector('.shell__tools'); if (tools) add('Header: wordmark to Search / Import / Export', brand, tools, hd, 'actions'); }
  for (const g of document.querySelectorAll('.graduated-rule__head')) { const l = g.querySelector('.graduated-rule__label'); const v = g.querySelector('.graduated-rule__value'); if (l && v) { add('Balance rule head: ' + l.textContent.trim().slice(0, 14), l, v, g, 'value'); break; } }
  const dl = document.querySelector('.notebook-version__details'); if (dl) { const dt = dl.querySelector('dt'); const dd = dl.querySelector('dd'); add('Version details: Written to its date', dt, dd, dl, 'label/value'); }
  const n = document.querySelector('.ingredient-table td.ingredient-table__col-name'); if (n) { const row = n.closest('tr'); const sh = row.querySelector('td:last-child'); const chip = n.querySelector('.target-chip'); const lastRight = chip ? R(chip).right : textRight(n); out.push({ kase: 'Ingredient row: name (and tag) to % of batch', leftText: n.textContent.trim().slice(0, 20), rightText: sh.textContent.trim().slice(0, 12), gap: Math.round(textLeft(sh) - lastRight), rowW: Math.round(R(row).width), kind: 'figure' }); }
  const cs = document.querySelector('.notebook-log .batch-row__cells'); if (cs) { const c = cs.querySelector('.batch-row__cell'); add('Log churn cell: label to value', c.querySelector('.batch-row__cell-label'), c.querySelector('.batch-row__unit'), c, 'label/value'); }
  return out;
};
const servers = await startServers(); const browser = await webkit.launch(); const res = [];
for (const key of which) for (const W of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 1000 }, hasTouch: W <= 1366, deviceScaleFactor: 1 }); await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await ctx.newPage(); page.setDefaultTimeout(15000);
  await page.goto(servers.appUrl + ROUTES[key], { waitUntil: 'networkidle' }); await page.waitForSelector('.shell'); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(150);
  res.push({ key, W, items: await page.evaluate(collect) });
  await ctx.close();
}
await browser.close(); await servers.close();
await writeFile(path.join(HERE, process.env.OUT || 'far-end-probe.json'), JSON.stringify(res, null, 1));
for (const r of res) for (const i of r.items) console.log(r.key, r.W, i.kase, '|', i.leftText, '|', i.rightText, '| gap', i.gap, 'row', i.rowW);
process.exit(0);
