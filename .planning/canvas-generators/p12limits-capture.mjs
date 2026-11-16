// Hicks for Sid, 2026-11-16 (quick 261116-80u; Mark's word limits of 2026-11-16, 12-UI-REVIEW.md finding 2 option b): captures the built creation editor's Setup column (aside.notebook-log) after a
// refused Save with an over-long scale name, an at-limit low end, an over-long high end and an over-long problem, so the board P12_WordLimits (p12limits.py) is drawn from the build.
//   node p12limits-capture.mjs <dist>   -> p12limits-capture.json
// <dist> is a scratch build (npx vite build --outDir <dir> --emptyOutDir from app/); there is no default, so this never serves app/dist (Mark's own `vite preview --host` serves that one).
// WebKit, coarse pointer, 1366 x 1024, the build served on a throwaway 127.0.0.1 port through 08-walk-server.mjs (every other host aborted; no Vite process). The draft is
// 12-cases.mjs's OVERLONG_DRAFT, laid in this context's own throwaway IndexedDB the way 12-board-check.mjs seeds a panel's draft; /notebook/new is opened, Save is pressed, and what is
// baked is the build's own Setup column. Expect exactly three sentences: 'Use 16 characters or fewer.' (Name), 'Use 12 characters or fewer.' (High end), 'Use 40 characters or fewer.'
// (Problem 1's Name); anything else stops the run. The clock is fixed at 4 Aug 2026.
import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { startServers } from '../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { OVERLONG_DRAFT } from '../phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-cases.mjs';
import { blankCreateDraft, buildDraftRecord } from '../../app/src/domain/draft.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLAYWRIGHT_CORE = process.env.PLAYWRIGHT_CORE ?? '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
if (!existsSync(PLAYWRIGHT_CORE)) {
  console.log(`FAIL playwright-core not found at ${PLAYWRIGHT_CORE}`);
  process.exit(1);
}
const { webkit } = await import(PLAYWRIGHT_CORE);
if (!process.argv[2]) {
  console.log('FAIL usage: node p12limits-capture.mjs <scratch dist>; this script never serves app/dist');
  process.exit(1);
}
const DIST = path.resolve(process.argv[2]);
if (!existsSync(path.join(DIST, 'index.html'))) {
  console.log(`FAIL no index.html in ${DIST}`);
  process.exit(1);
}
const WANT = ['Use 16 characters or fewer.', 'Use 12 characters or fewer.', 'Use 40 characters or fewer.'];
const NOW = '2026-08-04T12:00:00.000Z';

// textarea values into text, the checked radio into its attribute (as p12-capture.mjs bakes)
const bake = (sel) => {
  const root = document.querySelector(sel);
  for (const i of root.querySelectorAll('input')) {
    if (i.type === 'radio' || i.type === 'checkbox') {
      if (i.checked) i.setAttribute('checked', '');
      else i.removeAttribute('checked');
    } else i.setAttribute('value', i.value);
  }
  for (const t of root.querySelectorAll('textarea')) t.textContent = t.value;
  return root.outerHTML;
};

const cropOf = () => {
  const r1 = (n) => Math.round(n * 10) / 10;
  const aside = document.querySelector('aside.notebook-log').getBoundingClientRect();
  const a = document.querySelector('section[aria-label="Scales"]').getBoundingClientRect();
  const b = document.querySelector('section[aria-label="Problems"]').getBoundingClientRect();
  return { top: r1(a.top - aside.top), bottom: r1(b.bottom - aside.top), height: r1(b.bottom - a.top), width: r1(aside.width) };
};

const { appUrl, close } = await startServers({ appRoot: DIST });
const browser = await webkit.launch();
const out = { dist: DIST, at: new Date().toISOString() };
try {
  const context = await browser.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: true, deviceScaleFactor: 1 });
  await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  await page.clock.setFixedTime(new Date('2026-08-04T12:00:00'));
  await page.goto(`${appUrl}/notebook`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.shell');
  await page.evaluate(() => document.fonts.ready);
  const versionId = 'vanilla-v1';
  const payload = { ...blankCreateDraft({ recipeId: 'vanilla', versionId, name: 'Vanilla' }), ...OVERLONG_DRAFT };
  const record = buildDraftRecord({ versionId, kind: 'create', payload, now: NOW });
  await page.evaluate(async (row) => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('sprinkles');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction('drafts', 'readwrite');
        tx.objectStore('drafts').put(row);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  }, record);
  await page.goto(`${appUrl}/notebook/new`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.notebook.mk-page');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  // The first click after a navigation can miss: press Save until the sentences stand.
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
  const texts = await page.evaluate(() => [...document.querySelectorAll('aside.notebook-log .field-error')].map((e) => e.textContent));
  if (JSON.stringify(texts) !== JSON.stringify(WANT)) {
    console.log(`FAIL the build shows ${JSON.stringify(texts)}, not ${JSON.stringify(WANT)}`);
    process.exit(1);
  }
  out.html = await page.evaluate(bake, 'aside.notebook-log');
  out.crop = await page.evaluate(cropOf);
  out.fieldErrors = texts;
  await context.close();
} finally {
  await browser.close();
  await close();
}
await writeFile(path.join(HERE, 'p12limits-capture.json'), JSON.stringify(out, null, 1));
console.log('crop', JSON.stringify(out.crop), 'errors', JSON.stringify(out.fieldErrors));
process.exit(0);
