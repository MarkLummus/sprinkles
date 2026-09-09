// Component test for the recipe block — the recipe's own name, version
// line and intro paragraph, and nothing else (route-recipe.md § 3,
// revised 2026-09-08; D-02, D-03). In the existing style:
// renderToStaticMarkup (react-dom/server), the node test environment, no
// jsdom, no testing-library, no new dependency, no MemoryRouter — this
// shrunk component renders no Link. Every case exercising the ceremony,
// the lineage line, the show-changes toggle or the Develop opener moved
// to Versions.test.jsx along with the markup itself (03.1-CONTEXT.md
// D-04 to D-06).
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Headnote } from './Headnote.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';

const noop = () => {};

function renderHeadnote(props) {
  return renderToStaticMarkup(
    <Headnote
      version={oliveOilVersion}
      mode="reading"
      draft={null}
      penDraft={null}
      openBatch={null}
      onChangeChurnDate={noop}
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
});

describe('Headnote — the churn-date slot stays here until plan 02 (D-03 closes across plans 01 and 02)', () => {
  it('renders the churned date for an open batch', () => {
    const markup = renderHeadnote({ openBatch: augustSecondBatch });
    expect(markup).toContain('churned');
  });

  it('renders an editable date field while recording', () => {
    const markup = renderHeadnote({ mode: 'recording', draft: { churnDate: '' } });
    expect(markup).toMatch(/<input[^>]*type="date"[^>]*class="ink-field headnote__churn-field"/);
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
