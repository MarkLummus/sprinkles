// The strike must reach the step's prose only, never the "Skipped" label
// beside it (G-02-3): per CSS Text Decoration L3 a decoration on a block
// propagates to every in-flow inline descendant and cannot be switched off
// by them, so the label must sit OUTSIDE the decorated element, not merely
// carry no decoration of its own. Renders through renderToStaticMarkup
// (react-dom/server) in the existing node Vitest environment — Method
// renders no links, so no router context is needed.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Method } from './Method.jsx';

const struckStep = { n: 1, leadIn: 'Steep', instruction: 'Warm the milk and steep the zest.' };
const unstruckStep = { n: 2, leadIn: 'Chill', instruction: 'Cool the base overnight.' };
const changedLineStep = { n: 3, leadIn: 'Churn', instruction: 'Churn until soft-set.' };

describe('Method — a struck step', () => {
  it('closes the struck element before the Skipped label opens — the label is outside what was struck', () => {
    const markup = renderToStaticMarkup(<Method steps={[struckStep]} stepChanges={{ 1: { struck: true, line: null } }} />);
    const struckIndex = markup.indexOf('method-step__prose--struck');
    const labelIndex = markup.indexOf('method-step__skipped-label');
    expect(struckIndex).toBeGreaterThan(-1);
    expect(labelIndex).toBeGreaterThan(-1);
    // This is the invariant the old string-presence gate could not make: a
    // decoration propagated from an ancestor cannot be cancelled by a
    // descendant, so the ONLY way for the label to read legible is for it to
    // be a sibling of the decorated element, not a descendant of it — proved
    // here by the decorated element's own closing </span> appearing before
    // the label's opening tag.
    const closingSpanIndex = markup.indexOf('</span>', struckIndex);
    expect(closingSpanIndex).toBeGreaterThan(-1);
    expect(closingSpanIndex).toBeLessThan(labelIndex);
    expect(markup).toContain('Skipped');
  });

  it('keeps the step\'s prose inside the decorated element — the strike is scoped, not removed', () => {
    const markup = renderToStaticMarkup(<Method steps={[struckStep]} stepChanges={{ 1: { struck: true, line: null } }} />);
    const struckIndex = markup.indexOf('method-step__prose--struck');
    const closingSpanIndex = markup.indexOf('</span>', struckIndex);
    const decorated = markup.slice(struckIndex, closingSpanIndex);
    expect(decorated).toContain('Steep');
    expect(decorated).toContain('Warm the milk and steep the zest.');
  });
});

describe('Method — an unstruck step', () => {
  it('renders neither the struck modifier class nor the Skipped label', () => {
    const markup = renderToStaticMarkup(<Method steps={[unstruckStep]} stepChanges={{}} />);
    expect(markup).not.toContain('method-step__prose--struck');
    expect(markup).not.toContain('method-step__skipped-label');
  });
});

describe('Method — a step carrying a changed line, in the reading state', () => {
  it('still renders the line (regression guard on the neighbouring branch)', () => {
    const markup = renderToStaticMarkup(
      <Method steps={[changedLineStep]} stepChanges={{ 3: { struck: false, line: 'Used vanilla instead' } }} mode="reading" />,
    );
    expect(markup).toContain('method-step__changed');
    expect(markup).toContain('Used vanilla instead');
  });
});
