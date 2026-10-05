// Sid, 2026-10-05 (decision 52): captures the built app's shell with and without the Import error list, for the placement boards. Reads the preview on 127.0.0.1:4173; starts nothing, builds nothing.
//   node imp-capture.mjs   -> imp-capture.json { "<state>_<W>": { html, facts } }   states: base (no errors), older (an export from an older Sprinkles: 3 lines), many (a wrong-shaped file: 49 lines)   WebKit, coarse; 1366, 724, 393.
// The two files (imp-older.json, imp-many.json) are set on the shell's own hidden file input, as the Import button's picker would. Olive Oil v1 at scroll 0.
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const grab = () => { const root = document.querySelector('.shell').cloneNode(true); const live = document.querySelector('.shell');
  const lf = live.querySelectorAll('input, textarea'); const cf = root.querySelectorAll('input, textarea');
  lf.forEach((e, i) => { const c = cf[i]; if (e.tagName === 'TEXTAREA') c.textContent = e.value; else if (e.type === 'radio' || e.type === 'checkbox') { if (e.checked) c.setAttribute('checked', ''); else c.removeAttribute('checked'); } else c.setAttribute('value', e.value); });
  const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; };
  const ul = document.querySelector('.shell__import-errors');
  return { html: root.outerHTML, facts: { head: r(document.querySelector('.shell__head')), list: r(ul), lines: ul ? [...ul.children].map((l) => l.textContent) : [], doc: document.documentElement.scrollHeight, h2: r(document.querySelector('main h2')) } }; };
const out = {}; const b = await webkit.launch(); const dir = HERE + '/';
for (const W of [1366, 724, 393]) for (const st of ['base', 'older', 'many']) {
  const ctx = await b.newContext({ viewport: { width: W, height: W === 393 ? 852 : 900 }, hasTouch: true, deviceScaleFactor: 1 }); const p = await ctx.newPage(); p.setDefaultTimeout(10000);
  await p.goto('http://127.0.0.1:4173/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', { waitUntil: 'networkidle' }); await p.waitForSelector('.notebook-log'); await p.waitForTimeout(300);
  if (st !== 'base') { await p.setInputFiles('.shell__file-input', dir + 'imp-' + st + '.json'); await p.waitForTimeout(500); }
  await p.evaluate(() => document.fonts.ready); const g = await p.evaluate(grab);
  if (st !== 'base') { // does the list outlast a route change, and does anything dismiss it?
    await p.locator('.shell__brand a').first().click(); await p.waitForTimeout(500); g.facts.afterNavigation = await p.evaluate(() => !!document.querySelector('.shell__import-errors')); g.facts.dismissControls = await p.evaluate(() => [...document.querySelector('.shell__import-errors').querySelectorAll('button, a')].length);
  }
  out[`${st}_${W}`] = g; await ctx.close();
}
await b.close(); await writeFile(path.join(HERE, 'imp-capture.json'), JSON.stringify(out));
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(12), JSON.stringify(v.facts.head), v.facts.lines.length, 'lines', 'afterNav', v.facts.afterNavigation, 'dismiss', v.facts.dismissControls);
process.exit(0);
