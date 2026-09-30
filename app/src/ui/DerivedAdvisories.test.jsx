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

// Watch for owns its own fold, apart from Balance's (sketch 011 decisions
// 18/19, 03.5-16 decisions_recorded 1): a full-row FoldRow control inside
// an h2.region-name naming the section "Watch for", with the old "Things
// to check"/"derived" legend retired outright.
describe('DerivedAdvisories — the Watch for fold (sketch 011 decisions 18/19)', () => {
  it('open (foldsOpen true, the default): h2.region-name holds a fold-row naming fold-check, expanded, reading Hide; the panel carries no hidden attribute', () => {
    const markup = renderToStaticMarkup(<DerivedAdvisories version={oliveOilVersion} />);
    expect(markup).toContain(
      '<h2 class="region-name"><button type="button" class="fold-row" aria-expanded="true" aria-controls="fold-check" aria-label="Watch for, Hide"><span class="fold-row__head">Watch for<span class="fold-row__control">Hide</span></span></button></h2>',
    );
    expect(markup).toContain('<div id="fold-check">');
  });

  it('closed (foldsOpen false): aria-expanded false, reading Show, and the panel hidden', () => {
    const markup = renderToStaticMarkup(<DerivedAdvisories version={oliveOilVersion} foldsOpen={false} />);
    expect(markup).toContain(
      '<h2 class="region-name"><button type="button" class="fold-row" aria-expanded="false" aria-controls="fold-check" aria-label="Watch for, Show"><span class="fold-row__head">Watch for<span class="fold-row__control">Show</span></span></button></h2>',
    );
    expect(markup).toMatch(/<div id="fold-check" hidden="?/);
  });

  it('drops the old legend entirely — neither of its two words appears anywhere', () => {
    const markup = renderToStaticMarkup(<DerivedAdvisories version={oliveOilVersion} />);
    expect(markup).not.toContain('Things to check');
    expect(markup).not.toContain('derived-advisories__legend');
  });
});
