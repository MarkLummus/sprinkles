// 03.5-12: the History rail's paint order (Task 1) and the desktop-state
// switch (Task 2/3, deferred — see the plan's decisions_recorded 5 and this
// plan's own SUMMARY). Imports the plan-10 harness unchanged
// (decisions_recorded — prohibitions).
//
// 03.5-15 extends this file with two more groups: `folds` (Task 1 — sketch
// 011 decisions 18/19's cut at 1366 and the full-row fold head, this plan's
// own fold-version; EXPECTED_FOLDS grows with plan 16's Balance/Watch
// for/Tasting/History/Batches folds) and `rhythm` (Task 2 — the band's own
// rhythm switching at the same 1366 cut).
//
// 03.5-18 Task 1 adds the `history` group (decision 19's own History fold:
// one line at one version — Task 2 — a folding horizontal rail from 1366
// and UprightRail below it from two) and re-points `rail` at a two-version
// horizontal rail (saveNextVersion once, paint-order checks at 1366/1920,
// the forced-overflow fade check moved from 393 to 1366 — below 1366 the
// rail is upright now, not horizontal, so 393 no longer applies to it).
//
// Usage: node 03.5-band-probe.mjs <groups> <widths>
//   groups: comma list, e.g. rail,folds,rhythm,history
//   widths: comma list, e.g. 393,1024,1365,1366,1920
import { startServers, launch, openApp, openBoard, check, finish, APP_ROUTE, saveNextVersion } from './03.5-probe-harness.mjs';

const [, , groupsArg, widthsArg] = process.argv;

if (!groupsArg || !widthsArg) {
  console.error('Usage: node 03.5-band-probe.mjs <groups> <widths>');
  process.exit(1);
}

const groups = new Set(groupsArg.split(','));
const widths = widthsArg.split(',').map(Number);

// The folds this plan's own probe checks — grows as plan 16 brings Balance,
// Watch for, Tasting, History and Batches onto the same FoldRow (sketch 011
// decision 19). Task 1 (03.5-16) added fold-balance and fold-check; Task 2
// adds fold-tasting.
const EXPECTED_FOLDS = ['fold-version', 'fold-balance', 'fold-check', 'fold-tasting'];

// fold-version's own label sits in a dedicated caption span (VersionRow's
// `label={<span className="notebook-caption">Version</span>}`, since the
// Sheet's ambient text is not already caption-styled); its own control word
// therefore carries a "details" suffix ("Show details"/"Hide details").
// Every other fold (Balance, Watch for, Tasting) passes a bare string label
// that inherits its caption/region-name face straight from the surrounding
// heading (decisions_recorded 2/3, 03.5-16) — no separate caption span, and
// no suffix on the control word.
const FOLD_WHAT = { 'fold-version': ' details' };
function expectedFoldWord(id, open) {
  return (open ? 'Hide' : 'Show') + (FOLD_WHAT[id] ?? '');
}

// The rail group (Task 1, sketch 011 decision 16's last sentence, 1600-
// long-history.html): every mark sits above the track, and a scrolled
// rail's fade still covers the nodes it hides — checked in the app at a
// fine (1366) and a coarse (393) viewport, and on the board itself.
// The track is 1px tall; a mark's own vertical centre rarely lands exactly
// on that hairline, so hit-testing at the mark's own centre would pass by
// luck regardless of the paint-order bug. The track sits at the same y for
// every mark on the rail (a single hairline the full rail's width), so the
// real overlap zone this fix targets is (mark's own x centre, the track's
// own y centre) — confirmed against the plan-10 build (empirically the one
// point that actually reproduced the pre-fix bug).
async function readRailMarks(page) {
  return page.evaluate(() => {
    const track = document.querySelector('.notebook-history__track');
    if (!track) return [];
    const trackRect = track.getBoundingClientRect();
    const trackCy = trackRect.top + trackRect.height / 2;
    const marks = [...document.querySelectorAll('.notebook-history__mark')];
    return marks.map((mark) => {
      const r = mark.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const hit = document.elementFromPoint(cx, trackCy);
      const node = mark.closest('.notebook-history__node');
      const onMarkOrNode = hit === mark || (node ? node.contains(hit) : false);
      const onTrack = hit != null && hit.classList.contains('notebook-history__track');
      return { onMarkOrNode, onTrack, hitClass: hit ? hit.className : null };
    });
  });
}

