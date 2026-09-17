// AxisMark — the five-stop goldilocks track (contract "Axes spec"): a
// mark placed on an axis must be nameable, readable inline, and removable
// before it is saved (G-02-6). Rebuilt in 03.3.1-03 Task 2 around the real
// battery shape (domain/axes.js's AXES: { key, name, low, high, group })
// and the five whole stops, with per-stop aria-labels, inline state text,
// and a per-axis Clear that announces through the caller (never inside
// this leaf — the announcement is a page-level live region, RecipePage's
// own form-status) and returns focus only on a keyboard activation
// (007 @ 2a212be line 379). Renders through renderToStaticMarkup
// (react-dom/server) in the existing node Vitest environment (A-4) — no
// click driver; a joined group is a radio (line 362) and the actual
// focus/announce sequence are structural here, verified in the browser.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AxisMark } from './AxisMark.jsx';
import { AXES, stopWordsFor } from '../domain/axes.js';

const hardnessAxis = AXES.find((axis) => axis.key === 'hardness');
const noop = () => {};

describe('AxisMark — five stops, digits 1–5, per-stop aria-labels from stopWordsFor (contract "Axes spec")', () => {
  it('renders exactly five radio stops carrying digits 1–5', () => {
    const markup = renderToStaticMarkup(
      <AxisMark axis={hardnessAxis} value={undefined} onChange={noop} onClear={noop} />,
    );
    const stopInputs = markup.match(/<input[^>]*type="radio"[^>]*\/>/g);
    expect(stopInputs.length).toBe(5);
    for (const value of [1, 2, 3, 4, 5]) {
      expect(markup).toContain(`value="${value}"`);
    }
  });

  it('builds each stop\'s aria-label as "{n}: {word}" from stopWordsFor, verbatim for Hardness', () => {
    const markup = renderToStaticMarkup(
      <AxisMark axis={hardnessAxis} value={undefined} onChange={noop} onClear={noop} />,
    );
    const words = stopWordsFor(hardnessAxis);
    expect(words).toEqual(['soft', 'leaning soft', 'right', 'leaning hard', 'hard']);
    for (let i = 0; i < 5; i += 1) {
      expect(markup).toContain(`aria-label="${i + 1}: ${words[i]}"`);
    }
  });

  it('carries aria-labelledby on the stops group, resolving to the axis name\'s own id', () => {
    const markup = renderToStaticMarkup(
      <AxisMark axis={hardnessAxis} value={undefined} onChange={noop} onClear={noop} />,
    );
    const groupMatch = markup.match(/<div class="axis-mark__stops" role="group" aria-labelledby="([^"]+)">/);
    expect(groupMatch).not.toBeNull();
    const nameId = groupMatch[1];
    expect(markup).toContain(`id="${nameId}"`);
    expect(markup).toContain(`id="${nameId}" class="axis-mark__name">Hardness<`);
  });

  it('with a cueId, names the stops group by the axis name followed by the cue, trailing (matching the defect groups\' own ordering)', () => {
    const markup = renderToStaticMarkup(
      <AxisMark axis={hardnessAxis} value={undefined} onChange={noop} onClear={noop} cueId="axes-core-cue" />,
    );
    expect(markup).toContain('aria-labelledby="axis-name-hardness axes-core-cue"');
  });

  it('without a cueId, names the stops group by the axis alone — existing call sites and tests keep rendering a valid group', () => {
    const markup = renderToStaticMarkup(
      <AxisMark axis={hardnessAxis} value={undefined} onChange={noop} onClear={noop} />,
    );
    expect(markup).toContain('aria-labelledby="axis-name-hardness"');
  });
});

describe('AxisMark — inline state and the per-axis Clear (contract "Axes spec")', () => {
  it('reads "(Not recorded)" and renders no Clear control and checks no stop when unmarked', () => {
    const markup = renderToStaticMarkup(
      <AxisMark axis={hardnessAxis} value={undefined} onChange={noop} onClear={noop} />,
    );
    expect(markup).toContain('(Not recorded)');
    expect(markup).not.toContain('axis-mark__clear');
    expect(markup).not.toContain('checked');
  });

  it('reads "(N)" and renders the Clear control, checking the stop whose value is the mark', () => {
    const markup = renderToStaticMarkup(<AxisMark axis={hardnessAxis} value={4} onChange={noop} onClear={noop} />);
    expect(markup).toContain('(4)');
    expect(markup).not.toContain('(Not recorded)');
    expect(markup).toContain('axis-mark__clear');
    const stopIndex = markup.indexOf('value="4"');
    const tagStart = markup.lastIndexOf('<input', stopIndex);
    const tagEnd = markup.indexOf('/>', stopIndex);
    expect(markup.slice(tagStart, tagEnd)).toContain('checked');
  });

  it('names its axis in the Clear control\'s accessible name, so six on one form are told apart', () => {
    const markup = renderToStaticMarkup(<AxisMark axis={hardnessAxis} value={4} onChange={noop} onClear={noop} />);
    const clearIndex = markup.indexOf('axis-mark__clear');
    const tagStart = markup.lastIndexOf('<', clearIndex);
    const tagEnd = markup.indexOf('>', clearIndex);
    const clearTag = markup.slice(tagStart, tagEnd);
    expect(clearTag).toContain('aria-label="Clear Hardness"');
  });
});

describe('AxisMark — the anchors row, aria-hidden (contract "Axes spec")', () => {
  it('renders only the three anchor words, low/right/high, aria-hidden', () => {
    const markup = renderToStaticMarkup(
      <AxisMark axis={hardnessAxis} value={undefined} onChange={noop} onClear={noop} />,
    );
    const anchorsMatch = markup.match(/<div class="axis-mark__anchors" aria-hidden="true">(.*?)<\/div>/);
    expect(anchorsMatch).not.toBeNull();
    const anchorsMarkup = anchorsMatch[1];
    expect(anchorsMarkup).toContain('soft');
    expect(anchorsMarkup).toContain('right');
    expect(anchorsMarkup).toContain('hard');
  });
});
