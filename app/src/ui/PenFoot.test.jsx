// Component test for the foot band — every pen's own Cancel/Save pair,
// repeated once at the foot of the page under a hairline rule
// (route-recipe.md § 3 "The imprint"; D-26). Rebuilt for 03.3.1-02's
// one-save model: the record and amend pens now share the exported
// SaveCeremony component with BatchRow's own end-of-record mount (D-01),
// and the tasting pen's own branch (its gated Save, its own hint) retires
// with the tasting pen itself. In the existing house style:
// renderToStaticMarkup (react-dom/server), the node test environment, no
// jsdom, no testing-library, no click driver — only what static markup
// can prove (RESEARCH.md Pitfall 4).
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PenFoot, SaveCeremony } from './PenFoot.jsx';

const noop = () => {};

function renderPenFoot(props) {
  return renderToStaticMarkup(
    <PenFoot
      openPen={null}
      canSaveOver={true}
      penHint={null}
      tastingOpen={false}
      onCancelDeveloping={noop}
      onSaveAsNewVersion={noop}
      onSaveOverVersion={noop}
      onCancelRecording={noop}
      onSaveBatch={noop}
      onAddTasting={noop}
      {...props}
    />
  );
}

describe('PenFoot — renders only while a pen is open', () => {
  it('renders nothing when openPen is null', () => {
    expect(renderPenFoot({ openPen: null })).toBe('');
  });

  it('renders the rule and the pair when openPen is "plan"', () => {
    const markup = renderPenFoot({ openPen: 'plan' });
    expect(markup).toContain('pen-foot__rule');
    expect(markup).toContain('Cancel');
    expect(markup).toContain('Save');
  });
});

describe('PenFoot — the plan pair matches the ceremony, Cancel first, gated by canSaveOver (D-10, D-26)', () => {
  it('renders Cancel then Save, never Save as, when canSaveOver is false', () => {
    const markup = renderPenFoot({ openPen: 'plan', canSaveOver: false });
    expect(markup).not.toContain('Save as');
    const cancelIndex = markup.indexOf('Cancel');
    const saveIndex = markup.indexOf('>Save<');
    expect(cancelIndex).toBeGreaterThanOrEqual(0);
    expect(saveIndex).toBeGreaterThan(cancelIndex);
  });

  it('renders Cancel, then Save as, then Save, when canSaveOver is true', () => {
    const markup = renderPenFoot({ openPen: 'plan', canSaveOver: true });
    const cancelIndex = markup.indexOf('Cancel');
    const saveAsIndex = markup.indexOf('Save as');
    const saveIndex = markup.lastIndexOf('>Save<');
    expect(cancelIndex).toBeGreaterThanOrEqual(0);
    expect(saveAsIndex).toBeGreaterThan(cancelIndex);
    expect(saveIndex).toBeGreaterThan(saveAsIndex);
  });
});

describe('PenFoot — the record and amend branch, the one save ceremony (D-01, D-02, D-05)', () => {
  it('renders Cancel then Save batch, bound to onCancelRecording/onSaveBatch, for the record pen', () => {
    const markup = renderPenFoot({ openPen: 'record' });
    expect(markup).toContain('class="save-ceremony"');
    const cancelIndex = markup.indexOf('Cancel');
    const saveIndex = markup.indexOf('Save batch');
    expect(cancelIndex).toBeGreaterThanOrEqual(0);
    expect(saveIndex).toBeGreaterThan(cancelIndex);
    expect(markup).not.toContain('Save as');
  });

  it('renders the same ceremony for the amend pen', () => {
    const markup = renderPenFoot({ openPen: 'amend' });
    expect(markup).toContain('class="save-ceremony"');
    expect(markup).toContain('Cancel');
    expect(markup).toContain('Save batch');
  });

  it('never disables Save batch — the record pen has no completeness gate (D-02)', () => {
    const markup = renderPenFoot({ openPen: 'record' });
    expect(markup).not.toContain('disabled=""');
  });

  it('renders the record pen\'s own blocked-date sentence as the ceremony\'s hint when set (D-05)', () => {
    const markup = renderPenFoot({ openPen: 'record', penHint: 'Enter the date you churned.' });
    expect(markup).toContain('class="save-ceremony__hint"');
    expect(markup).toContain('Enter the date you churned.');
  });

  it('renders no tasting branch at all — the tasting pen retires with 03.3.1-02', () => {
    const markup = renderPenFoot({ openPen: 'record' });
    expect(markup).not.toContain('isTastingSaveable');
    expect(markup).not.toContain('Save tasting');
  });
});

