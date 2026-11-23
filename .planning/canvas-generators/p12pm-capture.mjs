// Sid, 2026-11-23 (bug-p11-pen-steps-no-reorder, answered "fix": a later version may change the order of its steps in the Next version pen; sketch 017): captures the built
// app's own markup and measures for the boards of p12pm.py, so each starts from the built page.
//   node p12pm-capture.mjs <dist built from the commit to draw over> [commit] [chromium]   -> p12pm-capture.json (WebKit) or p12pm-capture-chromium.json
// WebKit with a coarse pointer by default, Chrome with "chromium"; 1366 x 1024; the dist served read-only on a throwaway 127.0.0.1 port (never Mark's preview, no Vite process);
// one throwaway context with its own IndexedDB. The clock is fixed at 4 Aug 2026. The example words are Sid's.
//   1. The recipe "Coffee" is made in the creation editor: four ingredients, five steps written as Steep, Strain, Sweeten, Rest, Churn; then Rest is moved up once with its Move
//      up button (where focus stays and what is announced are recorded), so the saved first version holds its step keys out of ascending order.
//   2. Save. The stored version's step keys are read from IndexedDB in array order; the reading page's Instructions and Ingredients and the print route's words are captured.
//   3. Next version: the pen's Instructions and Ingredients as built, every step's margin number and acts line measured; the Tab stops inside Instructions counted.
//   4. Rest is removed in the pen (captured), the pen is saved as a new version, and Show changes on that version is captured (a removed step struck with its parent number).
//   5. Next version on that second version: the pen over a step that was already removed when it opened.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../milestones/v1-phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(process.argv[2]); const useChromium = process.argv[4] === 'chromium';
const out = { dist: DIST, commit: process.argv[3] || null, engine: useChromium ? 'chromium' : 'webkit', at: new Date().toISOString() };
const dead = setTimeout(() => { console.log('TIMEOUT', Object.keys(out).join(' ')); process.exit(2); }, 240000);

const bake = (sel) => { const root = document.querySelector(sel); if (!root) return null;
  for (const i of root.querySelectorAll('input')) { if (i.type === 'radio' || i.type === 'checkbox') { if (i.checked) i.setAttribute('checked', ''); else i.removeAttribute('checked'); } else i.setAttribute('value', i.value); }
  for (const t of root.querySelectorAll('textarea')) t.textContent = t.value;
  return root.outerHTML; };
const active = () => { const e = document.activeElement; if (!e || e === document.body) return null; return { tag: e.tagName, t: (e.getAttribute('aria-label') || e.textContent.trim()).slice(0, 70), cls: e.className, disabled: e.getAttribute('aria-disabled') }; };
const live = () => [...document.querySelectorAll('[aria-live], [role="status"], [role="alert"]')].map((e) => e.textContent.trim()).filter(Boolean);
const geo = () => { const r1 = (n) => Math.round(n * 10) / 10; const box = (e) => { const b = e.getBoundingClientRect(); return { x: r1(b.left), y: r1(b.top + scrollY), w: r1(b.width), h: r1(b.height) }; };
  const region = document.querySelector('.method-region'); const list = region.querySelector('ol.method-steps');
  return { region: box(region), list: box(list), steps: [...list.children].map((li) => { const n = li.querySelector(':scope > .method-step__n'); const body = li.querySelector(':scope > .method-step__body') || li.children[1]; const acts = li.querySelector('.method-step__acts'); const s = n ? getComputedStyle(n) : null;
    return { id: li.id || li.getAttribute('data-step'), li: box(li), n: n ? { words: n.textContent, cls: n.className, font: `${s.fontSize}/${s.fontWeight} ${s.fontFamily.split(',')[0]}`, lh: s.lineHeight, deco: s.textDecorationLine, ...box(n) } : null, body: body ? box(body) : null,
      acts: acts ? { ...box(acts), gap: getComputedStyle(acts).columnGap, kids: [...acts.children].map((k) => ({ tag: k.tagName, words: k.textContent, label: k.getAttribute('aria-label'), cls: k.className, ...box(k) })) } : null }; }) }; };

