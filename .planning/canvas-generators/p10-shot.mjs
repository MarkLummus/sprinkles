// Sid, 2026-10-17: a local screenshot of a board (support.js dropped, as the canvas serves it) for the side-by-side look. node p10-shot.mjs <board.dc.html> <out.png> [clipX clipY clipW clipH]
import { readFile, writeFile } from 'node:fs/promises';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const [src, png, cx, cy, cw, ch] = process.argv.slice(2);
let h = await readFile(src, 'utf8'); h = h.replace('<script src="./support.js"></script>', '');
const tmp = png + '.html'; await writeFile(tmp, h);
const b = await webkit.launch(); const ctx = await b.newContext({ viewport: { width: 1500, height: 1000 }, hasTouch: true });
const p = await ctx.newPage(); await p.goto('file://' + tmp); await p.waitForTimeout(600); await p.evaluate(() => document.fonts.ready);
const full = await p.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
const opts = { path: png, fullPage: true }; if (cw) opts.clip = { x: +cx, y: +cy, width: +cw, height: +ch };
await p.screenshot(opts); console.log(JSON.stringify(full)); await b.close(); process.exit(0);
