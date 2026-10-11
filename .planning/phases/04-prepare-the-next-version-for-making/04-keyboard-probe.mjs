// 04-10: the develop loop by keyboard, in WebKit (UX1-01, UX1-03; D-20, D-21's
// automated half).
//
// Usage (from the repo root, after a build into a scratch directory):
//   npm --prefix app run build -- --outDir /path/to/scratch --emptyOutDir
//   PROBE_DIST=/path/to/scratch node .planning/phases/04-.../04-keyboard-probe.mjs <mode>
//
//   rules    a balance rule's accessible name holds its deviation words, and
//            focusing it announces the rows it marks in the polite live region
//   walk     Tab from the page's first stop reaches every enabled link, button,
//            radio group and checkbox on Home, the recipe page, the Next version
//            pen, the record pen (tasting open), the Correct pen, the print
//            route and Search, each showing a visible focus outline; every
//            visible text meets WCAG 2.2 AA contrast. At 1366 fine and 393 coarse.
//   colour   the printed pages are one ink; the draft notice, the Search
//            no-match line and the mark-one off state each carry their words
//   check    every mode
//
// WebKit only: it is the engine behind the iPad. It is Playwright's build on a
// Mac, not Mobile Safari, so a pass here is not the iPad: the device walk is
// Mark's (D-21's second half).
//
// The build is read from PROBE_DIST (default app/dist). Pass a scratch --outDir
// build there so Mark's own `vite preview --host` on :4173, which serves
// app/dist, is never disturbed.
//
// Isolation (T-04-28): the app is served on an ephemeral 127.0.0.1 port through
// the 03.5 harness and every request to another host is aborted in every
// context made here. Nothing contacts :4173, :8077, a browser profile or a
// third-party host. Everything typed into the app is English.
//
// Prints FAIL lines (and exits 1) for a failure; other lines are information.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, check, finish, REPO_ROOT, APP_ROUTE } from '../03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import path from 'node:path';

const DIST = process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist');
const MODES = ['rules', 'walk', 'colour'];

const RECIPE = 'olive-oil-ice-cream';
const VERSION_ROUTE = `/notebook/${RECIPE}/olive-oil-ice-cream-v1`;
const PRINT_ROUTE = `${VERSION_ROUTE}/print`;
const KEPT = 'Draft kept. Cancel discards it.';
const NO_MATCH = 'No version has this code.';
const MARK_ONE_OFF_REASON = 'Clear marks below to choose.';

const VIEWPORTS = [
  { name: '1366 fine', width: 1366, height: 1100, coarse: false },
  { name: '393 coarse', width: 393, height: 852, coarse: true },
];

const state = { failures: [], count: 0 };
function ok(condition, label) {
  state.count += 1;
  check(state.failures, condition, label);
}
const note = (text) => console.log(`NOTE ${text}`);

// ---------------------------------------------------------------------------
// Opening the app. Every request to another host is aborted.
// ---------------------------------------------------------------------------
async function open(browser, appUrl, route, { width, height, coarse }, readySelector = '.shell') {
  const context = await browser.newContext({
    viewport: { width, height },
    hasTouch: coarse,
    isMobile: coarse,
    deviceScaleFactor: coarse ? 3 : 1,
  });
  await context.route('**/*', (r) => {
    if (new URL(r.request().url()).hostname === '127.0.0.1') r.continue();
    else r.abort();
  });
  const page = await context.newPage();
  await page.goto(`${appUrl}${route}`, { waitUntil: 'networkidle' });
  await page.waitForSelector(readySelector);
  const actual = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);
  if (actual !== coarse) {
    await context.close();
    throw new Error(`open: expected (pointer: coarse) to be ${coarse}, got ${actual} for ${route} at ${width}x${height}`);
  }
  return { context, page };
}

// A first click after a navigation can miss: click until the thing shows.
async function clickUntil(page, target, doneSelector, label) {
  for (let i = 0; i < 4; i += 1) {
    await target().click();
    try {
      await page.waitForSelector(doneSelector, { timeout: 1500 });
      return;
    } catch {
      // try again
    }
  }
  throw new Error(`${label}: ${doneSelector} never appeared`);
}

async function openFold(page, id) {
  const hidden = await page.evaluate((i) => document.getElementById(i)?.hidden === true, id);
  if (hidden) {
    await page.click(`button[aria-controls="${id}"]`);
    await page.waitForTimeout(150);
  }
}

async function openRecordPen(page) {
  await page.waitForSelector('.batch-row');
  await clickUntil(page, () => page.locator('.batch-row__record').first(), '.batch-margin--pen', 'open the record pen');
  await page.waitForTimeout(150);
}

