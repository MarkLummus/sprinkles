// 03.5-17: decision 19's upright batch list. `many` (Task 1) records two
// more batches through the app (recordAnotherBatch, the probe harness's own
// UI-driven save) and measures the resulting three-batch upright list
// (UprightRail) against batches-many.html panel D. `single` (Task 2) adds
// the one-batch head-alignment check against 393-batch.html/723-batch.html
// (the batch-head todo).
//
// Usage: node 03.5-batches-probe.mjs <groups> <widths>
//   groups: comma list, e.g. many,single,keypad
//   widths: comma list, e.g. 393,723,1024,1366
//
// 03.5-25: `cells` (G-03.5-6) measures the log's churn-cell grid at each width
// against the board of the same width, opened at its drawn width by
// openBoard's defaults: the resolved track count and widths, and each cell's
// left from its grid's left. Usage:
//   node 03.5-batches-probe.mjs cells 393,723,983,984,1024,1366,1600
//
// 03.5-21: `keypad` (G-03.5-5b) reads each battery input's inputmode after
// Record another / Add tasting, then saves -6 and -12 in the two °C fields
// and reads both back. Usage: node 03.5-batches-probe.mjs keypad 393,1366
import {
  startServers,
  launch,
  openApp,
  openBoard,
  check,
  finish,
  APP_ROUTE,
  recordAnotherBatch,
  readAppUprightConnectors,
  readBoardUprightConnectors,
  uprightConnectorChecks,
  uprightBoardMatchChecks,
} from './03.5-probe-harness.mjs';

const [, , groupsArg, widthsArg] = process.argv;

if (!groupsArg || !widthsArg) {
  console.error('Usage: node 03.5-batches-probe.mjs <groups> <widths>');
  process.exit(1);
}

const groups = new Set(groupsArg.split(','));
const widths = widthsArg.split(',').map(Number);

// The precondition every group in this file shares: APP_ROUTE's recipe
// (olive oil) is seeded with one version and one batch, churned 2 Aug 2026,
// no fold-batches control yet. Read before building any state — if the
// seed (plan 09) has changed, fail with a message naming it rather than
// silently measuring the wrong fixture.
async function assertSeed(page) {
  const seed = await page.evaluate(() => ({
    hasFoldBatches: !!document.getElementById('fold-batches'),
    hasSeedDate: document.body.textContent.includes('churned 2 Aug 2026'),
  }));
  if (seed.hasFoldBatches || !seed.hasSeedDate) {
    throw new Error(
      `batches probe: expected APP_ROUTE to seed one version and one batch (churned 2 Aug 2026, no fold-batches) — has the seed (plan 09) changed? Got: ${JSON.stringify(seed)}`,
    );
  }
}

// The app's own upright-list geometry, read structurally by the classes
// UprightRail.jsx renders (app/src/ui/UprightRail.jsx, app/src/styles/
// notebook.css). The connector is a ::before pseudo-element on the first
// (non-last) row — getComputedStyle's second argument reads a pseudo-
// element's own computed style.
async function readAppUprightGeometry(page) {
  return page.evaluate(() => {
    const list = document.getElementById('fold-batches');
    if (!list) return null;
    const rows = [...list.querySelectorAll(':scope > li.notebook-upright__row')];
    const marks = [...list.querySelectorAll('.notebook-upright__mark')];
    const filledMarks = list.querySelectorAll('.notebook-upright__mark--filled');
    const ringedMarks = list.querySelectorAll('.notebook-upright__mark--in-view');
    const links = [...list.querySelectorAll('a.notebook-upright__link')];
    const currentEl = list.querySelector('[aria-current="page"]');
    const firstRow = rows[0];
    const firstRowRect = firstRow ? firstRow.getBoundingClientRect() : null;
    const firstTitle = firstRow ? firstRow.querySelector('.notebook-upright__title') : null;
    const firstMeta = firstRow ? firstRow.querySelector('.notebook-upright__meta') : null;
    const firstMark = marks[0] ? marks[0].getBoundingClientRect() : null;
    const connectorStyle = rows.length > 1 ? getComputedStyle(rows[0], '::before') : null;
    return {
      rowCount: rows.length,
      rowTitles: rows.map((row) => row.querySelector('.notebook-upright__title')?.textContent ?? null),
      rowHeight: firstRowRect ? firstRowRect.height : null,
      markWidth: firstMark ? firstMark.width : null,
      markHeight: firstMark ? firstMark.height : null,
      filledCount: filledMarks.length,
      hollowCount: marks.length - filledMarks.length,
      ringCount: ringedMarks.length,
      ringOnCurrent: currentEl ? currentEl.querySelector('.notebook-upright__mark--in-view') !== null : false,
      linkCount: links.length,
      linksTabindexOk: links.every((a) => a.getAttribute('tabindex') === '0'),
      titleFontSize: firstTitle ? getComputedStyle(firstTitle).fontSize : null,
      metaFontSize: firstMeta ? getComputedStyle(firstMeta).fontSize : null,
      connectorWidth: connectorStyle ? connectorStyle.width : null,
      listBottom: list.getBoundingClientRect().bottom,
    };
  });
}

