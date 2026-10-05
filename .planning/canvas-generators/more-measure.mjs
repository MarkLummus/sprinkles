// Sid, 2026-10-05 (decision 54): measures More's open list at 393 (and the header tools from 724, for comparison) in the built app. Reads the preview on 127.0.0.1:4173; starts nothing, builds nothing.
//   node more-measure.mjs [chromium]  -> more-measure.json | more-measure-chromium.json   (WebKit by default, coarse pointer; Chromium is system Chrome)
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const eng = process.argv[2] === 'chromium' ? chromium : webkit;
const SHOTS = process.env.SHOTS || '';
const br = await eng.launch(eng === chromium ? { channel: 'chrome' } : {}); const out = {};
const grab = (sel) => { const r = (e) => { const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; };
  return [...document.querySelectorAll(sel)].map((e) => { const c = getComputedStyle(e); const side = (s) => `${c['border' + s + 'Width']} ${c['border' + s + 'Style']} ${c['border' + s + 'Color']}`;
    const svg = e.querySelector('svg'); const cs = svg && getComputedStyle(svg);
    return { tag: e.tagName.toLowerCase(), text: e.textContent.trim(), cls: e.className, type: e.getAttribute('type'), current: e.getAttribute('aria-current'), box: r(e), display: c.display, width: c.width, padding: c.padding, borderTop: side('Top'), borderLeft: side('Left'), radius: c.borderRadius, bg: c.backgroundColor, color: c.color, font: `${c.fontSize} ${c.fontWeight} ${c.fontFamily.split(',')[0]}`, appearance: c.appearance || c.webkitAppearance, outline: `${c.outlineWidth} ${c.outlineStyle} ${c.outlineColor} off ${c.outlineOffset}`, shadow: c.boxShadow, svg: svg ? `${cs.width}x${cs.height} ${cs.stroke}` : null, justify: c.justifyContent, align: c.alignItems }; }); };
for (const [W, route, tag] of [[393, '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', 'notebook'], [393, '/ingredients', 'ingredients'], [724, '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', 'notebook'], [1366, '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', 'notebook']]) {
  const ctx = await br.newContext({ viewport: { width: W, height: W === 393 ? 852 : 900 }, hasTouch: true, isMobile: false, deviceScaleFactor: 2 }); const p = await ctx.newPage(); p.setDefaultTimeout(10000);
  await p.goto('http://127.0.0.1:4173' + route, { waitUntil: 'networkidle' }); await p.waitForSelector('.shell'); await p.waitForTimeout(400); await p.evaluate(() => document.fonts.ready);
  const k = `${W}_${tag}`; out[k] = {};
  if (W === 393) {
    out[k].tabs = await p.evaluate(grab, '.shell__tabs > .shell__place, .shell__tabs > .shell__more > summary');
    await p.locator('.shell__more > summary').tap(); await p.waitForTimeout(300);
    out[k].ul = await p.evaluate(() => { const u = document.querySelector('.shell__more > ul'); const b = u.getBoundingClientRect(); const c = getComputedStyle(u); return { x: b.x, y: b.y, w: b.width, h: b.height, border: `${c.borderTopWidth} ${c.borderTopStyle} ${c.borderTopColor}`, bg: c.backgroundColor, padding: c.padding, radius: c.borderRadius, shadow: c.boxShadow }; });
    out[k].lis = await p.evaluate(grab, '.shell__more li'); out[k].items = await p.evaluate(grab, '.shell__more li > a, .shell__more li > button');
    out[k].doc = await p.evaluate(() => ({ iw: innerWidth, ih: innerHeight, tab: document.querySelector('.shell__tabs').getBoundingClientRect().toJSON() }));
    if (SHOTS) await p.screenshot({ path: `${SHOTS}/more-393-${tag}-${eng === chromium ? 'chrome' : 'webkit'}-rest.png`, clip: { x: 0, y: 852 - 56 - 330, width: 393, height: 330 + 56 } });
    // focus each item in turn (script focus; :focus rule), measure outline and ring, screenshot
    out[k].focus = [];
    const n = await p.locator('.shell__more li > a, .shell__more li > button').count();
    for (let i = 0; i < n; i++) { const el = p.locator('.shell__more li > a, .shell__more li > button').nth(i); await el.focus(); await p.waitForTimeout(120);
      const f = await p.evaluate(() => { const e = document.activeElement; const c = getComputedStyle(e); const b = e.getBoundingClientRect(); const u = document.querySelector('.shell__more > ul').getBoundingClientRect(); return { text: e.textContent.trim(), outline: `${c.outlineWidth} ${c.outlineStyle} ${c.outlineColor} off ${c.outlineOffset}`, ringRight: +(b.right + parseFloat(c.outlineOffset) + parseFloat(c.outlineWidth)).toFixed(1), ulRight: +u.right.toFixed(1), ringLeft: +(b.left - parseFloat(c.outlineOffset) - parseFloat(c.outlineWidth)).toFixed(1), ulLeft: +u.left.toFixed(1), radius: c.borderRadius }; });
      out[k].focus.push(f); if (SHOTS) await p.screenshot({ path: `${SHOTS}/more-393-${tag}-${eng === chromium ? 'chrome' : 'webkit'}-focus-${i}.png`, clip: { x: 0, y: 852 - 56 - 330, width: 393, height: 330 + 56 } }); }
  } else {
    out[k].tools = await p.evaluate(grab, '.shell__tools > .shell__place'); out[k].head = await p.evaluate((q) => document.querySelector(q).getBoundingClientRect().toJSON(), '.shell__head');
    if (SHOTS) await p.screenshot({ path: `${SHOTS}/tools-${W}-${eng === chromium ? 'chrome' : 'webkit'}.png`, clip: { x: 0, y: 0, width: W, height: 70 } });
  }
  await ctx.close();
}
await br.close(); await writeFile(path.join(HERE, process.argv[2] === 'chromium' ? 'more-measure-chromium.json' : 'more-measure.json'), JSON.stringify(out, null, 1)); console.log('ok');
process.exit(0);
