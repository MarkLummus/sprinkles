// Component test for the Versions region — the front-matter band's
// openers and the plan's pen ceremony (route-recipe.md § 3 "The imprint").
// In the existing house style: renderToStaticMarkup (react-dom/server) in
// the node test environment, no jsdom, no testing-library. Wrapped in a
// MemoryRouter to match every other region test in this file's family,
// even though this plan's Versions renders no Link yet (plan 02 moves the
// version list, lineage and batch list in). Several cases here are moved
// verbatim from Headnote.test.jsx's ceremony coverage, since the ceremony
// itself moved to this component (03.1-CONTEXT.md D-06).
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Versions } from './Versions.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';

const noop = () => {};

function emptyPenDraft(overrides = {}) {
  return {
    versionLabel: '',
    reason: '',
    citedBatchId: null,
    headnote: oliveOilVersion.headnote,
    ...overrides,
  };
}

function renderVersions(props) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <Versions
        version={oliveOilVersion}
        mode="reading"
        draft={null}
        penDraft={null}
        openBatch={null}
        batches={[]}
        citedBatch={null}
        blockedMessage={null}
        openPen={null}
        penReason={null}
        canSaveOver={true}
        onStartDeveloping={noop}
        onCancelDeveloping={noop}
        onChangePenField={noop}
        onSaveAsNewVersion={noop}
        onSaveOverVersion={noop}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe('Versions — the region head (D-01, D-02)', () => {
  it('renders an h2 reading Versions, with an aria-label to match', () => {
    const markup = renderVersions({});
    expect(markup).toMatch(/<h2[^>]*class="region-name"[^>]*>Versions<\/h2>/);
    expect(markup).toContain('aria-label="Versions"');
  });
});

describe('Versions — the openers, present only with no pen open (D-05)', () => {
  it('renders Develop on its own line in the first opener group', () => {
    const markup = renderVersions({ openPen: null });
    expect(markup).toMatch(/<button[^>]*>Develop<\/button>/);
  });

  it('renders the second opener group present and empty, for plan 02', () => {
    const markup = renderVersions({ openPen: null });
    const groupCount = (markup.match(/versions__opener-group/g) || []).length;
    expect(groupCount).toBe(2);
  });

  it('renders no Develop opener while a batch pen is open — the ceremony for that pen arrives in plan 02', () => {
    const markup = renderVersions({ openPen: 'record', penReason: 'a batch is being recorded' });
    expect(markup).not.toContain('>Develop<');
  });

  it('renders no Develop opener while the plan pen is open — the ceremony replaces it (D-06)', () => {
    const markup = renderVersions({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).not.toContain('>Develop<');
  });
});

describe('Versions — the ceremony renders nothing pre-filled', () => {
  it('renders a blank version line, a blank reason and no chosen citation', () => {
    const markup = renderVersions({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [augustSecondBatch],
      canSaveOver: false,
    });
    expect(markup).toMatch(/<input[^>]*aria-label="Version line"[^>]*value=""/);
    expect(markup).toContain('<textarea');
    expect(markup).not.toContain('value="60 g oil');
    expect(markup).toMatch(/<option value="" selected="">no batch cited<\/option>/);
  });

  it('renders "no batch to cite" when the version has no batch', () => {
    const markup = renderVersions({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toContain('no batch to cite');
  });
});

describe('Versions — the save pair, Cancel first, gated by canSaveOver (D-10)', () => {
  it('a version with a batch (canSaveOver false) renders Cancel then Save, never Save as', () => {
    const markup = renderVersions({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [augustSecondBatch],
      canSaveOver: false,
    });
    expect(markup).not.toContain('Save as');
    const cancelIndex = markup.indexOf('Cancel');
    const saveIndex = markup.indexOf('>Save<');
    expect(cancelIndex).toBeGreaterThanOrEqual(0);
    expect(saveIndex).toBeGreaterThan(cancelIndex);
  });

  it('a version with no batch (canSaveOver true) renders Cancel, then Save as, then Save', () => {
    const markup = renderVersions({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [],
      canSaveOver: true,
    });
    const cancelIndex = markup.indexOf('Cancel');
    const saveAsIndex = markup.indexOf('Save as');
    const saveIndex = markup.lastIndexOf('>Save<');
    expect(cancelIndex).toBeGreaterThanOrEqual(0);
    expect(saveAsIndex).toBeGreaterThan(cancelIndex);
    expect(saveIndex).toBeGreaterThan(saveAsIndex);
  });
});

describe('Versions — a blocked save is stated in words beside the controls', () => {
  it('renders "a version needs a line" for a blank version line', () => {
    const markup = renderVersions({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [],
      canSaveOver: true,
      blockedMessage: 'a version needs a line',
    });
    expect(markup).toContain('a version needs a line');
  });
});

describe('Versions — the parent line prints in ink, not the maker draft (D-30, critique P2 #1)', () => {
  it('renders "was <version line>" carrying no ink-text class', () => {
    const markup = renderVersions({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toContain(`was ${oliveOilVersion.versionLabel}`);
    expect(markup).not.toMatch(/headnote__version-was ink-text/);
  });
});

describe('Versions — one hint sentence for the whole block while the pen is open (D-06)', () => {
  it('renders the hint sentence exactly once', () => {
    const markup = renderVersions({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    const occurrences = markup.split('Links return after you save or cancel.').length - 1;
    expect(occurrences).toBe(1);
  });

  it('renders no hint sentence with no pen open', () => {
    const markup = renderVersions({ openPen: null });
    expect(markup).not.toContain('Links return after you save or cancel.');
  });
});
