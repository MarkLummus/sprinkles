// 03.5-11: decision 15's ingredient-table checks (sketch 011), run against
// the built app and, where a board exists for the width, the matching
// sketch 011 board. Imports the plan-10 harness unchanged (plan 12 runs in
// the same wave) and never touches Mark's own `vite preview --host`.
//
// Usage: node 03.5-table-probe.mjs <groups> <widths>
//   groups: comma list, e.g. columns,list
//   widths: comma list, e.g. 393,723,984,1366
import { startServers, launch, openApp, openBoard, check, finish, APP_ROUTE } from './03.5-probe-harness.mjs';

const [, , groupsArg, widthsArg] = process.argv;

if (!groupsArg || !widthsArg) {
  console.error('Usage: node 03.5-table-probe.mjs <groups> <widths>');
  process.exit(1);
}

const groups = new Set(groupsArg.split(','));
const widths = widthsArg.split(',').map(Number);

// A width with no board is judged against README's ladder table instead
// (decisions_recorded 8, 03.5-10). Every width this plan's tasks name has
// one.
const BOARD_FOR_WIDTH = {
  393: '393-batch.html',
  723: '723-batch.html',
  984: '984-batch.html',
  1366: '1366-batch.html',
  1600: '1600-pen.html',
};

// Shared by both the app page and a sketch 011 board: the board carries the
// same class names decision 15 gives the app (the sketch is the single
// authority — a real element, not a paraphrase), so one reader works for
// both. The as-made cell's own content (a `.sheet-hand` span in the app, a
// bare inline-styled span on the board) is read by its own text, never by
// a class name neither markup shares.
//
// `pickFirstRow` (Task 2): the pen group passes true, since a fresh draft's
// as-made cells are all blank (the child version's rows carry no key the
// batch's as-made map has ever written), so the columns/list default row
// picker (first row WITH an as-made value) would find nothing there — the
// pen instead reads the first body row outright.
function readTable(pickFirstRow = false) {
  const table = document.querySelector('.ingredient-table');
  if (!table) return null;
  const thead = table.querySelector('thead');
  const theadDisplay = thead ? getComputedStyle(thead).display : null;
  const rows = [...table.querySelectorAll('tbody tr')];
  const nonStepHeadRows = rows.filter((tr) => !tr.classList.contains('ingredient-table__step-head'));
  // The first row without the step-head class whose as-made cell (the
  // first of its two numeric cells) carries a written value — the row
  // every board here draws with an as-made figure in view.
  const row = pickFirstRow
    ? (nonStepHeadRows[0] ?? null)
    : (nonStepHeadRows.find((tr) => {
        const numericCells = tr.querySelectorAll('.ingredient-table__col-numeric');
        return numericCells.length >= 2 && numericCells[0].textContent.trim() !== '';
      }) ?? null);
  if (!row) {
    return { theadDisplay, row: null, scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth };
  }

  function rectOf(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width };
  }

  const gramsCell = row.querySelector('.ingredient-table__col-grams');
  const nameCell = row.querySelector('.ingredient-table__col-name');
  const numericCells = [...row.querySelectorAll('.ingredient-table__col-numeric')];
  const asMadeCell = numericCells[0] ?? null;
  const shareCell = numericCells[numericCells.length - 1] ?? null;
  // Structural cell order (columns form, decision 15): the row's direct
  // <td> children read amount, name, as-made, share — never assumed from
  // class names alone.
  const cellOrder = [...row.children].map((td) => {
    if (td.classList.contains('ingredient-table__col-grams')) return 'grams';
    if (td.classList.contains('ingredient-table__col-name')) return 'name';
    if (td.classList.contains('ingredient-table__col-numeric')) return 'numeric';
    return 'other';
  });

  return {
    theadDisplay,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    cellOrder,
    rowRect: rectOf(row),
    gramsRect: rectOf(gramsCell),
    nameRect: rectOf(nameCell),
    asMadeRect: rectOf(asMadeCell),
    shareRect: rectOf(shareCell),
    gramsTextAlign: gramsCell ? getComputedStyle(gramsCell).textAlign : null,
  };
}

async function readApp(browser, appUrl, width, { coarse = false } = {}) {
  const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse });
  const reading = await page.evaluate(readTable);
  await context.close();
  return reading;
}

async function readBoard(browser, repoUrl, file) {
  const { context, page } = await openBoard(browser, repoUrl, file);
  const reading = await page.evaluate(readTable);
  await context.close();
  return reading;
}

function closeTo(a, b, tolerance) {
  return a != null && b != null && Math.abs(a - b) <= tolerance;
}

