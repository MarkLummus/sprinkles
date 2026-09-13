// The cross-cutting type, spacing, and feedback contract
// (.claude/skills/sketch-findings-sprinkles/references/
// cross-cutting-type-spacing-feedback.md, applied by quick task
// 260912-ti1) — read through the same css-source.js module binder.test.js
// and columns.test.js read, so the three suites can never disagree about
// what a rule says.
//
// This suite has no layout engine — it runs under Vitest's default `node`
// environment, and nothing here executes a browser's cascade. Every
// assertion below reads app.css and tokens.css AS TEXT and checks the
// contract they state; it proves the tokens and rules are internally
// consistent, never that a pixel rendered. In particular it cannot prove
// the finding's own acceptance bar — zero horizontal overflow at 393px,
// 44px-class targets below 760px, 6px caption-to-content gaps measured in
// the DOM — that stays a real-browser measurement (plan task 3, recorded
// for end-of-phase UAT per human_verify_mode: end-of-phase). Rem-valued
// tokens are asserted by their value string, never resolveTokenPx, which
// parses px literals only.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, test, expect } from 'vitest';
import {
  readCustomProperties,
  resolveTokenPx,
  readAllRules,
  assertNoAtRules,
} from './css-source.js';

const STYLES_DIR = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = path.join(STYLES_DIR, 'tokens.css');
const APP_CSS_PATH = path.join(STYLES_DIR, 'app.css');

const tokensSource = readFileSync(TOKENS_PATH, 'utf8');
const appCssSource = readFileSync(APP_CSS_PATH, 'utf8');

const tokens = readCustomProperties(tokensSource);
const rules = readAllRules(appCssSource);

function ruleFor(selector) {
  return rules.find((r) => r.selector === selector && r.media === undefined);
}

function mediaRuleFor(selector) {
  return rules.find((r) => r.media !== undefined && r.selector === selector);
}

describe('touch targets below the 760px step-down — 44px, stops 40x44 (sketch findings)', () => {
  test('the two touch tokens resolve through resolveTokenPx to 44 and 40', () => {
    expect(resolveTokenPx(tokens, '--touch-min')).toBe(44);
    expect(resolveTokenPx(tokens, '--touch-stop-width')).toBe(40);
  });

  test("inside the media block, `button, select, .ink-field` declares min-height reading --touch-min", () => {
    const rule = mediaRuleFor('button, select, .ink-field');
    expect(rule, 'expected the media-block control rule').toBeTruthy();
    expect(rule.media).toBe('(max-width: 759.98px)');
    expect(rule.declarations).toMatch(/min-height:\s*var\(--touch-min\)/);
    expect(rule.declarations).not.toMatch(/:\s*-?\d+(?:\.\d+)?px/);
  });

  test("inside the media block, the radio-stop rule declares the validated 40x44 box", () => {
    const rule = mediaRuleFor(".axis-mark__stop input[type='radio']");
    expect(rule, 'expected the media-block radio-stop rule').toBeTruthy();
    expect(rule.media).toBe('(max-width: 759.98px)');
    expect(rule.declarations).toMatch(/width:\s*var\(--touch-stop-width\)/);
    expect(rule.declarations).toMatch(/height:\s*var\(--touch-min\)/);
    expect(rule.declarations).not.toMatch(/:\s*-?\d+(?:\.\d+)?px/);
  });

  test('the media block carries exactly the two rules the finding names', () => {
    const mediaRules = rules.filter((r) => r.media !== undefined);
    expect(mediaRules.map((r) => r.selector)).toEqual([
      'button, select, .ink-field',
      ".axis-mark__stop input[type='radio']",
    ]);
  });

  test('the .text-control exclusion is real: no media rule gives the inline controls a min-height', () => {
    // .text-control is inline underlined text; an inline box takes no
    // height and padding-based growth would wreck its flow.
    const controlRules = rules.filter((r) => r.media !== undefined && r.selector.includes('.text-control'));
    expect(controlRules).toEqual([]);
  });
});

