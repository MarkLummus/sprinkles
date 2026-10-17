// Sid, 2026-10-17 (Phase 9 design gate; PLACE-01, PLACE-02): captures the built app for the two place boards drawn on top of it.
//   node places-capture.mjs   -> places-capture.json (keys kind_W)
//     chrome_notebook_W   the whole shell with the Notebook place current and .shell__main emptied to the token @@MAIN@@
//     chrome_ingredients_W the same with the Ingredients place current
//     home_W              Home as built (the list the Notebook place is read against)
//     data                the seeded store's recipes, versions and batches (the real fields a Notebook row can carry)
//   1366 coarse pointer (the iPad, wide touch) and 393 coarse; WebKit; read from the preview on 127.0.0.1:4173 (npm --prefix app run build && npm --prefix app run preview -- --host 127.0.0.1 --port 4173). Nothing is built or started here.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://127.0.0.1:4173';
const chrome = () => { const root = document.querySelector('.shell').cloneNode(true); root.querySelector('.shell__main').innerHTML = '@@MAIN@@'; return root.outerHTML; };
const out = {}; const b = await webkit.launch();
for (const [W, H] of [[1366, 1024], [393, 852]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); p.setDefaultTimeout(10000);
  await p.goto(BASE + '/', { waitUntil: 'networkidle' }); await p.waitForSelector('.home__lead'); await p.waitForTimeout(300); await p.evaluate(() => document.fonts.ready);
  out['coarse_' + W] = await p.evaluate(() => matchMedia('(pointer: coarse)').matches);
  out['home_' + W] = await p.evaluate(() => document.querySelector('.shell').outerHTML);
  if (W === 1366) out.data = await p.evaluate(() => new Promise((res) => { const o = indexedDB.open('sprinkles'); o.onsuccess = () => { const db = o.result; const get = (s) => new Promise((r) => { const q = db.transaction(s).objectStore(s).getAll(); q.onsuccess = () => r(q.result); });
    Promise.all([get('recipes'), get('versions'), get('batches')]).then(([recipes, versions, batches]) => res({ recipes, versions: versions.map((v) => ({ id: v.id, recipeId: v.recipeId, versionLabel: v.versionLabel, createdAt: v.createdAt, sheetTitle: v.sheetTitle })), batches: batches.map((x) => ({ id: x.id, versionId: x.versionId, recordedAt: x.recordedAt, churnDate: x.churn && x.churn.churnDate, tasting: !!x.tasting }))})); }; }));
  await p.goto(BASE + '/notebook', { waitUntil: 'networkidle' }); await p.waitForSelector('.place__title'); await p.waitForTimeout(300);
  out['chrome_notebook_' + W] = await p.evaluate(chrome);
  await p.goto(BASE + '/ingredients', { waitUntil: 'networkidle' }); await p.waitForSelector('.place__title'); await p.waitForTimeout(300);
  out['chrome_ingredients_' + W] = await p.evaluate(chrome);
  await ctx.close();
}
await b.close(); await writeFile(path.join(HERE, 'places-capture.json'), JSON.stringify(out));
console.log(Object.entries(out).map(([k, v]) => k + ' ' + (typeof v === 'string' ? v.length : JSON.stringify(v).slice(0, 80))).join('\n')); process.exit(0);
