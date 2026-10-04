// @vitest-environment jsdom
//
// The fly-out from 724 to 1589 (sketch 011 decision 33, brief task 6 (a)
// items (1) to (6); quick 261004-ly8): the menu button, the panel, the scrim,
// where focus goes, inert on the page, Escape, and the two cuts the window can
// cross while it is open. A sibling jsdom file, for the reason
// RecipePage.recordTasting.test.jsx gives: the behaviour is click, focus and
// key events, which renderToStaticMarkup cannot show, and Shell.test.jsx must
// keep running with no window in scope.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router';

vi.mock('../store/repository.js', () => ({ repository: {} }));
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
