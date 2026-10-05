// @vitest-environment jsdom
//
// The fly-out from 724 to 1589 (sketch 011 decision 33, brief task 6 (a)
// items (1) to (6); quick 261004-ly8): the menu button, the panel, the scrim,
// where focus goes, inert on the page, Escape, and the two cuts the window can
// cross while it is open. A sibling jsdom file, for the reason
// RecipePage.recordTasting.test.jsx gives: the behaviour is click, focus and
// key events, which renderToStaticMarkup cannot show, and Shell.test.jsx must
// keep running with no window in scope. It also holds More's hairline tap below
// 724 (decision 55). It also holds the Import error panel's behaviour (sketch
// 011 decision 52 B, Mark 2026-10-05).
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router';

vi.mock('../store/repository.js', () => ({ repository: {} }));
// importStore calls through by default; the panel's tests set a result with
// mockResolvedValueOnce. The fly-out tests never import.
vi.mock('../store/transfer.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, importStore: vi.fn(actual.importStore) };
});
import { importStore, validateStoreFile } from '../store/transfer.js';
import { Shell } from './Shell.jsx';

// A mutable window width behind window.matchMedia: every list keeps its
// 'change' listeners, and setWidth recomputes each query and fires 'change'
// on the ones whose answer flipped, as a real resize does.
let width = 1024;
let lists = [];
let originalMatchMedia;

function evaluate(query) {
  const max = query.match(/max-width:\s*([\d.]+)px/);
  const min = query.match(/min-width:\s*([\d.]+)px/);
  if (max) return width <= Number(max[1]);
  if (min) return width >= Number(min[1]);
  return false;
}

function installMatchMedia(initialWidth) {
  width = initialWidth;
  lists = [];
  originalMatchMedia = window.matchMedia;
  window.matchMedia = (query) => {
    const list = {
      media: query,
      listeners: new Set(),
      last: evaluate(query),
      get matches() {
        return evaluate(query);
      },
      addEventListener(type, fn) {
        if (type === 'change') list.listeners.add(fn);
      },
      removeEventListener(type, fn) {
        if (type === 'change') list.listeners.delete(fn);
      },
    };
    lists.push(list);
    return list;
  };
}

async function setWidth(next) {
  width = next;
  await act(async () => {
    for (const list of lists) {
      const now = evaluate(list.media);
      if (now !== list.last) {
        list.last = now;
        for (const fn of [...list.listeners]) fn({ matches: now, media: list.media });
      }
    }
  });
}

// Stands in for RecipePage's pen listener: a bubble-phase document keydown
// listener counting Escape.
let escapeCount = 0;
function EscapeProbe() {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') escapeCount += 1;
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  return <p>Escape probe</p>;
}

let current = null;

async function mountAt(initialWidth, path = '/') {
  installMatchMedia(initialWidth);
  escapeCount = 0;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={<EscapeProbe />} />
            <Route path="/notebook" element={<p>Notebook page</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
  });
  return container;
}

afterEach(async () => {
  if (current) {
    await act(async () => current.root.unmount());
    current.container.remove();
    current = null;
  }
  if (originalMatchMedia === undefined) delete window.matchMedia;
  else window.matchMedia = originalMatchMedia;
  originalMatchMedia = undefined;
});

const menu = () => current.container.querySelector('button.shell__menu');
const nav = () => current.container.querySelector('nav#places');
const scrim = () => current.container.querySelector('.shell__scrim');
const main = () => current.container.querySelector('main.shell__main');
const header = () => current.container.querySelector('header.shell__head');
const navLinks = () => [...nav().querySelectorAll('a[href]')];
const linkTo = (href) => navLinks().find((link) => link.getAttribute('href') === href);

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

async function press(target, init) {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  await act(async () => {
    target.dispatchEvent(event);
  });
  return event;
}

async function openFlyout() {
  await click(menu());
}

describe('the fly-out at 1024: closed (I1)', () => {
  it('renders one Places menu button, the nav as the closed panel, no scrim and a live main', async () => {
    await mountAt(1024);
    expect(current.container.querySelectorAll('button.shell__menu')).toHaveLength(1);
    expect(menu().getAttribute('aria-label')).toBe('Places');
    expect(menu().getAttribute('aria-expanded')).toBe('false');
    expect(menu().getAttribute('aria-controls')).toBe('places');
    expect(menu().getAttribute('tabindex')).toBe('0');
    expect(nav()).toBeTruthy();
    expect(nav().classList.contains('shell__rail')).toBe(true);
    expect(nav().classList.contains('shell__rail--open')).toBe(false);
    expect(scrim()).toBeNull();
    expect(main().hasAttribute('inert')).toBe(false);
  });
});

