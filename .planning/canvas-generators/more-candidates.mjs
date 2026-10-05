// Sid, 2026-10-05 (decision 54): More's items at 393 with each option's rules injected into the built app (the preview on 127.0.0.1:4173; nothing built, started or edited), to compare with the board.
//   node more-candidates.mjs [chromium]  -> more-candidates.json | more-candidates-chromium.json   { "<A|B|C|D>_<notebook|ingredients>": { ul, items:[{text, box, border, hoverBorder, bg, font, ringClear}], surface } }   (WebKit coarse by default; Chromium is system Chrome)
import { writeFile, readFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const eng = process.argv[2] === 'chromium' ? chromium : webkit;
const CSS = await readFile(path.join(HERE, 'more-candidates.css'), 'utf8');
const sec = (n) => CSS.match(new RegExp('/\\* === ' + n + ' ===[^*]*\\*/([\\s\\S]*?)(?=/\\* === |$)'))[1];
const V = { A: '', B: sec('RESET') + sec('B'), C: sec('RESET') + sec('ROWS'), D: sec('RESET') + sec('ROWS') + sec('SEP') };
const br = await eng.launch(eng === chromium ? { channel: 'chrome' } : {}); const out = {};
for (const [vk, css] of Object.entries(V)) for (const [pk, route] of [['notebook', '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1'], ['ingredients', '/ingredients']]) {
  const ctx = await br.newContext({ viewport: { width: 393, height: 852 }, hasTouch: true, deviceScaleFactor: 2 }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:4173' + route, { waitUntil: 'networkidle' }); await p.waitForSelector('.shell'); await p.waitForTimeout(300); await p.evaluate(() => document.fonts.ready);
  if (css) await p.addStyleTag({ content: '@media (max-width:723.98px){' + css + '}' });
  if (vk === 'D') await p.evaluate(() => { const li = document.createElement('li'); li.className = 'shell__more-sep'; li.setAttribute('aria-hidden', 'true'); const hr = document.createElement('hr'); hr.className = 'shell__divider'; li.append(hr); const ul = document.querySelector('.shell__more > ul'); ul.insertBefore(li, ul.children[3]); });
  await p.locator('.shell__more > summary').tap(); await p.waitForTimeout(300); await p.evaluate(() => document.activeElement && document.activeElement.blur());
  const snap = () => p.evaluate(() => { const r = (e) => { const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; };
    const u = document.querySelector('.shell__more > ul'); const ub = u.getBoundingClientRect(); const cu = getComputedStyle(u);
    const items = [...u.querySelectorAll('li > a, li > button')].map((e) => { const c = getComputedStyle(e); const b = e.getBoundingClientRect(); return { tag: e.tagName.toLowerCase(), text: e.textContent.trim(), box: r(e), border: `${c.borderTopWidth} ${c.borderTopStyle}`, bg: c.backgroundColor, color: c.color, font: `${c.fontSize} ${c.fontWeight}`, dir: c.flexDirection, padding: c.padding, radius: c.borderRadius, ringBeyond: { left: +(ub.left - (b.left - 4)).toFixed(1), right: +((b.right + 4) - ub.right).toFixed(1) } }; });
    const sep = u.querySelector('.shell__more-sep'); return { ul: { ...r(u), border: `${cu.borderTopWidth} ${cu.borderTopStyle} ${cu.borderTopColor}`, bottomGap: +(document.querySelector('.shell__tabs').getBoundingClientRect().top - ub.bottom).toFixed(1) }, items, sep: sep ? r(sep) : null, lis: [...u.children].map((l) => ({ cls: l.className, box: r(l) })), vw: innerWidth }; });
  const g = await snap();
  // hover on Import (the Sheet's global button:hover thickens the border to 2px)
  const imp = p.locator('.shell__more li > button').first(); const before = await imp.evaluate((e) => getComputedStyle(e).borderTopWidth); const bb = await imp.boundingBox(); await imp.hover(); await p.waitForTimeout(150);
  g.hover = { before, after: await imp.evaluate((e) => getComputedStyle(e).borderTopWidth), boxBefore: bb, boxAfter: await imp.boundingBox() };
  // the current place's surface, and whether the word has room inside it (an Ingredients link: label ink width against the box)
  g.surface = await p.evaluate(() => { const a = document.querySelector('.shell__more [aria-current="page"]'); if (!a) return null; const c = getComputedStyle(a); const b = a.getBoundingClientRect(); const rg = document.createRange(); rg.selectNodeContents(a); const t = [...rg.getClientRects()].filter((q) => q.width > 20 && q.height < 30); const l = Math.min(...t.map((q) => q.left)), rr = Math.max(...t.map((q) => q.right)); return { bg: c.backgroundColor, w: +b.width.toFixed(1), h: +b.height.toFixed(1), weight: c.fontWeight, textLeft: +(l - b.left).toFixed(1), textRight: +(b.right - rr).toFixed(1) }; });
  out[`${vk}_${pk}`] = g; await ctx.close();
}
await br.close(); await writeFile(path.join(HERE, process.argv[2] === 'chromium' ? 'more-candidates-chromium.json' : 'more-candidates.json'), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(18), 'ul', v.ul.w + 'x' + v.ul.h, 'gap', v.ul.bottomGap, '|', v.items.map((i) => `${i.text} ${i.box.w}x${i.box.h} b${i.border.split(' ')[0]}`).join(' · '), '| hover', v.hover.before, '>', v.hover.after, '| surf', v.surface ? `${v.surface.w}x${v.surface.h} text L${v.surface.textLeft} R${v.surface.textRight}` : '-');
process.exit(0);