// The board's own equivalent (batches-many.html panel D, counts.py's
// optD_/vrail_): no class names exist there (it is generated inline-styled
// HTML) — the mark is the aria-hidden span carrying border-radius: 6px
// (the 12px dot); the connector is the OTHER aria-hidden span (1px wide,
// no border-radius), present on every row but the last.
async function readBoardUprightGeometry(page) {
  return page.evaluate(() => {
    const list = document.getElementById('fold-batches');
    if (!list) return null;
    const rows = [...list.querySelectorAll(':scope > li')];
    const firstRow = rows[0];
    const ariaHiddenSpans = [...list.querySelectorAll('a[href="#"] span[aria-hidden="true"]')];
    const marks = ariaHiddenSpans.filter((el) => el.style.borderRadius === '6px');
    const connectors = ariaHiddenSpans.filter((el) => el.style.borderRadius !== '6px');
    const firstMarkRect = marks[0] ? marks[0].getBoundingClientRect() : null;
    const connectorStyle = connectors[0] ? getComputedStyle(connectors[0]) : null;
    const textSpans = firstRow ? firstRow.querySelectorAll('a > span:last-child > span') : [];
    return {
      rowCount: rows.length,
      rowHeight: firstRow ? firstRow.getBoundingClientRect().height : null,
      markWidth: firstMarkRect ? firstMarkRect.width : null,
      markHeight: firstMarkRect ? firstMarkRect.height : null,
      titleFontSize: textSpans[0] ? getComputedStyle(textSpans[0]).fontSize : null,
      metaFontSize: textSpans[1] ? getComputedStyle(textSpans[1]).fontSize : null,
      connectorWidth: connectorStyle ? connectorStyle.width : null,
    };
  });
}

// The batch head's own two groups (393-batch.html/723-batch.html; the
// batch-head todo): Batch + the churned date (the lead group), Correct +
// Record another (the acts group). Structural — the board carries no class
// names either.
async function readBatchHeadGeometry(page) {
  return page.evaluate(() => {
    const head = document.querySelector('.batch-row__head, section[aria-label="Batch"] > div:first-child');
    if (!head) return null;
    const buttons = [...head.querySelectorAll('button')];
    const correct = buttons.find((b) => b.textContent.trim() === 'Correct');
    const record = buttons.find((b) => b.textContent.trim().startsWith('Record'));
    const headingText = head.textContent.includes('Batches (');
    return {
      hasFoldBatches: !!document.getElementById('fold-batches'),
      hasBatchesText: headingText,
      correctTop: correct ? correct.getBoundingClientRect().top : null,
      recordTop: record ? record.getBoundingClientRect().top : null,
      correctLeft: correct ? correct.getBoundingClientRect().left : null,
      recordRight: record ? record.getBoundingClientRect().right : null,
      headRect: head.getBoundingClientRect(),
    };
  });
}


// 03.5-25 (G-03.5-6): the churn-cell grids, one reading shape for both pages.
// The app's churn grid is the log's first .batch-row__cells outside
// .tasting-reading; the board's is the first grid-template-columns:repeat(
// div in the Batch section outside the Tasting section. Both are read by
// their children in order: label span, value span (and a plan line).
const CELLS_BOARD_FILES = {
  393: '393-batch.html',
  723: '723-batch.html',
  983: '983-batch.html',
  984: '984-batch.html',
  1024: '1024-batch.html',
  1366: '1366-batch.html',
  1600: '1600-batch.html',
};

