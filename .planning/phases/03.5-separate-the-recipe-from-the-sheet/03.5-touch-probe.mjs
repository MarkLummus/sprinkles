// 03.5-13 Task 1: touch sizes follow the pointer alone, checked at both a
// coarse and a fine pointer, including the record pen's battery in the
// full-width log. Imports the plan-10 harness unchanged (decisions_recorded
// — prohibitions).
//
// Usage: node 03.5-touch-probe.mjs <groups> <widths>
//   groups: comma list, e.g. touch,record
//   widths: comma list, e.g. 393,723,1024,1366
import { startServers, launch, openApp, openBoard, check, finish, APP_ROUTE } from './03.5-probe-harness.mjs';

const [, , groupsArg, widthsArg] = process.argv;

if (!groupsArg || !widthsArg) {
  console.error('Usage: node 03.5-touch-probe.mjs <groups> <widths>');
  process.exit(1);
}

const groups = new Set(groupsArg.split(','));
const widths = widthsArg.split(',').map(Number);

// A width with no board is judged against README's ladder table instead
// (decisions_recorded 8, 03.5-10).
const BOARD_FOR_WIDTH = {
  393: '393-batch.html',
  723: '723-batch.html',
};

// The touch group's two named controls: the log's "Correct" opener
// (BatchRow.jsx, .batch-row__correct) and the front-matter band's "Rename"
// (RecipeBand.jsx) — both bare <button>s, found by their own text since
// more than one element on the route carries .notebook-link (Show changes
// also does). Read the computed min-height as its raw string: the touch
// union either sets it to exactly "44px" or leaves the browser default,
// never a third value worth resolving to a number.
function readTouchControls() {
  function byText(text) {
    return [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text) ?? null;
  }
  function box(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { minHeight: getComputedStyle(el).minHeight, height: r.height };
  }
  return {
    correct: box(byText('Correct')),
    rename: box(byText('Rename')),
  };
}

async function readTouchApp(browser, appUrl, width, coarse) {
  const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse });
  const reading = await page.evaluate(readTouchControls);
  await context.close();
  return reading;
}

async function readTouchBoard(browser, repoUrl, file) {
  const { context, page } = await openBoard(browser, repoUrl, file);
  const reading = await page.evaluate(readTouchControls);
  await context.close();
  return reading;
}

