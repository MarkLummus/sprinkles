// Component test for the recipe block — the recipe's own name, version
// line and intro paragraph, and nothing else (route-recipe.md § 3,
// revised 2026-09-08; D-02, D-03). In the existing style:
// renderToStaticMarkup (react-dom/server), the node test environment, no
// jsdom, no testing-library, no new dependency, no MemoryRouter — this
// shrunk component renders no Link. Every case exercising the ceremony,
// the lineage line, the show-changes toggle, the Develop opener, or the
// churned date moved to Versions.test.jsx along with the markup itself
// (03.1-CONTEXT.md D-03, D-04 to D-06).
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Headnote } from './Headnote.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';

const noop = () => {};

function renderHeadnote(props) {
  return renderToStaticMarkup(
    <Headnote
      version={oliveOilVersion}
      mode="reading"
      penDraft={null}
      onChangePenField={noop}
      {...props}
    />,
  );
}

describe('Headnote — the recipe block alone (D-02, D-03)', () => {
  it('renders the recipe name and the version line, with no running head of its own', () => {
    const markup = renderHeadnote({});
    expect(markup).toContain(`<h1>${oliveOilVersion.recipeName}</h1>`);
    expect(markup).toContain(oliveOilVersion.versionLabel);
    expect(markup).not.toContain('region-name');
  });

  it('renders no control of any kind — the printed spread carries in-place ink only', () => {
    const markup = renderHeadnote({});
    expect(markup).not.toContain('<button');
  });

  it('renders the intro paragraph while reading', () => {
    const markup = renderHeadnote({});
    expect(markup).toContain(oliveOilVersion.headnote);
  });

  it('prints nothing recorded — the version line alone, no churned date (D-03)', () => {
    const markup = renderHeadnote({});
    expect(markup).toBe(`<header class="headnote"><h1>${oliveOilVersion.recipeName}</h1><p class="headnote__version">${oliveOilVersion.versionLabel}</p><p class="headnote__prose">${oliveOilVersion.headnote}</p></header>`);
  });
});

describe('Headnote — the intro-paragraph field, while the plan pen is open (D-28: precedes every save in the tab order)', () => {
  it('renders a text field bound to the pen draft', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: { headnote: oliveOilVersion.headnote },
    });
    expect(markup).toMatch(/<textarea[^>]*aria-label="Headnote prose"/);
  });

  it('renders the baseline struck beneath once the field differs from it', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: { headnote: 'a rewritten intro' },
    });
    expect(markup).toContain('prose-struck-beneath');
    expect(markup).toContain(oliveOilVersion.headnote);
  });

  it('renders no struck paragraph while the field still matches the baseline', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: { headnote: oliveOilVersion.headnote },
    });
    expect(markup).not.toContain('prose-struck-beneath');
  });
});
