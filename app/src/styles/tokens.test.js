// The permanent net under a token rename (03.4-01). Reads tokens.css,
// app.css, history.css and home.css AS TEXT — the same convention
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
import { readCustomProperties, stripCssComments } from './css-source.js';

const STYLES_DIR = path.dirname(fileURLToPath(import.meta.url));
const UI_DIR = path.join(STYLES_DIR, '..', 'ui');
const DOMAIN_DIR = path.join(STYLES_DIR, '..', 'domain');

const CSS_FILE_NAMES = ['tokens.css', 'app.css', 'history.css', 'home.css'];

// Set per-element via React's style prop (RecipeList.jsx's `.home__row`,
// `style={{ '--c': ... }}`), never declared in a stylesheet — home.css
// reads it as the row's own dealt hue. Not a token this gate can resolve
// against a declaration; RecipeList.jsx/home.css are Jar-world files this
// phase does not rename (RESEARCH.md Pitfall 4), and D-04 (plan 05)
// removes --c outright once the App marks grammar replaces it.
const LOCALLY_SET_CUSTOM_PROPERTIES = new Set(['--c']);

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
// 600px block counts too, since readCustomProperties is a flat regex with
// no notion of media-block scope.
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
    // lengths); --jar-violet, the sixth sketched jar hue kept but not yet
    // painted anywhere; the twelve --recipe-hue-* tokens, which
    // recipe-colour.js builds as a name string at runtime
    // (`--recipe-hue-${hueNumber}`) rather than a literal var() read this
    // static scan can see; and thirteen App destination/neutral colours
    // this plan declares from DESIGN.md but does not yet wire into
    // home.css (plans 03/04 apply the App marks grammar). The hand's four
    // tokens (D-17) are no longer in this list — plan 02's .app-hand rule
    // in app.css is their first consumer; Home's lead-block Next-time
    // text (D-18) is their second, in a later plan.
    const expectedUnread = [
      '--rule-band-edge',
      '--rule-tick',
      '--sheet-hatch-pitch',
      '--sheet-hatch-stroke',
      '--gap-mark-stop',
      '--rule-tick-hollow',
      '--jar-violet',
      '--recipe-hue-01',
      '--recipe-hue-02',
      '--recipe-hue-03',
      '--recipe-hue-04',
      '--recipe-hue-05',
      '--recipe-hue-06',
      '--recipe-hue-07',
      '--recipe-hue-08',
      '--recipe-hue-09',
      '--recipe-hue-10',
      '--recipe-hue-11',
      '--recipe-hue-12',
      '--app-notebook',
      '--app-notebook-text',
      '--app-recipe-book',
      '--app-recipe-book-text',
      '--app-idea-log',
      '--app-idea-log-text',
      '--app-pantry',
      '--app-ingredients',
      '--app-ingredients-text',
      '--app-kitchen',
      '--app-blue',
      '--app-blue-text',
      '--app-surface-subtle',
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

  // D-04: the jar hues and the twelve recipe hues are removed by plan 05,
  // this phase's last step, once every other consumer no longer reads
  // them — nothing else belongs in this array.
  const RETIRING = [
    '--jar-pink', '--jar-gold', '--jar-teal', '--jar-green', '--jar-orange', '--jar-violet',
    '--recipe-hue-01', '--recipe-hue-02', '--recipe-hue-03', '--recipe-hue-04', '--recipe-hue-05',
    '--recipe-hue-06', '--recipe-hue-07', '--recipe-hue-08', '--recipe-hue-09', '--recipe-hue-10',
    '--recipe-hue-11', '--recipe-hue-12',
  ];

  test('every tokens.css declaration is --sheet-, --app-, an explicit shared size, or a token plan 05 retires', () => {
    const declaredInTokens = readCustomProperties(readFileSync(path.join(STYLES_DIR, 'tokens.css'), 'utf8'));
    const allowed = new Set([...SHARED, ...RETIRING]);
    const violations = Object.keys(declaredInTokens).filter(
      (name) => !name.startsWith('--sheet-') && !name.startsWith('--app-') && !allowed.has(name),
    );
    expect(violations).toEqual([]);
  });
});
