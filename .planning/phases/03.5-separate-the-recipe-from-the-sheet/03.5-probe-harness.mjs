// 03.5-10: a no-Vite measuring harness for the recipe route's derived width
// ladder. Serves app/dist (the build) and the repo root (for the sketch 011
// boards) on 127.0.0.1, over ephemeral ports it closes itself in finish() —
// never Mark's own `vite preview --host` on :4173, which this harness never
// touches (decisions_recorded 6). Every request whose host is not
// 127.0.0.1 is aborted, so no third-party asset (the boards' Google Fonts
// link) is ever fetched into a measured page (T-03.5-69/26).
//
// Plain Node ESM: playwright-core (absolute path, copied from
// 260925-u3r-probe.mjs), node:http, node:fs and node:path only. It never
// spawns a process.
import { chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Three directories up from this file's own directory: phases/03.5-.../ ->
// phases/ -> .planning/ -> repo root. Resolved from the file's own URL so
// this works from any worktree, not just the one that authored it.
export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

export const APP_ROUTE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89';

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
};

function contentTypeFor(filePath) {
  return CONTENT_TYPES[path.extname(filePath)] ?? 'application/octet-stream';
}

// Creates one static server rooted at `root`. When `spaFallback` is true, a
// request path with no file extension that does not resolve to a file
// serves root/index.html instead (the app's own client-side routing).
function createStaticServer(root, { spaFallback = false } = {}) {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      let relPath = decodeURIComponent(url.pathname);
      let filePath = path.join(root, relPath);

      const isExistingFile = (candidate) => existsSync(candidate) && statSync(candidate).isFile();

      const hasExtension = path.extname(relPath) !== '';
      if (spaFallback && !hasExtension && !isExistingFile(filePath)) {
        filePath = path.join(root, 'index.html');
      }

      if (!isExistingFile(filePath) || !filePath.startsWith(root)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const body = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': contentTypeFor(filePath) });
      res.end(body);
    } catch (err) {
      res.writeHead(500);
      res.end(String(err));
    }
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve(`http://127.0.0.1:${port}`);
    });
  });
}

// Two throwaway static servers on ephemeral 127.0.0.1 ports: `app` serves
// the build (REPO_ROOT/app/dist, SPA fallback for client-side routes),
// `repo` serves the whole repo tree (for the sketch 011 boards under
// .planning/sketches/). Neither binds --host or 0.0.0.0 (T-03.5-69).
export async function startServers() {
  const appServer = createStaticServer(path.join(REPO_ROOT, 'app', 'dist'), { spaFallback: true });
  const repoServer = createStaticServer(REPO_ROOT);

  const appUrl = await listen(appServer);
  const repoUrl = await listen(repoServer);

  return {
    appUrl,
    repoUrl,
    close: () =>
      Promise.all([
        new Promise((resolve) => appServer.close(resolve)),
        new Promise((resolve) => repoServer.close(resolve)),
      ]),
  };
}

export async function launch() {
  return chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
}

// Blocks every request whose host is not 127.0.0.1 (T-03.5-70) — the boards'
// Google Fonts link included; Caveat resolves from app/public/fonts.
async function blockThirdPartyRequests(context) {
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') {
      route.continue();
    } else {
      route.abort();
    }
  });
}

