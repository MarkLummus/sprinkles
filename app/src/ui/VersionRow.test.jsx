// Component test for the version's own row (sketch 003 variant B,
// 03.3-01, splitting Versions.jsx into VersionRow.jsx and BatchRow.jsx).
// In the existing house style: renderToStaticMarkup (react-dom/server) in
// the node test environment, no jsdom, no testing-library. Wrapped in a
// MemoryRouter since VersionStrip and the lineage line render Link
// elements. Several cases here are moved verbatim from Versions.test.jsx,
// narrowed to the version-owning half.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { VersionRow } from './VersionRow.jsx';
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

function renderVersionRow(props) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <VersionRow
        version={oliveOilVersion}
        versions={[oliveOilVersion]}
        mode="reading"
        penDraft={null}
        batches={[]}
        versionIdsWithBatches={new Set()}
        citedBatch={null}
        openPen={null}
        penReason={null}
        canSaveOver={true}
        penHint={null}
        onStartDeveloping={noop}
        onCancelDeveloping={noop}
        onChangePenField={noop}
        onSaveAsNewVersion={noop}
        onSaveOverVersion={noop}
        onToggleShowChanges={noop}
        {...props}
      />
    </MemoryRouter>,
  );
}

// A child version, for the lineage-line cases (D-08) — no fixture in
// app/src/data carries a parent, so this is built inline, mirroring the
// shape createChildVersion actually produces.
const childVersion = {
  ...oliveOilVersion,
  id: 'olive-oil-ice-cream-v2',
  parentVersionId: oliveOilVersion.id,
  parentVersionLabel: oliveOilVersion.versionLabel,
  reason: 'less oil after the batch of 2 Aug',
  citedBatchId: augustSecondBatch.id,
  versionLabel: '45 g oil · 800 g',
};

describe('VersionRow — no page-level running head (ROADMAP Scope bullet 1)', () => {
  it('renders the section with an aria-label of Version and no region-name heading', () => {
    const markup = renderVersionRow({});
    expect(markup).toContain('aria-label="Version"');
    expect(markup).not.toContain('className="region-name"');
    expect(markup).not.toMatch(/<h2[^>]*class="region-name"/);
  });
});

describe('VersionRow — the Develop opener, present only with no pen open (D-05)', () => {
  it('renders Develop on its own line in the opener group', () => {
    const markup = renderVersionRow({ openPen: null });
    expect(markup).toMatch(/<button[^>]*>Develop<\/button>/);
  });

  it('renders no Develop opener while the plan pen is open — the ceremony replaces it (D-06)', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).not.toContain('>Develop<');
  });

  it('renders no Develop opener while a batch pen is open — this row renders nothing at the top for a pen it does not own', () => {
    const markup = renderVersionRow({ openPen: 'record', penReason: 'a batch is being recorded' });
    expect(markup).not.toContain('>Develop<');
  });

  it('renders no Record another/Amend/Add tasting group — those live in BatchRow now', () => {
    const markup = renderVersionRow({ openPen: null });
    expect(markup).not.toContain('Record another');
    expect(markup).not.toContain('Record batch');
    expect(markup).not.toContain('>Amend<');
    expect(markup).not.toContain('Add tasting');
  });

  // D-27: after a fork saves and the page lands on the child's URL, focus
  // goes to the child's own Develop control. renderToStaticMarkup cannot
  // execute the actual focus transition — this asserts only the static
  // `autofocus=""` attribute the DOM reads on mount.
  it('renders autofocus="" on Develop when focusDevelopOnMount is true, and no autofocus when it is false', () => {
    const withFocus = renderVersionRow({ openPen: null, focusDevelopOnMount: true });
    const developButton = withFocus.match(/<button[^>]*>Develop<\/button>/)[0];
    expect(developButton).toContain('autofocus=""');

    const withoutFocus = renderVersionRow({ openPen: null, focusDevelopOnMount: false });
    const developButtonNoFocus = withoutFocus.match(/<button[^>]*>Develop<\/button>/)[0];
    expect(developButtonNoFocus).not.toContain('autofocus');
  });
});