// ---------------------------------------------------------------------------
// Mode rules: a balance rule's name and the live announcement.
// ---------------------------------------------------------------------------
async function rulesMode(browser, appUrl) {
  const { context, page } = await open(browser, appUrl, VERSION_ROUTE, VIEWPORTS[0], '.notebook');
  try {
    // Tab from the first link until the first balance rule has focus.
    await page.evaluate(() => document.querySelector('a[href]').focus());
    let onRule = false;
    for (let i = 0; i < 300 && !onRule; i += 1) {
      await page.keyboard.press('Tab');
      onRule = await page.evaluate(() => document.activeElement?.classList.contains('graduated-rule') === true);
    }
    ok(onRule, 'rules: Tab reaches the first balance rule');
    if (!onRule) return;

    const read = await page.evaluate(() => {
      const rule = document.activeElement;
      const region = document.querySelector('.formulation-note-region [role="status"]');
      const marked = [...document.querySelectorAll('.ingredient-table-region [aria-label*="contributing to"]')].map(
        (el) => el.getAttribute('aria-label').split(',')[0],
      );
      return {
        name: rule.getAttribute('aria-label'),
        deviation: rule.querySelector('.graduated-rule__deviation')?.textContent ?? '',
        live: region?.textContent ?? null,
        polite: region?.getAttribute('aria-live') ?? null,
        marked,
      };
    });
    ok(read.deviation.length > 0 && read.name.includes(`, ${read.deviation}`), `rules: the name holds the deviation words "${read.deviation}": ${read.name}`);
    ok(read.polite === 'polite', 'rules: the marked-rows region is polite');
    ok(/^Contributing to .+: .+/.test(read.live ?? ''), `rules: the region reads Contributing to {figure}: {names}: "${read.live}"`);
    ok(read.marked.length > 0 && read.marked.every((n) => (read.live ?? '').includes(n)), `rules: the region names every marked row (${read.marked.join(', ')})`);

    await page.evaluate(() => document.activeElement.blur());
    const cleared = await page.evaluate(() => document.querySelector('.formulation-note-region [role="status"]').textContent);
    ok(cleared === '', 'rules: blurring clears the announcement');
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
// Mode walk: Tab reach, visible focus, contrast.
// ---------------------------------------------------------------------------
const INTERACTIVE = 'a[href], button, input:not([type="hidden"]), select, textarea';

async function tabWalk(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('[data-kw-seen]')) el.removeAttribute('data-kw-seen');
    // The page's first stop: the first visible, enabled control in document
    // order that is not taken off the Tab path. On the pages with the fly-out
    // menu button (724 to 1589) that button precedes the first link.
    const first = [...document.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea')].find(
      (el) =>
        !el.disabled &&
        el.getAttribute('tabindex') !== '-1' &&
        !el.closest('[hidden], [inert], .visually-hidden') &&
        el.getBoundingClientRect().width > 0,
    );
    first.focus();
    first.setAttribute('data-kw-seen', '1');
  });
  const stops = [];
  let ended = 'limit';
  let repeats = 0;
  for (let i = 0; i < 600; i += 1) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body || el === document.documentElement) return { left: true };
      const seen = el.hasAttribute('data-kw-seen');
      const justNow = el.hasAttribute('data-kw-last');
      for (const old of document.querySelectorAll('[data-kw-last]')) old.removeAttribute('data-kw-last');
      el.setAttribute('data-kw-last', '1');
      el.setAttribute('data-kw-seen', '1');
      const cs = getComputedStyle(el);
      const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
      const describe = `${el.tagName.toLowerCase()}${el.type ? `[${el.type}]` : ''} "${(el.getAttribute('aria-label') ?? el.textContent ?? el.value ?? '').trim().slice(0, 40)}"`;
      return { seen, justNow, outline, describe };
    });
    if (info.left) {
      ended = 'left the document';
      break;
    }
    // A date input holds several Tab stops inside one element (month, day,
    // year): the same element again is the next segment, not a return.
    if (info.justNow) {
      repeats += 1;
      if (repeats > 6) {
        ended = 'stuck on one element';
        break;
      }
      continue;
    }
    repeats = 0;
    if (info.seen) {
      ended = 'returned to a seen element';
      break;
    }
    stops.push(info);
  }
  return { stops, ended };
}