// The rail's own real content (even after saveNextVersion, two nodes) may
// not fill the rail's width on its own, so the fade check needs a rail that
// actually scrolls (content hidden to the left) — a further node is cloned
// from the real, rendered first node purely for this read, the same "for
// the read only" treatment the plan gives the fade's own pointer-events
// below. The clone lives inside the <ol> React does not otherwise touch on
// a re-render triggered by a sibling's conditional (the fade), so it
// survives the scroll-driven re-render that follows. Moved from 393 to 1366
// (03.5-18 Task 1, decisions_recorded — below 1366 the rail is upright now,
// not horizontal, so the horizontal fade no longer exists there).
//
// The fade is position: absolute inside the rail, which is itself the
// scrolling element (overflow-x: auto) — its own left:0 box scrolls along
// with the rail's content (confirmed empirically: fadeRect.left trails the
// rail's own left edge by exactly the scrolled amount), so most of that box
// is clipped by the rail's own visible frame. The fade's true VISIBLE left
// edge is therefore the rail's own left edge, not the fade element's own
// (partly clipped, scroll-following) getBoundingClientRect().
async function readRailFadeReading(page) {
  return page.evaluate(async () => {
    const list = document.querySelector('.notebook-history__nodes');
    const firstNode = list.querySelector('.notebook-history__node');
    // 1366's own rail column is far wider than 393's — a single clone (the
    // pre-03.5-18 amount, sufficient at 393) does not reliably overflow it.
    // Ten clones (~1680px of extra node width) overflows any width this
    // probe runs at, up to 1920.
    for (let i = 0; i < 10; i += 1) {
      list.appendChild(firstNode.cloneNode(true));
    }

    const rail = document.querySelector('.notebook-history__rail');
    rail.scrollLeft = 40;
    rail.dispatchEvent(new Event('scroll', { bubbles: true }));

    const fade = await new Promise((resolve) => {
      const existing = document.querySelector('.notebook-history__fade');
      if (existing) {
        resolve(existing);
        return;
      }
      const observer = new MutationObserver(() => {
        const found = document.querySelector('.notebook-history__fade');
        if (found) {
          observer.disconnect();
          resolve(found);
        }
      });
      observer.observe(rail, { childList: true });
      setTimeout(() => resolve(document.querySelector('.notebook-history__fade')), 2000);
    });
    if (!fade) return { fadeFound: false };

    // For the read only (the plan's own words): the fade is pointer-events:
    // none in production so the rail keeps scrolling under it; overriding
    // it here is the only way elementFromPoint can ever report the fade.
    fade.style.pointerEvents = 'auto';

    const firstVisibleNode = document.querySelector('.notebook-history__node');
    const nameEl = firstVisibleNode.querySelector('.notebook-history__name');
    const nameRect = nameEl.getBoundingClientRect();
    const railRect = rail.getBoundingClientRect();
    const x = railRect.left + 10;
    const y = nameRect.top + nameRect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { fadeFound: true, isFade: hit === fade, hitClass: hit ? hit.className : null };
  });
}

// The board has no class names (it is generated inline-styled HTML) — the
// mark is the innermost aria-hidden span inside each node's own <a>; the
// fade div is excluded by tag (it is a <div>, this selector matches <span>
// only).
async function readBoardMarks(page) {
  return page.evaluate(() => {
    const marks = [...document.querySelectorAll('a[href="#"] span[aria-hidden="true"]')];
    return marks.map((mark) => {
      const r = mark.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const hit = document.elementFromPoint(cx, cy);
      return { onMark: hit === mark, hitClass: hit ? hit.className : null };
    });
  });
}

// The `history` group (03.5-18 Task 1/2, decision 19): the recipe's own
// History fold reuses UprightRail's own classes below 1366 (plan 17), so
// this reads #fold-history the same way the batch-list probe reads
// #fold-batches. The horizontal branch (>=1366) keeps reading the `rail`
// group's own .notebook-history__* classes via readFoldGeometry (the fold
// head, generic across every FoldRow) and a plain node count.
async function readAppHistoryUprightGeometry(page) {
  return page.evaluate(() => {
    const list = document.getElementById('fold-history');
    if (!list || list.tagName !== 'OL') return null;
    const rows = [...list.querySelectorAll(':scope > li.notebook-upright__row')];
    const marks = [...list.querySelectorAll('.notebook-upright__mark')];
    const firstRow = rows[0];
    const firstRowRect = firstRow ? firstRow.getBoundingClientRect() : null;
    const firstTitle = firstRow ? firstRow.querySelector('.notebook-upright__title') : null;
    const firstMeta = firstRow ? firstRow.querySelector('.notebook-upright__meta') : null;
    const firstMark = marks[0] ? marks[0].getBoundingClientRect() : null;
    return {
      rowCount: rows.length,
      rowTitles: rows.map((row) => row.querySelector('.notebook-upright__title')?.textContent ?? null),
      rowMetas: rows.map((row) => row.querySelector('.notebook-upright__meta')?.textContent ?? null),
      rowHeight: firstRowRect ? firstRowRect.height : null,
      markWidth: firstMark ? firstMark.width : null,
      markHeight: firstMark ? firstMark.height : null,
      titleFontSize: firstTitle ? getComputedStyle(firstTitle).fontSize : null,
      metaFontSize: firstMeta ? getComputedStyle(firstMeta).fontSize : null,
    };
  });
}

