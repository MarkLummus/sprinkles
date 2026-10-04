// Sid, 2026-10-04 (decision 34): where the rows sit in each final board panel, so the option board can crop to them. node info-crops.mjs -> info-crops.json
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const br = await webkit.launch(); const res = {};
for (const [f, W] of [['744-batch', 744], ['1024-batch', 1024], ['1366-batch', 1366], ['1600-batch', 1600], ['1920-batch', 1920]]) {
  const ctx = await br.newContext({ viewport: { width: 4200, height: 900 }, hasTouch: true }); const p = await ctx.newPage();
  await p.goto(`file://${HERE}/../sketches/011-recipe-route-c/${f}.html`); await p.waitForTimeout(400);
  const r = await p.evaluate(() => [...document.querySelectorAll('.fp-win')].map((w) => { const s = w.querySelector('.shell').getBoundingClientRect(); const y = (e) => (e ? Math.round(e.getBoundingClientRect().top - s.top) : null); const h = (e) => (e ? Math.round(e.getBoundingClientRect().height) : null);
    const folds = Object.fromEntries([...w.querySelectorAll('.fold-row')].map((e) => [e.querySelector('.notebook-caption, .region-name, .fold-row__head').textContent.trim().split(/Show|Hide/)[0].trim(), y(e)]));
    return { title: w.className, folds, jump: y(w.querySelector('.notebook-jump')), head: y(w.querySelector('.batch-row__head')), headH: h(w.querySelector('.batch-row__head')), band: y(w.querySelector('.notebook-band, .recipe-band')), shellH: Math.round(s.height) }; }));
  res[W] = r; await ctx.close();
}
await br.close(); await writeFile(path.join(HERE, 'info-crops.json'), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res)); process.exit(0);
