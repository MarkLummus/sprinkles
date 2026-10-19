// 09-03: the WebKit measurement of the built Notebook and Ingredients places
// against sketch 012's recorded numbers (.planning/sketches/012-places/README.md,
// "Measured"), with a 1 px tolerance.
//
// Usage (from the repo root), after building to a scratch directory:
//   S="${TMPDIR:-/tmp}/sprinkles-09"
//   npm --prefix app run build -- --outDir "$S/dist-places" --emptyOutDir
//   PROBE_DIST="$S/dist-places" node .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-places-check.mjs
//
// It drives the BUILT app in Playwright WebKit with a coarse pointer (hasTouch),
// a fresh context per width so IndexedDB starts from the reseed. It prints PASS
// or FAIL per check and exits 1 on any FAIL. Measure, then edit: when a number
// is off, read the real DOM rects before changing a rule.
//
// Two numbers differ from the README's "Measured" prose and follow the boards,
// which are the authority and which the built page matches row for row (26 rows
// at both widths, compared against ingredients-place.html in WebKit): at 393 a
// closed row runs 88 to 126, not 88 to 105 (the two longest names wrap: "Coconut,
// Shredded (unsweetened)" is 126, "Graza Drizzle extra virgin olive oil" 109), and
// a row head is "44 tall" as a floor, not a size (a two-line summary makes it 46
// at 1366, and a head at 393 stacks category, name and summary, 69 to 107).
//
// The build is read from PROBE_DIST (default app/dist); pass a scratch --outDir
// build so Mark's own `vite preview --host`, which serves app/dist, is never
// disturbed. playwright-core is loaded only through PLAYWRIGHT_CORE (default:
// the npx cache path below); when that file is missing the script prints a FAIL
// line and exits 1 before it does anything else. The app is served on an
// ephemeral 127.0.0.1 port through 08-walk-server.mjs, and every request to
// another host is aborted. Everything typed into the app is English.
import { startServers } from '../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLAYWRIGHT_CORE =
  process.env.PLAYWRIGHT_CORE ?? '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
