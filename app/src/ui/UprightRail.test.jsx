// Component test for UprightRail (sketch 011 decision 19, counts.py's
// vnode/vrail_; 03.5-17 Task 1). In the codebase's established style:
// renderToStaticMarkup (react-dom/server), no jsdom, no testing-library.
// Wrapped in a MemoryRouter since a row may render a react-router Link.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { UprightRail } from './UprightRail.jsx';

const THREE_ENTRIES = [
  {
    key: 'in-view',
    title: 'churned 16 Aug 2026',
    meta: 'Not yet tasted · out of machine −5 °C',
    filled: false,
    inView: true,
    to: null,
  },
  {
    key: 'linked-hollow',
    title: 'churned 9 Aug 2026',
    meta: 'Not yet tasted · out of machine −5 °C',
    filled: false,
    inView: false,
    to: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/other-batch',
    state: { focusBatch: true },
  },
  {
    key: 'linked-filled',
    title: 'churned 2 Aug 2026',
    meta: 'Tasted 17 Aug 2026 · out of machine −6 °C',
    filled: true,
    inView: false,
    to: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89',
    state: { focusBatch: true },
  },
];

function render(props) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <UprightRail id="fold-batches" label="Batches of this version" entries={THREE_ENTRIES} hidden={false} {...props} />
    </MemoryRouter>,
  );
}

describe('UprightRail — the vertical list row shared by batches (decision 19) and versions (plan 18)', () => {
  it('renders an ol with the given id and aria-label, holding the three li rows in the given order', () => {
    const markup = render({});
    expect(markup).toContain('id="fold-batches"');
    expect(markup).toContain('class="notebook-upright"');
    expect(markup).toContain('aria-label="Batches of this version"');
    const rowCount = markup.split('class="notebook-upright__row"').length - 1;
    expect(rowCount).toBe(3);
    const firstIdx = markup.indexOf('churned 16 Aug 2026');
    const secondIdx = markup.indexOf('churned 9 Aug 2026');
    const thirdIdx = markup.indexOf('churned 2 Aug 2026');
    expect(firstIdx).toBeGreaterThan(-1);
    expect(secondIdx).toBeGreaterThan(firstIdx);
    expect(thirdIdx).toBeGreaterThan(secondIdx);
  });

  it('renders exactly 2 <a> elements, each with tabindex="0" and its own href', () => {
    const markup = render({});
    const anchors = [...markup.matchAll(/<a\b[^>]*>/g)].map(([tag]) => tag);
    expect(anchors).toHaveLength(2);
    for (const tag of anchors) {
      expect(tag).toContain('tabindex="0"');
      expect(tag).toMatch(/href="\/notebook\//);
    }
  });

  it('renders the in-view row as a span carrying aria-current="page" and the in-view mark modifier', () => {
    const markup = render({});
    expect(markup).toMatch(/<span class="notebook-upright__link" aria-current="page">/);
    expect(markup).toContain('notebook-upright__mark notebook-upright__mark--in-view"');
  });

  it('follows `filled` with the filled mark modifier — the tasted batch gets it, the untasted ones do not', () => {
    const markup = render({});
    expect(markup).toContain('notebook-upright__mark notebook-upright__mark--filled"');
    // The in-view entry above is untasted (filled: false) — its own mark
    // must carry no --filled modifier, only --in-view.
    expect(markup).not.toMatch(/notebook-upright__mark notebook-upright__mark--filled notebook-upright__mark--in-view/);
  });

  it('adds the hidden attribute to the ol when hidden is true, omits it otherwise', () => {
    const openMarkup = render({ hidden: false });
    const openOlTag = openMarkup.match(/^<ol[^>]*>/)[0];
    expect(openOlTag).not.toMatch(/\bhidden\b/);
    const closedMarkup = render({ hidden: true });
    const closedOlTag = closedMarkup.match(/^<ol[^>]*>/)[0];
    expect(closedOlTag).toMatch(/\shidden(=""|\s|>)/);
  });

  it('renders no link at all for an entry with no `to`, not in view', () => {
    const markup = render({
      entries: [{ key: 'no-link', title: 'churned 1 Jan 2026', meta: 'Not yet tasted', filled: false, inView: false, to: null }],
    });
    expect(markup).not.toContain('<a ');
    expect(markup).toContain('class="notebook-upright__link">');
  });
});
