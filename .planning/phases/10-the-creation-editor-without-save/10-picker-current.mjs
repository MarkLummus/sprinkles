// 10-12: the ingredient picker with the library the build seeds (the merged dataset, 100+ entries,
// not the board's 26), in Playwright WebKit with a coarse pointer at 1366 and at 393 (ROADMAP
// Phase 10 Notes: measured at 393 and 1366 with the larger library). 10-board-picker.mjs holds the
// picker to sketch 013 with the original 26; this holds it to the stored library.
//
//   S="${TMPDIR:-/tmp}/sprinkles-10"
//   (build once into "$S/dist-12" with `npm --prefix app run build` and --outDir, as 10-board-picker.mjs says)
//   PROBE_DIST="$S/dist-12" node .planning/phases/10-the-creation-editor-without-save/10-picker-current.mjs
//
// This script reads PROBE_DIST (default app/dist) and never writes it, and starts no Vite server:
// it serves the build on an ephemeral 127.0.0.1 port. Every request to another host is aborted.
// playwright-core is loaded only through PLAYWRIGHT_CORE (default: the npx cache path below); when
// that file is missing it prints a FAIL line and exits 1 first.
//
// The seeded library is kept (no original-mode rewrite). Each check arrives afresh the way the board
// engine does: '/', `.shell`, a create draft put in the drafts store holding one row on Whole milk,
// 3.5% fat, then /notebook/new and `.notebook.mk-page`. Every expectation is read from the store in
// the page (the library's records through indexedDB), never written as a literal list or count.
// Seven checks at each width print one PASS or FAIL line each; exit 1 on any FAIL. Everything typed
// into the app is English.
import { startServers } from '../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { library as ORIGINAL_LIBRARY } from '../../../app/src/data/library.js';
import { blankCreateDraft, buildDraftRecord } from '../../../app/src/domain/draft.js';
import { ingredientCountWords } from '../../../app/src/ui/countWords.js';
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

const FIXED_ISO = '2026-10-20T12:00:00.000Z';
const TOLERANCE = 1;
const MILK_ID = 'wholeMilk';
const ORIGINAL_IDS = new Set(Object.keys(ORIGINAL_LIBRARY));

let passes = 0;
let failures = 0;
const report = (ok, label, detail) => {
  if (ok) passes += 1;
  else failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ` (${detail})` : ''}`);
};

const servers = await startServers({ appRoot: DIST });
const browser = await webkit.launch();

const OPEN_DB = `new Promise((resolve, reject) => {
  const request = indexedDB.open('sprinkles');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
})`;

// The library as the store holds it, { id, entry } records.
const readLibrary = (page) =>
  page.evaluate(async (openDb) => {
    const db = await eval(openDb);
    try {
      return await new Promise((resolve, reject) => {
        const request = db.transaction('library', 'readonly').objectStore('library').getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  }, OPEN_DB);

async function arrive(width) {
  const context = await browser.newContext({
    viewport: { width, height: width <= 760 ? 852 : 1024 },
    hasTouch: true,
  });
  // Nothing leaves the machine: abort every request to another host.
  await context.route('**/*', (request) =>
    new URL(request.request().url()).hostname === '127.0.0.1' ? request.continue() : request.abort(),
  );
  const page = await context.newPage();
  await page.goto(`${servers.appUrl}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.shell');
  await page.evaluate(() => document.fonts.ready);

  const records = await readLibrary(page);
  const versionId = 'vanilla-v1';
  const payload = {
    ...blankCreateDraft({ recipeId: 'vanilla', versionId, name: 'Vanilla' }),
    rows: [{ id: 'row-milk', libraryId: MILK_ID, portions: [{ step: 1, grams: '600' }] }],
  };
  const record = buildDraftRecord({ versionId, kind: 'create', payload, now: FIXED_ISO });
  await page.evaluate(
    async ({ row, openDb }) => {
      const db = await eval(openDb);
      try {
        await new Promise((resolve, reject) => {
          const tx = db.transaction('drafts', 'readwrite');
          tx.objectStore('drafts').put(row);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error);
        });
      } finally {
        db.close();
      }
    },
    { row: record, openDb: OPEN_DB },
  );
  await page.goto(`${servers.appUrl}/notebook/new`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.notebook.mk-page');
  await page.evaluate(() => document.fonts.ready);
  return { context, page, records };
}

const openPicker = async (page) => {
  await page.click('.ingredient-table-region .mk-add');
  await page.waitForSelector('.pick');
};
const typeName = (page, value) => page.fill('.pick .ing__filters input.ink-field', value);

