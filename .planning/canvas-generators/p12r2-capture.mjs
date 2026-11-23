// Sid, 2026-11-22 (Phase 12 round two, the three redraws Mark decided on Mark's List: decide-p12-phone-home-held-draft, decide-p12-desk-line-words, decide-p12-picker-says-where):
// captures the built app's own markup for the three boards of p12r2.py, so each starts from the built page.
//   node p12r2-capture.mjs <dist built from the commit to draw over>   -> p12r2-capture.json
// WebKit, coarse pointer, the dist served read-only on a throwaway 127.0.0.1 port (never Mark's preview, no Vite process). Two throwaway contexts, each with its own IndexedDB:
//   phone   the seed. At 1366 a Next version draft is kept on the recipe that awaits a tasting (on the version its batch was recorded on) and then on a recipe not yet churned, so
//           the second is Home's lead (the newest draft) and the first is a row. Then at 393: Home, the lead recipe's page head, the New recipe address and an Edit address;
//           the Edit address again at 723.
//   desk    1366 x 1024: the recipe "Coffee" made as in p12g2-capture.mjs (four ingredients, two steps), then the picker opened from a row in a step, from a row in no step and
//           from the heading: the Ingredients region each time, and where the page scrolled.
// The example words are Sid's. The clock is fixed at 4 Aug 2026.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../milestones/v1-phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(process.argv[2]);
const out = { dist: DIST, commit: process.argv[3] || null, at: new Date().toISOString() };
const dead = setTimeout(() => { console.log('TIMEOUT', Object.keys(out).join(' ')); process.exit(2); }, 240000);

const bake = (sel) => { const root = document.querySelector(sel); if (!root) return null;
  for (const i of root.querySelectorAll('input')) { if (i.type === 'radio' || i.type === 'checkbox') { if (i.checked) i.setAttribute('checked', ''); else i.removeAttribute('checked'); } else i.setAttribute('value', i.value); }
  for (const t of root.querySelectorAll('textarea')) t.textContent = t.value;
  for (const s of root.querySelectorAll('select')) for (const o of s.options) { if (o.selected) o.setAttribute('selected', ''); else o.removeAttribute('selected'); }
  return root.outerHTML; };
