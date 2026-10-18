// The show-changes state's struck head and hollow tick (03-04): the rule
// draws exactly the figureDelta it is given and computes no comparison of
// its own. Renders through renderToStaticMarkup in the existing node
// Vitest environment — GraduatedRule renders no links, so no router
// context is needed.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GraduatedRule, RuleDrawing } from './GraduatedRule.jsx';
import { buildFigures, describeDeviation } from '../domain/figures.js';
import { oliveOilVersion } from '../data/olive-oil.js';

const figure = {
  key: 'fat',
  label: { word: 'Fat', term: null },
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
  const figureDelta = { key: 'fat', label: { word: 'Fat', term: null }, unit: '%', decimals: 1, from: 18.0, to: 18.8, changed: true };

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
  const figureDelta = { key: 'fat', label: { word: 'Fat', term: null }, unit: '%', decimals: 1, from: 18.8, to: 18.8, changed: false };

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

describe('GraduatedRule — the two-part label (D11)', () => {
  it('renders both a graduated-rule__label-word and a graduated-rule__label-term span when the label carries a term, and the accessible name begins with "word · term, "', () => {
    const withTerm = { ...figure, label: { word: 'Freezing', term: 'PAC' } };
    const markup = renderToStaticMarkup(<GraduatedRule figure={withTerm} />);
    expect(markup).toMatch(/<span class="graduated-rule__label-word">Freezing<\/span>/);
    expect(markup).toMatch(/<span class="graduated-rule__label-term"> · PAC<\/span>/);
    const labelMatch = markup.match(/aria-label="([^"]*)"/);
    expect(labelMatch[1]).toMatch(/^Freezing · PAC, /);
  });

  it('renders only graduated-rule__label-word — no graduated-rule__label-term anywhere — when the label carries no term, and the accessible name begins with "word, "', () => {
    const markup = renderToStaticMarkup(<GraduatedRule figure={figure} />);
    expect(markup).toMatch(/<span class="graduated-rule__label-word">Fat<\/span>/);
    expect(markup).not.toContain('graduated-rule__label-term');
    const labelMatch = markup.match(/aria-label="([^"]*)"/);
    expect(labelMatch[1]).toMatch(/^Fat, /);
  });
});

// Quick task 261001-doi: WebKit without Safari's tab-to-highlight preference
// Tabs only into text entry and into controls that carry an explicit
// tabindex — the same rule as every link, recorded in .claude/CLAUDE.md
// (the cause is spelled out in Segmented.test.jsx). Pinned on rendered
// markup: the attribute's whole effect is in the DOM WebKit reads.
describe('GraduatedRule — tabindex 0 unless the caller keeps the rule off the tab path (quick task 261001-doi)', () => {
  it('renders one button carrying tabindex="0" when the caller passes no tabIndex', () => {
    const markup = renderToStaticMarkup(<GraduatedRule figure={figure} />);
    const buttons = markup.match(/<button\b[^>]*>/g);
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toContain('tabindex="0"');
  });

  it('keeps the caller\'s tabIndex of -1 (recording, developing) and carries no tabindex="0"', () => {
    const markup = renderToStaticMarkup(<GraduatedRule figure={figure} tabIndex={-1} />);
    const buttons = markup.match(/<button\b[^>]*>/g);
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toContain('tabindex="-1"');
    expect(markup).not.toContain('tabindex="0"');
  });
});

// The printed gauge (04-07) draws the rule's inner drawing alone, inside a
// static div: paper has no controls. The button wraps the very same drawing.
describe('RuleDrawing — the drawing without the button', () => {
  it('renders the same head text and the same SVG as the button holds, and no button', () => {
    const drawing = renderToStaticMarkup(<RuleDrawing figure={figure} />);
    const button = renderToStaticMarkup(<GraduatedRule figure={figure} />);
    expect(drawing).not.toContain('<button');
    expect(drawing).toContain('graduated-rule__label-word">Fat<');
    expect(drawing).toContain('graduated-rule__value">18.8%<');
    expect(drawing.match(/<svg[\s\S]*<\/svg>/)[0]).toBe(button.match(/<svg[\s\S]*<\/svg>/)[0]);
    expect(button).toContain(drawing);
  });
});

