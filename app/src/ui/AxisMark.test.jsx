// A mark placed on an axis must be removable before it is saved (G-02-6):
// the clear control only offers to clear what is there, and names its axis
// so six of them on one form are told apart. Renders through
// renderToStaticMarkup (react-dom/server) in the existing node Vitest
// environment (A-4).
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AxisMark } from './AxisMark.jsx';

const hardnessAxis = { key: 'hardness', label: 'Hardness', low: 'spoon sinks', high: "spoon won't enter" };

describe('AxisMark — an unmarked axis', () => {
  it('renders no clear control and checks no stop', () => {
    const markup = renderToStaticMarkup(<AxisMark axis={hardnessAxis} value={undefined} onChange={() => {}} />);
    expect(markup).not.toContain('axis-mark__clear');
    expect(markup).not.toContain('checked');
  });
});

describe('AxisMark — a marked axis', () => {
  it('renders the clear control, and checks the input whose value is the mark', () => {
    const markup = renderToStaticMarkup(<AxisMark axis={hardnessAxis} value={4.5} onChange={() => {}} />);
    expect(markup).toContain('axis-mark__clear');
    const stopIndex = markup.indexOf('value="4.5"');
    expect(stopIndex).toBeGreaterThan(-1);
    const stopTagEnd = markup.indexOf('/>', stopIndex);
    expect(markup.slice(stopIndex, stopTagEnd)).toContain('checked');
  });

  it('names its axis in the clear control\'s accessible name, so six on one form are told apart', () => {
    const markup = renderToStaticMarkup(<AxisMark axis={hardnessAxis} value={4.5} onChange={() => {}} />);
    const clearIndex = markup.indexOf('axis-mark__clear');
    const tagStart = markup.lastIndexOf('<', clearIndex);
    const tagEnd = markup.indexOf('>', clearIndex);
    const clearTag = markup.slice(tagStart, tagEnd);
    expect(clearTag).toContain('Hardness');
  });
});
