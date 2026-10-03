// The band's Go to batch row below 724 (sketch 011 decision 30,
// 393-phone-log.html and 723-phone-log.html; quick 261002-wmy). Same house
// style as the other component suites: renderToStaticMarkup in the node
// environment, no jsdom. No router needed: the component is a plain anchor.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GoToBatch } from './GoToBatch.jsx';
import { STANDING_WORDS, NOT_YET_CHURNED, AWAITING_TASTING, TASTED } from '../domain/lastEvent.js';

function makeBatch(overrides = {}) {
  return {
    id: 'b1',
    versionId: 'v1',
    recordedAt: '2026-01-02T00:00:00.000Z',
    changed: null,
    churn: { churnDate: '2026-01-02' },
    tasting: null,
    ...overrides,
  };
}

const noop = () => {};
const render = (batches) => renderToStaticMarkup(<GoToBatch batches={batches} onGo={noop} />);

describe('GoToBatch — one link, two spans', () => {
  it('with no batch renders exactly one anchor, no button, and the three-part contract', () => {
    const markup = render([]);
    expect(markup.match(/<a\b/g)).toHaveLength(1);
    expect(markup).not.toContain('<button');
    expect(markup).toContain('class="notebook-jump"');
    expect(markup).toContain('href="#batch"');
    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain('aria-label="Go to batch, Not yet churned"');
    expect(markup).toContain('<span class="notebook-jump__control">Go to batch</span><span class="notebook-jump__status">Not yet churned</span>');
  });

  it('reads Awaiting tasting when the one batch has no tasting', () => {
    const markup = render([makeBatch()]);
    expect(markup).toContain('<span class="notebook-jump__status">Awaiting tasting</span>');
    expect(markup).toContain('aria-label="Go to batch, Awaiting tasting"');
  });

  it('reads Tasted when the one batch has a tasting', () => {
    const markup = render([makeBatch({ tasting: { tastedDate: '2026-01-03' } })]);
    expect(markup).toContain('<span class="notebook-jump__status">Tasted</span>');
    expect(markup).toContain('aria-label="Go to batch, Tasted"');
  });

  it('decides the newest batch by sortedBatches, not array order', () => {
    const older = makeBatch({ id: 'older', churn: { churnDate: '2026-01-01' }, tasting: { tastedDate: '2026-01-02' } });
    const newer = makeBatch({ id: 'newer', churn: { churnDate: '2026-02-01' }, tasting: null });
    expect(render([newer, older])).toContain('<span class="notebook-jump__status">Awaiting tasting</span>');
    const olderUntasted = makeBatch({ id: 'older', churn: { churnDate: '2026-01-01' }, tasting: null });
    const newerTasted = makeBatch({ id: 'newer', churn: { churnDate: '2026-02-01' }, tasting: { tastedDate: '2026-02-02' } });
    expect(render([olderUntasted, newerTasted])).toContain('<span class="notebook-jump__status">Tasted</span>');
    expect(render([newerTasted, olderUntasted])).toContain('<span class="notebook-jump__status">Tasted</span>');
  });
});

describe("the words are Home's own (STANDING_WORDS in lastEvent.js)", () => {
  it('holds the three standing words, keyed by the three constants', () => {
    expect(STANDING_WORDS).toEqual({
      [NOT_YET_CHURNED]: 'Not yet churned',
      [AWAITING_TASTING]: 'Awaiting tasting',
      [TASTED]: 'Tasted',
    });
  });
});
