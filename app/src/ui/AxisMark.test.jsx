// AxisMark — the five-stop goldilocks track (contract "Axes spec"): a
// mark placed on an axis must be nameable, readable inline, and removable
// before it is saved (G-02-6). Rebuilt in 03.3.1-03 Task 2 around the real
// battery shape (domain/axes.js's AXES: { key, name, low, high, group })
// and the five whole stops, with per-stop aria-labels, inline state text,
// and a per-axis Clear that returns focus and announces through the
// caller (never inside this leaf — the announcement is a page-level
// live region, RecipePage's own form-status). Renders through
// renderToStaticMarkup (react-dom/server) in the existing node Vitest
// environment (A-4) — no click driver; click-again-clears and the actual
// focus/announce sequence are structural here, verified in the browser.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AxisMark } from './AxisMark.jsx';
import { AXES, stopWordsFor } from '../domain/axes.js';

const hardnessAxis = AXES.find((axis) => axis.key === 'hardness');
const bodyAxis = AXES.find((axis) => axis.key === 'body');
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

describe('AxisMark — the declared caption, inside the box, above the head (contract "Axes spec")', () => {
  it('renders the caption when declaredCaption is given', () => {
    const markup = renderToStaticMarkup(
      <AxisMark axis={bodyAxis} value={undefined} onChange={noop} onClear={noop} declaredCaption="Declared for this recipe" />,
    );
    expect(markup).toContain('class="axes-declared-caption"');
    expect(markup).toContain('Declared for this recipe');
    const captionIndex = markup.indexOf('axes-declared-caption');
    const headIndex = markup.indexOf('axis-mark__head');
    expect(captionIndex).toBeLessThan(headIndex);
  });

  it('renders no caption element when declaredCaption is not given', () => {
    const markup = renderToStaticMarkup(
      <AxisMark axis={hardnessAxis} value={undefined} onChange={noop} onClear={noop} />,
    );
    expect(markup).not.toContain('axes-declared-caption');
  });
});
