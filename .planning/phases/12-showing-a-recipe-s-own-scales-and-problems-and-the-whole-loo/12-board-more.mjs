// 12-15: the More panel of sketch 016 held against the build, on 12-07's engine (12-board-check.mjs,
// used as it stands). Split from 12-board-places.mjs with 12-15, so the plan that changes More's list
// shares no spec file with the plan that changes the pages (12-09). Conformance is board against build
// in Playwright WebKit with a coarse pointer at 1 px, never prose or a test count (D-14; sketch 013's
// rule). CONTRACT section 3 is what the panel holds:
//   - More, open below 724, lists Ingredients, Kitchen, the hairline and Search; there is no Import and
//     no Export in it (PHONE-01), so no button at all is in the list: its items are links only;
//   - the header's Import and Export from 724 up are unchanged (the unit cases of Shell.flyout.test.jsx
//     hold them); this board draws only the phone.
// The panel is `more` of notebook-home-more-393.html. It names route /notebook (where the board was
// captured, so the Notebook tab reads as current) and anchor `.shell__tabs`: the panel holds the whole
// shell, and a full panel is scoped only through an anchor. The tab row is the part this plan changes,
// so the check never depends on 12-09's pages. The words are read from the panel by the engine, never
// retyped here.
//
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   PROBE_DIST="$S/dist-15" node .planning/phases/12-*/12-board-check.mjs \
//     .planning/phases/12-*/12-board-more.mjs --selftest
//
// Every result is Playwright WebKit on a Mac: device-unverified.

export default {
  board: '.planning/sketches/016-entry-points-pen-preview-row-controls/notebook-home-more-393.html',
  panels: [
    {
      id: 'more-more',
      label: 'more-more',
      width: 393,
      panelSelector: '.fp-win.g2w-393[data-pid="more"]',
      panelIndex: 0,
      route: '/notebook',
      library: 'current',
      ready: '.shell__more summary',
      anchor: '.shell__tabs',
      // The board draws More open: the summary is pressed, as the capture did (p12g2-capture.mjs).
      steps: async (page) => {
        await page.locator('.shell__more summary').click();
        await page.waitForSelector('.shell__more[open]');
        await page.waitForTimeout(400);
      },
      elements: [
        { selector: '.shell__tabs > *', checks: ['count', 'box'] },
        { selector: '.shell__more li', checks: ['count', 'text', 'box'] },
        { selector: '.shell__more-sep', checks: ['count', 'box'] },
      ],
      // With Import and Export gone, More's list holds links only.
      absent: ['.shell__more button'],
      overflow: true,
      extraWidths: [723],
    },
  ],
};
