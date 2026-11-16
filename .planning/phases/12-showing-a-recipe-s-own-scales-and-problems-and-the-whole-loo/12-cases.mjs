// Phase 12: the one source of sketch 015's example recipes for every Phase 12 harness
// (12-stops-probe.mjs here; 12-print-check in 12-02; the board specs in 12-04; 12-safari-check in 12-05).
//
//   import { CASES, inject, arrive } from './12-cases.mjs';
//
// CASES two, one and none are copied as they are from .planning/canvas-generators/p12-capture.mjs
// (route, version id, declared scales with key, name, low, high, kind and group 'declared',
// declared problems, marks, ticks, and the pen's picks). The example words are Sid's: they are not
// Mark's and not in the data. Case `worst` is 12-02's long-words report: Olive Oil v1 with long
// scale names, long end words and long problem words; it carries marks {} and ticks [] on purpose,
// because TastingReading reads tasting.marks before its fold (BatchRow.jsx:293-294) and the
// version route renders it, so inject writing undefined there would throw when `arrive` reloads.
//
// `inject` is a plain function with no imports and no closures (it can go to page.evaluate or be
// serialized into a seed page). It writes only the page's own IndexedDB 'sprinkles' (the
// throwaway context's, never a file on disk): the version's declaredAxes and declaredFlaws and,
// through the batches' 'by-version' index, each batch's snapshot.declaredAxes,
// snapshot.declaredFlaws, tasting.marks and tasting.declaredDefects.
//
// inject runs ONLY after the app has opened the database (a '.notebook-log' on screen), never on
// a page where the app has not booted. It opens 'sprinkles' with no version: on a database that
// does not exist yet it would create a storeless version 1, throw inside its own success handler
// with its connection left open, and the app's own open (DB_VERSION 10, app/src/store/db.js:84)
// would then wait behind it on "Close other Sprinkles tabs to finish updating."
// (app/src/main.jsx:20-27). `arrive` keeps that order.
//
// Everything typed is English.

const D = (key, name, low, high, kind) => ({ key, name, low, high, kind, group: 'declared' });

const OLIVE_OIL_V1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';

export const CASES = {
  two: { route: OLIVE_OIL_V1, vid: 'olive-oil-ice-cream-v1', axes: [D('body', 'Body', 'thin', 'heavy', 'goldilocks'), D('coffee', 'Coffee flavour', 'faint', 'strong', 'magnitude')], flaws: ['Bitter', 'Burnt taste'], marks: { sweetness: 4, body: 4, coffee: 2 }, ticks: ['Bitter', 'Burnt taste'], pen: [['Body', 4], ['Coffee flavour', 2]] },
  one: { route: OLIVE_OIL_V1, vid: 'olive-oil-ice-cream-v1', axes: [D('mint', 'Mint', 'faint', 'strong', 'magnitude')], flaws: ['Waxy chips'], marks: { sweetness: 4, mint: 5 }, ticks: ['Waxy chips'], pen: [['Mint', 5]] },
  none: { route: '/notebook/mexican-chocolate/mexican-chocolate-v1', vid: 'mexican-chocolate-v1', pen: [] },
  worst: { route: OLIVE_OIL_V1, vid: 'olive-oil-ice-cream-v1', axes: [D('browndepth', 'Brown butter and toasted pecan depth', 'barely there at all', 'overwhelmingly nutty', 'magnitude'), D('caramelribbon', 'Ribbon of salted caramel through it', 'too thin and sparse', 'too thick and gluey', 'goldilocks')], flaws: ['Crunchy ice crystals along the edges', 'Sandy lactose grit on the tongue'], marks: {}, ticks: [], pen: [] },
};

// Rewrites the version's declared scales and problems and its batches' snapshots and stored
// marks in this page's own IndexedDB. Plain function: no imports, no closures.
export const inject = (c) => new Promise((res, rej) => { const o = indexedDB.open('sprinkles'); o.onerror = () => rej(o.error); o.onsuccess = () => { const db = o.result; const tx = db.transaction(['versions', 'batches'], 'readwrite');
  const vs = tx.objectStore('versions'); vs.get(c.vid).onsuccess = (e) => { const v = e.target.result; v.declaredAxes = c.axes; v.declaredFlaws = c.flaws; vs.put(v); };
  const bs = tx.objectStore('batches'); bs.index('by-version').getAll(c.vid).onsuccess = (e) => { for (const b of e.target.result) { b.snapshot.declaredAxes = c.axes; b.snapshot.declaredFlaws = c.flaws; if (b.tasting) { b.tasting.marks = c.marks; b.tasting.declaredDefects = c.ticks; } bs.put(b); } };
  tx.oncomplete = () => { db.close(); res(true); }; tx.onerror = () => rej(tx.error); }; });

// Loads the case's route, waits for the notebook log (the app has opened its database), injects
// when the case declares scales, loads the route again and waits for the log once more.
export async function arrive(page, appUrl, caseKey) {
  const c = CASES[caseKey];
  if (!c) throw new Error(`arrive: no case named ${caseKey}`);
  const load = async () => {
    await page.goto(appUrl + c.route, { waitUntil: 'load' });
    await page.waitForSelector('.notebook-log');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
  };
  await load();
  if (c.axes) {
    await page.evaluate(inject, c);
    await load();
  }
  return c;
}