const controls = (sel) => { const root = document.querySelector(sel); if (!root) return null; const r1 = (n) => Math.round(n * 10) / 10;
  return [...root.querySelectorAll('button, a, summary, textarea, input, select')].filter((e) => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden')
    .map((e) => { const b = e.getBoundingClientRect(); return { tag: e.tagName, t: (e.getAttribute('aria-label') || e.textContent.trim()).slice(0, 70), words: e.textContent.trim().slice(0, 40), cls: e.className, href: e.getAttribute('href'), x: r1(b.left), y: r1(b.top + scrollY), w: r1(b.width), h: r1(b.height) }; }); };
const active = () => { const e = document.activeElement; if (!e || e === document.body) return null; return { tag: e.tagName, t: (e.getAttribute('aria-label') || e.textContent.trim()).slice(0, 70), cls: e.className }; };

const { appUrl, close } = await startServers({ appRoot: DIST }); const browser = await webkit.launch();
try {
  // ---- phone ----------------------------------------------------------------------------------------------------------------------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: true, deviceScaleFactor: 1 }); const page = await ctx.newPage(); page.setDefaultTimeout(8000);
    await page.clock.setFixedTime(new Date('2026-08-04T12:00:00'));
    const clickUntil = async (target, sel) => { for (let i = 0; i < 6; i++) { await target().first().click(); try { await page.waitForSelector(sel, { timeout: 1200 }); return; } catch { /* a first click after a navigation can miss */ } } throw new Error('never appeared: ' + sel); };
    const load = async (route, sel = '.shell__main') => { await page.goto(appUrl + route, { waitUntil: 'load' }); await page.waitForSelector(sel); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(800); };
    const snap = async (key, sel = '#root') => { out[key] = { html: await page.evaluate(bake, sel), controls: await page.evaluate(controls, '.shell__main'), innerW: await page.evaluate(() => innerWidth), scrollW: await page.evaluate(() => document.documentElement.scrollWidth) }; };
    await load('/');
    const rows = await page.evaluate(() => [...document.querySelectorAll('.home__row')].map((r) => ({ name: r.querySelector('.home__name a').textContent, standing: r.querySelector('.home__standing').textContent, href: r.querySelector('.home__name a').getAttribute('href'), act: r.querySelector('.home__action')?.getAttribute('href') ?? null })));
    out.rows = rows;
    const awaiting = rows.find((r) => r.standing === 'Awaiting tasting'); const none = rows.find((r) => r.standing === 'Not yet churned');
    const awaitingVersion = awaiting.act.replace(/\/batch\/.*/, '');
    out.routes = { awaiting: awaitingVersion, awaitingLatest: awaiting.href, none: none.href };
    const keep = async (route, words) => { await load(route, '.notebook-version');
      await clickUntil(() => page.locator('.notebook-version__acts button', { hasText: /^Next version$/ }), '.notebook-ceremony'); await page.waitForTimeout(400);
      await page.fill('[aria-label="Version name"]', words); await page.waitForTimeout(1500); };
    await keep(awaitingVersion, 'more cinnamon'); await keep(none.href, 'less cream');
    await page.setViewportSize({ width: 393, height: 852 });
    await load('/', '.home__lead'); await snap('home_draft_393');
    await load(none.href, '.notebook-version'); await snap('recipe_draft_393');
    await load(awaitingVersion, '.notebook-version'); await snap('recipe_draft_awaiting_393');
    await load('/notebook/new', '.place'); await snap('new_393');
    await load(none.href + '/edit', '.place'); await snap('edit_393');
    await page.setViewportSize({ width: 723, height: 900 }); await load(none.href + '/edit', '.place'); await snap('edit_723');
    await ctx.close();
  }
  // ---- desk -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: true, deviceScaleFactor: 1 }); const page = await ctx.newPage(); page.setDefaultTimeout(8000);
    await page.clock.setFixedTime(new Date('2026-08-04T12:00:00'));
    const clickUntil = async (target, sel) => { for (let i = 0; i < 6; i++) { await target().first().click(); try { await page.waitForSelector(sel, { timeout: 1200 }); return; } catch { /* a first click after a navigation can miss */ } } throw new Error('never appeared: ' + sel); };
    const L = (l) => page.locator(`[aria-label="${l}"]`);
    const pickRow = (name) => page.locator('.pick__row', { has: page.locator('.pick__name', { hasText: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }) });
    const add = async (name, grams) => { await clickUntil(() => page.locator('.ingredient-table-region .mk-head-act'), '.pick'); await pickRow(name).click(); await page.waitForSelector('.pick', { state: 'detached' }); await page.fill(`[aria-label="${name}, grams"]`, grams); };
    const use = (n, name) => page.locator(`.method-step[data-step="${n}"] .method-step__uses-item`, { hasText: name }).locator('input');
    const region = async (key) => { out[key] = { ing: await page.evaluate(bake, '.ingredient-table-region'), ingW: await page.evaluate(() => document.querySelector('.ingredient-table-region').getBoundingClientRect().width),
      head: await page.evaluate(() => { const h = document.querySelector('.pick__head'); const c = h.querySelector('.pen-caption'); const b = c.getBoundingClientRect(); const s = getComputedStyle(c); return { words: c.textContent, w: b.width, h: b.height, headW: h.getBoundingClientRect().width, font: `${s.fontSize}/${s.fontWeight}`, transform: s.textTransform, spacing: s.letterSpacing, group: document.querySelector('.pick').getAttribute('aria-label') }; }),
      scrollY: await page.evaluate(() => scrollY), focus: await page.evaluate(active),
      pickTop: await page.evaluate(() => document.querySelector('.pick').getBoundingClientRect().top) }; };
    await page.goto(appUrl + '/notebook', { waitUntil: 'load' }); await page.waitForSelector('.nb__head'); await page.waitForTimeout(700);
    await clickUntil(() => page.locator('.nb__head .notebook-action'), '.nb__new textarea'); await page.fill('.nb__new textarea', 'Coffee'); await page.locator('.nb__new-actions button', { hasText: /^Start$/ }).click(); await page.waitForSelector('.ingredient-table-region');
    await page.fill('textarea[aria-label="Recipe description"]', 'Strong and cold.');
    for (const [name, g] of [['Heavy cream, 36% fat', '400'], ['Coffee beans', '40'], ['Dextrose', '120'], ['Fine sea salt', '1']]) await add(name, g);
    await clickUntil(() => page.locator('.method-region .mk-head-act'), '[aria-label="Step 1, lead-in"]'); await page.fill('[aria-label="Step 1, lead-in"]', 'Steep'); await page.fill('[aria-label="Step 1, instruction"]', 'Warm the cream with the beans, then strain.');
    await L('Step 1, change ingredients').click(); await use(1, 'Heavy cream').click(); await use(1, 'Coffee beans').click(); await L('Step 1, done').click();
    await L('Step 1, Add step after it').click(); await page.waitForSelector('[aria-label="Step 2, lead-in"]');
    await page.fill('[aria-label="Step 2, lead-in"]', 'Churn'); await page.fill('[aria-label="Step 2, instruction"]', 'Chill the base, then churn.');
    await L('Step 2, change ingredients').click(); await use(2, 'Dextrose').click(); await L('Step 2, done').click(); await page.waitForTimeout(300);
    out.groups = await page.evaluate(() => [...document.querySelectorAll('.ingredient-table tbody tr')].map((r) => r.getAttribute('aria-label') || r.textContent.trim().slice(0, 60)));
    const btnY = async (label) => page.evaluate((l) => document.querySelector(`[aria-label="${l}"]`).getBoundingClientRect().top + scrollY, label);
    out.rowButtonY = await btnY('Add ingredient after Heavy cream, 36% fat');
    await L('Add ingredient after Heavy cream, 36% fat').click(); await page.waitForSelector('.pick'); await page.waitForTimeout(600); await region('pk_step');
    out.pk_step.rowButtonTop = await page.evaluate(() => document.querySelector('[aria-label="Add ingredient after Heavy cream, 36% fat"]').getBoundingClientRect().top);
    await L('Add ingredient after Fine sea salt').click(); await page.waitForTimeout(600); await region('pk_unplaced');
    await page.locator('.pick__head button').click(); await page.waitForSelector('.pick', { state: 'detached' }); await page.waitForTimeout(300);
    await clickUntil(() => page.locator('.ingredient-table-region .mk-head-act'), '.pick'); await page.waitForTimeout(600); await region('pk_heading');
    await ctx.close();
  }
} catch (e) { console.log('ERR', String(e.message).slice(0, 600)); out.error = String(e.message); } finally { await browser.close(); await close(); }
await writeFile(path.join(HERE, 'p12r2-capture.json'), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k, JSON.stringify(v).length < 400 ? JSON.stringify(v) : JSON.stringify(v).length);
clearTimeout(dead); process.exit(out.error ? 1 : 0);
