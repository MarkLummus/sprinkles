// Sid, 2026-10-05 (decision 53): captures the built app's shell with the page notice showing (the fly-out closed) and measures the notice against the open fly-out, for the stacking boards. Reads the preview on 127.0.0.1:4173.
//   node notice-capture.mjs   -> notice-capture.json { "<short|long>_<W>": { html, facts } }   WebKit, coarse; 1366 and 724; Olive Oil v1 saved as a new version, which raises "Version saved." (the "long" notice is the app's own "Tasting removed. You can restore it." set on the same box).
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const LONG = 'Tasting removed. You can restore it.';
const out = {}; const b = await webkit.launch();
for (const W of [1366, 724]) for (const st of ['short', 'long']) {
  const ctx = await b.newContext({ viewport: { width: W, height: 900 }, hasTouch: true, deviceScaleFactor: 1 }); const p = await ctx.newPage(); p.setDefaultTimeout(10000);
  await p.goto('http://127.0.0.1:4173/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', { waitUntil: 'networkidle' }); await p.waitForSelector('.notebook-log'); await p.waitForTimeout(300);
  await p.getByRole('button', { name: /next version/i }).first().click(); await p.waitForTimeout(400);
  await p.getByLabel('Why').fill('test'); await p.getByLabel('Version name').fill('v2'); await p.getByRole('button', { name: 'Save as a new version', exact: true }).click(); await p.waitForTimeout(700);
  if (st === 'long') await p.evaluate((t) => { document.querySelector('.page-status').textContent = t; }, LONG);
  await p.evaluate(() => document.fonts.ready);
  const closed = await p.evaluate(() => { const root = document.querySelector('.shell').cloneNode(true); return root.outerHTML; });
  await p.getByRole('button', { name: 'Places', exact: true }).click(); await p.waitForTimeout(250);
  const facts = await p.evaluate(() => { const r = (e) => { const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; };
    const n = document.querySelector('.page-status'); const nb = n.getBoundingClientRect(); const fly = document.querySelector('.shell__rail');
    const places = [...fly.querySelectorAll('.shell__place')].map((e) => ({ t: e.textContent.trim(), ...r(e) }));
    const cov = (q) => { const x = Math.max(nb.x, q.x), y = Math.max(nb.y, q.y), x2 = Math.min(nb.x + nb.width, q.x + q.w), y2 = Math.min(nb.y + nb.height, q.y + q.h); return x2 > x && y2 > y ? { w: +(x2 - x).toFixed(1), h: +(y2 - y).toFixed(1) } : null; };
    return { text: n.textContent, notice: r(n), fly: r(fly), places: places.map((q) => ({ t: q.t, y: q.y, h: q.h, covered: cov(q) })), z: { notice: getComputedStyle(n).zIndex, fly: getComputedStyle(fly).zIndex, scrim: getComputedStyle(document.querySelector('.shell__scrim')).zIndex, head: getComputedStyle(document.querySelector('.shell__head')).zIndex }, inert: document.querySelector('.shell__main').inert,
      hitAtNoticeCentre: (() => { const e = document.elementFromPoint(nb.x + nb.width / 2, nb.y + nb.height / 2); return e ? (e.className || e.tagName) : null; })(), head: r(document.querySelector('.shell__head')) }; });
  out[`${st}_${W}`] = { html: closed, facts }; await ctx.close();
}
await b.close(); await writeFile(path.join(HERE, 'notice-capture.json'), JSON.stringify(out));
for (const [k, v] of Object.entries(out)) console.log(k, JSON.stringify({ text: v.facts.text, notice: v.facts.notice, covered: v.facts.places.filter((q) => q.covered).map((q) => q.t + ' ' + JSON.stringify(q.covered)), z: v.facts.z, hit: v.facts.hitAtNoticeCentre, inert: v.facts.inert }));
process.exit(0);
