// Sid, 2026-10-22: captures the batch route's record pen with a tasting, filled as the layout probe filled it (10-layout-probe.mjs, the state
// "pen-filled-1366"), for the P10_PenRhythm board (p-pen-rhythm.py). Serves app/dist (the build Mark's device server shows) on an ephemeral
// port through 08-walk-server.mjs's static server; never 4173, no Vite. WebKit, 1366 x 744, coarse pointer. Writes the log's outerHTML with
// the typed values baked into the markup (value attributes, textarea text, checked radios) and the same inventory the probe records, so the
// capture can be checked against .impeccable/layout/layout-measure.json.
//   PROBE_DIST=<dist> node p-pen-rhythm-capture.mjs   -> p-pen-rhythm-capture.json
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const servers = await startServers({ appRoot: process.env.PROBE_DIST });
const browser = await webkit.launch();
const ctx = await browser.newContext({ viewport: { width: 1366, height: 744 }, hasTouch: true });
await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
const page = await ctx.newPage();
const log = () => page.locator('.notebook-log');
const settle = (ms = 350) => page.waitForTimeout(ms);
await page.goto(servers.appUrl + '/notebook/mexican-chocolate/mexican-chocolate-v4', { waitUntil: 'networkidle' });
await page.waitForSelector('.notebook-log'); await page.evaluate(() => document.fonts.ready); await settle();
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
const out = await page.evaluate(() => {
  const root = document.querySelector('.notebook-log'); const r0 = root.getBoundingClientRect();
  const face = (e) => { const s = getComputedStyle(e); return { size: s.fontSize, weight: s.fontWeight, tt: s.textTransform, ls: s.letterSpacing, lh: s.lineHeight, color: s.color }; };
  const own = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
  const items = [];
  for (const e of root.querySelectorAll('*')) {
    const tag = e.tagName.toLowerCase(); if (['svg', 'path', 'option', 'legend'].includes(tag)) continue;
    const r = e.getBoundingClientRect(); if (r.height === 0) continue;
    const text = own(e); const isCtl = ['input', 'select', 'textarea', 'button'].includes(tag); if (!text && !isCtl) continue;
    items.push({ kind: isCtl ? 'control' : 'text', tag, cls: typeof e.className === 'string' ? e.className.split(' ').slice(0, 3).join('.') : '', text: (text || e.value || e.getAttribute('aria-label') || '').slice(0, 30), top: +(r.top - r0.top).toFixed(1), bottom: +(r.bottom - r0.top).toFixed(1), h: +r.height.toFixed(1), x: +(r.left - r0.left).toFixed(0), ...face(e) });
  }
  items.sort((a, b) => a.top - b.top || a.x - b.x);
  let prev = null; for (const it of items) { it.gap = prev === null ? null : +(it.top - prev).toFixed(1); prev = Math.max(prev ?? -1e9, it.bottom); }
  // bake the typed state into the markup
  for (const i of root.querySelectorAll('input')) {
    if (i.type === 'radio' || i.type === 'checkbox') { if (i.checked) i.setAttribute('checked', ''); else i.removeAttribute('checked'); }
    else i.setAttribute('value', i.value);
  }
  for (const t of root.querySelectorAll('textarea')) t.textContent = t.value;
  return { logBox: { x: +r0.x.toFixed(0), w: +r0.width.toFixed(0), h: +r0.height.toFixed(0) }, items, html: root.outerHTML };
});
await writeFile(path.join(HERE, 'p-pen-rhythm-capture.json'), JSON.stringify(out, null, 1));
for (const it of out.items) console.log(`${String(it.gap ?? '').padStart(6)} | ${it.kind[0]} ${it.tag}.${it.cls} "${it.text}" h${it.h} x${it.x}`);
console.log('log', out.logBox, 'html', out.html.length);
await browser.close(); await servers.close(); process.exit(0);
