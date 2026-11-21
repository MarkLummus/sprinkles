// Sid, 2026-11-21 (Phase 12 Gate 2; 12-CONTEXT.md D-06, D-08, D-09, D-11; ROADMAP "Design gate 2"): captures the built app's own markup for the Gate 2 boards (p12g2.py), so every
// board starts from the built page.
//   node p12g2-capture.mjs [dist, default app/dist]   -> p12g2-capture.json
// WebKit, coarse pointer, app/dist served read-only on a throwaway 127.0.0.1 port (never Mark's preview on :4173; no Vite process; nothing is written to app/dist).
// Two throwaway contexts, each with its own IndexedDB:
//   phone   393 x 852: Home, the Notebook, More open, the recipe page's head for a tasted recipe, one awaiting a tasting and one not yet churned, and a placeholder place (the page
//           the one-line page is drawn from). The tasted recipe's head again at 723.
//   desk    1366 x 1024: a recipe "Coffee" made through the creation editor's own controls (four ingredients, two steps). The Ingredients and Instructions regions with their real
//           Tab order (Tab pressed in WebKit, the focused control read back each time), Preview step pressed, the picker open, and the two "after" states of Add ingredient made
//           with the build's own controls (heading Add ingredient, Add to step, Move up). Then Save, Next version, a step opened in the version pen. The same context at 393 gives
//           the Notebook with a kept draft and the head of a version that can be edited and of one with an edit kept.
// The example words are Sid's, not Mark's and not in the data. The clock is fixed at 4 Aug 2026.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../milestones/v1-phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(process.argv[2] || path.join(HERE, '..', '..', 'app', 'dist'));
const out = { dist: DIST, at: new Date().toISOString() };
const dead = setTimeout(() => { console.log('TIMEOUT', Object.keys(out).join(' ')); process.exit(2); }, 240000);

const bake = (sel) => { const root = document.querySelector(sel); if (!root) return null;
  for (const i of root.querySelectorAll('input')) { if (i.type === 'radio' || i.type === 'checkbox') { if (i.checked) i.setAttribute('checked', ''); else i.removeAttribute('checked'); } else i.setAttribute('value', i.value); }
  for (const t of root.querySelectorAll('textarea')) t.textContent = t.value;
  for (const s of root.querySelectorAll('select')) for (const o of s.options) { if (o.selected) o.setAttribute('selected', ''); else o.removeAttribute('selected'); }
  return root.outerHTML; };
