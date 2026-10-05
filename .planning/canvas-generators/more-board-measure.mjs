// Sid, 2026-10-05 (decision 54): measures the drawn panels on the More board, to caption them and to check them against the build with each option's rules injected (more-candidates.json).
//   node more-board-measure.mjs <path to more-items-iphone.html>  -> more-board-measure.json  { "fp-more-<A..D>-<rest|cur|ring>": { ul, items:[{text, w, h}] } }   WebKit
import { writeFile, readFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const file = process.argv[2];
const b = await webkit.launch(); const p = await (await b.newContext({ viewport: { width: 1700, height: 900 }, deviceScaleFactor: 1 })).newPage();
await p.goto('file://' + file); await p.waitForTimeout(800); await p.evaluate(() => document.fonts.ready);
const out = await p.evaluate(() => { const o = {}; for (const w of document.querySelectorAll('.fp-win')) { const vid = [...w.classList].find((c) => c.startsWith('fp-more-')); const u = w.querySelector('.shell__more > ul'); const r = (e) => { const x = e.getBoundingClientRect(); return { w: +x.width.toFixed(1), h: +x.height.toFixed(1) }; };
  o[vid] = { ul: r(u), items: [...u.querySelectorAll('li > a, li > button')].map((e) => ({ text: e.textContent.trim(), ...r(e), border: getComputedStyle(e).borderTopWidth })) }; } return o; });
await b.close(); await writeFile(path.join(HERE, 'more-board-measure.json'), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(18), 'ul', v.ul.w + 'x' + v.ul.h, '|', v.items.map((i) => `${i.text} ${i.w}x${i.h} b${i.border}`).join(' · '));
process.exit(0);
