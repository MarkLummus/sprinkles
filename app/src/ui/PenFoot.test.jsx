// Component test for the foot band — the plan's pen's Cancel/Save pair,
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
      blockedMessage={null}
      onCancelDeveloping={noop}
      onSaveAsNewVersion={noop}
      onSaveOverVersion={noop}
      {...props}
    />,
  );
}

describe('PenFoot — renders only while the plan pen is open', () => {
  it('renders nothing when openPen is null', () => {
    expect(renderPenFoot({ openPen: null })).toBe('');
  });

  it('renders nothing for a pen this plan does not yet wire (record/amend/tasting arrive in plan 02)', () => {
    expect(renderPenFoot({ openPen: 'record' })).toBe('');
    expect(renderPenFoot({ openPen: 'amend' })).toBe('');
    expect(renderPenFoot({ openPen: 'tasting' })).toBe('');
  });

  it('renders the rule and the pair when openPen is "plan"', () => {
    const markup = renderPenFoot({ openPen: 'plan' });
    expect(markup).toContain('pen-foot__rule');
    expect(markup).toContain('Cancel');
    expect(markup).toContain('Save');
  });
});

describe('PenFoot — the pair matches the ceremony, Cancel first, gated by canSaveOver (D-10, D-26)', () => {
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

describe('PenFoot — the blocked-save sentence beside the pair', () => {
  it('renders the message when set', () => {
    const markup = renderPenFoot({ openPen: 'plan', blockedMessage: 'a version needs a line' });
    expect(markup).toContain('a version needs a line');
  });

  it('renders no blocked-save paragraph when unset', () => {
    const markup = renderPenFoot({ openPen: 'plan', blockedMessage: null });
    expect(markup).not.toContain('pen-foot__blocked');
  });
});
