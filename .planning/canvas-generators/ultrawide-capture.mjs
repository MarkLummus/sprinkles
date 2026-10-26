// Sid, 2026-10-26 (ultra-wide survey; Mark: "home on an ultra-wide monitor is unusable", "the center from 1770 is also wrong, the left nav stays pinned left"):
// captures the built app's shell for the two Ultra-wide boards drawn on top of it, at 2560 with a fine pointer, in WebKit.
//   node ultrawide-capture.mjs [base]  -> ultrawide-capture.json (home_2560, recipe_2560: the whole .shell as served; recipeHref)
// Reads a scratch build served on a loopback port (default http://127.0.0.1:4317; never the 4173 preview, never a dev server). Nothing is built or started here.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://127.0.0.1:4317';
const out = {}; const b = await webkit.launch();
const ctx = await b.newContext({ viewport: { width: 2560, height: 1000 }, deviceScaleFactor: 1 });
const p = await ctx.newPage(); p.setDefaultTimeout(20000);
await p.goto(BASE + '/', { waitUntil: 'networkidle' }); await p.waitForSelector('.home__lead'); await p.waitForTimeout(400); await p.evaluate(() => document.fonts.ready);
out.home_2560 = await p.evaluate(() => document.querySelector('.shell').outerHTML);
const hrefs = await p.evaluate(() => [...document.querySelectorAll('a')].map((a) => a.getAttribute('href')));
out.recipeHref = hrefs.find((h) => h && h.includes('olive-oil')) || hrefs.find((h) => /^\/notebook\/[^/]+\/[^/]+$/.test(h));
await p.goto(BASE + out.recipeHref, { waitUntil: 'networkidle' }); await p.waitForSelector('.recipe-page'); await p.waitForTimeout(400); await p.evaluate(() => document.fonts.ready);
out.recipe_2560 = await p.evaluate(() => document.querySelector('.shell').outerHTML);
await b.close(); await writeFile(path.join(HERE, 'ultrawide-capture.json'), JSON.stringify(out));
console.log(Object.entries(out).map(([k, v]) => k + ' ' + String(v).length).join('\n')); process.exit(0);
