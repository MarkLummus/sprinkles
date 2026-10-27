// 11-05: the print route of created recipes, in Playwright WebKit under print media (MAKE-12,
// D-13, D-27). Four seeded created recipes (built in node with createRecipe and
// rowFromLibraryRecord over app/src/data/library.js) are written to the built app's store and
// their print routes read:
//   no-notes-no-steps  rows only, every portion at UNPLACED_STEP
//   steps-no-targets   two steps with no targets, purpose or aside; one row unplaced beside them
//   steps-none-used    two live steps that use no row, every row at UNPLACED_STEP (D-09)
//   full               two notes, two steps, a target, a purpose and an aside
// Per recipe it prints "PASS <recipe> <check>" or "FAIL <recipe> <check>: <values>":
//   foot      the last sheet page's closing foot ends with the version's stored Sheet code
//   headings  no h2.region-name is followed by nothing or by a zero-height sibling
//   gaps      on each sheet page the gap between consecutive blocks of `.ps-page`, less the lower
//             block's own top margin, is no larger than the largest such gap on the 'full' recipe's
//             first sheet page, plus 1 px (no blank band)
//   bottom    no block reaches past its sheet page's bottom, plus 1 px
//   and the presence or absence of the sections the recipe is about.
// It reads the laid sheet only: it waits for `.print-route[data-print-ready="true"]`, scopes every
// query to `.print-route__pages .print-page--sheet`, and refuses any match under the hidden
// `.ps-measure` copy. Chromium is not installed, so no PDF is made here: the iPad PDF is the print
// evidence (D-20, plan 11-13).
//
// Usage (from the repo root), after building to a scratch directory:
//   S="${TMPDIR:-/tmp}/sprinkles-11"
//   npm --prefix app run build -- --outDir "$S/dist-05" --emptyOutDir
//   PROBE_DIST="$S/dist-05" node .planning/phases/11-steps-structure-save-and-print/11-print-check.mjs
//
// The build is read from PROBE_DIST (default app/dist) and never written; this script never
// builds. playwright-core is loaded only through PLAYWRIGHT_CORE (default: the npx cache path
// below); when that file is missing it prints a FAIL line and exits 1 first. The app is served on
// an ephemeral 127.0.0.1 port through 08-walk-server.mjs; every request to another host is
// aborted. Everything typed or stored is English.
import { startServers } from '../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { library } from '../../../app/src/data/library.js';
import { createRecipe } from '../../../app/src/domain/newRecipe.js';
import { rowFromLibraryRecord } from '../../../app/src/domain/versionRow.js';
import { UNPLACED_STEP } from '../../../app/src/domain/creationSteps.js';
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

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..');
const DIST = path.resolve(process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist'));

const NOW = '2026-10-26T12:00:00.000Z';
const TOLERANCE = 1;
const UNPLACED_HEAD = 'Not in a step yet';
const SHEET_PAGES = '.print-route__pages .print-page--sheet';

// ---------------------------------------------------------------------------
// The four created recipes.
// ---------------------------------------------------------------------------
const rowsAt = (placements) => [
  rowFromLibraryRecord({ id: 'wholeMilk', entry: library.wholeMilk }, { id: 'row-a', grams: 500, step: placements[0] }),
  rowFromLibraryRecord({ id: 'heavyCream', entry: library.heavyCream }, { id: 'row-b', grams: 250, step: placements[1] }),
  rowFromLibraryRecord({ id: 'sucrose', entry: library.sucrose }, { id: 'row-c', grams: 100, step: placements[2] }),
];

const step = (n, overrides = {}) => ({
  n,
  leadIn: `Lead ${n}`,
  instruction: `Do thing ${n} with care.`,
  uses: [],
  targets: [],
  purpose: '',
  aside: '',
  removed: false,
  ...overrides,
});

function created(id, { placements, method = [], authored }) {
  return createRecipe(
    { name: `Print ${id}`, versionLabel: 'first try', rows: rowsAt(placements), method, ...(authored ? { authored } : {}) },
    { recipeId: `print-${id}`, versionId: `print-${id}-v1`, now: NOW },
  );
}

const CASES = [
  {
    id: 'no-notes-no-steps',
    ...created('no-notes-no-steps', { placements: [UNPLACED_STEP, UNPLACED_STEP, UNPLACED_STEP] }),
    expect: {
      absent: ['.ps-before', '.mp-step', 'tr.ps-step-head'],
    },
  },
  {
    id: 'steps-no-targets',
    ...created('steps-no-targets', {
      placements: [1, 2, UNPLACED_STEP],
      method: [step(1, { uses: ['row-a'] }), step(2, { uses: ['row-b'] })],
    }),
    expect: {
      absent: ['.mp-tags'],
      heads: [UNPLACED_HEAD],
    },
  },
  {
    id: 'steps-none-used',
    ...created('steps-none-used', {
      placements: [UNPLACED_STEP, UNPLACED_STEP, UNPLACED_STEP],
      method: [step(1), step(2)],
    }),
    expect: {
      headCount: 1,
      heads: [UNPLACED_HEAD],
      counts: { '.mp-step': 2 },
    },
  },
  {
    id: 'full',
    ...created('full', {
      placements: [1, 2, UNPLACED_STEP],
      method: [
        step(1, { uses: ['row-a'], targets: [{ label: 'temp', value: '4 °C' }], purpose: 'It keeps the base cold.' }),
        step(2, { uses: ['row-b'], aside: 'Stir gently.' }),
      ],
      authored: { beforeYouStart: [{ text: 'Chill the bowl first.' }, { text: 'Weigh everything out.' }] },
    }),
    expect: {
      present: ['.ps-before', '.mp-tags', '.mp-why', '.mp-aside'],
    },
  },
];

// ---------------------------------------------------------------------------
// The in-page reader. Every query is scoped to the laid sheet pages, and every
// matched element is refused if it sits under the hidden measuring copy.
// ---------------------------------------------------------------------------
const READ = ({ wanted, pagesSelector }) => {
  const pages = [...document.querySelectorAll(pagesSelector)];
  const out = { pageCount: pages.length, underMeasure: 0, footTexts: [], headings: [], gaps: [], overshoot: [], heads: [], counts: {} };
  const seen = (el) => {
    if (el.closest('.ps-measure')) out.underMeasure += 1;
    return el;
  };
  for (const selector of wanted) {
    out.counts[selector] = pages.reduce((sum, page) => sum + [...page.querySelectorAll(selector)].map(seen).length, 0);
  }
  pages.forEach((page, index) => {
    const pageBox = page.getBoundingClientRect();
    for (const foot of page.querySelectorAll('.mp-foot')) out.footTexts.push({ page: index, text: seen(foot).textContent });
    for (const heading of page.querySelectorAll('h2.region-name')) {
      seen(heading);
      const next = heading.nextElementSibling;
      out.headings.push({ page: index, text: heading.textContent, height: next ? next.getBoundingClientRect().height : -1 });
    }
    for (const head of page.querySelectorAll('tr.ps-step-head')) out.heads.push(seen(head).textContent.trim());
    const sheet = page.querySelector('.ps-page');
    const blocks = sheet ? [...sheet.children].map(seen) : [];
    const rects = blocks.map((block) => block.getBoundingClientRect());
    rects.forEach((rect, i) => {
      if (i > 0) {
        // The space between two blocks, less the lower block's own top margin (the closing foot
        // stands off its rule by a designed margin when it follows the Balance and not a step),
        // scaled the way the page picture is scaled.
        const scale = blocks[i].offsetHeight > 0 ? rect.height / blocks[i].offsetHeight : 1;
        const own = (Number.parseFloat(getComputedStyle(blocks[i]).marginTop) || 0) * scale;
        out.gaps.push({ page: index, gap: rect.top - rects[i - 1].bottom - own, between: `${blocks[i - 1].className} / ${blocks[i].className}` });
      }
      if (rect.bottom > pageBox.bottom) out.overshoot.push({ page: index, by: rect.bottom - pageBox.bottom, block: blocks[i].className });
    });
  });
  return out;
};

let passes = 0;
let failures = 0;
function check(recipe, name, ok, detail = '') {
  if (ok) {
    passes += 1;
    console.log(`PASS ${recipe} ${name}`);
  } else {
    failures += 1;
    console.log(`FAIL ${recipe} ${name}: ${detail}`);
  }
}

async function writeRecords(page, { recipe, version }) {
  await page.evaluate(
    async (records) => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('sprinkles');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      try {
        await new Promise((resolve, reject) => {
          const tx = db.transaction(['recipes', 'versions'], 'readwrite');
          tx.objectStore('recipes').put(records.recipe);
          tx.objectStore('versions').put(records.version);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error);
        });
      } finally {
        db.close();
      }
    },
    { recipe, version },
  );
}