// Visible, enabled interactive elements the walk never reached. A radio group
// is one stop, so a group with any member reached counts as reached. An
// element the page takes off the Tab path on purpose (tabindex -1) is listed
// as information, not a failure.
async function unreached(page) {
  return page.evaluate((selector) => {
    const visible = (el) => {
      if (el.closest('[hidden], [inert], .visually-hidden')) return false;
      if (typeof el.checkVisibility === 'function' && !el.checkVisibility({ visibilityProperty: true })) return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const all = [...document.querySelectorAll(selector)].filter((el) => !el.disabled && !el.closest('fieldset:disabled') && visible(el));
    const groupSeen = new Set(all.filter((el) => el.type === 'radio' && el.hasAttribute('data-kw-seen')).map((el) => el.name));
    const missed = [];
    const skipped = [];
    for (const el of all) {
      if (el.hasAttribute('data-kw-seen')) continue;
      if (el.type === 'radio' && groupSeen.has(el.name)) continue;
      const describe = `${el.tagName.toLowerCase()}${el.type ? `[${el.type}]` : ''} "${(el.getAttribute('aria-label') ?? el.textContent ?? el.value ?? '').trim().slice(0, 50)}"`;
      if (el.getAttribute('tabindex') === '-1') skipped.push(describe);
      else missed.push(describe);
    }
    return { missed, skipped };
  }, INTERACTIVE);
}

// WCAG 2.2 contrast of every visible text against its nearest opaque
// background. Returns the distinct failing (colour, background, size) pairs.
async function contrast(page) {
  return page.evaluate(() => {
    const parse = (value) => {
      const m = value.match(/^rgba?\(([^)]+)\)$/);
      if (m) {
        const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
      }
      const c = value.match(/^color\(srgb ([^)]+)\)$/);
      if (c) {
        const p = c[1].split(/[ /]+/).filter(Boolean).map(Number);
        return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p[3] ?? 1 };
      }
      return null;
    };
    const over = (top, bottom) => {
      const a = top.a + bottom.a * (1 - top.a);
      if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
      const mix = (t, b) => (t * top.a + b * bottom.a * (1 - top.a)) / a;
      return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a };
    };
    const lum = ({ r, g, b }) => {
      const f = (v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (a, b) => {
      const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    // The layers behind a text, nearest first, until one is opaque; composited
    // from the far end over white (the canvas).
    const backgroundOf = (el) => {
      const layers = [];
      for (let node = el; node; node = node.parentElement) {
        const bg = parse(getComputedStyle(node).backgroundColor);
        if (bg && bg.a > 0) layers.push(bg);
        if (bg && bg.a >= 1) break;
      }
      let result = { r: 255, g: 255, b: 255, a: 1 };
      for (let i = layers.length - 1; i >= 0; i -= 1) result = over(layers[i], result);
      return result;
    };
    const opacityOf = (el) => {
      let o = 1;
      for (let node = el; node; node = node.parentElement) o *= Number(getComputedStyle(node).opacity);
      return o;
    };
    const visible = (el) => {
      if (el.closest('[hidden], [inert], .visually-hidden, [disabled], .is-off, [aria-disabled="true"]')) return false;
      if (el.closest('svg')) return false;
      if (typeof el.checkVisibility === 'function' && !el.checkVisibility({ visibilityProperty: true })) return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const carriers = new Map();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent.trim()) continue;
      const el = node.parentElement;
      if (el && !['SCRIPT', 'STYLE'].includes(el.tagName) && visible(el)) carriers.set(el, el.textContent.trim().slice(0, 30));
    }
    for (const el of document.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]), textarea, select')) {
      if (visible(el) && (el.value || el.tagName === 'SELECT')) carriers.set(el, `[field ${el.getAttribute('aria-label') ?? el.name ?? ''}]`.slice(0, 40));
    }

    const failures = new Map();
    let measured = 0;
    for (const [el, sample] of carriers) {
      const cs = getComputedStyle(el);
      const fg = parse(cs.color);
      if (!fg) continue;
      const bg = backgroundOf(el);
      const text = over({ ...fg, a: fg.a * opacityOf(el) }, bg);
      const size = parseFloat(cs.fontSize);
      const bold = Number(cs.fontWeight) >= 700;
      const large = size >= 24 || (size >= 18.66 && bold);
      const need = large ? 3 : 4.5;
      const got = ratio(text, bg);
      measured += 1;
      if (got < need) {
        const key = `${cs.color} on rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)}) at ${size}px`;
        const entry = failures.get(key) ?? { key, ratio: got.toFixed(2), need, count: 0, sample };
        entry.count += 1;
        failures.set(key, entry);
      }
    }
    return { measured, failures: [...failures.values()] };
  });
}