// Opens the app at `path` in a new context at `{ width, height, coarse }`.
// Waits for .shell (and .notebook on a /notebook path), then throws unless
// matchMedia('(pointer: coarse)').matches matches the requested `coarse`.
export async function openApp(browser, appUrl, routePath, { width, height = 1100, coarse = false } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    hasTouch: coarse,
    isMobile: coarse,
    deviceScaleFactor: coarse ? 3 : 1,
  });
  await blockThirdPartyRequests(context);
  const page = await context.newPage();
  await page.goto(`${appUrl}${routePath}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.shell');
  if (routePath.startsWith('/notebook')) {
    await page.waitForSelector('.notebook');
  }

  const actualCoarse = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);
  if (actualCoarse !== coarse) {
    await context.close();
    const err = new Error(
      `openApp: expected (pointer: coarse) to be ${coarse}, got ${actualCoarse} for ${routePath} at ${width}x${height}`,
    );
    err.name = 'PointerModeMismatch';
    throw err;
  }

  return { context, page };
}

// Opens a sketch 011 board at the width and pointer it was drawn for
// (G-03.5-8c; Mark, UAT item 4: "switch to matched widths"), the way the app
// is measured. `file` resolves against .planning/sketches/011-recipe-route-c/
// exactly as the URL does, so '../011-options-counts/x.html' works.
//  - width: the board file's own data-props `$preview.width` (gen.py writes it
//    on every board, the multi-panel count boards included). A file without it
//    fails, naming the file, rather than defaulting to a guess.
//  - coarse: true exactly when the file name carries 393, the boards drawn for
//    the iPhone. Every other board draws fine-pointer sizes.
//  - height: 1100, as openApp.
// An explicit { width, coarse } overrides either default. A coarse context
// mirrors openApp: hasTouch, isMobile, deviceScaleFactor 3, and the same
// matchMedia assertion. The count boards open at their page width, not at
// 393: their panels carry their own fixed widths inline.
const BOARD_DIR = path.join(REPO_ROOT, '.planning', 'sketches', '011-recipe-route-c');

async function drawnWidthOf(file) {
  const boardPath = path.resolve(BOARD_DIR, file);
  if (!boardPath.startsWith(path.join(REPO_ROOT, '.planning', 'sketches') + path.sep)) {
    throw new Error(`openBoard: ${file} resolves outside .planning/sketches`);
  }
  const html = await readFile(boardPath, 'utf8');
  const match = html.match(/"\$preview"\s*:\s*\{\s*"width"\s*:\s*(\d+)/);
  if (!match) throw new Error(`openBoard: ${boardPath} carries no $preview width in its data-props`);
  return Number(match[1]);
}

export async function openBoard(browser, repoUrl, file, { width, height = 1100, coarse } = {}) {
  const drawnWidth = width ?? (await drawnWidthOf(file));
  const wantCoarse = coarse ?? path.basename(file).includes('393');
  const context = await browser.newContext({
    viewport: { width: drawnWidth, height },
    hasTouch: wantCoarse,
    isMobile: false,
    deviceScaleFactor: wantCoarse ? 3 : 1,
  });
  await blockThirdPartyRequests(context);
  const page = await context.newPage();
  await page.goto(`${repoUrl}/.planning/sketches/011-recipe-route-c/${file}`, { waitUntil: 'networkidle' });

  const actualCoarse = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);
  if (actualCoarse !== wantCoarse) {
    await context.close();
    const err = new Error(
      `openBoard: expected (pointer: coarse) to be ${wantCoarse}, got ${actualCoarse} for ${file} at ${drawnWidth}x${height}`,
    );
    err.name = 'PointerModeMismatch';
    throw err;
  }
  return { context, page };
}

// recordAnotherBatch(page, isoDate) — a UI-driven save in the harness's own
// throwaway browser context (03.5-17 Task 1): activates "Record another" (a
// batch already exists) or "Record a batch" (the no-batch state), fills the
// Churn date field with isoDate, activates the FIRST "Save batch" — both the
// record pen's foot (PenFoot) and the end-of-record ceremony (BatchRow's own
// SaveCeremony) mount the identical control while recording, so two "Save
// batch" buttons exist on the page — and waits for the saved batch's own
// route and head. The caller may already be sitting on a `/batch/…` URL
// (recording another one), so the wait is for the URL to CHANGE away from
// its own value at click time, not merely for a `/batch/` URL to exist —
// the latter is already true before the save and would resolve instantly.
// Never touches Mark's :4173 preview or his own browser profile
// (T-03.5-44) — the caller's page/context is this file's own openApp()
// result, on 127.0.0.1.
export async function recordAnotherBatch(page, isoDate) {
  const urlBeforeSave = page.url();
  await page.getByRole('button', { name: /^Record (another|a batch)$/ }).first().click();
  await page.getByLabel('Churn date').fill(isoDate);
  await page.getByRole('button', { name: 'Save batch' }).first().click();
  await page.waitForFunction((prev) => window.location.href !== prev, urlBeforeSave);
  await page.waitForSelector('h2.region-name:has-text("Batch")');
}

// saveNextVersion(page, name) — a UI-driven fork in the harness's own
// throwaway browser context (03.5-18 Task 1): activates "Next version" (the
// reading view's own opener, VersionRow.jsx), fills the Version name field,
// activates "Save as a new version", and waits for the saved child's own
// route and identity heading. The same "wait for the URL to CHANGE" pattern
// as recordAnotherBatch above (WR-01/single-target precedent) — a fresh
// save always lands on a URL distinct from the one it started on, so this
// is correct even the first time it is called from APP_ROUTE. Never touches
// Mark's :4173 preview or his own browser profile (T-03.5-44) — the
// caller's page/context is this file's own openApp() result, on 127.0.0.1.
export async function saveNextVersion(page, name) {
  const urlBeforeSave = page.url();
  await page.getByRole('button', { name: 'Next version' }).first().click();
  await page.getByLabel('Version name').fill(name);
  await page.getByRole('button', { name: 'Save as a new version' }).click();
  await page.waitForFunction((prev) => window.location.href !== prev, urlBeforeSave);
  await page.waitForSelector('h2.notebook-version__identity');
}

export function check(failures, condition, label) {
  if (!condition) failures.push(`FAIL ${label}`);
}

export function finish(failures, count, name) {
  for (const failure of failures) {
    console.log(failure);
  }
  if (failures.length > 0) {
    console.log(`${name}: ${failures.length} failed`);
    process.exitCode = 1;
  } else {
    console.log(`${name}: ${count} checks passed`);
  }
}