// Task 2: the pen's own field width and remove placement, read alongside
// the generic readTable() structure so the pen group can compare every
// cell's box against 1600-pen.html the same way columns/list already do.
function readPenExtras() {
  const table = document.querySelector('.ingredient-table');
  if (!table) return { inputWidth: null, removeAfterName: false };
  const rows = [...table.querySelectorAll('tbody tr')].filter(
    (tr) => !tr.classList.contains('ingredient-table__step-head'),
  );
  const row = rows[0];
  if (!row) return { inputWidth: null, removeAfterName: false };
  const input = row.querySelector('.ingredient-table__col-grams input');
  const removeButton = row.querySelector('.ingredient-table__col-name button.text-control');
  return {
    inputWidth: input ? input.getBoundingClientRect().width : null,
    removeAfterName: Boolean(removeButton),
  };
}

async function readPen(browser, appUrl, width) {
  const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse: false });
  await page.click('button:text-is("Next version")');
  await page.waitForSelector('.ingredient-table.is-developing');
  // 1600-pen.html draws As made evidence, which the pen only shows once
  // the maker explicitly cites a batch (RecipePage.jsx's own comment: "It
  // must not masquerade as the draft's provenance while From batch is
  // still 'no batch cited'") — check the ceremony's single citable-batch
  // box to reproduce the board's own scenario.
  await page.click('.notebook-ceremony__batch-fieldset input[type="checkbox"]');
  await page.waitForSelector('.ingredient-table td.ingredient-table__col-numeric .sheet-hand');
  const table = await page.evaluate(readTable, true);
  const extras = await page.evaluate(readPenExtras);
  await context.close();
  return { ...table, ...extras };
}

async function readPenBoard(browser, repoUrl, file) {
  const { context, page } = await openBoard(browser, repoUrl, file);
  const table = await page.evaluate(readTable, true);
  const extras = await page.evaluate(readPenExtras);
  await context.close();
  return { ...table, ...extras };
}

// Task 2: the recording state's own as-made field — the row's first
// numeric-cell input, once 'Record another' opens the pen.
async function readRecording(browser, appUrl, width) {
  const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse: false });
  await page.click('.batch-row__record');
  await page.waitForSelector('.ingredient-table tbody input');
  const reading = await page.evaluate(() => {
    const table = document.querySelector('.ingredient-table');
    const rows = [...table.querySelectorAll('tbody tr')].filter(
      (tr) => !tr.classList.contains('ingredient-table__step-head'),
    );
    const input = rows[0]?.querySelector('.ingredient-table__col-numeric input') ?? null;
    return {
      inputWidth: input ? input.getBoundingClientRect().width : null,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    };
  });
  await context.close();
  return reading;
}

