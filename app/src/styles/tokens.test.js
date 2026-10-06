// The permanent net under a token rename (03.4-01). Reads tokens.css,
// app.css and home.css AS TEXT — the same convention
// columns.test.js/binder.test.js/cross-cutting.test.js/home.test.js already
// use via css-source.js — plus every .js/.jsx source under app/src/ui and
// app/src/domain, and proves two invariants no other suite checks: every
// var(--name) read resolves to something declared somewhere, and nothing
// tokens.css declares goes entirely unread. Runs under Vitest's node
// environment; it reads sources as text and asserts no rendered pixel.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, test, expect } from 'vitest';
import { readAllRules, readCustomProperties, stripCssComments } from './css-source.js';

const STYLES_DIR = path.dirname(fileURLToPath(import.meta.url));
const UI_DIR = path.join(STYLES_DIR, '..', 'ui');
const DOMAIN_DIR = path.join(STYLES_DIR, '..', 'domain');

const CSS_FILE_NAMES = ['tokens.css', 'app.css', 'home.css', 'shell.css', 'notebook.css'];

// One custom property is set inline via React's style prop: RecipeHistory.jsx
// puts the entry count on the History strip, a layout count read by
// notebook.css's track width (261001-den), so it has no declaration in
// tokens.css by design. D-04 (plan 05) retired --c, RecipeList.jsx's old
// per-row dealt-hue property, along with the rest of the Sprinkles Jar. A
// further inline custom property gets a named place here, documented, rather
// than silently widening the unresolved-token gate.
const LOCALLY_SET_CUSTOM_PROPERTIES = new Set(['--app-notebook-history-count']);

function stripJsComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function jsSourceFiles(dir) {
  return readdirSync(dir)
    .filter((name) => /\.(js|jsx)$/.test(name))
    .map((name) => ({
      label: `${path.basename(dir)}/${name}`,
      src: stripJsComments(readFileSync(path.join(dir, name), 'utf8')),
    }));
}

const cssSourceFiles = CSS_FILE_NAMES.map((name) => ({
  label: name,
  src: readFileSync(path.join(STYLES_DIR, name), 'utf8'),
}));

const jsFiles = [...jsSourceFiles(UI_DIR), ...jsSourceFiles(DOMAIN_DIR)];

// declared: every custom property declared anywhere across the four
// stylesheets, unioned — app.css's second --gap-page declaration inside its
// phone-forms block counts too, since readCustomProperties is a flat regex
// with no notion of media-block scope.
const declared = {};
for (const { src } of cssSourceFiles) Object.assign(declared, readCustomProperties(src));

function collectVarRefs(label, src) {
  const stripped = stripCssComments(src);
  const refs = [];
  const re = /var\((--[\w-]+)\)/g;
  let match;
  while ((match = re.exec(stripped))) refs.push({ file: label, name: match[1] });
  return refs;
}

const allRefs = [
  ...cssSourceFiles.flatMap(({ label, src }) => collectVarRefs(label, src)),
  ...jsFiles.flatMap(({ label, src }) => collectVarRefs(label, src)),
];

