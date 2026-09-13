// The stylesheet reader the style-contract suites (columns.test.js,
// binder.test.js, cross-cutting.test.js) read through — lifted out of
// columns.test.js so a rule can never be satisfied by prose about it in
// one suite while the other reads something different. Read by test
// suites only; never imported by app code (there is no build-time reason
// to parse the app's own CSS as text at runtime).
//
// None of the suites has a layout engine — they run under Vitest's default
// `node` environment, and `renderToStaticMarkup` in a node process
// computes no boxes. Every helper below reads the two stylesheets AS TEXT
// and checks the contract they state, and the arithmetic that contract
// implies. It cannot assert a rendered pixel; that stays a real-browser
// human check.
//
// At-rule contract (WR-02, addressed 260912-ti1): the parser handles
// exactly one level of nesting — a top-level @media block. readAllRules
// captures the block's condition, parses its inner rules with the same
// flat matcher, and tags each returned rule with a `media` field carrying
// the condition string; top-level rules carry media: undefined. Any other
// at-rule keyword, or an at-rule nested inside the media block, throws
// (assertNoAtRules), so adding one is forced to address this parser
// instead of silently trusting stale results.

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

// The matcher below parses ONE level of nesting (a top-level @media block
// — 260912-ti1); nothing deeper and no other at-rule. Rather than write a
// general nesting-aware parser no suite otherwise needs, fail loudly on
// anything beyond that contract: any at-rule keyword other than a
// top-level @media, including one nested inside the media block, where
// the flat matcher would silently misattribute every inner rule.
export function assertNoAtRules(css) {
  const atRule =
    /@(media|supports|keyframes|font-face|import|charset|page|document|layer|container|property|scope|starting-style|namespace|counter-style|font-feature-values)\b/gi;
  let match;
  while ((match = atRule.exec(css))) {
    const before = css.slice(0, match.index);
    const depth =
      (before.match(/\{/g) || []).length - (before.match(/\}/g) || []).length;
    if (depth === 0 && match[1].toLowerCase() === 'media') continue;
    throw new Error(
      "css-source.js's readAllRules parses exactly one level of nesting — a top-level @media block — and nothing else. " +
        'Any other at-rule keyword, or an at-rule nested inside that media block, still cannot be parsed; ' +
        'update readAllRules again before adding one to app.css (see WR-02, 03-REVIEW.md).',
    );
  }
}

// Returns [{ selector, declarations, media }] for every rule in the
// comment-stripped source: top-level rules carry media: undefined; rules
// inside a top-level @media block carry the block's condition string
// (e.g. '(max-width: 759.98px)'). One level of nesting only — see
// assertNoAtRules above.
export function readAllRules(css) {
  const stripped = stripCssComments(css);
  assertNoAtRules(stripped);
  const rules = [];
  const pushRules = (chunk, media) => {
    const re = /([^{}]+)\{([^{}]*)\}/g;
    let match;
    while ((match = re.exec(chunk))) {
      rules.push({ selector: match[1].trim().replace(/\s+/g, ' '), declarations: match[2], media });
    }
  };
  let i = 0;
  while (i < stripped.length) {
    const rest = stripped.slice(i);
    const at = rest.search(/@media\b/);
    if (at === -1) {
      pushRules(rest, undefined);
      break;
    }
    pushRules(rest.slice(0, at), undefined);
    const open = stripped.indexOf('{', i + at);
    if (open === -1) break; // truncated prelude; nothing inside to parse
    const condition = stripped
      .slice(i + at + '@media'.length, open)
      .trim()
      .replace(/\s+/g, ' ');
    let depth = 1;
    let j = open + 1;
    while (j < stripped.length && depth > 0) {
      if (stripped[j] === '{') depth++;
      else if (stripped[j] === '}') depth--;
      j++;
    }
    pushRules(stripped.slice(open + 1, depth === 0 ? j - 1 : j), condition);
    i = j;
  }
  return rules;
}