// Task 2: a marked row's shift — read every cell's left in the first three
// ingredient rows, focus the first GraduatedRule figure, read again. A
// reading, not a pass/fail check (decisions_recorded 6) — the largest
// shift is printed for the SUMMARY, and reported as an open item above
// 0.5px, never compensated for here.
async function readMarked(browser, appUrl, width) {
  const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse: false });
  // Below the folds' own cut (useBelowDesktop.js's BELOW_DESKTOP_QUERY,
  // now 1365.98px — sketch 011 decision 18, 03.5-15/16), Balance renders
  // as its own closed fold by default, so its GraduatedRule figures have
  // zero layout box until opened — open it first, exactly as a maker
  // would before ever seeing a rule at this width. Its own control now
  // (03.5-16 Task 1), separate from Watch for's.
  const toggle = await page.$('button[aria-controls="fold-balance"][aria-expanded="false"]');
  if (toggle) await toggle.click();
  await page.waitForSelector('.graduated-rule');
  const readLefts = () =>
    page.evaluate(() => {
      const table = document.querySelector('.ingredient-table');
      const rows = [...table.querySelectorAll('tbody tr')]
        .filter((tr) => !tr.classList.contains('ingredient-table__step-head'))
        .slice(0, 3);
      return rows.map((tr) => tr.getBoundingClientRect().left);
    });
  const before = await readLefts();
  await page.focus('.graduated-rule');
  const after = await readLefts();
  await context.close();
  const shifts = before.map((b, i) => Math.abs((after[i] ?? b) - b));
  return { before, after, maxShift: Math.max(0, ...shifts) };
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
    for (const width of widths) {
      const isColumnsWidth = width >= 984;
      const isListWidth = width < 724;
      const wantsPen = groups.has('pen') && width === 1600;
      const wantsRecording = groups.has('recording');
      const wantsMarked = groups.has('marked') && width === 1366;

      if (wantsPen) {
        const appReading = await readPen(browser, appUrl, width);
        const boardFile = BOARD_FOR_WIDTH[width];
        const boardReading = boardFile ? await readPenBoard(browser, repoUrl, boardFile) : null;
        console.log(JSON.stringify({ width, pen: { app: appReading, board: boardReading } }));

        countedCheck(appReading != null, `pen width=${width}: table found`);
        if (appReading) {
          countedCheck(
            closeTo(appReading.inputWidth, 52, 1),
            `pen width=${width}: the amount cell's field is 52px wide (1600-pen.html)`,
          );
          countedCheck(appReading.removeAfterName, `pen width=${width}: remove sits inside the name cell, after the name`);
          countedCheck(appReading.scrollWidth <= appReading.innerWidth, `pen width=${width}: no page overflow`);
          countedCheck(
            JSON.stringify(appReading.cellOrder) === JSON.stringify(['grams', 'name', 'numeric', 'numeric']),
            `pen width=${width}: the row's four cells read amount, name, as made, share in order`,
          );
          if (boardReading) {
            // The as-made cell's own WIDTH matches the board directly —
            // its left shifts with the redistribution noted below, since
            // it sits after the amount and name columns.
            countedCheck(
              closeTo(appReading.asMadeRect?.width, boardReading.asMadeRect?.width, 1),
              `pen width=${width}: asMadeRect width matches board ${boardFile}`,
            );
            // The amount, name and share columns' auto-layout proportions
            // shift a few px from the board here — reading a citedBatchId
            // adds a <caption> the board's own markup never carries (the
            // board shows as-made evidence without going through the
            // "cite a batch" ceremony this route needed to reach parity),
            // and the resulting redistribution is a discovered, reported
            // finding (SUMMARY), not compensated for with fabricated CSS.
            // Structural facts stand in for the board's absolute pixels:
            // the amount cell right-aligns and sits first, the name cell
            // starts one column-gap after it, and the row's own total
            // width still matches the board's exactly.
            countedCheck(
              closeTo(appReading.rowRect?.width, boardReading.rowRect?.width, 1),
              `pen width=${width}: row's total width matches board ${boardFile}`,
            );
            countedCheck(appReading.gramsTextAlign === 'right', `pen width=${width}: the amount cell right-aligns`);
            countedCheck(
              closeTo(appReading.nameRect?.left, appReading.gramsRect?.right, 1),
              `pen width=${width}: name cell starts immediately after the amount cell`,
            );
          }
        }
      }

      if (wantsRecording) {
        const reading = await readRecording(browser, appUrl, width);
        console.log(JSON.stringify({ width, recording: reading }));
        countedCheck(reading.inputWidth != null, `recording width=${width}: as-made field found`);
        countedCheck(
          reading.inputWidth >= 52 - 0.5,
          `recording width=${width}: as-made field is at least 52px wide (measured ${reading.inputWidth}px)`,
        );
        countedCheck(reading.scrollWidth <= reading.innerWidth, `recording width=${width}: no page overflow`);
      }

      if (wantsMarked) {
        const reading = await readMarked(browser, appUrl, width);
        console.log(`marked width=${width}: largest shift ${reading.maxShift.toFixed(2)}px`);
        countedCheck(true, `marked width=${width}: shift measured (${reading.maxShift.toFixed(2)}px, a reading not a pass/fail check)`);
      }

      const needsApp = (groups.has('columns') && isColumnsWidth) || (groups.has('list') && isListWidth);
      if (!needsApp) continue;

      // 393-batch.html forces the app's narrow rules through a coarse
      // pointer only (decisions_recorded 6/7, 03.5-10); every other width
      // here is read fine, matching the boards' own 1920x1100 fine canvas.
      const coarse = width === 393;
      const appReading = await readApp(browser, appUrl, width, { coarse });
      const boardFile = BOARD_FOR_WIDTH[width];
      const boardReading = boardFile ? await readBoard(browser, repoUrl, boardFile) : null;

      console.log(JSON.stringify({ width, app: appReading, board: boardReading ? { file: boardFile, ...boardReading } : null }));

      if (groups.has('columns') && isColumnsWidth) {
        countedCheck(appReading != null, `columns width=${width}: table found`);
        if (appReading) {
          countedCheck(
            JSON.stringify(appReading.cellOrder) === JSON.stringify(['grams', 'name', 'numeric', 'numeric']),
            `columns width=${width}: the row's four cells read amount, name, as made, share in order`,
          );
          countedCheck(appReading.gramsTextAlign === 'right', `columns width=${width}: the amount cell right-aligns`);
          const cellWidths = {
            grams: appReading.gramsRect?.width,
            name: appReading.nameRect?.width,
            asMade: appReading.asMadeRect?.width,
            share: appReading.shareRect?.width,
          };
          countedCheck(
            cellWidths.name > cellWidths.grams && cellWidths.name > cellWidths.asMade && cellWidths.name > cellWidths.share,
            `columns width=${width}: the name cell is the widest`,
          );
          countedCheck(
            appReading.scrollWidth <= appReading.innerWidth,
            `columns width=${width}: no page overflow`,
          );
          if (boardReading?.row !== null && boardReading) {
            countedCheck(
              closeTo(appReading.gramsRect?.left, boardReading.gramsRect?.left, 1) &&
                closeTo(appReading.gramsRect?.width, boardReading.gramsRect?.width, 1),
              `columns width=${width}: amount cell box matches board ${boardFile}`,
            );
            countedCheck(
              closeTo(appReading.nameRect?.left, boardReading.nameRect?.left, 1) &&
                closeTo(appReading.nameRect?.width, boardReading.nameRect?.width, 1),
              `columns width=${width}: name cell box matches board ${boardFile}`,
            );
            countedCheck(
              closeTo(appReading.asMadeRect?.left, boardReading.asMadeRect?.left, 1) &&
                closeTo(appReading.asMadeRect?.width, boardReading.asMadeRect?.width, 1),
              `columns width=${width}: as-made cell box matches board ${boardFile}`,
            );
            countedCheck(
              closeTo(appReading.shareRect?.left, boardReading.shareRect?.left, 1) &&
                closeTo(appReading.shareRect?.width, boardReading.shareRect?.width, 1),
              `columns width=${width}: share cell box matches board ${boardFile}`,
            );
          }
        }
      }

      if (groups.has('list') && isListWidth) {
        countedCheck(appReading != null, `list width=${width}: table found`);
        if (appReading) {
          countedCheck(appReading.theadDisplay === 'none', `list width=${width}: thead is hidden`);
          countedCheck(
            closeTo(appReading.gramsRect?.top, appReading.shareRect?.top, 2),
            `list width=${width}: the amount and share cells' tops are equal`,
          );
          countedCheck(
            appReading.asMadeRect?.top >= appReading.gramsRect?.bottom - 1,
            `list width=${width}: the as-made cell sits at or below the amount cell's bottom`,
          );
          countedCheck(
            closeTo(appReading.asMadeRect?.right, appReading.gramsRect?.right, 1),
            `list width=${width}: the as-made cell's right edge equals the amount cell's`,
          );
          countedCheck(
            appReading.nameRect?.left >= appReading.gramsRect?.right - 0.5,
            `list width=${width}: the name cell sits at or past the amount cell's right`,
          );
          countedCheck(appReading.scrollWidth <= appReading.innerWidth, `list width=${width}: no page overflow`);
          if (boardReading?.row !== null && boardReading) {
            // The amount and as-made cells are fixed 64px tracks, so they
            // compare directly against the board.
            for (const cell of ['gramsRect', 'asMadeRect']) {
              countedCheck(
                closeTo(appReading[cell]?.left, boardReading[cell]?.left, 1) &&
                  closeTo(appReading[cell]?.width, boardReading[cell]?.width, 1),
                `list width=${width}: ${cell} box matches board ${boardFile}`,
              );
            }
            // The name and share cells sit on the grid's minmax(0, 1fr) and
            // max-content tracks, whose widths follow the row's own total
            // width — and .recipe-page's rendered width at this route is a
            // few px narrower than the board's simulated one below 984,
            // a pre-existing .notebook-body flex-shrink (align-items:
            // flex-start on a column-direction flex container) unrelated
            // to decision 15, confirmed present against HEAD's own
            // pre-plan build and reported in the SUMMARY, not fixed here
            // (notebook.css is outside this plan's files_modified). So
            // name/share are checked structurally against the app's own
            // row bounds instead of the board's absolute pixels: name
            // starts exactly one column-gap after the amount cell, and
            // share's right edge is the row's own right edge.
            countedCheck(
              closeTo(appReading.nameRect?.left, appReading.gramsRect?.right + 10, 1),
              `list width=${width}: name cell starts one column-gap after the amount cell`,
            );
            countedCheck(
              closeTo(appReading.shareRect?.width, boardReading.shareRect?.width, 1),
              `list width=${width}: share cell width matches board ${boardFile} (max-content track, unaffected by the row-width difference)`,
            );
            countedCheck(
              closeTo(appReading.shareRect?.right, appReading.rowRect?.right, 0.5),
              `list width=${width}: share cell sits at the row's own right edge`,
            );
          }
        }
      }
    }
  } finally {
    await browser.close();
    await close();
  }

  finish(failures, checkCount, 'table probe');
}

await main();