// upright-393.html's own "open" panel (011-options-counts): the row shape
// counts.py's vnode/history_upright draws is structurally identical to
// batches-many.html's own vrail_ rows (same author, same shape) — the mark
// is the aria-hidden span carrying inline border-radius: 6px, exactly the
// "board has no class names" discipline the batches probe already
// established for the shared UprightRail component.
async function readBoardHistoryUprightGeometry(page) {
  return page.evaluate(() => {
    const list = document.getElementById('fold-history');
    if (!list || list.tagName !== 'OL') return null;
    const rows = [...list.querySelectorAll(':scope > li')];
    const firstRow = rows[0];
    const ariaHiddenSpans = firstRow ? [...firstRow.querySelectorAll('a[href="#"] span[aria-hidden="true"]')] : [];
    const marks = ariaHiddenSpans.filter((el) => el.style.borderRadius === '6px');
    const firstMarkRect = marks[0] ? marks[0].getBoundingClientRect() : null;
    const textSpans = firstRow ? firstRow.querySelectorAll('a > span:last-child > span') : [];
    return {
      rowCount: rows.length,
      rowHeight: firstRow ? firstRow.getBoundingClientRect().height : null,
      markWidth: firstMarkRect ? firstMarkRect.width : null,
      markHeight: firstMarkRect ? firstMarkRect.height : null,
      titleFontSize: textSpans[0] ? getComputedStyle(textSpans[0]).fontSize : null,
      metaFontSize: textSpans[1] ? getComputedStyle(textSpans[1]).fontSize : null,
    };
  });
}

// The `folds` group (03.5-15 Task 1): a fold's control (button[aria-controls=id]),
// its panel (getElementById(id)) and, where the control renders (the app's
// FoldRow markup AND the board's own inline-styled fold_row markup share the
// same child shape), the control word and caption elements inside it —
// button > span:first-child (the head) > span:first-child (the caption) /
// span:last-child (the control word). fold-version is the only fold whose
// label is a dedicated caption span (see FOLD_WHAT above) — captionEl/wordEl
// only resolve distinctly there. Every other fold's label is bare text with
// no wrapping span, so captionEl and wordEl above both collapse onto the
// same (only) span child; controlFontSize/controlColor/controlTextTransform
// read the BUTTON's own computed style instead — since FoldRow's CSS
// (`font/color/text-transform: inherit`) carries the ancestor heading's
// caption/region-name face straight onto the button, including its bare
// text label, this is the correct read for those folds (03.5-16 Task 1).
// countEl/countText/countRight (03.5-16 Task 2) cover a fold whose FoldRow
// carries a `count` (Tasting's tasted date, at the row's own right end).
async function readFoldGeometry(page, foldId) {
  return page.evaluate((id) => {
    const control = document.querySelector(`button[aria-controls="${id}"]`);
    if (!control) return null;
    const rect = control.getBoundingClientRect();
    const parent = control.parentElement;
    const parentRect = parent ? parent.getBoundingClientRect() : null;
    const panel = document.getElementById(id);
    const panelDisplay = panel ? getComputedStyle(panel).display : null;
    const head = control.querySelector(':scope > span:first-child');
    const captionEl = head ? head.querySelector(':scope > span:first-child') : null;
    const wordEl = head ? head.querySelector(':scope > span:last-child') : null;
    const wordStyle = wordEl ? getComputedStyle(wordEl) : null;
    const captionStyle = captionEl ? getComputedStyle(captionEl) : null;
    const controlStyle = getComputedStyle(control);
    // Structural, not by class — the board's own count span (gen.py's
    // fold_row `cnt`) carries no class attribute at all, only an inline
    // style, so it is read as the button's second direct <span> child
    // (the head span is always first) exactly as the app's own
    // span.fold-row__count sits.
    const countEl = control.querySelector(':scope > span:nth-child(2)');
    const countStyle = countEl ? getComputedStyle(countEl) : null;
    const countRect = countEl ? countEl.getBoundingClientRect() : null;
    return {
      ariaExpanded: control.getAttribute('aria-expanded'),
      height: rect.height,
      width: rect.width,
      right: rect.right,
      parentWidth: parentRect ? parentRect.width : null,
      panelDisplay,
      word: wordEl ? wordEl.textContent : null,
      wordFontSize: wordStyle ? wordStyle.fontSize : null,
      wordColor: wordStyle ? wordStyle.color : null,
      wordFontWeight: wordStyle ? wordStyle.fontWeight : null,
      wordTextDecorationLine: wordStyle ? wordStyle.textDecorationLine : null,
      captionFontSize: captionStyle ? captionStyle.fontSize : null,
      captionTextTransform: captionStyle ? captionStyle.textTransform : null,
      captionColor: captionStyle ? captionStyle.color : null,
      controlFontSize: controlStyle.fontSize,
      controlColor: controlStyle.color,
      controlTextTransform: controlStyle.textTransform,
      countText: countEl ? countEl.textContent : null,
      countFontSize: countStyle ? countStyle.fontSize : null,
      countColor: countStyle ? countStyle.color : null,
      countRight: countRect ? countRect.right : null,
    };
  }, foldId);
}

