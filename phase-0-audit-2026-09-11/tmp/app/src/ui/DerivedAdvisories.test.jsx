// Component test for the margin's derived block (FORM2-02). Rendered
// through renderToStaticMarkup, in the existing node test environment —
// no jsdom, no testing-library, no new dependency (BatchMargin.test.jsx's
// own convention).
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DerivedAdvisories } from './DerivedAdvisories.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';

describe('DerivedAdvisories — the churned version', () => {
  it('renders four paragraphs, each containing a basis: clause', () => {
    const markup = renderToStaticMarkup(<DerivedAdvisories version={oliveOilVersion} />);
    const matches = markup.match(/basis:/g) ?? [];
    expect(matches.length).toBe(4);
  });

  it('renders the word derived in a legend parallel to the authored block', () => {
    const markup = renderToStaticMarkup(<DerivedAdvisories version={oliveOilVersion} />);
    expect(markup).toContain('derived');
    expect(markup).toContain('Things to check');
    expect(markup).not.toContain('Advisories');
  });

  it('never renders a verdict or a sensory word', () => {
    const markup = renderToStaticMarkup(<DerivedAdvisories version={oliveOilVersion} />).toLowerCase();
    for (const word of ['guaranteed', 'too much', 'too little', 'problem', 'taste', 'flavour', 'texture']) {
      expect(markup).not.toContain(word);
    }
  });
});

describe('DerivedAdvisories — no rows', () => {
  it('renders nothing at all, not an empty block', () => {
    const version = { ...oliveOilVersion, rows: [], method: [] };
    const markup = renderToStaticMarkup(<DerivedAdvisories version={version} />);
    expect(markup).toBe('');
  });
});