describe('tokens.test.js — the unresolved-token gate (03.4-01)', () => {
  test('every var() read resolves to a declared token', () => {
    const unresolved = allRefs.filter(
      (ref) => !(ref.name in declared) && !LOCALLY_SET_CUSTOM_PROPERTIES.has(ref.name),
    );
    const messages = unresolved.map((ref) => `${ref.name} (referenced in ${ref.file}, not declared anywhere)`);
    expect(messages).toEqual([]);
  });

  test('nothing is declared and never read', () => {
    const referencedNames = new Set(allRefs.map((ref) => ref.name));
    const declaredInTokens = readCustomProperties(readFileSync(path.join(STYLES_DIR, 'tokens.css'), 'utf8'));
    const unread = Object.keys(declaredInTokens).filter((name) => !referencedNames.has(name));

    // Seeded from the actual run on this tree (2026-09-21): six SVG
    // geometry tokens GraduatedRule.jsx hand-mirrors as plain JS numbers
    // rather than reading with var() (its own header comment explains why
    // — SVG presentation attributes read user-space units, not CSS
    // lengths); --app-pantry, reserved for a destination not yet built
    // (D-09's rail has no Pantry entry); and two App geometry tokens
    // (--app-rule-nav-active, --app-size-brand-rule) whose only consumers
    // were Home's active-nav underline and its brand rule — both removed
    // by 03.4-03 Task 2 when nav moved into Shell.jsx. They stay declared
    // for now since D-04 (plan 05) is the only step allowed to retire a
    // token outright. --app-radius-action is no longer in this list —
    // 03.4-04 Task 2's filled action (.home__action) is its first
    // consumer.
    //
    // Every App destination/neutral colour (--app-notebook, --app-blue,
    // etc.) and --app-notebook-text/--app-blue-text/--app-surface-subtle
    // are no longer in this list — shell.css's rail and tools row (Task
    // 1/2) are their first consumers. The hand's four tokens (D-17) are
    // no longer in this list either — plan 02's .app-hand rule in app.css
    // is their first consumer; Home's lead-block Next-time text (D-18,
    // 03.4-04 Task 1) is their second.
    //
    // The Jar's six hues and the twelve per-recipe hues are gone from
    // this list entirely — 03.4-05 (D-04) deleted their declarations
    // from tokens.css outright, so they no longer exist to be unread.
    // --app-duration is also newly unread — its one consumer, .home__row's
    // hover transition, had no reason to survive once the row stopped
    // being a single link (D-11: the row is a block, not a link).
    const expectedUnread = [
      '--rule-band-edge',
      '--rule-tick',
      '--sheet-hatch-pitch',
      '--sheet-hatch-stroke',
      '--gap-mark-stop',
      '--rule-tick-hollow',
      '--app-duration',
      '--app-pantry',
      '--app-rule-nav-active',
      '--app-size-brand-rule',
    ];
    expect(unread.sort()).toEqual(expectedUnread.sort());
  });
});

describe('tokens.test.js — the prefix-discipline gate (03.4-01 Task 3)', () => {
  // Two named worlds only: every Sheet-frame token takes --sheet- (D-01),
  // every App token takes --app- (D-03). Anything else must be one of two
  // explicitly named exceptions, so a context-free rename slipping back in
  // (D-01's own invariant, assumption_delta_decision) or a retired token
  // surviving past plan 05 both go red here instead of passing silently.

  // D-02: shared, context-free sizes the App and the Sheet both read by
  // their bare names — the spacing scale, touch, every --rule-*, the focus
  // outline pair and the prose measure. Decision #3 (03.4-CONTEXT.md,
  // "Where D-01 and D-02 name the same token, D-02 wins, by name family"):
  // the strike/mark/select/chevron-room tokens and --rule-width are shared
  // sizes by family even though D-01's prose calls them Sheet tokens.
  const SHARED_SPACING_AND_RULES = [
    '--gap-hair', '--gap-xs', '--gap-s', '--gap-m', '--gap-l', '--gap-xl', '--gap-page',
    '--touch-min', '--touch-stop-width',
    '--rule-baseline', '--rule-hover', '--rule-graduation', '--rule-band-edge', '--rule-tick',
    '--rule-tick-hollow', '--rule-strike', '--rule-width', '--rule-ink-field', '--rule-foot-band',
    '--gap-strike', '--gap-mark-stop', '--gap-uses-chip', '--gap-field-unit', '--gap-defect-col',
    '--gap-select-chevron-room',
    '--focus-outline-width', '--focus-outline-offset',
    '--measure-prose',
  ];
  // Claude's Discretion (CONTEXT.md): both faces are also the App's until
  // App typography is specified, so they stay shared rather than
  // --sheet-face-*. Decision #4: --offset-link-underline has a live App
  // consumer (.home__quiet) as well as a Sheet one — one value app-wide,
  // the shared-size rule from 03.3.1.1.
  const SHARED_TYPE = ['--face-text', '--face-grotesk', '--offset-link-underline'];
  // D-17: the hand's four tokens keep D-17's literal names with no app-
  // prefix — a locked decision outranks the naming pattern in D-03
  // (decision #6).
  const SHARED_HAND = ['--face-hand', '--size-hand', '--leading-hand', '--size-hand-min'];
  const SHARED = [...SHARED_SPACING_AND_RULES, ...SHARED_TYPE, ...SHARED_HAND];

  // D-04: the jar hues and the twelve recipe hues were retired in this
  // phase's last step (plan 05) — nothing is declared under this
  // exception any more, so the prefix-discipline gate below now binds
  // with no exemption left to hide behind.
  const RETIRING = [];

  test('every tokens.css declaration is --sheet-, --app-, an explicit shared size, or a token plan 05 retires', () => {
    const declaredInTokens = readCustomProperties(readFileSync(path.join(STYLES_DIR, 'tokens.css'), 'utf8'));
    const allowed = new Set([...SHARED, ...RETIRING]);
    const violations = Object.keys(declaredInTokens).filter(
      (name) => !name.startsWith('--sheet-') && !name.startsWith('--app-') && !allowed.has(name),
    );
    expect(violations).toEqual([]);
  });
});

