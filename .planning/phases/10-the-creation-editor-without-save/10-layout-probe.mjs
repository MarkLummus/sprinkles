// Sid, 2026-10-22: evidence for /impeccable layout on the batch route's log column (Mexican Chocolate v4). Reads Mark's device server
// (BASE_URL, default http://192.168.1.133:4173) without touching it: the batch it records lives in this WebKit context's own IndexedDB.
// For every state it lists each labelled element, control and rule in aside.notebook-log in document order with its face and the gap
// to the element above, and screenshots the log. States: reading (pen closed), Correct (pen open, filled, tasting open), Record another
// blank, with Add tasting, with At draw picked; at 1366 x 744 and 393 x 852, coarse pointer.
//   BASE_URL=http://192.168.1.133:4173 node 10-layout-probe.mjs <out dir>   -> <out>/layout-measure.json, <out>/<state>.png
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
const OUT = process.argv[2]; const BASE = process.env.BASE_URL ?? 'http://192.168.1.133:4173';
const ROUTE = '/notebook/mexican-chocolate/mexican-chocolate-v4';
await mkdir(OUT, { recursive: true });
const browser = await webkit.launch();
const ctx = await browser.newContext({ viewport: { width: 1366, height: 744 }, hasTouch: true });
const host = new URL(BASE).hostname;
await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === host ? r.continue() : r.abort()));
const page = await ctx.newPage();
const states = {};
const log = () => page.locator('.notebook-log');
const settle = (ms = 350) => page.waitForTimeout(ms);

const inventory = () => page.evaluate(() => {
  const root = document.querySelector('.notebook-log'); if (!root) return null;
  const r0 = root.getBoundingClientRect();
  const face = (e) => { const s = getComputedStyle(e); return { size: s.fontSize, weight: s.fontWeight, tt: s.textTransform, ls: s.letterSpacing, lh: s.lineHeight, color: s.color, ff: /Georgia/.test(s.fontFamily) ? 'text' : /Caveat/.test(s.fontFamily) ? 'hand' : 'grotesk' }; };
  const own = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
  const items = [];
  for (const e of root.querySelectorAll('*')) {
    const tag = e.tagName.toLowerCase(); if (['svg', 'path', 'option', 'legend'].includes(tag)) continue;
    const r = e.getBoundingClientRect(); if (r.height === 0 && r.width === 0) continue;
    const s = getComputedStyle(e);
    const bt = parseFloat(s.borderTopWidth); const isRule = bt > 0 && !['input', 'button', 'label', 'select', 'textarea'].includes(tag) && !e.closest('.segmented, .axis-mark__stops, .chip-toggle');
    const text = own(e); const isCtl = ['input', 'select', 'textarea', 'button'].includes(tag);
    if (!text && !isCtl && !isRule) continue;
    const cls = typeof e.className === 'string' ? e.className.split(' ').slice(0, 3).join('.') : '';
    if (isRule) items.push({ kind: 'rule', tag, cls, text: `rule ${bt}px`, top: +(r.top + scrollY).toFixed(1), bottom: +(r.top + scrollY + bt).toFixed(1), h: bt, x: +(r.left - r0.left).toFixed(0) });
    if (text || isCtl) items.push({ kind: isCtl ? 'control' : 'text', tag, cls, text: (text || e.value || e.getAttribute('aria-label') || e.type || '').slice(0, 30), top: +(r.top + scrollY).toFixed(1), bottom: +(r.bottom + scrollY).toFixed(1), h: +r.height.toFixed(1), x: +(r.left - r0.left).toFixed(0), ...face(e) });
  }
  items.sort((a, b) => a.top - b.top || a.x - b.x);
  let prevBottom = null;
  for (const it of items) { it.gap = prevBottom === null ? null : +(it.top - prevBottom).toFixed(1); prevBottom = Math.max(prevBottom ?? -1e9, it.bottom); }
  return { logBox: { x: +r0.x.toFixed(0), w: +r0.width.toFixed(0), top: +(r0.top + scrollY).toFixed(0), h: +r0.height.toFixed(0) }, scrollH: document.documentElement.scrollHeight, scrollW: document.documentElement.scrollWidth, items };
});
const take = async (name) => {
  const inv = await inventory(); states[name] = inv; if (!inv) { console.log(name, 'NO LOG'); return; }
  await page.evaluate(() => document.querySelector('.notebook-log').scrollIntoView({ block: 'start' })); await settle(200);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  const el = await log().elementHandle(); await el.screenshot({ path: `${OUT}/${name}-log.png` });
  console.log(`\n== ${name} (log ${inv.logBox.w}x${inv.logBox.h} at x${inv.logBox.x}, page ${inv.scrollW}x${inv.scrollH}, ${inv.items.length} items)`);
  for (const it of inv.items) console.log(`${String(it.gap ?? '').padStart(7)} | ${it.kind[0]} ${it.tag}.${it.cls} "${it.text}" | ${it.ff ?? ''} ${it.size ?? ''}/${it.weight ?? ''} ${it.tt ?? ''} ${it.lh ?? ''} ${it.color ?? ''} h${it.h} x${it.x}`);
};

