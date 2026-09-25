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
    sheetTitle: oliveOilVersion.sheetTitle,
    sheetDescription: oliveOilVersion.sheetDescription,
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
  // The child needs a creation date of its own, distinct from the seed's,
  // or no assertion here can tell the child's date from the parent's.
  createdAt: '2026-08-05T00:00:00.000Z',
};

// The section itself still carries no page-level running head of its own
// (ROADMAP Scope bullet 1). The sketch's own bare "Version" region-name
// heading (sketch 003 variant B, G-03.3-4) is retired in favour of the
// identity line (route-recipe.md § 6 "One version identity, wherever a
// version is named", 2026-09-18) — the same string the history register
// prints for this version, minus "In view".
describe('VersionRow — the identity heading (route-recipe.md § 6, 2026-09-18)', () => {
  it('renders the section with an aria-label of Version and the identity heading, with Latest for the only version there is', () => {
    const markup = renderVersionRow({});
    expect(markup).toContain('aria-label="Version"');
    expect(markup).toContain(
      '<h2 class="notebook-version__identity">Version 1 · 50 g oil · 800 g<span class="notebook-version__latest"> · Latest</span></h2>',
    );
  });

  it('reads as App front matter: a section reading .notebook-version (03.5-04 Task 2), with a "Version" caption before the identity heading', () => {
    const markup = renderVersionRow({});
    expect(markup).toContain('<section class="notebook-version" aria-label="Version"');
    expect(markup).toMatch(/<span class="notebook-caption">Version<\/span>/);
  });

  it('renders no bare "Version" region-name heading', () => {
    const markup = renderVersionRow({});
    expect(markup).not.toMatch(/<h2 class="region-name">Version<\/h2>/);
  });

  it('reads the word "Version" exactly once in the identity line', () => {
    const markup = renderVersionRow({});
    const heading = markup.match(/<h2 class="notebook-version__identity"[^>]*>[\s\S]*?<\/h2>/)[0];
    expect((heading.match(/Version/g) ?? []).length).toBe(1);
  });

  it('gives a middle version of a four-version set its own ordinal and no Latest', () => {
    const root = { ...oliveOilVersion, id: 'root', parentVersionId: null, createdAt: '2026-01-01T00:00:00.000Z' };
    const child = { ...oliveOilVersion, id: 'child', parentVersionId: 'root', versionLabel: 'child line', createdAt: '2026-02-01T00:00:00.000Z' };
    const sibling = { ...oliveOilVersion, id: 'sibling', parentVersionId: 'root', versionLabel: 'sibling line', createdAt: '2026-03-01T00:00:00.000Z' };
    const grandchild = { ...oliveOilVersion, id: 'grandchild', parentVersionId: 'child', versionLabel: 'grandchild line', createdAt: '2026-04-01T00:00:00.000Z' };
    const fourVersions = [root, child, sibling, grandchild];
    const markup = renderVersionRow({ version: child, versions: fourVersions, citedBatch: null, parentVersion: root });
    expect(markup).toContain('Version 2 · child line');
    const heading = markup.match(/<h2 class="notebook-version__identity"[^>]*>[\s\S]*?<\/h2>/)[0];
    expect(heading).not.toContain('Latest');
  });

  it('gives two siblings of one parent consecutive ordinals', () => {
    const root = { ...oliveOilVersion, id: 'root', parentVersionId: null, createdAt: '2026-01-01T00:00:00.000Z' };
    const child = { ...oliveOilVersion, id: 'child', parentVersionId: 'root', versionLabel: 'child line', createdAt: '2026-02-01T00:00:00.000Z' };
    const sibling = { ...oliveOilVersion, id: 'sibling', parentVersionId: 'root', versionLabel: 'sibling line', createdAt: '2026-03-01T00:00:00.000Z' };
    const grandchild = { ...oliveOilVersion, id: 'grandchild', parentVersionId: 'child', versionLabel: 'grandchild line', createdAt: '2026-04-01T00:00:00.000Z' };
    const fourVersions = [root, child, sibling, grandchild];
    const childMarkup = renderVersionRow({ version: child, versions: fourVersions, citedBatch: null, parentVersion: root });
    const siblingMarkup = renderVersionRow({ version: sibling, versions: fourVersions, citedBatch: null, parentVersion: root });
    const childOrdinal = Number(childMarkup.match(/Version (\d+) · child line/)[1]);
    const siblingOrdinal = Number(siblingMarkup.match(/Version (\d+) · sibling line/)[1]);
    expect(Math.abs(childOrdinal - siblingOrdinal)).toBe(1);
  });

  it('never renders "In view" on the version row', () => {
    const markup = renderVersionRow({});
    expect(markup).not.toContain('In view');
  });

  it('renders the authored line alone during the pre-load paint — no guessed ordinal, but the heading still exists', () => {
    const markup = renderVersionRow({ version: oliveOilVersion, versions: [] });
    expect(markup).toContain('50 g oil · 800 g');
    expect(markup).not.toContain('Version 1');
    expect(markup).toMatch(/<h2 class="notebook-version__identity"[^>]*>/);
  });

  it('lands D-27\'s programmatic focus on the identity heading, carrying tabindex and no aria-label', () => {
    const markup = renderVersionRow({ focusVersionOnMount: true });
    expect(markup).toMatch(/<h2[^>]*class="notebook-version__identity[^"]*"[^>]*tabindex="-1"/);
    const heading = markup.match(/<h2[^>]*class="notebook-version__identity[^"]*"[^>]*>/)[0];
    expect(heading).not.toContain('aria-label');
    // The focus CALL itself cannot be driven here — there is no jsdom in
    // this suite, so useEffect never runs against a real DOM. Covered by
    // the browser checkpoint (D-27), not this render-level assertion.
  });

  it('carries no anti-goal form for the ordinal — no v1, #1, 1st, or zero-padding', () => {
    const markup = renderVersionRow({});
    expect(markup).not.toContain('v1');
    expect(markup).not.toContain('#1');
    expect(markup).not.toContain('1st');
    expect(markup).not.toContain('Version 01');
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
    expect(markup).toContain('Next version · draft from Version 1');
  });

  it('renders no Develop opener while a batch pen is open — this row renders nothing at the top for a pen it does not own', () => {
    const markup = renderVersionRow({ openPen: 'record' });
    expect(markup).not.toContain('>Next version<');
  });

  it('renders no Amend/Add tasting group — those still live in BatchRow', () => {
    const markup = renderVersionRow({ openPen: null });
    expect(markup).not.toContain('>Amend<');
    expect(markup).not.toContain('Add tasting');
  });

  // 03.5-07 Task 1: the Record opener moves from here to BatchRow.jsx's
  // own head, beside Batches and Correct (decisions_recorded 1) — this
  // row's acts group now holds only Next version and, once a parent
  // exists, Show changes.
  it('renders no Record opener of any kind — it lives in BatchRow.jsx now', () => {
    const markup = renderVersionRow({ openPen: null });
    expect(markup).toContain('Next version');
    expect(markup).not.toContain('Record another');
    expect(markup).not.toContain('Record batch');
    expect(markup).not.toContain('Record a batch');
  });

});