describe('PenFoot — Add tasting beside the foot ceremony while the section is absent (D-01, 03.3.1-03)', () => {
  it('renders Add tasting for the record pen when tastingOpen is false', () => {
    const markup = renderPenFoot({ openPen: 'record', tastingOpen: false });
    expect(markup).toContain('Add tasting');
  });

  it('renders Add tasting for the amend pen when tastingOpen is false', () => {
    const markup = renderPenFoot({ openPen: 'amend', tastingOpen: false });
    expect(markup).toContain('Add tasting');
  });

  it('renders no Add tasting control once the section is open', () => {
    const markup = renderPenFoot({ openPen: 'record', tastingOpen: true });
    expect(markup).not.toContain('Add tasting');
  });

  it('renders Add tasting inside the save ceremony, before Cancel — the ninth round\'s own order (D-14, 007 lines 302-307)', () => {
    const markup = renderPenFoot({ openPen: 'record', tastingOpen: false });
    const ceremonyIndex = markup.indexOf('class="save-ceremony"');
    const addTastingIndex = markup.indexOf('Add tasting');
    const cancelIndex = markup.indexOf('Cancel');
    expect(ceremonyIndex).toBeGreaterThanOrEqual(0);
    expect(addTastingIndex).toBeGreaterThan(ceremonyIndex);
    expect(cancelIndex).toBeGreaterThan(addTastingIndex);
  });

  it('renders no Add tasting while a restore is pending (the foot has no restore slot to fill its place)', () => {
    const markup = renderPenFoot({
      openPen: 'record',
      tastingOpen: false,
      pendingUndo: { tastedDate: '2026-08-11', temperingMinutes: '', tastingTempC: '', marks: {}, note: '', defects: [], bitterDeclared: false, meltTestG: '', meltStyle: '' },
    });
    expect(markup).not.toContain('Add tasting');
  });

  it('renders no Add tasting control for the plan pen', () => {
    const markup = renderPenFoot({ openPen: 'plan', tastingOpen: false });
    expect(markup).not.toContain('Add tasting');
  });
});

describe('PenFoot — the foot ceremony carries no restore control in any state (007 lines 310-314; the restore slot lives only on BatchRow\'s own mount, ceremony A)', () => {
  it('renders no restore control at all with no removal pending', () => {
    const markup = renderPenFoot({ openPen: 'record', tastingOpen: false, pendingUndo: null });
    expect(markup).not.toContain('Restore tasting');
    expect(markup).not.toContain('undo-control');
    expect(markup).not.toContain('save-ceremony__status');
  });

  it('renders no Restore tasting even while a removal is pending and the section is absent', () => {
    const markup = renderPenFoot({
      openPen: 'record',
      tastingOpen: false,
      pendingUndo: { tastedDate: '2026-08-11', temperingMinutes: '', tastingTempC: '', marks: {}, note: '', defects: [], bitterDeclared: false, meltTestG: '', meltStyle: '' },
    });
    expect(markup).not.toContain('Restore tasting');
    expect(markup).not.toContain('undo-control');
    expect(markup).not.toContain('save-ceremony__status');
  });

  it('renders no restore control for the amend pen either', () => {
    const markup = renderPenFoot({
      openPen: 'amend',
      tastingOpen: false,
      pendingUndo: { tastedDate: '', temperingMinutes: '', tastingTempC: '', marks: {}, note: '', defects: [], bitterDeclared: false, meltTestG: '', meltStyle: '' },
    });
    expect(markup).not.toContain('Restore tasting');
  });

  it('renders no restore control while the tasting section is open — the foot has no restore slot at any tastingOpen state', () => {
    const markup = renderPenFoot({
      openPen: 'record',
      tastingOpen: true,
      pendingUndo: { tastedDate: '2026-08-11', temperingMinutes: '', tastingTempC: '', marks: {}, note: '', defects: [], bitterDeclared: false, meltTestG: '', meltStyle: '' },
    });
    expect(markup).not.toContain('Restore tasting');
    expect(markup).not.toContain('undo-control');
  });

  it('renders no restore control for the plan pen even with a pendingUndo value', () => {
    const markup = renderPenFoot({
      openPen: 'plan',
      pendingUndo: { tastedDate: '2026-08-11', temperingMinutes: '', tastingTempC: '', marks: {}, note: '', defects: [], bitterDeclared: false, meltTestG: '', meltStyle: '' },
    });
    expect(markup).not.toContain('Restore tasting');
  });
});

