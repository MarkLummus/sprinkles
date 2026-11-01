// Sid's one-line field probe, 2026-11-01 (bug-ipad-tab-lost-from-single-line-fields; ruling in
// .impeccable/proposals/2026-11-01-one-line-fields.md). For every visible single-line <input> on each surface
// (Search, Ingredients, Notebook New recipe, the creation editor and its picker, Rename, the version pen with
// each step opened, the record pen with a tasting and Done differently open), it measures the field, swaps in a
// <textarea rows=1> carrying the same attributes and value, measures again and puts the input back.
// Without `fix` the textarea is bare; with `fix` it gets the four duties the ruling names (one scrolled line,
// the width held where the input had no CSS width, a flex-column label or a block cell field, the line centred
// in the touch floor). It never edits app/: build to a scratch directory first.
//   npm --prefix app run build -- --outDir "$S/dist" --emptyOutDir
//   node <this file> "$S" webkit|chrome fine|coarse [fix]      -> $S/probe/swap-<engine>-<pointer>[-fix].json
// Serves $S/dist through the Phase 8 walk server on ephemeral 127.0.0.1 ports and aborts every other host.
import { startServers } from '../../.planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
const { webkit, chromium } = await import(process.env.PLAYWRIGHT_CORE ?? '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
import { mkdirSync, writeFileSync } from 'node:fs';
const S = process.argv[2];
const ENGINE = process.argv[3] || 'webkit';
const TOUCH = process.argv[4] === 'coarse';
const FIX = process.argv[5] === 'fix';
const servers = await startServers({ appRoot: S + '/dist' });
const base = servers.appUrl;
const b = ENGINE === 'webkit' ? await webkit.launch() : await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: TOUCH, deviceScaleFactor: 1 });
await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
const page = await ctx.newPage();
page.setDefaultTimeout(8000);
const results = [];
const log = (...a) => console.log(...a);

async function settle() { await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400); }
async function dump(tag) {
  log(tag, JSON.stringify(await page.evaluate(() => ({
    buttons: [...document.querySelectorAll('main button, [role=main] button, .notebook button')].map((b) => (b.getAttribute('aria-label') || b.textContent).trim()).slice(0, 80),
    inputs: [...document.querySelectorAll('input,textarea')].filter((i) => i.offsetParent).map((i) => `${i.tagName}:${i.type || ''}:${i.getAttribute('aria-label') || i.closest('label')?.textContent.trim().slice(0, 30) || ''}`),
  }))));
}
async function click(name, opts = {}) {
  const loc = page.getByRole('button', { name, exact: opts.exact ?? true }).first();
  for (let i = 0; i < 4; i += 1) {
    try { await loc.click({ timeout: 3000 }); await settle(); return true; } catch (e) { if (i === 3) { log('MISS click', name, String(e.message).split('\n')[0]); return false; } }
  }
}

async function ink(rect) {
  if (rect.w < 4 || rect.h < 4) return null;
  const png = await page.screenshot({ clip: { x: rect.x + 2, y: rect.y + 2, width: rect.w - 4, height: rect.h - 4 } });
  return page.evaluate(async ({ b64, ox, oy }) => {
    const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
    const { data, width, height } = g.getImageData(0, 0, img.width, img.height);
    const r0 = data[0], g0 = data[1], b0 = data[2];
    let l = 1e9, t = 1e9, r = -1, bt = -1;
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
      const k = (y * width + x) * 4;
      if (Math.abs(data[k] - r0) > 48 || Math.abs(data[k + 1] - g0) > 48 || Math.abs(data[k + 2] - b0) > 48) { l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); bt = Math.max(bt, y); }
    }
    if (r < 0) return null;
    return { left: ox + l, top: oy + t, right: ox + r + 1, bottom: oy + bt + 1 };
  }, { b64: png.toString('base64'), ox: rect.x + 2, oy: rect.y + 2 });
}

