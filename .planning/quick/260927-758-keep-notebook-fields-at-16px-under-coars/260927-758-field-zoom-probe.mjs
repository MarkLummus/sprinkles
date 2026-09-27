// 260927-758: real-render probe for the notebook fields' iOS focus-zoom
// floor under a coarse pointer (Rename and Next version, including the
// From batch select branch), and for the Why's prose-field role (sketch 011
// decision 17, which replaced this task's D-01/D-03 hand rendering). Imports the 03.5 harness unchanged — never starts
// a Vite server and never touches :4173 (see this task's environment note).
//
// Usage: node 260927-758-field-zoom-probe.mjs
import { startServers, launch, openApp, check, finish, APP_ROUTE } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

// Planning-time baseline (2026-09-27, before this task's fix): every field
// under .notebook-band read 15px grotesk at every pointer and width, except
// the select (16px, already outside .notebook-field). Why is not in this
// map: its pre-D-01 fine-pointer reading was 15px grotesk, rgb(20, 20, 20)
// (the 2026-09-27 planning reading) — decision 17 types it in the prose-field role, so
// Why is checked against the token-derived prose reference (readHandReference)
// rather than this string baseline.
const FINE_BASELINE_PX = {
  'Recipe name': '15px',
  'Recipe description': '15px',
  'Version name': '15px',
  'Cite a batch': '15px',
};

// The exact text-entry controls each flow's form is expected to show,
// asserted as a list so no case can pass on zero controls.
const EXPECTED_LABELS = {
  rename: ['Recipe name', 'Recipe description'],
  next: ['Version name', 'Why'],
  'next-select': ['Version name', 'Why', 'Cite a batch'],
};

const MODES = [
  { width: 393, coarse: true },
  { width: 1366, coarse: true },
  { width: 1366, coarse: false },
];

function modeKey({ width, coarse }) {
  return `${width}-${coarse ? 'coarse' : 'fine'}`;
}

// Collects every input/textarea/select under .notebook-band that is
// actually visible (getClientRects().length > 0), with the fields this
// probe needs to reason about a control's role and its computed text.
function readNotebookFields() {
  const nodes = [...document.querySelectorAll('.notebook-band input, .notebook-band textarea, .notebook-band select')];
  return nodes
    .filter((el) => el.getClientRects().length > 0)
    .map((el) => {
      const tag = el.tagName.toLowerCase();
      const type = tag === 'input' ? el.type : null;
      const computed = getComputedStyle(el);
      const textEntry = tag === 'textarea' || tag === 'select' || (tag === 'input' && !['checkbox', 'radio', 'button', 'submit', 'reset', 'hidden', 'range', 'color', 'file', 'image'].includes(type));
      return {
        tag,
        type,
        ariaLabel: el.getAttribute('aria-label'),
        fontSize: computed.fontSize,
        fontFamily: computed.fontFamily,
        lineHeight: computed.lineHeight,
        color: computed.color,
        textEntry,
      };
    });
}

// A prose-field reference derived from the tokens, not from literals: a throwaway
// span inside .notebook reading the same four custom properties the Why
// rule declares. An inline style on a throwaway element inside the probe is
// measurement, not app code.
function readHandReference() {
  const span = document.createElement('span');
  span.style.cssText = 'font-family: var(--face-text); font-size: var(--sheet-type-note); line-height: var(--sheet-leading-note); color: var(--sheet-pen-blue);';
  document.querySelector('.notebook').appendChild(span);
  const computed = getComputedStyle(span);
  const reference = {
    fontFamily: computed.fontFamily,
    fontSize: computed.fontSize,
    lineHeight: computed.lineHeight,
    color: computed.color,
  };
  span.remove();
  return reference;
}

async function openRename(page) {
  const index = await page.$$eval('.notebook-band button', (buttons) => buttons.findIndex((b) => b.textContent.trim() === 'Rename'));
  await page.click('.notebook-band button >> nth=' + index);
}

async function openNextVersion(page) {
  const index = await page.$$eval('.notebook-version__acts button', (buttons) => buttons.findIndex((b) => b.textContent.trim() === 'Next version'));
  await page.click('.notebook-version__acts button >> nth=' + index);
}

// Records a second batch (the seeded recipe already carries one), so the
// From batch control becomes the select branch (Cite a batch) rather than
// the single-citable checkbox, then opens Next version.
async function recordSecondBatchThenOpenNext(page) {
  await page.click('.batch-row__record');
  await page.fill('.notebook-log input[type="date"]', '2026-09-20');
  await page.locator('.notebook-log button', { hasText: /^Save batch$/ }).click();
  await page.waitForSelector('.notebook-version__acts');
  await openNextVersion(page);
}

async function readFlow(browser, appUrl, flowName, mode) {
  const { context, page } = await openApp(browser, appUrl, APP_ROUTE, mode);
  try {
    if (flowName === 'rename') {
      await openRename(page);
      await page.waitForSelector('.notebook-field .ink-field');
    } else if (flowName === 'next') {
      await openNextVersion(page);
      await page.waitForSelector('.notebook-ceremony__why');
    } else {
      await recordSecondBatchThenOpenNext(page);
      await page.waitForSelector('.notebook-ceremony__why');
    }

    const fields = await page.evaluate(readNotebookFields);
    const result = { fields };

    if (flowName === 'next' || flowName === 'next-select') {
      result.handReference = await page.evaluate(readHandReference);
    }
    if (flowName === 'next') {
      result.checkboxes = fields.filter((f) => f.tag === 'input' && f.type === 'checkbox');
    }

    return result;
  } finally {
    await context.close();
  }
}

