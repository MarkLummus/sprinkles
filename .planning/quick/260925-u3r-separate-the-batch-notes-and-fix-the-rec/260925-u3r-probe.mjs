// 260925-u3r probe: measures the batch log's notes and a fixed set of
// regression geometry on the recipe route, in a real browser (Chrome via
// playwright-core), at five widths. Re-runnable: run once with no
// beforeJson to take a baseline, then again with beforeJson to check the
// notes are separated and nothing else moved.
//
// Usage: node 260925-u3r-probe.mjs <baseUrl> <outJson> <shotDir> [beforeJson]
import { chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';

const [, , baseUrl, outJson, shotDir, beforeJson] = process.argv;

if (!baseUrl || !outJson || !shotDir) {
  console.error('Usage: node 260925-u3r-probe.mjs <baseUrl> <outJson> <shotDir> [beforeJson]');
  process.exit(1);
}

const ROUTE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const WIDTHS = [393, 760, 1024, 1100, 1366];
const VIEWPORT_HEIGHT = 1100;

mkdirSync(shotDir, { recursive: true });

function round1(n) {
  return Math.round(n * 10) / 10;
}

async function readWidth(browser, width) {
  const context = await browser.newContext({ viewport: { width, height: VIEWPORT_HEIGHT } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}${ROUTE}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const reading = await page.evaluate(() => {
    function round1(n) {
      return Math.round(n * 10) / 10;
    }
    function rect(el) {
      const r = el.getBoundingClientRect();
      return {
        top: round1(r.top + window.scrollY),
        left: round1(r.left + window.scrollX),
        width: round1(r.width),
        height: round1(r.height),
      };
    }
    function regionRect(selector) {
      const el = document.querySelector(selector);
      return el ? rect(el) : null;
    }

    const recipePage = document.querySelector('.recipe-page');
    const gtc = recipePage ? getComputedStyle(recipePage).gridTemplateColumns : null;

    const regions = {
      '.notebook-body__sheet': regionRect('.notebook-body__sheet'),
      '.ingredient-table-region': regionRect('.ingredient-table-region'),
      '.method-region': regionRect('.method-region'),
      '.side-region': regionRect('.side-region'),
    };

    const logEl = document.querySelector('.notebook-log');
    let log = null;
    if (logEl) {
      const r = logEl.getBoundingClientRect();
      log = {
        top: round1(r.top + window.scrollY),
        left: round1(r.left + window.scrollX),
        width: round1(r.width),
      };
    }

    const headers = [...document.querySelectorAll('.ingredient-table thead th')].map((th) => {
      const r = th.getBoundingClientRect();
      return {
        text: th.textContent.trim(),
        left: round1(r.left + window.scrollX),
        right: round1(r.right + window.scrollX),
      };
    });

    let maxNameCellH = 0;
    for (const td of document.querySelectorAll('td.ingredient-table__col-name')) {
      const h = td.getBoundingClientRect().height;
      if (h > maxNameCellH) maxNameCellH = h;
    }
    maxNameCellH = round1(maxNameCellH);

    let portionLines = null;
    const portionNote = [...document.querySelectorAll('.ingredient-table__portion-note')].find((el) =>
      el.textContent.includes('12 g of 76.0 g'),
    );
    if (portionNote) {
      const range = document.createRange();
      range.selectNodeContents(portionNote);
      const rects = [...range.getClientRects()];
      const tops = new Set(rects.map((r) => Math.round(r.top)));
      portionLines = tops.size;
    }

    // Notes.
    let notes = null;
    const cellsEl = document.querySelector('.notebook-log .batch-margin .batch-row__cells');
    if (cellsEl) {
      const cellsRect = (() => {
        const r = cellsEl.getBoundingClientRect();
        return {
          top: round1(r.top + window.scrollY),
          left: round1(r.left + window.scrollX),
          width: round1(r.width),
          height: round1(r.height),
        };
      })();
      const cellsBottom = round1(cellsRect.top + cellsRect.height);

      const itemEls = [
        ...document.querySelectorAll(
          '.notebook-log .batch-margin > .app-hand, .notebook-log .batch-row__notes > .app-hand',
        ),
      ];
      const items = itemEls.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          className: el.className,
          text: el.textContent,
          top: round1(r.top + window.scrollY),
          bottom: round1(r.top + window.scrollY + r.height),
          left: round1(r.left + window.scrollX),
          width: round1(r.width),
          height: round1(r.height),
        };
      });

      const gapCellsToFirst = items.length > 0 ? round1(items[0].top - cellsBottom) : null;
      const gapBetween = items.length > 1 ? round1(items[1].top - items[0].bottom) : null;
      const sameLine = items.length > 1 ? items[0].top === items[1].top : null;

      notes = {
        cells: cellsRect,
        cellsBottom,
        items,
        gapCellsToFirst,
        gapBetween,
        sameLine,
      };
    }

    return {
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      gtc,
      regions,
      log,
      headers,
      maxNameCellH,
      portionLines,
      notes,
    };
  });

  await page.locator('.notebook-log section.batch-row').first().screenshot({
    path: `${shotDir}/${width}-log.png`,
  });
  await page.screenshot({ path: `${shotDir}/${width}-page.png` });

  await context.close();
  return reading;
}

