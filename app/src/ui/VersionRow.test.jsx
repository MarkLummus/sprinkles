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
        allBatches={[]}
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

// The section itself still carries no page-level running head of its own
// (ROADMAP Scope bullet 1) — but per sketch 003 variant B (the confirmed
// design, G-03.3-4), the vmeta stack this section renders now carries its
// own visible "Version" region-name heading, matching the "Batch" legend
// BatchRow.jsx already prints in this same phase.
describe('VersionRow — the Version region-name heading (sketch 003 variant B, G-03.3-4)', () => {
  it('renders the section with an aria-label of Version and a visible "Version" region-name heading', () => {
    const markup = renderVersionRow({});
    expect(markup).toContain('aria-label="Version"');
    expect(markup).toMatch(/<h2 class="region-name">Version<\/h2>/);
  });
});

describe('VersionRow — the Develop opener, present only with no pen open (D-05)', () => {
  it('renders Develop on its own line in the opener group', () => {
    const markup = renderVersionRow({ openPen: null });
    expect(markup).toMatch(/<button[^>]*>Next version<\/button>/);
  });

  it('renders no Develop opener while the plan pen is open — the ceremony replaces it (D-06)', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).not.toContain('>Next version<');
  });

  it('renders no Develop opener while a batch pen is open — this row renders nothing at the top for a pen it does not own', () => {
    const markup = renderVersionRow({ openPen: 'record', penReason: 'a batch is being recorded' });
    expect(markup).not.toContain('>Next version<');
  });

  it('renders no Amend/Add tasting group — those still live in BatchRow', () => {
    const markup = renderVersionRow({ openPen: null });
    expect(markup).not.toContain('>Amend<');
    expect(markup).not.toContain('Add tasting');
  });

  // G-03.3-4: the Record opener moved beside Next version, into this
  // row's own acts group — reading openBatch the same way BatchRow's own
  // opener used to.
  it('renders Record batch beside Next version when the version has no batch', () => {
    const markup = renderVersionRow({ openPen: null, openBatch: null });
    expect(markup).toContain('Next version');
    expect(markup).toContain('Record batch');
    expect(markup).not.toContain('Record another');
  });

  it('renders Record another beside Next version when a batch is in view', () => {
    const markup = renderVersionRow({ openPen: null, openBatch: augustSecondBatch });
    expect(markup).toContain('Next version');
    expect(markup).toContain('Record another');
    expect(markup).not.toContain('Record batch');
  });

  // G-03.3-1: the fork's landing focus is now driven by a page-level
  // useEffect keyed on focusDevelopOnMount, not the native autoFocus DOM
  // attribute — renderToStaticMarkup cannot execute the actual focus
  // transition (Method.test.jsx's own precedent for a live-DOM-only
  // effect), so this asserts only what a static render CAN prove: no
  // autofocus attribute on Next version, for either value.
  it('renders no autofocus attribute on Next version, whether or not focusDevelopOnMount is true', () => {
    const withFocus = renderVersionRow({ openPen: null, focusDevelopOnMount: true });
    const developButton = withFocus.match(/<button[^>]*>Next version<\/button>/)[0];
    expect(developButton).not.toContain('autofocus');

    const withoutFocus = renderVersionRow({ openPen: null, focusDevelopOnMount: false });
    const developButtonNoFocus = withoutFocus.match(/<button[^>]*>Next version<\/button>/)[0];
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
    expect(markup).toMatch(/<input[^>]*aria-label="Version"[^>]*value=""/);
    expect(markup).toContain('<textarea');
    expect(markup).not.toContain('value="60 g oil');
    expect(markup).toMatch(/<option value="" selected="">no batch cited<\/option>/);
  });

  it('renders "no batch to cite" when the version has no batch', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toContain('no batch to cite');
  });
});

// 03.1-04 read the reason field with no visible label at all; 03.3-06
// checkpoint feedback (Mark, 2026-09-10, sketch 003 variant B,
// index.html:222) supersedes that for a visible "Why" label matching
// Version's own — never the retired "Reason" wording — while the field
// itself still carries its own accessible name in aria-label.
describe('VersionRow — the reason field carries a visible "Why" label (03.1-04, superseded by 03.3-06 checkpoint feedback)', () => {
  it('renders a visible "Why" label, never "Reason", alongside the aria-label', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).not.toContain('<span>Reason</span>');
    expect(markup).toMatch(/<label class="headnote__reason-field"><span>Why<\/span>/);
    expect(markup).toMatch(/<textarea[^>]*aria-label="Why"/);
    expect(markup).toMatch(/<textarea[^>]*class="prose-field"/);
  });
});