async function clickFoldControl(page, foldId) {
  await page.click(`button[aria-controls="${foldId}"]`);
}

// The `rhythm` group (03.5-15 Task 2): the frame's own row gap (.notebook),
// the band's own row gap and top padding (.notebook-band), and the band
// grid's own column gap (.notebook-band__grid) — the app's own selectors.
async function readNotebookRhythm(page) {
  return page.evaluate(() => {
    const px = (v) => parseFloat(v);
    const notebook = document.querySelector('.notebook');
    const band = document.querySelector('.notebook-band');
    const grid = document.querySelector('.notebook-band__grid');
    return {
      notebookGap: notebook ? px(getComputedStyle(notebook).rowGap) : null,
      bandGap: band ? px(getComputedStyle(band).rowGap) : null,
      bandPaddingTop: band ? px(getComputedStyle(band).paddingTop) : null,
      gridGap: grid ? px(getComputedStyle(grid).columnGap) : null,
    };
  });
}

// The board's own equivalent structure (README "How the boards are made"):
// the frame is main.shell__main's own direct child div, the band is
// main.shell__main's own header, and the grid is the band's own first
// element child.
async function readBoardRhythm(page) {
  return page.evaluate(() => {
    const px = (v) => parseFloat(v);
    const frame = document.querySelector('main.shell__main > div');
    const band = document.querySelector('main.shell__main header');
    const grid = band ? band.firstElementChild : null;
    return {
      notebookGap: frame ? px(getComputedStyle(frame).rowGap) : null,
      bandGap: band ? px(getComputedStyle(band).rowGap) : null,
      bandPaddingTop: band ? px(getComputedStyle(band).paddingTop) : null,
      gridGap: grid ? px(getComputedStyle(grid).columnGap) : null,
    };
  });
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
    if (groups.has('rail')) {
      for (const width of widths) {
        if (width !== 1366 && width !== 1920) continue;
        const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse: false });
        await saveNextVersion(page, 'less oil');
        const marks = await readRailMarks(page);
        console.log(JSON.stringify({ group: 'rail', width, marks }));
        countedCheck(marks.length > 0, `rail width=${width}: at least one mark rendered`);
        for (const [i, mark] of marks.entries()) {
          countedCheck(mark.onMarkOrNode, `rail width=${width}: mark ${i} hit-tests to its own mark or node (got ${mark.hitClass})`);
          countedCheck(!mark.onTrack, `rail width=${width}: mark ${i} never hit-tests to the track`);
        }

        if (width === 1366) {
          const fadeReading = await readRailFadeReading(page);
          console.log(JSON.stringify({ group: 'rail', width, fade: fadeReading }));
          countedCheck(fadeReading.fadeFound, 'rail width=1366: the fade renders once the rail is scrolled');
          countedCheck(
            fadeReading.isFade,
            `rail width=1366: the fade paints over the node it hides (got ${fadeReading.hitClass})`,
          );
        }

        await context.close();
      }

      const { context: boardContext, page: boardPage } = await openBoard(browser, repoUrl, '1600-long-history.html');
      const boardReading = await readBoardMarks(boardPage);
      console.log(JSON.stringify({ group: 'rail', board: '1600-long-history.html', marks: boardReading }));
      countedCheck(boardReading.length > 0, 'rail board: at least one mark rendered');
      countedCheck(
        boardReading[0]?.onMark,
        `rail board: the first mark's centre hit-tests to that mark (got ${boardReading[0]?.hitClass})`,
      );
      await boardContext.close();
    }

    if (groups.has('history')) {
      const { context: uprightBoardCtx, page: uprightBoardPage } = await openBoard(
        browser,
        repoUrl,
        '../011-options-counts/upright-393.html',
      );
      const uprightBoardReading = await readBoardHistoryUprightGeometry(uprightBoardPage);
      console.log(JSON.stringify({ group: 'history', board: 'upright-393.html', uprightBoardReading }));
      await uprightBoardCtx.close();

      const { context: foldBoardCtx, page: foldBoardPage } = await openBoard(browser, repoUrl, '1366-batch.html');
      const foldBoardReading = await readFoldGeometry(foldBoardPage, 'fold-history');
      console.log(JSON.stringify({ group: 'history', board: '1366-batch.html', foldBoardReading }));
      await foldBoardCtx.close();

      for (const width of widths) {
        if (![393, 1024, 1366, 1920].includes(width)) continue;
        const coarse = width === 393;
        const expectedOpen = width >= 1366;
        const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse });
        await saveNextVersion(page, 'less oil');

        let reading = await readFoldGeometry(page, 'fold-history');
        console.log(JSON.stringify({ group: 'history', width, reading }));
        countedCheck(reading !== null, `history width=${width}: the fold-history control exists`);

        if (reading) {
          countedCheck(
            reading.ariaExpanded === String(expectedOpen),
            `history width=${width}: aria-expanded is ${expectedOpen} (got ${reading.ariaExpanded})`,
          );

          if (expectedOpen) {
            const nodeCount = await page.evaluate(
              () => document.querySelectorAll('#fold-history .notebook-history__node').length,
            );
            countedCheck(nodeCount === 2, `history width=${width}: 2 horizontal nodes (got ${nodeCount})`);
            countedCheck(
              reading.countText != null && reading.countText.endsWith('oldest left, latest right'),
              `history width=${width}: the count ends "oldest left, latest right" (got ${reading.countText})`,
            );
          } else {
            countedCheck(
              reading.countText === '2 versions',
              `history width=${width}: the count reads "2 versions" while closed (got ${reading.countText})`,
            );
            await clickFoldControl(page, 'fold-history');
            reading = await readFoldGeometry(page, 'fold-history');
            countedCheck(reading.ariaExpanded === 'true', `history width=${width}: a click opens fold-history`);
            const upright = await readAppHistoryUprightGeometry(page);
            countedCheck(
              upright !== null,
              `history width=${width}: the upright list (#fold-history) exists once opened`,
            );
            if (upright) {
              countedCheck(upright.rowCount === 2, `history width=${width}: 2 upright rows (got ${upright.rowCount})`);
              countedCheck(
                upright.rowTitles[0] != null && upright.rowTitles[0].startsWith('Version 2'),
                `history width=${width}: the first row names Version 2 (got ${upright.rowTitles[0]})`,
              );
              countedCheck(
                upright.rowHeight >= 44,
                `history width=${width}: row height is at least 44px (got ${upright.rowHeight})`,
              );
            }
            countedCheck(
              reading.countText != null && reading.countText.endsWith('latest first'),
              `history width=${width}: the count ends "latest first" once open (got ${reading.countText})`,
            );
          }

          const linkReading = await page.evaluate(() => {
            const links = [...document.querySelectorAll('#fold-history a')];
            return { count: links.length, tabindexOk: links.every((a) => a.getAttribute('tabindex') === '0') };
          });
          countedCheck(linkReading.count === 1, `history width=${width}: exactly 1 rail link (got ${linkReading.count})`);
          countedCheck(linkReading.tabindexOk, `history width=${width}: every rail link carries tabindex 0`);

          if (width === 393 && uprightBoardReading) {
            const appUpright = await readAppHistoryUprightGeometry(page);
            if (appUpright) {
              countedCheck(
                Math.abs(appUpright.rowHeight - uprightBoardReading.rowHeight) <= 1,
                `history width=393: row height (${appUpright.rowHeight}) within 1px of upright-393.html's (${uprightBoardReading.rowHeight})`,
              );
              countedCheck(
                Math.abs(appUpright.markWidth - uprightBoardReading.markWidth) <= 1,
                `history width=393: mark width (${appUpright.markWidth}) within 1px of upright-393.html's (${uprightBoardReading.markWidth})`,
              );
              countedCheck(
                Math.abs(parseFloat(appUpright.titleFontSize) - parseFloat(uprightBoardReading.titleFontSize)) <= 1,
                `history width=393: title font-size (${appUpright.titleFontSize}) within 1px of upright-393.html's (${uprightBoardReading.titleFontSize})`,
              );
              countedCheck(
                Math.abs(parseFloat(appUpright.metaFontSize) - parseFloat(uprightBoardReading.metaFontSize)) <= 1,
                `history width=393: meta font-size (${appUpright.metaFontSize}) within 1px of upright-393.html's (${uprightBoardReading.metaFontSize})`,
              );
            }
          }

          if (width === 1366 && foldBoardReading) {
            countedCheck(
              Math.abs(reading.height - foldBoardReading.height) <= 1,
              `history width=1366: control height (${reading.height}) within 1px of 1366-batch.html's (${foldBoardReading.height})`,
            );
            countedCheck(
              reading.word === foldBoardReading.word,
              `history width=1366: control word (${reading.word}) agrees with 1366-batch.html's (${foldBoardReading.word})`,
            );
            countedCheck(
              Math.abs(parseFloat(reading.countFontSize) - parseFloat(foldBoardReading.countFontSize)) <= 1,
              `history width=1366: count font-size (${reading.countFontSize}) within 1px of 1366-batch.html's (${foldBoardReading.countFontSize})`,
            );
            countedCheck(
              reading.countColor === foldBoardReading.countColor,
              `history width=1366: count colour (${reading.countColor}) agrees with 1366-batch.html's (${foldBoardReading.countColor})`,
            );
          }
        }

        await context.close();
      }
    }

    if (groups.has('folds')) {
      for (const width of widths) {
        if (![393, 1024, 1365, 1366, 1920].includes(width)) continue;
        const coarse = width === 393;
        const expectedOpen = width >= 1366;
        const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse });

        for (const id of EXPECTED_FOLDS) {
          const reading = await readFoldGeometry(page, id);
          console.log(JSON.stringify({ group: 'folds', width, id, reading }));
          countedCheck(reading !== null, `folds width=${width} ${id}: control exists`);
          if (!reading) continue;

          countedCheck(
            reading.ariaExpanded === String(expectedOpen),
            `folds width=${width} ${id}: aria-expanded is ${expectedOpen} (got ${reading.ariaExpanded})`,
          );
          countedCheck(
            (reading.panelDisplay === 'none') === !expectedOpen,
            `folds width=${width} ${id}: panel display none exactly when closed (got ${reading.panelDisplay})`,
          );
          countedCheck(
            reading.height >= 43.5,
            `folds width=${width} ${id}: control at least 44px tall (got ${reading.height})`,
          );
          countedCheck(
            reading.parentWidth != null && Math.abs(reading.width - reading.parentWidth) <= 1,
            `folds width=${width} ${id}: control width within 1px of its parent (got ${reading.width} vs ${reading.parentWidth})`,
          );
          const expectedWord = expectedFoldWord(id, expectedOpen);
          countedCheck(
            reading.word === expectedWord,
            `folds width=${width} ${id}: control word reads "${expectedWord}" (got ${reading.word})`,
          );

          if (id === 'fold-tasting') {
            countedCheck(
              reading.countText === 'tasted date unknown',
              `folds width=${width} ${id}: count reads "tasted date unknown" (got ${reading.countText})`,
            );
            countedCheck(
              reading.countRight != null && Math.abs(reading.countRight - reading.right) <= 1,
              `folds width=${width} ${id}: count's right edge sits at the row's own end (control right ${reading.right}, count right ${reading.countRight})`,
            );
          }

          await clickFoldControl(page, id);
          const afterClick = await readFoldGeometry(page, id);
          countedCheck(
            afterClick.ariaExpanded !== reading.ariaExpanded,
            `folds width=${width} ${id}: a click flips aria-expanded`,
          );
          countedCheck(
            (afterClick.panelDisplay === 'none') !== (reading.panelDisplay === 'none'),
            `folds width=${width} ${id}: a click flips the panel's display`,
          );

          await page.reload({ waitUntil: 'networkidle' });
          await page.waitForSelector('.notebook');
          const afterReload = await readFoldGeometry(page, id);
          countedCheck(
            afterReload.ariaExpanded === String(expectedOpen),
            `folds width=${width} ${id}: page.reload() restores the default`,
          );
        }

        if (width === 1366) {
          await page.setViewportSize({ width: 1024, height: 1100 });
          await page.waitForTimeout(150);
          const at1024 = await readFoldGeometry(page, 'fold-version');
          countedCheck(
            at1024?.ariaExpanded === 'false',
            `folds: setViewportSize to 1024 closes fold-version (got ${at1024?.ariaExpanded})`,
          );
          await page.setViewportSize({ width: 1366, height: 1100 });
          await page.waitForTimeout(150);
          const backAt1366 = await readFoldGeometry(page, 'fold-version');
          countedCheck(
            backAt1366?.ariaExpanded === 'true',
            `folds: back to 1366 opens fold-version (got ${backAt1366?.ariaExpanded})`,
          );
        }

        await context.close();
      }

      // Every fold in EXPECTED_FOLDS shares the same two board states
      // (1366-batch.html open, 1024-batch.html closed — decisions 18/19
      // draw every fold's default at the same 1366 cut).
      const boardStateDefs = [
        { file: '1366-batch.html', expectedOpen: true },
        { file: '1024-batch.html', expectedOpen: false },
      ];
      const boardReadingsById = {};
      for (const id of EXPECTED_FOLDS) {
        boardReadingsById[id] = {};
        for (const { file, expectedOpen } of boardStateDefs) {
          const { context: boardContext, page: boardPage } = await openBoard(browser, repoUrl, file);
          const reading = await readFoldGeometry(boardPage, id);
          console.log(JSON.stringify({ group: 'folds', board: file, id, reading }));
          countedCheck(reading !== null, `folds board ${file}: ${id} control exists`);
          if (reading) {
            const expectedWord = expectedFoldWord(id, expectedOpen);
            countedCheck(
              reading.ariaExpanded === String(expectedOpen),
              `folds board ${file}: ${id} aria-expanded is ${expectedOpen} (got ${reading.ariaExpanded})`,
            );
            countedCheck(
              reading.word === expectedWord,
              `folds board ${file}: ${id} word reads "${expectedWord}" (got ${reading.word})`,
            );
          }
          boardReadingsById[id][file] = reading;
          await boardContext.close();
        }
      }

      const boardComparisons = [
        { width: 1366, coarse: false, file: '1366-batch.html' },
        { width: 1024, coarse: false, file: '1024-batch.html' },
      ];
      for (const id of EXPECTED_FOLDS) {
        for (const { width, coarse, file } of boardComparisons) {
          const boardReading = boardReadingsById[id][file];
          if (!boardReading) continue;
          const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse });
          const appReading = await readFoldGeometry(page, id);
          console.log(JSON.stringify({ group: 'folds', width, id, comparedTo: file, appReading }));

          if (!appReading) {
            countedCheck(false, `folds width=${width}: ${id} control exists (comparing against ${file})`);
            await context.close();
            continue;
          }

          countedCheck(
            Math.abs(appReading.height - boardReading.height) <= 1,
            `folds width=${width}: ${id} control height (${appReading.height}) within 1px of ${file}'s (${boardReading.height})`,
          );

          if (id === 'fold-version') {
            // fold-version's label is a dedicated caption span (FOLD_WHAT
            // above) — compare its own word/caption styling, as before.
            countedCheck(
              Math.abs(parseFloat(appReading.wordFontSize) - parseFloat(boardReading.wordFontSize)) <= 1,
              `folds width=${width}: ${id} control word font-size (${appReading.wordFontSize}) within 1px of ${file}'s (${boardReading.wordFontSize})`,
            );
            countedCheck(
              appReading.wordColor === boardReading.wordColor,
              `folds width=${width}: ${id} control word colour (${appReading.wordColor}) agrees with ${file}'s (${boardReading.wordColor})`,
            );
            countedCheck(
              appReading.wordFontWeight === boardReading.wordFontWeight,
              `folds width=${width}: ${id} control word font-weight (${appReading.wordFontWeight}) agrees exactly with ${file}'s (${boardReading.wordFontWeight})`,
            );
            countedCheck(
              appReading.wordTextDecorationLine === boardReading.wordTextDecorationLine,
              `folds width=${width}: ${id} control word text-decoration-line (${appReading.wordTextDecorationLine}) agrees exactly with ${file}'s (${boardReading.wordTextDecorationLine})`,
            );
            countedCheck(
              Math.abs(parseFloat(appReading.captionFontSize) - parseFloat(boardReading.captionFontSize)) <= 1,
              `folds width=${width}: ${id} caption font-size (${appReading.captionFontSize}) within 1px of ${file}'s (${boardReading.captionFontSize})`,
            );
            countedCheck(
              appReading.captionTextTransform === boardReading.captionTextTransform,
              `folds width=${width}: ${id} caption text-transform (${appReading.captionTextTransform}) agrees exactly with ${file}'s (${boardReading.captionTextTransform})`,
            );
          } else {
            // Balance/Watch for: the label is bare text in the app AND on
            // the board (fold_row() sits directly inside the board's own
            // h2.region-name — gen.py leaves that wrapper in place), so
            // both sides inherit their caption face onto the BUTTON itself
            // — compare controlFontSize/controlColor/controlTextTransform
            // on both sides directly (03.5-16 Task 1).
            //
            // Tasting: the app's label is ALSO bare text (inherits from
            // .notebook-log .tasting-reading .region-name via the h3,
            // decisions_recorded 2 — "the button inherits the h3's caption
            // face"), but the board's fold_row() call wraps its label in
            // cap('Tasting') — an explicitly-styled nested span, not an
            // inherited one, since gen.py's own replacement drops the
            // Tasting head's ancestor entirely rather than nesting inside
            // one. Both approaches draw the identical pixel (the caption
            // face), so the comparison is deliberately cross-field here:
            // the app's own control-level read against the board's
            // caption-level read (03.5-16 Task 2).
            const boardFontSize = id === 'fold-tasting' ? boardReading.captionFontSize : boardReading.controlFontSize;
            const boardColor = id === 'fold-tasting' ? boardReading.captionColor : boardReading.controlColor;
            const boardTextTransform =
              id === 'fold-tasting' ? boardReading.captionTextTransform : boardReading.controlTextTransform;
            countedCheck(
              Math.abs(parseFloat(appReading.controlFontSize) - parseFloat(boardFontSize)) <= 1,
              `folds width=${width}: ${id} control font-size (${appReading.controlFontSize}) within 1px of ${file}'s (${boardFontSize})`,
            );
            countedCheck(
              appReading.controlColor === boardColor,
              `folds width=${width}: ${id} control colour (${appReading.controlColor}) agrees with ${file}'s (${boardColor})`,
            );
            countedCheck(
              appReading.controlTextTransform === boardTextTransform,
              `folds width=${width}: ${id} control text-transform (${appReading.controlTextTransform}) agrees exactly with ${file}'s (${boardTextTransform})`,
            );
          }

          if (id === 'fold-tasting') {
            countedCheck(
              Math.abs(parseFloat(appReading.countFontSize) - parseFloat(boardReading.countFontSize)) <= 1,
              `folds width=${width}: ${id} count font-size (${appReading.countFontSize}) within 1px of ${file}'s (${boardReading.countFontSize})`,
            );
            countedCheck(
              appReading.countColor === boardReading.countColor,
              `folds width=${width}: ${id} count colour (${appReading.countColor}) agrees with ${file}'s (${boardReading.countColor})`,
            );
          }

          await context.close();
        }
      }
    }

    if (groups.has('rhythm')) {
      for (const width of widths) {
        if (![1024, 1365, 1366, 1920].includes(width)) continue;
        const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse: false });
        const reading = await readNotebookRhythm(page);
        console.log(JSON.stringify({ group: 'rhythm', width, reading }));
        const expected =
          width >= 1366
            ? { notebookGap: 28, bandGap: 24, bandPaddingTop: 20, gridGap: 40 }
            : { notebookGap: 24, bandGap: 20, bandPaddingTop: 16, gridGap: 32 };
        for (const key of Object.keys(expected)) {
          countedCheck(
            reading[key] === expected[key],
            `rhythm width=${width}: ${key} is ${expected[key]} (got ${reading[key]})`,
          );
        }
        await context.close();
      }

      const boardFiles = { 1920: '1920-batch.html', 1024: '1024-batch.html' };
      for (const [width, file] of Object.entries(boardFiles)) {
        const { context: boardContext, page: boardPage } = await openBoard(browser, repoUrl, file);
        const boardReading = await readBoardRhythm(boardPage);
        console.log(JSON.stringify({ group: 'rhythm', board: file, boardReading }));

        const { context: appContext, page: appPage } = await openApp(browser, appUrl, APP_ROUTE, {
          width: Number(width),
          coarse: false,
        });
        const appReading = await readNotebookRhythm(appPage);
        console.log(JSON.stringify({ group: 'rhythm', width: Number(width), comparedTo: file, appReading }));

        for (const key of Object.keys(boardReading)) {
          countedCheck(
            appReading[key] === boardReading[key],
            `rhythm width=${width}: app ${key} (${appReading[key]}) equals ${file}'s ${key} (${boardReading[key]})`,
          );
        }
        await appContext.close();
        await boardContext.close();
      }
    }
  } finally {
    await browser.close();
    await close();
  }

  finish(failures, checkCount, 'band probe');
}

await main();
