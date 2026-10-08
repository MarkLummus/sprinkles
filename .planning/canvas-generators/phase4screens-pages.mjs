// Sid, 2026-10-07: renders the approved printed pages to pictures for the print route board (the route shows the pages as they will print; the pages are the canvas's, not redrawn here).
//   node phase4screens-pages.mjs <dir holding project/*.dc.html as read from the artifact root>  -> phase4screens-pages.json  { log1, log2, sheet1, sheet2, sheet3: data URIs (png, 2x), h: heights }
// 2026-10-07 (README D27): the pages are the canvas boards as they stand after D16 to D26 (BatchLogForm, TastingLogForm, PrintStartingPointBalanceCol2, MethodPrintPage1, MethodPrintPage2), not sketch 010's older files.
// 2026-10-08 (README D29, Mark: "draw the real break"): the three Sheet pictures are SheetPrintPage1, 2 and 3, the real pages of Olive Oil v1 (its table breaks; sheetpages.py), so the Sheet's closing foot is the board's own markup and is no longer added here;
//   MethodPrintPage1 and 2 are the variant for a table that fits and no longer appear on the route.
// WebKit, 816 wide; every picture 1056 tall (letter). The Sheet is the top 1056 of its board (its page breaks are the browser's and Phase 4's, so this is the first screen of paper, not a claimed page).
// 2026-10-08 (README D28, Mark's answer on decide-route-sheet-foot): the Sheet's closing foot (D7) is drawn under the method's page 2: the log foot's words without the side label, in flow after the last step, the log foot's own rule, face and size (.lf-foot). The board MethodPrintPage2 is not changed.
// The log pages' foot carries "[short code]" as a placeholder; here it reads the route line's example code so the line and the pages agree (the boards are not changed).
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const SRC = path.resolve(process.argv[2]);
const FONT = 'file://' + path.resolve(HERE, '..', '..', 'app', 'public', 'fonts', 'caveat-regular.woff2'); const CODE = 'K7QM-2X9D';
const TMP = path.join(SRC, 'pages-tmp'); await mkdir(TMP, { recursive: true });
const b = await webkit.launch(); const out = { h: {} };
for (const [k, f] of [['log1', 'BatchLogForm'], ['log2', 'TastingLogForm'], ['sheet1', 'SheetPrintPage1'], ['sheet2', 'SheetPrintPage2'], ['sheet3', 'SheetPrintPage3']]) {
  let s = await readFile(path.join(SRC, 'project', f + '.dc.html'), 'utf8');
  s = s.replace('<script src="./support.js"></script>\n', '').replace('<script src="./support.js"></script>', '').replaceAll('/_blob/37ac467ba5558024f5fb5a2e5c22a7bc', FONT).replaceAll('[short code]', CODE);
  const fp = path.join(TMP, f + '.html'); await writeFile(fp, s);
  const ctx = await b.newContext({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 2 }); const p = await ctx.newPage();
  await p.goto('file://' + fp, { waitUntil: 'load' }); await p.waitForTimeout(500); await p.evaluate(() => document.fonts.ready);
  const buf = await p.screenshot({ clip: { x: 0, y: 0, width: 816, height: 1056 }, fullPage: true });
  out[k] = 'data:image/png;base64,' + buf.toString('base64'); out.h[k] = 1056; console.log(k, buf.length);
  await ctx.close();
}
await b.close(); await writeFile(path.join(HERE, 'phase4screens-pages.json'), JSON.stringify(out)); process.exit(0);
