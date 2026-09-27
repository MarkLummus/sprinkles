// 03.5-12: the History rail's paint order (Task 1) and the desktop-state
// switch (Task 2/3, deferred — see the plan's decisions_recorded 5 and this
// plan's own SUMMARY). Imports the plan-10 harness unchanged
// (decisions_recorded — prohibitions).
//
// Usage: node 03.5-band-probe.mjs <groups> <widths>
//   groups: comma list, e.g. rail,desktop
//   widths: comma list, e.g. 393,1366
import { startServers, launch, openApp, openBoard, check, finish, APP_ROUTE } from './03.5-probe-harness.mjs';

const [, , groupsArg, widthsArg] = process.argv;

if (!groupsArg || !widthsArg) {
  console.error('Usage: node 03.5-band-probe.mjs <groups> <widths>');
  process.exit(1);
}

const groups = new Set(groupsArg.split(','));
const widths = widthsArg.split(',').map(Number);

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

// The seeded fixture (APP_ROUTE) carries exactly one saved version, so the
// rail's own single node cannot overflow. The fade check needs a rail that
// actually scrolls (content hidden to the left) — a second node is cloned
// from the real, rendered first node purely for this read, the same "for
// the read only" treatment the plan gives the fade's own pointer-events
// below. The clone lives inside the <ol> React does not otherwise touch on
// a re-render triggered by a sibling's conditional (the fade), so it
// survives the scroll-driven re-render that follows.
//
// The fade is position: absolute inside the rail, which is itself the
// scrolling element (overflow-x: auto) — its own left:0 box scrolls along
// with the rail's content (confirmed empirically: fadeRect.left trails the
// rail's own left edge by exactly the scrolled amount), so most of that box
// is clipped by the rail's own visible frame. The fade's true VISIBLE left
// edge is therefore the rail's own left edge, not the fade element's own
// (partly clipped, scroll-following) getBoundingClientRect().
async function readRailFadeAt393(page) {
  return page.evaluate(async () => {
    const list = document.querySelector('.notebook-history__nodes');
    const firstNode = list.querySelector('.notebook-history__node');
    list.appendChild(firstNode.cloneNode(true));

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
        if (width !== 1366 && width !== 393) continue;
        const coarse = width === 393;
        const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse });
        const marks = await readRailMarks(page);
        console.log(JSON.stringify({ group: 'rail', width, marks }));
        countedCheck(marks.length > 0, `rail width=${width}: at least one mark rendered`);
        for (const [i, mark] of marks.entries()) {
          countedCheck(mark.onMarkOrNode, `rail width=${width}: mark ${i} hit-tests to its own mark or node (got ${mark.hitClass})`);
          countedCheck(!mark.onTrack, `rail width=${width}: mark ${i} never hit-tests to the track`);
        }

        if (width === 393) {
          const fadeReading = await readRailFadeAt393(page);
          console.log(JSON.stringify({ group: 'rail', width, fade: fadeReading }));
          countedCheck(fadeReading.fadeFound, 'rail width=393: the fade renders once the rail is scrolled');
          countedCheck(
            fadeReading.isFade,
            `rail width=393: the fade paints over the node it hides (got ${fadeReading.hitClass})`,
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
  } finally {
    await browser.close();
    await close();
  }

  finish(failures, checkCount, 'band probe');
}

await main();
