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
function readTable() {
  const table = document.querySelector('.ingredient-table');
  if (!table) return null;
  const thead = table.querySelector('thead');
  const theadDisplay = thead ? getComputedStyle(thead).display : null;
  const rows = [...table.querySelectorAll('tbody tr')];
  // The first row without the step-head class whose as-made cell (the
  // first of its two numeric cells) carries a written value — the row
  // every board here draws with an as-made figure in view.
  const row = rows.find((tr) => {
    if (tr.classList.contains('ingredient-table__step-head')) return false;
    const numericCells = tr.querySelectorAll('.ingredient-table__col-numeric');
    return numericCells.length >= 2 && numericCells[0].textContent.trim() !== '';
  });
  if (!row) return { theadDisplay, row: null };

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
            for (const cell of ['gramsRect', 'nameRect', 'asMadeRect', 'shareRect']) {
              countedCheck(
                closeTo(appReading[cell]?.left, boardReading[cell]?.left, 1) &&
                  closeTo(appReading[cell]?.width, boardReading[cell]?.width, 1),
                `list width=${width}: ${cell} box matches board ${boardFile}`,
              );
            }
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
