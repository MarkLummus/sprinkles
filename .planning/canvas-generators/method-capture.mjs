// Sid, 2026-10-07 (row draw-method-print-treatment, D18): captures the built Sheet's Instructions again, from the dist, for the method-on-paper boards.
//   node method-capture.mjs   -> method-capture.json
//     article   the Sheet (article.recipe-page) as the build renders it for Olive Oil v1 with no batch (the version's seeded batch deleted from the throwaway store, as printstart-capture.mjs does), WebKit, 1280
//     facts     what the build draws for the step number, the lead, the target chips, Purpose and Aside: computed face, size, weight, style, margins, border; the step heights at the print widths
//               (Chrome 696 and Safari 652, the 0.75 in left margin of D16; print media emulated) in WebKit (coarse pointer) and Chromium; and whether any step breaks across a page at a 960 and a 900 px page.
// Served from app/dist on a throwaway 127.0.0.1 port by the 03.5 probe harness; Mark's preview on :4173 is never contacted and nothing is built here.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROUTE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const dropBatches = (vid = 'olive-oil-ice-cream-v1') => new Promise((res, rej) => { const o = indexedDB.open('sprinkles'); o.onerror = () => rej(o.error); o.onsuccess = () => { const db = o.result; const tx = db.transaction('batches', 'readwrite'); const st = tx.objectStore('batches'); const q = st.index('by-version').getAllKeys(vid); q.onsuccess = () => { for (const k of q.result) st.delete(k); }; tx.oncomplete = () => { db.close(); res(); }; tx.onerror = () => rej(tx.error); }; });
const servers = await startServers();
const engines = { webkit: await webkit.launch(), chromium: await chromium.launch({ executablePath: CHROME, headless: true }) };
const style = (e) => { const s = getComputedStyle(e); return { face: s.fontFamily.split(',')[0].replace(/['"]/g, ''), size: s.fontSize, weight: s.fontWeight, style: s.fontStyle, lh: s.lineHeight, color: s.color, mt: s.marginTop, mb: s.marginBottom, ml: s.marginLeft, bl: s.borderLeftWidth + ' ' + s.borderLeftStyle, bb: s.borderBottomWidth + ' ' + s.borderBottomStyle, border: s.borderTopWidth + ' ' + s.borderTopStyle, pad: s.padding, tt: s.textTransform, ls: s.letterSpacing, deco: s.textDecorationLine, maxW: s.maxWidth, w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height) }; };
const out = { facts: {} };
for (const [name, br] of Object.entries(engines)) {
  const ctx = await br.newContext({ viewport: { width: 1280, height: 1000 }, hasTouch: name === 'webkit', deviceScaleFactor: 1 });
  await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await ctx.newPage(); page.setDefaultTimeout(10000);
  await page.goto(servers.appUrl + ROUTE, { waitUntil: 'networkidle' }); await page.waitForSelector('article.recipe-page .ingredient-table');
  await page.evaluate(dropBatches); await page.reload({ waitUntil: 'networkidle' }); await page.waitForSelector('article.recipe-page .ingredient-table'); await page.waitForTimeout(300); await page.evaluate(() => document.fonts.ready);
  if (name === 'webkit') out.article = await page.evaluate(() => document.querySelector('article.recipe-page').outerHTML);
  out.facts[name + '_screen1280'] = await page.evaluate((style) => { const f = eval('(' + style + ')'); const q = (s) => document.querySelector('.method-step ' + s) || document.querySelector(s);
    const st = (s) => { const e = document.querySelector(s); return e ? f(e) : null; };
    return { n: st('.method-step__n'), lead: st('.method-step__lead'), leadB: st('.method-step__lead b'), chip: st('.target-chip'), chipLabel: st('.target-chip__label'), chipValue: st('.target-chip__value'), purpose: st('.method-step__purpose'), aside: st('.method-step__aside'), step: st('.method-step'), heading: st('.method-region .region-name'),
      steps: document.querySelectorAll('.method-step').length, withPurpose: document.querySelectorAll('.method-step__purpose').length, withAside: document.querySelectorAll('.method-step__aside').length, withTargets: document.querySelectorAll('.method-step__targets').length, chips: document.querySelectorAll('.target-chip').length }; }, style.toString());
  await page.close();
  for (const [k, W, H] of [['chrome', 696, 960], ['safari', 652, 900]]) {
    const p2 = await ctx.newPage(); await p2.setViewportSize({ width: W, height: 1000 }); await p2.goto(servers.appUrl + ROUTE, { waitUntil: 'networkidle' }); await p2.waitForSelector('article.recipe-page .ingredient-table'); await p2.evaluate(dropBatches); await p2.reload({ waitUntil: 'networkidle' }); await p2.waitForSelector('.method-step'); await p2.emulateMedia({ media: 'print' }); await p2.waitForTimeout(300);
    out.facts[name + '_print' + W] = await p2.evaluate(([H]) => { const a = document.querySelector('.method-region'); const r = (e) => e.getBoundingClientRect(); const top = r(a).top + scrollY; const steps = [...a.querySelectorAll('.method-step')].map((e) => Math.round(r(e).height));
      return { regionW: Math.round(r(a).width), regionH: Math.round(r(a).height), steps, headingH: Math.round(r(a.querySelector('.region-name')).height), breakInside: getComputedStyle(a.querySelector('.method-step')).breakInside }; }, [H]);
    await p2.close();
  }
  await ctx.close();
}
await engines.webkit.close(); await engines.chromium.close(); await servers.close();
await writeFile(path.join(HERE, 'method-capture.json'), JSON.stringify(out));
console.log(JSON.stringify(out.facts, null, 1).slice(0, 9000)); console.log('article', out.article.length);
process.exit(0);