await page.goto(BASE + ROUTE, { waitUntil: 'networkidle' }); await page.waitForSelector('.notebook-log'); await page.evaluate(() => document.fonts.ready); await settle();
// record a batch resembling Mark's: churn values, both notes, both picks, a tasting with a note, melt, two marks, one problem
await log().getByRole('button', { name: /record a batch/i }).first().click(); await settle();
await log().locator('input[type="date"]').first().fill('2026-10-18');
await log().getByLabel('Out of machine').fill('-7');
await log().getByLabel('Churn duration').fill('28');
await log().getByLabel('At the machine').fill('Soft, held its shape');
await log().getByLabel('Ingredient notes').fill('Cocoa tin opened 1 Oct');
await log().locator('.segmented__option', { hasText: 'Smooth ribbon' }).click();
await log().locator('.segmented__option', { hasText: 'Medium, standard' }).click();
await log().getByRole('button', { name: /add tasting/i }).first().click(); await settle();
await log().locator('input[type="date"]').nth(1).fill('2026-10-19');
await log().getByLabel('Tempering').fill('10');
await log().getByLabel('Tasting temperature').fill('-12');
await log().getByLabel('How did it turn out?').fill('Rich, a chalky finish');
await log().getByLabel('Melt test').fill('4');
await log().locator('.segmented__option', { hasText: 'Creamy puddle' }).click();
await log().getByLabel('Next time').fill('Less cinnamon');
await log().locator('.axis-mark').nth(0).locator('.axis-mark__stop').nth(3).click();
await log().locator('.axis-mark').nth(2).locator('.axis-mark__stop').nth(1).click();
await log().locator('.chip-toggle').first().click();
await settle();
await take('pen-filled-1366');
await log().getByRole('button', { name: /^save batch$/i }).first().click();
await page.waitForURL(/\/batch\//); await settle(500);
const batchUrl = page.url(); console.log('saved', batchUrl);
await take('reading-1366');
await log().getByRole('button', { name: /^correct$/i }).first().click(); await settle(); await take('correct-1366');
await log().getByRole('button', { name: /^cancel$/i }).first().click(); await settle();
await log().getByRole('button', { name: /record another/i }).first().click(); await settle(); await take('record-blank-1366');
await log().locator('.mo-group[data-mo="atdraw"] .segmented__option', { hasText: 'Nothing to note' }).click(); await settle(); await take('record-atdraw-picked-1366');
await log().getByRole('button', { name: /^clear at draw$/i }).first().click(); await settle();
await log().getByRole('button', { name: /add tasting/i }).first().click(); await settle(); await take('record-tasting-blank-1366');
await log().getByRole('button', { name: /^cancel$/i }).first().click(); await settle();
// the phone (sketch 011 decision 30): same context, same stored batch
await page.setViewportSize({ width: 393, height: 852 }); await page.goto(batchUrl, { waitUntil: 'networkidle' }); await page.waitForSelector('.notebook-log'); await settle(500);
await take('reading-393');
await log().getByRole('button', { name: /^correct$/i }).first().click(); await settle(); await take('correct-393');
await writeFile(OUT + '/layout-measure.json', JSON.stringify({ batchUrl, states }, null, 1));
await browser.close(); process.exit(0);
