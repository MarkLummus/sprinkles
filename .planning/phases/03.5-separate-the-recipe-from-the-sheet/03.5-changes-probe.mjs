// 03.5-19: Show changes on the built app, for the seeded children that add a
// step their parent lacks (G-03.5-2a). Imports the plan-10 harness unchanged.
//
// Usage: node 03.5-changes-probe.mjs <groups> <widths>
//   groups: comma list, currently `changes`
//   widths: comma list, e.g. 393,1366 (coarse exactly at 393)
import { startServers, launch, openApp, check, finish } from './03.5-probe-harness.mjs';

const [, , groupsArg, widthsArg] = process.argv;

if (!groupsArg || !widthsArg) {
  console.error('Usage: node 03.5-changes-probe.mjs <groups> <widths>');
  process.exit(1);
}

const groups = new Set(groupsArg.split(','));
const widths = widthsArg.split(',').map(Number);

// Seeded children whose method carries a step absent from the parent's, and
// the step number that is new (diagnosis: .planning/debug/show-changes-textfrom-null.md).
const ROUTES = [
  { route: '/notebook/mexican-chocolate/mexican-chocolate-v4', newStep: 2 },
  { route: '/notebook/mexican-chocolate/mexican-chocolate-v2', newStep: 2 },
  { route: '/notebook/mocha/mocha-v1', newStep: 1 },
];

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
    if (groups.has('changes')) {
      for (const width of widths) {
        const coarse = width === 393;
        for (const { route, newStep } of ROUTES) {
          const { context, page } = await openApp(browser, appUrl, route, { width, coarse });
          const where = `changes width=${width} ${route}`;
          try {
            const pageErrors = [];
            page.on('pageerror', (err) => pageErrors.push(String(err)));

            const heading = await page.waitForSelector('h2.notebook-version__identity', { timeout: 5000 }).catch(() => null);
            if (!heading) {
              throw new Error(`changes probe: ${route} shows no h2.notebook-version__identity — has the seed changed?`);
            }

            await page.getByRole('button', { name: 'Show changes' }).first().click();
            await page.getByRole('button', { name: 'Hide changes' }).first().waitFor({ timeout: 5000 }).catch(() => {});

            const after = await page.evaluate((n) => {
              const step = document.getElementById(`method-step-${n}`);
              return {
                errorText: document.body.textContent.includes('Unexpected Application Error'),
                hasHide: [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Hide changes'),
                stepExists: !!step,
                stepStruck: step ? step.querySelectorAll('.prose-struck-beneath').length : -1,
              };
            }, newStep);

            countedCheck(pageErrors.length === 0, `${where}: no page error (${pageErrors.join(' | ')})`);
            countedCheck(!after.errorText, `${where}: no 'Unexpected Application Error' after Show changes`);
            countedCheck(after.hasHide, `${where}: the button now reads 'Hide changes'`);
            countedCheck(after.stepExists, `${where}: #method-step-${newStep} exists`);
            countedCheck(after.stepStruck === 0, `${where}: #method-step-${newStep} holds no .prose-struck-beneath`);

            if (after.hasHide) {
              await page.getByRole('button', { name: 'Hide changes' }).first().click();
              await page.getByRole('button', { name: 'Show changes' }).first().waitFor({ timeout: 5000 }).catch(() => {});
              const back = await page.evaluate(() =>
                [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Show changes'),
              );
              countedCheck(back, `${where}: Hide changes brings back 'Show changes'`);
            }
          } finally {
            await context.close();
          }
        }
      }
    }
  } finally {
    await browser.close();
    await close();
  }

  finish(failures, checkCount, 'changes probe');
}

await main();
