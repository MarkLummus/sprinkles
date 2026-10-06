// Quick task 261005-x0j's probe: the five text companions on the current place's surface (D-01, Mark
// 2026-10-06, decide-companions-on-subtle-surface).
//
// Measures, in Playwright's WebKit and system Chrome on the BUILT app in app/dist:
//   - the computed colour of each companion's place word when that place is current, against the
//     computed background of the same element (--app-surface-subtle), in the rail at 1600 wide and in
//     the tab row (and More, for Ingredients) at 393 wide; the colour must equal that place's computed
//     --app-{x}-text-on-subtle token and the ratio must be 4.5 or more;
//   - a scope check at 1600 on '/': the places that are not current still read their plain companion;
//   - (D-02, decide-pen-save-weight) the computed font-weight of the pen's filled Save, which must be 600,
//     at 1600, 1366 and 393 wide; at 1366 only, INFO lines with the weights of Home's filled action, the
//     Notebook's filled action and the pen's outline Cancel.
// Run it from the checkout root after `npm --prefix app run build`:
//
//   node .planning/quick/261005-x0j-mark-s-answers-darken-the-text-companion/261005-x0j-probe.mjs
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

// WCAG 2 relative luminance and contrast from two computed rgb() strings.
function parseRgb(text) {
  const match = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(text || '');
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}
function luminance(rgb) {
  const [r, g, b] = rgb.map((value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratioOf(textA, textB) {
  const a = parseRgb(textA);
  const b = parseRgb(textB);
  if (!a || !b) return 0;
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

// slug, the route that makes the place current, the custom property of its plain companion.
const PLACES = [
  { slug: 'home', route: '/', plain: '--app-blue-text', onSubtle: '--app-blue-text-on-subtle' },
  { slug: 'notebook', route: APP_ROUTE, plain: '--app-notebook-text', onSubtle: '--app-notebook-text-on-subtle' },
  { slug: 'recipe-book', route: '/recipe-book', plain: '--app-recipe-book-text', onSubtle: '--app-recipe-book-text-on-subtle' },
  { slug: 'idea-log', route: '/idea-log', plain: '--app-idea-log-text', onSubtle: '--app-idea-log-text-on-subtle' },
  { slug: 'ingredients', route: '/ingredients', plain: '--app-ingredients-text', onSubtle: '--app-ingredients-text-on-subtle' },
];

// Reads colour and background of `selector`, plus the computed rgb of the named custom properties
// (a missing token reads as null, so the case fails rather than passing by accident).
async function readPlace(page, selector, tokens) {
  return page.evaluate(
    ({ sel, names }) => {
      const el = document.querySelector(sel);
      const root = getComputedStyle(document.documentElement);
      const toRgb = (name) => {
        const raw = root.getPropertyValue(name).trim();
        if (!raw) return null;
        const probe = document.createElement('span');
        probe.style.color = raw;
        document.body.appendChild(probe);
        const rgb = getComputedStyle(probe).color;
        probe.remove();
        return rgb;
      };
      const tokensOut = {};
      for (const name of names) tokensOut[name] = toRgb(name);
      if (!el) return { found: false, tokens: tokensOut };
      const c = getComputedStyle(el);
      return { found: true, color: c.color, background: c.backgroundColor, tokens: tokensOut };
    },
    { sel: selector, names: tokens },
  );
}

async function currentPlaceCase(browser, servers, engine, width, place) {
  const tag = `${engine}@${width} ${place.slug}`;
  const height = width === 393 ? 852 : 1100;
  const { context, page } = await openApp(browser, servers.appUrl, place.route, { width, height, coarse: false });
  try {
    page.setDefaultTimeout(10000);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    let selector;
    if (width === 393) {
      if (place.slug === 'ingredients') {
        await page.locator('.shell__more > summary').click();
        await page.waitForTimeout(200);
        selector = `.shell__more .shell__place--${place.slug}[aria-current="page"]`;
      } else {
        selector = `.shell__tabs > .shell__place--${place.slug}[aria-current="page"]`;
      }
    } else {
      selector = `.shell__rail .shell__place--${place.slug}[aria-current="page"]`;
    }
    const read = await readPlace(page, selector, ['--app-surface-subtle', place.onSubtle]);
    if (!read.found) {
      console.log(`  ${tag}: ${selector} not found`);
      ck(false, `${tag}: ${selector} not found`);
      return;
    }
    const measured = ratioOf(read.color, read.background);
    console.log(`  ${tag}: colour ${read.color} on ${read.background} = ${measured.toFixed(3)}:1`);
    const ok =
      measured >= 4.5 &&
      read.background === read.tokens['--app-surface-subtle'] &&
      read.tokens[place.onSubtle] !== null &&
      read.color === read.tokens[place.onSubtle];
    ck(
      ok,
      `${tag}: colour ${read.color} on ${read.background} = ${measured.toFixed(3)}:1 ` +
        `(token ${place.onSubtle} ${read.tokens[place.onSubtle]}; subtle ${read.tokens['--app-surface-subtle']})`,
    );
  } finally {
    await context.close();
  }
}

async function scopeCase(browser, servers, engine) {
  const tag = `${engine}@1600 scope`;
  const { context, page } = await openApp(browser, servers.appUrl, '/', { width: 1600, height: 1100, coarse: false });
  try {
    page.setDefaultTimeout(10000);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const lines = [];
    let ok = true;
    for (const place of PLACES.filter((entry) => entry.slug !== 'home')) {
      const read = await readPlace(page, `.shell__rail .shell__place--${place.slug}:not([aria-current="page"])`, [place.plain]);
      const plain = read.tokens[place.plain];
      const same = read.found && plain !== null && read.color === plain;
      if (!same) ok = false;
      lines.push(`${place.slug} ${read.found ? read.color : 'not found'} vs ${place.plain} ${plain}`);
    }
    console.log(`  ${tag}: ${lines.join('; ')}`);
    ck(ok, `${tag}: non-current places read their plain companion (${lines.join('; ')})`);
  } finally {
    await context.close();
  }
}

const PEN_NOTE = 'textarea[aria-label="How did it turn out?"]';
const SAVE = '.notebook-log .save-ceremony button:last-of-type';
const CANCEL = '.notebook-log .save-ceremony button:first-of-type';

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

// Opens the pen with Correct, then exposes the tasting note field (Add tasting as the fallback).
async function openPen(page) {
  await page.locator('button.batch-row__correct').first().click();
  await page.waitForSelector(PEN_NOTE, { state: 'attached', timeout: 5000 }).catch(() => {});
  if ((await page.locator(PEN_NOTE).count()) === 0) {
    await page.getByRole('button', { name: 'Add tasting' }).first().click();
    await page.waitForSelector(PEN_NOTE, { state: 'attached', timeout: 5000 });
  }
}

async function penCase(browser, servers, engine, width) {
  const tag = `${engine}@${width} pen Save`;
  const height = width === 393 ? 852 : 1100;
  const { context, page } = await openApp(browser, servers.appUrl, APP_ROUTE, { width, height, coarse: false });
  try {
    page.setDefaultTimeout(10000);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    let problem = '';
    try {
      await openPen(page);
    } catch (error) {
      problem = `; pen did not open: ${String(error.message).split('\n')[0]}`;
    }
    const weight = await weightOf(page, SAVE);
    console.log(`  ${tag}: font-weight ${weight}${problem}`);
    if (width === 1366) {
      console.log(`INFO weight ${engine} pen's outline Cancel: ${await weightOf(page, CANCEL)}`);
    }
    ck(weight === '600', `${tag}: font-weight ${weight}, expected 600${problem}`);
  } finally {
    await context.close();
  }
}

async function infoWeights(browser, servers, engine) {
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
}

const servers = await startServers();
try {
  for (const [engine, launcher] of [
    ['webkit', () => webkit.launch()],
    ['chrome', () => launch()],
  ]) {
    const browser = await launcher();
    try {
      for (const width of [1600, 393]) {
        for (const place of PLACES) {
          try {
            await currentPlaceCase(browser, servers, engine, width, place);
          } catch (error) {
            const message = String(error.message).split('\n')[0];
            console.log(`  ${engine}@${width} ${place.slug}: stopped: ${message}`);
            ck(false, `${engine}@${width} ${place.slug}: stopped: ${message}`);
          }
        }
      }
      try {
        await scopeCase(browser, servers, engine);
      } catch (error) {
        ck(false, `${engine}@1600 scope: stopped: ${String(error.message).split('\n')[0]}`);
      }
      for (const width of [1600, 1366, 393]) {
        try {
          await penCase(browser, servers, engine, width);
        } catch (error) {
          const message = String(error.message).split('\n')[0];
          console.log(`  ${engine}@${width} pen Save: stopped: ${message}`);
          ck(false, `${engine}@${width} pen Save: stopped: ${message}`);
        }
      }
      try {
        await infoWeights(browser, servers, engine);
      } catch (error) {
        console.log(`INFO weight ${engine}: stopped: ${String(error.message).split('\n')[0]}`);
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  await servers.close();
}
finish(failures, count, '261005-x0j-probe');