function checkTextEntryLabels(countedCheck, flow, mode, fields, expectedLabels) {
  const textEntryFields = fields.filter((f) => f.textEntry);
  const labels = textEntryFields.map((f) => f.ariaLabel).sort();
  const expectedSorted = [...expectedLabels].sort();
  countedCheck(
    JSON.stringify(labels) === JSON.stringify(expectedSorted),
    `${flow} ${JSON.stringify(mode)}: exactly the expected text-entry controls ${JSON.stringify(expectedSorted)} (got ${JSON.stringify(labels)})`,
  );
  return textEntryFields;
}

function checkWhyEqualsHand(countedCheck, flow, mode, fields, handReference) {
  const why = fields.find((f) => f.ariaLabel === 'Why');
  countedCheck(why != null, `${flow} ${JSON.stringify(mode)}: Why field found`);
  if (!why) return;
  countedCheck(
    why.fontFamily === handReference.fontFamily,
    `${flow} ${JSON.stringify(mode)}: Why font-family equals the prose reference (got ${why.fontFamily}, reference ${handReference.fontFamily})`,
  );
  countedCheck(
    why.fontSize === handReference.fontSize,
    `${flow} ${JSON.stringify(mode)}: Why font-size equals the prose reference (got ${why.fontSize}, reference ${handReference.fontSize})`,
  );
  countedCheck(
    why.lineHeight === handReference.lineHeight,
    `${flow} ${JSON.stringify(mode)}: Why line-height equals the prose reference (got ${why.lineHeight}, reference ${handReference.lineHeight})`,
  );
  countedCheck(
    why.color === handReference.color,
    `${flow} ${JSON.stringify(mode)}: Why color equals the prose reference (got ${why.color}, reference ${handReference.color})`,
  );
}

async function main() {
  const failures = [];
  let checkCount = 0;
  const countedCheck = (condition, label) => {
    checkCount += 1;
    check(failures, condition, label);
  };

  const { appUrl, close } = await startServers();
  const browser = await launch();

  // familyByLabelAndMode['Recipe name']['1366-coarse'] = fontFamily, etc.,
  // built up across every reading — used at the end to prove the four
  // non-Why fields keep the same face at 1366 whichever pointer is in use.
  const familyByLabelAndMode = {};

  try {
    for (const flow of ['rename', 'next', 'next-select']) {
      for (const mode of MODES) {
        const result = await readFlow(browser, appUrl, flow, mode);
        console.log(JSON.stringify({ flow, mode, ...result }));

        const textEntryFields = checkTextEntryLabels(countedCheck, flow, mode, result.fields, EXPECTED_LABELS[flow]);

        for (const field of textEntryFields) {
          if (field.ariaLabel !== 'Why') {
            const key = modeKey(mode);
            familyByLabelAndMode[field.ariaLabel] ??= {};
            familyByLabelAndMode[field.ariaLabel][key] = field.fontFamily;
          }

          if (mode.coarse) {
            countedCheck(
              parseFloat(field.fontSize) >= 16,
              `${flow} ${JSON.stringify(mode)}: ${field.ariaLabel} font-size at least 16px under coarse (got ${field.fontSize})`,
            );
          } else if (mode.width === 1366 && field.ariaLabel !== 'Why') {
            const baseline = FINE_BASELINE_PX[field.ariaLabel];
            countedCheck(
              field.fontSize === baseline,
              `${flow} ${JSON.stringify(mode)}: ${field.ariaLabel} font-size equals fine baseline ${baseline} (got ${field.fontSize})`,
            );
          }
        }

        if (flow === 'next' || flow === 'next-select') {
          checkWhyEqualsHand(countedCheck, flow, mode, result.fields, result.handReference);
        }

        if (flow === 'next') {
          // A reading, not a size check — the checkbox is not a text-entry
          // control and does not trigger iOS focus zoom.
          countedCheck(result.checkboxes.length === 1, `${flow} ${JSON.stringify(mode)}: exactly one From batch checkbox found (got ${result.checkboxes.length})`);
        }

      }
    }

    // The four non-Why labels keep the same face at 1366 whichever pointer
    // is in use — only the size changes under coarse.
    for (const label of ['Recipe name', 'Recipe description', 'Version name', 'Cite a batch']) {
      const coarseFamily = familyByLabelAndMode[label]?.['1366-coarse'];
      const fineFamily = familyByLabelAndMode[label]?.['1366-fine'];
      countedCheck(
        coarseFamily === fineFamily,
        `${label}: 1366 coarse font-family equals 1366 fine font-family (got coarse ${coarseFamily}, fine ${fineFamily})`,
      );
    }

  } finally {
    await browser.close();
    await close();
  }

  finish(failures, checkCount, 'field zoom probe');
}

await main();
