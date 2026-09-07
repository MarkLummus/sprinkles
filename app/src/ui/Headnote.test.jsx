// Component test for the headnote's save ceremony and lineage line
// (route-recipe-version.md § 3). In the existing style — renderToStaticMarkup
// (react-dom/server) in the node test environment, no jsdom, no
// testing-library, no new dependency. Wrapped in a MemoryRouter because the
// lineage line renders react-router Links, which throw outside a router
// context even under static rendering.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Headnote } from './Headnote.jsx';
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

function renderHeadnote(props) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <Headnote
        version={oliveOilVersion}
        mode="reading"
        draft={null}
        penDraft={null}
        openBatch={null}
        batches={[]}
        citedBatch={null}
        blockedMessage={null}
        onChangeChurnDate={noop}
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

describe('Headnote — the ceremony renders nothing pre-filled', () => {
  it('renders a blank version line, a blank reason and no chosen citation', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: emptyPenDraft(),
      batches: [augustSecondBatch],
    });
    expect(markup).toMatch(/<input[^>]*aria-label="Version line"[^>]*value=""/);
    expect(markup).toContain('<textarea');
    expect(markup).not.toContain('value="60 g oil');
    expect(markup).toMatch(/<option value="" selected="">no batch cited<\/option>/);
  });

  it('renders "no batch to cite" when the parent has no batch', () => {
    const markup = renderHeadnote({ mode: 'developing', penDraft: emptyPenDraft(), batches: [] });
    expect(markup).toContain('no batch to cite');
  });
});

describe('Headnote — the two save controls, gated by whether the version has a batch', () => {
  it('a churned version renders "Save as a new version" and not "Save over this version"', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: emptyPenDraft(),
      batches: [augustSecondBatch],
    });
    expect(markup).toContain('Save as a new version');
    expect(markup).not.toContain('Save over this version');
  });

  it('an unchurned version renders both save controls', () => {
    const markup = renderHeadnote({ mode: 'developing', penDraft: emptyPenDraft(), batches: [] });
    expect(markup).toContain('Save as a new version');
    expect(markup).toContain('Save over this version');
  });
});

describe('Headnote — a blocked save is stated in words beside the controls', () => {
  it('renders "a version needs a line" for a blank version line', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: emptyPenDraft(),
      batches: [],
      blockedMessage: 'a version needs a line',
    });
    expect(markup).toContain('a version needs a line');
    expect(markup).toContain('Save as a new version');
  });

  it('renders "another version already has this line" for a duplicate', () => {
    const markup = renderHeadnote({
      mode: 'developing',
      penDraft: emptyPenDraft({ versionLabel: '50 g oil · 800 g' }),
      batches: [],
      blockedMessage: 'another version already has this line',
    });
    expect(markup).toContain('another version already has this line');
  });
});

describe('Headnote — the saved child reads its lineage', () => {
  const childWithReason = {
    ...oliveOilVersion,
    id: 'v2',
    parentVersionId: 'olive-oil-ice-cream-v1',
    parentVersionLabel: '50 g oil · 800 g',
    citedBatchId: augustSecondBatch.id,
    reason: 'raised the oil to taste less of the milk',
    versionLabel: '60 g oil · 800 g',
  };

  it('renders the lineage line with two links and the reason paragraph', () => {
    const markup = renderHeadnote({ version: childWithReason, mode: 'reading', citedBatch: augustSecondBatch });
    expect(markup).toContain('href="/recipe/olive-oil-ice-cream-v1"');
    expect(markup).toContain(`href="/recipe/olive-oil-ice-cream-v1/batch/${augustSecondBatch.id}"`);
    expect(markup).toContain('50 g oil · 800 g');
    expect(markup).toContain('raised the oil to taste less of the milk');
  });

  it('renders "no reason recorded" for a blank reason', () => {
    const markup = renderHeadnote({
      version: { ...childWithReason, reason: null },
      mode: 'reading',
      citedBatch: augustSecondBatch,
    });
    expect(markup).toContain('no reason recorded');
  });

  it('omits the batch clause entirely when no batch was cited', () => {
    const markup = renderHeadnote({
      version: { ...childWithReason, citedBatchId: null },
      mode: 'reading',
      citedBatch: null,
    });
    expect(markup).not.toContain('after the batch of');
    expect(markup).toContain('href="/recipe/olive-oil-ice-cream-v1"');
  });

  it('a version with no parent carries no lineage line at all', () => {
    const markup = renderHeadnote({ version: oliveOilVersion, mode: 'reading' });
    expect(markup).not.toContain('headnote__lineage');
    expect(markup).not.toContain('no reason recorded');
  });
});

