// Sid, 2026-10-05 (decision 54, the tiles with the hairline; the rule before Search since Mark's answer on decision 55): measures the drawn panels on the More-tiles board, to caption them and to check them against the build with the candidate rules injected (moretiles-measure.json, T).
//   node moretiles-board-measure.mjs <path to more-tiles-hairline.html>  -> moretiles-board-measure.json  { "fp-mt-<393|723>-<rest|cur|ring>": { ul, items:[{text, w, h, border}], hr, aboveRule, belowRule } }   WebKit
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const file = process.argv[2];
const b = await webkit.launch(); const p = await (await b.newContext({ viewport: { width: 2400, height: 900 }, deviceScaleFactor: 1 })).newPage();
await p.goto('file://' + file); await p.waitForTimeout(800); await p.evaluate(() => document.fonts.ready);
const out = await p.evaluate(() => { const o = {}; for (const w of document.querySelectorAll('.fp-win')) { const vid = [...w.classList].find((c) => c.startsWith('fp-mt-')); const u = w.querySelector('.shell__more > ul'); const wb = w.getBoundingClientRect();
  const r = (e) => { const x = e.getBoundingClientRect(); return { x: +(x.x - wb.x).toFixed(1), y: +(x.y - wb.y).toFixed(1), w: +x.width.toFixed(1), h: +x.height.toFixed(1) }; };
  const items = [...u.querySelectorAll('li > a, li > button')]; const hr = u.querySelector('.shell__more-sep hr'); const hb = hr.getBoundingClientRect(); const kitchen = items[1].getBoundingClientRect(), search = items[2].getBoundingClientRect();
  o[vid] = { ul: r(u), items: items.map((e) => ({ text: e.textContent.trim(), ...r(e), border: getComputedStyle(e).borderTopWidth })), hr: { ...r(hr), border: getComputedStyle(hr).borderTopWidth + ' ' + getComputedStyle(hr).borderTopColor }, aboveRule: +(hb.top - kitchen.bottom).toFixed(1), belowRule: +(search.top - hb.bottom).toFixed(1) }; } return o; });
await b.close(); await writeFile(path.join(HERE, 'moretiles-board-measure.json'), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(16), 'ul', v.ul.w + 'x' + v.ul.h, `@${v.ul.x},${v.ul.y}`, '|', v.items.map((i) => `${i.text} ${i.w}x${i.h} b${i.border}`).join(' · '), '| hr', `${v.hr.w}x${v.hr.h}@${v.hr.x},${v.hr.y}`, v.hr.border, 'above', v.aboveRule, 'below', v.belowRule);
process.exit(0);