// The scenarios: where the walk starts and what it opens first.
const SCENARIOS = [
  { name: 'Home', route: '/', ready: '.shell' },
  { name: 'Recipe, reading', route: VERSION_ROUTE, ready: '.notebook' },
  {
    name: 'Next version pen',
    route: VERSION_ROUTE,
    ready: '.notebook',
    drive: async (page) => {
      await clickUntil(page, () => page.getByRole('button', { name: 'Next version' }).first(), 'form[aria-label="Next version"]', 'open the Next version pen');
    },
  },
  {
    name: 'Record pen, tasting open',
    route: VERSION_ROUTE,
    ready: '.notebook',
    drive: async (page) => {
      await openRecordPen(page);
      await page.locator('.save-ceremony button', { hasText: 'Add tasting' }).first().click();
      await page.waitForSelector('.tasting-head');
      await page.waitForTimeout(150);
    },
  },
  {
    name: 'Correct pen, 2 Aug batch',
    route: APP_ROUTE,
    ready: '.notebook',
    drive: async (page) => {
      await page.waitForSelector('.batch-row');
      await openFold(page, 'fold-batch');
      await clickUntil(page, () => page.locator('.batch-row__correct').first(), '.batch-margin--pen', 'open the Correct pen');
      await page.waitForTimeout(150);
    },
  },
  { name: 'Print route', route: PRINT_ROUTE, ready: '[data-print-ready]' },
  { name: 'Search', route: '/search', ready: '.shell' },
];

