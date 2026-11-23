// Sid, 2026-11-23 (sketch 016 round three, the picker): a one-off probe of the BUILT creation editor, for Mark's question "why not insert the picker after the row". It makes
// Coffee with seven rows (two in step 1), reads the table's structure (a real table, block bodies, grid rows, a one-cell group heading), opens the picker from the first row and
// measures where it stands; then, for measurement only and outside React, moves the built picker into a new table row directly after the opener row and measures that, with the
// Tab order walked both ways. Nothing is written back to the app.
//   node p12r3-picker-probe.mjs <scratch dist> <this folder> [webkit|chromium] <shots dir>  > p12r3-picker-probe[-chromium].json
import { writeFile } from 'node:fs/promises';
const G = process.argv[3];
const { webkit, chromium } = await import('/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs');
const { startServers } = await import(G + '/../milestones/v1-phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs');
const DIST = process.argv[2]; const eng = process.argv[4] || 'webkit';
const out = {};
const { appUrl, close } = await startServers({ appRoot: DIST });
const browser = eng === 'chromium' ? await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }) : await webkit.launch();
const dead = setTimeout(() => { console.log('TIMEOUT'); process.exit(2); }, 200000);
try {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: true, deviceScaleFactor: 1 }); const page = await ctx.newPage(); page.setDefaultTimeout(8000);
  const clickUntil = async (target, sel) => { for (let i = 0; i < 6; i++) { await target().first().click(); try { await page.waitForSelector(sel, { timeout: 1200 }); return; } catch {} } throw new Error('never appeared: ' + sel); };
  const L = (l) => page.locator(`[aria-label="${l}"]`);
  const pickRow = (name) => page.locator('.pick__row', { has: page.locator('.pick__name', { hasText: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }) });
  const add = async (name, grams) => { await clickUntil(() => page.locator('.ingredient-table-region .mk-head-act'), '.pick'); await pickRow(name).click(); await page.waitForSelector('.pick', { state: 'detached' }); await page.fill(`[aria-label="${name}, grams"]`, grams); };
  const use = (n, name) => page.locator(`.method-step[data-step="${n}"] .method-step__uses-item`, { hasText: name }).locator('input');
  await page.goto(appUrl + '/notebook', { waitUntil: 'load' }); await page.waitForSelector('.nb__head'); await page.waitForTimeout(700);
  await clickUntil(() => page.locator('.nb__head .notebook-action'), '.nb__new textarea'); await page.fill('.nb__new textarea', 'Coffee'); await page.locator('.nb__new-actions button', { hasText: /^Start$/ }).click(); await page.waitForSelector('.ingredient-table-region');
  for (const [name, g] of [['Heavy cream, 36% fat', '400'], ['Coffee beans', '40'], ['Dextrose', '120'], ['Fine sea salt', '1'], ['Whole milk', '300'], ['Sucrose', '90'], ['Skim milk powder', '30'], ['Egg yolk (fresh)', '40']]) { try { await add(name, g); } catch (e) { out['adderr_' + name] = String(e.message).slice(0, 100); await page.locator('.pick__head button').click().catch(() => {}); } }
  await clickUntil(() => page.locator('.method-region .mk-head-act'), '[aria-label="Step 1, lead-in"]'); await page.fill('[aria-label="Step 1, lead-in"]', 'Steep'); await page.fill('[aria-label="Step 1, instruction"]', 'Warm the cream with the beans, then strain.');
  await L('Step 1, change ingredients').click(); await use(1, 'Heavy cream').click(); await use(1, 'Coffee beans').click(); await L('Step 1, done').click();
  await page.waitForTimeout(300);
  out.struct = await page.evaluate(() => { const t = document.querySelector('.ingredient-table'); const d = (e) => getComputedStyle(e).display; const kids = (e) => [...e.children].map((c) => ({ tag: c.tagName, cls: c.className, role: c.getAttribute('role'), label: c.getAttribute('aria-label'), display: d(c), n: c.children.length, cells: c.tagName === 'TR' ? [...c.children].map((x) => `${x.tagName}.${x.className}[${x.colSpan}] ${d(x)} ${Math.round(x.getBoundingClientRect().width)}`) : undefined, gtc: c.tagName === 'TR' ? getComputedStyle(c).gridTemplateColumns : undefined }));
    return { tag: t.tagName, cls: t.className, display: d(t), w: t.getBoundingClientRect().width, parent: t.parentElement.tagName + '.' + t.parentElement.className, sections: [...t.children].map((s) => ({ tag: s.tagName, cls: s.className, display: d(s), rows: kids(s) })), regionKids: [...document.querySelector('.ingredient-table-region').children].map((c) => c.tagName + '.' + c.className) }; });
  out.docH = await page.evaluate(() => document.documentElement.scrollHeight);
  const geo = () => page.evaluate(() => { const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), w: Math.round(b.width), h: Math.round(b.height) }; }; const btn = document.querySelector('[aria-label="Add ingredient after Heavy cream, 36% fat"]');
    return { scrollY, innerH: innerHeight, row: r(btn.closest('tr')), btn: r(btn), pick: r(document.querySelector('.pick')), name: r(document.querySelector('.pick textarea')), list: r(document.querySelector('.pick__list')), table: r(document.querySelector('.ingredient-table')), total: r([...document.querySelectorAll('.ingredient-table tr')].find((x) => /Total/.test(x.textContent))), focus: document.activeElement?.getAttribute('aria-label') || document.activeElement?.className, nrows: document.querySelectorAll('.pick__row').length }; });
  out.before = await geo();
  await L('Add ingredient after Heavy cream, 36% fat').click(); await page.waitForSelector('.pick'); await page.waitForTimeout(700);
  out.open = await geo();
  // Tab walk from Name through to leaving the picker
  const walk = []; for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); walk.push(await page.evaluate(() => { const e = document.activeElement; return (e.getAttribute('aria-label') || e.textContent.trim().slice(0, 30) || e.tagName) + (e.closest('.pick') ? ' [pick]' : ''); })); }
  out.walkBuilt = walk;
  await page.keyboard.press('Shift+Tab'); 
  // Candidate: move the picker into the table body after the opener row (measurement only; outside React)
  out.cand = await page.evaluate(() => { const btn = document.querySelector('[aria-label="Add ingredient after Heavy cream, 36% fat"]'); const row = btn.closest('tr'); const pick = document.querySelector('.pick'); const cols = row.children.length;
    const tr = document.createElement('tr'); tr.className = 'ingredient-table__pick'; const td = document.createElement('td'); td.colSpan = 99; td.style.gridColumn = '1 / -1'; td.style.padding = '0'; tr.appendChild(td); td.appendChild(pick); row.after(tr);
    const r = (e) => { const b = e.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), w: Math.round(b.width), h: Math.round(b.height) }; };
    return { cols, trDisplay: getComputedStyle(tr).display, tdDisplay: getComputedStyle(td).display, tr: r(tr), td: r(td), pick: r(pick), row: r(row), table: r(document.querySelector('.ingredient-table')), next: r(tr.nextElementSibling), nextLabel: tr.nextElementSibling.textContent.slice(0, 30), scrollY, docW: document.documentElement.scrollWidth, pickMargin: getComputedStyle(pick).marginTop }; });
  await page.evaluate(() => { document.querySelector('[aria-label="Add ingredient after Heavy cream, 36% fat"]').focus(); });
  const walk2 = []; for (let i = 0; i < 16; i++) { await page.keyboard.press('Tab'); walk2.push(await page.evaluate(() => { const e = document.activeElement; return (e.getAttribute('aria-label') || e.textContent.trim().slice(0, 30) || e.tagName) + (e.closest('.pick') ? ' [pick]' : ''); })); }
  out.walkCand = walk2;
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(200);
  await page.locator('.ingredient-table-region').screenshot({ path: process.argv[5] + '/cand-' + eng + '.png' });
  out.candTop = await geo();
} catch (e) { out.error = String(e.message).slice(0, 500); } finally { await browser.close(); await close(); }
console.log(JSON.stringify(out, null, 1)); clearTimeout(dead); process.exit(0);
