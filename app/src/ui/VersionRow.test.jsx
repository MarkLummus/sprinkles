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
    expect(markup).not.toMatch(/<button[^>]*>Next version<\/button>/);
    expect(markup).toMatch(/<h2 class="region-name">Next version<\/h2>/);
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

});

describe('VersionRow — the two named placeholders, an example in ink small print (D-20)', () => {
  it('renders the reason example; the version-line example belongs to Headnote', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toContain('e.g. less oil after the batch of 2 Aug');
    expect(markup).not.toContain('e.g. 55 g oil · 800 g');
  });
});

describe('VersionRow — the ceremony renders nothing pre-filled', () => {
  it('renders a blank reason and no chosen citation', () => {
    const markup = renderVersionRow({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [augustSecondBatch],
      canSaveOver: false,
    });
    expect(markup).toContain('<textarea');
    expect(markup).not.toContain('value="60 g oil');
    expect(markup).toMatch(/<option value="" selected="">no batch cited<\/option>/);
  });

  it('renders "no batch" when the version has no batch', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toContain('no batch');
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
    expect(markup).toMatch(/<label class="headnote__reason-field"><span class="pen-caption">Why<\/span>/);
    expect(markup).toMatch(/<textarea[^>]*aria-label="Why"/);
    expect(markup).toMatch(/<textarea[^>]*class="prose-field prose-field--empty"/);
  });

  it('drops the empty baseline once the rationale holds prose', () => {
    const markup = renderVersionRow({
      openPen: 'plan',
      penDraft: { ...emptyPenDraft(), reason: 'Less oil after the batch of 2 Aug.' },
      batches: [],
      canSaveOver: true,
    });
    expect(markup).toMatch(/<textarea[^>]*class="prose-field"/);
    expect(markup).not.toContain('prose-field--empty');
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

  it('wraps "no batch" in the same label-over-control shape when the version has no batch', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toMatch(/<label class="headnote__citation"><span>From batch<\/span><span class="ink-text">no batch<\/span><\/label>/);
  });
});

describe('VersionRow — save actions name their versioning outcome', () => {
  it('a version with a batch renders Cancel then Save as a new version', () => {
    const markup = renderVersionRow({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [augustSecondBatch],
      canSaveOver: false,
    });
    const cancelIndex = markup.indexOf('Cancel');
    const saveIndex = markup.indexOf('Save as a new version');
    expect(cancelIndex).toBeGreaterThanOrEqual(0);
    expect(saveIndex).toBeGreaterThan(cancelIndex);
    expect(markup).not.toContain('Save over this version');
  });

  it('a version with no batch renders Cancel, Save as a new version, then Save over this version', () => {
    const markup = renderVersionRow({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [],
      canSaveOver: true,
    });
    const cancelIndex = markup.indexOf('Cancel');
    const saveAsIndex = markup.indexOf('Save as a new version');
    const saveIndex = markup.indexOf('Save over this version');
    expect(cancelIndex).toBeGreaterThanOrEqual(0);
    expect(saveAsIndex).toBeGreaterThan(cancelIndex);
    expect(saveIndex).toBeGreaterThan(saveAsIndex);
  });

  it('disables every ceremony action and names the active save while saving a child', () => {
    const markup = renderVersionRow({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [augustSecondBatch],
      canSaveOver: false,
      saveAction: 'new',
    });
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toMatch(/<button type="button" disabled="">Cancel<\/button>/);
    expect(markup).toMatch(/<button type="button" disabled="">Saving new version…<\/button>/);
    expect(markup).toMatch(/<select[^>]*disabled=""/);
    expect(markup).toMatch(/<textarea[^>]*disabled=""/);
  });
});

describe('VersionRow — field validation is owned by Headnote', () => {
  it('does not repeat a blocked Version error beside the controls', () => {
    const markup = renderVersionRow({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [],
      canSaveOver: true,
      penHint: 'Enter a version.',
    });
    expect(markup).not.toContain('Enter a version.');
    expect(markup).not.toContain('version-field-error');
  });
});

describe('VersionRow — the parent is stated as provenance for the draft', () => {
  it('renders the saved parent under From version and hides its old Written and Why metadata', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toMatch(/<dt[^>]*>From version<\/dt>/);
    expect(markup).toContain(`<dd class="versions__lineage">${oliveOilVersion.versionLabel}</dd>`);
    expect(markup).not.toMatch(/<dt[^>]*>Written<\/dt>/);
    expect(markup).not.toContain('no reason recorded');
  });
});

