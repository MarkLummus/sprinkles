// 260927-758: real-render probe for the notebook fields' iOS focus-zoom
// floor under a coarse pointer (Rename and Next version), and for the Why's
// hand rendering (D-01). Imports the 03.5 harness unchanged — never starts
// a Vite server and never touches :4173 (see this task's environment note).
//
// Usage: node 260927-758-field-zoom-probe.mjs
import { startServers, launch, openApp, check, finish, APP_ROUTE } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

// Planning-time baseline (2026-09-27, before this task's fix): every field
// under .notebook-band read 15px grotesk at every pointer and width, except
// the select (16px, already outside .notebook-field). Why is not in this
// map: its pre-D-01 fine-pointer reading was 15px grotesk, rgb(20, 20, 20)
// (the 2026-09-27 planning reading) — D-01 puts it in the hand instead, so
// Why is checked against the token-derived hand reference (readHandReference)
// rather than this string baseline.
const FINE_BASELINE_PX = {
  'Recipe name': '15px',
  'Recipe description': '15px',
  'Version name': '15px',
  'Cite a batch': '15px',
};

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

// A hand reference derived from the tokens, not from literals: a throwaway
// span inside .notebook reading the same four custom properties the Why
// rule declares. An inline style on a throwaway element inside the probe is
// measurement, not app code.
function readHandReference() {
  const span = document.createElement('span');
  span.style.cssText = 'font-family: var(--face-hand); font-size: var(--size-hand); line-height: var(--leading-hand); color: var(--sheet-pen-blue);';
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

// Waits for document.fonts.ready, then reports whether a Caveat face is
// loaded — read at screen, before any emulateMedia call (Task 3 emulates
// forced-colors/print afterward, which unloads it).
async function readCaveatLoaded(page) {
  return page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].some((face) => face.family.replace(/["']/g, '') === 'Caveat' && face.status === 'loaded');
  });
}

async function openRename(page) {
  const index = await page.$$eval('.notebook-band button', (buttons) => buttons.findIndex((b) => b.textContent.trim() === 'Rename'));
  await page.click('.notebook-band button >> nth=' + index);
}

async function openNextVersion(page) {
  const index = await page.$$eval('.notebook-version__acts button', (buttons) => buttons.findIndex((b) => b.textContent.trim() === 'Next version'));
  await page.click('.notebook-version__acts button >> nth=' + index);
}

async function readRenameFlow(browser, appUrl, { width, coarse }) {
  const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse });
  try {
    await openRename(page);
    await page.waitForSelector('.notebook-field .ink-field');
    const fields = await page.evaluate(readNotebookFields);
    return { fields };
  } finally {
    await context.close();
  }
}

async function readNextFlow(browser, appUrl, { width, coarse }) {
  const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse });
  try {
    await openNextVersion(page);
    await page.waitForSelector('.notebook-ceremony__why');
    const fields = await page.evaluate(readNotebookFields);
    const handReference = await page.evaluate(readHandReference);
    const caveatLoaded = await readCaveatLoaded(page);
    return { fields, handReference, caveatLoaded };
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

function checkNonWhyFineBaselines(countedCheck, flow, mode, textEntryFields) {
  for (const field of textEntryFields) {
    if (field.ariaLabel === 'Why') continue;
    const baseline = FINE_BASELINE_PX[field.ariaLabel];
    countedCheck(
      field.fontSize === baseline,
      `${flow} ${JSON.stringify(mode)}: ${field.ariaLabel} font-size equals fine baseline ${baseline} (got ${field.fontSize})`,
    );
  }
}

function checkWhyEqualsHand(countedCheck, flow, mode, fields, handReference) {
  const why = fields.find((f) => f.ariaLabel === 'Why');
  countedCheck(why != null, `${flow} ${JSON.stringify(mode)}: Why field found`);
  if (!why) return;
  countedCheck(
    why.fontFamily === handReference.fontFamily,
    `${flow} ${JSON.stringify(mode)}: Why font-family equals the hand reference (got ${why.fontFamily}, reference ${handReference.fontFamily})`,
  );
  countedCheck(
    why.fontSize === handReference.fontSize,
    `${flow} ${JSON.stringify(mode)}: Why font-size equals the hand reference (got ${why.fontSize}, reference ${handReference.fontSize})`,
  );
  countedCheck(
    why.lineHeight === handReference.lineHeight,
    `${flow} ${JSON.stringify(mode)}: Why line-height equals the hand reference (got ${why.lineHeight}, reference ${handReference.lineHeight})`,
  );
  countedCheck(
    why.color === handReference.color,
    `${flow} ${JSON.stringify(mode)}: Why color equals the hand reference (got ${why.color}, reference ${handReference.color})`,
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

  try {
    // rename: 393 coarse and 1366 fine.
    for (const mode of [
      { width: 393, coarse: true },
      { width: 1366, coarse: false },
    ]) {
      const { fields } = await readRenameFlow(browser, appUrl, mode);
      console.log(JSON.stringify({ flow: 'rename', mode, fields }));

      const textEntryFields = checkTextEntryLabels(countedCheck, 'rename', mode, fields, ['Recipe name', 'Recipe description']);

      if (mode.coarse) {
        for (const field of textEntryFields) {
          countedCheck(
            parseFloat(field.fontSize) >= 16,
            `rename ${JSON.stringify(mode)}: ${field.ariaLabel} font-size at least 16px under coarse (got ${field.fontSize})`,
          );
        }
      } else {
        checkNonWhyFineBaselines(countedCheck, 'rename', mode, textEntryFields);
      }
    }

    // next: 1366 fine, for now (Task 3 expands to coarse and other widths).
    for (const mode of [{ width: 1366, coarse: false }]) {
      const { fields, handReference, caveatLoaded } = await readNextFlow(browser, appUrl, mode);
      console.log(JSON.stringify({ flow: 'next', mode, fields, handReference, caveatLoaded }));

      const textEntryFields = checkTextEntryLabels(countedCheck, 'next', mode, fields, ['Version name', 'Why']);
      checkNonWhyFineBaselines(countedCheck, 'next', mode, textEntryFields);
      checkWhyEqualsHand(countedCheck, 'next', mode, fields, handReference);
      countedCheck(caveatLoaded, `next ${JSON.stringify(mode)}: Caveat face is loaded (document.fonts)`);
    }
  } finally {
    await browser.close();
    await close();
  }

  finish(failures, checkCount, 'field zoom probe');
}

await main();
