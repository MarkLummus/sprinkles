// Component test for FoldRow.jsx (sketch 011 decisions 18/19, gen.py's
// own fold_row; 03.5-15 Task 1). In the existing house style:
// renderToStaticMarkup (react-dom/server) in the node test environment,
// no jsdom, no testing-library.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { FoldRow } from './FoldRow.jsx';

const noop = () => {};

describe('FoldRow — the one full-row fold head (sketch 011 decisions 18/19, gen.py fold_row)', () => {
  it('renders a closed fold with the exact markup, reading "Show details"', () => {
    const markup = renderToStaticMarkup(
      <FoldRow
        label={<span className="notebook-caption">Version</span>}
        labelText="Version"
        open={false}
        onToggle={noop}
        controls="fold-version"
        what="details"
      />,
    );
    expect(markup).toBe(
      '<button type="button" class="fold-row" aria-expanded="false" aria-controls="fold-version" aria-label="Version Show details">' +
        '<span class="fold-row__head">' +
        '<span class="notebook-caption">Version</span>' +
        '<span class="fold-row__control">Show details</span>' +
        '</span>' +
        '</button>',
    );
  });

  it('renders an open fold reading "Hide details"', () => {
    const markup = renderToStaticMarkup(
      <FoldRow
        label={<span className="notebook-caption">Version</span>}
        labelText="Version"
        open={true}
        onToggle={noop}
        controls="fold-version"
        what="details"
      />,
    );
    expect(markup).toMatch(
      /<button type="button" class="fold-row" aria-expanded="true" aria-controls="fold-version" aria-label="Version Hide details">/,
    );
    expect(markup).toMatch(/<span class="fold-row__control">Hide details<\/span>/);
  });

  it('renders a count span as the last child of the button when given', () => {
    const markup = renderToStaticMarkup(
      <FoldRow
        label={<span className="notebook-caption">History</span>}
        labelText="History"
        open={false}
        onToggle={noop}
        controls="fold-history"
        count="2 versions"
      />,
    );
    expect(markup).toMatch(/<span class="fold-row__count">2 versions<\/span><\/button>$/);
  });

  it('renders no count span when none is given', () => {
    const markup = renderToStaticMarkup(
      <FoldRow
        label={<span className="notebook-caption">Version</span>}
        labelText="Version"
        open={false}
        onToggle={noop}
        controls="fold-version"
        what="details"
      />,
    );
    expect(markup).not.toContain('fold-row__count');
  });

  it('renders the control word with no "what" suffix when what is omitted', () => {
    const markup = renderToStaticMarkup(
      <FoldRow
        label={<span className="notebook-caption">History</span>}
        labelText="History"
        open={false}
        onToggle={noop}
        controls="fold-history"
      />,
    );
    expect(markup).toMatch(/<span class="fold-row__control">Show<\/span>/);
  });

  it('carries neither text-control nor history-disclosure', () => {
    const markup = renderToStaticMarkup(
      <FoldRow
        label={<span className="notebook-caption">Version</span>}
        labelText="Version"
        open={false}
        onToggle={noop}
        controls="fold-version"
        what="details"
      />,
    );
    expect(markup).not.toContain('text-control');
    expect(markup).not.toContain('history-disclosure');
  });

  // WR-01 (03.5 review): the label, the Show/Hide control word and the
  // count are adjacent DOM text nodes with no separating character — a
  // purely visual gap comes from .fold-row__head's flex gap, so the
  // accessible name computed from that text risks reading as one run-on
  // word ("VersionShow details", "BatchesShow, 3 batches"). aria-label is
  // built from plain strings instead, with real word boundaries, so the
  // computed accessible name is well-formed regardless of engine — this
  // pins the label text with spaces, not just the visual markup.
  describe('accessible name — aria-label reads as separate words, independent of DOM text-node adjacency', () => {
    it('reads "Version Show details" when closed, a string label passed alongside the caption element', () => {
      const markup = renderToStaticMarkup(
        <FoldRow
          label={<span className="notebook-caption">Version</span>}
          labelText="Version"
          open={false}
          onToggle={noop}
          controls="fold-version"
          what="details"
        />,
      );
      expect(markup).toContain('aria-label="Version Show details"');
    });

    it('reads "Watch for Show" when the label itself is already a plain string (no labelText needed)', () => {
      const markup = renderToStaticMarkup(
        <FoldRow label="Watch for" open={false} onToggle={noop} controls="fold-check" />,
      );
      expect(markup).toContain('aria-label="Watch for Show"');
    });

    it('reads "Batches Hide, 3 batches · latest first" — label, control word and count all separated', () => {
      const markup = renderToStaticMarkup(
        <FoldRow
          label={<span className="notebook-caption">Batches</span>}
          labelText="Batches"
          open={true}
          onToggle={noop}
          controls="fold-batches"
          count="3 batches · latest first"
        />,
      );
      expect(markup).toContain('aria-label="Batches Hide, 3 batches · latest first"');
    });

    it('reads "Tasting Show, tasted 28 Sep" for a plain-string label with a count and no "what"', () => {
      const markup = renderToStaticMarkup(
        <FoldRow label="Tasting" open={false} onToggle={noop} controls="fold-tasting" count="tasted 28 Sep" />,
      );
      expect(markup).toContain('aria-label="Tasting Show, tasted 28 Sep"');
    });
  });
});
