// Quick task 261001-doi's probe: reads the Tab order, the Tab stops per radio
// group and the arrow-key behaviour of the batch record pen, in Playwright's
// WebKit and in Chromium, against the checkout's app/dist (the build). Takes no
// arguments: `node 261001-doi-tab-probe.mjs`. Serves the build through the 03.5
// harness's own ephemeral 127.0.0.1 servers and never touches Mark's :4173
// preview. A WebKit reading is evidence about the engine, not about Mark's
// iPad; the device is his to check.
//
// Reading A: from Churn duration, Tab to Save batch, collapsed by radio group
// name, against the brief's eight stops. Reading B: Tab stops per radio group,
// nothing picked and Exit consistency picked. Reading C: ArrowRight,
// ArrowRight, ArrowLeft in the Exit consistency group. Reading D: the same
// span with the tasting open, reduced to its button and radio stops, WebKit's
// list against Chromium's. Reading E: Tab stops on the Hardness axis group,
// nothing picked and the 3 stop picked. Reading F: the arrow keys in the
// Hardness group.
//
// WebKit is created through a context built here, not through openApp: openApp
// asserts a pointer mode and is written against Chromium.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, check, finish, APP_ROUTE } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

// Reads the focused element, in the page. A radio is keyed by its group name.
function readActive() {
  const el = document.activeElement;
  if (!el || el === document.body) return { tag: 'body', type: '', name: '', label: 'body' };
  const tag = el.tagName.toLowerCase();
  const type = el.getAttribute('type') || '';
  const name = el.getAttribute('name') || '';
  const text = (el.textContent || '').trim().slice(0, 24);
  const label = el.getAttribute('aria-label') || name || text || tag;
  return { tag, type, name, label };
}

const stopKey = (stop) => (stop.type === 'radio' ? `radio:${stop.name}` : stop.label);

// One entry per run of consecutive stops sharing a key, with its stop count.
function collapse(stops) {
  const out = [];
  for (const stop of stops) {
    const key = stopKey(stop);
    const last = out[out.length - 1];
    if (last && last.key === key) last.stops += 1;
    else out.push({ key, stops: 1 });
  }
  return out;
}

const keyMatches = (key, expected) => key === expected || (expected.startsWith('radio:') && key.startsWith(expected));
const sameList = (keys, expected) =>
  keys.length === expected.length && keys.every((key, index) => keyMatches(key, expected[index]));

