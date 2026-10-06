// Quick task 261005-wgz's probe: a saved tasting note reads in the hand (D-02, Mark 2026-10-05,
// decide-tasting-note-in-the-hand), and the filled actions' weights (D-03, decide-filled-action-weight).
//
// Measures, in Playwright's WebKit and system Chrome on the BUILT app in app/dist:
//   - the computed typography of the saved tasting note (.tasting-reading__note) against a reference
//     .app-hand element injected into the same log, at 1600, 1366 and 393 wide; the pen's textarea must
//     not read Caveat (the hand is for display, not entry);
//   - at 1366 only, as INFO lines, the computed font-weight of Home's filled action, the Notebook's
//     filled action and the pen's filled Save.
// Run it from the checkout root after `npm --prefix app run build`:
//
//   node .planning/quick/261005-wgz-three-decided-app-fixes-one-step-darken-/261005-wgz-probe.mjs
//
// It serves only the 03.5 harness's loopback servers (ephemeral 127.0.0.1 ports, never --host), starts no
// Vite process and never requests Mark's :4173 preview. Every case runs in a fresh throwaway browser
// context whose IndexedDB is not Mark's. A reading here is evidence about two engines, not about a device.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, check, finish, APP_ROUTE } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const failures = [];
let count = 0;
const ck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const NOTE_TEXT = 'Soft set, clean finish';
const PEN_NOTE = 'textarea[aria-label="How did it turn out?"]';

const readType = (el) => {
  const c = getComputedStyle(el);
  return {
    family: c.fontFamily,
    size: c.fontSize,
    leading: c.lineHeight,
    color: c.color,
    style: c.fontStyle,
    weight: c.fontWeight,
  };
};

async function weightOf(page, selector) {
  try {
    return await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).fontWeight : 'not found';
    }, selector);
  } catch (error) {
    return 'not found';
  }
}

// Opens the pen with Correct, then exposes the tasting note field.
async function openPen(page) {
  await page.locator('button.batch-row__correct').first().click();
  await page.waitForSelector(PEN_NOTE, { state: 'attached', timeout: 5000 }).catch(() => {});
  if ((await page.locator(PEN_NOTE).count()) === 0) {
    // Correct did not expose the tasting section: Add tasting, as 03.5-batches-probe.mjs does.
    await page.getByRole('button', { name: 'Add tasting' }).first().click();
    await page.waitForSelector(PEN_NOTE, { state: 'attached', timeout: 5000 });
  }
}

async function openFold(page) {
  const toggle = page.locator('button[aria-controls="fold-tasting"]').first();
  if ((await toggle.count()) > 0 && (await toggle.getAttribute('aria-expanded')) === 'false') {
    await toggle.click();
    await page.waitForTimeout(200);
  }
}

async function noteCase(browser, servers, engine, width) {
  const tag = `${engine}@${width}`;
  const height = width === 393 ? 852 : 1100;
  const { context, page } = await openApp(browser, servers.appUrl, APP_ROUTE, { width, height, coarse: false });
  try {
    page.setDefaultTimeout(10000);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);

    let pen = null;
    let note = null;
    let ref = null;
    let caveatLoaded = false;
    let problem = '';
    try {
      await openPen(page);
      await openFold(page);
      pen = await page.locator(PEN_NOTE).evaluate(readType);
      if (width === 1366) {
        console.log(`INFO weight ${engine} pen's filled Save: ${await weightOf(page, '.notebook-log .save-ceremony button:last-of-type')}`);
      }
      await page.locator(PEN_NOTE).fill(NOTE_TEXT);
      await page.locator('.save-ceremony button').last().click();
      await page.waitForSelector('button[aria-controls="fold-tasting"], .tasting-reading__note', { timeout: 5000 });
      await openFold(page);
      await page.waitForSelector('.tasting-reading__note', { state: 'visible', timeout: 5000 });
      await page.waitForTimeout(300);
      ref = await page.evaluate(() => {
        const log = document.querySelector('.notebook-log') || document.body;
        const span = document.createElement('span');
        span.className = 'app-hand';
        span.textContent = 'reference';
        log.appendChild(span);
        const c = getComputedStyle(span);
        const out = { family: c.fontFamily, size: c.fontSize, leading: c.lineHeight, color: c.color, style: c.fontStyle, weight: c.fontWeight };
        span.remove();
        return out;
      });
      note = await page.locator('.tasting-reading__note').first().evaluate(readType);
      caveatLoaded = await page.evaluate(() => document.fonts.check('22px Caveat'));
    } catch (error) {
      problem = String(error.message).split('\n')[0];
    }

    console.log(
      `  ${tag}: note ${note ? `${note.family} | ${note.size} / ${note.leading} | ${note.color} | ${note.style} ${note.weight}` : 'missing'}; ` +
        `reference ${ref ? `${ref.family} | ${ref.size} / ${ref.leading} | ${ref.color} | ${ref.style} ${ref.weight}` : 'missing'}; ` +
        `pen textarea ${pen ? pen.family : 'missing'}; Caveat loaded ${caveatLoaded}${problem ? `; stopped: ${problem}` : ''}`,
    );

    const same = note && ref && ['family', 'size', 'leading', 'color', 'style'].every((key) => note[key] === ref[key]);
    const ok =
      Boolean(note && ref && pen) &&
      same &&
      /^["']?Caveat/.test(note.family) &&
      note.weight === '400' &&
      caveatLoaded &&
      !/^["']?Caveat/.test(pen.family);
    ck(
      ok,
      `${tag}: saved note family "${note ? note.family : 'missing'}" vs reference "${ref ? ref.family : 'missing'}"` +
        `${pen ? `; pen textarea "${pen.family}"` : '; pen textarea missing'}${problem ? `; stopped: ${problem}` : ''}`,
    );
  } finally {
    await context.close();
  }
}

async function weights(browser, servers, engine) {
  const tag = `${engine}@1366`;
  const home = await openApp(browser, servers.appUrl, '/', { width: 1366, height: 1100, coarse: false });
  try {
    home.page.setDefaultTimeout(10000);
    await home.page.evaluate(() => document.fonts.ready);
    await home.page.waitForTimeout(300);
    console.log(`INFO weight ${engine} Home's filled action: ${await weightOf(home.page, '.home__action')}`);
  } finally {
    await home.context.close();
  }
  const batch = await openApp(browser, servers.appUrl, APP_ROUTE, { width: 1366, height: 1100, coarse: false });
  try {
    batch.page.setDefaultTimeout(10000);
    await batch.page.evaluate(() => document.fonts.ready);
    await batch.page.waitForTimeout(300);
    console.log(`INFO weight ${engine} Notebook's filled action: ${await weightOf(batch.page, '.notebook-version__acts .notebook-action')}`);
  } finally {
    await batch.context.close();
  }
  return tag;
}

const servers = await startServers();
try {
  for (const [engine, launcher] of [
    ['webkit', () => webkit.launch()],
    ['chrome', () => launch()],
  ]) {
    const browser = await launcher();
    try {
      for (const width of [1600, 1366, 393]) await noteCase(browser, servers, engine, width);
      await weights(browser, servers, engine);
    } finally {
      await browser.close();
    }
  }
} finally {
  await servers.close();
}
finish(failures, count, '261005-wgz-probe');
