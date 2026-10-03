// Sid, 2026-10-03 (decision 33, the sticky header): what the sticky app header does on the built app, in-page (the header rules of nav-candidates.css HDR, no app edit).
//   node header-test.mjs   -> header-test.json
// Measures: the header's height at the six iPad windows; that it stays at the top of the window when the page is scrolled; where the Batch heading lands after Go to batch and after
// scrollIntoView, with and without scroll-padding-top; whether any ancestor of the header has an overflow that would stop position: sticky.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const nav = await readFile(path.join(HERE, 'nav-candidates.css'), 'utf8');
const sec = (name) => nav.match(new RegExp('/\\* === ' + name + ' ===[^*]*\\*/([\\s\\S]*?)(?=/\\* === |$)'))[1];
const HDR = sec('HDR'), JUMP = sec('JUMP');
const OLIVE1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89';
const WINDOWS = [['iPad mini portrait', 744, 1133], ['11in iPad Pro portrait', 834, 1194], ['12.9in iPad Pro portrait', 1024, 1366], ['iPad mini landscape', 1133, 744], ['11in iPad Pro landscape', 1194, 834], ['12.9in iPad Pro landscape', 1366, 1024]];
const servers = await startServers(); const out = [];
for (const [engine, mk] of [['webkit', () => webkit.launch()], ['chrome', () => launch()]]) {
  const b = await mk();
  for (const [label, W, H] of WINDOWS) for (const padded of [false, true]) {
    const vis = H - 70;
    const ctx = await b.newContext({ viewport: { width: W, height: vis }, hasTouch: true });
    await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
    const p = await ctx.newPage();
    await p.goto(servers.appUrl + OLIVE1, { waitUntil: 'networkidle' }); await p.waitForSelector('.ingredient-table');
    await p.addStyleTag({ content: HDR.replace('html{scroll-padding-top:57px}', padded ? 'html{scroll-padding-top:57px}' : '') + (W < 1366 ? JUMP : '') });
    await p.waitForTimeout(100);
    const r0 = await p.evaluate(() => { const h = document.querySelector('.shell__head'); const cs = getComputedStyle(h); const anc = []; for (let e = h.parentElement; e; e = e.parentElement) { const o = getComputedStyle(e); if (o.overflow !== 'visible' || o.overflowX !== 'visible' || o.overflowY !== 'visible') anc.push([e.tagName, e.className, o.overflow]); } return { headH: Math.round(h.getBoundingClientRect().height * 10) / 10, top0: Math.round(h.getBoundingClientRect().top), position: cs.position, blockedBy: anc }; });
    await p.evaluate(() => window.scrollTo(0, 1500)); await p.waitForTimeout(100);
    const r1 = await p.evaluate(() => ({ topAt1500: Math.round(document.querySelector('.shell__head').getBoundingClientRect().top), scrollY: Math.round(scrollY) }));
    // Go to batch (below 1366) / the batch heading focus; and a scrollIntoView to the top edge
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(50);
    let landing = null;
    if (W < 1366) { await p.getByRole('link', { name: /^Go to batch/ }).first().click(); await p.waitForTimeout(400); landing = await p.evaluate(() => { const h = document.querySelector('#batch'); return { top: Math.round(h.getBoundingClientRect().top), focused: document.activeElement === h, scrollY: Math.round(scrollY) }; }); }
    await p.evaluate(() => window.scrollTo(0, 0));
    const anchor = await p.evaluate(() => { document.querySelector('#batch').scrollIntoView({ block: 'start' }); return Math.round(document.querySelector('#batch').getBoundingClientRect().top); });
    out.push({ engine, label, W, H, vis, scrollPadding: padded, ...r0, ...r1, goToBatchLanding: landing, scrollIntoViewStartTop: anchor });
    await ctx.close();
  }
  await b.close();
}
await servers.close();
await writeFile(path.join(HERE, 'header-test.json'), JSON.stringify(out));
console.log('ok', out.length);