const { appUrl, close } = await startServers({ appRoot: DIST });
const browser = useChromium ? await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }) : await webkit.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: true, deviceScaleFactor: 1 }); const page = await ctx.newPage(); page.setDefaultTimeout(8000);
  await page.clock.setFixedTime(new Date('2026-08-04T12:00:00'));
  const clickUntil = async (target, sel) => { for (let i = 0; i < 6; i++) { await target().first().click(); try { await page.waitForSelector(sel, { timeout: 1200 }); return; } catch { /* a first click after a navigation can miss */ } } throw new Error('never appeared: ' + sel); };
  const L = (l) => page.locator(`[aria-label="${l}"]`);
  const pickRow = (name) => page.locator('.pick__row', { has: page.locator('.pick__name', { hasText: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }) });
  const add = async (name, grams) => { await clickUntil(() => page.locator('.ingredient-table-region .mk-head-act'), '.pick'); await pickRow(name).click(); await page.waitForSelector('.pick', { state: 'detached' }); await page.fill(`[aria-label="${name}, grams"]`, grams); };
  const use = (n, name) => page.locator(`.method-step[data-step="${n}"] .method-step__uses-item`, { hasText: name }).locator('input');
  const state = async (key) => { out[key] = { method: await page.evaluate(bake, '.method-region'), ing: await page.evaluate(bake, '.ingredient-table-region'), geo: await page.evaluate(geo), focus: await page.evaluate(active), live: await page.evaluate(live), url: page.url().replace(appUrl, '') }; };
  const stored = async (versionId) => page.evaluate((id) => new Promise((res, rej) => { const q = indexedDB.open('sprinkles'); q.onerror = () => rej(q.error);
    q.onsuccess = () => { const g = q.result.transaction('versions').objectStore('versions').get(id); g.onsuccess = () => { const v = g.result; q.result.close(); res(v ? { keys: v.method.map((s) => s.n), removed: v.method.filter((s) => s.removed).map((s) => s.n), leadIns: v.method.map((s) => s.leadIn), portions: v.rows.map((r) => [r.ingredientName, r.portions.map((p) => p.step)]), uses: v.method.map((s) => s.uses ?? []).map((u) => u.length), parent: v.parentVersionId ?? null } : null); }; }; }), versionId);

  // ---- 1. create ---------------------------------------------------------------------------------------------------------------------------------------------------------------
  await page.goto(appUrl + '/notebook', { waitUntil: 'load' }); await page.waitForSelector('.nb__head'); await page.waitForTimeout(700);
  await clickUntil(() => page.locator('.nb__head .notebook-action'), '.nb__new textarea'); await page.fill('.nb__new textarea', 'Coffee'); await page.locator('.nb__new-actions button', { hasText: /^Start$/ }).click(); await page.waitForSelector('.ingredient-table-region');
  await page.fill('textarea[aria-label="Recipe description"]', 'Strong and cold.');
  for (const [name, g] of [['Heavy cream, 36% fat', '400'], ['Coffee beans', '40'], ['Dextrose', '120'], ['Fine sea salt', '1']]) await add(name, g);
  const STEPS = [['Steep', 'Warm the cream with the beans and hold for ten minutes.'], ['Strain', 'Strain out the beans.'], ['Sweeten', 'Stir in the dextrose and the salt.'], ['Rest', 'Rest the base for an hour.'], ['Churn', 'Chill the base, then churn.']];
  await clickUntil(() => page.locator('.method-region .mk-head-act'), '[aria-label="Step 1, lead-in"]');
  for (let i = 0; i < STEPS.length; i++) { const n = i + 1;
    await page.fill(`[aria-label="Step ${n}, lead-in"]`, STEPS[i][0]); await page.fill(`[aria-label="Step ${n}, instruction"]`, STEPS[i][1]);
    if (i < STEPS.length - 1) { await L(`Step ${n}, Add step after it`).click(); await page.waitForSelector(`[aria-label="Step ${n + 1}, lead-in"]`); } }
  await L('Step 1, change ingredients').click(); await use(1, 'Heavy cream').click(); await use(1, 'Coffee beans').click(); await L('Step 1, done').click();
  await L('Step 3, change ingredients').click(); await use(3, 'Dextrose').click(); await use(3, 'Fine sea salt').click(); await L('Step 3, done').click(); await page.waitForTimeout(300);
  await state('ed_before');
  await L('Step 4, move up').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(400);      // Rest goes up: Steep, Strain, Rest, Sweeten, Churn
  await state('ed_moved');
  // the first step's Move up is off; pressing it does nothing
  await L('Step 1, move up').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(300); out.ed_off = { focus: await page.evaluate(active), live: await page.evaluate(live), order: await page.evaluate(() => [...document.querySelectorAll('.method-region .prose-field--lead-in')].map((t) => t.value)) };

  // ---- 2. save -----------------------------------------------------------------------------------------------------------------------------------------------------------------
  await page.click('.notebook-ceremony__actions .notebook-action:not(.notebook-action--outline)'); await page.waitForSelector('.notebook-version'); await page.waitForTimeout(800);
  const v1 = page.url().replace(appUrl, ''); out.v1 = v1; out.v1_stored = await stored(v1.split('/').pop());
  await state('v1_reading');
  await page.goto(appUrl + v1 + '/print', { waitUntil: 'load' }); await page.waitForTimeout(1200); out.v1_print = { words: await page.evaluate(() => document.querySelector('#root').innerText.slice(0, 2500)), html: (await page.evaluate(bake, '#root')).length };
  await page.goto(appUrl + v1, { waitUntil: 'load' }); await page.waitForSelector('.notebook-version'); await page.waitForTimeout(800);

  // ---- 3. the pen as built -----------------------------------------------------------------------------------------------------------------------------------------------------
  await clickUntil(() => page.locator('.notebook-version__acts button', { hasText: /^Next version$/ }), '.notebook-ceremony'); await page.waitForTimeout(400);
  await page.fill('[aria-label="Version name"]', 'sweeten warm'); await page.waitForTimeout(300);
  await state('pen');
  out.pen.tabStops = await page.evaluate(() => [...document.querySelectorAll('.method-region button, .method-region textarea, .method-region a')].map((e) => e.getAttribute('aria-label') || e.textContent.trim()));
  out.pen.widths = await page.evaluate(() => { const b = (q) => { const e = document.querySelector(q); return e ? Math.round(e.getBoundingClientRect().width * 10) / 10 : null; }; return { sheet: b('.notebook-body__sheet'), page: b('.recipe-page'), method: b('.method-region'), lead: b('.method-step__lead'), table: b('.ingredient-table') }; });
  // an open step, as built (its last line: Cancel, Done)
  await L('Step 4, edit this step').click(); await page.waitForSelector('.method-step__open-fields'); await page.waitForTimeout(300); await state('pen_open');
  await page.locator('.method-step__done-cancel button', { hasText: /^Cancel$/ }).click(); await page.waitForTimeout(300);

  // ---- 4. a removed step, saved, Show changes -----------------------------------------------------------------------------------------------------------------------------------
  await L('Step 3, remove').click(); await page.waitForTimeout(400); await state('pen_removed');
  await page.locator('.notebook-ceremony__actions button', { hasText: /^Save as new version$/ }).click(); await page.waitForFunction((u) => !location.pathname.endsWith(u), v1.split('/').pop()); await page.waitForSelector('.notebook-version'); await page.waitForTimeout(900);
  const v2 = page.url().replace(appUrl, ''); out.v2 = v2; out.v2_stored = await stored(v2.split('/').pop());
  await state('v2_reading');
  await page.locator('button', { hasText: /^Show changes$/ }).first().click(); await page.waitForTimeout(500); await state('v2_changes');
  await page.locator('button', { hasText: /^Hide changes$/ }).first().click(); await page.waitForTimeout(300);

  // ---- 5. the pen over a step removed before it opened --------------------------------------------------------------------------------------------------------------------------
  await clickUntil(() => page.locator('.notebook-version__acts button', { hasText: /^Next version$/ }), '.notebook-ceremony'); await page.waitForTimeout(400);
  await page.fill('[aria-label="Version name"]', 'third'); await page.waitForTimeout(300); await state('pen2');
  await ctx.close();
} catch (e) { console.log('ERR', String(e.message).slice(0, 700)); out.error = String(e.message); } finally { await browser.close(); await close(); }
await writeFile(path.join(HERE, useChromium ? 'p12pm-capture-chromium.json' : 'p12pm-capture.json'), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k, JSON.stringify(v).length < 500 ? JSON.stringify(v) : JSON.stringify(v).length);
clearTimeout(dead); process.exit(out.error ? 1 : 0);
