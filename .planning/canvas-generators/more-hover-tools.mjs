// Sid, 2026-10-05 (decision 54): the header's Import under a fine pointer's hover at 1366 (the Sheet's global button:hover rule), in the preview on 127.0.0.1:4173.
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
for (const eng of [webkit, chromium]) { const br = await eng.launch(eng === chromium ? { channel: 'chrome' } : {});
  const p = await (await br.newContext({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1 })).newPage();
  await p.goto('http://127.0.0.1:4173/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
  const q = '.shell__tools button'; const m = () => p.evaluate((s) => { const e = document.querySelector(s); const c = getComputedStyle(e); const b = e.getBoundingClientRect(); return { w: +b.width.toFixed(1), h: +b.height.toFixed(1), border: c.borderTopWidth + ' ' + c.borderTopStyle, padding: c.padding }; }, q);
  const rest = await m(); await p.hover(q); await p.waitForTimeout(150); const hov = await m();
  console.log(eng === chromium ? 'chrome' : 'webkit', 'rest', JSON.stringify(rest), 'hover', JSON.stringify(hov)); await br.close(); }
process.exit(0);