const servers = await startServers({ appRoot: DIST });
const browser = await webkit.launch();
const measured = new Map();

try {
  const context = await browser.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: true });
  // Nothing leaves the machine: abort every request to another host.
  await context.route('**/*', (request) =>
    new URL(request.request().url()).hostname === '127.0.0.1' ? request.continue() : request.abort(),
  );

  for (const spec of CASES) {
    const page = await context.newPage();
    try {
      await page.goto(`${servers.appUrl}/`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.shell');
      await writeRecords(page, spec);
      await page.goto(`${servers.appUrl}/notebook/${spec.recipe.id}/${spec.version.id}/print`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.print-route[data-print-ready="true"]', { timeout: 15000 });
      await page.evaluate(() => document.fonts.ready);
      await page.emulateMedia({ media: 'print' });
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));

      const wanted = [...(spec.expect.absent ?? []), ...(spec.expect.present ?? []), ...Object.keys(spec.expect.counts ?? {})];
      const read = await page.evaluate(READ, { wanted, pagesSelector: SHEET_PAGES });
      measured.set(spec.id, read);

      const name = spec.id;
      check(name, 'pages', read.pageCount > 0 && read.underMeasure === 0, `${read.pageCount} sheet pages, ${read.underMeasure} matches under .ps-measure`);
      const lastFoot = read.footTexts[read.footTexts.length - 1];
      check(
        name,
        'foot',
        read.footTexts.length === 1 && lastFoot.page === read.pageCount - 1 && lastFoot.text.endsWith(spec.version.sheetCode),
        `feet ${JSON.stringify(read.footTexts)}, page count ${read.pageCount}, code ${spec.version.sheetCode}`,
      );
      const empty = read.headings.filter((heading) => !(heading.height > 0));
      check(name, 'headings', read.headings.length > 0 && empty.length === 0, `empty after: ${JSON.stringify(empty)}; ${read.headings.length} headings`);
      check(name, 'bottom', read.overshoot.every((over) => over.by <= TOLERANCE), JSON.stringify(read.overshoot));

      for (const selector of spec.expect.absent ?? []) {
        check(name, `no ${selector}`, read.counts[selector] === 0, `${read.counts[selector]} found`);
      }
      for (const selector of spec.expect.present ?? []) {
        check(name, `has ${selector}`, read.counts[selector] > 0, `${read.counts[selector]} found`);
      }
      for (const [selector, count] of Object.entries(spec.expect.counts ?? {})) {
        check(name, `${count} of ${selector}`, read.counts[selector] === count, `${read.counts[selector]} found`);
      }
      if (spec.expect.heads) {
        check(name, 'step heads', JSON.stringify(read.heads.filter((head) => head === UNPLACED_HEAD)) === JSON.stringify(spec.expect.heads), `heads ${JSON.stringify(read.heads)}`);
      }
      if (spec.expect.headCount !== undefined) {
        check(name, 'one step head', read.heads.length === spec.expect.headCount, `heads ${JSON.stringify(read.heads)}`);
      }
    } catch (error) {
      check(spec.id, 'route', false, String(error.message).split('\n')[0]);
    } finally {
      await page.close();
    }
  }

  // The gap check needs the 'full' recipe's largest gap on its first sheet page.
  const full = measured.get('full');
  const fullGaps = full ? full.gaps.filter((gap) => gap.page === 0).map((gap) => gap.gap) : [];
  if (fullGaps.length === 0) {
    check('full', 'gaps', false, 'no gaps measured on the first sheet page: nothing to bound the others by');
  } else {
    const limit = Math.max(...fullGaps) + TOLERANCE;
    console.log(`INFO gap limit ${limit.toFixed(1)} px (largest on the full recipe's first sheet page ${Math.max(...fullGaps).toFixed(1)} px plus ${TOLERANCE})`);
    for (const spec of CASES) {
      const read = measured.get(spec.id);
      if (!read) continue;
      const wide = read.gaps.filter((gap) => gap.gap > limit);
      console.log(`INFO ${spec.id} gaps ${JSON.stringify(read.gaps.map((gap) => Math.round(gap.gap * 10) / 10))}`);
      check(spec.id, 'gaps', wide.length === 0, `limit ${limit.toFixed(1)} px; wider: ${JSON.stringify(wide)}`);
    }
  }
  await context.close();
} finally {
  await browser.close();
  await servers.close();
}

console.log(`${passes} PASS, ${failures} FAIL`);
process.exit(failures > 0 ? 1 : 0);
