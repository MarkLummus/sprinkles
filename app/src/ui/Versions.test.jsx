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

const emptyChurnDraft = {
  churnDate: '',
  asMade: {},
  stepChanges: {},
  comeUpMinutes: '',
  drawTempC: '',
  overrunPercent: '',
  drawNotes: '',
  ingredientNotes: '',
  nextTimeNote: '',
};

const emptyTastingDraft = {
  date: '',
  tastingTempC: '',
  marks: {},
  meltdownLossG: '',
  words: '',
  nextTimeNote: '',
};

function renderVersions(props) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <Versions
        version={oliveOilVersion}
        versions={[oliveOilVersion]}
        mode="reading"
        draft={null}
        penDraft={null}
        openBatch={null}
        batches={[]}
        versionIdsWithBatches={new Set()}
        citedBatch={null}
        blockedMessage={null}
        openPen={null}
        penReason={null}
        canSaveOver={true}
        penSaveDisabled={false}
        penHint={null}
        onStartDeveloping={noop}
        onCancelDeveloping={noop}
        onChangePenField={noop}
        onSaveAsNewVersion={noop}
        onSaveOverVersion={noop}
        onStartRecording={noop}
        onStartAmending={noop}
        onChangeChurnDate={noop}
        onCancelRecording={noop}
        onSaveBatch={noop}
        tastingDraft={null}
        onStartTasting={noop}
        onChangeTastingField={noop}
        onUseAsExpectedShortcut={noop}
        onSaveTasting={noop}
        onCancelTasting={noop}
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

  it('renders no Develop opener while a batch pen is open — the record ceremony replaces it (D-06)', () => {
    const markup = renderVersions({ openPen: 'record', penReason: 'a batch is being recorded', draft: emptyChurnDraft });
    expect(markup).not.toContain('>Develop<');
  });

  it('renders no Develop opener while the plan pen is open — the ceremony replaces it (D-06)', () => {
    const markup = renderVersions({ openPen: 'plan', penDraft: emptyPenDraft(), batches: [], canSaveOver: true });
    expect(markup).not.toContain('>Develop<');
  });

  it('renders "Record batch" when the version has no batch', () => {
    const markup = renderVersions({ openPen: null, openBatch: null, batches: [] });
    expect(markup).toContain('Record batch');
    expect(markup).not.toContain('Record another');
    expect(markup).not.toContain('>Amend<');
    expect(markup).not.toContain('Add tasting');
  });

  it('renders "Record another", Amend and Add tasting when a batch is in view', () => {
    const markup = renderVersions({ openPen: null, openBatch: augustSecondBatch, batches: [augustSecondBatch] });
    expect(markup).toContain('Record another');
    expect(markup).not.toContain('Record batch');
    expect(markup).toContain('>Amend<');
    expect(markup).toContain('Add tasting');
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
      penHint: 'a version needs a line',
    });
    expect(markup).toContain('a version needs a line');
  });
});

describe('Versions — the record and amend ceremony (D-05, D-10)', () => {
  it('renders the churn-date field and Cancel then Save, bound to onCancelRecording/onSaveBatch', () => {
    const markup = renderVersions({ openPen: 'record', draft: { ...emptyChurnDraft, churnDate: '2026-08-09' } });
    expect(markup).toMatch(/<input[^>]*type="date"[^>]*class="ink-field"[^>]*value="2026-08-09"/);
    const cancelIndex = markup.indexOf('Cancel');
    const saveIndex = markup.indexOf('>Save<');
    expect(cancelIndex).toBeGreaterThanOrEqual(0);
    expect(saveIndex).toBeGreaterThan(cancelIndex);
  });

  it('renders the same ceremony while amending', () => {
    const markup = renderVersions({ openPen: 'amend', draft: { ...emptyChurnDraft, churnDate: '2026-08-02' } });
    expect(markup).toMatch(/<input[^>]*type="date"[^>]*value="2026-08-02"/);
    expect(markup).toContain('Cancel');
    expect(markup).toContain('>Save<');
  });
});