// The table's rows as { name, grams, focused }, in order.
const tableRows = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('.ingredient-table tbody tr')].map((tr) => {
      const input = tr.querySelector('input.ink-field');
      return {
        name: tr.querySelector('.ingredient-table__col-name')?.firstChild?.textContent ?? '',
        grams: input ? input.value : null,
        focused: input ? input === document.activeElement : false,
      };
    }),
  );

// The picker's row for an entry name, as { added, ariaDisabled, act, sum, inside, fits }.
const pickRow = (page, name) =>
  page.evaluate((wanted) => {
    const row = [...document.querySelectorAll('.pick__row')].find((node) => node.querySelector('.pick__name').textContent === wanted);
    if (!row) return null;
    const pick = document.querySelector('.pick').getBoundingClientRect();
    const box = row.getBoundingClientRect();
    return {
      added: row.classList.contains('pick__row--added'),
      ariaDisabled: row.getAttribute('aria-disabled'),
      act: row.querySelector('.pick__act').textContent,
      sum: row.querySelector('.pick__sum')?.textContent ?? null,
      inside: box.left >= pick.left - 1 && box.right <= pick.right + 1 && box.top >= pick.top - 1 && box.bottom <= pick.bottom + 1,
      fits: row.scrollWidth <= row.clientWidth + 1,
    };
  }, name);

const rowHandle = (page, name) =>
  page.evaluateHandle((wanted) => [...document.querySelectorAll('.pick__row')].find((node) => node.querySelector('.pick__name').textContent === wanted), name);

const noSideways = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

const byId = (a, b) => (a.id < b.id ? -1 : 1);

async function check(width, name, run) {
  const label = `${width} ${name}`;
  const { context, page, records } = await arrive(width);
  try {
    const result = await run(page, records);
    report(result === true, label, result === true ? '' : result);
  } catch (err) {
    report(false, label, String(err.message ?? err).split('\n')[0]);
  } finally {
    await context.close();
  }
}

