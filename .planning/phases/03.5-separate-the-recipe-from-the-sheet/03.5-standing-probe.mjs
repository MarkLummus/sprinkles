// 03.5-26 (G-03.5-R2-5): Home's standing word per seeded recipe, read on the
// built app. A later-recorded undated batch outranks an older dated one, so
// Mexican Chocolate (v1 churned 2025-12-13 and tasted; v3 undated, untasted,
// recorded 2026-01-13) reads "Awaiting tasting", and all three Home standings
// stay reachable at runtime (D-05). Imports the plan-10 harness unchanged.
//
// Usage: node 03.5-standing-probe.mjs <widths>
//   widths: comma list, e.g. 393,1366
// Built app (app/dist), a fresh store per context, route /, fine pointer.
import { startServers, launch, openApp, check, finish } from './03.5-probe-harness.mjs';

const [, , widthsArg] = process.argv;

if (!widthsArg) {
  console.error('Usage: node 03.5-standing-probe.mjs <widths>');
  process.exit(1);
}

const widths = widthsArg.split(',').map(Number);

const EXPECTED = {
  'Mexican Chocolate': 'Awaiting tasting',
  Coconut: 'Awaiting tasting',
  Mocha: 'Awaiting tasting',
  Strawberry: 'Tasted',
  'Standard Base': 'Not yet churned',
  'Underbelly Light Base': 'Not yet churned',
};

const SEEDED_RECIPE_COUNT = 8;

function readStandings() {
  return [...document.querySelectorAll('.home__row')].map((row) => ({
    name: row.querySelector('.home__name a')?.textContent.trim() ?? null,
    standing: row.querySelector('.home__standing')?.textContent.trim() ?? null,
  }));
}

async function readHome(browser, appUrl, width) {
  const { context, page } = await openApp(browser, appUrl, '/', { width, coarse: false });
  await page.waitForFunction(
    (count) => document.querySelectorAll('.home__row').length === count,
    SEEDED_RECIPE_COUNT,
    { timeout: 10000 },
  );
  const rows = await page.evaluate(readStandings);
  await context.close();
  return rows;
}

async function main() {
  const failures = [];
  let checkCount = 0;
  const countedCheck = (condition, label) => {
    checkCount += 1;
    check(failures, condition, label);
  };

  const { appUrl, close } = await startServers();
  const browser = await launch();

  try {
    for (const width of widths) {
      const label = `standing width=${width}`;
      const rows = await readHome(browser, appUrl, width);
      console.log(JSON.stringify({ group: 'standing', width, rows }));
      countedCheck(rows.length === SEEDED_RECIPE_COUNT, `${label}: ${SEEDED_RECIPE_COUNT} recipe rows (got ${rows.length})`);
      for (const [name, word] of Object.entries(EXPECTED)) {
        const row = rows.find((r) => r.name === name);
        countedCheck(row?.standing === word, `${label}: ${name} reads "${word}" (got ${row ? `"${row.standing}"` : 'no row'})`);
      }
      for (const word of ['Awaiting tasting', 'Tasted', 'Not yet churned']) {
        countedCheck(rows.some((r) => r.standing === word), `${label}: "${word}" is reachable among the rows`);
      }
    }
  } finally {
    await browser.close();
    await close();
  }

  finish(failures, checkCount, 'standing probe');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
