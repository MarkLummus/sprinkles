// Sid, 2026-10-04: the all-folded phone board's own page height (the panel's window is sized to it).
//   node phone-measure.mjs <path to R35C_393AllFolded.dc.html>  -> phone-measure.json { folded_h }
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const br = await webkit.launch(); const ctx = await br.newContext({ viewport: { width: 900, height: 900 }, hasTouch: true });
await ctx.route(/fonts\.googleapis/, (r) => r.fulfill({ contentType: 'text/css', body: '@font-face{font-family:Caveat;src:url(file:///Users/mark/Documents/projects/sprinkles/app/public/fonts/caveat-regular.woff2) format("woff2");font-weight:400}' }));
const p = await ctx.newPage(); await p.goto('file://' + process.argv[2]); await p.waitForTimeout(900); await p.evaluate(() => document.fonts.ready);
const h = await p.evaluate(() => Math.ceil(document.querySelector('.fp-mex3-393-folded .shell').getBoundingClientRect().height));
await br.close(); await writeFile(path.join(HERE, 'phone-measure.json'), JSON.stringify({ folded_h: h + 4 })); console.log('folded_h', h + 4); process.exit(0);
