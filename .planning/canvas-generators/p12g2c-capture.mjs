// Sid, 2026-11-21 (Phase 12 Gate 2, the row controls redrawn for Mark's decision of the same day: decide-p12-add-step-place = last-line, the two groups of step operations, Cmd+Return):
// captures the built creation editor's states the redrawn P12G2_RowControls board starts from. A second capture file, so p12g2-capture.json (sets A and B) stays as it is.
//   node p12g2c-capture.mjs [dist, default app/dist]   -> p12g2c-capture.json
// WebKit, coarse pointer, 1366 x 1024, app/dist served read-only on a throwaway 127.0.0.1 port; one throwaway context. The recipe "Coffee" is made as in p12g2-capture.mjs, then:
//   ed_base            both steps as first written, with the real Tab order (tabWalk)
//   ed_picker          the picker open (from the heading): the whole Ingredients region, so the board shows the picker where the build puts it
//   ed_after_step      Egg yolk right after Heavy cream in Step 1, ticked in its Uses (heading Add ingredient, Add to step, Move up)
//   ed_after_unplaced  Cinnamon after Fine sea salt under Not in a step yet
//   ed_full            step 1 with a target, a purpose and an aside written, with the real Tab order (tabWalkFull)
//   ed_moved           Move down pressed on step 1 (stepMove: what the build says and where focus is; stepMoveOff, rowMove, rowMoveOff: the same for a greyed Move and for a row)
//   ed_added           Add step pressed on step 1: the new step 2 and where focus lands (focusAfterAddStep2)
// The example words are Sid's. The clock is fixed at 4 Aug 2026.
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
    const walkTabs = async () => { await page.locator('.ingredient-table-region .mk-head-act').focus(); const walk = [await page.evaluate(active)]; for (let i = 0; i < 140; i++) { await page.keyboard.press('Tab'); const a = await page.evaluate(active); walk.push(a); if (!a || a.region === 'other') break; } return walk; };
    out.tabWalk = await walkTabs();
    // what the build says and where focus goes on a move, and on a greyed Move (the redraw's Ctrl+Cmd+Up and Down do what these buttons do)
    const heard = () => page.evaluate(() => [...document.querySelectorAll('[role="status"], [aria-live]')].map((e) => e.textContent.trim()).filter(Boolean));
    await L('Move down, Heavy cream, 36% fat').click(); await page.waitForTimeout(400); out.rowMove = { heard: await heard(), focus: await page.evaluate(active) };
    await L('Move down, Heavy cream, 36% fat').evaluate((e) => e.click()); await page.waitForTimeout(400); out.rowMoveOff = { heard: await heard(), focus: await page.evaluate(active), order: await page.evaluate(() => [...document.querySelectorAll('.ingredient-table tbody tr[aria-label]')].map((r) => r.getAttribute('aria-label'))) };
    await L('Move up, Heavy cream, 36% fat').click(); await page.waitForTimeout(400);
    await clickUntil(() => page.locator('.ingredient-table-region .mk-head-act'), '.pick'); await regions('ed_picker'); out.ed_picker.focus = await page.evaluate(active);
    await pickRow('Egg yolk (fresh)').click(); await page.waitForSelector('.pick', { state: 'detached' }); await page.fill('[aria-label="Egg yolk (fresh), grams"]', '60');
    await L('Add to step, Egg yolk (fresh)').click(); await L('Step 1, Steep: add Egg yolk (fresh)').click(); await page.waitForTimeout(200);
    await L('Move up, Egg yolk (fresh)').click(); await page.waitForTimeout(300); await regions('ed_after_step');
    await add('Cinnamon', '2'); await page.waitForTimeout(300); await regions('ed_after_unplaced');
    await L('Step 1, Add target').click(); await page.fill('[aria-label="Step 1, target label"]', 'Heat to'); await page.fill('[aria-label="Step 1, target value"]', '82 °C');
    await L('Step 1, add purpose').click(); await page.fill('[aria-label="Step 1, purpose"]', 'Pulls the coffee into the cream.');
    await L('Step 1, add aside').click(); await page.fill('[aria-label="Step 1, aside"]', 'Do not let it boil.'); await page.locator('[aria-label="Step 1, lead-in"]').focus(); await page.waitForTimeout(300);
    await regions('ed_full'); out.tabWalkFull = await walkTabs();
    await L('Step 1, move down').click(); await page.waitForTimeout(400); out.stepMove = { heard: await heard(), focus: await page.evaluate(active) }; await regions('ed_moved');
    await L('Step 2, move down').evaluate((e) => e.click()); await page.waitForTimeout(400); out.stepMoveOff = { heard: await heard(), focus: await page.evaluate(active), order: await page.evaluate(() => [...document.querySelectorAll('.method-step [data-field="lead-in"]')].map((t) => t.value)) };
    await L('Step 2, move up').click(); await page.waitForTimeout(400);
    await L('Step 1, Add step after it').click(); await page.waitForSelector('[aria-label="Step 3, lead-in"]'); await page.waitForTimeout(300); out.focusAfterAddStep2 = await page.evaluate(active); await regions('ed_added');
    await ctx.close();
  }
} catch (e) { console.log('ERR', String(e.message).slice(0, 600)); out.error = String(e.message); } finally { await browser.close(); await close(); }
await writeFile(path.join(HERE, 'p12g2c-capture.json'), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k, JSON.stringify(v).length);
clearTimeout(dead); process.exit(out.error ? 1 : 0);
