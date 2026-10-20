// @vitest-environment jsdom
//
// The creation editor's log column (Phase 10 plan 08, MAKE-09, sketch 013
// style-menu-and-bands.html): the Style region on its own, over the seed
// catalog, held by a small state wrapper the way CreationPage holds it.
import { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
// The catalog context imports the repository; this suite never reads the store.
vi.mock('../store/repository.js', () => ({ repository: {} }));

import { CreationSetup } from './CreationSetup.jsx';
import { MALFORMED_NUMBER_ENTRY } from './BatchRow.jsx';
import { CatalogFixture } from './catalog.fixtures.jsx';
import { blankCreateDraft } from '../domain/draft.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const start = () => blankCreateDraft({ recipeId: 'r1', versionId: 'v1', name: 'Vanilla' });

let current = null;
let held = null;

function Holder({ onCall }) {
  const [draft, setDraft] = useState(start);
  held = draft;
  return (
    <CreationSetup
      createDraft={draft}
      onChange={(updater) => {
        onCall?.(updater);
        setDraft(updater);
      }}
    />
  );
}

function mount(onCall) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  act(() => {
    root.render(
      <CatalogFixture>
        <Holder onCall={onCall} />
      </CatalogFixture>,
    );
  });
  return container;
}

afterEach(() => {
  if (!current) return;
  act(() => current.root.unmount());
  current.container.remove();
  current = null;
  held = null;
});

const q = (selector) => current.container.querySelector(selector);
const field = (label) => q(`[aria-label="${label}"]`);
const setter = (input) => Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value').set;

function type(input, value) {
  act(() => {
    setter(input).call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function choose(value) {
  const menu = q('select.mk-menu');
  act(() => {
    menu.value = value;
    menu.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

describe('CreationSetup (MAKE-09)', () => {
  it('opens with one region, Style, and no field for equipment or process', () => {
    mount();
    const regions = current.container.querySelectorAll('section');
    expect(regions).toHaveLength(1);
    expect(regions[0].getAttribute('aria-label')).toBe('Style');
    expect(regions[0].querySelector('h2.region-name').textContent).toBe('Style');
    expect(current.container.textContent).not.toMatch(/machine|equipment|pasteuri|hold time|process/i);
  });

  it('lists No style, then the catalog styles in their stored order, with the ids as values', () => {
    mount();
    const options = [...q('select.mk-menu').options];
    expect(options.map((option) => option.textContent)).toEqual(['No style', 'Philadelphia', 'French', 'Gelato', 'Sorbet']);
    expect(options.map((option) => option.value)).toEqual(['', 'philadelphia', 'french', 'gelato', 'sorbet']);
    expect(q('select.mk-menu').getAttribute('tabindex')).toBe('0');
    expect(current.container.querySelector('.mk-list')).toBeNull();
  });

  it('a lone minus in the temperature stores the constant and shows blank; the next readable entry replaces it', () => {
    mount();
    const input = field('Serving temperature, degrees Celsius');
    expect(input.getAttribute('type')).toBe('number');
    expect(input.getAttribute('step')).toBe('any');
    Object.defineProperty(input, 'validity', { configurable: true, value: { badInput: true } });
    act(() => {
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(held.serveTempC).toBe(MALFORMED_NUMBER_ENTRY);
    expect(input.value).toBe('');
    Object.defineProperty(input, 'validity', { configurable: true, value: { badInput: false } });
    type(input, '-16');
    expect(held.serveTempC).toBe('-16');
    expect(input.value).toBe('-16');
  });

  it('a wheel over the focused temperature field blurs it', () => {
    mount();
    const input = field('Serving temperature, degrees Celsius');
    input.focus();
    expect(document.activeElement).toBe(input);
    act(() => {
      input.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 100 }));
    });
    expect(document.activeElement).not.toBe(input);
  });

  it('labels the six bands in the Balance order, with their units, and shows no error on any field', () => {
    mount();
    const labels = [...current.container.querySelectorAll('.mk-band')].map((row) => ({
      label: row.querySelector('.mk-band__label').textContent,
      unit: row.querySelectorAll('.mk-band__unit')[1].textContent,
    }));
    expect(labels).toEqual([
      { label: 'Freezing · PAC', unit: '' },
      { label: 'Sweetness · POD', unit: '' },
      { label: 'Fat', unit: '%' },
      { label: 'Milk solids · MSNF', unit: '%' },
      { label: 'Sugar', unit: '%' },
      { label: 'Solids', unit: '%' },
    ]);
    type(field('Fat, target low'), 'x');
    type(field('Fat, target high'), '-1');
    expect(current.container.querySelectorAll('[aria-invalid]')).toHaveLength(0);
    expect(current.container.querySelectorAll('.field-error')).toHaveLength(0);
  });

  it('hands onChange an updater for every edit, and the updaters applied in order give every edit at once', () => {
    const calls = [];
    mount((updater) => calls.push(updater));
    choose('philadelphia');
    choose('');
    choose('gelato');
    act(() => {
      q('.batch-row__head-acts button').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    type(field('Serving temperature, degrees Celsius'), '-16');
    for (const label of ['Freezing · PAC', 'Sweetness · POD', 'Fat', 'Milk solids · MSNF', 'Sugar', 'Solids']) {
      type(field(`${label}, target low`), '1');
      type(field(`${label}, target high`), '2');
    }
    expect(calls.length).toBeGreaterThanOrEqual(16);
    for (const call of calls) expect(typeof call).toBe('function');

    const replayed = calls.reduce((draft, updater) => updater(draft), start());
    expect(replayed).toEqual(held);
    expect(replayed.style).toBeNull();
    expect(replayed.serveTempC).toBe('-16');
    expect(replayed.targets.sugar).toEqual(['1', '2']);
  });

  it('every updater is a function of the newest draft: two recorded edits applied to one start both land', () => {
    const spy = vi.fn();
    mount(spy);
    type(field('Fat, target high'), '16');
    type(field('Milk solids · MSNF, target low'), '9');
    const [first, second] = spy.mock.calls.map(([updater]) => updater);
    const both = second(first(start()));
    expect(both.targets.fat).toEqual(['', '16']);
    expect(both.targets.msnf).toEqual(['9', '']);
  });
});
