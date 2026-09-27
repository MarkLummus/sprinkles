// 260927-758: real-render probe for the notebook fields' iOS focus-zoom
// floor under a coarse pointer (Rename and Next version), and for the Why's
// hand rendering (D-01). Imports the 03.5 harness unchanged — never starts
// a Vite server and never touches :4173 (see this task's environment note).
//
// Usage: node 260927-758-field-zoom-probe.mjs
import { startServers, launch, openApp, check, finish, APP_ROUTE } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

// Planning-time baseline (2026-09-27, before this task's fix): every field
// under .notebook-band read 15px grotesk at every pointer and width, except
// the select (16px, already outside .notebook-field). The Why's baseline
// (15px grotesk) is overridden below once D-01's hand fix lands (Task 2) —
// see WHY_LABEL handling in checkFineBaseline.
const FINE_BASELINE_PX = {
  'Recipe name': '15px',
  'Recipe description': '15px',
  'Version name': '15px',
  Why: '15px', // pre-D-01 value; Task 2 replaces this entry with a token-derived reference
  'Cite a batch': '15px',
};

const NON_CHECKBOX_TYPES = new Set(['checkbox', 'radio', 'button', 'submit', 'reset', 'hidden', 'range', 'color', 'file', 'image']);

// Collects every input/textarea/select under .notebook-band that is
// actually visible (getClientRects().length > 0), with the fields this
// probe needs to reason about a control's role and its computed text size.
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
        textEntry,
      };
    });
}

async function openRename(page) {
  const renameButton = await page.$$eval('.notebook-band button', (buttons) => buttons.findIndex((b) => b.textContent.trim() === 'Rename'));
  await page.click('.notebook-band button >> nth=' + renameButton);
}

async function readRenameFlow(browser, appUrl, { width, coarse }) {
  const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, coarse });
  try {
    await openRename(page);
    await page.waitForSelector('.notebook-field .ink-field');
    return await page.evaluate(readNotebookFields);
  } finally {
    await context.close();
  }
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
    const modes = [
      { width: 393, coarse: true },
      { width: 1366, coarse: false },
    ];

    for (const mode of modes) {
      const fields = await readRenameFlow(browser, appUrl, mode);
      console.log(JSON.stringify({ flow: 'rename', mode, fields }));

      const textEntryFields = fields.filter((f) => f.textEntry);
      const labels = textEntryFields.map((f) => f.ariaLabel).sort();
      countedCheck(
        labels.length === 2 && labels[0] === 'Recipe description' && labels[1] === 'Recipe name',
        `rename ${JSON.stringify(mode)}: exactly two text-entry controls, Recipe name and Recipe description (got ${JSON.stringify(labels)})`,
      );

      for (const field of textEntryFields) {
        if (mode.coarse) {
          countedCheck(
            parseFloat(field.fontSize) >= 16,
            `rename ${JSON.stringify(mode)}: ${field.ariaLabel} font-size at least 16px under coarse (got ${field.fontSize})`,
          );
        } else {
          const baseline = FINE_BASELINE_PX[field.ariaLabel];
          countedCheck(
            field.fontSize === baseline,
            `rename ${JSON.stringify(mode)}: ${field.ariaLabel} font-size equals fine baseline ${baseline} (got ${field.fontSize})`,
          );
        }
      }
    }
  } finally {
    await browser.close();
    await close();
  }

  finish(failures, checkCount, 'field zoom probe');
}

await main();