// D-20 (04-10): the deviation words the eye reads under the rule sit in its
// accessible name too, right after the target and before the basis.
describe('GraduatedRule — the deviation words in the accessible name', () => {
  const nameOf = (f) => renderToStaticMarkup(<GraduatedRule figure={f} />).match(/aria-label="([^"]*)"/)[1];

  it('names an inside figure after its target', () => {
    const inside = { ...figure, value: 17, deviation: { kind: 'inside', amount: 0, words: 'inside 16–18%' } };
    expect(nameOf(inside)).toBe('Fat, 17.0%, target 16–18%, inside 16–18%');
  });

  it('names a figure below its band after its target', () => {
    const below = { ...figure, value: 15, deviation: { kind: 'below', amount: 1, words: '1.0% below 16%' } };
    expect(nameOf(below)).toBe('Fat, 15.0%, target 16–18%, 1.0% below 16%');
  });

  it('says no target set once for a figure with no band, and adds nothing after it', () => {
    const none = { ...figure, band: null, deviation: { kind: 'none', amount: null, words: 'no target set' } };
    const name = nameOf(none);
    expect(name).toBe('Fat, 18.8%, no target set');
    expect(name.match(/no target set/g)).toHaveLength(1);
  });

  it('keeps the basis last, after the deviation words', () => {
    const est = { ...figure, deviation: { kind: 'above', amount: 0.8, words: '0.8% above 18%' }, basis: 'estimated', estimatedRowNames: ['Whole milk', 'Heavy cream'] };
    expect(nameOf(est)).toBe('Fat, 18.8%, target 16–18%, 0.8% above 18%, estimated: Whole milk, and Heavy cream');
  });
});

// Sketch 010 D30 (Mark, 2026-10-18): the Sweetness rule runs 0 to 40. The
// numbers are the retaken boards' own (sheet-page-1-formula.html and
// screen-draft-kept.html), in the rule's 320-unit drawing.
describe('RuleDrawing — the Sweetness · POD rule on 0 to 40 (sketch 010 D30)', () => {
  const podOf = (version) => buildFigures(version).find((f) => f.key === 'pod');
  const near = (actual, expected) => Math.abs(Number(actual) - expected) < 0.01;
  const edgesOf = (markup) => [...markup.matchAll(/<line x1="([\d.]+)" y1="2"/g)].map((m) => Number(m[1]));
  const bandOf = (markup) => markup.match(/<rect x="([\d.]+)" y="4" width="([\d.]+)"/);
  const tickOf = (markup) => markup.match(/<line x1="([\d.]+)" y1="0"[^>]*stroke-width="2\.5"/);
  const hollowOf = (markup) => markup.match(/<rect x="([\d.]+)" y="0" width="2\.5"[^>]*fill="none"/);

  it('draws Olive Oil v1\'s 12–16 band from 96 to 128, the tick at 104.37, and the anchors 0, inside 12–16, 40', () => {
    const markup = renderToStaticMarkup(<RuleDrawing figure={podOf(oliveOilVersion)} />);
    const band = bandOf(markup);
    expect(near(band[1], 96)).toBe(true);
    expect(near(band[2], 32)).toBe(true);
    const edges = edgesOf(markup);
    expect(edges).toHaveLength(2);
    expect(near(edges[0], 96)).toBe(true);
    expect(near(edges[1], 128)).toBe(true);
    expect(near(tickOf(markup)[1], 104.369)).toBe(true);
    expect(markup).toContain(
      '<div class="graduated-rule__anchors" aria-hidden="true"><span>0</span><span class="graduated-rule__deviation">inside 12–16</span><span>40</span></div>',
    );
  });

  it('draws the pen with Whole milk portion 1 at 110 g: hollow was tick at 103.119, tick at 105.613, head 13.0 then 13.2', () => {
    const draft = structuredClone(oliveOilVersion);
    draft.rows.find((row) => row.ingredientName === 'Whole milk').portions[0].grams = 110;
    const was = podOf(oliveOilVersion);
    const now = podOf(draft);
    const figureDelta = { key: 'pod', label: now.label, unit: '', decimals: 1, from: was.value, to: now.value, changed: true };
    const markup = renderToStaticMarkup(<RuleDrawing figure={now} figureDelta={figureDelta} />);
    expect(near(hollowOf(markup)[1], 103.119)).toBe(true);
    expect(near(tickOf(markup)[1], 105.613)).toBe(true);
    expect(markup).toContain('<span class="struck-value">13.0</span>13.2');
  });

  it('draws Sorbet\'s approved 24–32 band with both edges inside the rule, at 192 and 256', () => {
    const sorbet = { ...podOf(oliveOilVersion), value: 28, band: [24, 32], deviation: describeDeviation(28, [24, 32], 1, '') };
    const markup = renderToStaticMarkup(<RuleDrawing figure={sorbet} />);
    const edges = edgesOf(markup);
    expect(edges).toHaveLength(2);
    expect(near(edges[0], 192)).toBe(true);
    expect(near(edges[1], 256)).toBe(true);
    expect(Math.max(...edges)).toBeLessThan(319);
    expect(near(bandOf(markup)[2], 64)).toBe(true);
  });
});