async function openPen(browser, appUrl, { tasting = false } = {}) {
  const context = await browser.newContext({
    viewport: { width: 1366, height: 1024 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 2,
  });
  await context.route('**/*', (route) =>
    new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort(),
  );
  const page = await context.newPage();
  await page.goto(appUrl + APP_ROUTE, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Record another' }).first().click();
  if (tasting) await page.getByRole('button', { name: 'Add tasting' }).first().click();
  return { context, page };
}

// Presses Tab from the focused element until `done(stop)` holds or `max`
// presses have passed; returns every stop read, the last one included.
async function tabSpan(page, done, max) {
  const stops = [];
  for (let i = 0; i < max; i += 1) {
    await page.keyboard.press('Tab');
    const stop = await page.evaluate(readActive);
    stops.push(stop);
    if (done(stop)) break;
  }
  return stops;
}

const isSaveBatch = (stop) => stop.tag === 'button' && stop.label === 'Save batch';
const CHURN = 'input[aria-label="Churn duration, minutes"]';

const EXPECTED_A = [
  'radio:segment-exit-consistency',
  'radio:segment-airiness',
  'At the machine',
  'Ingredient notes',
  'Next time',
  'Add tasting',
  'Cancel',
  'Save batch',
];

const stopsOn = (stops, prefix) => stops.filter((s) => s.type === 'radio' && s.name.startsWith(prefix)).length;

async function readGroup(page, groupName) {
  return page.evaluate((n) => {
    const radios = [...document.querySelectorAll(`input[type="radio"][name="${n}"]`)];
    const checked = radios.filter((r) => r.checked);
    const active = document.activeElement;
    return {
      checkedCount: checked.length,
      checked: checked.length ? checked[0].value : null,
      focused: active && active.type === 'radio' && active.name === n ? active.value : null,
    };
  }, groupName);
}

// Tab from Churn duration until a radio named `prefix` is focused (at most
// `max` presses), then ArrowRight, ArrowRight, ArrowLeft: after every press
// exactly one radio is checked, it is the focused one, and it is not the one
// before. Returns the readings.
async function arrowReading(page, engine, label, prefix, max) {
  await page.locator(CHURN).focus();
  const stops = await tabSpan(page, (s) => s.type === 'radio' && s.name.startsWith(prefix), max);
  const reached = stops.length > 0 && stops[stops.length - 1].type === 'radio' && stops[stops.length - 1].name.startsWith(prefix);
  countedCheck(reached, `${engine}: Tab from Churn duration reaches the ${label} radio group within ${max} presses (read ${JSON.stringify(stops.map(stopKey))})`);
  if (!reached) return [];
  const groupName = stops[stops.length - 1].name;
  const readings = [];
  let previous = null;
  for (const key of ['ArrowRight', 'ArrowRight', 'ArrowLeft']) {
    await page.keyboard.press(key);
    const reading = await readGroup(page, groupName);
    readings.push({ key, ...reading });
    countedCheck(
      reading.checkedCount === 1 && reading.checked !== null && reading.checked === reading.focused && reading.checked !== previous,
      `${engine}: ${label} ${key} leaves exactly one radio checked, the focused one, changed from ${previous} (read ${JSON.stringify(reading)})`,
    );
    previous = reading.checked;
  }
  return readings;
}

// Reading D's reduction: button and radio stops only, radio runs collapsed.
const buttonsAndRadios = (stops) => collapse(stops.filter((s) => s.tag === 'button' || s.type === 'radio'));

const readingD = {};
const servers = await startServers();
const engines = [
  ['webkit', () => webkit.launch()],
  ['chromium', () => launch()],
];

try {
  for (const [engine, start] of engines) {
    const browser = await start();
    try {
      // Reading A and Reading B (unpicked): one pass through the pen.
      {
        const { context, page } = await openPen(browser, servers.appUrl);
        await page.locator(CHURN).focus();
        const stops = await tabSpan(page, isSaveBatch, 30);
        const collapsed = collapse(stops);
        const keys = collapsed.map((c) => c.key);
        console.log(JSON.stringify({ engine, reading: 'A', order: collapsed }));
        countedCheck(
          sameList(keys, EXPECTED_A),
          `${engine}: Tab from Churn duration reaches ${JSON.stringify(EXPECTED_A)} in order (read ${JSON.stringify(keys)})`,
        );
        const unpicked = {
          exitConsistency: stopsOn(stops, 'segment-exit-consistency'),
          airiness: stopsOn(stops, 'segment-airiness'),
        };
        await context.close();

        // Reading B (picked): Exit consistency picked, so its Clear shows.
        const picked = await openPen(browser, servers.appUrl);
        await picked.page.locator('label.segmented__option', { hasText: 'Wet, soupy' }).click();
        await picked.page.locator(CHURN).focus();
        const pickedStops = await tabSpan(picked.page, isSaveBatch, 30);
        const pickedCount = {
          exitConsistency: stopsOn(pickedStops, 'segment-exit-consistency'),
          exitConsistencyClear: pickedStops.filter((s) => s.tag === 'button' && s.label === 'Clear Exit consistency').length,
          airiness: stopsOn(pickedStops, 'segment-airiness'),
        };
        console.log(JSON.stringify({ engine, reading: 'B', unpicked, picked: pickedCount }));
        if (engine === 'chromium') {
          countedCheck(unpicked.exitConsistency === 1, `${engine}: Exit consistency reads 1 radio stop unpicked (read ${unpicked.exitConsistency})`);
          countedCheck(pickedCount.exitConsistency === 1, `${engine}: Exit consistency reads 1 radio stop picked (read ${pickedCount.exitConsistency})`);
          countedCheck(unpicked.airiness === 1, `${engine}: Airiness reads 1 radio stop unpicked (read ${unpicked.airiness})`);
        }
        await picked.context.close();
      }

      // Reading C: arrow keys in the Exit consistency group.
      {
        const { context, page } = await openPen(browser, servers.appUrl);
        const readings = await arrowReading(page, engine, 'Exit consistency', 'segment-exit-consistency', 6);
        console.log(JSON.stringify({ engine, reading: 'C', readings }));
        await context.close();
      }

      // Reading D: the tasting-open span, button and radio stops only.
      {
        const { context, page } = await openPen(browser, servers.appUrl, { tasting: true });
        await page.locator(CHURN).focus();
        const stops = await tabSpan(page, isSaveBatch, 150);
        const reduced = buttonsAndRadios(stops);
        readingD[engine] = reduced;
        console.log(JSON.stringify({ engine, reading: 'D', stops: stops.length, order: reduced }));
        countedCheck(
          stops.length > 0 && isSaveBatch(stops[stops.length - 1]),
          `${engine}: Tab from Churn duration with the tasting open reaches Save batch within 150 presses (read ${stops.length} stops, ended on ${JSON.stringify(stops[stops.length - 1])})`,
        );

        // Reading E: Tab stops on the Hardness group. Every stop in the span
        // is read already; the picked state is a fresh page.
        const unpickedHardness = stopsOn(stops, 'axis-hardness');
        await context.close();
        const picked = await openPen(browser, servers.appUrl, { tasting: true });
        await picked.page
          .locator('label.axis-mark__stop', { has: picked.page.locator('input[name="axis-hardness"][value="3"]') })
          .click();
        await picked.page.locator(CHURN).focus();
        const pickedStops = await tabSpan(picked.page, isSaveBatch, 150);
        const pickedHardness = stopsOn(pickedStops, 'axis-hardness');
        const pickedHardnessClear = pickedStops.filter((s) => s.tag === 'button' && s.label === 'Clear Hardness').length;
        console.log(
          JSON.stringify({ engine, reading: 'E', hardness: { unpicked: unpickedHardness, picked: pickedHardness, pickedClear: pickedHardnessClear } }),
        );
        if (engine === 'chromium') {
          countedCheck(unpickedHardness === 1, `${engine}: Hardness reads 1 radio stop unpicked (read ${unpickedHardness})`);
          countedCheck(pickedHardness === 1, `${engine}: Hardness reads 1 radio stop picked (read ${pickedHardness})`);
        }
        await picked.context.close();
      }

      // Reading F: arrow keys in the Hardness group, tasting open.
      {
        const { context, page } = await openPen(browser, servers.appUrl, { tasting: true });
        const readings = await arrowReading(page, engine, 'Hardness', 'axis-hardness', 60);
        console.log(JSON.stringify({ engine, reading: 'F', readings }));
        await context.close();
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  await servers.close();
}

// Reading D's comparison: the same button and radio stops, in the same order.
const listD = (engine) => (readingD[engine] ?? []).map((entry) => entry.key);
countedCheck(
  JSON.stringify(listD('webkit')) === JSON.stringify(listD('chromium')) && listD('webkit').at(-1) === 'Save batch',
  `webkit's tasting-open button and radio list equals chromium's and ends at Save batch (webkit ${JSON.stringify(listD('webkit'))}, chromium ${JSON.stringify(listD('chromium'))})`,
);

finish(failures, count, '261001-doi tab probe');
