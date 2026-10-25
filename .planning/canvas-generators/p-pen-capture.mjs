// Sid, 2026-10-25: captures the record pen with its tasting open on both entry paths at 1366 and 393, for the P10_Pen board (p-pen.py): A, Record another on
// Olive Oil v1 filled as p-pen-rhythm-capture.mjs filled it, then Add tasting and the tasting filled; B, Record a tasting from Home's row act on Mexican Chocolate v3
// (the untasted batch), the tasting filled the same way. WebKit, coarse pointer, a scratch build through the 03.5 probe harness; a fresh context per path so no kept
// draft leaks. Writes the log's outerHTML with the typed state baked in.   node p-pen-capture.mjs <scratch dist> -> p-pen-capture.json
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../milestones/v1-phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const { appUrl, close } = await startServers({ appRoot: path.resolve(process.argv[2]) });
const browser = await webkit.launch(); const out = {};
const bake = () => {
  const root = document.querySelector('.notebook-log'); const r0 = root.getBoundingClientRect();
  for (const i of root.querySelectorAll('input')) { if (i.type === 'radio' || i.type === 'checkbox') { if (i.checked) i.setAttribute('checked', ''); else i.removeAttribute('checked'); } else i.setAttribute('value', i.value); }
  for (const t of root.querySelectorAll('textarea')) t.textContent = t.value;
  return { logBox: { x: +r0.x.toFixed(0), w: +r0.width.toFixed(0), h: +r0.height.toFixed(0) }, html: root.outerHTML };
};
const fillTasting = async (page) => {
  const log = page.locator('.notebook-log');
  await log.locator('input[type="date"]').nth(1).fill('2026-10-19');
  await log.getByLabel('Tempering').fill('10');
  await log.getByLabel('Tasting temperature').fill('-12');
  await log.getByLabel('How did it turn out?').fill('Rich, a chalky finish');
  await log.getByLabel('Melt test').fill('4');
  await log.locator('.segmented__option', { hasText: 'Creamy puddle' }).click();
  await log.getByLabel('Next time').fill('Less cinnamon');
  await log.locator('.axis-mark').nth(0).locator('.axis-mark__stop').nth(3).click();
  await log.locator('.axis-mark').nth(2).locator('.axis-mark__stop').nth(1).click();
  await log.locator('.chip-toggle').first().click();
  await page.waitForTimeout(350);
};
try {
  for (const [W, H] of [[1366, 1024], [393, 852]]) {
    // A: Record another, filled, then Add tasting
    let ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 724, deviceScaleFactor: 1 }); let page = await ctx.newPage(); page.setDefaultTimeout(15000);
    await page.goto(appUrl + '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', { waitUntil: 'networkidle' }); await page.waitForSelector('.notebook-log'); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(350);
    let log = page.locator('.notebook-log');
    await log.getByRole('button', { name: /^Record (another|a batch)$/ }).first().click(); await page.waitForSelector('.ingredient-table__as-made-field'); await page.waitForTimeout(350);
    await log.locator('input[type="date"]').first().fill('2026-10-18');
    await log.getByLabel('Out of machine').fill('-7'); await log.getByLabel('Churn duration').fill('28');
    await log.getByLabel('At the machine').fill('Soft, held its shape'); await log.getByLabel('Ingredient notes').fill('Olive oil opened 1 Oct');
    await log.locator('.segmented__option', { hasText: 'Smooth ribbon' }).click(); await log.locator('.segmented__option', { hasText: 'Medium, standard' }).click();
    await log.getByRole('button', { name: /add tasting/i }).first().click(); await page.waitForSelector('.tasting-head'); await page.waitForTimeout(350);
    await fillTasting(page); out[`A_${W}`] = await page.evaluate(bake); await ctx.close();
    // B: Record a tasting from Home
    ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: W < 724, deviceScaleFactor: 1 }); page = await ctx.newPage(); page.setDefaultTimeout(15000);
    await page.goto(appUrl + '/', { waitUntil: 'networkidle' }); await page.waitForTimeout(400);
    await page.getByRole('link', { name: 'Record a tasting' }).first().click(); await page.waitForSelector('.tasting-head'); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);
    await fillTasting(page); out[`B_${W}`] = await page.evaluate(bake); await ctx.close();
  }
} finally { await browser.close(); await close(); }
await writeFile(path.join(HERE, 'p-pen-capture.json'), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k, v.logBox, v.html.length);
process.exit(0);
