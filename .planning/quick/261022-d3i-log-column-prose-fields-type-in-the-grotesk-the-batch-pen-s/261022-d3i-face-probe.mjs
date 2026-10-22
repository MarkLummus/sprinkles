// Quick 261022-d3i probe: the batch pen's four prose fields type in the grotesk
// (sketch 013 decision 26). Proves, in Playwright WebKit at 1366x1100 under a
// coarse and then a fine pointer, that:
//   - At the machine, Ingredient notes, How did it turn out? and Next time read
//     the grotesk and pen blue (and the Field Rule's size under a coarse
//     pointer), and their ::placeholder reads the grotesk in italic;
//   - those placeholders match the Version name ink field's placeholder;
//   - the Sheet's prose fields and the ceremony's Why still read the text face;
//   - the saved words in the log column still read the hand.
//
// Run (build to scratch first, never to app/dist):
//   npm --prefix app run build -- --outDir "$TMPDIR/sprinkles-d3i/dist" --emptyOutDir
//   PROBE_DIST="$TMPDIR/sprinkles-d3i/dist" node <this file>
// It serves the build on an ephemeral 127.0.0.1 port and never contacts 4173
// or 8077. Everything typed or named is English.
import { startServers } from '../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { existsSync } from 'node:fs';
import path from 'node:path';

const PLAYWRIGHT_CORE =
  process.env.PLAYWRIGHT_CORE ?? '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
if (!existsSync(PLAYWRIGHT_CORE)) {
  console.log(
    `FAIL playwright-core not found at ${PLAYWRIGHT_CORE}: refill the npx cache with \`npx -y playwright-core@1.63.0 --version\` or set PLAYWRIGHT_CORE to its index.mjs`,
  );
  process.exit(1);
}
if (!process.env.PROBE_DIST || !existsSync(path.join(process.env.PROBE_DIST, 'index.html'))) {
  console.log('FAIL PROBE_DIST must name a directory holding index.html (a scratch build)');
  process.exit(1);
}
const { webkit } = await import(PLAYWRIGHT_CORE);
const DIST = path.resolve(process.env.PROBE_DIST);

const VERSION_ROUTE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const BATCH_ROUTE = `${VERSION_ROUTE}/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89`;
const PEN = '.batch-margin--pen';
const VERSION_PEN = 'form[aria-label="Next version"]';
const LOG_LABELS = ['At the machine', 'Ingredient notes', 'How did it turn out?', 'Next time'];

