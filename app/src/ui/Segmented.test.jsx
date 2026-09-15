// Segmented — the battery's one 3-way control (contract "Controls spec"),
// shared by Exit consistency, Airiness (estimated), and Melt style
// (optional): one component, three uses, per 03.3.1-03 Task 1's own
// artifact list. In the existing house style: renderToStaticMarkup
// (react-dom/server), the node test environment, no jsdom, no
// testing-library, no click driver — click-again-clears is structural
// (onClick, not onChange) and is verified in the browser (RESEARCH.md
// Pitfall 4's sibling discipline for interaction-only behavior).
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
