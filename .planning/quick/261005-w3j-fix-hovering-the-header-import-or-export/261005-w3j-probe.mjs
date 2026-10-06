// Quick task 261005-w3j's probe: hovering the header's Import or Export with a pointer must not change
// its box (sketch 011 decision 54; Mark's List row fix-header-import-export-hover-shrink).
//
// Measures the rest box and the hover box of the places that are buttons (the header's Import and Export,
// the Import error panel's Close, More's Import and Export tiles) and of the controls no hover rule
// reaches (the header's and More's Search link, More's summary), in Playwright's WebKit and system Chrome,
// on the BUILT app in app/dist. Run it from the checkout root after `npm --prefix app run build`:
//
//   node .planning/quick/261005-w3j-fix-hovering-the-header-import-or-export/261005-w3j-probe.mjs
//
// It serves only the 03.5 harness's loopback servers (ephemeral 127.0.0.1 ports, never --host), starts no
// Vite process and never requests Mark's :4173 preview. A reading here is evidence about two engines,
// not about a device.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const failures = [];
let count = 0;
const ck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};
const near = (a, b, tol) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;
const r2 = (n) => (typeof n === 'number' ? Math.round(n * 100) / 100 : n);
const sz = (b) => `${r2(b.width)}x${r2(b.height)}`;

function readBox(e) {
  const b = e.getBoundingClientRect();
  const c = getComputedStyle(e);
  return {
    left: b.left,
    top: b.top,
    width: b.width,
    height: b.height,
    padding: c.padding,
    bt: parseFloat(c.borderTopWidth),
    hover: e.matches(':hover'),
  };
}

// Rest, hover (5000ms timeout), 200ms wait, read again, mouse away.
async function hoverRead(page, loc) {
  const rest = await loc.evaluate(readBox);
  await loc.hover({ timeout: 5000 });
  await page.waitForTimeout(200);
  const hov = await loc.evaluate(readBox);
  await page.mouse.move(5, 5);
  await page.waitForTimeout(100);
  return { rest, hov };
}

// One counted check per case: a missing or invisible target is a failed check, not an exception.
async function measure(page, tag, name, loc) {
  try {
    const { rest, hov } = await hoverRead(page, loc);
    const same =
      hov.hover &&
      near(rest.left, hov.left, 0.05) &&
      near(rest.top, hov.top, 0.05) &&
      near(rest.width, hov.width, 0.05) &&
      near(rest.height, hov.height, 0.05) &&
      rest.padding === hov.padding;
    console.log(`  ${tag} ${name}: rest ${sz(rest)} at ${r2(rest.left)},${r2(rest.top)} pad ${rest.padding}; hover ${sz(hov)} at ${r2(hov.left)},${r2(hov.top)} pad ${hov.padding}`);
    ck(same, `${tag} ${name}: hover entered ${hov.hover}, rest ${sz(rest)} (pad ${rest.padding}) vs hover ${sz(hov)} (pad ${hov.padding})`);
  } catch (error) {
    console.log(`  ${tag} ${name}: not measured (${String(error.message).split('\n')[0]})`);
    ck(false, `${tag} ${name}: target missing or not hoverable`);
  }
}

const BAD_FILE = { name: 'not-json.json', mimeType: 'application/json', buffer: Buffer.from('this is not json') };

async function header(browser, servers, engine, width, withClose) {
  const tag = `${engine}@${width}`;
  const { context, page } = await openApp(browser, servers.appUrl, '/', { width, height: 900, coarse: false });
  try {
    page.setDefaultTimeout(10000);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await measure(page, tag, 'header Import', page.locator('.shell__tools button.shell__place', { hasText: 'Import' }));
    await measure(page, tag, 'header Export', page.locator('.shell__tools button.shell__place', { hasText: 'Export' }));
    await measure(page, tag, 'header Search', page.locator('.shell__tools a.shell__place'));
    if (withClose) {
      try {
        await page.setInputFiles('.shell__file-input', BAD_FILE);
        await page.waitForSelector('.shell__import-errors');
        await page.waitForTimeout(300);
      } catch (error) {
        console.log(`  ${tag} error panel did not appear (${String(error.message).split('\n')[0]})`);
      }
      await measure(page, tag, 'error panel Close', page.locator('.shell__import-errors button.shell__place'));
    }
  } finally {
    await context.close();
  }
}

async function more(browser, servers, engine) {
  const tag = `${engine}@393`;
  const { context, page } = await openApp(browser, servers.appUrl, '/', { width: 393, height: 852, coarse: false });
  try {
    page.setDefaultTimeout(10000);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await measure(page, tag, 'More summary', page.locator('.shell__more > summary'));
    try {
      await page.locator('.shell__more > summary').click();
      await page.waitForSelector('.shell__more[open]');
      await page.waitForTimeout(300);
    } catch (error) {
      console.log(`  ${tag} More did not open (${String(error.message).split('\n')[0]})`);
    }
    await measure(page, tag, 'More Import', page.locator('.shell__more li button.shell__place', { hasText: 'Import' }));
    await measure(page, tag, 'More Export', page.locator('.shell__more li button.shell__place', { hasText: 'Export' }));
    await measure(page, tag, 'More Search', page.locator('.shell__more li a.shell__place', { hasText: 'Search' }));
  } finally {
    await context.close();
  }
}

const servers = await startServers();
try {
  for (const [engine, launcher] of [
    ['webkit', () => webkit.launch()],
    ['chrome', () => launch()],
  ]) {
    const browser = await launcher();
    try {
      await header(browser, servers, engine, 1600, true);
      await header(browser, servers, engine, 1366, false);
      await header(browser, servers, engine, 744, false);
      await more(browser, servers, engine);
    } finally {
      await browser.close();
    }
  }
} finally {
  await servers.close();
}
finish(failures, count, '261005-w3j-probe');
