// The stylesheet reader both style-contract suites (columns.test.js,
// binder.test.js) read through — lifted out of columns.test.js so a rule
// can never be satisfied by prose about it in one suite while the other
// reads something different. Read by test suites only; never imported by
// app code (there is no build-time reason to parse the app's own CSS as
// text at runtime).
//
// Neither suite has a layout engine — they run under Vitest's default
// `node` environment, and `renderToStaticMarkup` in a node process
// computes no boxes. Every helper below reads the two stylesheets AS TEXT
// and checks the contract they state, and the arithmetic that contract
// implies. It cannot assert a rendered pixel; that stays a real-browser
// human check.

export function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

export function readCustomProperties(css) {
  const stripped = stripCssComments(css);
  const props = {};
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = re.exec(stripped))) {
    props[match[1]] = match[2].trim();
  }
  return props;
}

export function parsePxLiteral(value) {
  const match = value.match(/^(-?\d+(?:\.\d+)?)px$/);
  return match ? Number(match[1]) : undefined;
}

// Resolves a custom property's value to a px number, following at most
// one level of var(--other) indirection — enough for every token either
// suite reads, since none of them chains a var of a var.
export function resolveTokenPx(props, name) {
  const raw = props[name];
  if (raw == null) return undefined;
  const varMatch = raw.match(/^var\((--[\w-]+)\)$/);
  if (varMatch) {
    return parsePxLiteral(props[varMatch[1]]);
  }
  return parsePxLiteral(raw);
}

// The flat, non-nesting brace matcher below cannot parse an @-rule
// (WR-02): it would treat the at-rule's own opening brace as a selector
// and everything up to the first *inner* rule's closing brace as its
// "declarations," silently misattributing every rule inside and after
// the block to the wrong selector. Rather than write a nesting-aware
// parser neither suite otherwise needs, fail loudly the moment an
// at-rule appears, so adding one is forced to address this parser
// instead of silently trusting stale results.
export function assertNoAtRules(css) {
  const atRule =
    /@(media|supports|keyframes|font-face|import|charset|page|document|layer|container|property|scope|starting-style|namespace|counter-style|font-feature-values)\b/i;
  if (atRule.test(css)) {
    throw new Error(
      "css-source.js's readAllRules is a flat, non-nesting brace matcher and cannot parse an @-rule. " +
        'Update readAllRules to handle nested at-rules before adding one to app.css (see WR-02, 03-REVIEW.md).',
    );
  }
}

// Returns [{ selector, declarations }] for every top-level rule in the
// comment-stripped source.
export function readAllRules(css) {
  const stripped = stripCssComments(css);
  assertNoAtRules(stripped);
  const rules = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let match;
  while ((match = re.exec(stripped))) {
    rules.push({ selector: match[1].trim().replace(/\s+/g, ' '), declarations: match[2] });
  }
  return rules;
}
