// The show-changes state's struck head and hollow tick (03-04): the rule
// draws exactly the figureDelta it is given and computes no comparison of
// its own. Renders through renderToStaticMarkup in the existing node
// Vitest environment — GraduatedRule renders no links, so no router
// context is needed.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GraduatedRule } from './GraduatedRule.jsx';

const figure = {
  key: 'fat',
  label: 'Total fat',
  value: 18.8,
  unit: '%',
  decimals: 1,
  domain: [0, 30],
  band: [16, 18],
  deviation: { kind: 'above', amount: 0.8, words: '0.8% above 18%' },
  basis: 'stated',
  estimatedRowNames: [],
};

describe('GraduatedRule — no figureDelta', () => {
  it('renders exactly one tick element and no struck head', () => {
    const markup = renderToStaticMarkup(<GraduatedRule figure={figure} />);
    // The value tick is the only line drawn at the tick's own stroke
    // weight (2.5) — the graduations, baseline, and band edges all use
    // narrower weights, so this count isolates the tick specifically.
    const tickLines = markup.match(/stroke-width="2\.5"/g) ?? [];
    expect(tickLines).toHaveLength(1);
    expect(markup).not.toMatch(/<rect[^>]*fill="none"/);
    expect(markup).not.toContain('struck-value');
  });
});

describe('GraduatedRule — a changed figureDelta', () => {
  const figureDelta = { key: 'fat', label: 'Total fat', unit: '%', decimals: 1, from: 18.0, to: 18.8, changed: true };

  it('renders a struck head carrying the parent\'s value and a hollow tick element with fill="none"', () => {
    const markup = renderToStaticMarkup(<GraduatedRule figure={figure} figureDelta={figureDelta} />);
    expect(markup).toContain('struck-value');
    expect(markup).toContain('18.0%');
    expect(markup).toMatch(/<rect[^>]*fill="none"/);
  });

  it('carries "was 18.0%, now 18.8%" in the accessible name', () => {
    const markup = renderToStaticMarkup(<GraduatedRule figure={figure} figureDelta={figureDelta} />);
    expect(markup).toMatch(/aria-label="[^"]*was 18\.0%, now 18\.8%[^"]*"/);
  });

  it('computes no comparison of its own — no call to buildDiff, buildFigures or computeBalance', () => {
    // Structural guard mirrored from the plan's own grep gate: this file
    // must never import any of the three.
    expect(GraduatedRule.toString()).not.toMatch(/buildDiff\(|buildFigures\(|computeBalance\(/);
  });
});

describe('GraduatedRule — an unchanged figureDelta', () => {
  const figureDelta = { key: 'fat', label: 'Total fat', unit: '%', decimals: 1, from: 18.8, to: 18.8, changed: false };

  it('renders neither the struck head nor the hollow tick', () => {
    const markup = renderToStaticMarkup(<GraduatedRule figure={figure} figureDelta={figureDelta} />);
    expect(markup).not.toContain('struck-value');
    expect(markup).not.toMatch(/<rect[^>]*fill="none"/);
  });

  it('carries neither "was" nor "now" in the accessible name', () => {
    const markup = renderToStaticMarkup(<GraduatedRule figure={figure} figureDelta={figureDelta} />);
    const labelMatch = markup.match(/aria-label="([^"]*)"/);
    expect(labelMatch[1]).not.toMatch(/\bwas\b/);
    expect(labelMatch[1]).not.toMatch(/\bnow\b/);
  });
});