const widths = [1366, 393];
for (const width of widths) {
  // 1. The count names every stored entry.
  await check(width, 'the count names every stored entry', async (page, records) => {
    await openPicker(page);
    const text = await page.textContent('.pick .ing__count');
    const wanted = ingredientCountWords(records.length, records.length, false);
    if (records.length <= ORIGINAL_IDS.size) return `the store holds ${records.length}, not more than the original ${ORIGINAL_IDS.size}`;
    const rows = await page.evaluate(() => document.querySelectorAll('.pick__row').length);
    if (text !== wanted) return `count reads "${text}", wanted "${wanted}"`;
    if (rows !== records.length) return `${rows} rows, the store holds ${records.length}`;
    return true;
  });

  // 2. An entry the original 26 do not hold is found by name and added.
  await check(width, 'an entry outside the original 26 is found by name and added', async (page, records) => {
    const fresh = records.filter((record) => !ORIGINAL_IDS.has(record.id)).sort(byId)[0];
    if (!fresh) return 'the store holds no entry beyond the original 26';
    await openPicker(page);
    await typeName(page, fresh.entry.name);
    const handle = await rowHandle(page, fresh.entry.name);
    if (!(await handle.evaluate((node) => Boolean(node)))) return `no row named "${fresh.entry.name}"`;
    await handle.asElement().click();
    await page.waitForSelector('.ingredient-table .mk-focus');
    const rows = await tableRows(page);
    const last = rows[rows.length - 1];
    if (rows.length !== 2) return `${rows.length} rows after the add, wanted 2`;
    if (last.name !== fresh.entry.name) return `the last row is "${last.name}", wanted "${fresh.entry.name}"`;
    if (last.grams !== '') return `the new row's grams reads "${last.grams}", wanted empty`;
    if (!last.focused) return "the new row's grams field is not focused";
    if (await page.$('.pick')) return 'the picker is still open after the pick';
    return true;
  });

  // 3. The longest stored name and its summary fit.
  await check(width, 'the longest stored name and its summary fit without sideways scroll', async (page, records) => {
    const longest = [...records].sort(byId).reduce((best, record) => (record.entry.name.length > best.entry.name.length ? record : best));
    await openPicker(page);
    await typeName(page, longest.entry.name);
    const row = await pickRow(page, longest.entry.name);
    if (!row) return `no row named "${longest.entry.name}" (${longest.entry.name.length} characters)`;
    if (row.sum === null) return 'the row draws no summary';
    if (!row.inside) return `the row sits outside the picker's box (${longest.entry.name.length} characters)`;
    if (!row.fits) return 'the row scrolls sideways inside itself';
    if (!(await noSideways(page))) return 'the document scrolls sideways';
    return true;
  });

  // 4. Every stored category filters to its own entries.
  await check(width, 'every stored category filters to its own entries', async (page, records) => {
    const words = [...new Set(records.map((r) => r.entry.category).filter((c) => typeof c === 'string' && c.trim() !== ''))].sort();
    await openPicker(page);
    const options = await page.evaluate(() => [...document.querySelectorAll('.pick select option')].map((o) => o.value));
    if (JSON.stringify(options) !== JSON.stringify(['All', ...words])) return `the select lists ${JSON.stringify(options)}, the store holds ${JSON.stringify(words)}`;
    for (const word of words) {
      const wanted = records.filter((r) => r.entry.category === word).map((r) => r.entry.name).sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0));
      await page.selectOption('.pick select', word);
      const seen = await page.evaluate(() => ({
        count: document.querySelector('.pick .ing__count').textContent,
        names: [...document.querySelectorAll('.pick__name')].map((n) => n.textContent),
      }));
      const words2 = ingredientCountWords(wanted.length, records.length, true);
      if (seen.count !== words2) return `${word}: the count reads "${seen.count}", wanted "${words2}"`;
      if (seen.names.length !== wanted.length) return `${word}: ${seen.names.length} rows, the store holds ${wanted.length}`;
      if (JSON.stringify([...seen.names].sort()) !== JSON.stringify([...wanted].sort())) return `${word}: the rows are not the category's entries`;
    }
    return true;
  });

  // 5. The list scrolls inside its box and the page does not grow.
  await check(width, 'the list scrolls inside its box', async (page) => {
    await openPicker(page);
    const before = await page.evaluate(() => {
      const list = document.querySelector('.pick__list');
      return { scroll: list.scrollHeight, client: list.clientHeight, doc: document.documentElement.scrollHeight };
    });
    if (!(before.scroll > before.client)) return `scrollHeight ${before.scroll} is not above clientHeight ${before.client}`;
    const after = await page.evaluate(() => {
      const list = document.querySelector('.pick__list');
      list.scrollTop = 240;
      return { top: list.scrollTop, doc: document.documentElement.scrollHeight };
    });
    if (!(after.top > 0)) return `scrollTop stayed at ${after.top}`;
    if (Math.abs(after.doc - before.doc) > TOLERANCE) return `the document height moved from ${before.doc} to ${after.doc}`;
    return true;
  });

  // 6. An entry on the recipe reads Added and does nothing when pressed.
  await check(width, 'an entry on the recipe reads Added and adds nothing when pressed', async (page, records) => {
    const milk = records.find((record) => record.id === MILK_ID);
    if (!milk) return `the store holds no entry "${MILK_ID}"`;
    await openPicker(page);
    await typeName(page, milk.entry.name);
    const row = await pickRow(page, milk.entry.name);
    if (!row) return `no row named "${milk.entry.name}"`;
    if (!row.added || row.ariaDisabled !== 'true' || row.act !== 'Added') return `the row reads ${JSON.stringify(row)}`;
    const handle = await rowHandle(page, milk.entry.name);
    // Playwright treats aria-disabled as not enabled, so the press is forced.
    await handle.asElement().click({ force: true });
    const rows = await tableRows(page);
    if (rows.length !== 1) return `${rows.length} rows after pressing Added, wanted 1`;
    if (!(await page.$('.pick'))) return 'the picker closed on pressing Added';
    return true;
  });

  // 7. After its row is removed, it reads Add and can be added again.
  await check(width, 'after its row is removed the entry reads Add and is added again', async (page, records) => {
    const milk = records.find((record) => record.id === MILK_ID);
    if (!milk) return `the store holds no entry "${MILK_ID}"`;
    await openPicker(page);
    await page.click('.ingredient-table tbody tr .text-control');
    if ((await tableRows(page)).length !== 0) return 'remove left the row on the table';
    await typeName(page, milk.entry.name);
    const row = await pickRow(page, milk.entry.name);
    if (!row) return `no row named "${milk.entry.name}"`;
    if (row.added || row.act !== 'Add') return `after remove the row reads ${JSON.stringify(row)}`;
    const handle = await rowHandle(page, milk.entry.name);
    await handle.asElement().click();
    await page.waitForSelector('.ingredient-table .mk-focus');
    const rows = await tableRows(page);
    if (rows.length !== 1 || rows[0].name !== milk.entry.name) return `the table reads ${JSON.stringify(rows)} after the second add`;
    return true;
  });
}

await browser.close();
await servers.close();
console.log(`${passes} PASS, ${failures} FAIL`);
process.exit(failures > 0 || passes === 0 ? 1 : 0);