describe('VersionRow — the plan pen carries no interface-policy hint', () => {
  it('does not explain that links return after the plan pen closes', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).not.toContain('Links return after you save or cancel.');
  });

  it('leaves the hint to BatchRow while a batch pen is open, so the front matter never repeats it', () => {
    const markup = renderVersionRow({ openPen: 'record', penReason: 'a batch is being recorded' });
    expect(markup).not.toContain('Links return after you save or cancel.');
  });

  it('renders no hint sentence with no pen open', () => {
    const markup = renderVersionRow({ openPen: null });
    expect(markup).not.toContain('Links return after you save or cancel.');
  });
});

// The version strip now renders only inside the Versions disclosure
// (sketch 003 variant B, G-03.3-4; the struck "Later" wording retired
// 260917-odu), closed by default — renderToStaticMarkup cannot exercise
// the open state (Method.test.jsx's own "closed by default" precedent for
// a click-driven disclosure, cited in 03.3-PATTERNS.md), so this coverage
// asserts only the closed state: the Versions button with the correct
// count, and no version-strip markup at all. The open state's own list
// rendering (is-current, churned, link suppression while a pen is open)
// is VersionStrip's own coverage in VersionStrip.test.jsx, unaffected by
// this plan.
//
// A count assertion must pass a `versions` prop that CONTAINS the version
// in view — renderVersionRow's own default below is `[oliveOilVersion]`,
// so a child fixture rendered without its own explicit `versions` array
// counts only the root.
describe('VersionRow — the Versions disclosure, closed by default (D-07, sketch 003 variant B, G-03.3-4, 260917-odu)', () => {
  it('renders the Versions button counting the complete set — the version in view plus an ancestor — and no version-strip markup while closed', () => {
    const markup = renderVersionRow({
      version: oliveOilVersion,
      versions: [oliveOilVersion, childVersion],
    });
    expect(markup).toMatch(/<button[^>]*class="text-control"[^>]*>Versions \(2\)<\/button>/);
    const versionsButton = markup.match(/<button[^>]*>Versions \(2\)<\/button>/)[0];
    expect(versionsButton).toContain('aria-controls="version-row-versions"');
    expect(markup).not.toContain('version-strip');
  });

  it('counts the whole recipe regardless of tree depth — a root, its child and its grandchild', () => {
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
    expect(markup).toContain('Versions (3)');
  });

  // An ancestor AND a sibling both count: a three-generation, two-branch
  // tree (root, childVersion and its sibling as root's two children,
  // grandchildVersion as childVersion's own child), viewed from the
  // middle version (childVersion). The whole recipe's count is 4 — not
  // the 2-member subtree below childVersion — proving this reads the
  // recipe's complete list, never a descendant walk.
  it('counts an ancestor and a sibling from the middle of a two-branch tree', () => {
    const siblingVersion = {
      ...childVersion,
      id: 'olive-oil-ice-cream-v2b',
      versionLabel: '52 g oil · 800 g',
    };
    const grandchildVersion = {
      ...childVersion,
      id: 'olive-oil-ice-cream-v3',
      parentVersionId: childVersion.id,
      parentVersionLabel: childVersion.versionLabel,
    };
    const markup = renderVersionRow({
      version: childVersion,
      versions: [oliveOilVersion, childVersion, siblingVersion, grandchildVersion],
    });
    expect(markup).toContain('Versions (4)');
  });

  it('renders Versions (1), not nothing, for a root version with no other versions', () => {
    const markup = renderVersionRow({ version: oliveOilVersion, versions: [oliveOilVersion] });
    expect(markup).not.toMatch(/<dt[^>]*>Later<\/dt>/);
    expect(markup).toContain('Versions (1)');
    expect(markup).not.toContain('version-strip');
  });

  it('renders no control at all with an empty versions array — the pre-load paint before Versions (0) could ever show', () => {
    const markup = renderVersionRow({ version: oliveOilVersion, versions: [] });
    expect(markup).not.toContain('Versions (');
    expect(markup).not.toContain('version-row__history');
  });
});

