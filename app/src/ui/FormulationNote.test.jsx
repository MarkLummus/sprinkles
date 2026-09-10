// In the house style of BatchMargin.test.jsx: renderToStaticMarkup
// (react-dom/server), the node test environment, oliveOilVersion, no
// jsdom, no testing-library, no new dependency.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { FormulationNote } from './FormulationNote.jsx';
import { buildDiff } from '../domain/diff.js';
import { oliveOilVersion } from '../data/olive-oil.js';

const FIGURE_LABELS = ['PAC', 'POD', 'Total fat', 'MSNF', 'Sugar solids', 'Total solids'];

function countOccurrences(markup, substring) {
  return markup.split(substring).length - 1;
}

describe('FormulationNote — the region head reads Balance, not the book vocabulary (D-01)', () => {
  it('renders an h2 reading Balance', () => {
    const markup = renderToStaticMarkup(<FormulationNote version={oliveOilVersion} mode="reading" />);
    expect(markup).toMatch(/<h2[^>]*class="region-name"[^>]*>Balance<\/h2>/);
  });
});

describe('FormulationNote — graduated rules leave the recording tab path (D-04)', () => {
  it('gives every graduated-rule button tabindex="-1" while recording', () => {
    const markup = renderToStaticMarkup(<FormulationNote version={oliveOilVersion} mode="recording" />);
    // The exact button class, not the "graduated-rule__*" child classes.
    const ruleCount = countOccurrences(markup, 'class="graduated-rule"');
    const tabIndexCount = countOccurrences(markup, 'tabindex="-1"');
    expect(ruleCount).toBe(6);
    expect(tabIndexCount).toBe(ruleCount);
  });

  it('renders no tabindex attribute at all while reading, with every rule still drawn', () => {
    const markup = renderToStaticMarkup(<FormulationNote version={oliveOilVersion} mode="reading" />);
    expect(markup).not.toContain('tabindex');
    for (const label of FIGURE_LABELS) {
      expect(markup).toContain(label);
    }
  });

  it('draws the same six figure labels whether recording or reading — only reachability changes', () => {
    const recording = renderToStaticMarkup(<FormulationNote version={oliveOilVersion} mode="recording" />);
    const reading = renderToStaticMarkup(<FormulationNote version={oliveOilVersion} mode="reading" />);
    for (const label of FIGURE_LABELS) {
      expect(recording).toContain(label);
      expect(reading).toContain(label);
    }
  });
});

// The plan's pen leaves the tab path too (critique P1 #2 second half,
// D-28): the six rules never sat on the developing-mode tab path, matching
// the recording-mode exclusion above, since the rules stay clickable and
// keep their focus treatment either way (the value passed straight to the
// native button, unchanged in this file).
describe('FormulationNote — graduated rules leave the plan\'s pen tab path too (critique P1 #2, D-28)', () => {
  it('gives every graduated-rule button tabindex="-1" while developing', () => {
    const markup = renderToStaticMarkup(<FormulationNote version={oliveOilVersion} mode="developing" />);
    const ruleCount = countOccurrences(markup, 'class="graduated-rule"');
    const tabIndexCount = countOccurrences(markup, 'tabindex="-1"');
    expect(ruleCount).toBe(6);
    expect(tabIndexCount).toBe(ruleCount);
  });
});

// The rule heads strike the parent figure while the plan's pen is open
// (critique P1 #2 first half): FormulationNote and GraduatedRule needed no
// change for this — the per-figure lookup and the struck head figure were
// already built and only ever starved of a diff (RecipePage.jsx now passes
// the live pen diff). This proves the wiring, not the drawing (already
// covered by GraduatedRule's own tests).
describe('FormulationNote — the rule heads strike the parent figure once given a diff (critique P1 #2)', () => {
  it('renders a struck head figure when a diff reporting a changed figure is supplied', () => {
    const baseline = structuredClone(oliveOilVersion);
    const current = structuredClone(oliveOilVersion);
    current.rows.find((row) => row.id === 'row-03').portions[0].grams = 48; // Graza Drizzle, oil: 40 -> 48
    const diff = buildDiff(current, baseline);

    const markup = renderToStaticMarkup(<FormulationNote version={current} mode="developing" diff={diff} />);

    expect(markup).toContain('class="struck-value"');
  });
});
