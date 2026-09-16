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

describe('touch targets below the 760px step-down — 44px, stops 44x44 (sketch findings; 03.3.1-06 Task 2; 03.3.1.1 tenth round)', () => {
  test('the touch tokens resolve through resolveTokenPx to 44 and 44, and the stop-height alias rides --touch-min', () => {
    expect(resolveTokenPx(tokens, '--touch-min')).toBe(44);
    expect(resolveTokenPx(tokens, '--touch-stop-width')).toBe(44);
    expect(resolveTokenPx(tokens, '--touch-stop-height')).toBe(44);
  });

  test("inside the media block, `button, select, .ink-field, .segmented__option, .batch-margin .chip-toggle` declares min-height reading --touch-min (the defect rides the same 44px target as the segment option, sketch 007 line 179)", () => {
    const rule = mediaRuleFor('button, select, .ink-field, .segmented__option, .batch-margin .chip-toggle');
    expect(rule, 'expected the media-block control rule').toBeTruthy();
    expect(rule.media).toBe('(max-width: 759.98px), (pointer: coarse)');
    expect(rule.declarations).toMatch(/min-height:\s*var\(--touch-min\)/);
    expect(rule.declarations).not.toMatch(/:\s*-?\d+(?:\.\d+)?px/);
  });

  test('inside the media block, the axis-mark stop box declares the joined 44x44 cell, with a flex-basis so the joined row grows too (03.3.1-06 Task 1 moved the box from the input to the label; 03.3.1.1 tenth round)', () => {
    // Resolved on media, not by mediaRuleFor's first match: since 260915-x6n
    // the touch union carries an .axis-mark__stop rule too (decision C's
    // height-only growth), and it comes first in source order.
    const rule = rules.find((r) => r.selector === '.axis-mark__stop' && r.media === '(max-width: 759.98px)');
    expect(rule, 'expected the width-only axis-mark__stop rule').toBeTruthy();
    expect(rule.declarations).toMatch(/width:\s*var\(--touch-stop-width\)/);
    expect(rule.declarations).toMatch(/height:\s*var\(--touch-stop-height\)/);
    expect(rule.declarations).toMatch(/flex-basis:\s*var\(--touch-stop-width\)/);
    expect(rule.declarations).not.toMatch(/:\s*-?\d+(?:\.\d+)?px/);
  });

  test('inside the media block, the stops and anchors tracks both widen to the 216px --track-stop-narrow', () => {
    const rule = mediaRuleFor('.axis-mark__stops, .axis-mark__anchors');
    expect(rule, 'expected the media-block track-width rule').toBeTruthy();
    expect(rule.media).toBe('(max-width: 759.98px)');
    expect(rule.declarations).toMatch(/width:\s*var\(--track-stop-narrow\)/);
  });

  test('the touch union carries the six sizing rules, and the width-only block keeps the version row (Mark, 2026-09-15: touch is a mode, the version row collapse is a width decision)', () => {
    const touchRules = rules.filter((r) => r.media === '(max-width: 759.98px), (pointer: coarse)');
    expect(touchRules.map((r) => r.selector)).toEqual([
      'button, select, .ink-field, .segmented__option, .batch-margin .chip-toggle',
      '.text-control',
      // Sketch 008 line 260 grows the checkbox LABEL, not the square — the
      // two flex labels holding the Skipped and Uses checkboxes.
      '.method-step__uses-item, .method-step__strike-control',
      // The NARROW drawing (007 line 180, 008 line 167): Clear is 44px here,
      // so the caption line reserves 44px marked or not. Sketch 009 replaces
      // this at a wide touch viewport, in its own block — it cannot live here,
      // because the union also matches every narrow width.
      '.axis-mark__head, .segmented-field__head',
      // Sketch 008 line 166, approved 2026-09-15.
      '.ink-field, .prose-field',
      // Decision C: HEIGHT only. The width and the track stay width-keyed below.
      '.axis-mark__stop',
    ]);
    // Track GEOMETRY stays width-only: a 216px track overflows the 213.3px
    // column of the wide-viewport axes grid (measured, Mark's iPad 1366 coarse).
    const widthOnly = rules.filter((r) => r.media === '(max-width: 759.98px)');
    expect(widthOnly.map((r) => r.selector)).toEqual([
      '.recipe-band__row-version',
      '.axis-mark__stops, .axis-mark__anchors',
      '.axis-mark__stop',
    ]);
  });

  test("decision C: the touch union grows the stop's HEIGHT only — the width and the track stay width-keyed (sketch 009, Mark 2026-09-15)", () => {
    // The whole point of C. A 44px stop WIDTH makes a 216px track, and at a
    // wide touch viewport the axes grid gives each axis 213.3px — so the track
    // overflowed into its neighbour (measured on Mark's iPad, 1366 coarse).
    // Growing only the height gives a 38x44 target on the unchanged 186px
    // track. If a width or flex-basis ever appears here, that regression is
    // back.
    const rule = rules.find((r) => r.selector === '.axis-mark__stop' && r.media === '(max-width: 759.98px), (pointer: coarse)');
    expect(rule, 'expected the touch-union axis-mark__stop rule').toBeTruthy();
    expect(rule.declarations).toMatch(/height:\s*var\(--touch-stop-height\)/);
    expect(rule.declarations).not.toMatch(/(^|[^-])width:/);
    expect(rule.declarations).not.toMatch(/flex-basis/);
  });

  test('M4: Clear in a caption line takes its touch target as an overflowing hit area, not as line height (sketch 009, Mark 2026-09-15)', () => {
    const box = rules.find((r) => r.selector === '.axis-mark__head .text-control, .segmented-field__head .text-control' && r.media === '(min-width: 760px) and (pointer: coarse)');
    expect(box, 'expected the caption-line text-control rule').toBeTruthy();
    // It must UNDO the blanket .text-control min-height above it, or the line
    // grows and the melt row goes 15.2px out again.
    expect(box.declarations).toMatch(/min-height:\s*0/);
    expect(box.declarations).toMatch(/position:\s*relative/);

    const hit = rules.find((r) => r.selector === '.axis-mark__head .text-control::after, .segmented-field__head .text-control::after' && r.media === '(min-width: 760px) and (pointer: coarse)');
    expect(hit, 'expected the hit-area pseudo-element rule').toBeTruthy();
    expect(hit.declarations).toMatch(/position:\s*absolute/);
    expect(hit.declarations).toMatch(/height:\s*var\(--touch-min\)/);
  });

  test('M4 is scoped to the WIDE touch viewport; the narrow drawing keeps its 44px caption line (sketches 007/008 vs 009)', () => {
    // The re-measure caught this: applying M4 across the whole touch union
    // overwrote 007/008's narrow drawing at 680, 580, 480 and 393, where the
    // head read 28.8px against the sketch's 44px. Each drawing governs the
    // case it was drawn for, and this test fails if they are merged again.
    const wide = rules.find((r) => r.selector === '.axis-mark__head, .segmented-field__head' && r.media === '(min-width: 760px) and (pointer: coarse)');
    expect(wide, 'expected the wide-touch caption-line rule').toBeTruthy();
    expect(wide.declarations).toMatch(/min-height:\s*var\(--caption-two-lines-abs\)/);

    const narrow = rules.find((r) => r.selector === '.axis-mark__head, .segmented-field__head' && r.media === '(max-width: 759.98px), (pointer: coarse)');
    expect(narrow, 'expected the narrow caption-line rule').toBeTruthy();
    expect(narrow.declarations).toMatch(/min-height:\s*var\(--caption-line-h-touch\)/);
  });

  test("sketch 008's touch font bump survives the 600px step (260915-x6n)", () => {
    const bump = rules.find((r) => r.selector === '.ink-field, .prose-field' && r.media === '(max-width: 759.98px), (pointer: coarse)');
    expect(bump, 'expected the touch-union font rule').toBeTruthy();
    expect(bump.declarations).toMatch(/font-size:\s*var\(--type-note\)/);

    // The 600px step used to pull .ink-field back down to --type-control,
    // which is the pre-declared 13px departure 008 line 166 retires — and
    // below 600 is exactly where a phone's auto-zoom bites. The step now
    // names only the margin's own prose field.
    const step = rules.find((r) => r.media === '(max-width: 600px)' && /font-size/.test(r.declarations) && r.selector.includes('batch-margin__field'));
    expect(step, 'expected the 600px font-size rule').toBeTruthy();
    expect(step.selector).not.toMatch(/\.ink-field/);
  });

  test('the touch union gives .text-control its own min-height (sketch 003 line 178, 007 line 180; settled 2026-09-14)', () => {
    // Superseded: .text-control controls are <button>s, inline-block, and
    // do take a minimum height — 24px at desktop (the bare rule), 44px
    // here, matching every other control in the block.
    const rule = mediaRuleFor('.text-control');
    expect(rule, 'expected a media-scoped .text-control rule').toBeTruthy();
    expect(rule.media).toBe('(max-width: 759.98px), (pointer: coarse)');
    expect(rule.declarations).toMatch(/min-height:\s*var\(--touch-min\)/);
  });

  test('.text-toggle sits before the touch union in source order, so .text-control wins min-height at a coarse pointer (one fill for every on state, 2026-09-16)', () => {
    // readAllRules returns rules in source order (css-source.js walks the
    // file linearly). .text-toggle must come after .text-control's own
    // rules (desktop 32px over 24px) and before the touch union (so
    // .text-control's later 44px min-height wins there) — reordering these
    // two rules would silently change the touch target.
    const toggleIndex = rules.findIndex((r) => r.selector === '.text-toggle' && r.media === undefined);
    const touchTextControlIndex = rules.findIndex(
      (r) => r.selector === '.text-control' && r.media === '(max-width: 759.98px), (pointer: coarse)',
    );
    expect(toggleIndex).toBeGreaterThanOrEqual(0);
    expect(touchTextControlIndex).toBeGreaterThanOrEqual(0);
    expect(toggleIndex).toBeLessThan(touchTextControlIndex);

    // No .text-toggle rule exists inside any media block — the 44px can
    // only come from .text-control winning by source order.
    const mediaScopedToggle = rules.filter((r) => r.selector === '.text-toggle' && r.media !== undefined);
    expect(mediaScopedToggle).toHaveLength(0);
  });
});