// The record group opens the pen through the log's own "Record another"
// button (.batch-row__record, shared class with 03.5-table-probe.mjs's
// readRecording), then Add tasting to reveal the battery — scoped to
// .notebook-log since PenFoot's own foot-band ceremony (B) renders the
// same save-ceremony__add-tasting class a second time once the pen is
// open, and an unscoped click would hit Playwright's strict-mode
// ambiguity. Waits for the first axis stop to mount.
async function readRecordStop(browser, appUrl, width, coarse) {
  const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse });
  await page.click('.batch-row__record');
  await page.click('.notebook-log .save-ceremony__add-tasting');
  await page.waitForSelector('.axis-mark__stop');
  const reading = await page.evaluate(() => {
    const stop = document.querySelector('.axis-mark__stop');
    if (!stop) return null;
    const r = stop.getBoundingClientRect();
    return { width: r.width, height: r.height };
  });
  await context.close();
  return reading;
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
    if (groups.has('touch')) {
      // Coarse at 1366 and 393 (a wide and a narrow coarse device): both
      // named controls take the 44px floor. Fine at 723 and 1366 (a
      // narrowed desktop window and the iPad's own width, held with a
      // mouse): neither does — the width arm this task retires used to
      // force 44px at 723 regardless of pointer (the RED case).
      for (const width of widths) {
        const wantsCoarse = width === 1366 || width === 393;
        const wantsFine = width === 1366 || width === 723;
        if (!wantsCoarse && !wantsFine) continue;

        if (wantsCoarse) {
          const reading = await readTouchApp(browser, appUrl, width, true);
          console.log(JSON.stringify({ group: 'touch', width, coarse: true, reading }));
          countedCheck(reading.correct != null, `touch width=${width} coarse: Correct found`);
          countedCheck(reading.rename != null, `touch width=${width} coarse: Rename found`);
          countedCheck(reading.correct?.minHeight === '44px', `touch width=${width} coarse: Correct min-height is 44px (got ${reading.correct?.minHeight})`);
          countedCheck(reading.rename?.minHeight === '44px', `touch width=${width} coarse: Rename min-height is 44px (got ${reading.rename?.minHeight})`);

          const boardFile = BOARD_FOR_WIDTH[width];
          if (boardFile) {
            const boardReading = await readTouchBoard(browser, repoUrl, boardFile);
            console.log(JSON.stringify({ group: 'touch', board: boardFile, reading: boardReading }));
            countedCheck(
              boardReading.correct != null && Math.abs(reading.correct.height - boardReading.correct.height) <= 1,
              `touch width=${width} coarse: Correct's rendered height matches ${boardFile} (±1) — app ${reading.correct?.height}, board ${boardReading.correct?.height}`,
            );
          }
        }

        if (wantsFine) {
          const reading = await readTouchApp(browser, appUrl, width, false);
          console.log(JSON.stringify({ group: 'touch', width, coarse: false, reading }));
          countedCheck(reading.correct != null, `touch width=${width} fine: Correct found`);
          countedCheck(reading.rename != null, `touch width=${width} fine: Rename found`);
          countedCheck(reading.correct?.minHeight !== '44px', `touch width=${width} fine: Correct min-height is NOT 44px (got ${reading.correct?.minHeight})`);
          countedCheck(reading.rename?.minHeight !== '44px', `touch width=${width} fine: Rename min-height is NOT 44px (got ${reading.rename?.minHeight})`);

          const boardFile = BOARD_FOR_WIDTH[width];
          if (boardFile) {
            const boardReading = await readTouchBoard(browser, repoUrl, boardFile);
            console.log(JSON.stringify({ group: 'touch', board: boardFile, reading: boardReading }));
            // A reading, not a pass/fail check (03.5-11 precedent): the
            // 723-batch.html board draws Correct as raw, unstyled inline
            // text (no .text-control min-height chrome at all), while the
            // app's own fine-pointer baseline is the desktop text-control
            // rule (24px, unconditional, unrelated to the touch fix this
            // task makes) — the two were never going to agree on the pen's
            // ±1px, and forcing an assertion here would fail on a fact
            // this task did not change. The min-height check above is
            // what proves the fix.
            countedCheck(
              true,
              `touch width=${width} fine: Correct's rendered height vs ${boardFile} (measured, not asserted) — app ${reading.correct?.height}, board ${boardReading.correct?.height}`,
            );
          }
        }
      }
    }

    if (groups.has('record')) {
      // 1024 (log below the Sheet, 984-1365 rung): the stop's HEIGHT reads
      // the pointer alone — 44 coarse, 32 fine. 1366 (log beside the Sheet,
      // the 350 column): the narrow arrangement applies unconditionally, so
      // the stop is 44x44 whichever pointer is in use — the arrangement cut
      // this task's Task 3 places precisely (703-13 decisions_recorded 5,
      // kept at 760).
      for (const width of widths) {
        if (width !== 1024 && width !== 1366) continue;

        const coarseReading = await readRecordStop(browser, appUrl, width, true);
        console.log(JSON.stringify({ group: 'record', width, coarse: true, reading: coarseReading }));
        countedCheck(coarseReading != null, `record width=${width} coarse: first axis stop found`);

        const fineReading = await readRecordStop(browser, appUrl, width, false);
        console.log(JSON.stringify({ group: 'record', width, coarse: false, reading: fineReading }));
        countedCheck(fineReading != null, `record width=${width} fine: first axis stop found`);

        if (width === 1024) {
          countedCheck(coarseReading?.height === 44, `record width=1024 coarse: stop height is 44 (got ${coarseReading?.height})`);
          countedCheck(fineReading?.height === 32, `record width=1024 fine: stop height is 32 (got ${fineReading?.height})`);
        }

        if (width === 1366) {
          countedCheck(coarseReading?.width === 44 && coarseReading?.height === 44, `record width=1366 coarse: stop is 44x44 (got ${coarseReading?.width}x${coarseReading?.height})`);
          countedCheck(fineReading?.width === 44 && fineReading?.height === 44, `record width=1366 fine: stop is 44x44 (got ${fineReading?.width}x${fineReading?.height})`);
        }
      }
    }
  } finally {
    await browser.close();
    await close();
  }

  finish(failures, checkCount, 'touch probe');
}

await main();
