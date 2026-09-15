// Segmented — the battery's one 3-way control (contract "Controls spec"),
// shared by Exit consistency, Airiness (estimated), and Melt style: one
// component, three uses, now owning its own caption line and Clear too
// (007 @ 2a212be lines 220, 228, 289; Plan 04). In the existing house
// style: renderToStaticMarkup (react-dom/server), the node test
// environment, no jsdom, no testing-library, no click driver — a joined
// group is a radio (007 line 362), picking is final, and that is
// structural (onClick, not onChange) and is verified in the browser
// (RESEARCH.md Pitfall 4's sibling discipline for interaction-only
// behavior).
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Segmented } from './Segmented.jsx';

const noop = () => {};
const EXIT_OPTIONS = ['Smooth ribbon', 'Wet, soupy', 'Chunky, separated'];
const MELT_OPTIONS = ['Watery, weeping', 'Creamy puddle', 'Stable foam'];

describe('Segmented — the one component all three groups use (contract "Controls spec")', () => {
  it('renders a radiogroup with the group aria-label and every option string, verbatim', () => {
    const markup = renderToStaticMarkup(
      <Segmented groupLabel="Exit consistency" options={EXIT_OPTIONS} value="" onChange={noop} />,
    );
    expect(markup).toContain('role="radiogroup"');
    expect(markup).toContain('aria-label="Exit consistency"');
    for (const option of EXIT_OPTIONS) {
      expect(markup).toContain(option);
    }
  });

  it('checks no option by default — nothing is pre-selected (D-10 "Blank stays blank")', () => {
    const markup = renderToStaticMarkup(
      <Segmented groupLabel="Exit consistency" options={EXIT_OPTIONS} value="" onChange={noop} />,
    );
    expect(markup).not.toContain('checked=""');
  });

  it('checks the picked option when value matches one, and only that one', () => {
    const markup = renderToStaticMarkup(
      <Segmented groupLabel="Exit consistency" options={EXIT_OPTIONS} value="Wet, soupy" onChange={noop} />,
    );
    const checkedInput = markup.match(/<input[^>]*value="Wet, soupy"[^>]*\/>/)[0];
    expect(checkedInput).toContain('checked=""');
    const otherInput = markup.match(/<input[^>]*value="Smooth ribbon"[^>]*\/>/)[0];
    expect(otherInput).not.toContain('checked=""');
  });

  it('renders one native radio input per option, all sharing one name for a single tab stop', () => {
    const markup = renderToStaticMarkup(
      <Segmented groupLabel="Melt style" options={MELT_OPTIONS} value="" onChange={noop} />,
    );
    const names = [...markup.matchAll(/name="([^"]+)"/g)].map((match) => match[1]);
    expect(names.length).toBe(MELT_OPTIONS.length);
    expect(new Set(names).size).toBe(1);
  });

  it('serves a third, independent group (Melt style) with its own aria-label and options', () => {
    const markup = renderToStaticMarkup(
      <Segmented groupLabel="Melt style" options={MELT_OPTIONS} value="" onChange={noop} />,
    );
    expect(markup).toContain('aria-label="Melt style"');
    for (const option of MELT_OPTIONS) {
      expect(markup).toContain(option);
    }
  });
});

describe('Segmented — the caption line with its Clear (007 lines 220, 228, 289; Pitfall 11)', () => {
  it('opens with the caption line, then the radiogroup, in that DOM order', () => {
    const markup = renderToStaticMarkup(
      <Segmented groupLabel="Exit consistency" options={EXIT_OPTIONS} value="" onChange={noop} onClear={noop} />,
    );
    expect(markup.startsWith(
      '<div class="segmented-field"><div class="segmented-field__head">' +
        '<span class="segmented-field__caption pen-caption" id="segment-exit-consistency-caption">Exit consistency</span>',
    )).toBe(true);
    const headIndex = markup.indexOf('class="segmented-field__head"');
    const radiogroupIndex = markup.indexOf('role="radiogroup"');
    expect(radiogroupIndex).toBeGreaterThan(headIndex);
  });

  it('renders no Clear when nothing is picked', () => {
    const markup = renderToStaticMarkup(
      <Segmented groupLabel="Exit consistency" options={EXIT_OPTIONS} value="" onChange={noop} onClear={noop} />,
    );
    expect(markup).not.toContain('segmented-field__clear');
  });

  it('renders the Clear control, between the caption and the radiogroup, once an option is picked', () => {
    const markup = renderToStaticMarkup(
      <Segmented groupLabel="Exit consistency" options={EXIT_OPTIONS} value="Wet, soupy" onChange={noop} onClear={noop} />,
    );
    const clearMatch = markup.match(
      /<button type="button" class="text-control segmented-field__clear" aria-label="Clear Exit consistency">Clear<\/button>/,
    );
    expect(clearMatch).not.toBeNull();
    const captionIndex = markup.indexOf('segmented-field__caption');
    const radiogroupIndex = markup.indexOf('role="radiogroup"');
    expect(clearMatch.index).toBeGreaterThan(captionIndex);
    expect(clearMatch.index).toBeLessThan(radiogroupIndex);
  });
});