// in-page helpers installed once per document
async function install() {
  await page.evaluate((FIX) => {
    window.__FIX = FIX;
    const r2 = (v) => Math.round(v * 100) / 100;
    const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r2(r.left), y: r2(r.top), w: r2(r.width), h: r2(r.height) }; };
    window.__eligible = () => [...document.querySelectorAll('input')].filter((i) => i.offsetParent && !['checkbox', 'radio', 'file', 'hidden', 'date'].includes(i.type));
    window.__measure = (el) => {
      el.scrollIntoView({ block: 'center' });
      const cs = getComputedStyle(el);
      const bw = (s) => parseFloat(cs[`border${s}Width`]);
      const r = el.getBoundingClientRect();
      const row = el.parentElement;
      const sibs = [...row.childNodes].filter((n) => n !== el).map((n) => {
        if (n.nodeType === 3) { if (!n.textContent.trim()) return null; const rg = document.createRange(); rg.selectNodeContents(n); const q = rg.getBoundingClientRect(); return { t: 'text:' + n.textContent.trim(), x: r2(q.left), y: r2(q.top), w: r2(q.width), h: r2(q.height) }; }
        return n.nodeType === 1 ? { t: n.tagName + '.' + n.className, ...box(n) } : null;
      }).filter(Boolean);
      return {
        tag: el.tagName, name: el.getAttribute('aria-label') || el.closest('label')?.querySelector('span')?.textContent.trim() || '',
        cls: el.className, type: el.type, inputmode: el.getAttribute('inputmode'),
        box: box(el), row: { t: row.tagName + '.' + row.className, ...box(row) }, grand: { t: row.parentElement.tagName + '.' + row.parentElement.className, ...box(row.parentElement) }, sibs,
        pad: { x: r2(r.left + bw('Left')), y: r2(r.top + bw('Top')), w: r2(r.width - bw('Left') - bw('Right')), h: r2(r.height - bw('Top') - bw('Bottom')) },
        css: { display: cs.display, va: cs.verticalAlign, font: `${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily.split(',')[0]}`, color: cs.color, pad: cs.padding, border: `${cs.borderTopWidth} ${cs.borderBottomWidth}`, minH: cs.minHeight, ws: cs.whiteSpace, ovf: cs.overflow, resize: cs.resize, align: cs.textAlign, bg: cs.backgroundColor },
        rowCss: (() => { const p = getComputedStyle(row); return `${p.display} ai=${p.alignItems} fd=${p.flexDirection}`; })(),
      };
    };
    window.__swap = (i) => {
      const el = window.__eligible()[i];
      const ta = document.createElement('textarea');
      for (const a of el.attributes) if (!['type', 'step', 'value'].includes(a.name)) ta.setAttribute(a.name, a.value);
      ta.setAttribute('rows', '1');
      ta.value = el.value;
      ta.__orig = el;
      const origPad = parseFloat(getComputedStyle(el).paddingTop);
      const ir = el.getBoundingClientRect();
      const parent = el.parentElement;
      const pd = getComputedStyle(parent).display;
      el.replaceWith(ta);
      if (window.__FIX) {
        // the 261101-lec standard, generalised: one scrolled line, no scrollbar
        ta.style.whiteSpace = 'pre';
        ta.style.overflow = 'hidden';
        // width pinned to the input's own (only matters where the input had no CSS width)
        if (Math.abs(ta.getBoundingClientRect().width - ir.width) > 0.5) { ta.style.width = ir.width + 'px'; ta.style.minWidth = ir.width + 'px'; ta.__pinnedWidth = true; }
        // a block or inline parent: the label becomes a flex column (lec's lead-in), a cell's field becomes block
        const pdNow = getComputedStyle(parent).display;
        if (!/flex|grid/.test(pdNow) && (pd === 'block' || pd === 'inline' || pd === 'inline-block')) {
          if (parent.tagName === 'TD') ta.style.display = 'block';
          else { parent.__oldStyle = parent.getAttribute('style'); parent.style.display = 'flex'; parent.style.flexDirection = 'column'; ta.__flexedParent = parent; }
        }
        // centre the one line inside a min-height floor, as the input did
        const cs = getComputedStyle(ta);
        const bt = parseFloat(cs.borderTopWidth), bb = parseFloat(cs.borderBottomWidth);
        const lh = parseFloat(cs.lineHeight);
        const h = ir.height;
        const need = (h - bt - bb - lh) / 2;
        const orig = origPad;
        if (need > orig + 0.01) { ta.style.paddingTop = need + 'px'; ta.style.paddingBottom = need + 'px'; ta.__centred = Math.round((need - orig) * 100) / 100; }
      }
      window.__current = ta;
      return true;
    };
    window.__unswap = () => { const ta = window.__current; if (ta.__flexedParent) { const p = ta.__flexedParent; if (p.__oldStyle == null) p.removeAttribute('style'); else p.setAttribute('style', p.__oldStyle); } ta.replaceWith(ta.__orig); window.__current = null; };
    window.__fixinfo = () => ({ pinnedWidth: !!window.__current.__pinnedWidth, flexedParent: !!window.__current.__flexedParent, block: window.__current.style.display === 'block', centred: window.__current.__centred || 0 });
    window.__fill = (i) => {
      const el = window.__eligible()[i];
      if (!el.value) { el.__wasEmpty = true; el.value = el.type === 'number' ? '-6' : el.getAttribute('inputmode') === 'decimal' ? '12.5' : '12 Wq'; }
    };
  }, FIX);
}

