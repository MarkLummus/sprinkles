// Sid, 2026-10-04 (decision 38): captures the built app's shell for the App-radius board: Home (rail, lead block, filled and outline actions) and the Next version pen (ceremony fields), 1600 fine pointer.
//   node radius-capture.mjs  -> radius-capture.json
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const servers = await startServers(); const browser = await webkit.launch(); const out = {};
for (const [state, route] of [['home', '/'], ['mex3pen', '/notebook/mexican-chocolate/mexican-chocolate-v3']]) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await ctx.newPage(); page.setDefaultTimeout(10000);
  await page.goto(servers.appUrl + route, { waitUntil: 'networkidle' }); await page.waitForSelector('.shell');
  if (state.endsWith('pen')) { await page.getByRole('button', { name: 'Next version' }).first().click(); await page.waitForSelector('.notebook-ceremony__why'); await page.waitForTimeout(250); }
  await page.waitForTimeout(150);
  out[`${state}_1600`] = await page.evaluate(async () => { await document.fonts.ready; return document.querySelector('.shell').outerHTML; });
  await ctx.close();
}
await browser.close(); await servers.close();
await writeFile(path.join(HERE, 'radius-capture.json'), JSON.stringify(out)); console.log(Object.keys(out).join(' ')); process.exit(0);
