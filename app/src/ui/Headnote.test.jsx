// Component test for the Sheet block — the Sheet's own title and intro
// prose, and nothing else (route-recipe.md § 3, revised 2026-09-08;
// D-02, D-03; 03.5-CONTEXT.md D-09, D-11: the recipe's own name and
// description moved off the version into the recipe record, rendered
// elsewhere). In the existing style: renderToStaticMarkup
// (react-dom/server), the node test environment, no jsdom, no
// testing-library, no new dependency, no MemoryRouter — this shrunk
// component renders no Link. Every case exercising the ceremony, the
// lineage line, the show-changes toggle, the Develop opener, or the
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

describe('Headnote — the Sheet block alone (D-02, D-03, D-09)', () => {
  it('renders the Sheet title, with no running head of its own and no version line', () => {
    const markup = renderHeadnote({});
    expect(markup).toContain(`<h1>${oliveOilVersion.sheetTitle}</h1>`);
    expect(markup).not.toContain(oliveOilVersion.versionLabel);
    expect(markup).not.toContain('region-name');
  });

  it('renders no control of any kind — the printed spread carries in-place ink only', () => {
    const markup = renderHeadnote({});
    expect(markup).not.toContain('<button');
  });

  it('renders the intro paragraph while reading', () => {
    const markup = renderHeadnote({});
    expect(markup).toContain(oliveOilVersion.sheetDescription);
  });

  it('prints the Sheet title and prose alone — no version line, no churned date (D-03)', () => {
    const markup = renderHeadnote({});
    expect(markup).toBe(
      `<header class="headnote"><h1>${oliveOilVersion.sheetTitle}</h1><p class="headnote__prose">${oliveOilVersion.sheetDescription}</p></header>`,
    );
  });
});

describe('Headnote — the Sheet title and Sheet description fields, while the plan pen is open (D-28: precedes every save in the tab order)', () => {
  const developingDraft = {
    versionLabel: '',
    sheetTitle: oliveOilVersion.sheetTitle,
    sheetDescription: oliveOilVersion.sheetDescription,
  };

  // 03.5-04 Task 3: the Version name field moves to VersionRow's own
  // ceremony in the band — Headnote renders no version-line field, no
  // "Version" or "Version name" label, at all.
  it('renders no Version field — it moved to the band\'s ceremony (Task 3)', () => {
    const markup = renderHeadnote({ mode: 'developing', penDraft: developingDraft });
    expect(markup).not.toContain('headnote__version-field');
    expect(markup).not.toMatch(/aria-label="Version"/);
    expect(markup).not.toMatch(/aria-label="Version name"/);
    expect(markup).not.toContain('>Version<');
    expect(markup).not.toContain('>Version name<');
  });

  it('renders the helper line naming what the Sheet fields do (Task 3)', () => {
    const markup = renderHeadnote({ mode: 'developing', penDraft: developingDraft });
    expect(markup).toContain('What the sheet is served under. Prints as the title. Copies into the next version.');
  });

  it('renders a Sheet title text field bound to the pen draft', () => {
    const markup = renderHeadnote({ mode: 'developing', penDraft: developingDraft });
    expect(markup).toMatch(/<label class="headnote__sheet-title-field"><span class="pen-caption">Sheet title<\/span><input[^>]*aria-label="Sheet title"[^>]*value="[^"]*"/);
  });

  it('renders a Sheet description text field bound to the pen draft', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: developingDraft,
    });
    expect(markup).toMatch(/<textarea[^>]*aria-label="Sheet description"/);
  });

  it('carries the printed-paragraph treatment, not the counted field\'s class', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: developingDraft,
    });
    expect(markup).toMatch(/<textarea[^>]*class="prose-field"/);
    expect(markup).not.toMatch(/<textarea[^>]*class="ink-field"/);
  });

  it('shows an empty writing baseline and the struck parent when an inherited description is cleared', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: { ...developingDraft, sheetDescription: '' },
    });
    expect(markup).toMatch(/<textarea[^>]*class="prose-field prose-field--empty"/);
    const descriptionField = markup.match(/<textarea[^>]*aria-label="Sheet description"[^>]*>/)?.[0];
    expect(descriptionField).toBeTruthy();
    expect(descriptionField).not.toContain('placeholder=');
    expect(markup).toContain(`<p class="prose-struck-beneath">${oliveOilVersion.sheetDescription}</p>`);
  });

  it('uses an example hint when neither parent nor draft has a description', () => {
    const version = { ...oliveOilVersion, sheetDescription: '' };
    const markup = renderHeadnote({
      version,
      mode: 'developing',
      penDraft: { ...developingDraft, sheetDescription: '' },
    });
    expect(markup).toMatch(/<textarea[^>]*class="prose-field prose-field--empty"/);
    expect(markup).toContain('placeholder="e.g. what this version changes"');
    expect(markup).not.toContain('prose-struck-beneath');
  });

  it('shows new prose without an empty strike when the parent had no description', () => {
    const version = { ...oliveOilVersion, sheetDescription: '' };
    const markup = renderHeadnote({
      version,
      mode: 'developing',
      penDraft: { ...developingDraft, sheetDescription: 'A lighter olive-oil version.' },
    });
    expect(markup).toMatch(/<textarea[^>]*class="prose-field"/);
    expect(markup).not.toContain('prose-field--empty');
    expect(markup).not.toContain('prose-struck-beneath');
  });

  it('renders the Sheet description baseline struck beneath once the field differs from it', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: { ...developingDraft, sheetDescription: 'a rewritten intro' },
    });
    expect(markup).toContain('prose-struck-beneath');
    expect(markup).toContain(oliveOilVersion.sheetDescription);
  });

  it('renders the Sheet title baseline struck beneath once the field differs from it', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: { ...developingDraft, sheetTitle: 'A rewritten title' },
    });
    expect(markup).toContain('prose-struck-beneath');
    expect(markup).toContain(oliveOilVersion.sheetTitle);
  });

  it('renders no struck paragraph while both fields still match the baseline', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: developingDraft,
    });
    expect(markup).not.toContain('prose-struck-beneath');
  });

  it('freezes the identity fields while a version save is in flight', () => {
    const markup = renderHeadnote({ mode: 'developing', penDraft: developingDraft, isSaving: true });
    expect(markup).toMatch(/<input[^>]*disabled=""/);
    expect(markup).toMatch(/<textarea[^>]*disabled=""/);
  });
});