async function measureSurface(surface) {
  await install();
  const n = await page.evaluate(() => window.__eligible().length);
  for (let i = 0; i < n; i += 1) {
    await page.evaluate((i) => window.__fill(i), i);
    const before = await page.evaluate((i) => window.__measure(window.__eligible()[i]), i);
    await page.waitForTimeout(400);
    before.ink = await ink(before.pad);
    await page.evaluate((i) => window.__swap(i), i);
    await page.waitForTimeout(80);
    const after = await page.evaluate(() => window.__measure(window.__current));
    after.ink = await ink(after.pad);
    after.fix = await page.evaluate(() => window.__fixinfo());
    await page.evaluate(() => window.__unswap());
    results.push({ surface, before, after });
    log(`${surface} | ${before.name} | ${before.type} ${before.inputmode ?? ''}`);
  }
}

try {
  // Search
  await page.goto(base + '/search', { waitUntil: 'networkidle' }); await settle();
  await measureSurface('Search');
  // Ingredients
  await page.goto(base + '/ingredients', { waitUntil: 'networkidle' }); await settle();
  await measureSurface('Ingredients place');
  // Notebook new recipe
  await page.goto(base + '/notebook', { waitUntil: 'networkidle' }); await settle();
  await click('New recipe');
  await measureSurface('Notebook New recipe');
  await page.getByLabel('Name', { exact: true }).fill('Probe sorbet');
  await click('Start');
  await page.waitForSelector('.mk-page');
  await settle();
  await click('Add step');
  await dump('CREATION');
  const addTarget = await page.evaluate(() => [...document.querySelectorAll('button')].map((b) => b.getAttribute('aria-label') || b.textContent.trim()).find((t) => /add target/i.test(t)));
  if (addTarget) await click(addTarget);
  await click('Add scale');
  await click('Add problem');
  await measureSurface('Creation editor');
  const addIng = page.locator('.ingredient-table-region .mk-head-act').first();
  await addIng.click(); await settle();
  await measureSurface('Creation picker');
  // Recipe page
  await page.goto(base + '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', { waitUntil: 'networkidle' }); await settle();
  await click('Rename');
  await measureSurface('Recipe band Rename');
  await click('Cancel');
  await click('Next version');
  await dump('PEN');
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) { await click(`Step ${n}, edit this step`); }
  await dump('PEN-OPEN');
  await measureSurface('Version pen');
  await click('Cancel');
  await page.goto(base + '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', { waitUntil: 'networkidle' }); await settle();
  await click('Record another');
  await dump('RECORD');
  const at = await page.evaluate(() => [...document.querySelectorAll('button')].map((b) => b.getAttribute('aria-label') || b.textContent.trim()).find((t) => /^(add|record) tasting/i.test(t)));
  if (at) await click(at);
  await click('Step 1, done differently');
  await page.waitForTimeout(300);
  await page.keyboard.type('Cooled overnight');
  await settle();
  await dump('RECORD2');
  await measureSurface('Record pen');
} catch (e) { log('ERROR', String(e.message).split('\n')[0]); }
mkdirSync(`${S}/probe`, { recursive: true });
writeFileSync(`${S}/probe/swap-${ENGINE}-${TOUCH ? 'coarse' : 'fine'}${FIX ? '-fix' : ''}.json`, JSON.stringify(results, null, 1));
await b.close(); await servers.close();