describe('one App control radius (sketch 011 decision 38 B, Mark 2026-10-04; quick 261004-ly7)', () => {
  const declaredInTokens = readCustomProperties(readFileSync(path.join(STYLES_DIR, 'tokens.css'), 'utf8'));
  const RETIRED = ['--app-radius-action', '--app-radius-lead', '--app-notebook-field-radius'];

  test('tokens.css declares --app-radius-control at 10px and none of the three tokens it replaces, and nothing reads them', () => {
    expect(declaredInTokens['--app-radius-control']).toBe('10px');
    for (const name of RETIRED) {
      expect(declaredInTokens[name], `${name} is retired`).toBeUndefined();
      expect(allRefs.filter((ref) => ref.name === name), `no read of ${name}`).toEqual([]);
    }
  });

  test('every border-radius in app.css, home.css, notebook.css and shell.css reads the control radius, the row-mark radius, the sprinkle radius, 0 or 50%', () => {
    const allowed = ['var(--app-radius-control)', 'var(--app-radius-rail)', 'var(--app-radius-sprinkle)', '0', '50%'];
    for (const name of ['app.css', 'home.css', 'notebook.css', 'shell.css']) {
      const { src } = cssSourceFiles.find((file) => file.label === name);
      for (const rule of readAllRules(src)) {
        for (const match of rule.declarations.matchAll(/(?:^|[\s;])border-radius\s*:\s*([^;]+);/g)) {
          expect(allowed, `${name}: "${rule.selector}" declares border-radius: ${match[1].trim()}`).toContain(match[1].trim());
        }
      }
    }
  });
});

