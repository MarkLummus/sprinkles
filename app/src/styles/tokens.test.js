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

const CSS_FILE_NAMES = ['tokens.css', 'app.css', 'history.css', 'home.css', 'shell.css'];

// No custom property is set inline via React's style prop any more — D-04
// (plan 05) retired --c, RecipeList.jsx's old per-row dealt-hue property,
// along with the rest of the Sprinkles Jar. Kept as an empty set (rather
// than removed outright) so a future inline custom property has a named
// place to be excepted, documented, rather than silently widening the
// unresolved-token gate.
const LOCALLY_SET_CUSTOM_PROPERTIES = new Set();

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