// every control a person can see in the element: its words and box
const controls = (sel) => { const root = document.querySelector(sel); if (!root) return null; const r1 = (n) => Math.round(n * 10) / 10;
  return [...root.querySelectorAll('button, a, summary, textarea, input, select')].filter((e) => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden')
    .map((e) => { const b = e.getBoundingClientRect(); return { tag: e.tagName, t: (e.getAttribute('aria-label') || e.textContent.trim()).slice(0, 70), words: e.textContent.trim().slice(0, 40), cls: e.className, x: r1(b.left), y: r1(b.top + scrollY), w: r1(b.width), h: r1(b.height) }; }); };
const active = () => { const e = document.activeElement; if (!e || e === document.body) return null; const b = e.getBoundingClientRect();
  return { tag: e.tagName, t: (e.getAttribute('aria-label') || e.textContent.trim()).slice(0, 70), region: e.closest('.ingredient-table-region') ? 'ing' : e.closest('.method-region') ? 'method' : 'other', off: e.getAttribute('aria-disabled') === 'true', w: Math.round(b.width), h: Math.round(b.height) }; };

const { appUrl, close } = await startServers({ appRoot: DIST }); const browser = await webkit.launch();
try {
  // ---- phone ----------------------------------------------------------------------------------------------------------------------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }); const page = await ctx.newPage(); page.setDefaultTimeout(8000);
    await page.clock.setFixedTime(new Date('2026-08-04T12:00:00'));
    const load = async (route, sel = '.shell__main') => { await page.goto(appUrl + route, { waitUntil: 'load' }); await page.waitForSelector(sel); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(700); };
    const snap = async (key, sel = '#root') => { out[key] = { html: await page.evaluate(bake, sel), controls: await page.evaluate(controls, '.shell__main'), tabs: await page.evaluate(controls, '.shell__tabs'), innerW: await page.evaluate(() => innerWidth), scrollW: await page.evaluate(() => document.documentElement.scrollWidth) }; };
    await load('/'); await snap('home_393');
    const hrefs = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.home__row')].map((r) => [r.querySelector('.home__standing').textContent, r.querySelector('.home__name a').getAttribute('href')]).reverse()));
    const tasting = await page.evaluate(() => document.querySelector('.home__row .home__action[href*="/batch/"]').getAttribute('href').replace(/\/batch\/.*/, ''));
    out.routes = { tasted: hrefs['Tasted'], awaiting: tasting, none: hrefs['Not yet churned'] };
    await load('/notebook'); await snap('notebook_393');
    await page.locator('.shell__more summary').click(); await page.waitForTimeout(400); await snap('more_393');
    await load('/recipe-book'); await snap('place_393');
    for (const [k, route] of Object.entries(out.routes)) { await load(route, '.notebook-version'); await snap(`recipe_${k}_393`); }
    await page.setViewportSize({ width: 723, height: 900 }); await load(out.routes.tasted, '.notebook-version'); await snap('recipe_tasted_723');
    await ctx.close();
  }
  // ---- desk -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: true, deviceScaleFactor: 1 }); const page = await ctx.newPage(); page.setDefaultTimeout(8000);
    await page.clock.setFixedTime(new Date('2026-08-04T12:00:00'));
    const clickUntil = async (target, sel) => { for (let i = 0; i < 6; i++) { await target().first().click(); try { await page.waitForSelector(sel, { timeout: 1200 }); return; } catch { /* a first click after a navigation can miss */ } } throw new Error('never appeared: ' + sel); };
    const L = (l) => page.locator(`[aria-label="${l}"]`);
    const pickRow = (name) => page.locator('.pick__row', { has: page.locator('.pick__name', { hasText: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }) });
    const add = async (name, grams) => { await clickUntil(() => page.locator('.ingredient-table-region .mk-head-act'), '.pick'); await pickRow(name).click(); await page.waitForSelector('.pick', { state: 'detached' }); out['focusAfterPick_' + name] = await page.evaluate(active); await page.fill(`[aria-label="${name}, grams"]`, grams); };
    const use = (n, name) => page.locator(`.method-step[data-step="${n}"] .method-step__uses-item`, { hasText: name }).locator('input');
    const regions = async (key) => { out[key] = { ing: await page.evaluate(bake, '.ingredient-table-region'), method: await page.evaluate(bake, '.method-region'), ingW: await page.evaluate(() => document.querySelector('.ingredient-table-region').getBoundingClientRect().width), methodW: await page.evaluate(() => document.querySelector('.method-region').getBoundingClientRect().width),
      ingControls: await page.evaluate(controls, '.ingredient-table-region'), methodControls: await page.evaluate(controls, '.method-region') }; };
    await page.goto(appUrl + '/notebook', { waitUntil: 'load' }); await page.waitForSelector('.nb__head'); await page.waitForTimeout(700);
    await clickUntil(() => page.locator('.nb__head .notebook-action'), '.nb__new textarea'); await page.fill('.nb__new textarea', 'Coffee'); await page.locator('.nb__new-actions button', { hasText: /^Start$/ }).click(); await page.waitForSelector('.ingredient-table-region');
    await page.fill('textarea[aria-label="Recipe description"]', 'Strong and cold.');
    for (const [name, g] of [['Heavy cream, 36% fat', '400'], ['Coffee beans', '40'], ['Dextrose', '120'], ['Fine sea salt', '1']]) await add(name, g);
    await clickUntil(() => page.locator('.method-region .mk-head-act'), '[aria-label="Step 1, lead-in"]'); await page.fill('[aria-label="Step 1, lead-in"]', 'Steep'); await page.fill('[aria-label="Step 1, instruction"]', 'Warm the cream with the beans, then strain.');
    await L('Step 1, change ingredients').click(); await use(1, 'Heavy cream').click(); await use(1, 'Coffee beans').click(); await L('Step 1, done').click();
    await L('Step 1, Add step after it').click(); await page.waitForSelector('[aria-label="Step 2, lead-in"]'); out.focusAfterAddStep = await page.evaluate(active);
    await page.fill('[aria-label="Step 2, lead-in"]', 'Churn'); await page.fill('[aria-label="Step 2, instruction"]', 'Chill the base, then churn.');
    await L('Step 2, change ingredients').click(); await use(2, 'Dextrose').click(); await L('Step 2, done').click(); await page.waitForTimeout(300);
    await regions('ed_base');
    // the real Tab order through the two regions: focus the Ingredients heading's Add ingredient, then press Tab until focus leaves the Instructions region
    await page.locator('.ingredient-table-region .mk-head-act').focus(); const walk = [await page.evaluate(active)];
    for (let i = 0; i < 80; i++) { await page.keyboard.press('Tab'); const a = await page.evaluate(active); if (!a || a.region === 'other') { walk.push(a); break; } walk.push(a); }
    out.tabWalk = walk;
    // Preview step pressed on step 1
    await L('Step 1, Preview step').click(); await page.waitForSelector('.mk-preview'); await regions('ed_preview'); await L('Step 1, Hide preview').click();
    // the picker, opened from the heading
    await clickUntil(() => page.locator('.ingredient-table-region .mk-head-act'), '.pick'); out.picker = { html: await page.evaluate(bake, '.pick'), parent: await page.evaluate(() => { const p = document.querySelector('.pick'); const c = []; for (let e = p.parentElement; e && e !== document.body; e = e.parentElement) c.push(e.tagName + '.' + e.className); return c; }), box: await page.evaluate(() => { const b = document.querySelector('.pick').getBoundingClientRect(); return { w: b.width, h: b.height }; }), focus: await page.evaluate(active) };
    // after 1: Egg yolk lands right after Heavy cream in Step 1, ticked in its Uses (made with heading Add ingredient, Add to step, Move up)
    await pickRow('Egg yolk (fresh)').click(); await page.waitForSelector('.pick', { state: 'detached' }); await page.fill('[aria-label="Egg yolk (fresh), grams"]', '60');
    await L('Add to step, Egg yolk (fresh)').click(); await L('Step 1, Steep: add Egg yolk (fresh)').click(); await page.waitForTimeout(200);
    await L('Move up, Egg yolk (fresh)').click(); await page.waitForTimeout(300); out.focusAfterMove = await page.evaluate(active);
    await regions('ed_after_step');
    // after 2: Cinnamon lands after Fine sea salt under Not in a step yet
    await add('Cinnamon', '2'); await page.waitForTimeout(300); await regions('ed_after_unplaced');
    // the Notebook with the kept draft, at 393
    const root = async (key, route, sel) => { await page.goto(route.startsWith('http') ? route : appUrl + route, { waitUntil: 'load' }); await page.waitForSelector(sel); await page.waitForTimeout(900); out[key] = { html: await page.evaluate(bake, '#root'), controls: await page.evaluate(controls, '.shell__main'), innerW: await page.evaluate(() => innerWidth), scrollW: await page.evaluate(() => document.documentElement.scrollWidth) }; };
    await page.waitForTimeout(1200); await page.setViewportSize({ width: 393, height: 852 }); await root('notebook_draft_393', '/notebook', '.nb__draft');
    await root('new_393_today', '/notebook/new', '.ingredient-table-region');
    // Save, then the saved version's head at 393 (it can be edited)
    await page.setViewportSize({ width: 1366, height: 1024 }); await page.goto(appUrl + '/notebook/new', { waitUntil: 'load' }); await page.waitForSelector('.ingredient-table-region'); await page.waitForTimeout(700);
    await page.click('.notebook-ceremony__actions .notebook-action:not(.notebook-action--outline)'); await page.waitForSelector('.notebook-version'); await page.waitForTimeout(800); out.saved = page.url().replace(appUrl, '');
    await page.setViewportSize({ width: 393, height: 852 }); await root('recipe_editable_393', out.saved, '.notebook-version');
    // Next version at 1366, a step opened in the version pen
    await page.setViewportSize({ width: 1366, height: 1024 }); await page.goto(appUrl + out.saved, { waitUntil: 'load' }); await page.waitForSelector('.notebook-version'); await page.waitForTimeout(700);
    await clickUntil(() => page.locator('.notebook-version__acts button', { hasText: /^Next version$/ }), '.notebook-ceremony'); await page.waitForTimeout(400);
    await L('Step 1, edit this step').click(); await page.waitForSelector('.method-step__open-fields'); await page.waitForTimeout(300);
    out.pen_open = { method: await page.evaluate(bake, '.method-region'), methodW: await page.evaluate(() => document.querySelector('.method-region').getBoundingClientRect().width), methodControls: await page.evaluate(controls, '.method-region'),
      chain: await page.evaluate(() => { const c = []; for (let e = document.querySelector('.method-region').parentElement; e && e !== document.body; e = e.parentElement) c.push(e.tagName + '.' + e.className); return c; }) };
    await page.fill('[aria-label="Version name"]', 'less cream'); await page.waitForTimeout(1300);
    // the kept Next version draft at 393, as built today (the pen reopens)
    await page.setViewportSize({ width: 393, height: 852 }); await page.goto(appUrl + out.saved, { waitUntil: 'load' }); await page.waitForTimeout(1300);
    out.pendraft_393_today = { penOpen: await page.evaluate(() => !!document.querySelector('.notebook-ceremony')), caption: await page.evaluate(() => document.querySelector('.notebook-ceremony .notebook-caption')?.textContent ?? null) };
    await page.locator('.notebook-ceremony__actions button', { hasText: /^Cancel$/ }).click(); await page.waitForTimeout(600); const sure = page.locator('button', { hasText: /^Discard/ }); if (await sure.count()) { await sure.first().click(); await page.waitForTimeout(400); }
    // Edit at 1366, a change typed so the edit is kept, then the head at 393
    await page.setViewportSize({ width: 1366, height: 1024 }); await page.goto(appUrl + out.saved, { waitUntil: 'load' }); await page.waitForSelector('.notebook-version'); await page.waitForTimeout(700);
    out.afterCancelPen = await page.evaluate(() => [...document.querySelectorAll('.notebook-version__acts > *')].map((e) => e.textContent));
    await clickUntil(() => page.locator('.notebook-version__acts button', { hasText: /^Edit$/ }), '.ingredient-table-region'); await page.fill('textarea[aria-label="Recipe description"]', 'Strong, cold and a little bitter.'); await page.waitForTimeout(1300);
    await page.setViewportSize({ width: 393, height: 852 }); await root('recipe_editing_393', out.saved, '.notebook-version');
    await root('edit_393_today', out.saved + '/edit', '.ingredient-table-region');
    await ctx.close();
  }
} catch (e) { console.log('ERR', String(e.message).slice(0, 600)); out.error = String(e.message); } finally { await browser.close(); await close(); }
await writeFile(path.join(HERE, 'p12g2-capture.json'), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k, JSON.stringify(v).length);
clearTimeout(dead); process.exit(out.error ? 1 : 0);