describe('the 600px block — a second, narrower step (03.3.1-06 Task 2)', () => {
  test('.recipe-page carries its own reduced padding in the 600px block', () => {
    // mediaRuleFor is first-match by selector across all media blocks
    // (PATTERNS.md caveat); .recipe-page now also has a rule in the
    // 1099.98px block (03.3.1.1-01 Task 1), so this test filters by
    // r.media directly instead.
    const rule = rules.find((r) => r.selector === '.recipe-page' && r.media === '(max-width: 600px)');
    expect(rule, 'expected a media-scoped .recipe-page rule').toBeTruthy();
    expect(rule.media).toBe('(max-width: 600px)');
    expect(rule.declarations).toMatch(/padding:\s*var\(--gap-m\)/);
  });

  test("the margin's prose field drops to the control role in the 600px block — and .ink-field no longer goes with it (260915-x6n)", () => {
    // .ink-field used to ride this rule. Sketch 008 line 166 retires that 13px
    // as a pre-declared departure, and below 600 is exactly where a phone's
    // auto-zoom bites, so the touch union's 16px must survive the step. The
    // margin's own prose field is not what 008 speaks for, and keeps the
    // smaller size.
    const rule = mediaRuleFor('.batch-margin__field');
    expect(rule, 'expected a media-scoped field-text rule').toBeTruthy();
    expect(rule.media).toBe('(max-width: 600px)');
    expect(rule.declarations).toMatch(/font-size:\s*var\(--type-control\)/);
    expect(rule.selector).not.toMatch(/\.ink-field/);
  });

  test('both save ceremonies wrap through one rule (D-01)', () => {
    const rule = mediaRuleFor('.save-ceremony, .pen-foot__controls');
    expect(rule, 'expected a media-scoped save-ceremony/pen-foot wrap rule').toBeTruthy();
    expect(rule.media).toBe('(max-width: 600px)');
    expect(rule.declarations).toMatch(/flex-wrap:\s*wrap/);
  });

  test('the ingredient table region scrolls inside itself at 600px and below (RESEARCH Pitfall 7, D-15)', () => {
    const rule = rules.find(
      (r) => r.selector === '.ingredient-table-region' && r.media === '(max-width: 600px)',
    );
    expect(rule, 'expected a media-scoped .ingredient-table-region rule').toBeTruthy();
    expect(rule.declarations).toMatch(/overflow-x:\s*auto/);
  });

  test('app.css carries exactly six top-level @media blocks, at the six named conditions (03.3.1.1-01 Task 1; 03.3.1.1-03 Task 1; touch union 2026-09-15; 260915-x6n touch font)', () => {
    const mediaConditions = [...new Set(rules.filter((r) => r.media !== undefined).map((r) => r.media))];
    expect(mediaConditions.sort()).toEqual([
      '(forced-colors: active)',
      '(max-width: 1099.98px)',
      '(max-width: 600px)',
      '(max-width: 759.98px)',
      '(max-width: 759.98px), (pointer: coarse)',
      '(min-width: 760px) and (pointer: coarse)',
    ]);
  });
});