function readChurnCellsIn(page, isApp) {
  return page.evaluate((app) => {
    const grid = app
      ? [...document.querySelectorAll('.notebook-log .batch-row__cells')].find((el) => !el.closest('.tasting-reading'))
      : [...document.querySelectorAll('[aria-label="Batch"] div[style*="grid-template-columns:repeat("]')].find(
          (el) => !el.closest('section[aria-label="Tasting"]'),
        );
    if (!grid) return null;
    const gridRect = grid.getBoundingClientRect();
    const head = app ? grid.closest('.batch-row').querySelector('.batch-row__head') : grid.parentElement.firstElementChild;
    const cells = [...grid.children].map((cell) => {
      const rect = cell.getBoundingClientRect();
      const label = cell.children[0];
      const value = cell.children[1];
      return {
        label: label.textContent.trim(),
        left: rect.left - gridRect.left,
        top: rect.top - gridRect.top,
        height: rect.height,
        labelToValue: value.getBoundingClientRect().top - label.getBoundingClientRect().bottom,
      };
    });
    return {
      tracks: getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).map(parseFloat),
      gridWidth: gridRect.width,
      gridHeight: gridRect.height,
      headToGrid: gridRect.top - head.getBoundingClientRect().bottom,
      cells,
    };
  }, isApp);
}

// The Tasting section's grids (03.5-25 decisions_recorded 2). The app's
// tasting fold is opened first if it is closed; the board is read as drawn.
// Reads each grid's resolved tracks and each cell's left from the grid's
// left, height and label-to-value gap.
function readTastingGridsIn(page, isApp) {
  return page.evaluate((app) => {
    const section = document.querySelector(app ? '.tasting-reading' : 'section[aria-label="Tasting"]');
    if (!section) return null;
    const grids = app
      ? [...section.querySelectorAll('.batch-row__cells')]
      : [...section.querySelectorAll('div[style*="grid-template-columns:repeat("]')];
    return grids.map((grid) => {
      const gridRect = grid.getBoundingClientRect();
      return {
        tracks: getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).map(parseFloat),
        cells: [...grid.children].map((cell) => {
          const rect = cell.getBoundingClientRect();
          const label = cell.children[0];
          const value = cell.children[1];
          return {
            label: label.textContent.trim(),
            left: rect.left - gridRect.left,
            height: rect.height,
            labelToValue: value.getBoundingClientRect().top - label.getBoundingClientRect().bottom,
          };
        }),
      };
    });
  }, isApp);
}