let pass = 0;
let fail = 0;
const gate = (ok, text) => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${text}`);
  if (ok) pass += 1;
  else fail += 1;
};
const info = (text) => console.log(`INFO ${text}`);

async function clickUntil(page, target, doneSelector, label) {
  for (let i = 0; i < 4; i += 1) {
    await target().click();
    try {
      await page.waitForSelector(doneSelector, { timeout: 1500 });
      return;
    } catch {
      // a first click after a navigation often misses; try again
    }
  }
  throw new Error(`${label}: ${doneSelector} never appeared`);
}

// Reference values resolved in the page, so the probe carries no font stack or colour.
async function references(page) {
  return page.evaluate(() => {
    const read = (css) => {
      const el = document.createElement('div');
      el.style.cssText = css;
      document.body.appendChild(el);
      const s = getComputedStyle(el);
      const out = { family: s.fontFamily, color: s.color, size: s.fontSize };
      el.remove();
      return out;
    };
    return {
      grotesk: read('font-family: var(--face-grotesk)').family,
      text: read('font-family: var(--face-text)').family,
      hand: read('font-family: var(--face-hand)').family,
      penBlue: read('color: var(--sheet-pen-blue)').color,
      note: read('font-size: var(--sheet-type-note)').size,
    };
  });
}

const fieldStyle = (page, selector) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const s = getComputedStyle(el);
    const p = getComputedStyle(el, '::placeholder');
    return {
      family: s.fontFamily,
      color: s.color,
      size: s.fontSize,
      ph: { family: p.fontFamily, style: p.fontStyle, size: p.fontSize, color: p.color },
    };
  }, selector);

async function run() {
  const servers = await startServers({ appRoot: DIST });
  const browser = await webkit.launch();
  try {
    for (const coarse of [true, false]) {
      const pointer = coarse ? 'coarse' : 'fine';
      const context = await browser.newContext({ viewport: { width: 1366, height: 1100 }, hasTouch: coarse });
      await context.route('**/*', (route) => {
        if (new URL(route.request().url()).hostname === '127.0.0.1') route.continue();
        else route.abort();
      });
      const page = await context.newPage();
      const go = async (route) => {
        await page.goto(`${servers.appUrl}${route}`, { waitUntil: 'networkidle' });
        await page.waitForSelector('.notebook');
      };

      // Scenario A: the log pen.
      await go(VERSION_ROUTE);
      const matches = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
      gate(matches === coarse, `${pointer} A (pointer: coarse) matches ${matches}, expected ${coarse}`);
      const ref = await references(page);
      info(`${pointer} reference grotesk="${ref.grotesk}" text="${ref.text}" hand="${ref.hand}" penBlue=${ref.penBlue} note=${ref.note}`);
      await clickUntil(page, () => page.locator('.batch-row__record').first(), PEN, 'open the record pen');
      await page.locator('.save-ceremony').first().getByRole('button', { name: 'Add tasting', exact: true }).first().click();
      await page.waitForSelector('.tasting-head');

      const placeholders = [];
      for (const label of LOG_LABELS) {
        const selector = `.notebook-log textarea.prose-field[aria-label="${label}"]`;
        const count = await page.locator(selector).count();
        gate(count === 1, `${pointer} A "${label}" found exactly once (${count})`);
        if (count !== 1) continue;
        const s = await fieldStyle(page, selector);
        gate(s.family === ref.grotesk, `${pointer} A "${label}" font-family is the grotesk`);
        gate(s.color === ref.penBlue, `${pointer} A "${label}" colour is pen blue`);
        if (coarse) gate(s.size === ref.note, `${pointer} A "${label}" size is the Field Rule ${ref.note} (${s.size})`);
        gate(s.ph.family === ref.grotesk, `${pointer} A "${label}" placeholder font-family is the grotesk`);
        gate(s.ph.style === 'italic', `${pointer} A "${label}" placeholder is italic`);
        info(`${pointer} A "${label}" family="${s.family}" color=${s.color} size=${s.size} placeholder=${JSON.stringify(s.ph)}`);
        placeholders.push({ label, ph: s.ph });
      }

      // Scenario B: the Sheet's prose fields, the Why, and the Version name placeholder.
      await go(VERSION_ROUTE);
      await clickUntil(page, () => page.getByRole('button', { name: 'Next version' }).first(), VERSION_PEN, 'open the Next version pen');
      await page.locator('button').filter({ hasText: /edit this step$/ }).first().click();
      await page.waitForSelector('textarea[aria-label="Step 1, instruction"]');
      const sheet = await page.evaluate(() =>
        [...document.querySelectorAll('.prose-field')]
          .filter((el) => !el.closest('.notebook-log'))
          .map((el) => ({ label: el.getAttribute('aria-label'), family: getComputedStyle(el).fontFamily })),
      );
      const labels = sheet.map((f) => f.label);
      for (const want of ['Sheet title', 'Sheet description', 'beforeYouStart note 1', 'Step 1, lead-in', 'Step 1, instruction']) {
        gate(labels.includes(want), `${pointer} B Sheet field "${want}" is among the .prose-field outside the log column`);
      }
      for (const f of sheet) gate(f.family === ref.text, `${pointer} B Sheet field "${f.label}" font-family is the text face`);
      info(`${pointer} B Sheet fields: ${labels.join(' | ')}`);
      const why = await fieldStyle(page, 'textarea[aria-label="Why"]');
      gate(why.family === ref.text, `${pointer} B Why font-family is the text face`);
      const name = await fieldStyle(page, 'input[aria-label="Version name"]');
      info(`${pointer} B Version name placeholder=${JSON.stringify(name.ph)}`);
      for (const { label, ph } of placeholders) {
        for (const key of ['family', 'style', 'size', 'color']) {
          gate(ph[key] === name.ph[key], `${pointer} B "${label}" placeholder ${key} equals the Version name placeholder's (${ph[key]})`);
        }
      }

      // Scenario C: the saved words in the hand.
      await go(BATCH_ROUTE);
      const hands = await page.evaluate(() =>
        [...document.querySelectorAll('.notebook-log .app-hand')].map((el) => ({
          text: el.textContent.trim().slice(0, 40),
          family: getComputedStyle(el).fontFamily,
        })),
      );
      gate(hands.length > 0, `${pointer} C the log column shows saved words in .app-hand (${hands.length})`);
      for (const h of hands) gate(h.family === ref.hand, `${pointer} C "${h.text}" font-family is the hand`);

      await context.close();
    }
  } finally {
    await browser.close();
    await servers.close();
  }
}

try {
  await run();
} catch (err) {
  console.log(`FAIL probe error: ${err.message}`);
  fail += 1;
}
console.log(`${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