// 03.5-04 Task 3: the pen's own ceremony now lives entirely in
// VersionRow.jsx — a <form class="notebook-ceremony">, the Version name
// field moved whole from Headnote (keeping required/autoFocus/the
// blocked-attempt focus effect/FieldFeedback), the Why field restyled in
// the hand, and From batch reading a single checkbox when exactly one
// batch is citable (decisions_recorded 5).
describe('VersionRow — the ceremony (Task 3, 1600-pen.html)', () => {
  it('renders a form.notebook-ceremony with the draft-from caption naming the parent\'s own ordinal', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toMatch(/<form class="notebook-ceremony" aria-label="Next version"/);
    expect(markup).toContain('Next version · draft from Version 1');
  });

  it('renders a Version name field with the new placeholder and a "was ..." helper, never the old Sheet-context aria-label', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toMatch(/<input[^>]*placeholder="e\.g\. less oil"[^>]*aria-label="Version name"/);
    expect(markup).toContain('was 50 g oil · 800 g');
  });

  it('renders the Why textarea with the new placeholder, in the hand', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toMatch(/<textarea[^>]*placeholder="what this version is for, in your words"[^>]*aria-label="Why"/);
    expect(markup).toMatch(/<textarea[^>]*class="notebook-ceremony__why"/);
  });

  it('renders a single citable batch as one checkbox labelled "date · at-the-machine words", unchecked when nothing is cited', () => {
    const markup = renderVersionRow({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [augustSecondBatch],
      canSaveOver: false,
    });
    expect(markup).toMatch(/<legend class="notebook-caption">From batch<\/legend>/);
    expect(markup).toMatch(/<input type="checkbox"[^>]*\/>2 Aug 2026 · Soft, not greasy/);
    expect(markup).not.toContain('checked=""');
    expect(markup).not.toContain('<select');
  });

  it('checks the single citable-batch checkbox once it is cited, and toggling reads through onChangePenField', () => {
    const markup = renderVersionRow({
      openPen: 'plan',
      penDraft: { ...emptyPenDraft(), citedBatchId: augustSecondBatch.id },
      batches: [augustSecondBatch],
      canSaveOver: false,
    });
    expect(markup).toMatch(/<input type="checkbox"[^>]*checked=""/);
  });

  it('renders "no batch" as plain text — no fieldset control — when the version has no batch', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toContain('no batch');
    expect(markup).not.toContain('<select');
    expect(markup).not.toContain('type="checkbox"');
  });

  it('keeps the existing select once more than one batch is citable', () => {
    const secondBatch = { ...augustSecondBatch, id: 'second-batch', churn: { ...augustSecondBatch.churn, churnDate: '2026-08-09' } };
    const markup = renderVersionRow({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [augustSecondBatch, secondBatch],
      canSaveOver: false,
    });
    expect(markup).toContain('<select');
    expect(markup).toMatch(/<option value="" selected="">no batch cited<\/option>/);
  });

  it('renders Cancel (outline) then Save as a new version (filled) in DOM order, with Save over this version last only when canSaveOver', () => {
    const withoutOver = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [augustSecondBatch], canSaveOver: false });
    const cancelIndex = withoutOver.indexOf('Cancel');
    const saveIndex = withoutOver.indexOf('Save as a new version');
    expect(cancelIndex).toBeGreaterThanOrEqual(0);
    expect(saveIndex).toBeGreaterThan(cancelIndex);
    expect(withoutOver).not.toContain('Save over this version');
    expect(withoutOver).toMatch(/<button type="button" class="notebook-action--outline"[^>]*>Cancel<\/button>/);
    expect(withoutOver).toMatch(/<button type="button" class="notebook-action"[^>]*>Save as a new version<\/button>/);

    const withOver = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    const saveAsIndex = withOver.indexOf('Save as a new version');
    const saveOverIndex = withOver.indexOf('Save over this version');
    expect(saveOverIndex).toBeGreaterThan(saveAsIndex);
    expect(withOver).toMatch(/<button type="button" class="notebook-action--outline"[^>]*>Save over this version<\/button>/);
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
    expect(markup).toMatch(/<button type="button" class="notebook-action--outline" disabled="">Cancel<\/button>/);
    expect(markup).toMatch(/<button type="button" class="notebook-action" disabled="">Saving new version…<\/button>/);
    expect(markup).toMatch(/<input type="checkbox"[^>]*disabled=""/);
    expect(markup).toMatch(/<textarea[^>]*disabled=""/);
  });

  it('connects a blocked Version name field to its visible error and marks it invalid', () => {
    const markup = renderVersionRow({
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      batches: [],
      canSaveOver: true,
      versionLineError: 'Enter a version.',
    });
    expect(markup).toMatch(/<input[^>]*aria-invalid="true"[^>]*aria-describedby="version-field-error"/);
    expect(markup).toContain('<span id="version-field-error" class="field-error">Enter a version.</span>');
  });
});

