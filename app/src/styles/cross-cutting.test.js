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