const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });

const readings = {};
for (const width of WIDTHS) {
  readings[width] = await readWidth(browser, width);
}

await browser.close();

const output = {
  route: ROUTE,
  takenAt: new Date().toISOString(),
  readings,
};

writeFileSync(outJson, JSON.stringify(output, null, 2));

if (beforeJson) {
  const before = JSON.parse(readFileSync(beforeJson, 'utf8'));
  const failures = [];

  for (const width of WIDTHS) {
    const after = readings[width];
    const beforeReading = before.readings[String(width)] ?? before.readings[width];

    // Notes checks.
    const notes = after.notes;
    if (!notes || notes.items.length !== 2) {
      failures.push(`width ${width}: notes.items expected length 2, got ${notes ? notes.items.length : 'null'}`);
    } else {
      if (!notes.items.every((item) => item.tag === 'P')) {
        failures.push(`width ${width}: notes.items expected both P, got ${notes.items.map((i) => i.tag).join(',')}`);
      }
      if (notes.sameLine !== false) {
        failures.push(`width ${width}: notes.sameLine expected false, got ${notes.sameLine}`);
      }
      if (Math.abs(notes.gapCellsToFirst - 18) > 0.5) {
        failures.push(`width ${width}: notes.gapCellsToFirst expected ~18, got ${notes.gapCellsToFirst}`);
      }
      if (Math.abs(notes.gapBetween - 4) > 0.5) {
        failures.push(`width ${width}: notes.gapBetween expected ~4, got ${notes.gapBetween}`);
      }
    }

    // Regression checks.
    if (!beforeReading) {
      failures.push(`width ${width}: no before reading found`);
      continue;
    }
    if (after.scrollWidth !== beforeReading.scrollWidth) {
      failures.push(`width ${width}: scrollWidth changed, before ${beforeReading.scrollWidth}, after ${after.scrollWidth}`);
    }
    if (after.gtc !== beforeReading.gtc) {
      failures.push(`width ${width}: gtc changed, before "${beforeReading.gtc}", after "${after.gtc}"`);
    }
    for (const regionName of Object.keys(beforeReading.regions ?? {})) {
      const b = beforeReading.regions[regionName];
      const a = after.regions[regionName];
      if (!b || !a) {
        if (b !== a) failures.push(`width ${width}: region ${regionName} presence changed`);
        continue;
      }
      for (const field of ['top', 'left', 'width', 'height']) {
        if (Math.abs(a[field] - b[field]) > 0.5) {
          failures.push(`width ${width}: region ${regionName}.${field} changed, before ${b[field]}, after ${a[field]}`);
        }
      }
    }
    if (beforeReading.log && after.log) {
      for (const field of ['top', 'left', 'width']) {
        if (Math.abs(after.log[field] - beforeReading.log[field]) > 0.5) {
          failures.push(`width ${width}: log.${field} changed, before ${beforeReading.log[field]}, after ${after.log[field]}`);
        }
      }
    }
    const beforeHeaders = beforeReading.headers ?? [];
    const afterHeaders = after.headers ?? [];
    if (beforeHeaders.length !== afterHeaders.length) {
      failures.push(`width ${width}: header count changed, before ${beforeHeaders.length}, after ${afterHeaders.length}`);
    } else {
      for (let i = 0; i < beforeHeaders.length; i++) {
        const b = beforeHeaders[i];
        const a = afterHeaders[i];
        if (a.text !== b.text) {
          failures.push(`width ${width}: header[${i}].text changed, before "${b.text}", after "${a.text}"`);
        }
        if (Math.abs(a.left - b.left) > 0.5) {
          failures.push(`width ${width}: header[${i}].left changed, before ${b.left}, after ${a.left}`);
        }
        if (Math.abs(a.right - b.right) > 0.5) {
          failures.push(`width ${width}: header[${i}].right changed, before ${b.right}, after ${a.right}`);
        }
      }
    }
    if (Math.abs(after.maxNameCellH - beforeReading.maxNameCellH) > 0.5) {
      failures.push(`width ${width}: maxNameCellH changed, before ${beforeReading.maxNameCellH}, after ${after.maxNameCellH}`);
    }
    if (after.portionLines !== beforeReading.portionLines) {
      failures.push(`width ${width}: portionLines changed, before ${beforeReading.portionLines}, after ${after.portionLines}`);
    }
    if (beforeReading.notes && after.notes) {
      for (const field of ['top', 'left', 'width', 'height']) {
        if (Math.abs(after.notes.cells[field] - beforeReading.notes.cells[field]) > 0.5) {
          failures.push(
            `width ${width}: notes.cells.${field} changed, before ${beforeReading.notes.cells[field]}, after ${after.notes.cells[field]}`,
          );
        }
      }
    }
  }

  if (failures.length > 0) {
    for (const f of failures) console.error(f);
    process.exit(1);
  } else {
    console.log('checks passed');
  }
}