// 03.5-04 Task 3: the pen ceremony states the parent through its own
// caption ("Next version · draft from Version N") and the Version name
// field's "was ..." helper — no dl, no Written/Why metadata repeated.
describe('VersionRow — the parent is stated as provenance for the draft', () => {
  it('names the parent in the caption and the helper, with no dl and no old Written/Why metadata', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toContain(`Next version · draft from Version 1`);
    expect(markup).toContain(`was ${oliveOilVersion.versionLabel}`);
    expect(markup).not.toContain('<dl');
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
    const markup = renderVersionRow({ openPen: 'record' });
    expect(markup).not.toContain('Links return after you save or cancel.');
  });

  it('renders no hint sentence with no pen open', () => {
    const markup = renderVersionRow({ openPen: null });
    expect(markup).not.toContain('Links return after you save or cancel.');
  });
});

// The History disclosure and its panel retired from this component
// (03.5-05): the rail now renders directly in RecipePage.jsx as
// RecipeHistory, outside the version column. RecipeHistory.test.jsx owns
// the rail's own lineage, routes and marks.
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

  it('keeps a root version with no written date readable instead of throwing', () => {
    const undated = { ...oliveOilVersion, createdAt: null };
    const markup = renderVersionRow({ version: undated, versions: [undated] });
    expect(markup).toContain('class="versions__lineage version-row__written">date unknown</dd>');
  });

  it('renders From version (never bare "From"), a Written line of the child\'s own date, From batch and Why for a child version', () => {
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
    expect(markup).toContain('From batch');
    expect(markup).toContain('Why');
    expect(markup).toContain(childVersion.reason);
    expect(markup).toContain('class="version-row__reason prose-text"');
    expect(markup).toContain(oliveOilVersion.versionLabel);
  });

  // VROW-01/VROW-02: the folded value hid two facts — the child's own
  // written date, and a From-version value that must carry the parent
  // alone. This case pins both once the fold is gone.
  it("prints the child's own written date under its own term, and leaves From version carrying the parent alone", () => {
    const markup = renderVersionRow({
      version: childVersion,
      versions: [oliveOilVersion, childVersion],
      citedBatch: augustSecondBatch,
      parentVersion: oliveOilVersion,
    });
    expect(markup).toMatch(/<dt class="versions__lineage-label">Written<\/dt>/);
    expect(markup).toMatch(/<dd class="versions__lineage version-row__written">5 Aug 2026<\/dd>/);
    const fromVersionValue = markup.match(/<dt[^>]*>From version<\/dt><dd[^>]*>(.*?)<\/dd>/)[1];
    expect(fromVersionValue).toContain(oliveOilVersion.versionLabel);
    expect(fromVersionValue).not.toContain('5 Aug 2026');
    expect(fromVersionValue).not.toContain('1 Jul 2026');
    expect(fromVersionValue).not.toContain('written');
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
    expect(withParent).toContain('notebook-link');

    const withoutParent = renderVersionRow({ version: childVersion, citedBatch: augustSecondBatch, parentVersion: null });
    expect(withoutParent).not.toContain('Show changes');
  });

  // 03.5-04 Task 2: Show changes reads as an App control now (.notebook-link),
  // its aria-pressed state carrying the toggle — App context reads its own
  // controls, not the Sheet's .text-control/.text-toggle pair (03.3-06
  // checkpoint feedback's own square-and-word toggle stays a Sheet-only
  // convention).
  it('renders Show changes carrying the notebook-link class and aria-pressed', () => {
    const markup = renderVersionRow({
      version: childVersion,
      citedBatch: augustSecondBatch,
      parentVersion: oliveOilVersion,
    });
    expect(markup).toMatch(/<button[^>]*class="notebook-link"[^>]*aria-pressed="false"[^>]*>Show changes<\/button>/);
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
    expect(markup).not.toMatch(/<a[^>]*href="\/notebook\/olive-oil-ice-cream\/olive-oil-ice-cream-v1"/);
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
// developing) and the History disclosure (while open) — matching sketch 003
// variant B's own `.vmeta`/`.ceremony`/`.list` siblings (index.html:208-233).
describe('VersionRow — the saved metadata transforms into the next-version ceremony', () => {
  it('wraps the reading-mode stack in a "notebook-version" section (03.5-04 Task 2: App front matter, not the Sheet\'s vmeta)', () => {
    const markup = renderVersionRow({});
    expect(markup).toMatch(/<section class="notebook-version" aria-label="Version">/);
  });

  it('renders the acts group (Next version, Show changes) AFTER the dl, matching the sketch\'s own dl-then-acts order', () => {
    const markup = renderVersionRow({
      openPen: null,
      version: childVersion,
      citedBatch: augustSecondBatch,
      parentVersion: oliveOilVersion,
    });
    const dlIndex = markup.indexOf('notebook-version__details');
    const actsIndex = markup.indexOf('notebook-version__acts');
    const showChangesIndex = markup.lastIndexOf('Show changes');
    expect(dlIndex).toBeGreaterThanOrEqual(0);
    expect(actsIndex).toBeGreaterThan(dlIndex);
    expect(showChangesIndex).toBeGreaterThan(actsIndex);
  });

  it('renders Next version with the filled-action class (03.5-04 Task 2)', () => {
    const markup = renderVersionRow({ openPen: null });
    expect(markup).toMatch(/<button[^>]*class="notebook-action"[^>]*>Next version<\/button>/);
  });

  it('renders the ceremony as a form in the band, not the old vmeta section (Task 3)', () => {
    const markup = renderVersionRow({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).toMatch(/<form class="notebook-ceremony" aria-label="Next version"/);
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
  it('renders a role="status" region after the From-batch field and before the actions', () => {
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
    const citationIndex = markup.indexOf('notebook-ceremony__batch-fieldset');
    const formStatusIndex = markup.indexOf('class="form-status"');
    const actionsIndex = markup.indexOf('notebook-ceremony__actions');
    expect(citationIndex).not.toBe(-1);
    expect(formStatusIndex).not.toBe(-1);
    expect(actionsIndex).not.toBe(-1);
    expect(formStatusIndex).toBeGreaterThan(citationIndex);
    expect(actionsIndex).toBeGreaterThan(formStatusIndex);
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

// G-03.4-r4-1 (.claude/CLAUDE.md convention): every link carries an
// explicit tabindex. The History panel starts closed, so its own links
// are pinned in RecipeHistory.test.jsx, not here.
describe('VersionRow — every link carries an explicit tabindex (G-03.4-r4-1)', () => {
  it('renders exactly 2 <a> opening tags — From version, From batch — each carrying tabindex="0"', () => {
    const markup = renderVersionRow({
      version: childVersion,
      versions: [oliveOilVersion, childVersion],
      citedBatch: augustSecondBatch,
      parentVersion: oliveOilVersion,
    });
    const tags = markup.match(/<a\b[^>]*>/g) ?? [];
    expect(tags).toHaveLength(2);
    for (const tag of tags) {
      expect(tag).toContain('tabindex="0"');
    }
  });

  // 03.5-02 Task 2 (D-17): both lineage links move to the Notebook form,
  // built with the child's own recipeId.
  it('builds the From version and From batch hrefs with notebookPath (D-17)', () => {
    const markup = renderVersionRow({
      version: childVersion,
      versions: [oliveOilVersion, childVersion],
      citedBatch: augustSecondBatch,
      parentVersion: oliveOilVersion,
    });
    expect(markup).toContain('href="/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1"');
    expect(markup).toContain(`href="/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/${augustSecondBatch.id}"`);
  });
});
