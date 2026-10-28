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
import { addProblem, addScale, updateProblem } from '../domain/creation.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const start = () => blankCreateDraft({ recipeId: 'r1', versionId: 'v1', name: 'Vanilla' });

let current = null;
let held = null;

function Holder({ onCall, saveMessages = null, initial = start }) {
  const [draft, setDraft] = useState(initial);
  held = draft;
  return (
    <CreationSetup
      createDraft={draft}
      saveMessages={saveMessages}
      onChange={(updater) => {
        onCall?.(updater);
        setDraft(updater);
      }}
    />
  );
}

function mount(onCall, saveMessages = null, initial = start) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  act(() => {
    root.render(
      <CatalogFixture>
        <Holder onCall={onCall} saveMessages={saveMessages} initial={initial} />
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
  it('opens with exactly the regions Style, Scales and Problems, and no field for equipment or process', () => {
    mount();
    const regions = current.container.querySelectorAll('section');
    expect([...regions].map((region) => region.getAttribute('aria-label'))).toEqual(['Style', 'Scales', 'Problems']);
    expect(regions[0].querySelector('h2.region-name').textContent).toBe('Style');
    expect(current.container.textContent).not.toMatch(/machine|equipment|pasteuri|hold time|process/i);
  });

  it('Targets is an h3 cue in the Style region', () => {
    mount();
    const targets = q('section[aria-label="Style"] .mk-cue-targets');
    expect(targets.tagName).toBe('H3');
    expect(targets.textContent).toBe('Targets');
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

describe('CreationSetup, the Scales and Problems regions (TASTE-01, TASTE-02, decision 12, T-04)', () => {
  const region = (name) => q(`section[aria-label="${name}"]`);
  const inRegion = (name, label, at = 0) => region(name).querySelectorAll(`[aria-label="${label}"]`)[at];
  const cards = (name) => [...region(name).querySelectorAll('.mk-card')];
  const cues = (name) => [...region(name).querySelectorAll('.mk-cue')].map((node) => node.textContent);
  const addControl = (name) => region(name).querySelector('.mk-add');
  const required = (name) => region(name).querySelectorAll('.field-requirement');
  const cardButton = (card) => card.querySelector('.mk-caprow button');
  const radios = (card) => [...card.querySelectorAll('input[type="radio"]')];

  function press(element) {
    act(() => {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
  }

  function pickKind(card, word) {
    press(radios(card).find((radio) => radio.value === word));
  }

  function fillScale(card, name, low, high) {
    type(card.querySelector('[aria-label="Name"]'), name);
    type(card.querySelector('[aria-label="Low end"]'), low);
    type(card.querySelector('[aria-label="High end"]'), high);
  }

  it('reads the core scales and the core problems from the catalog', () => {
    mount();
    expect(cues('Scales')).toEqual(['Every recipe']);
    expect(cues('Problems')).toEqual(['Every recipe']);
    expect(region('Scales').querySelector('.mk-core').textContent).toBe('Hardness, Scoopability, Smoothness, Sweetness');
    expect(region('Problems').querySelector('.mk-core').textContent).toBe(
      'Coarse, icy · Sandy, gritty · Gummy, elastic · Greasy film',
    );
    expect(cards('Scales')).toHaveLength(0);
    expect(cards('Problems')).toHaveLength(0);
    expect(addControl('Scales').textContent).toBe('Add scale');
    expect(addControl('Problems').textContent).toBe('Add problem');
  });

  it('a just-added scale has blank words, three Required lines, no kind picked and no stops line', () => {
    mount();
    press(addControl('Scales'));
    expect(cues('Scales')).toEqual(['Every recipe', 'This recipe only']);
    expect(cues('Problems')).toEqual(['Every recipe']);
    const [card] = cards('Scales');
    expect([...region('Scales').querySelectorAll('.mk-cue')].map((node) => node.tagName)).toEqual(['H3', 'H3']);
    expect(card.querySelector('.mk-card__head')).toBeNull();
    expect(card.getAttribute('aria-label')).toBe('Scale 1');
    expect(required('Scales')).toHaveLength(3);
    expect([...required('Scales')].map((node) => node.textContent)).toEqual(['Required', 'Required', 'Required']);
    expect(radios(card)).toHaveLength(2);
    expect(radios(card).filter((radio) => radio.checked)).toHaveLength(0);
    expect(card.querySelector('.mk-stops')).toBeNull();
    expect(card.querySelector('.segmented-field__clear')).toBeNull();
    expect(held.scales).toHaveLength(1);
    expect(held.scales[0].kind).toBe('');
    expect(held.scales[0].key.startsWith('scale-')).toBe(true);
  });

  it('the card has no head: its first row holds the Name field and remove, and the cues are h3', () => {
    mount();
    press(addControl('Scales'));
    press(addControl('Problems'));
    for (const name of ['Scales', 'Problems']) {
      const [card] = cards(name);
      expect(card.querySelector('.mk-card__head')).toBeNull();
      expect(card.firstElementChild.className).toBe('mk-caprow');
      const row = card.firstElementChild;
      expect(row.querySelectorAll('label.notebook-field')).toHaveLength(1);
      expect(row.querySelector('label.notebook-field .notebook-caption').textContent).toBe('Name');
      expect([...row.querySelectorAll('button')].map((button) => button.textContent)).toEqual(['Remove']);
      expect(card.textContent).not.toMatch(/(Scale|Problem) \d/);
      expect([...region(name).querySelectorAll('.mk-cue')].map((node) => node.tagName)).toEqual(['H3', 'H3']);
    }
  });

  it('Required leaves a field once it holds words and returns for whitespace', () => {
    mount();
    press(addControl('Scales'));
    const [card] = cards('Scales');
    type(card.querySelector('[aria-label="Name"]'), 'Creaminess');
    expect(required('Scales')).toHaveLength(2);
    type(card.querySelector('[aria-label="Name"]'), '   ');
    expect(required('Scales')).toHaveLength(3);
  });

  it('picking Right in the middle stores goldilocks and Low to high stores magnitude, and nothing offers Clear', () => {
    mount();
    press(addControl('Scales'));
    const [card] = cards('Scales');
    pickKind(card, 'Right in the middle');
    expect(held.scales[0].kind).toBe('goldilocks');
    expect(radios(card).find((radio) => radio.value === 'Right in the middle').checked).toBe(true);
    pickKind(card, 'Low to high');
    expect(held.scales[0].kind).toBe('magnitude');
    expect(card.querySelector('.segmented-field__clear')).toBeNull();
  });

  it('the stops line shows only once both ends and the kind are set', () => {
    mount();
    press(addControl('Scales'));
    const [card] = cards('Scales');
    type(card.querySelector('[aria-label="Low end"]'), 'thin');
    pickKind(card, 'Right in the middle');
    expect(card.querySelector('.mk-stops')).toBeNull();
    type(card.querySelector('[aria-label="High end"]'), 'rich');
    expect(card.querySelector('.mk-stops').textContent).toBe('thin · leaning thin · right · leaning rich · rich');
    pickKind(card, 'Low to high');
    expect(card.querySelector('.mk-stops').textContent).toBe('thin to rich');
  });

  it('a second scale takes Add scale away, its radios carry a different name from the first, and its pick leaves the first alone', () => {
    mount();
    press(addControl('Scales'));
    press(addControl('Scales'));
    expect(addControl('Scales')).toBeNull();
    const [one, two] = cards('Scales');
    const nameOf = (card) => new Set(radios(card).map((radio) => radio.name));
    expect(nameOf(one).size).toBe(1);
    expect(nameOf(two).size).toBe(1);
    expect([...nameOf(one)][0]).not.toBe([...nameOf(two)][0]);
    pickKind(one, 'Right in the middle');
    pickKind(two, 'Low to high');
    expect(radios(one).filter((radio) => radio.checked).map((radio) => radio.value)).toEqual(['Right in the middle']);
    expect(radios(two).filter((radio) => radio.checked).map((radio) => radio.value)).toEqual(['Low to high']);
    expect(held.scales.map((scale) => scale.kind)).toEqual(['goldilocks', 'magnitude']);
    expect(held.scales[0].key).not.toBe(held.scales[1].key);
  });

  it('each card is a group named by its place', () => {
    mount();
    press(addControl('Scales'));
    press(addControl('Scales'));
    press(addControl('Problems'));
    press(addControl('Problems'));
    const named = (name) => cards(name).map((card) => [card.getAttribute('role'), card.getAttribute('aria-label')]);
    expect(named('Scales')).toEqual([['group', 'Scale 1'], ['group', 'Scale 2']]);
    expect(named('Problems')).toEqual([['group', 'Problem 1'], ['group', 'Problem 2']]);
  });

  it('removing Scale 1 renames the other Scale 1 with its key unchanged, and focus goes to the Add scale that remove brought back', () => {
    mount();
    press(addControl('Scales'));
    press(addControl('Scales'));
    const [one, two] = cards('Scales');
    fillScale(one, 'Creaminess', 'thin', 'rich');
    fillScale(two, 'Cinnamon', 'faint', 'strong');
    const secondKey = held.scales[1].key;
    expect(addControl('Scales')).toBeNull();
    press(cardButton(cards('Scales')[0]));
    const [left] = cards('Scales');
    expect(cards('Scales')).toHaveLength(1);
    expect(left.getAttribute('aria-label')).toBe('Scale 1');
    expect(left.querySelector('.mk-card__head')).toBeNull();
    expect(left.querySelector('[aria-label="Name"]').value).toBe('Cinnamon');
    expect(held.scales.map((scale) => scale.key)).toEqual([secondKey]);
    expect(addControl('Scales')).not.toBeNull();
    expect(document.activeElement).toBe(addControl('Scales'));
  });

  it('Add problem with a scale already on the page focuses the new problem Name, not a scale', () => {
    mount();
    press(addControl('Scales'));
    press(addControl('Problems'));
    expect(document.activeElement).toBe(inRegion('Problems', 'Name'));
    expect(region('Problems').contains(document.activeElement)).toBe(true);
    press(addControl('Scales'));
    expect(document.activeElement).toBe(inRegion('Scales', 'Name', 1));
  });

  it('a just-added problem is empty with Required, and Add problem goes at two', () => {
    mount();
    press(addControl('Problems'));
    expect(cues('Problems')).toEqual(['Every recipe', 'This recipe only']);
    const [card] = cards('Problems');
    expect(card.querySelector('.mk-card__head')).toBeNull();
    expect(card.getAttribute('aria-label')).toBe('Problem 1');
    expect(card.querySelector('[aria-label="Name"]').value).toBe('');
    expect(required('Problems')).toHaveLength(1);
    type(card.querySelector('[aria-label="Name"]'), 'Bitter');
    expect(required('Problems')).toHaveLength(0);
    expect(held.problems).toEqual(['Bitter']);
    press(addControl('Problems'));
    expect(addControl('Problems')).toBeNull();
    expect(cards('Problems')).toHaveLength(2);
    expect(required('Problems')).toHaveLength(1);
  });

  it('removing a problem at two deletes it outright and focuses the Add problem that remove brought back', () => {
    mount();
    press(addControl('Problems'));
    press(addControl('Problems'));
    type(inRegion('Problems', 'Name', 0), 'Bitter');
    type(inRegion('Problems', 'Name', 1), 'Greasy');
    press(cardButton(cards('Problems')[0]));
    expect(held.problems).toEqual(['Greasy']);
    expect(cards('Problems')).toHaveLength(1);
    expect(cards('Problems')[0].getAttribute('aria-label')).toBe('Problem 1');
    expect(addControl('Problems')).not.toBeNull();
    expect(document.activeElement).toBe(addControl('Problems'));
    press(cardButton(cards('Problems')[0]));
    expect(held.problems).toEqual([]);
    expect(cues('Problems')).toEqual(['Every recipe']);
    expect(document.activeElement).toBe(addControl('Problems'));
  });

  it('words holding markup render as text in the fields and in the stops line', () => {
    mount();
    press(addControl('Scales'));
    press(addControl('Problems'));
    const [card] = cards('Scales');
    fillScale(card, '<b>Body</b>', '<i>thin', 'rich</i>');
    pickKind(card, 'Low to high');
    type(inRegion('Problems', 'Name'), '<b>Bitter</b>');
    expect(card.querySelector('[aria-label="Name"]').value).toBe('<b>Body</b>');
    expect(card.querySelector('.mk-stops').textContent).toBe('<i>thin to rich</i>');
    expect(current.container.querySelector('aside b, section b, i')).toBeNull();
    expect(held.problems).toEqual(['<b>Bitter</b>']);
  });

  it('two scales may share a name and two problems the same words, with distinct scale keys', () => {
    mount();
    press(addControl('Scales'));
    press(addControl('Scales'));
    press(addControl('Problems'));
    press(addControl('Problems'));
    type(inRegion('Scales', 'Name', 0), 'Body');
    type(inRegion('Scales', 'Name', 1), 'Body');
    type(inRegion('Problems', 'Name', 0), 'Icy');
    type(inRegion('Problems', 'Name', 1), 'Icy');
    expect(held.scales.map((scale) => scale.name)).toEqual(['Body', 'Body']);
    expect(held.problems).toEqual(['Icy', 'Icy']);
    expect(new Set(held.scales.map((scale) => scale.key)).size).toBe(2);
  });
});

describe("a refused Save's messages (MAKE-10, D-11, D-25, T-11-32, T-11-51)", () => {
  const withScale = () => addScale(start(), 'scale-a');

  it("puts each scale field's message under it, invalid and described by it, and leaves the others quiet", () => {
    mount(undefined, new Map([['scale:scale-a:name', 'Required'], ['scale:scale-a:high', 'Required']]), withScale);
    const name = q('.mk-card[aria-label="Scale 1"] input[aria-label="Name"]');
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(name.getAttribute('aria-describedby')).toBe('create-scale-scale-a-name-error');
    expect(q('#create-scale-scale-a-name-error').className).toBe('field-error');
    expect(q('#create-scale-scale-a-name-error').textContent).toBe('Required');
    const high = q('.mk-card[aria-label="Scale 1"] input[aria-label="High end"]');
    expect(high.getAttribute('aria-describedby')).toBe('create-scale-scale-a-high-error');
    const low = q('.mk-card[aria-label="Scale 1"] input[aria-label="Low end"]');
    expect(low.getAttribute('aria-invalid')).toBeNull();
    expect(q('#create-scale-scale-a-low-error')).toBeNull();
    // An error replaces the quiet Required in the same place: never two lines.
    expect(name.closest('label').querySelector('.field-requirement')).toBeNull();
    expect(low.closest('label').querySelector('.field-requirement').getAttribute('aria-hidden')).toBe('true');
  });

  it('an unpicked Kind shows Required under the radios, the radiogroup invalid and described by it', () => {
    mount(undefined, new Map([['scale:scale-a:kind', 'Required']]), withScale);
    const group = q('.mk-card[aria-label="Scale 1"] [role="radiogroup"]');
    expect(group.getAttribute('aria-invalid')).toBe('true');
    expect(group.getAttribute('aria-describedby')).toBe('create-scale-scale-a-kind-error');
    const message = q('#create-scale-scale-a-kind-error');
    expect(message.textContent).toBe('Required');
    expect(group.parentElement.contains(message)).toBe(true);
  });

  it("a repeated problem's sentence stands under the second only; a blank one reads Required", () => {
    const twice = () => updateProblem(updateProblem(addProblem(addProblem(start())), 0, 'Icy'), 1, 'Icy');
    mount(undefined, new Map([['problem-repeat:1', 'This problem is already listed.']]), twice);
    const first = q('.mk-card[aria-label="Problem 1"] input[aria-label="Name"]');
    const second = q('.mk-card[aria-label="Problem 2"] input[aria-label="Name"]');
    expect(q('#create-problem-1-error').textContent).toBe('This problem is already listed.');
    expect(second.getAttribute('aria-invalid')).toBe('true');
    expect(second.getAttribute('aria-describedby')).toBe('create-problem-1-error');
    expect(q('#create-problem-0-error')).toBeNull();
    expect(first.getAttribute('aria-invalid')).toBeNull();
  });

  it('a blank problem reads Required in place of the quiet one', () => {
    mount(undefined, new Map([['problem:0', 'Required']]), () => addProblem(start()));
    expect(q('#create-problem-0-error').textContent).toBe('Required');
    expect(q('.mk-card[aria-label="Problem 1"] .field-requirement')).toBeNull();
  });

  it('with no messages draws what it drew before', () => {
    mount(undefined, null, withScale);
    expect(current.container.querySelectorAll('.field-error')).toHaveLength(0);
    expect(current.container.querySelectorAll('[aria-invalid]')).toHaveLength(0);
  });
});
