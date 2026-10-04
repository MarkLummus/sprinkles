// Sid, 2026-10-04 (decision 35): measures each panel of the Sheet title board: the headnote's rectangle inside the shell (for the crop) and the rows the growing textarea needs. node title-measure.mjs -> title-measure.json
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const br = await webkit.launch(); const ctx = await br.newContext({ viewport: { width: 7000, height: 900 }, hasTouch: true }); const p = await ctx.newPage();
await p.goto(`file://${HERE}/../sketches/011-recipe-route-c/sheet-title-pen.html`); await p.waitForTimeout(500);
const r = await p.evaluate(() => { const rects = {}, rows = {}; for (const w of document.querySelectorAll('.fp-win')) { const cls = [...w.classList].find((c) => c.startsWith('fp-tt-')); const id = cls.replace('fp-tt-', '').replace('-', '_'); const sh = w.querySelector('.shell').getBoundingClientRect(); const hn = w.querySelector('.headnote').getBoundingClientRect();
    const ta = w.querySelector('.headnote__sheet-title-field textarea'); if (ta) { let n = 1; ta.rows = 1; while (ta.scrollHeight > ta.clientHeight + 1 && n < 8) { n++; ta.rows = n; } rows[id] = n; }
    const hn2 = w.querySelector('.headnote').getBoundingClientRect(); rects[id] = { x: Math.round(hn2.x - sh.x), y: Math.round(hn2.y - sh.y), w: Math.round(hn2.width), h: Math.round(hn2.height) }; } return { rects, rows }; });
await br.close(); await writeFile(path.join(HERE, 'title-measure.json'), JSON.stringify(r, null, 1)); console.log(JSON.stringify(r)); process.exit(0);