describe('the stylesheet reader sees a media block (parser round-trip, css-source.js)', () => {
  test('readAllRules tags a media block\'s inner rules with its condition and its top-level neighbours with media undefined', () => {
    const fixture = [
      '.before { color: one; }',
      '@media (max-width: 500px) {',
      '  .inside { color: two; }',
      '}',
      '.after { color: three; }',
    ].join('\n');
    const parsed = readAllRules(fixture);
    expect(parsed.map((r) => [r.selector, r.media])).toEqual([
      ['.before', undefined],
      ['.inside', '(max-width: 500px)'],
      ['.after', undefined],
    ]);
  });

  test('assertNoAtRules still throws on a non-media at-rule and on an at-rule nested inside the media block', () => {
    expect(() => assertNoAtRules('@supports (x: y) { .a { color: red; } }')).toThrow();
    expect(() =>
      assertNoAtRules('@media (max-width: 500px) { @supports (x: y) { .a { color: red; } } }'),
    ).toThrow();
    expect(() => assertNoAtRules('@media (max-width: 500px) { .a { color: red; } }')).not.toThrow();
  });
});

describe('type roles — the four validated sizes mapped onto tokens', () => {
  test('the role tokens carry the sketch\'s values, by value string (resolveTokenPx is px-only)', () => {
    expect(tokens['--type-section']).toBe('0.875rem');
    expect(tokens['--leading-section']).toBe('1.35');
    expect(tokens['--type-label']).toBe('0.75rem');
    expect(tokens['--type-control']).toBe('0.8125rem');
    expect(tokens['--type-note']).toBe('1rem');
    expect(tokens['--leading-note']).toBe('1.5');
  });

  test('the four section-heading rules read the section role at weight 600 and leading 1.35', () => {
    for (const selector of ['.region-name', '.batch-margin__legend', '.authored__legend', '.derived-advisories__legend']) {
      const rule = ruleFor(selector);
      expect(rule, `expected ${selector} to carry the section role`).toBeTruthy();
      expect(rule.declarations).toMatch(/font-size:\s*var\(--type-section\)/);
      expect(rule.declarations).toMatch(/font-weight:\s*600/);
      expect(rule.declarations).toMatch(/line-height:\s*var\(--leading-section\)/);
    }
  });

  test('.region-name keeps its ratified surface traits — bookcloth colour and the uppercase/letter-spacing transform', () => {
    const rule = ruleFor('.region-name');
    expect(rule.declarations).toMatch(/color:\s*var\(--bookcloth\)/);
    expect(rule.declarations).toMatch(/text-transform:\s*uppercase/);
    expect(rule.declarations).toMatch(/letter-spacing:\s*0\.04em/);
  });

  test('the eight caption rules read --type-label at weight 500', () => {
    for (const selector of [
      '.headnote__version-field span',
      '.headnote__reason-field span',
      '.headnote__citation span:first-child',
      '.versions__ceremony-field span',
      '.batch-row__cell-label',
      '.method-step__uses legend',
      '.method-step__skipped-label',
      '.versions__lineage-label',
    ]) {
      const rule = ruleFor(selector);
      expect(rule, `expected ${selector} to carry the caption role`).toBeTruthy();
      expect(rule.declarations).toMatch(/font-size:\s*var\(--type-label\)/);
      expect(rule.declarations).toMatch(/font-weight:\s*500/);
    }
  });

  test('the axis name is the finding\'s named exception: --type-label at weight 600, down from 15px weight 400', () => {
    const rule = ruleFor('.axis-mark__legend');
    expect(rule.declarations).toMatch(/font-size:\s*var\(--type-label\)/);
    expect(rule.declarations).toMatch(/font-weight:\s*600/);
    expect(rule.declarations).not.toMatch(/var\(--size-table-body\)/);
  });

  test('the five helper and status sentences read the control role (13px)', () => {
    for (const selector of ['.pen-hint', '.batch-margin__hint', '.versions__hint', '.headnote__blocked', '.pen-foot__blocked']) {
      const rule = ruleFor(selector);
      expect(rule, `expected ${selector} to read the helper/status role`).toBeTruthy();
      expect(rule.declarations).toMatch(/font-size:\s*var\(--type-control\)/);
    }
  });

  test('helper and status text keeps one grotesk face, sentence case — no transform, so no state-change face flip', () => {
    for (const selector of ['.pen-hint', '.batch-margin__hint', '.versions__hint', '.headnote__blocked', '.pen-foot__blocked']) {
      const rule = ruleFor(selector);
      expect(rule.declarations).toMatch(/font-family:\s*var\(--face-grotesk\)/);
      expect(rule.declarations).not.toMatch(/text-transform/);
      expect(rule.declarations).not.toMatch(/font-style/);
    }
  });

  test('.authored__notes reads the note role and the note leading', () => {
    const rule = ruleFor('.authored__notes');
    expect(rule.declarations).toMatch(/font-size:\s*var\(--type-note\)/);
    expect(rule.declarations).toMatch(/line-height:\s*var\(--leading-note\)/);
  });

  test('.prose-text reads the note leading and keeps its deliberate size inherit (no font-size of its own)', () => {
    const rule = ruleFor('.prose-text');
    expect(rule.declarations).toMatch(/line-height:\s*var\(--leading-note\)/);
    expect(rule.declarations).not.toMatch(/font-size:/);
  });

  test('.prose-field keeps its deliberate size/leading inherit, untouched', () => {
    const rule = ruleFor('.prose-field');
    expect(rule.declarations).toMatch(/font-size:\s*inherit/);
    expect(rule.declarations).toMatch(/line-height:\s*inherit/);
  });
});

