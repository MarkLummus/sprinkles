// In the house style of BatchMargin.test.jsx: renderToStaticMarkup
// (react-dom/server), the node test environment, oliveOilVersion, no
// jsdom, no testing-library, no new dependency.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { FormulationNote } from './FormulationNote.jsx';
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