describe('PenFoot — penHint beside the plan pair', () => {
  it('renders the message when set', () => {
    const markup = renderPenFoot({ openPen: 'plan', penHint: 'a version needs a line' });
    expect(markup).toContain('a version needs a line');
  });

  it('renders no blocked-save paragraph when unset', () => {
    const markup = renderPenFoot({ openPen: 'plan', penHint: null });
    expect(markup).not.toContain('pen-foot__blocked');
  });
});

describe('SaveCeremony — the one component both mounts share (D-01)', () => {
  function renderCeremony(props) {
    return renderToStaticMarkup(<SaveCeremony onCancel={noop} onSave={noop} hint={null} {...props} />);
  }

  it('renders Cancel before Save batch, with no hint paragraph when hint is unset', () => {
    const markup = renderCeremony({});
    const cancelIndex = markup.indexOf('Cancel');
    const saveIndex = markup.indexOf('Save batch');
    expect(cancelIndex).toBeGreaterThanOrEqual(0);
    expect(saveIndex).toBeGreaterThan(cancelIndex);
    expect(markup).not.toContain('save-ceremony__hint');
  });

  it('renders the hint paragraph before Cancel when hint is set', () => {
    const markup = renderCeremony({ hint: 'Enter the date you churned.' });
    const hintIndex = markup.indexOf('save-ceremony__hint');
    const cancelIndex = markup.indexOf('Cancel');
    expect(hintIndex).toBeGreaterThanOrEqual(0);
    expect(hintIndex).toBeLessThan(cancelIndex);
  });

  it('never renders a disabled Save batch button — no ceremony mount carries a completeness gate (D-02)', () => {
    const markup = renderCeremony({});
    expect(markup).not.toContain('disabled=""');
  });

  it('renders Add tasting before Cancel before Save batch when onAddTasting is given (D-14, 007 lines 305-307)', () => {
    const markup = renderCeremony({ onAddTasting: noop });
    const addTastingIndex = markup.indexOf('Add tasting');
    const cancelIndex = markup.indexOf('Cancel');
    const saveIndex = markup.indexOf('Save batch');
    expect(addTastingIndex).toBeGreaterThanOrEqual(0);
    expect(cancelIndex).toBeGreaterThan(addTastingIndex);
    expect(saveIndex).toBeGreaterThan(cancelIndex);
  });

  it('renders Restore tasting before Cancel, with no Add tasting, when onRestore is given and onAddTasting is not (D-14, 007 lines 245, 505-510)', () => {
    const markup = renderCeremony({ onRestore: noop });
    const restoreIndex = markup.indexOf('Restore tasting');
    const cancelIndex = markup.indexOf('Cancel');
    expect(restoreIndex).toBeGreaterThanOrEqual(0);
    expect(cancelIndex).toBeGreaterThan(restoreIndex);
    expect(markup).not.toContain('Add tasting');
  });

  it('renders neither Restore tasting nor Add tasting when neither prop is given', () => {
    const markup = renderCeremony({});
    expect(markup).not.toContain('Restore tasting');
    expect(markup).not.toContain('Add tasting');
  });
});
