// Sid, 2026-10-04 (decision 35): what the Next version pen draws for the Sheet title today. node title-probe.mjs -> title-probe.json
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const R = { olive: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89', mex4: '/notebook/mexican-chocolate/mexican-chocolate-v4' };
const s = await startServers(); const br = await webkit.launch(); const res = [];
for (const [k, route] of Object.entries(R)) for (const W of [393, 744, 1024, 1366, 1600]) for (const edit of [false, true]) {
  const ctx = await br.newContext({ viewport: { width: W, height: 1000 }, hasTouch: W <= 1366 }); await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const p = await ctx.newPage(); p.setDefaultTimeout(10000);
  await p.goto(s.appUrl + route, { waitUntil: 'networkidle' }); await p.waitForSelector('.shell'); await p.evaluate(() => document.fonts.ready);
  await p.getByRole('button', { name: 'Next version' }).first().click(); await p.getByLabel('Sheet title', { exact: true }).waitFor(); await p.waitForTimeout(150);
  if (edit) { await p.getByLabel('Sheet title', { exact: true }).fill('Olive Oil Ice Cream with a much longer title that goes on and on for the wrap test'); await p.waitForTimeout(100); }
  const o = await p.evaluate(() => { const hn = document.querySelector('.headnote'); const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; }; const h1 = hn.querySelector('h1'); const inp = hn.querySelector('.headnote__sheet-title-field input'); const cap = hn.querySelector('.headnote__sheet-title-field .pen-caption'); const st = [...hn.querySelectorAll('.prose-struck-beneath')][0]; const help = hn.querySelector('.headnote__field-helper');
    const cs = (e, p) => getComputedStyle(e)[p]; return { h1: { text: h1.textContent, ...r(h1), size: cs(h1, 'fontSize') }, caption: r(cap), input: { ...r(inp), size: cs(inp, 'fontSize'), weight: cs(inp, 'fontWeight'), border: cs(inp, 'borderTopWidth'), scrollW: inp.scrollWidth, clientW: inp.clientWidth, value: inp.value.slice(0, 30) }, struck: st ? { text: st.textContent.slice(0, 30), ...r(st) } : null, helper: r(help), headnoteH: r(hn).h }; });
  res.push({ route: k, W, edited: edit, ...o }); await ctx.close();
}
await br.close(); await s.close(); await writeFile(path.join(HERE, 'title-probe.json'), JSON.stringify(res, null, 1));
for (const r of res) console.log(r.route, r.W, r.edited ? 'edited' : 'same', 'h1', r.h1.size, r.h1.h, '| input', r.input.size, r.input.w + 'x' + r.input.h, 'overflow', r.input.scrollW > r.input.clientW, '| struck', r.struck ? r.struck.h : '-', '| headnote', r.headnoteH);
process.exit(0);