describe('placeholders italic, entered prose roman pen-blue', () => {
  test('::placeholder declares font-style: italic', () => {
    const rule = ruleFor('::placeholder');
    expect(rule.declarations).toMatch(/font-style:\s*italic/);
  });

  test('entered prose carries no italic of its own — .prose-field and .prose-text stay roman pen-blue', () => {
    expect(ruleFor('.prose-field').declarations).toMatch(/color:\s*var\(--pen-blue\)/);
    expect(ruleFor('.prose-field').declarations).not.toMatch(/font-style/);
    expect(ruleFor('.prose-text').declarations).toMatch(/color:\s*var\(--pen-blue\)/);
    expect(ruleFor('.prose-text').declarations).not.toMatch(/font-style/);
  });

  test('the purpose/aside display italic stays its own separate ratified register (text face, italic, untouched here)', () => {
    const rule = ruleFor('.method-step__purpose, .method-step__aside');
    expect(rule.declarations).toMatch(/font-style:\s*italic/);
    expect(rule.declarations).toMatch(/font-family:\s*var\(--face-text\)/);
  });
});

describe('the 6px caption-to-content gap — var(--gap-xs) everywhere a caption and its content share one label', () => {
  test('the eight existing sites read their caption-to-content distance through var(--gap-xs)', () => {
    for (const selector of [
      '.headnote__version-field span',
      '.headnote__reason-field span',
      '.headnote__citation span:first-child',
      '.versions__ceremony-field span',
      '.method-step__uses legend',
    ]) {
      const rule = ruleFor(selector);
      expect(rule, `expected ${selector} to carry the 6px caption gap`).toBeTruthy();
      expect(rule.declarations).toMatch(/margin-bottom:\s*var\(--gap-xs\)/);
    }
    for (const selector of ['.batch-margin__field', '.batch-row__cell', '.method-step__line-control']) {
      const rule = ruleFor(selector);
      expect(rule, `expected ${selector} to carry the 6px caption gap`).toBeTruthy();
      expect(rule.declarations).toMatch(/gap:\s*var\(--gap-xs\)/);
    }
  });

  test('the axis legend picks up the same gap for the first time', () => {
    expect(ruleFor('.axis-mark__legend').declarations).toMatch(/margin-bottom:\s*var\(--gap-xs\)/);
  });
});

describe('exclusion guards — registers the finding deliberately leaves in place', () => {
  test("the ingredient table's internal type keeps its measured register (columns.test.js's browser-measured column minimums depend on these sizes)", () => {
    expect(ruleFor('.ingredient-table th').declarations).toMatch(/font-size:\s*var\(--size-running-head\)/);
    expect(ruleFor('.table-small-print').declarations).toMatch(/font-size:\s*var\(--size-small-print\)/);
    expect(ruleFor('.ingredient-table__flag').declarations).toMatch(/font-size:\s*var\(--size-cross-flag\)/);
    // a --size-cross-flag consumer outside the table stays there too
    expect(ruleFor('.method-step__uses-line').declarations).toMatch(/font-size:\s*var\(--size-cross-flag\)/);
  });

  test('.running-head keeps its wayfinding register', () => {
    expect(ruleFor('.running-head').declarations).toMatch(/font-size:\s*var\(--size-running-head\)/);
  });

  test("the batch row's measured-cell small print keeps its ratified registers", () => {
    expect(ruleFor('.batch-row__plan').declarations).toMatch(/font-size:\s*var\(--size-small-print\)/);
    expect(ruleFor('.batch-row__unit').declarations).toMatch(/font-size:\s*var\(--size-deviation-words\)/);
    expect(ruleFor('.batch-row__later-meta').declarations).toMatch(/font-size:\s*var\(--size-small-print\)/);
  });
});