describe('Headnote — the show-changes toggle (D-02, D-10)', () => {
  const childWithReason = {
    ...oliveOilVersion,
    id: 'v2',
    parentVersionId: 'olive-oil-ice-cream-v1',
    parentVersionLabel: '50 g oil · 800 g',
    citedBatchId: augustSecondBatch.id,
    reason: 'raised the oil to taste less of the milk',
    versionLabel: '60 g oil · 800 g',
  };

  it('renders one toggle carrying aria-pressed and the parent line, when the parent record is read', () => {
    const markup = renderHeadnote({
      version: childWithReason,
      mode: 'reading',
      citedBatch: augustSecondBatch,
      parentVersion: oliveOilVersion,
      showingChanges: false,
    });
    expect(markup).toMatch(/aria-pressed="false"[^>]*>show changes from 50 g oil · 800 g<\/button>/);
  });

  it('carries aria-pressed="true" once the state is on', () => {
    const markup = renderHeadnote({
      version: childWithReason,
      mode: 'reading',
      citedBatch: augustSecondBatch,
      parentVersion: oliveOilVersion,
      showingChanges: true,
    });
    expect(markup).toMatch(/aria-pressed="true"[^>]*>show changes from 50 g oil · 800 g<\/button>/);
  });

  it('omits the toggle when the parent record cannot be read, and still names the parent from parentVersionLabel', () => {
    const markup = renderHeadnote({
      version: childWithReason,
      mode: 'reading',
      citedBatch: augustSecondBatch,
      parentVersion: null,
    });
    expect(markup).not.toContain('show changes from');
    expect(markup).not.toContain('headnote__show-changes');
    expect(markup).toContain('50 g oil · 800 g');
  });
});

describe('Headnote — the one-pen interlock reads openPen, not mode (D-10, D-UAT-1)', () => {
  it('disables Develop the next version and states its reason while a batch is being recorded — the fifth leak, where the control renders a bare disabled attribute today', () => {
    const markup = renderHeadnote({
      mode: 'reading',
      openPen: 'record',
      penReason: 'a batch is being recorded',
    });
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Develop the next version<\/button>/);
    expect(markup).toContain('a batch is being recorded');
  });

  it('disables Develop the next version while a tasting is being written — the Develop half of RC2', () => {
    const markup = renderHeadnote({
      mode: 'reading',
      openPen: 'tasting',
      penReason: 'a tasting is being written',
    });
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Develop the next version<\/button>/);
  });

  it('renders no disabled attribute and no reason line with no pen open', () => {
    const markup = renderHeadnote({
      mode: 'reading',
      openPen: null,
      penReason: null,
    });
    expect(markup).not.toMatch(/<button[^>]*disabled=""[^>]*>Develop the next version<\/button>/);
    expect(markup).not.toContain('unavailable while');
  });
});

describe('Headnote — a figure outside its band changes nothing about the ceremony', () => {
  it('renders exactly the same controls whether the version is inside or outside its bands', () => {
    const outOfBand = {
      ...oliveOilVersion,
      rows: oliveOilVersion.rows.map((row) => (row.id === 'row-03' ? { ...row, grams: 999 } : row)),
    };
    const penDraft = emptyPenDraft();
    const inBandMarkup = renderHeadnote({ version: oliveOilVersion, mode: 'developing', penDraft, batches: [] });
    const outOfBandMarkup = renderHeadnote({ version: outOfBand, mode: 'developing', penDraft, batches: [] });
    expect(inBandMarkup).toBe(outOfBandMarkup);
  });
});

describe('Headnote — the lineage line is not a way off the page while a pen is open (D-UAT-2)', () => {
  const childWithReason = {
    ...oliveOilVersion,
    id: 'v2',
    parentVersionId: 'olive-oil-ice-cream-v1',
    parentVersionLabel: '50 g oil · 800 g',
    citedBatchId: augustSecondBatch.id,
    reason: 'raised the oil to taste less of the milk',
    versionLabel: '60 g oil · 800 g',
  };

  it('renders no anchor for the lineage line while a pen is open, still reads the parent line and the cited batch date in words, and carries the reason', () => {
    const markup = renderHeadnote({
      version: childWithReason,
      mode: 'reading',
      citedBatch: augustSecondBatch,
      openPen: 'plan',
      penReason: 'the plan is being developed',
    });
    expect(markup).not.toContain('<a ');
    expect(markup).toContain('50 g oil · 800 g');
    expect(markup).toContain('after the batch of');
    expect(markup).toContain('These links are unavailable while the plan is being developed.');
  });

  it('still renders the show-changes toggle while a pen is open, since it is not a way off the page', () => {
    const markup = renderHeadnote({
      version: childWithReason,
      mode: 'reading',
      citedBatch: augustSecondBatch,
      parentVersion: oliveOilVersion,
      showingChanges: false,
      openPen: 'plan',
      penReason: 'the plan is being developed',
    });
    expect(markup).toMatch(/aria-pressed="false"[^>]*>show changes from 50 g oil · 800 g<\/button>/);
  });

  it('renders the lineage line with its two links exactly as today with no pen open', () => {
    const markup = renderHeadnote({
      version: childWithReason,
      mode: 'reading',
      citedBatch: augustSecondBatch,
      openPen: null,
      penReason: null,
    });
    expect(markup).toContain('href="/recipe/olive-oil-ice-cream-v1"');
    expect(markup).toContain(`href="/recipe/olive-oil-ice-cream-v1/batch/${augustSecondBatch.id}"`);
    expect(markup).not.toContain('unavailable while');
  });
});
