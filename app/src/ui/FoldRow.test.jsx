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
      <FoldRow label={<span className="notebook-caption">Version</span>} open={false} onToggle={noop} controls="fold-version" what="details" />,
    );
    expect(markup).toBe(
      '<button type="button" class="fold-row" aria-expanded="false" aria-controls="fold-version">' +
        '<span class="fold-row__head">' +
        '<span class="notebook-caption">Version</span>' +
        '<span class="fold-row__control">Show details</span>' +
        '</span>' +
        '</button>',
    );
  });

  it('renders an open fold reading "Hide details"', () => {
    const markup = renderToStaticMarkup(
      <FoldRow label={<span className="notebook-caption">Version</span>} open={true} onToggle={noop} controls="fold-version" what="details" />,
    );
    expect(markup).toMatch(/<button type="button" class="fold-row" aria-expanded="true" aria-controls="fold-version">/);
    expect(markup).toMatch(/<span class="fold-row__control">Hide details<\/span>/);
  });

  it('renders a count span as the last child of the button when given', () => {
    const markup = renderToStaticMarkup(
      <FoldRow label={<span className="notebook-caption">History</span>} open={false} onToggle={noop} controls="fold-history" count="2 versions" />,
    );
    expect(markup).toMatch(/<span class="fold-row__count">2 versions<\/span><\/button>$/);
  });

  it('renders no count span when none is given', () => {
    const markup = renderToStaticMarkup(
      <FoldRow label={<span className="notebook-caption">Version</span>} open={false} onToggle={noop} controls="fold-version" what="details" />,
    );
    expect(markup).not.toContain('fold-row__count');
  });

  it('renders the control word with no "what" suffix when what is omitted', () => {
    const markup = renderToStaticMarkup(
      <FoldRow label={<span className="notebook-caption">History</span>} open={false} onToggle={noop} controls="fold-history" />,
    );
    expect(markup).toMatch(/<span class="fold-row__control">Show<\/span>/);
  });

  it('carries neither text-control nor history-disclosure', () => {
    const markup = renderToStaticMarkup(
      <FoldRow label={<span className="notebook-caption">Version</span>} open={false} onToggle={noop} controls="fold-version" what="details" />,
    );
    expect(markup).not.toContain('text-control');
    expect(markup).not.toContain('history-disclosure');
  });
});