describe('the text companions clear 4.5:1 on the app background (WCAG 2.2 AA; Mark 2026-10-05, decide-companion-contrast-under-4-5; quick 261005-wgz)', () => {
  const declaredInTokens = readCustomProperties(readFileSync(path.join(STYLES_DIR, 'tokens.css'), 'utf8'));

  // WCAG 2 relative luminance and contrast ratio, computed here so the
  // test is the authority and no ratio is copied from a note: a channel
  // c/255 is linear when c <= 0.03928 (divided by 12.92), otherwise
  // ((c + 0.055) / 1.055) ^ 2.4; L = 0.2126 R + 0.7152 G + 0.0722 B; the
  // ratio is (Lhigh + 0.05) / (Llow + 0.05).
  function channels(hex) {
    const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
    if (!match) throw new Error(`not a six-digit hex: ${hex}`);
    return [match[1], match[2], match[3]].map((pair) => parseInt(pair, 16));
  }
  function luminance(hex) {
    const [r, g, b] = channels(hex).map((value) => {
      const c = value / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function ratio(hexA, hexB) {
    const [high, low] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a);
    return (high + 0.05) / (low + 0.05);
  }

  const background = declaredInTokens['--app-background'];
  const COMPANIONS = [
    '--app-notebook-text',
    '--app-recipe-book-text',
    '--app-idea-log-text',
    '--app-ingredients-text',
    '--app-blue-text',
  ];

  test.each(COMPANIONS)('%s has a contrast ratio of at least 4.5 on --app-background', (name) => {
    const measured = ratio(declaredInTokens[name], background);
    expect(measured >= 4.5, `${name} ${declaredInTokens[name]} measures ${measured.toFixed(3)}:1 on ${background}`).toBe(true);
  });

  test('the white label on the blue fill clears 4.5:1: the filled action fills with --app-blue-text and labels with --app-background', () => {
    const measured = ratio(declaredInTokens['--app-background'], declaredInTokens['--app-blue-text']);
    expect(measured >= 4.5, `label on fill measures ${measured.toFixed(3)}:1`).toBe(true);
    for (const [file, selector] of [['home.css', '.home__action'], ['notebook.css', '.notebook-action']]) {
      const { src } = cssSourceFiles.find((entry) => entry.label === file);
      const rule = readAllRules(src).find((entry) => entry.selector === selector && entry.media === undefined);
      expect(rule, `${file} has a top-level ${selector} rule`).toBeDefined();
      expect(rule.declarations, `${selector} fills with --app-blue-text`).toMatch(/background:\s*var\(--app-blue-text\)/);
      expect(rule.declarations, `${selector} labels with --app-background`).toMatch(/(?:^|[\s;])color:\s*var\(--app-background\)/);
    }
  });

  test('each darkened token is the approved hex less at most one step per channel, never lighter', () => {
    const APPROVED = { '--app-blue-text': '#1576de', '--app-notebook-text': '#ee0803' };
    for (const [name, approved] of Object.entries(APPROVED)) {
      const now = channels(declaredInTokens[name]);
      channels(approved).forEach((was, index) => {
        const step = was - now[index];
        expect(step >= 0 && step <= 1, `${name} channel ${index} moved ${step} from ${approved}`).toBe(true);
      });
    }
  });

  test('the other three companions stay byte-identical', () => {
    expect(declaredInTokens['--app-recipe-book-text']).toBe('#bc5b0d');
    expect(declaredInTokens['--app-idea-log-text']).toBe('#976f01');
    expect(declaredInTokens['--app-ingredients-text']).toBe('#358452');
  });

  test('no stylesheet or ui source carries a literal copy of either companion, approved or darkened', () => {
    const literals = ['#1576de', '#1475dd', '#ee0803', '#ed0702'];
    const files = [
      ...cssSourceFiles.filter((entry) => entry.label !== 'tokens.css'),
      ...jsFiles,
    ];
    const found = [];
    for (const { label, src } of files) {
      for (const literal of literals) {
        if (src.toLowerCase().includes(literal)) found.push(`${label} carries ${literal}`);
      }
    }
    expect(found).toEqual([]);
  });

  describe("the companions on the current place's surface clear 4.5:1 (Mark 2026-10-06, decide-companions-on-subtle-surface; quick 261005-x0j)", () => {
    // Where a place's word is the current place it sits on --app-surface-subtle
    // (shell.css), not on --app-background, and the plain companions read about
    // 4.1:1 there. Each companion therefore has an on-subtle token: the plain
    // companion with every channel scaled by one common factor, the smallest
    // whole percent that clears 4.5:1 on that surface. Scaling, not a uniform
    // hex step per channel: the Notebook red would need twelve steps and its
    // green and blue channels would clamp at zero after two, changing the hue.
    // Kitchen's indigo needs no companion (5.325:1 on subtle already).
    const subtle = declaredInTokens['--app-surface-subtle'];
    const shellSrc = cssSourceFiles.find((entry) => entry.label === 'shell.css').src;
    const shellRules = readAllRules(shellSrc).filter((rule) => rule.media === undefined);

    const PLACES = [
      ['home', '--app-blue-text', '--app-blue-text-on-subtle'],
      ['notebook', '--app-notebook-text', '--app-notebook-text-on-subtle'],
      ['recipe-book', '--app-recipe-book-text', '--app-recipe-book-text-on-subtle'],
      ['idea-log', '--app-idea-log-text', '--app-idea-log-text-on-subtle'],
      ['ingredients', '--app-ingredients-text', '--app-ingredients-text-on-subtle'],
    ];

    function scaled(hex, k) {
      const factor = 1 - k / 100;
      return `#${channels(hex)
        .map((value) => Math.round(value * factor).toString(16).padStart(2, '0'))
        .join('')}`;
    }
    function smallestStep(hex) {
      for (let k = 1; k <= 40; k += 1) {
        if (ratio(scaled(hex, k), subtle) >= 4.5) return k;
      }
      throw new Error(`no whole-percent step up to 40 clears 4.5:1 for ${hex} on ${subtle}`);
    }

    test.each([...PLACES.map(([slug, plain]) => [slug, plain]), ['kitchen', '--app-kitchen']])(
      'the %s word, when current, reads at least 4.5:1 on --app-surface-subtle',
      (slug, plainToken) => {
        const current = shellRules.find((rule) => rule.selector === `.shell__place--${slug}[aria-current='page']`);
        const plain = shellRules.find((rule) => rule.selector === `.shell__place--${slug}`);
        const source = current || plain;
        expect(source, `shell.css has a top-level rule that sets the ${slug} word's colour`).toBeDefined();
        const read = /(?:^|[\s;])color:\s*var\((--[\w-]+)\)/.exec(source.declarations);
        expect(read, `the ${slug} word's rule reads its colour from a token`).not.toBeNull();
        const token = read[1];
        if (!current) expect(token, `${slug} reads its plain token`).toBe(plainToken);
        const measured = ratio(declaredInTokens[token], subtle);
        expect(
          measured >= 4.5,
          `${slug} reads ${token} ${declaredInTokens[token]} on ${subtle}: ${measured.toFixed(3)}:1`,
        ).toBe(true);
      },
    );

    test.each(PLACES)(
      'the %s on-subtle token is its plain companion scaled by the smallest whole percent that clears 4.5:1',
      (slug, plainToken, onSubtleToken) => {
        const expected = scaled(declaredInTokens[plainToken], smallestStep(declaredInTokens[plainToken]));
        expect(
          declaredInTokens[onSubtleToken],
          `${onSubtleToken} is ${declaredInTokens[onSubtleToken] || 'not declared'}, expected ${expected}`,
        ).toBe(expected);
      },
    );

    test('the five plain companions are unchanged, so nothing moves on the app background', () => {
      expect(declaredInTokens['--app-blue-text']).toBe('#1475dd');
      expect(declaredInTokens['--app-notebook-text']).toBe('#ed0702');
      expect(declaredInTokens['--app-recipe-book-text']).toBe('#bc5b0d');
      expect(declaredInTokens['--app-idea-log-text']).toBe('#976f01');
      expect(declaredInTokens['--app-ingredients-text']).toBe('#358452');
    });

    test("each on-subtle token is read once, by its own current-place rule in shell.css, and that rule declares nothing else", () => {
      const problems = [];
      for (const [slug, , onSubtleToken] of PLACES) {
        const reads = allRefs.filter((ref) => ref.name === onSubtleToken);
        if (reads.length !== 1 || reads[0].file !== 'shell.css') {
          problems.push(`${onSubtleToken} is read ${reads.length} time(s): ${reads.map((ref) => ref.file).join(', ') || 'nowhere'}`);
        }
        const rule = shellRules.find((entry) => entry.selector === `.shell__place--${slug}[aria-current='page']`);
        if (!rule) {
          problems.push(`shell.css has no top-level .shell__place--${slug}[aria-current='page'] rule`);
          continue;
        }
        const declarations = rule.declarations.split(';').map((d) => d.trim()).filter(Boolean);
        if (declarations.length !== 1 || declarations[0].replace(/\s+/g, ' ') !== `color: var(${onSubtleToken})`) {
          problems.push(`${slug} rule declares: ${declarations.join('; ')}`);
        }
      }
      expect(problems).toEqual([]);
    });
  });
});