describe('VersionRow — the lineage, as labelled lines (D-08)', () => {
  // Sketch 003 variant B, G-03.3-4: a root version's dl now reads
  // "Written" (the version's own createdAt) rather than rendering no
  // lineage at all, and "Why" is unconditional across root and child —
  // superseding the earlier gap-closure decision to omit the whole block
  // for a root version.
  it('renders Written and "no reason recorded" for a root version, and no Later dt/dd', () => {
    const markup = renderVersionRow({ version: oliveOilVersion, versions: [oliveOilVersion] });
    expect(markup).toMatch(/<dt[^>]*>Written<\/dt>/);
    expect(markup).toContain('no reason recorded');
    expect(markup).toContain('class="versions__lineage-label version-row__reason-label">Why</dt>');
    expect(markup).toContain('class="version-row__reason version-row__reason--empty">no reason recorded</dd>');
    expect(markup).not.toMatch(/<dt[^>]*>Later<\/dt>/);
  });

  it('renders From version (never bare "From"), folded with the written date, From batch, Why, and the Versions count for a child version', () => {
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
    expect(markup).toContain('class="version-row__reason prose-text"');
    expect(markup).toContain(oliveOilVersion.versionLabel);
    expect(markup).toContain('Versions (3)');
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
    expect(withParent).toContain('text-toggle');

    const withoutParent = renderVersionRow({ version: childVersion, citedBatch: augustSecondBatch, parentVersion: null });
    expect(withoutParent).not.toContain('Show changes');
  });

  // 03.3-06 checkpoint feedback (sketch 003 variant B, index.html:479):
  // Show changes reads as a text control, not a bordered button. One fill
  // for every on state (2026-09-16): it is also a square-and-word toggle.
  it('renders Show changes carrying the text-control and text-toggle classes', () => {
    const markup = renderVersionRow({
      version: childVersion,
      citedBatch: augustSecondBatch,
      parentVersion: oliveOilVersion,
    });
    expect(markup).toMatch(/<button[^>]*class="headnote__show-changes text-control text-toggle"[^>]*>Show changes<\/button>/);
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
describe('VersionRow — the saved metadata transforms into the next-version ceremony', () => {
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

  it('uses the existing metadata column for the next-version provenance and controls', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toMatch(/<section class="vmeta vmeta--developing" aria-label="Next version">/);
    expect(markup).toMatch(/<h2 class="region-name">Next version<\/h2>/);
    expect(markup).not.toContain('versions__ceremony-row');
  });

  it('renders no ceremony section with no pen open', () => {
    const markup = renderVersionRow({ openPen: null });
    expect(markup).not.toContain('versions__ceremony-row');
  });
});

// The pen's own form-scoped live region (260917-e5k, the pending todo
// file's middle row): a refused save and a failed write speak here,
// beside the controls and the kept draft, because the pen stays open —
// mirrors BatchRow.test.jsx's own form-status block (~892-912).
describe('VersionRow — the plan pen\'s own form-status live region', () => {
  it('renders a role="status" region after the From-batch field and before the ceremony', () => {
    const markup = renderVersionRow({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [],
      canSaveOver: true,
      formStatus: 'Check the version. Your changes have been kept.',
    });
    expect(markup).toContain('class="form-status"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('Check the version. Your changes have been kept.');
    const citationIndex = markup.indexOf('class="headnote__citation"');
    const formStatusIndex = markup.indexOf('class="form-status"');
    const ceremonyIndex = markup.indexOf('class="headnote__ceremony"');
    expect(citationIndex).not.toBe(-1);
    expect(formStatusIndex).not.toBe(-1);
    expect(ceremonyIndex).not.toBe(-1);
    expect(formStatusIndex).toBeGreaterThan(citationIndex);
    expect(ceremonyIndex).toBeGreaterThan(formStatusIndex);
  });

  it('renders the region empty (no text node) when formStatus is blank — mounted before any text arrives', () => {
    const markup = renderVersionRow({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [],
      canSaveOver: true,
      formStatus: '',
    });
    expect(markup).toMatch(/<p class="form-status" role="status" aria-live="polite"><\/p>/);
  });

  it('renders no .form-status at all in the reading branch (no pen open)', () => {
    const markup = renderVersionRow({ openPen: null });
    expect(markup).not.toContain('form-status');
  });
});