if (!existsSync(PLAYWRIGHT_CORE)) {
  console.log(
    `FAIL playwright-core not found at ${PLAYWRIGHT_CORE}: refill the npx cache with \`npx -y playwright-core@1.63.0 --version\` or set PLAYWRIGHT_CORE to its index.mjs`,
  );
  process.exit(1);
}
const { webkit } = await import(PLAYWRIGHT_CORE);

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DIST = path.resolve(process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist'));

const TOLERANCE = 1;
let failures = 0;
let passes = 0;

function report(ok, label, detail) {
  if (ok) passes += 1;
  else failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ` (${detail})` : ''}`);
}
const near = (actual, expected, tolerance = TOLERANCE) => Math.abs(actual - expected) <= tolerance;
const within = (actual, low, high, tolerance = TOLERANCE) => actual >= low - tolerance && actual <= high + tolerance;
const fmt = (value) => (typeof value === 'number' ? Number(value.toFixed(1)) : value);

const servers = await startServers({ appRoot: DIST });
const browser = await webkit.launch();

async function open(width, route) {
  const context = await browser.newContext({
    viewport: { width, height: width <= 760 ? 852 : 1024 },
    hasTouch: true,
  });
  // Nothing leaves the machine: abort every request to another host.
  await context.route('**/*', (request) =>
    new URL(request.request().url()).hostname === '127.0.0.1' ? request.continue() : request.abort(),
  );
  const page = await context.newPage();
  await page.goto(servers.appUrl + route, { waitUntil: 'networkidle' });
  await page.waitForSelector('.place__title');
  await page.evaluate(() => document.fonts.ready);
  return { context, page };
}

// Each box's { w, h } for a selector, read from the live DOM.
const sizes = (page, selector) =>
  page.evaluate((sel) => [...document.querySelectorAll(sel)].map((node) => {
    const rect = node.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  }), selector);

async function checkNotebook(width) {
  const tag = `Notebook ${width}`;
  const { context, page } = await open(width, '/notebook');
  await page.waitForSelector('.nb__row');
  const rows = await sizes(page, '.nb__row');
  report(rows.length === 8, `${tag}: eight recipe rows`, `${rows.length}`);
  const [low, high] = width === 1366 ? [97, 136] : [108, 159];
  const heights = rows.map((row) => row.h);
  report(
    heights.every((h) => within(h, low, high)),
    `${tag}: row heights inside ${low} to ${high}`,
    `${fmt(Math.min(...heights))} to ${fmt(Math.max(...heights))}`,
  );
  const links = await sizes(page, '.nb__name a');
  report(
    links.length > 0 && links.every((link) => near(link.h, 44)),
    `${tag}: name links 44 tall`,
    `${links.map((link) => fmt(link.h)).join(', ')}`,
  );
  await context.close();
}

async function checkIngredients(width) {
  const tag = `Ingredients ${width}`;
  const { context, page } = await open(width, '/ingredients');
  await page.waitForSelector('.ing__row');
  const rows = await sizes(page, '.ing__row');
  report(rows.length === 26, `${tag}: 26 library rows`, `${rows.length}`);
  const rowHeights = rows.map((row) => row.h);
  if (width === 1366) {
    report(
      rowHeights.every((h) => near(h, 69)),
      `${tag}: closed rows 69 tall`,
      `${fmt(Math.min(...rowHeights))} to ${fmt(Math.max(...rowHeights))}`,
    );
  } else {
    report(
      rowHeights.every((h) => within(h, 88, 126)),
      `${tag}: closed rows inside 88 to 126`,
      `${fmt(Math.min(...rowHeights))} to ${fmt(Math.max(...rowHeights))}`,
    );
  }
  const heads = await sizes(page, '.ing__head');
  report(
    heads.length === 26 && heads.every((head) => head.h >= 44 - TOLERANCE),
    `${tag}: every row head holds the 44 floor`,
    `${fmt(Math.min(...heads.map((head) => head.h)))} to ${fmt(Math.max(...heads.map((head) => head.h)))}`,
  );
  const [name] = await sizes(page, 'input.ink-field');
  const [category] = await sizes(page, 'select');
  report(near(name.h, 44), `${tag}: Name field 44 tall`, `${fmt(name.h)}`);
  report(near(category.h, 44), `${tag}: Category select 44 tall`, `${fmt(category.h)}`);
  if (width === 1366) {
    report(near(name.w, 598.9), `${tag}: Name 598.9 wide`, `${fmt(name.w)}`);
    report(near(category.w, 120), `${tag}: Category 120 wide`, `${fmt(category.w)}`);
  }

  // Tab from Name reaches the Category select (D-15).
  await page.focus('input.ink-field');
  await page.keyboard.press('Tab');
  const tabbedTo = await page.evaluate(() => document.activeElement?.tagName);
  report(tabbedTo === 'SELECT', `${tag}: Tab from Name reaches the Category select`, `${tabbedTo}`);

  // Typing milk narrows to five and shows Clear filters, 78.6 by 44.
  await page.fill('input.ink-field', 'milk');
  const countText = await page.textContent('p.ing__count');
  report(countText === '5 of 26 ingredients', `${tag}: milk gives the filtered count`, `${countText}`);
  const [clear] = await sizes(page, '.ing__clear');
  report(
    clear !== undefined && near(clear.w, 78.6) && near(clear.h, 44),
    `${tag}: Clear filters 78.6 by 44`,
    clear ? `${fmt(clear.w)} by ${fmt(clear.h)}` : 'missing',
  );

  // Enter in Name submits nothing: the route, the field and the count stay.
  await page.focus('input.ink-field');
  await page.keyboard.press('Enter');
  const after = await page.evaluate(() => ({
    path: location.pathname,
    value: document.querySelector('input.ink-field')?.value,
    count: document.querySelector('p.ing__count')?.textContent,
  }));
  report(
    after.path === '/ingredients' && after.value === 'milk' && after.count === '5 of 26 ingredients',
    `${tag}: Enter in Name keeps the route, the field and the count`,
    `${after.path} ${JSON.stringify(after.value)} ${after.count}`,
  );
  await context.close();
}

async function checkOverflow(route, widths) {
  for (const width of widths) {
    const { context, page } = await open(width, route);
    await page.waitForSelector(route === '/notebook' ? '.nb__row' : '.ing__row');
    const { scrollW, innerW } = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
    }));
    report(scrollW <= innerW, `${route} ${width}: no horizontal overflow`, `scrollWidth ${scrollW}, innerWidth ${innerW}`);
    await context.close();
  }
}

try {
  for (const width of [1366, 393]) {
    await checkNotebook(width);
    await checkIngredients(width);
  }
  const widths = [393, 724, 834, 1024, 1100, 1366, 1590];
  await checkOverflow('/notebook', widths);
  await checkOverflow('/ingredients', widths);
} finally {
  await browser.close();
  await servers.close();
}

console.log(`${passes} PASS, ${failures} FAIL`);
process.exit(failures > 0 || passes === 0 ? 1 : 0);
