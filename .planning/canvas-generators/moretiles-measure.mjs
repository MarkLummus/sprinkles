// Sid, 2026-10-05 (decision 54, the tiles with the hairline): the real More list at 393 and 723 with the candidate rules injected into the built app (the preview on 127.0.0.1:4173; nothing built, started or edited).
//   node moretiles-measure.mjs [chromium] [shots-dir]  -> moretiles-measure.json | moretiles-measure-chromium.json   { "<A|B|T|T20>_<393|723>_<notebook|ingredients>": { ul, items, lis, sep, hr, more, focus, hover, tapSep, surface } }   (WebKit coarse by default; Chromium is system Chrome)
//   A the build untouched (since 2026-10-04 23:13 the build carries quick 261004-vpr's tiles and the hairline, after Search); T the same rules injected again (identical to the build's) with the hairline's li moved before Search (Mark's answer on decision 55: Search sits with the actions, 2026-10-05).
//   search: Search probes in each variant (hover, focus ring, tap) beside Ingredients' (the other link) and Import's (the other action).
import { writeFile, readFile, mkdir } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const eng = process.argv[2] === 'chromium' ? chromium : webkit; const SHOTS = process.argv[3];
const CSS = await readFile(path.join(HERE, 'more-candidates.css'), 'utf8');
const sec = (n) => CSS.match(new RegExp('/\\* === ' + n + ' ===[^*]*\\*/([\\s\\S]*?)(?=/\\* === |$)'))[1];
const HAIR = sec('HAIR').trim().split('\n');
const V = { A: { top: '', phone: '', sep: false }, T: { top: sec('TILESRESET'), phone: sec('TILESPHONE') + sec('HAIR'), sep: true } };
const br = await eng.launch(eng === chromium ? { channel: 'chrome' } : {}); const out = {};
if (SHOTS) await mkdir(SHOTS, { recursive: true });
for (const W of [393, 723]) for (const [vk, v] of Object.entries(V)) for (const [pk, route] of [['notebook', '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1'], ['ingredients', '/ingredients']]) {
  const ctx = await br.newContext({ viewport: { width: W, height: 852 }, hasTouch: true, deviceScaleFactor: 2 }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:4173' + route, { waitUntil: 'networkidle' }); await p.waitForSelector('.shell'); await p.waitForTimeout(300); await p.evaluate(() => document.fonts.ready);
  if (v.top || v.phone) await p.addStyleTag({ content: v.top + '@media (max-width:723.98px){' + v.phone + '}' });
  if (v.sep) await p.evaluate(() => { const ul = document.querySelector('.shell__more > ul'); const old = ul.querySelector('.shell__more-sep'); if (old) old.remove(); const li = document.createElement('li'); li.className = 'shell__more-sep'; li.setAttribute('aria-hidden', 'true'); const hr = document.createElement('hr'); hr.className = 'shell__divider'; li.append(hr); ul.insertBefore(li, ul.children[2]); });
  await p.locator('.shell__more > summary').tap(); await p.waitForTimeout(300); await p.evaluate(() => document.activeElement && document.activeElement.blur());
  const snap = () => p.evaluate(() => { const r = (e) => { const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; };
    const u = document.querySelector('.shell__more > ul'); const ub = u.getBoundingClientRect(); const cu = getComputedStyle(u); const more = document.querySelector('.shell__more'); const tabs = document.querySelector('.shell__tabs');
    const items = [...u.querySelectorAll('li > a, li > button')].map((e) => { const c = getComputedStyle(e); return { tag: e.tagName.toLowerCase(), text: e.textContent.trim(), box: r(e), border: `${c.borderTopWidth} ${c.borderTopStyle}`, bg: c.backgroundColor, color: c.color, font: `${c.fontSize} ${c.fontWeight}`, padding: c.padding, radius: c.borderRadius }; });
    const sep = u.querySelector('.shell__more-sep'); const hr = sep && sep.querySelector('hr'); const ch = hr && getComputedStyle(hr);
    return { ul: { ...r(u), border: `${cu.borderTopWidth} ${cu.borderTopStyle} ${cu.borderTopColor}`, padding: cu.padding, bottomGap: +(tabs.getBoundingClientRect().top - ub.bottom).toFixed(1), rightGap: +(innerWidth - ub.right).toFixed(1) }, more: r(more),
      items, lis: [...u.children].map((l) => ({ cls: l.className, box: r(l) })), sep: sep ? { li: r(sep), hr: r(hr), hrBorder: `${ch.borderTopWidth} ${ch.borderTopStyle} ${ch.borderTopColor}`, hrMargin: ch.margin, hrHeightBox: ch.height } : null, vw: innerWidth }; });
  const g = await snap();
  const imp = p.locator('.shell__more li > button').first();
  // focus on Import: the app's own .shell__place:focus (2px solid ink, offset 2px); the ring's outer edge is the box plus 4px
  await imp.evaluate((e) => e.focus()); await p.waitForTimeout(100);
  g.focus = await p.evaluate(() => { const e = document.activeElement; const c = getComputedStyle(e); const b = e.getBoundingClientRect(); const u = document.querySelector('.shell__more > ul'); const ub = u.getBoundingClientRect(); const hr = u.querySelector('.shell__more-sep hr'); const hb = hr && hr.getBoundingClientRect(); const o = parseFloat(c.outlineWidth) + parseFloat(c.outlineOffset);
    return { text: e.textContent.trim(), outline: `${c.outlineWidth} ${c.outlineStyle} ${c.outlineColor}`, offset: c.outlineOffset, ringTop: +(b.top - o).toFixed(1), ringBottom: +(b.bottom + o).toFixed(1), ringLeft: +(b.left - o).toFixed(1), ringRight: +(b.right + o).toFixed(1), panelInnerLeft: +(ub.left + 1).toFixed(1), panelInnerRight: +(ub.right - 1).toFixed(1), clearOfRule: hb ? +(b.top - o - hb.bottom).toFixed(1) : null, prevBottomToRing: +(b.top - o - e.closest('li').previousElementSibling.getBoundingClientRect().bottom).toFixed(1), prev: e.closest('li').previousElementSibling.textContent.trim() || 'rule' }; });
  if (SHOTS && pk === 'notebook') await p.screenshot({ path: path.join(SHOTS, `${eng === chromium ? 'chr' : 'wk'}-${vk}-${W}-focus.png`), clip: { x: 0, y: 852 - 360, width: W, height: 360 } });
  await imp.evaluate((e) => e.blur());
  // hover on Import (the Sheet's global button:hover thickens the border to 2px and sets padding; the reset has to hold)
  const before = await imp.evaluate((e) => getComputedStyle(e).borderTopWidth); const bb = await imp.boundingBox(); await imp.hover(); await p.waitForTimeout(150);
  g.hover = { before, after: await imp.evaluate((e) => getComputedStyle(e).borderTopWidth), boxBefore: bb, boxAfter: await imp.boundingBox() };
  await p.mouse.move(5, 5);
  g.surface = await p.evaluate(() => { const a = document.querySelector('.shell__more [aria-current="page"]'); if (!a) return null; const c = getComputedStyle(a); const b = a.getBoundingClientRect(); const rg = document.createRange(); rg.selectNodeContents(a); const t = [...rg.getClientRects()].filter((q) => q.width > 20 && q.height < 30); const l = Math.min(...t.map((q) => q.left)), rr = Math.max(...t.map((q) => q.right)); return { bg: c.backgroundColor, w: +b.width.toFixed(1), h: +b.height.toFixed(1), weight: c.fontWeight, textLeft: +(l - b.left).toFixed(1), textRight: +(b.right - rr).toFixed(1) }; });
  if (SHOTS && true) await p.screenshot({ path: path.join(SHOTS, `${eng === chromium ? 'chr' : 'wk'}-${vk}-${W}-${pk}.png`), clip: { x: 0, y: 852 - 360, width: W, height: 360 } });
  // Search (an a) against Ingredients (the other a) and Import (the other action): focus ring, hover, and the tap
  g.search = {};
  for (const [nm, sel] of [['search', '.shell__more li > a[href="/search"]'], ['ingredients', '.shell__more li > a[href="/ingredients"]'], ['import', '.shell__more li > button']]) {
    const e = p.locator(sel).first(); const st = () => e.evaluate((n) => { const c = getComputedStyle(n); const b = n.getBoundingClientRect(); return { tag: n.tagName.toLowerCase(), box: `${+b.width.toFixed(1)}x${+b.height.toFixed(1)}`, border: c.borderTopWidth + ' ' + c.borderTopStyle, padding: c.padding, bg: c.backgroundColor, color: c.color, deco: c.textDecorationLine, outline: c.outlineWidth + ' ' + c.outlineStyle + ' ' + c.outlineOffset, cursor: c.cursor, radius: c.borderRadius, font: c.fontSize + ' ' + c.fontWeight + ' ' + c.fontFamily.split(',')[0] }; });
    const r = { rest: await st() };
    await e.evaluate((n) => n.focus()); await p.waitForTimeout(80); r.focus = await st(); await e.evaluate((n) => n.blur());
    await e.hover(); await p.waitForTimeout(150); r.hover = await st(); await p.mouse.move(5, 5);
    g.search[nm] = r; }
  { const d = (a, b) => Object.keys(a).filter((k) => a[k] !== b[k]); g.searchVsIngredients = { rest: d(g.search.search.rest, g.search.ingredients.rest), hover: d(g.search.search.hover, g.search.ingredients.hover), focus: d(g.search.search.focus, g.search.ingredients.focus) };
    g.searchHoverMoved = d(g.search.search.rest, g.search.search.hover); }
  { const sl = p.locator('.shell__more li > a[href="/search"]'); await sl.evaluate((e) => e.focus()); await p.waitForTimeout(80);
    g.searchRing = await sl.evaluate((e) => { const c = getComputedStyle(e); const b = e.getBoundingClientRect(); const o = parseFloat(c.outlineWidth) + parseFloat(c.outlineOffset); const u = document.querySelector('.shell__more > ul'); const ub = u.getBoundingClientRect(); const hr = u.querySelector('.shell__more-sep hr'); const hb = hr.getBoundingClientRect(); const pv = e.closest('li').previousElementSibling.getBoundingClientRect(); const nx = e.closest('li').nextElementSibling.getBoundingClientRect();
      return { outline: c.outlineWidth + ' ' + c.outlineStyle + ' ' + c.outlineColor, clearOfRule: +(hb.bottom <= b.top ? b.top - o - hb.bottom : b.top - o - hb.top).toFixed(1), clearOfRuleAbove: +(b.top - o - hb.bottom).toFixed(1), toNextTile: +(nx.top - (b.bottom + o)).toFixed(1), ringLeftInPanel: +(b.left - o - (ub.left + 1)).toFixed(1), ringRightInPanel: +(ub.right - 1 - (b.right + o)).toFixed(1), prev: e.closest('li').previousElementSibling.className }; });
    await sl.evaluate((e) => e.blur()); }
  if (v.sep) { const hb = g.sep.hr; await p.touchscreen.tap(hb.x + hb.w / 2, hb.y); await p.waitForTimeout(250); g.tapSep = { moreOpenAfter: await p.evaluate(() => document.querySelector('.shell__more').open) };
    await p.locator('.shell__more > summary').tap(); await p.waitForTimeout(250); const sb = await p.locator('.shell__more li > a[href="/search"]').boundingBox(); await p.touchscreen.tap(sb.x + sb.width / 2, sb.y + sb.height / 2); await p.waitForTimeout(500);
    g.tapSearch = { path: await p.evaluate(() => location.pathname), moreOpenAfter: await p.evaluate(() => document.querySelector('.shell__more').open) }; }
  out[`${vk}_${W}_${pk}`] = g; await ctx.close();
}
// the same reset at the header at 1366 (a pointer): hover on Import
{ const ctx = await br.newContext({ viewport: { width: 1366, height: 900 } }); const p = await ctx.newPage(); await p.goto('http://127.0.0.1:4173/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', { waitUntil: 'networkidle' }); await p.waitForSelector('.shell__tools button');
  const imp = p.locator('.shell__tools button').first(); const b0 = await imp.evaluate((e) => getComputedStyle(e).borderTopWidth); const bb = await imp.boundingBox(); await imp.hover(); await p.waitForTimeout(150);
  out.header1366 = { before: b0, after: await imp.evaluate((e) => getComputedStyle(e).borderTopWidth), boxBefore: bb, boxAfter: await imp.boundingBox() }; await ctx.close(); }
await br.close(); await writeFile(path.join(HERE, process.argv[2] === 'chromium' ? 'moretiles-measure-chromium.json' : 'moretiles-measure.json'), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) { if (k === 'header1366') { console.log(k, JSON.stringify(v)); continue; }
  console.log(k.padEnd(20), 'ul', v.ul.w + 'x' + v.ul.h, `@${v.ul.x},${v.ul.y}`, 'rightGap', v.ul.rightGap, 'gap', v.ul.bottomGap, '|', v.items.map((i) => `${i.text} ${i.box.w}x${i.box.h} b${i.border.split(' ')[0]}`).join(' · '), '| hover', v.hover.before, '>', v.hover.after, v.hover.boxAfter.width + 'x' + v.hover.boxAfter.height, '| surf', v.surface ? `${v.surface.w}x${v.surface.h} L${v.surface.textLeft} R${v.surface.textRight}` : '-', '| sep', v.sep ? `li ${v.sep.li.h} hr ${v.sep.hr.w}x${v.sep.hr.h} @${v.sep.hr.x},${v.sep.hr.y} ${v.sep.hrBorder} m${v.sep.hrMargin}` : '-', '| focus clear', v.focus.clearOfRule, 'ringL', v.focus.ringLeft, 'ringR', v.focus.ringRight, 'in', v.focus.panelInnerLeft, v.focus.panelInnerRight, '| tapSep', v.tapSep ? v.tapSep.moreOpenAfter : '-', '| tapSearch', v.tapSearch ? JSON.stringify(v.tapSearch) : '-');
  console.log('   search ring', JSON.stringify(v.searchRing), '| a vs a differs: ', JSON.stringify(v.searchVsIngredients), '| search hover moved:', JSON.stringify(v.searchHoverMoved)); }
process.exit(0);
