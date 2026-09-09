// Component test for the foot band — every pen's own Cancel/Save pair,
// repeated once at the foot of the page under a hairline rule
// (route-recipe.md § 3 "The imprint"; D-26). In the existing house style:
// renderToStaticMarkup (react-dom/server), the node test environment, no
// jsdom, no testing-library, no click driver — only what static markup
// can prove (RESEARCH.md Pitfall 4).
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PenFoot } from './PenFoot.jsx';

const noop = () => {};

function renderPenFoot(props) {
  return renderToStaticMarkup(
    <PenFoot
      openPen={null}
      canSaveOver={true}
      penSaveDisabled={false}
      penHint={null}
      onCancelDeveloping={noop}
      onSaveAsNewVersion={noop}
      onSaveOverVersion={noop}
      onCancelRecording={noop}
      onSaveBatch={noop}
      onCancelTasting={noop}
      onSaveTasting={noop}
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

describe('PenFoot — the record and amend branch (D-05, D-10)', () => {
  it('renders Cancel then Save, bound to onCancelRecording/onSaveBatch, for the record pen', () => {
    const markup = renderPenFoot({ openPen: 'record' });
    const cancelIndex = markup.indexOf('Cancel');
    const saveIndex = markup.indexOf('>Save<');
    expect(cancelIndex).toBeGreaterThanOrEqual(0);
    expect(saveIndex).toBeGreaterThan(cancelIndex);
    expect(markup).not.toContain('Save as');
  });

  it('renders the same pair for the amend pen', () => {
    const markup = renderPenFoot({ openPen: 'amend' });
    expect(markup).toContain('Cancel');
    expect(markup).toContain('>Save<');
  });
});

describe('PenFoot — the tasting branch, disabled Save with its hint (D-05, D-10, T-03.1-08)', () => {
  it('renders Cancel then Save, bound to onCancelTasting/onSaveTasting', () => {
    const markup = renderPenFoot({ openPen: 'tasting' });
    const cancelIndex = markup.indexOf('Cancel');
    const saveIndex = markup.indexOf('>Save<');
    expect(cancelIndex).toBeGreaterThanOrEqual(0);
    expect(saveIndex).toBeGreaterThan(cancelIndex);
  });

  it('disables Save and shows the hint when penSaveDisabled is true', () => {
    const markup = renderPenFoot({
      openPen: 'tasting',
      penSaveDisabled: true,
      penHint: 'Write words or mark at least one axis to save.',
    });
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Save<\/button>/);
    expect(markup).toContain('Write words or mark at least one axis to save.');
  });

  it('leaves Save enabled with no penSaveDisabled set', () => {
    const markup = renderPenFoot({ openPen: 'tasting', penSaveDisabled: false });
    expect(markup).not.toMatch(/<button[^>]*disabled=""[^>]*>Save<\/button>/);
  });

  it('never recomputes the save gate itself — reads penSaveDisabled/penHint only (RESEARCH.md Anti-Patterns, T-03.1-08)', () => {
    const markup = renderPenFoot({ openPen: 'tasting' });
    expect(markup).not.toContain('isTastingSaveable');
  });
});

describe('PenFoot — penHint beside the pair', () => {
  it('renders the message when set', () => {
    const markup = renderPenFoot({ openPen: 'plan', penHint: 'a version needs a line' });
    expect(markup).toContain('a version needs a line');
  });

  it('renders no blocked-save paragraph when unset', () => {
    const markup = renderPenFoot({ openPen: 'plan', penHint: null });
    expect(markup).not.toContain('pen-foot__blocked');
  });
});
