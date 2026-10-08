// Sid, 2026-10-07 (Phase 4 D-00, D-04, D-10, D-15, D-18; Mark's List row draw-phase-04-print-route-home-draft-notice): captures the built app for the three Phase 4 screens drawn on top of it.
//   node phase4screens-capture.mjs   -> phase4screens-capture.json (keys kind_W)
//     home_W   the whole shell on Home (the seeded store: the lead is Mexican Chocolate, version 4)         -> the code link and the open-draft line are drawn on this
//     pen_W    the whole shell on Olive Oil v1 with the Next version pen open, a version name, a Why and one gram typed (Whole milk, portion 1: 110 g, was 120 g); .page-status is empty
//     chrome_W the same shell with .shell__main emptied to the token @@MAIN@@ (the Notebook place current): the print route's frame
//   1280 fine pointer, 393 coarse (touch). WebKit, read from the preview already on 127.0.0.1:4173 (the dist of 2026-10-06, newer than every file under app/src); no server is started and nothing is built here.
//   facts_W: the version row's real figures (Olive Oil v1: createdAt, sheetTitle) and the real notice box (.page-status with "Draft kept." set on the live DOM), WebKit.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://127.0.0.1:4173', V1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const grab = () => { const root = document.querySelector('.shell').cloneNode(true); const live = document.querySelector('.shell');
  const lf = live.querySelectorAll('input, textarea'); const cf = root.querySelectorAll('input, textarea');
  lf.forEach((e, i) => { const c = cf[i]; if (e.tagName === 'TEXTAREA') c.textContent = e.value; else if (e.type === 'radio' || e.type === 'checkbox') { if (e.checked) c.setAttribute('checked', ''); else c.removeAttribute('checked'); } else c.setAttribute('value', e.value); });
  return root.outerHTML; };
const out = {}; const b = await webkit.launch();
for (const [W, coarse] of [[1280, false], [393, true]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: 1000 }, hasTouch: coarse, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); p.setDefaultTimeout(10000);
  await p.goto(BASE + '/', { waitUntil: 'networkidle' }); await p.waitForSelector('.home__lead'); await p.waitForTimeout(300); await p.evaluate(() => document.fonts.ready);
  out['home_' + W] = await p.evaluate(grab);
  await p.goto(BASE + V1, { waitUntil: 'networkidle' }); await p.waitForSelector('.notebook-log'); await p.waitForTimeout(300);
  out['facts_' + W] = await p.evaluate(() => new Promise((res) => { const o = indexedDB.open('sprinkles'); o.onsuccess = () => { const q = o.result.transaction('versions').objectStore('versions').get('olive-oil-ice-cream-v1'); q.onsuccess = () => res({ createdAt: q.result.createdAt, sheetTitle: q.result.sheetTitle, versionLabel: q.result.versionLabel }); }; }));
  await p.getByRole('button', { name: /next version/i }).first().click(); await p.waitForTimeout(500);
  await p.locator('input[aria-label="Version name"]').fill('less oil');
  await p.locator('textarea[aria-label="Why"]').fill('Less oil, same salt');
  await p.locator('input[aria-label="Whole milk, grams, portion 1"]').fill('110'); await p.waitForTimeout(300);
  await p.evaluate(() => { window.scrollTo(0, 0); document.activeElement && document.activeElement.blur(); }); await p.waitForTimeout(200);
  await p.evaluate(() => document.fonts.ready);
  out['pen_' + W] = await p.evaluate(grab);
  out['chrome_' + W] = await p.evaluate(() => { const root = document.querySelector('.shell').cloneNode(true); root.querySelector('.shell__main').innerHTML = '@@MAIN@@'; return root.outerHTML; });
  out['facts_' + W].gramY = await p.evaluate(() => Math.round(document.querySelector('input[aria-label="Whole milk, grams, portion 1"]').getBoundingClientRect().top + scrollY));
  out['facts_' + W].notice = await p.evaluate(() => { const n = document.querySelector('.page-status'); n.textContent = 'Draft kept.'; const r = n.getBoundingClientRect(); const t = document.querySelector('.headnote h1, .headnote__title, h1'); const tr = t && t.getBoundingClientRect(); return { notice: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }, title: tr && { text: t.textContent.trim(), x: Math.round(tr.x), y: Math.round(tr.y + scrollY), w: Math.round(tr.width), h: Math.round(tr.height) }, scrollH: document.documentElement.scrollHeight }; });
  await ctx.close();
}
// D20 (Mark, 2026-10-07: the recipe with the open draft takes the lead): Home's lead as the build draws it when Olive Oil is the recipe that leads. A fresh context; the version's createdAt is moved to the newest date in the store so activeWork() puts the recipe first
// (the build's own ordering, nothing else changed); only the lead section is kept (lead_W), the rest of Home is the capture above.
for (const [W, coarse] of [[1280, false], [393, true]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: 1000 }, hasTouch: coarse, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); p.setDefaultTimeout(10000);
  await p.goto(BASE + '/', { waitUntil: 'networkidle' }); await p.waitForSelector('.home__lead');
  await p.evaluate(() => new Promise((res) => { const o = indexedDB.open('sprinkles'); o.onsuccess = () => { const tx = o.result.transaction('versions', 'readwrite'); const st = tx.objectStore('versions'); const q = st.get('olive-oil-ice-cream-v1'); q.onsuccess = () => { const r = q.result; r.createdAt = '2026-12-31T12:00:00.000Z'; st.put(r); }; tx.oncomplete = () => res(); }; }));
  await p.goto(BASE + '/', { waitUntil: 'networkidle' }); await p.waitForSelector('.home__lead'); await p.waitForTimeout(300); await p.evaluate(() => document.fonts.ready);
  out['lead_' + W] = await p.evaluate(() => ({ lead: document.querySelector('.home__lead').outerHTML, name: document.querySelector('.home__lead-name').textContent }));
  await ctx.close();
}
await b.close(); await writeFile(path.join(HERE, 'phase4screens-capture.json'), JSON.stringify(out));
console.log(Object.entries(out).map(([k, v]) => k + ' ' + (typeof v === 'string' ? v.length : JSON.stringify(v))).join('\n')); process.exit(0);
