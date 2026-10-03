// Sid, 2026-10-03 (decision 32): the floors of two of the four columns, measured on the built app (WebKit, coarse, 1366 window, throwaway servers).
//   node ladder-log-nav.mjs   -> ladder-log-nav.json
//  - the batch log column set in-page to 350, 320, 300, 280, 260 and 240 wide: overflow inside the log (reading, and the record pen with Add tasting open)
//    and how many of its labels wrap;
//  - the side nav's natural width: the widest place (icon, gap, label) without its padding.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OLIVE1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89';
const servers = await startServers(); const b = await webkit.launch(); const out = [];
for (const logW of [350, 320, 300, 280, 260, 240]) for (const state of ['reading', 'pen']) {
  const ctx = await b.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: true });
  await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const p = await ctx.newPage();
  await p.goto(servers.appUrl + OLIVE1, { waitUntil: 'networkidle' }); await p.waitForSelector('.notebook-log');
  if (state === 'pen') { await p.getByRole('button', { name: /^Record another$/ }).first().click(); await p.waitForSelector('.notebook-log .save-ceremony'); const t = p.getByRole('button', { name: /Add tasting/ }).first(); if (await t.count()) await t.click(); }
  await p.addStyleTag({ content: `.notebook-log{flex:0 0 ${logW}px !important;width:${logW}px !important}` }); await p.waitForTimeout(100);
  out.push({ logW, state, ...(await p.evaluate(() => {
    const log = document.querySelector('.notebook-log'); const L = log.getBoundingClientRect();
    const over = [...log.querySelectorAll('*')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > L.right + 0.5 || r.left < L.left - 0.5); });
    const wrappedLabels = [...log.querySelectorAll('.pen-caption, label, dt, .batch-cell__label, h2, h3')].filter((e) => { const cs = getComputedStyle(e); const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2; return e.getBoundingClientRect().height > lh * 1.6 && e.textContent.trim().length < 40; }).length;
    return { width: Math.round(L.width), scrollOver: log.scrollWidth - log.clientWidth, outside: over.length, wrappedLabels, height: Math.round(L.height), overflowPage: document.documentElement.scrollWidth - innerWidth };
  })) });
  await ctx.close();
}
// nav natural width
const ctx = await b.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: true }); const p = await ctx.newPage();
await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
await p.goto(servers.appUrl + OLIVE1, { waitUntil: 'networkidle' });
const nav = await p.evaluate(() => [...document.querySelectorAll('.shell__rail .shell__place')].map((a) => { const cs = getComputedStyle(a); const svg = a.querySelector('svg'); const txt = [...a.childNodes].filter((n) => n.nodeType === 3 || (n.nodeType === 1 && n.tagName !== 'svg' && n.tagName !== 'SVG')); const r = document.createRange(); r.selectNodeContents(a); const label = a.textContent.trim(); const range = document.createRange(); const tn = [...a.childNodes].reverse().find((n) => n.nodeType === 3 && n.textContent.trim()); if (tn) range.selectNodeContents(tn); return { label, labelW: tn ? Math.round(range.getBoundingClientRect().width * 10) / 10 : null, iconW: svg ? svg.getBoundingClientRect().width : null, gap: cs.columnGap, padL: cs.paddingLeft, padR: cs.paddingRight, w: Math.round(a.getBoundingClientRect().width) }; }));
out.push({ nav, rail: await p.evaluate(() => { const r = document.querySelector('.shell__rail'); const cs = getComputedStyle(r); return { w: r.getBoundingClientRect().width, padL: cs.paddingLeft, padR: cs.paddingRight }; }) });
await b.close(); await servers.close();
await writeFile(path.join(HERE, 'ladder-log-nav.json'), JSON.stringify(out));
console.log('ok');
