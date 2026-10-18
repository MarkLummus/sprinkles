// Sid, 2026-10-17 (Phase 10 design gate; MAKE-04 to MAKE-09, MAKE-11, TASTE-01, TASTE-02): captures the built app for the creation-editor boards.
//   node p10-capture.mjs <dist preview base, default http://127.0.0.1:4173>   -> p10-capture.json
// The editor is the recipe page's pen (Phase 8's split RecipePage) with no parent. The built app has no creation mode yet, so this seeds a scratch profile (a stand-in recipe,
// "Vanilla", with five library rows and no steps) and opens its Next version pen, so the ingredient table, the Before you start region and the Balance figures are the app's own markup
// computed by the app's own domain code. Nothing is written to the repo's app/. States (key, rows, targets):
//   empty   no rows, no targets      rows   five rows, no targets      phil   five rows, Philadelphia's approved bands      edit   the same with Fat edited to 10-16
//   less    phil without the skim milk powder (a row removed)   two   milk and cream   three   milk, cream and sucrose at 0 g (a row just added)   sorb   five rows, Sorbet's approved bands (does the Balance rule hold its 24-32 Sweetness band?)
// 1366 and 393, WebKit, coarse pointer. Per state: the Ingredients region, the Balance region (open at both widths), the Before you start region; once per width: the shell with main emptied.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://127.0.0.1:4173';
const PHIL = { pod: [14, 18], fat: [10, 18], msnf: [8, 12], solids: [36, 42] };
const ROWS = [['wholeMilk', 600], ['heavyCream', 250], ['skimMilkPowder', 30], ['sucrose', 150], ['vanillaExtract', 5]];
const LESS = ROWS.filter(([k]) => k !== 'skimMilkPowder');
const STATES = { empty: { rows: [], targets: {} }, rows: { rows: ROWS, targets: {} }, phil: { rows: ROWS, targets: PHIL }, edit: { rows: ROWS, targets: { ...PHIL, fat: [10, 16] } },
  less: { rows: LESS, targets: PHIL }, two: { rows: ROWS.slice(0, 2), targets: PHIL }, three: { rows: [...ROWS.slice(0, 2), ['sucrose', 0]], targets: PHIL },
  sorb: { rows: ROWS, targets: { pod: [24, 32], solids: [26, 36] } } };
const out = {};
const b = await webkit.launch();
for (const [W, H] of [[1366, 1024], [393, 852]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); p.setDefaultTimeout(10000);
  await p.goto(BASE + '/', { waitUntil: 'networkidle' }); await p.waitForSelector('.home__lead'); await p.waitForTimeout(300);
  await p.evaluate(async (args) => {
    const { STATES } = args;
    const db = await new Promise((res, rej) => { const o = indexedDB.open('sprinkles'); o.onsuccess = () => res(o.result); o.onerror = () => rej(o.error); });
    const all = (s) => new Promise((r) => { const q = db.transaction(s).objectStore(s).getAll(); q.onsuccess = () => r(q.result); });
    const lib = await all('library'); const versions = await all('versions');
    const base = versions.find((v) => v.id === 'olive-oil-ice-cream-v1');
    const tx = db.transaction(['recipes', 'versions'], 'readwrite');
    tx.objectStore('recipes').put({ id: 'vanilla', name: 'Vanilla', description: 'Plain and cold.' });
    for (const [key, st] of Object.entries(STATES)) {
      const rows = st.rows.map(([k, g], i) => { const rec = lib.find((r) => r.id === k); return { id: 'row-0' + (i + 1), ingredientName: rec.entry.name, ingredient: structuredClone(rec.entry), portions: [{ step: 1, grams: g }], removed: false }; });
      const v = structuredClone(base);
      Object.assign(v, { id: 'vanilla-' + key, recipeId: 'vanilla', versionLabel: 'Version 1', sheetTitle: 'Vanilla', sheetDescription: 'Plain and cold.', rows, targets: st.targets, method: [], declaredAxes: [], declaredFlaws: [], authored: { beforeYouStart: [] } });
      delete v.equipment; delete v.process;
      tx.objectStore('versions').put(v);
    }
    await new Promise((r) => { tx.oncomplete = r; });
  }, { STATES });
  for (const key of Object.keys(STATES)) {
    await p.goto(BASE + '/notebook/vanilla/vanilla-' + key, { waitUntil: 'networkidle' }); await p.waitForSelector('.notebook-band'); await p.waitForTimeout(300);
    await p.getByRole('button', { name: 'Next version' }).first().click(); await p.waitForTimeout(500);
    const bal = p.getByRole('button', { name: /^Balance, Show/ }); if (await bal.count()) { await bal.click(); await p.waitForTimeout(200); }
    out[`${key}_${W}`] = await p.evaluate(() => {
      const g = (s) => { const e = document.querySelector(s); return e ? e.outerHTML : null; };
      return { ingredients: g('.ingredient-table-region'), balance: g('.formulation-note-region'), before: g('.before-region'), sheet: g('.recipe-page'), body: g('.notebook-body') };
    });
    if (key === 'phil') {
      out['chrome_' + W] = await p.evaluate(() => { const root = document.querySelector('.shell').cloneNode(true); root.querySelector('.shell__main').innerHTML = '@@MAIN@@'; return root.outerHTML; });
      out['ceremony_' + W] = await p.evaluate(() => document.querySelector('.notebook-band').outerHTML);
    }
  }
  await ctx.close();
}
await b.close(); await writeFile(path.join(HERE, 'p10-capture.json'), JSON.stringify(out));
console.log(Object.entries(out).map(([k, v]) => k + ' ' + (typeof v === 'string' ? v.length : Object.keys(v).length)).join('\n')); process.exit(0);