describe('Versions — the tasting ceremony (D-05, D-10)', () => {
  it('renders the tasting-date field, the As expected shortcut, then Cancel then Save', () => {
    const markup = renderVersions({ openPen: 'tasting', tastingDraft: emptyTastingDraft });
    expect(markup).toMatch(/<input[^>]*type="date"[^>]*class="ink-field"[^>]*autofocus=""/);
    expect(markup).toContain('As expected, nothing to note');
    const shortcutIndex = markup.indexOf('As expected, nothing to note');
    const cancelIndex = markup.indexOf('Cancel');
    const saveIndex = markup.indexOf('>Save<');
    expect(cancelIndex).toBeGreaterThan(shortcutIndex);
    expect(saveIndex).toBeGreaterThan(cancelIndex);
  });

  it('disables Save and shows the hint when the tasting is not saveable', () => {
    const markup = renderVersions({
      openPen: 'tasting',
      tastingDraft: emptyTastingDraft,
      penSaveDisabled: true,
      penHint: 'Write words or mark at least one axis to save.',
    });
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Save<\/button>/);
    expect(markup).toContain('Write words or mark at least one axis to save.');
  });

  it('leaves Save enabled with no hint when the tasting is saveable', () => {
    const markup = renderVersions({
      openPen: 'tasting',
      tastingDraft: { ...emptyTastingDraft, words: 'Good batch' },
      penSaveDisabled: false,
      penHint: null,
    });
    expect(markup).not.toMatch(/<button[^>]*disabled=""[^>]*>Save<\/button>/);
    expect(markup).not.toContain('Write words or mark at least one axis to save.');
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

describe('Versions — the version list, moved inside (D-07)', () => {
  it('renders the version strip nav inside the region', () => {
    const markup = renderVersions({ versions: [oliveOilVersion] });
    expect(markup).toContain('version-strip');
    expect(markup).toContain(oliveOilVersion.versionLabel);
  });

  it('renders a single version as a list, not nothing (no early return)', () => {
    const markup = renderVersions({ versions: [oliveOilVersion] });
    expect(markup).toMatch(/<ul class="version-strip__list">/);
  });
});

describe('Versions — the lineage, as labelled lines (D-08)', () => {
  it('renders no lineage at all for a root version', () => {
    const markup = renderVersions({ version: oliveOilVersion });
    expect(markup).not.toContain('versions__lineage');
  });

  it('renders Parent, Batch and Reason as labelled lines for a child version', () => {
    const markup = renderVersions({
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
    const markup = renderVersions({
      version: { ...childVersion, citedBatchId: null },
      citedBatch: null,
      parentVersion: oliveOilVersion,
    });
    expect(markup).toContain('Parent');
    expect(markup).not.toContain('Batch');
  });

  it('reads "no reason recorded" when the child carries no reason', () => {
    const markup = renderVersions({
      version: { ...childVersion, reason: null },
      citedBatch: augustSecondBatch,
      parentVersion: oliveOilVersion,
    });
    expect(markup).toContain('no reason recorded');
  });

  it('renders Show changes only when the live parent was read', () => {
    const withParent = renderVersions({
      version: childVersion,
      citedBatch: augustSecondBatch,
      parentVersion: oliveOilVersion,
    });
    expect(withParent).toContain('Show changes');
    expect(withParent).toContain('headnote__show-changes');

    const withoutParent = renderVersions({ version: childVersion, citedBatch: augustSecondBatch, parentVersion: null });
    expect(withoutParent).not.toContain('Show changes');
  });

  it('renders Parent and Batch as plain text, not links, while a pen is open', () => {
    const markup = renderVersions({
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

describe('Versions — the batch list, always a list (D-09)', () => {
  it('reads "no batch yet" with no batch recorded', () => {
    const markup = renderVersions({ batches: [] });
    expect(markup).toMatch(/<ul class="batch-margin__list"><li>no batch yet<\/li><\/ul>/);
  });

  it('renders a single batch as a list entry, "churned <date>", an ink link', () => {
    const markup = renderVersions({ batches: [augustSecondBatch], openBatch: null });
    expect(markup).toMatch(/<li[^>]*><a[^>]*href="\/recipe\/olive-oil-ice-cream-v1\/batch\/[^"]+"[^>]*>churned 2 Aug 2026<\/a><\/li>/);
  });

  it('renders the open batch as plain text with the is-open class, not a link', () => {
    const markup = renderVersions({ batches: [augustSecondBatch], openBatch: augustSecondBatch });
    expect(markup).toMatch(/<li class="is-open">churned 2 Aug 2026<\/li>/);
  });

  it('renders no links in the batch list while a pen is open', () => {
    const markup = renderVersions({
      batches: [augustSecondBatch],
      openBatch: augustSecondBatch,
      openPen: 'plan',
      penDraft: emptyPenDraft(),
      canSaveOver: true,
    });
    expect(markup).not.toMatch(/<a[^>]*\/batch\//);
    expect(markup).toContain('churned 2 Aug 2026');
  });
});
