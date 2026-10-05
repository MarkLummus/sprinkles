// Sid, 2026-10-05 (decision 54, the tiles with the hairline): captures the built app's shell at 393 and 723 with More open, for the More-tiles board. Reads the preview on 127.0.0.1:4173; starts nothing, builds nothing.
//   node moretiles-capture.mjs   -> moretiles-capture.json { "<notebook|ingredients>_<393|723>": { html, open, current } }   WebKit, coarse; More tapped open; Olive Oil v1 (a Notebook page), and /ingredients (so Ingredients is the current place).
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const out = {}; const b = await webkit.launch();
for (const W of [393, 723]) for (const [k, route] of [['notebook', '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1'], ['ingredients', '/ingredients']]) {
  const ctx = await b.newContext({ viewport: { width: W, height: 852 }, hasTouch: true, deviceScaleFactor: 2 }); const p = await ctx.newPage(); p.setDefaultTimeout(10000);
  await p.goto('http://127.0.0.1:4173' + route, { waitUntil: 'networkidle' }); await p.waitForSelector('.shell'); await p.waitForTimeout(400); await p.evaluate(() => document.fonts.ready);
  await p.locator('.shell__more > summary').tap(); await p.waitForTimeout(300);
  await p.evaluate(() => document.activeElement && document.activeElement.blur());
  out[`${k}_${W}`] = { html: await p.evaluate(() => document.querySelector('.shell').outerHTML), open: await p.evaluate(() => document.querySelector('.shell__more').open), current: await p.evaluate(() => [...document.querySelectorAll('.shell__more [aria-current]')].map((e) => e.textContent.trim())), innerWidth: await p.evaluate(() => innerWidth) };
  await ctx.close();
}
await b.close(); await writeFile(path.join(HERE, 'moretiles-capture.json'), JSON.stringify(out)); console.log(Object.entries(out).map(([k, v]) => k + ' open=' + v.open + ' vw=' + v.innerWidth + ' current=' + v.current.join(',') + ' ' + v.html.length).join('\n')); process.exit(0);
