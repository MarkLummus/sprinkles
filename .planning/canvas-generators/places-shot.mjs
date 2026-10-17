// Sid, 2026-10-17: screenshots every panel of a board file rendered locally (WebKit), for looking at: node places-shot.mjs <board file> <out dir>
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { mkdirSync } from 'node:fs';
const [,, file, outdir] = process.argv; mkdirSync(outdir, { recursive: true });
const b = await webkit.launch(); const ctx = await b.newContext({ viewport: { width: 2400, height: 1200 }, hasTouch: true }); const p = await ctx.newPage();
await p.goto('file://' + file); await p.waitForTimeout(500);
const wins = await p.$$('.p4-win'); let i = 0;
for (const w of wins) { await w.screenshot({ path: `${outdir}/panel-${String(i++).padStart(2, '0')}.png` }); }
console.log(wins.length, 'panels'); await b.close();
