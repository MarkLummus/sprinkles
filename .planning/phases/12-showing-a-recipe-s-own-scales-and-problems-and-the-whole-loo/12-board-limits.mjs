// 261116-80u: the creation editor's refused Save for over-long words (sketch 015 word-limits.html,
// board P12_WordLimits), held against the build, element by element, on 12-07's engine
// (12-board-check.mjs, used as it stands). Board against build in Playwright WebKit with a coarse
// pointer at 1 px, never prose or a test count (D-14; sketch 015 README, Authority). CONTRACT
// section 5 is what the panel holds (Mark's word limits, 2026-11-16, 12-UI-REVIEW.md finding 2
// option b):
//   - the Scales and Problems of the creation editor at 1366 after Save is pressed on 12-cases.mjs's
//     OVERLONG_DRAFT: a scale name of 21 characters (limit 16), a low end at its limit (12), a high
//     end of 17 (limit 12) and a problem of 51 (limit 40);
//   - each over-long field's sentence stands as `.field-error` in the place Required takes, the
//     field aria-invalid and described by it; the field at its limit stays quiet;
//   - no field is blank, so no `.field-requirement` stands in the Setup column.
// Not held here, with the reason: focus. Save's refusal scripts focus to Scale 1's Name in the build
// and the bake keeps no focus state, so neither a focus nor an outline check is declared.
//
// The panel's app state is the draft the capture used (p12limits-capture.mjs): seeded into the
// throwaway IndexedDB by the engine's `draft` option, then Save pressed in the steps.
//
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   PROBE_DIST="$S/dist-80u" node .planning/phases/12-*/12-board-check.mjs \
//     .planning/phases/12-*/12-board-pen.mjs .planning/phases/12-*/12-board-limits.mjs --selftest --evidence "$S/evidence-80u"
import { OVERLONG_DRAFT } from './12-cases.mjs';

const BOARD = '.planning/sketches/015-own-scales-and-problems/word-limits.html';

const CARDS = 'section[aria-label="Scales"] .mk-card, section[aria-label="Problems"] .mk-card';
const FIELDS = 'section[aria-label="Scales"] .mk-card textarea, section[aria-label="Problems"] .mk-card textarea';

// The first click after a navigation can miss: press Save until the sentences stand.
const pressSave = async (page) => {
  for (let i = 0; i < 4; i += 1) {
    await page.click('.notebook-ceremony__actions .notebook-action:not(.notebook-action--outline)');
    try {
      await page.waitForSelector('aside.notebook-log .field-error', { timeout: 1500 });
      break;
    } catch {
      // try again
    }
  }
  await page.waitForSelector('aside.notebook-log .field-error');
  await page.waitForTimeout(400);
};

export default {
  board: BOARD,
  panels: [
    {
      id: 'limits-editor-1366',
      label: 'limits-editor-1366',
      width: 1366,
      panelSelector: '.fp-win.p12w-1366',
      panelIndex: 0,
      route: '/notebook/new',
      library: 'original',
      draft: OVERLONG_DRAFT,
      ready: '.notebook.mk-page',
      steps: pressSave,
      anchor: 'aside.notebook-log',
      elements: [
        { selector: CARDS, checks: ['count', 'box'] },
        { selector: FIELDS, checks: ['count', 'box', 'value'] },
        { selector: '.field-error', checks: ['count', 'box', 'font', 'color', 'text'] },
        { selector: 'textarea[aria-invalid="true"]', checks: ['count', { attr: 'aria-describedby' }] },
        { selector: '.mk-stops', checks: ['count', 'text', 'box'] },
      ],
      absent: ['.field-requirement'],
    },
  ],
};
