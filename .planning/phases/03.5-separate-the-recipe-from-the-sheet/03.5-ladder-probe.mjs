// 03.5-10/11/12: the derived width ladder's checks (sketch 011 decision 16),
// run against the built app and, where a board exists for the width, the
// matching sketch 011 board. Groups accumulate across this gap's plans —
// this plan adds nav, sheet and home; a later plan in the same gap set
// adds log, cap, band and margin.
//
// Usage: node 03.5-ladder-probe.mjs <groups> <widths>
//   groups: comma list, e.g. nav,sheet,home
//   widths: comma list, e.g. 983,984,1024
import { startServers, launch, openApp, openBoard, check, finish, APP_ROUTE } from './03.5-probe-harness.mjs';

const [, , groupsArg, widthsArg] = process.argv;

if (!groupsArg || !widthsArg) {
  console.error('Usage: node 03.5-ladder-probe.mjs <groups> <widths>');
  process.exit(1);
}

const groups = new Set(groupsArg.split(','));
const widths = widthsArg.split(',').map(Number);

// A width with no board is judged against README's ladder table instead
// (decisions_recorded 8). Task 2 adds 1366/1920; Task 3 adds 723.
const BOARD_FOR_WIDTH = {
  723: '723-batch.html',
  983: '983-batch.html',
  984: '984-batch.html',
  1366: '1366-batch.html',
  1920: '1920-batch.html',
};

function displayOfScript() {
  function displayOf(selector) {
    const el = document.querySelector(selector);
    return el ? getComputedStyle(el).display : null;
  }
  return displayOf;
}

async function readApp(browser, appUrl, width) {
  const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse: false });
  const reading = await page.evaluate(() => {
    function displayOf(selector) {
      const el = document.querySelector(selector);
      return el ? getComputedStyle(el).display : null;
    }
    const recipePage = document.querySelector('.recipe-page');
    const recipePageTrackCount = recipePage
      ? getComputedStyle(recipePage).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length
      : null;
    const links = [...document.querySelectorAll('a')];
    const allTabIndexZero = links.length > 0 && links.every((a) => a.getAttribute('tabindex') === '0');
    return {
      railDisplay: displayOf('.shell__rail'),
      tabsDisplay: displayOf('.shell__tabs'),
      toolsPlaceDisplay: displayOf('.shell__tools > .shell__place'),
      recipePageTrackCount,
      allTabIndexZero,
      linkCount: links.length,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    };
  });
  await context.close();
  return reading;
}

async function readHome(browser, appUrl, width) {
  const { context, page } = await openApp(browser, appUrl, '/', { width, coarse: false });
  const reading = await page.evaluate(() => {
    function displayOf(selector) {
      const el = document.querySelector(selector);
      return el ? getComputedStyle(el).display : null;
    }
    const links = [...document.querySelectorAll('a')];
    const allTabIndexZero = links.length > 0 && links.every((a) => a.getAttribute('tabindex') === '0');
    return {
      railDisplay: displayOf('.shell__rail'),
      tabsDisplay: displayOf('.shell__tabs'),
      allTabIndexZero,
      linkCount: links.length,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    };
  });
  await context.close();
  return reading;
}

async function readBoard(browser, repoUrl, file) {
  const { context, page } = await openBoard(browser, repoUrl, file);
  const reading = await page.evaluate(() => {
    function displayOf(selector) {
      const el = document.querySelector(selector);
      return el ? getComputedStyle(el).display : null;
    }
    const recipePage = document.querySelector('.recipe-page');
    const recipePageTrackCount = recipePage
      ? getComputedStyle(recipePage).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length
      : null;
    return {
      railDisplay: displayOf('.shell__rail'),
      tabsDisplay: displayOf('.shell__tabs'),
      recipePageTrackCount,
    };
  });
  await context.close();
  return reading;
}

function isShown(display) {
  return display !== null && display !== 'none';
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
      const appReading = groups.has('nav') || groups.has('sheet') ? await readApp(browser, appUrl, width) : null;
      const homeReading = groups.has('home') ? await readHome(browser, appUrl, width) : null;
      const boardFile = BOARD_FOR_WIDTH[width];
      const boardReading =
        boardFile && (groups.has('nav') || groups.has('sheet')) ? await readBoard(browser, repoUrl, boardFile) : null;

      console.log(
        JSON.stringify({ width, app: appReading, home: homeReading, board: boardReading ? { file: boardFile, ...boardReading } : null }),
      );

      const sideNavShows = width >= 984;

      if (groups.has('nav') && appReading) {
        countedCheck(isShown(appReading.railDisplay) === sideNavShows, `nav width=${width}: rail shown iff width>=984`);
        countedCheck(!isShown(appReading.tabsDisplay) === sideNavShows, `nav width=${width}: tabs hidden iff width>=984`);
        countedCheck(
          isShown(appReading.toolsPlaceDisplay) === sideNavShows,
          `nav width=${width}: header tools shown iff width>=984`,
        );
        countedCheck(appReading.allTabIndexZero, `nav width=${width}: every link carries tabindex 0`);
        countedCheck(appReading.scrollWidth <= appReading.innerWidth, `nav width=${width}: no page overflow`);

        if (boardReading) {
          countedCheck(
            isShown(appReading.railDisplay) === isShown(boardReading.railDisplay),
            `nav width=${width}: rail display matches board ${boardFile}`,
          );
          countedCheck(
            isShown(appReading.tabsDisplay) === isShown(boardReading.tabsDisplay),
            `nav width=${width}: tabs display matches board ${boardFile}`,
          );
        }
      }

      if (groups.has('sheet') && appReading) {
        const expectedTracks = sideNavShows ? 2 : 1;
        countedCheck(
          appReading.recipePageTrackCount === expectedTracks,
          `sheet width=${width}: .recipe-page has ${expectedTracks} track(s)`,
        );
        if (boardReading) {
          countedCheck(
            appReading.recipePageTrackCount === boardReading.recipePageTrackCount,
            `sheet width=${width}: .recipe-page track count matches board ${boardFile}`,
          );
        }
      }

      if (groups.has('home') && homeReading) {
        const navCount = (isShown(homeReading.railDisplay) ? 1 : 0) + (isShown(homeReading.tabsDisplay) ? 1 : 0);
        countedCheck(navCount === 1, `home width=${width}: exactly one navigation shown`);
        countedCheck(homeReading.scrollWidth <= homeReading.innerWidth, `home width=${width}: no page overflow`);
      }
    }
  } finally {
    await browser.close();
    await close();
  }

  finish(failures, checkCount, 'ladder probe');
}

await main();