async function main() {
  const failures = [];
  let checkCount = 0;
  const countedCheck = (condition, label) => {
    checkCount += 1;
    check(failures, condition, label);
  };

  const { appUrl, repoUrl, close } = await startServers();
  const browser = await launch();

  try {
    if (groups.has('many')) {
      const { context: boardContext, page: boardPage } = await openBoard(browser, repoUrl, '../011-options-counts/batches-many.html');
      const boardReading = await readBoardUprightGeometry(boardPage);
      console.log(JSON.stringify({ group: 'many', board: 'batches-many.html', boardReading }));
      await boardContext.close();

      // 03.5-24 (G-03.5-5): upright-393.html's batch list, the oracle for
      // where the connector sits against its marks.
      const { context: uprightCtx, page: uprightPage } = await openBoard(browser, repoUrl, '../011-options-counts/upright-393.html');
      const uprightBoardConnectors = await readBoardUprightConnectors(uprightPage, 'fold-batches');
      uprightConnectorChecks(uprightBoardConnectors, 'many board upright-393.html', countedCheck);
      await uprightCtx.close();

      for (const width of widths) {
        if (![393, 723, 1024, 1366].includes(width)) continue;
        const coarse = width === 393;
        const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse });

        await assertSeed(page);
        await recordAnotherBatch(page, '2026-08-09');
        await recordAnotherBatch(page, '2026-08-16');

        const foldState = await page.evaluate(() => {
          const el = document.querySelector('button[aria-controls="fold-batches"]');
          return el ? { ariaExpanded: el.getAttribute('aria-expanded'), text: el.textContent } : null;
        });
        countedCheck(foldState !== null, `many width=${width}: the fold-batches control exists`);
        if (foldState) {
          const expectedDefault = width >= 1366;
          countedCheck(
            foldState.ariaExpanded === String(expectedDefault),
            `many width=${width}: fold-batches defaults to aria-expanded=${expectedDefault} (got ${foldState.ariaExpanded})`,
          );
          countedCheck(
            foldState.text.includes('3 batches'),
            `many width=${width}: fold-batches control reads the count "3 batches" (got "${foldState.text}")`,
          );
          if (foldState.ariaExpanded !== 'true') {
            await page.click('button[aria-controls="fold-batches"]');
          }
        }

        const reading = await readAppUprightGeometry(page);
        console.log(JSON.stringify({ group: 'many', width, reading }));

        countedCheck(reading !== null, `many width=${width}: the upright list (#fold-batches) exists`);
        if (reading) {
          countedCheck(reading.rowCount === 3, `many width=${width}: 3 rows (got ${reading.rowCount})`);
          countedCheck(
            reading.rowTitles[0] === 'churned 16 Aug 2026',
            `many width=${width}: the first row names 16 Aug 2026 (got ${reading.rowTitles[0]})`,
          );
          countedCheck(reading.filledCount === 1, `many width=${width}: exactly 1 filled mark (got ${reading.filledCount})`);
          countedCheck(reading.hollowCount === 2, `many width=${width}: exactly 2 hollow marks (got ${reading.hollowCount})`);
          countedCheck(reading.ringCount === 1, `many width=${width}: exactly 1 ring (got ${reading.ringCount})`);
          countedCheck(reading.ringOnCurrent === true, `many width=${width}: the ring sits on the aria-current row`);
          countedCheck(reading.linkCount === 2, `many width=${width}: exactly 2 links (got ${reading.linkCount})`);
          countedCheck(reading.linksTabindexOk === true, `many width=${width}: every link carries tabindex 0`);
          countedCheck(reading.rowHeight >= 44, `many width=${width}: row height is at least 44px (got ${reading.rowHeight})`);
          countedCheck(
            Math.abs(reading.markWidth - 12) <= 1 && Math.abs(reading.markHeight - 12) <= 1,
            `many width=${width}: the mark is 12×12 (got ${reading.markWidth}x${reading.markHeight})`,
          );
          countedCheck(
            Math.abs(parseFloat(reading.titleFontSize) - 14) <= 1,
            `many width=${width}: the title is 14px (got ${reading.titleFontSize})`,
          );
          countedCheck(
            Math.abs(parseFloat(reading.metaFontSize) - 12) <= 1,
            `many width=${width}: the meta is 12px (got ${reading.metaFontSize})`,
          );

          const batchHeading = await page.locator('h2.region-name', { hasText: 'Batch' }).first().boundingBox();
          countedCheck(
            batchHeading !== null && reading.listBottom <= batchHeading.y + 1,
            `many width=${width}: the list's bottom sits above the Batch h2's top`,
          );

          if (boardReading) {
            countedCheck(
              Math.abs(reading.rowHeight - boardReading.rowHeight) <= 1,
              `many width=${width}: row height (${reading.rowHeight}) within 1px of batches-many.html's (${boardReading.rowHeight})`,
            );
            countedCheck(
              Math.abs(reading.markWidth - boardReading.markWidth) <= 1,
              `many width=${width}: mark width (${reading.markWidth}) within 1px of batches-many.html's (${boardReading.markWidth})`,
            );
            countedCheck(
              Math.abs(parseFloat(reading.titleFontSize) - parseFloat(boardReading.titleFontSize)) <= 1,
              `many width=${width}: title font-size (${reading.titleFontSize}) within 1px of batches-many.html's (${boardReading.titleFontSize})`,
            );
            countedCheck(
              Math.abs(parseFloat(reading.metaFontSize) - parseFloat(boardReading.metaFontSize)) <= 1,
              `many width=${width}: meta font-size (${reading.metaFontSize}) within 1px of batches-many.html's (${boardReading.metaFontSize})`,
            );
            countedCheck(
              Math.abs(parseFloat(reading.connectorWidth) - parseFloat(boardReading.connectorWidth)) <= 1,
              `many width=${width}: connector width (${reading.connectorWidth}) within 1px of batches-many.html's (${boardReading.connectorWidth})`,
            );
          }
        }

        // Last, since the reader scrolls the list to the middle of the
        // screen and the checks above read viewport positions.
        const appConnectors = await readAppUprightConnectors(page, 'fold-batches');
        console.log(JSON.stringify({ group: 'many', width, connectors: appConnectors }));
        uprightConnectorChecks(appConnectors, `many width=${width}`, countedCheck);
        if (width === 393 && appConnectors && uprightBoardConnectors) {
          uprightBoardMatchChecks(appConnectors, uprightBoardConnectors, 'upright-393.html', `many width=${width}`, countedCheck);
        }

        await context.close();
      }
    }

    if (groups.has('single')) {
      const boardFiles = { 393: '393-batch.html', 723: '723-batch.html' };
      const boardReadingsByWidth = {};
      for (const [width, file] of Object.entries(boardFiles)) {
        const { context: boardContext, page: boardPage } = await openBoard(browser, repoUrl, `../011-recipe-route-c/${file}`);
        boardReadingsByWidth[width] = await readBatchHeadGeometry(boardPage);
        console.log(JSON.stringify({ group: 'single', board: file, reading: boardReadingsByWidth[width] }));
        await boardContext.close();
      }

      for (const width of widths) {
        if (![393, 723, 1024, 1366].includes(width)) continue;
        const coarse = width === 393;
        const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse });

        const reading = await readBatchHeadGeometry(page);
        console.log(JSON.stringify({ group: 'single', width, reading }));

        countedCheck(reading !== null, `single width=${width}: the batch head exists`);
        if (reading) {
          countedCheck(reading.hasFoldBatches === false, `single width=${width}: no fold-batches control at one batch`);
          countedCheck(reading.hasBatchesText === false, `single width=${width}: no "Batches (" text at one batch`);
          countedCheck(
            reading.correctTop !== null && reading.recordTop !== null && Math.abs(reading.correctTop - reading.recordTop) <= 1,
            `single width=${width}: Correct's and Record another's tops are within 1px of each other`,
          );

          const boardFile = boardFiles[width];
          const boardReading = boardFile ? boardReadingsByWidth[width] : null;
          if (boardReading) {
            countedCheck(
              Math.abs(reading.correctLeft - boardReading.correctLeft) <= 1,
              `single width=${width}: Correct's left offset (${reading.correctLeft}) within 1px of ${boardFile}'s (${boardReading.correctLeft})`,
            );
            countedCheck(
              Math.abs(reading.recordRight - boardReading.recordRight) <= 1,
              `single width=${width}: Record another's right offset (${reading.recordRight}) within 1px of ${boardFile}'s (${boardReading.recordRight})`,
            );
          }
        }

        await context.close();
      }
    }

    if (groups.has('cells')) {
      for (const width of widths) {
        const file = CELLS_BOARD_FILES[width];
        if (!file) continue;
        const coarse = width === 393;
        const { context: boardContext, page: boardPage } = await openBoard(browser, repoUrl, `../011-recipe-route-c/${file}`);
        const board = await readChurnCellsIn(boardPage, false);
        const boardTasting = width === 1366 ? await readTastingGridsIn(boardPage, false) : null;
        await boardContext.close();

        const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse });
        await assertSeed(page);
        const app = await readChurnCellsIn(page, true);
        console.log(JSON.stringify({ group: 'cells', width, board, app }));

        countedCheck(board !== null, `cells width=${width}: ${file} draws a churn grid`);
        countedCheck(app !== null, `cells width=${width}: the app renders a churn grid`);
        if (board && app) {
          countedCheck(
            app.tracks.length === board.tracks.length,
            `cells width=${width}: ${app.tracks.length} tracks in the app against ${board.tracks.length} on ${file} (${JSON.stringify(app.tracks)} against ${JSON.stringify(board.tracks)})`,
          );
          app.tracks.forEach((track, i) => {
            if (i >= board.tracks.length) return;
            countedCheck(
              Math.abs(track - board.tracks[i]) <= 1,
              `cells width=${width}: track ${i + 1} is ${track} in the app against ${board.tracks[i]} on ${file}`,
            );
          });
          countedCheck(
            app.cells.length === board.cells.length,
            `cells width=${width}: ${app.cells.length} cells in the app against ${board.cells.length} on ${file}`,
          );
          board.cells.forEach((boardCell, i) => {
            const appCell = app.cells[i];
            if (!appCell) return;
            countedCheck(
              appCell.label === boardCell.label && Math.abs(appCell.left - boardCell.left) <= 1,
              `cells width=${width}: "${boardCell.label}" stands ${appCell.left} from the grid's left in the app against ${boardCell.left} on ${file}`,
            );
            countedCheck(
              Math.abs(appCell.height - boardCell.height) <= 1,
              `cells width=${width}: "${boardCell.label}" is ${appCell.height} tall in the app against ${boardCell.height} on ${file}`,
            );
            countedCheck(
              Math.abs(appCell.labelToValue - boardCell.labelToValue) <= 1,
              `cells width=${width}: "${boardCell.label}" has ${appCell.labelToValue} from label to value in the app against ${boardCell.labelToValue} on ${file}`,
            );
          });
          countedCheck(
            Math.abs(app.headToGrid - board.headToGrid) <= 1,
            `cells width=${width}: the head's bottom to the grid's top is ${app.headToGrid} in the app against ${board.headToGrid} on ${file}`,
          );
          countedCheck(
            Math.abs(app.gridHeight - board.gridHeight) <= 1,
            `cells width=${width}: the grid is ${app.gridHeight} tall in the app against ${board.gridHeight} on ${file}`,
          );
        }

        // The tasting grids: 2 tracks at 723.98 and below and from 1366, 4
        // from 724 to 1365.98 (the generator's own tasting grid, drawn open
        // on no board). At 1366 the fold is open by default and the board
        // draws it open, so the pitch is compared with 1366-batch.html's.
        const tastingFold = page.locator('button[aria-controls="fold-tasting"]');
        if ((await tastingFold.count()) > 0 && (await tastingFold.getAttribute('aria-expanded')) !== 'true') await tastingFold.click();
        const appTasting = await readTastingGridsIn(page, true);
        const expectedTastingTracks = width >= 724 && width < 1366 ? 4 : 2;
        countedCheck(appTasting !== null && appTasting.length > 0, `cells width=${width}: the app renders tasting grids`);
        for (const [gi, grid] of (appTasting ?? []).entries()) {
          countedCheck(
            grid.tracks.length === expectedTastingTracks,
            `cells width=${width}: tasting grid ${gi + 1} has ${grid.tracks.length} tracks, expected ${expectedTastingTracks} (${JSON.stringify(grid.tracks)})`,
          );
        }
        if (boardTasting && appTasting) {
          const boardCellsByLabel = new Map(boardTasting.flatMap((grid) => grid.cells).map((cell) => [cell.label, cell]));
          for (const [gi, grid] of appTasting.entries()) {
            for (const cell of grid.cells) {
              const boardCell = boardCellsByLabel.get(cell.label);
              if (!boardCell) continue;
              countedCheck(
                Math.abs(cell.left - boardCell.left) <= 1 && Math.abs(cell.height - boardCell.height) <= 1 && Math.abs(cell.labelToValue - boardCell.labelToValue) <= 1,
                `cells width=1366: tasting "${cell.label}" (grid ${gi + 1}) reads left ${cell.left}, height ${cell.height}, label-to-value ${cell.labelToValue} against ${boardCell.left}, ${boardCell.height}, ${boardCell.labelToValue} on ${file}`,
              );
            }
          }
        }

        await context.close();
      }
    }

    if (groups.has('keypad')) {
      // The two signed °C fields open the full keyboard (it has a minus); the
      // four unsigned ones keep the decimal pad. Keyed by accessible name.
      const EXPECTED_INPUTMODE = {
        'Time to draw temp., minutes': 'decimal',
        'Out of machine, degrees Celsius': 'text',
        'Churn duration, minutes': 'decimal',
        'Tempering, minutes': 'decimal',
        'Tasting temperature, degrees Celsius': 'text',
        'Melt test, g lost at 20 min': 'decimal',
      };
      const readKeypad = (page, names) =>
        page.evaluate(
          (wanted) =>
            wanted.map((name) => {
              const el = document.querySelector(`input[aria-label="${name}"]`);
              return {
                name,
                inputmode: el ? el.getAttribute('inputmode') : null,
                autocorrect: el ? el.getAttribute('autocorrect') : null,
                autocapitalize: el ? el.getAttribute('autocapitalize') : null,
                type: el ? el.getAttribute('type') : null,
              };
            }),
          names,
        );
      const minusThenSix = (text, digits) => /^[-\u2212]\s*/.test(text.trim()) && text.replace(/[^0-9]/g, '') === digits;

      for (const width of widths) {
        if (![393, 1366].includes(width)) continue;
        const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse: true });
        await assertSeed(page);

        await page.getByRole('button', { name: 'Record another' }).first().click();
        const churnNames = ['Time to draw temp., minutes', 'Out of machine, degrees Celsius', 'Churn duration, minutes'];
        const churnReading = await readKeypad(page, churnNames);
        console.log(JSON.stringify({ group: 'keypad', width, phase: 'churn', churnReading }));
        for (const r of churnReading) {
          const want = EXPECTED_INPUTMODE[r.name];
          countedCheck(r.inputmode === want, `keypad width=${width}: "${r.name}" inputmode is ${want} (got ${r.inputmode})`);
          countedCheck(r.type === 'text', `keypad width=${width}: "${r.name}" is type=text (got ${r.type})`);
          const signed = want === 'text';
          countedCheck(
            signed ? r.autocorrect === 'off' && r.autocapitalize === 'off' : r.autocorrect === null,
            `keypad width=${width}: "${r.name}" autocorrect/autocapitalize ${signed ? 'off' : 'absent'} (got ${r.autocorrect}/${r.autocapitalize})`,
          );
        }

        await page.getByRole('button', { name: 'Add tasting' }).first().click();
        const tastingNames = ['Tempering, minutes', 'Tasting temperature, degrees Celsius', 'Melt test, g lost at 20 min'];
        const tastingReading = await readKeypad(page, tastingNames);
        console.log(JSON.stringify({ group: 'keypad', width, phase: 'tasting', tastingReading }));
        for (const r of tastingReading) {
          const want = EXPECTED_INPUTMODE[r.name];
          countedCheck(r.inputmode === want, `keypad width=${width}: "${r.name}" inputmode is ${want} (got ${r.inputmode})`);
          countedCheck(r.type === 'text', `keypad width=${width}: "${r.name}" is type=text (got ${r.type})`);
          const signed = want === 'text';
          countedCheck(
            signed ? r.autocorrect === 'off' && r.autocapitalize === 'off' : r.autocorrect === null,
            `keypad width=${width}: "${r.name}" autocorrect/autocapitalize ${signed ? 'off' : 'absent'} (got ${r.autocorrect}/${r.autocapitalize})`,
          );
        }

        // The save, in this throwaway context only (T-03.5-55).
        const urlBeforeSave = page.url();
        await page.getByLabel('Churn date').fill('2026-09-29');
        await page.getByLabel('Out of machine, degrees Celsius').fill('-6');
        await page.getByLabel('Tasting temperature, degrees Celsius').fill('-12');
        await page.getByRole('button', { name: 'Save batch' }).first().click();
        await page.waitForFunction((prev) => window.location.href !== prev, urlBeforeSave);
        await page.waitForSelector('h2.region-name:has-text("Batch")');

        const readCell = (label) =>
          page.evaluate((wanted) => {
            const cell = [...document.querySelectorAll('.batch-row__cell')].find(
              (c) => c.querySelector('.batch-row__cell-label')?.textContent.trim() === wanted,
            );
            return cell ? cell.querySelector('.batch-row__cell-value').textContent : null;
          }, label);

        const outCell = await readCell('Out of machine');
        countedCheck(outCell !== null && minusThenSix(outCell, '6'), `keypad width=${width}: the saved Out of machine cell reads a minus then 6 (got ${JSON.stringify(outCell)})`);

        const tastingFold = page.locator('button[aria-controls="fold-tasting"]');
        if ((await tastingFold.getAttribute('aria-expanded')) !== 'true') await tastingFold.click();
        const tastingCell = await readCell('Tasting temperature');
        countedCheck(
          tastingCell !== null && minusThenSix(tastingCell, '12'),
          `keypad width=${width}: the saved Tasting temperature cell reads a minus then 12 (got ${JSON.stringify(tastingCell)})`,
        );

        await context.close();
      }
    }
  } finally {
    await browser.close();
    await close();
  }

  finish(failures, checkCount, 'batches probe');
}

await main();