describe('VersionRow — the two named placeholders, an example in ink small print (D-20)', () => {
  it('renders the version-line and reason examples', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toContain('e.g. 55 g oil · 800 g');
    expect(markup).toContain('e.g. less oil after the batch of 2 Aug');
  });
});

describe('VersionRow — the ceremony renders nothing pre-filled', () => {
  it('renders a blank version line, a blank reason and no chosen citation', () => {
    const markup = renderVersionRow({
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
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toContain('no batch to cite');
  });
});

describe('VersionRow — the reason field reads as printed prose (03.1-04)', () => {
  it('renders no visible "Reason" label and carries the accessible name in aria-label instead', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).not.toContain('<span>Reason</span>');
    expect(markup).toMatch(/<textarea[^>]*aria-label="Reason"/);
    expect(markup).toMatch(/<textarea[^>]*class="prose-field"/);
  });
});

describe('VersionRow — the save pair, Cancel first, gated by canSaveOver (D-10)', () => {
  it('a version with a batch (canSaveOver false) renders Cancel then Save, never Save as', () => {
    const markup = renderVersionRow({
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
    const markup = renderVersionRow({
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

describe('VersionRow — a blocked save is stated in words beside the controls', () => {
  it('renders "a version needs a line" for a blank version line', () => {
    const markup = renderVersionRow({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [],
      canSaveOver: true,
      penHint: 'a version needs a line',
    });
    expect(markup).toContain('a version needs a line');
  });
});

// WR-01 (03.1 REVIEW.md): a second consecutive blocked save on the
// version-line field must move focus again, not only the first — proved
// here by driving versionLineBlockedAttempt through two distinct non-null
// values and confirming both attempts still render the field (a live DOM
// focus transition cannot be observed by renderToStaticMarkup; the
// attempt-counter discipline itself is what the fix corrects, and is what
// this test exercises).
describe('VersionRow — the version-line blocked-save focus keys on an attempt counter (WR-01)', () => {
  it('accepts a non-null attempt number without throwing, on a first and then a second distinct attempt', () => {
    const firstAttempt = renderVersionRow({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [],
      canSaveOver: true,
      versionLineBlockedAttempt: 1,
    });
    expect(firstAttempt).toMatch(/<input[^>]*aria-label="Version line"/);

    const secondAttempt = renderVersionRow({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [],
      canSaveOver: true,
      versionLineBlockedAttempt: 2,
    });
    expect(secondAttempt).toMatch(/<input[^>]*aria-label="Version line"/);
  });

  it('accepts null (no block in effect) with no error', () => {
    const markup = renderVersionRow({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [],
      canSaveOver: true,
      versionLineBlockedAttempt: null,
    });
    expect(markup).toMatch(/<input[^>]*aria-label="Version line"/);
  });
});

describe('VersionRow — the parent line prints in ink, not the maker draft (D-30, critique P2 #1)', () => {
  it('renders "was <version line>" carrying no ink-text class', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toContain(`was ${oliveOilVersion.versionLabel}`);
    expect(markup).not.toMatch(/headnote__version-was ink-text/);
  });
});

describe('VersionRow — one hint sentence while the pen is open (D-06)', () => {
  it('renders the hint sentence exactly once while the plan pen is open', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    const occurrences = markup.split('Links return after you save or cancel.').length - 1;
    expect(occurrences).toBe(1);
  });

  it('renders the hint sentence while a batch pen is open too — this row still explains its own link suppression', () => {
    const markup = renderVersionRow({ openPen: 'record', penReason: 'a batch is being recorded' });
    expect(markup).toContain('Links return after you save or cancel.');
  });

  it('renders no hint sentence with no pen open', () => {
    const markup = renderVersionRow({ openPen: null });
    expect(markup).not.toContain('Links return after you save or cancel.');
  });
});

describe('VersionRow — the version list, rendered inside (D-07)', () => {
  it('renders the version strip nav inside the row', () => {
    const markup = renderVersionRow({ versions: [oliveOilVersion] });
    expect(markup).toContain('version-strip');
    expect(markup).toContain(oliveOilVersion.versionLabel);
  });

  it('renders a single version as a list, not nothing (no early return)', () => {
    const markup = renderVersionRow({ versions: [oliveOilVersion] });
    expect(markup).toMatch(/<ul class="version-strip__list">/);
  });

  it('carries the current entry by the is-current class, weight and outline, and marks a churned version with the word "churned"', () => {
    const markup = renderVersionRow({
      version: childVersion,
      versions: [oliveOilVersion, childVersion],
      versionIdsWithBatches: new Set([oliveOilVersion.id]),
    });
    expect(markup).toMatch(/<li class="version-strip__item is-current">/);
    expect(markup).toContain('churned');
  });

  it('renders every version label as plain text, no links, while any pen is open', () => {
    const markup = renderVersionRow({
      versions: [oliveOilVersion, childVersion],
      openPen: 'record',
    });
    expect(markup).not.toMatch(/<a href="\/recipe\/olive-oil-ice-cream-v1"/);
    expect(markup).toContain(oliveOilVersion.versionLabel);
  });
});

describe('VersionRow — the lineage, as labelled lines (D-08)', () => {
  it('renders no lineage at all for a root version', () => {
    const markup = renderVersionRow({ version: oliveOilVersion });
    expect(markup).not.toContain('versions__lineage');
  });

  it('renders Parent, Batch and Reason as labelled lines for a child version', () => {
    const markup = renderVersionRow({
      version: childVersion,
      citedBatch: augustSecondBatch,
      parentVersion: oliveOilVersion,
    });
    expect(markup).toContain('Parent');
    expect(markup).toContain('Batch');
    expect(markup).toContain('Reason');
    expect(markup).toContain(childVersion.reason);
    expect(markup).toContain(oliveOilVersion.versionLabel);
  });

  it('omits the Batch line when no batch was cited', () => {
    const markup = renderVersionRow({
      version: { ...childVersion, citedBatchId: null },
      citedBatch: null,
      parentVersion: oliveOilVersion,
    });
    expect(markup).toContain('Parent');
    expect(markup).not.toContain('Batch');
  });

  it('reads "no reason recorded" when the child carries no reason', () => {
    const markup = renderVersionRow({
      version: { ...childVersion, reason: null },
      citedBatch: augustSecondBatch,
      parentVersion: oliveOilVersion,
    });
    expect(markup).toContain('no reason recorded');
  });

  it('renders Show changes only when the live parent was read', () => {
    const withParent = renderVersionRow({
      version: childVersion,
      citedBatch: augustSecondBatch,
      parentVersion: oliveOilVersion,
    });
    expect(withParent).toContain('Show changes');
    expect(withParent).toContain('headnote__show-changes');

    const withoutParent = renderVersionRow({ version: childVersion, citedBatch: augustSecondBatch, parentVersion: null });
    expect(withoutParent).not.toContain('Show changes');
  });

  it('renders Parent and Batch as plain text, not links, while a pen is open', () => {
    const markup = renderVersionRow({
      version: childVersion,
      citedBatch: augustSecondBatch,
      parentVersion: oliveOilVersion,
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [],
      canSaveOver: true,
    });
    expect(markup).not.toMatch(/<a[^>]*href="\/recipe\/olive-oil-ice-cream-v1"/);
  });
});

describe('VersionRow — no batch list rendered here any more (D-09, moved to BatchRow)', () => {
  it('renders no batch-margin__list element', () => {
    const markup = renderVersionRow({});
    expect(markup).not.toContain('batch-margin__list');
  });
});