describe('opening (I2)', () => {
  it('opens the panel over a scrim, makes main inert but not the bar, and focuses Home', async () => {
    await mountAt(1024);
    await openFlyout();
    expect(menu().getAttribute('aria-expanded')).toBe('true');
    expect(nav().classList.contains('shell__rail--open')).toBe(true);
    expect(scrim()).toBeTruthy();
    expect(scrim().getAttribute('aria-hidden')).toBe('true');
    expect(main().hasAttribute('inert')).toBe(true);
    expect(header().hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(navLinks()[0]);
    expect(document.activeElement.getAttribute('href')).toBe('/');
  });
});

describe('closing: Escape (I3), the scrim (I4), a place chosen (I6), the menu button', () => {
  it('Escape closes it, returns focus to the menu button, and never reaches a page listener', async () => {
    await mountAt(1024);
    await openFlyout();
    await press(document.activeElement, { key: 'Escape' });
    expect(menu().getAttribute('aria-expanded')).toBe('false');
    expect(scrim()).toBeNull();
    expect(main().hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(menu());
    expect(escapeCount).toBe(0);
    await press(document.activeElement, { key: 'Escape' });
    expect(escapeCount).toBe(1);
  });

  it('a scrim tap closes it and focuses the menu button', async () => {
    await mountAt(1024);
    await openFlyout();
    await click(scrim());
    expect(menu().getAttribute('aria-expanded')).toBe('false');
    expect(scrim()).toBeNull();
    expect(document.activeElement).toBe(menu());
  });

  it('the menu button closes it again', async () => {
    await mountAt(1024);
    await openFlyout();
    await click(menu());
    expect(menu().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(menu());
  });

  it('choosing Notebook goes there, closes the panel and focuses the menu button', async () => {
    await mountAt(1024);
    await openFlyout();
    await click(linkTo('/notebook'));
    expect(current.container.textContent).toContain('Notebook page');
    expect(menu().getAttribute('aria-expanded')).toBe('false');
    expect(nav().classList.contains('shell__rail--open')).toBe(false);
    expect(main().hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(menu());
  });
});

describe('Tab cycles the bar and the places (I5)', () => {
  it('Tab from the last place goes to the menu button, Shift+Tab from it to the last place, and Tab elsewhere is left alone', async () => {
    await mountAt(1024);
    await openFlyout();
    const links = navLinks();
    const kitchen = links[links.length - 1];
    expect(kitchen.getAttribute('href')).toBe('/kitchen');
    kitchen.focus();
    const forward = await press(kitchen, { key: 'Tab' });
    expect(forward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(menu());
    const backward = await press(menu(), { key: 'Tab', shiftKey: true });
    expect(backward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(kitchen);
    const search = header().querySelector('a[href="/search"]');
    search.focus();
    const middle = await press(search, { key: 'Tab' });
    expect(middle.defaultPrevented).toBe(false);
  });
});

describe('crossing a cut while open closes it in the same render (I7, I8)', () => {
  it('growing to 1600 drops the menu, the scrim and inert, and the open class', async () => {
    await mountAt(1024);
    await openFlyout();
    await setWidth(1600);
    expect(menu()).toBeNull();
    expect(scrim()).toBeNull();
    expect(main().hasAttribute('inert')).toBe(false);
    expect(nav().classList.contains('shell__rail--open')).toBe(false);
    await setWidth(1024);
    expect(menu().getAttribute('aria-expanded')).toBe('false');
    expect(scrim()).toBeNull();
  });

  it('shrinking to 700 drops the menu, the scrim and inert', async () => {
    await mountAt(1024);
    await openFlyout();
    await setWidth(700);
    expect(menu()).toBeNull();
    expect(scrim()).toBeNull();
    expect(main().hasAttribute('inert')).toBe(false);
    expect(nav().classList.contains('shell__rail--open')).toBe(false);
  });
});

describe('where there is no fly-out (I9, I10)', () => {
  it('at 1600 the rail stands and there is no menu button and no scrim', async () => {
    await mountAt(1600);
    expect(menu()).toBeNull();
    expect(scrim()).toBeNull();
    expect(nav().classList.contains('shell__rail--open')).toBe(false);
  });

  it('at 700 there is no menu button: the tab row is the navigation', async () => {
    await mountAt(700);
    expect(menu()).toBeNull();
    expect(scrim()).toBeNull();
  });
});

describe("More's hairline below 724 (sketch 011 decision 55)", () => {
  const nextTick = () =>
    act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

  it('a tap on the rule closes More and returns focus to its summary', async () => {
    await mountAt(393);
    const details = current.container.querySelector('details.shell__more');
    const summary = details.querySelector('summary');
    await click(summary);
    await nextTick();
    expect(details.open).toBe(true);
    const hr = details.querySelector('li.shell__more-sep > hr.shell__divider');
    expect(hr).toBeTruthy();
    await click(hr);
    await nextTick();
    expect(details.open).toBe(false);
    expect(document.activeElement).toBe(summary);
  });
});

const OLDER_EXPORT = '{"schemaVersion": 3, "recipes": [], "versions": [], "batches": []}';

// Drives the shared hidden file input as a chosen file: one object whose async
// text() returns the content, then a bubbling change and a flushed tick.
async function chooseFile(content) {
  const input = current.container.querySelector('input.shell__file-input');
  Object.defineProperty(input, 'files', { value: [{ text: async () => content }], configurable: true });
  await act(async () => {
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

const panel = () => current.container.querySelector('.shell__import-errors');
const panelClose = () => panel().querySelector('button');
const lineTexts = () => [...panel().querySelectorAll('ul.shell__import-errors-list > li')].map((li) => li.textContent);

describe('The Import error panel (sketch 011 decision 52 B; Mark 2026-10-05)', () => {
  it('is not there at rest', async () => {
    await mountAt(1024);
    expect(panel()).toBeNull();
  });

  it('a file that is not JSON shows the panel after the bar, with the title, the count, the line and a Close', async () => {
    await mountAt(1024);
    await chooseFile('not json');
    expect(panel()).toBeTruthy();
    expect(panel().getAttribute('role')).toBe('alert');
    expect(header().nextElementSibling).toBe(panel());
    expect(header().querySelector('.shell__import-errors')).toBeNull();
    expect(header().querySelector('ul')).toBeNull();
    expect(panel().querySelector('p.shell__import-errors-title').textContent).toBe('This file can’t be imported');
    expect(panel().querySelector('p.shell__import-errors-count').textContent).toBe('1 problem found');
    expect(lineTexts()).toEqual(['$: the file is not valid JSON']);
    const close = panelClose();
    expect(close.tagName).toBe('BUTTON');
    expect(close.classList.contains('shell__place')).toBe(true);
    expect(close.getAttribute('type')).toBe('button');
    expect(close.getAttribute('tabindex')).toBe('0');
    expect(close.textContent).toBe('Close');
    expect(panel().querySelectorAll('[style]')).toHaveLength(0);
  });

  it("an older export shows three lines, exactly as the validator words them", async () => {
    await mountAt(1024);
    await chooseFile(OLDER_EXPORT);
    const expected = validateStoreFile(JSON.parse(OLDER_EXPORT)).errors;
    expect(expected).toHaveLength(3);
    expect(panel().querySelector('p.shell__import-errors-count').textContent).toBe('3 problems found');
    expect(lineTexts()).toEqual(expected);
  });

  it('repeated lines and markup text stay safe: three items, text only, no duplicate-key warning', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await mountAt(1024);
      vi.mocked(importStore).mockResolvedValueOnce({ ok: false, errors: ['Same line', 'Same line', '<b>tag</b>'] });
      await chooseFile('{}');
      expect(lineTexts()).toHaveLength(3);
      expect(lineTexts()[2]).toBe('<b>tag</b>');
      expect(panel().querySelector('b')).toBeNull();
      expect(spy.mock.calls.filter((call) => String(call[0]).includes('same key'))).toHaveLength(0);
    } finally {
      spy.mockRestore();
    }
  });

  it('Close removes the panel and returns focus to the header Import button when focus was on Close (1024)', async () => {
    await mountAt(1024);
    await chooseFile('not json');
    panelClose().focus();
    await click(panelClose());
    expect(panel()).toBeNull();
    const importButton = [...header().querySelectorAll('button')].find((button) => button.textContent === 'Import');
    expect(document.activeElement).toBe(importButton);
  });

  it("Close returns focus to More's summary below 724 when focus was on Close (393)", async () => {
    await mountAt(393);
    await chooseFile('not json');
    panelClose().focus();
    await click(panelClose());
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(current.container.querySelector('details.shell__more > summary'));
  });

  it('Close leaves focus alone when focus was not on the panel', async () => {
    await mountAt(1024);
    await chooseFile('not json');
    document.activeElement.blur();
    await click(panelClose());
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(document.body);
  });

  it('Escape with the fly-out closed closes the panel and never reaches a page listener', async () => {
    await mountAt(1024);
    await chooseFile('not json');
    await press(document.body, { key: 'Escape' });
    expect(panel()).toBeNull();
    expect(escapeCount).toBe(0);
    await press(document.body, { key: 'Escape' });
    expect(escapeCount).toBe(1);
  });

  it('Escape with the fly-out open closes only the fly-out, the next closes the panel, the third reaches the page', async () => {
    await mountAt(1024);
    await chooseFile('not json');
    await openFlyout();
    await press(document.activeElement, { key: 'Escape' });
    expect(menu().getAttribute('aria-expanded')).toBe('false');
    expect(panel()).toBeTruthy();
    expect(document.activeElement).toBe(menu());
    await press(document.activeElement, { key: 'Escape' });
    expect(panel()).toBeNull();
    expect(escapeCount).toBe(0);
    await press(document.activeElement, { key: 'Escape' });
    expect(escapeCount).toBe(1);
  });

  it('a page change closes the panel', async () => {
    await mountAt(1024, '/notebook');
    await chooseFile('not json');
    expect(panel()).toBeTruthy();
    await click(current.container.querySelector('.shell__brand a'));
    expect(current.container.textContent).toContain('Escape probe');
    expect(panel()).toBeNull();
  });

  it('a good import after a failure closes the panel', async () => {
    await mountAt(1024);
    await chooseFile('not json');
    expect(header().nextElementSibling).toBe(panel());
    vi.mocked(importStore).mockResolvedValueOnce({ ok: true });
    await chooseFile('{}');
    expect(panel()).toBeNull();
  });
});
