// AxisMark — the five-stop goldilocks track (contract "Axes spec"): a
// mark placed on an axis must be nameable, readable inline, and removable
// before it is saved (G-02-6). Rebuilt in 03.3.1-03 Task 2 around the real
// battery shape (a scale definition: { key, name, low, high, kind, group })
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
import { stopWordsFor } from '../domain/axes.js';
import { coreScaleDefinitions } from '../domain/catalog.js';
import { SEED_CATALOG } from '../data/seed-catalog.js';

const hardnessAxis = coreScaleDefinitions(SEED_CATALOG.scales).find((axis) => axis.key === 'hardness');
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
  it('shows its name alone when unmarked: no state span, no Clear control, no checked stop (Mark 2026-10-24, quick 261025-f8o)', () => {
    const markup = renderToStaticMarkup(
      <AxisMark axis={hardnessAxis} value={undefined} onChange={noop} onClear={noop} />,
    );
    expect(markup).not.toContain('axis-mark__state');
    expect(markup).toContain('axis-mark__name');
    expect(markup).not.toContain('axis-mark__clear');
    expect(markup).not.toContain('checked');
  });

  it('reads "(N)" and renders the Clear control, checking the stop whose value is the mark', () => {
    const markup = renderToStaticMarkup(<AxisMark axis={hardnessAxis} value={4} onChange={noop} onClear={noop} />);
    expect(markup).toContain('(4)');
    expect(markup).toContain('axis-mark__state');
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

// Quick task 261001-doi: WebKit without Safari's tab-to-highlight preference
// Tabs only into text entry and into controls that carry an explicit
// tabindex — the same rule as every link, recorded in .claude/CLAUDE.md
// (the cause is spelled out in Segmented.test.jsx). Pinned on rendered
// markup: the attribute's whole effect is in the DOM WebKit reads.
describe('AxisMark — every radio and the Clear carry an explicit tabindex (quick task 261001-doi)', () => {
  it('renders five radios and no button when unmarked, each tabindex="0"', () => {
    const markup = renderToStaticMarkup(
      <AxisMark axis={hardnessAxis} value={undefined} onChange={noop} onClear={noop} />,
    );
    const radios = markup.match(/<input\b[^>]*type="radio"[^>]*>/g);
    expect(radios).toHaveLength(5);
    for (const tag of radios) {
      expect(tag).toContain('tabindex="0"');
    }
    expect(markup.match(/<button\b[^>]*>/g)).toBeNull();
  });

  it('renders five radios and the one Clear button when marked, each tabindex="0"', () => {
    const markup = renderToStaticMarkup(
      <AxisMark axis={hardnessAxis} value={3} onChange={noop} onClear={noop} />,
    );
    const tags = [...markup.match(/<input\b[^>]*type="radio"[^>]*>/g), ...markup.match(/<button\b[^>]*>/g)];
    expect(tags).toHaveLength(6);
    for (const tag of tags) {
      expect(tag).toContain('tabindex="0"');
    }
  });
});

// Phase 12 (D-01, D-03, sketch 015 CONTRACT section 1): a Low to high scale names
// only its two ends. The kind branch is in domain/axes.js; the component tests none.
describe('AxisMark — a Low to high scale names only its ends (Phase 12, D-01)', () => {
  const coffeeAxis = {
    key: 'coffee',
    name: 'Coffee flavour',
    low: 'faint',
    high: 'strong',
    kind: 'magnitude',
    group: 'declared',
  };

  it('renders the anchors line as exactly two spans, the low word then the high word', () => {
    const markup = renderToStaticMarkup(<AxisMark axis={coffeeAxis} value={undefined} onChange={noop} onClear={noop} />);
    const anchors = markup.match(/<div class="axis-mark__anchors" aria-hidden="true">(.*?)<\/div>/)[1];
    expect(anchors).toBe('<span>faint</span><span>strong</span>');
  });

  it('names the five stops 1: faint, 2, 3, 4, 5: strong for a screen reader', () => {
    const markup = renderToStaticMarkup(<AxisMark axis={coffeeAxis} value={undefined} onChange={noop} onClear={noop} />);
    const labels = [...markup.matchAll(/<input\b[^>]*aria-label="([^"]*)"/g)].map((match) => match[1]);
    expect(labels).toEqual(['1: faint', '2', '3', '4', '5: strong']);
  });

  // Mark, 2026-11-16 (quick 261116-80v): a Low to high scale's stops draw no
  // number; a Right in the middle scale keeps 1 to 5.
  it('draws no number in any stop of a Low to high scale, and 1 to 5 in the stops of a Right in the middle one', () => {
    const stopNumbers = (axis) => {
      const markup = renderToStaticMarkup(<AxisMark axis={axis} value={undefined} onChange={noop} onClear={noop} />);
      const stops = markup.match(/<label class="axis-mark__stop">.*?<\/label>/g);
      expect(stops).toHaveLength(5);
      return stops.map((stop) => stop.match(/<span[^>]*>(.*?)<\/span>/)?.[1]);
    };
    expect(stopNumbers(coffeeAxis)).toEqual([undefined, undefined, undefined, undefined, undefined]);
    expect(stopNumbers(hardnessAxis)).toEqual(['1', '2', '3', '4', '5']);
  });

  it('still draws the head\'s (2) and its Clear control on a marked Low to high scale', () => {
    const markup = renderToStaticMarkup(<AxisMark axis={coffeeAxis} value={2} onChange={noop} onClear={noop} />);
    expect(markup).toContain('(2)');
    expect(markup).toContain('Clear');
  });

  it('keeps the middle word "right" on a Right in the middle scale', () => {
    const markup = renderToStaticMarkup(<AxisMark axis={hardnessAxis} value={undefined} onChange={noop} onClear={noop} />);
    expect(markup).toContain('<span>soft</span><span>right</span><span>hard</span>');
  });

  it('draws a name and ends typed with markup as text, never as elements', () => {
    const tricky = { ...coffeeAxis, name: '<b>Coffee</b>', low: '<i>faint', high: 'strong</i>' };
    const markup = renderToStaticMarkup(<AxisMark axis={tricky} value={undefined} onChange={noop} onClear={noop} />);
    expect(markup).not.toMatch(/<b>|<i>/);
    expect(markup).toContain('&lt;b&gt;Coffee&lt;/b&gt;');
    expect(markup).toContain('&lt;i&gt;faint');
  });
});
