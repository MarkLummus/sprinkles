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
  const developingDraft = {
    versionLabel: '',
    headnote: oliveOilVersion.headnote,
  };

  it('replaces the parent version line with the blank child version field', () => {
    const markup = renderHeadnote({ mode: 'developing', penDraft: developingDraft });
    expect(markup).toMatch(/<label class="headnote__version-field"><span class="pen-caption">Version<\/span><input/);
    expect(markup).toMatch(/<input[^>]*aria-label="Version"[^>]*value=""/);
    expect(markup).toContain('<span class="field-requirement" aria-hidden="true">Required</span>');
    expect(markup).not.toContain(`<p class="headnote__version">${oliveOilVersion.versionLabel}</p>`);
  });

  it('renders a text field bound to the pen draft', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: developingDraft,
    });
    expect(markup).toMatch(/<textarea[^>]*aria-label="Headnote prose"/);
  });

  // Prose fields carry no visible label word (03.1-04, planner decision 2):
  // the field's own accessible name is the one place "Headnote prose" is
  // now spelled out.
  it('renders no visible label word — the accessible name alone names the field', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: developingDraft,
    });
    expect(markup).not.toContain('<span>Headnote prose</span>');
  });

  it('carries the printed-paragraph treatment, not the counted field\'s class', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: developingDraft,
    });
    expect(markup).toMatch(/<textarea[^>]*class="prose-field"/);
    expect(markup).not.toMatch(/<textarea[^>]*class="ink-field"/);
  });

  it('renders the baseline struck beneath once the field differs from it', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: { ...developingDraft, headnote: 'a rewritten intro' },
    });
    expect(markup).toContain('prose-struck-beneath');
    expect(markup).toContain(oliveOilVersion.headnote);
  });

  it('renders no struck paragraph while the field still matches the baseline', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: developingDraft,
    });
    expect(markup).not.toContain('prose-struck-beneath');
  });

  it('connects a blocked version field to its visible error and marks it invalid', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: developingDraft,
      versionLineError: 'Enter a version.',
    });
    expect(markup).toMatch(/<input[^>]*aria-invalid="true"[^>]*aria-describedby="version-field-error"/);
    expect(markup).toContain('<span id="version-field-error" class="field-error">Enter a version.</span>');
    expect(markup).not.toContain('field-requirement');
  });

  it('makes the saved version identity the programmatic landing after creating a child', () => {
    const markup = renderHeadnote({ focusVersionOnMount: true });
    expect(markup).toMatch(/<p[^>]*class="headnote__version"[^>]*tabindex="-1"[^>]*aria-label="Version 50 g oil · 800 g"/);
    expect(markup).not.toContain('autofocus');
  });

  it('freezes the identity fields while a version save is in flight', () => {
    const markup = renderHeadnote({ mode: 'developing', penDraft: developingDraft, isSaving: true });
    expect(markup).toMatch(/<input[^>]*disabled=""/);
    expect(markup).toMatch(/<textarea[^>]*disabled=""/);
  });
});