async function walkMode(browser, appUrl) {
  for (const viewport of VIEWPORTS) {
    for (const scenario of SCENARIOS) {
      const label = `walk ${viewport.name} ${scenario.name}`;
      const { context, page } = await open(browser, appUrl, scenario.route, viewport, scenario.ready);
      try {
        if (scenario.drive) await scenario.drive(page);
        const { stops, ended } = await tabWalk(page);
        const noOutline = stops.filter((s) => !s.outline).map((s) => s.describe);
        ok(noOutline.length === 0, `${label}: every stop shows a focus outline (${stops.length} stops, ${ended}); without: ${noOutline.join(' | ')}`);
        const { missed, skipped } = await unreached(page);
        ok(missed.length === 0, `${label}: every enabled control is reached; never reached: ${missed.join(' | ')}`);
        if (skipped.length > 0) note(`${label}: ${skipped.length} left off the Tab path on purpose (tabindex -1): ${skipped.slice(0, 3).join(' | ')}${skipped.length > 3 ? ' ...' : ''}`);
        const { measured, failures } = await contrast(page);
        for (const f of failures) {
          ok(false, `${label}: contrast ${f.ratio}:1 under ${f.need}:1, ${f.key}, ${f.count} text(s), e.g. "${f.sample}"`);
        }
        ok(failures.length === 0 && measured > 0, `${label}: all ${measured} texts meet AA contrast`);
        note(`${label}: ${stops.length} stops (${ended}), ${measured} texts measured`);
      } finally {
        await context.close();
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Mode colour: no state in colour alone.
// ---------------------------------------------------------------------------
async function colourMode(browser, appUrl) {
  // The printed pages are one ink.
  for (const viewport of VIEWPORTS) {
    const { context, page } = await open(browser, appUrl, PRINT_ROUTE, viewport, '[data-print-ready]');
    try {
      const result = await page.evaluate(() => {
        const probe = document.createElement('span');
        probe.style.color = getComputedStyle(document.documentElement).getPropertyValue('--sheet-ink');
        document.body.appendChild(probe);
        const ink = getComputedStyle(probe).color;
        probe.remove();
        const stray = new Map();
        const seen = (what, el, value) => {
          const key = `${what} ${value} on ${el.tagName.toLowerCase()}.${String(el.getAttribute('class') ?? '').split(' ')[0]}`;
          stray.set(key, (stray.get(key) ?? 0) + 1);
        };
        let elements = 0;
        for (const page of document.querySelectorAll('.print-page')) {
          for (const el of [page, ...page.querySelectorAll('*')]) {
            elements += 1;
            const cs = getComputedStyle(el);
            const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
            if (hasText && cs.color !== ink) seen('text', el, cs.color);
            for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
              if (cs[`border${side}Style`] !== 'none' && parseFloat(cs[`border${side}Width`]) > 0 && cs[`border${side}Color`] !== ink) {
                seen(`border-${side.toLowerCase()}`, el, cs[`border${side}Color`]);
              }
            }
            if (el instanceof SVGElement) {
              // Only a shape that paints an area has a fill that shows; a
              // line, a defs or the root svg carry the default black unpainted.
              const painted = ['stroke'];
              if (['rect', 'circle', 'ellipse', 'path', 'polygon'].includes(el.tagName.toLowerCase())) painted.push('fill');
              for (const prop of painted) {
                const v = cs[prop];
                if (v && v !== 'none' && !v.startsWith('url(') && v !== ink) seen(prop, el, v);
              }
            }
          }
        }
        return { ink, elements, stray: [...stray.entries()] };
      });
      ok(result.stray.length === 0, `colour ${viewport.name} print pages: ${result.elements} elements, text, borders and strokes all ${result.ink}; stray: ${result.stray.map(([k, n]) => `${k} x${n}`).join(' | ')}`);
    } finally {
      await context.close();
    }
  }

  // The draft notice: words, after a real reload.
  {
    const { context, page } = await open(browser, appUrl, VERSION_ROUTE, VIEWPORTS[0], '.notebook');
    try {
      await clickUntil(page, () => page.getByRole('button', { name: 'Next version' }).first(), 'form[aria-label="Next version"]', 'open the Next version pen');
      await page.fill('input[aria-label="Version name"]', 'less milk, more cream');
      await page.waitForTimeout(400);
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForSelector('.notebook');
      let words = null;
      try {
        await page.waitForFunction((w) => document.querySelector('.page-status')?.textContent === w, KEPT, { timeout: 5000 });
        words = KEPT;
      } catch {
        words = await page.evaluate(() => document.querySelector('.page-status')?.textContent ?? null);
      }
      ok(words === KEPT, `colour: the draft notice carries its words: "${words}"`);
    } finally {
      await context.close();
    }
  }

  // Search's no-match line: words.
  {
    const { context, page } = await open(browser, appUrl, '/search', VIEWPORTS[0], '.shell');
    try {
      await page.fill('input.ink-field', 'ZZZ-NOPE');
      await page.getByRole('button', { name: 'Find' }).click();
      await page.waitForFunction((w) => document.getElementById('sheet-code-result')?.textContent === w, NO_MATCH, { timeout: 5000 }).catch(() => {});
      const words = await page.evaluate(() => document.getElementById('sheet-code-result')?.textContent ?? null);
      ok(words === NO_MATCH, `colour: the Search no-match line carries its words: "${words}"`);
    } finally {
      await context.close();
    }
  }

  // The mark-one off state: the reason in words and a dashed border.
  {
    const { context, page } = await open(browser, appUrl, VERSION_ROUTE, VIEWPORTS[0], '.notebook');
    try {
      await openRecordPen(page);
      // A mark on Exit consistency turns the At draw options off. A first
      // click after a navigation can miss, so click until the reason shows.
      const option = page.locator('label.segmented__option', { hasText: 'Wet, soupy' }).first();
      for (let i = 0; i < 4; i += 1) {
        await option.click();
        if ((await page.locator('.mo-group[data-mo="atdraw"] .mo-hint').count()) > 0) break;
        await page.waitForTimeout(300);
      }
      const off = await page.evaluate(() => {
        const group = document.querySelector('.mo-group[data-mo="atdraw"]');
        const option = group?.querySelector('.segmented__option');
        return {
          hint: group?.querySelector('.mo-hint')?.textContent ?? null,
          disabled: [...(group?.querySelectorAll('input[type="radio"]') ?? [])].every((r) => r.disabled),
          border: option ? getComputedStyle(option).borderTopStyle : null,
        };
      });
      ok(off.hint === MARK_ONE_OFF_REASON, `colour: the mark-one off state carries its words: "${off.hint}"`);
      ok(off.disabled && off.border === 'dashed', `colour: the off options are disabled and dashed (${off.border})`);
    } finally {
      await context.close();
    }
  }
}

// ---------------------------------------------------------------------------
const RUNNERS = { rules: rulesMode, walk: walkMode, colour: colourMode };

async function run(modes) {
  const { appUrl, close } = await startServers({ appRoot: DIST });
  const browser = await webkit.launch();
  try {
    for (const mode of modes) await RUNNERS[mode](browser, appUrl);
  } finally {
    await browser.close();
    await close();
  }
  finish(state.failures, state.count, `04 keyboard probe ${modes.join(',')}`);
}

const [, , mode] = process.argv;
if (MODES.includes(mode)) await run([mode]);
else if (mode === 'check') await run(MODES);
else {
  console.error(`Usage: node 04-keyboard-probe.mjs <${MODES.join('|')}|check>`);
  process.exit(1);
}