describe('the 1099.98px block — the page stacks (sketch 003 line 48, D-15)', () => {
  const stackRules = rules.filter((r) => r.media === '(max-width: 1099.98px)');

  test('carries exactly .recipe-page, .pen-foot and .pen-foot__controls, in order', () => {
    expect(stackRules.map((r) => r.selector)).toEqual([
      '.recipe-page',
      '.pen-foot',
      '.pen-foot__controls',
    ]);
  });

  test('.recipe-page stacks to one column in the band/ingredients/side/method/foot order, with no padding declaration', () => {
    const rule = stackRules.find((r) => r.selector === '.recipe-page');
    expect(rule, 'expected the media-scoped .recipe-page rule').toBeTruthy();
    expect(rule.declarations).toMatch(/grid-template-columns:\s*1fr/);
    expect(rule.declarations).toMatch(/'band'\s*'ingredients'\s*'side'\s*'method'\s*'foot'/);
    expect(rule.declarations).not.toMatch(/padding/);
  });

  test(".recipe-band__row-version's desktop columns read --vmeta-min at a 300px floor (sketch 003 line 69)", () => {
    const rule = ruleFor('.recipe-band__row-version');
    expect(rule, 'expected the desktop .recipe-band__row-version rule').toBeTruthy();
    expect(rule.declarations).toMatch(
      /minmax\(0, 1\.6fr\) minmax\(var\(--vmeta-min\), 1fr\)/,
    );
    expect(resolveTokenPx(tokens, '--vmeta-min')).toBe(300);
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

  test('the ten caption rules read --type-label at weight 500', () => {
    for (const selector of [
      '.headnote__version-field span',
      '.headnote__reason-field span',
      '.headnote__citation span:first-child',
      '.versions__ceremony-field span',
      '.batch-row__cell-label',
      '.method-step__uses legend',
      '.method-step__skipped-label',
      '.versions__lineage-label',
      '.pen-caption',
      '.axis-mark__name',
    ]) {
      const rule = ruleFor(selector);
      expect(rule, `expected ${selector} to carry the caption role`).toBeTruthy();
      expect(rule.declarations).toMatch(/font-size:\s*var\(--type-label\)/);
      expect(rule.declarations).toMatch(/font-weight:\s*500/);
    }
  });

  test('.pen-caption carries the sketch\'s own uppercase/tracking/gap declarations (sketch 007 @ 2a212be lines 36 + 156, D-10)', () => {
    const rule = ruleFor('.pen-caption');
    expect(rule, 'expected a .pen-caption rule').toBeTruthy();
    expect(rule.declarations).toMatch(/margin:\s*0 0 var\(--gap-xs\)/);
    expect(rule.declarations).toMatch(/text-transform:\s*uppercase/);
    expect(rule.declarations).toMatch(/letter-spacing:\s*0\.04em/);
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

  test('the recorded figure reads the note size at the prose weight, in pen blue (sketch 003 line 88, D-15)', () => {
    const rule = ruleFor('.batch-row__cell-value');
    expect(rule, 'expected a .batch-row__cell-value rule').toBeTruthy();
    expect(rule.declarations).toMatch(/font-size:\s*var\(--type-note\)/);
    expect(rule.declarations).toMatch(/font-weight:\s*400/);
    expect(rule.declarations).toMatch(/color:\s*var\(--pen-blue\)/);
    const absentRule = ruleFor('.batch-row__unit--absent');
    expect(absentRule, 'expected a .batch-row__unit--absent rule').toBeTruthy();
    expect(absentRule.declarations).toMatch(/color:\s*var\(--ink\)/);
  });

  test('.text-control reads the control role at a 24px minimum height (sketch 003 line 32, 007 line 131, D-15)', () => {
    const rule = ruleFor('.text-control');
    expect(rule, 'expected a .text-control rule').toBeTruthy();
    expect(rule.declarations).toMatch(/font-size:\s*var\(--type-control\)/);
    expect(rule.declarations).toMatch(/min-height:\s*var\(--text-control-min\)/);
    expect(tokens['--text-control-min']).toBe('24px');
  });
});

describe("the sketch's field row (007 @ 2a212be lines 37-44, D-13)", () => {
  test('.field-unit .ink-field reads the 56px figure width', () => {
    const rule = ruleFor('.field-unit .ink-field');
    expect(rule, 'expected a .field-unit .ink-field rule').toBeTruthy();
    expect(rule.declarations).toMatch(/width:\s*var\(--field-w-figure\)/);
    expect(resolveTokenPx(tokens, '--field-w-figure')).toBe(56);
  });

  test('.field-row__label--date reads the 128px date width', () => {
    const rule = ruleFor('.field-row__label--date');
    expect(rule, 'expected a .field-row__label--date rule').toBeTruthy();
    expect(rule.declarations).toMatch(/width:\s*var\(--field-w-date\)/);
    expect(resolveTokenPx(tokens, '--field-w-date')).toBe(128);
  });

  test('.method-step__on-demand sits at its own content width, not stretched by the column flex wrapper', () => {
    const rule = ruleFor('.method-step__on-demand');
    expect(rule, 'expected a .method-step__on-demand rule').toBeTruthy();
    expect(rule.declarations).toMatch(/align-self:\s*flex-start/);
  });

  test('.field-row .pen-caption reserves the two-line caption height, excluding a segmented head sharing the row (Melt style; sketch 007 line 180)', () => {
    const rule = ruleFor('.field-row .pen-caption:not(.segmented-field__caption)');
    expect(rule, 'expected a .field-row .pen-caption rule').toBeTruthy();
    // The em token, deliberately: this element IS a caption, so 2.4em resolves
    // against its own 12px. The -abs companion exists for the caption LINE,
    // which holds a caption without being one. Both must reach 28.8px.
    expect(rule.declarations).toMatch(/min-height:\s*var\(--caption-two-lines\)/);
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

  test('the axis/segmented head row picks up the same 6px caption-to-content gap, ahead of the stops, and reserves Clear\'s own height (03.3.1-06 Task 1; 03.3.1.1 tenth round)', () => {
    // The rebuilt axis-mark stacks three rows (head, stops, anchors)
    // rather than the retired .axis-mark__legend's single caption-above-
    // content shape, so the 6px gap now belongs to the head row as a
    // whole (name + inline state + Clear), not the name span alone. The
    // tenth round grouped this rule with .segmented-field__head (Plan
    // 04's markup) and gave it a reserved min-height so picking moves
    // nothing (007 line 75).
    const rule = ruleFor('.axis-mark__head, .segmented-field__head');
    expect(rule, 'expected the grouped .axis-mark__head, .segmented-field__head rule').toBeTruthy();
    expect(rule.declarations).toMatch(/margin-bottom:\s*var\(--gap-xs\)/);
    expect(rule.declarations).toMatch(/min-height:\s*var\(--caption-line-h\)/);
    // M4 (sketch 009, Mark 2026-09-15): bottom-aligned, not centred, so the
    // caption's baseline lands where the field-row caption beside it lands.
    expect(rule.declarations).toMatch(/align-items:\s*flex-end/);
    // The head must NOT carry a font-size. An earlier M4 draft set one so the
    // em-based reserve would resolve against 12px, which fixed the arithmetic
    // but made the head's computed size differ from the sketch's for no
    // rendered reason — nothing inside inherits it, every child sets its own.
    // The multiplication moved into --caption-two-lines-abs instead.
    expect(rule.declarations).not.toMatch(/font-size:/);
  });
});

describe('joined stops (007 @ 2a212be lines 80-81, 124)', () => {
  test('.axis-mark__stops carries no gap — the cells share hairlines through a negative margin', () => {
    const rule = ruleFor('.axis-mark__stops');
    expect(rule, 'expected a .axis-mark__stops rule').toBeTruthy();
    expect(rule.declarations).not.toMatch(/gap:/);
  });

  test('.axis-mark__stop reads a 38px flex-basis and a one-hairline negative right margin, reset on :last-child', () => {
    const rule = ruleFor('.axis-mark__stop');
    expect(rule, 'expected a .axis-mark__stop rule').toBeTruthy();
    expect(rule.declarations).toMatch(/flex:\s*0 0 var\(--stop-w\)/);
    expect(rule.declarations).toMatch(/margin-right:\s*calc\(-1 \* var\(--rule-ink-field\)\)/);
    const lastChildRule = ruleFor('.axis-mark__stop:last-child');
    expect(lastChildRule, 'expected a .axis-mark__stop:last-child rule').toBeTruthy();
    expect(lastChildRule.declarations).toMatch(/margin-right:\s*0/);
  });

  test('--stop-w resolves to 38 and --stop-gap is retired; the caption-line tokens resolve to 24 and 44', () => {
    expect(resolveTokenPx(tokens, '--stop-w')).toBe(38);
    expect(tokens['--stop-gap']).toBeUndefined();
    expect(resolveTokenPx(tokens, '--caption-line-h')).toBe(24);
    expect(resolveTokenPx(tokens, '--caption-line-h-touch')).toBe(44);
  });

  test('the axes grid reads column-gap: 0 — clearance now carried by padding on the flanking columns', () => {
    const rule = ruleFor('.axes-grid');
    expect(rule, 'expected a .axes-grid rule').toBeTruthy();
    expect(rule.declarations).toMatch(/column-gap:\s*0/);
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