// 03.3-06 checkpoint feedback (sketch 003 variant B, index.html:225): the
// citation reads as a label over its control, the same shape Version and
// Why use, not a label beside its control on one line.
describe('VersionRow — the citation reads label-over-control, like Version and Why (03.3-06 checkpoint feedback)', () => {
  it('wraps "From batch" and its select in one label, the control after the visible span', () => {
    const markup = renderVersionRow({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [augustSecondBatch],
      canSaveOver: false,
    });
    expect(markup).toMatch(/<label class="headnote__citation"><span>From batch<\/span><select/);
  });

  it('wraps "no batch to cite" in the same label-over-control shape when the version has no batch', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toMatch(/<label class="headnote__citation"><span>From batch<\/span><span class="ink-text">no batch to cite<\/span><\/label>/);
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
    expect(firstAttempt).toMatch(/<input[^>]*aria-label="Version"/);

    const secondAttempt = renderVersionRow({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [],
      canSaveOver: true,
      versionLineBlockedAttempt: 2,
    });
    expect(secondAttempt).toMatch(/<input[^>]*aria-label="Version"/);
  });

  it('accepts null (no block in effect) with no error', () => {
    const markup = renderVersionRow({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [],
      canSaveOver: true,
      versionLineBlockedAttempt: null,
    });
    expect(markup).toMatch(/<input[^>]*aria-label="Version"/);
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

// The version strip now renders only inside the "Later" disclosure (sketch
// 003 variant B, G-03.3-4), closed by default — renderToStaticMarkup
// cannot exercise the open state (Method.test.jsx's own "closed by
// default" precedent for a click-driven disclosure, cited in
// 03.3-PATTERNS.md), so this coverage asserts only the closed state: the
// Later button with the correct count, and no version-strip markup at
// all. The open state's own list rendering (is-current, churned, link
// suppression while a pen is open) is VersionStrip's own coverage in
// VersionStrip.test.jsx, unaffected by this plan.
describe('VersionRow — the Later-versions disclosure, closed by default (D-07, sketch 003 variant B, G-03.3-4)', () => {
  it('renders the Later button with the descendant count and no version-strip markup while closed', () => {
    const markup = renderVersionRow({
      version: oliveOilVersion,
      versions: [oliveOilVersion, childVersion],
    });
    expect(markup).toMatch(/<button[^>]*class="text-control"[^>]*>1 later version<\/button>/);
    expect(markup).not.toContain('version-strip');
  });

  it('renders the plural count for more than one descendant', () => {
    const grandchildVersion = {
      ...childVersion,
      id: 'olive-oil-ice-cream-v3',
      parentVersionId: childVersion.id,
      parentVersionLabel: childVersion.versionLabel,
    };
    const markup = renderVersionRow({
      version: oliveOilVersion,
      versions: [oliveOilVersion, childVersion, grandchildVersion],
    });
    expect(markup).toContain('2 later versions');
  });

  it('renders no Later dt/dd and no version-strip markup when there are no descendants', () => {
    const markup = renderVersionRow({ version: oliveOilVersion, versions: [oliveOilVersion] });
    expect(markup).not.toMatch(/<dt[^>]*>Later<\/dt>/);
    expect(markup).not.toContain('later version');
    expect(markup).not.toContain('version-strip');
  });
});

describe('VersionRow — the lineage, as labelled lines (D-08)', () => {
  // Sketch 003 variant B, G-03.3-4: a root version's dl now reads
  // "Written" (the version's own createdAt) rather than rendering no
  // lineage at all, and "Why" is unconditional across root and child —
  // superseding the earlier gap-closure decision to omit the whole block
  // for a root version.
  it('renders Written and "no reason recorded" for a root version with no later versions, and no Later dt/dd', () => {
    const markup = renderVersionRow({ version: oliveOilVersion, versions: [oliveOilVersion] });
    expect(markup).toMatch(/<dt[^>]*>Written<\/dt>/);
    expect(markup).toContain('no reason recorded');
    expect(markup).not.toMatch(/<dt[^>]*>Later<\/dt>/);
  });

  it('renders From version (never bare "From"), folded with the written date, From batch, Why, and the Later count for a child version', () => {
    const grandchildVersion = {
      ...childVersion,
      id: 'olive-oil-ice-cream-v3',
      parentVersionId: childVersion.id,
      parentVersionLabel: childVersion.versionLabel,
    };
    const markup = renderVersionRow({
      version: childVersion,
      versions: [oliveOilVersion, childVersion, grandchildVersion],
      citedBatch: augustSecondBatch,
      parentVersion: oliveOilVersion,
    });
    expect(markup).toMatch(/<dt[^>]*>From version<\/dt>/);
    expect(markup).not.toMatch(/<dt[^>]*>From<\/dt>/);
    expect(markup).toContain('· written');
    expect(markup).toContain('From batch');
    expect(markup).toContain('Why');
    expect(markup).toContain(childVersion.reason);
    expect(markup).toContain(oliveOilVersion.versionLabel);
    expect(markup).toContain('1 later version');
  });

  it('omits the From batch line when no batch was cited', () => {
    const markup = renderVersionRow({
      version: { ...childVersion, citedBatchId: null },
      citedBatch: null,
      parentVersion: oliveOilVersion,
    });
    expect(markup).toContain('From version');
    expect(markup).not.toContain('From batch');
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

  // 03.3-06 checkpoint feedback (sketch 003 variant B, index.html:479):
  // Show changes reads as a text control, not a bordered button.
  it('renders Show changes carrying the text-control class', () => {
    const markup = renderVersionRow({
      version: childVersion,
      citedBatch: augustSecondBatch,
      parentVersion: oliveOilVersion,
    });
    expect(markup).toMatch(/<button[^>]*class="headnote__show-changes text-control"[^>]*>Show changes<\/button>/);
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

// 03.3-06 checkpoint feedback (Mark, 2026-09-10): the pen ceremony and the
// acts group were squeezed into the row-version grid's narrow right
// column, and the acts group rendered ABOVE the dl instead of below it.
// Fixed by returning a Fragment: a `.vmeta` section (h2, dl, then the acts
// group) plus, as its OWN full-width sibling sections, the ceremony (while
// developing) and the Later disclosure (while open) — matching sketch 003
// variant B's own `.vmeta`/`.ceremony`/`.list` siblings (index.html:208-233).
describe('VersionRow — the vmeta column, the ceremony, and the Later row are separate full-width siblings (03.3-06 checkpoint fix)', () => {
  it('wraps the reading-mode stack in a "vmeta" section, the sketch\'s own class name', () => {
    const markup = renderVersionRow({});
    expect(markup).toMatch(/<section class="vmeta" aria-label="Version">/);
  });

  it('renders the acts group (Next version, Record, Show changes) AFTER the dl, matching the sketch\'s own dl-then-acts order', () => {
    const markup = renderVersionRow({
      openPen: null,
      openBatch: null,
      version: childVersion,
      citedBatch: augustSecondBatch,
      parentVersion: oliveOilVersion,
    });
    const dlIndex = markup.indexOf('version-row__meta-list');
    const actsIndex = markup.indexOf('versions__opener-group');
    const showChangesIndex = markup.lastIndexOf('Show changes');
    expect(dlIndex).toBeGreaterThanOrEqual(0);
    expect(actsIndex).toBeGreaterThan(dlIndex);
    expect(showChangesIndex).toBeGreaterThan(actsIndex);
  });

  it('renders the ceremony as its own full-width `<section aria-label="Next version">`, carrying the sketch\'s "Next version · from …" heading — not nested inside vmeta', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toMatch(/<section class="recipe-band__full-row versions__ceremony-row" aria-label="Next version">/);
    expect(markup).toContain(`Next version · from ${oliveOilVersion.versionLabel}`);
    // The ceremony section must open AFTER the vmeta section closes, not
    // appear as content inside it (the squeezed-column bug).
    const vmetaOpenIndex = markup.indexOf('<section class="vmeta"');
    const vmetaCloseIndex = markup.indexOf('</section>', vmetaOpenIndex);
    const ceremonyIndex = markup.indexOf('aria-label="Next version"');
    expect(ceremonyIndex).toBeGreaterThan(vmetaCloseIndex);
  });

  it('renders no ceremony section with no pen open', () => {
    const markup = renderVersionRow({ openPen: null });
    expect(markup).not.toContain('versions__ceremony-row');
  });
});
