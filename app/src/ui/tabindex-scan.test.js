// Guards one rule: every link, button, radio and checkbox the app renders is
// an explicit Tab stop, a literal tabIndex={0} on the tag. WebKit without the
// tab-to-highlight preference (every browser on the iPad) Tabs only into text
// entry and into controls that carry an explicit tabindex; Chromium Tabs to
// every native control, so a Chromium run cannot prove the rule. The
// evidence and the exemption are in .planning/notes/2026-10-01-engineering-notes.md.
//
// The per-component tests keep pinning exact tag counts on rendered markup;
// this file pins presence everywhere, by reading every non-test .jsx under
// app/src as text. Known blind spots: an input whose type is computed, the
// select element, and a tag built at runtime, none of which a text scan sees.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// The one exemption. A stale entry fails the real-tree test, so it cannot
// outlive its tag.
const ALLOWLIST = [
  {
    file: 'ui/GraduatedRule.jsx',
    name: 'button',
    contains: 'tabIndex={tabIndex ?? 0}',
    reason:
      'FormulationNote passes -1 while the sheet is recording or developing, keeping the six figure rules off the Tab path there (they stay clickable); the default is 0 in every other state. FormulationNote.test.jsx pins both on rendered markup.',
  },
];

// Blank every comment with spaces, keeping each newline and the string
// length, so a match index maps back to the raw line. One pass, so a comment
// opener inside another comment is not read twice; a line comment must begin
// the line or follow whitespace, so a URL's double slash survives.
function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\/|(^|[ \t])\/\/.*$/gm, (match, lead = '') =>
    lead + match.slice(lead.length).replace(/[^\n]/g, ' '),
  );
}

// The index just past the closing angle bracket of the tag whose name ends at
// `from`. A greater-than sign inside braces (an arrow function) or inside a
// quoted attribute string does not end the tag.
function tagEnd(source, from) {
  let depth = 0;
  for (let i = from; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '{') depth += 1;
    else if (ch === '}') depth -= 1;
    else if (depth === 0 && (ch === '"' || ch === "'")) {
      const close = source.indexOf(ch, i + 1);
      if (close === -1) break;
      i = close;
    } else if (depth === 0 && ch === '>') return i + 1;
  }
  return source.length;
}

// Every in-scope tag: an a, Link, NavLink or button, or an input whose
// literal type is radio or checkbox.
function inScopeTags(file, source) {
  const clean = stripComments(source);
  const tags = [];
  for (const match of clean.matchAll(/<(a|Link|NavLink|button|input)(?=[\s/>])/g)) {
    const text = clean.slice(match.index, tagEnd(clean, match.index + match[0].length));
    const name = match[1];
    if (name === 'input' && !/\btype=(?:"(?:radio|checkbox)"|'(?:radio|checkbox)')/.test(text)) continue;
    const line = clean.slice(0, match.index).split('\n').length;
    tags.push({ file, line, name, text });
  }
  return tags;
}

function scanSource(file, source) {
  return inScopeTags(file, source).filter((tag) => !tag.text.includes('tabIndex={0}'));
}

function applyAllowlist(found, allowlist) {
  const used = new Set();
  const violations = found.filter((tag) => {
    const entry = allowlist.find((e) => e.file === tag.file && e.name === tag.name && tag.text.includes(e.contains));
    if (entry) used.add(entry);
    return !entry;
  });
  return { violations, stale: allowlist.filter((e) => !used.has(e)) };
}

describe('the scan can fail: in-memory fixtures, no component read', () => {
  const kinds = [
    ['anchor', 'a', '<a href="/x">go</a>', '<a href="/x" tabIndex={0}>go</a>'],
    ['Link', 'Link', '<Link to="/x">go</Link>', '<Link to="/x" tabIndex={0}>go</Link>'],
    ['NavLink', 'NavLink', '<NavLink to="/x">go</NavLink>', '<NavLink to="/x" tabIndex={0}>go</NavLink>'],
    ['button', 'button', '<button type="button">go</button>', '<button type="button" tabIndex={0}>go</button>'],
    ['radio input', 'input', '<input type="radio" name="g" />', '<input type="radio" name="g" tabIndex={0} />'],
    ['checkbox input', 'input', '<input type="checkbox" />', '<input type="checkbox" tabIndex={0} />'],
  ];

  it.each(kinds)('a %s without tabIndex is reported with file, line and tag name', (_kind, name, untagged) => {
    const found = scanSource('ui/Fixture.jsx', `const a = 1;\nconst b = (\n  ${untagged}\n);\n`);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ file: 'ui/Fixture.jsx', line: 3, name });
  });

  it.each(kinds)('a %s carrying tabIndex={0} is not reported', (_kind, _name, _untagged, tagged) => {
    expect(scanSource('ui/Fixture.jsx', `const x = (\n  ${tagged}\n);\n`)).toEqual([]);
  });

  it('a literal tabIndex={-1} on an in-scope tag is reported, since the rule is a literal zero', () => {
    const found = scanSource('ui/Fixture.jsx', '<button type="button" tabIndex={-1}>go</button>');
    expect(found).toHaveLength(1);
  });

  it('an arrow-function handler does not cut the tag short: tabIndex after it passes, absence is reported', () => {
    const tagged = '<button type="button" onClick={() => go(1)} tabIndex={0}>go</button>';
    const untagged = '<button type="button" onClick={() => go(1)}>go</button>';
    expect(scanSource('ui/Fixture.jsx', tagged)).toEqual([]);
    expect(scanSource('ui/Fixture.jsx', untagged)).toHaveLength(1);
  });

  it('a greater-than sign in an attribute string does not cut the tag short', () => {
    const tagged = '<Link to="/x" title="a > b" tabIndex={0}>go</Link>';
    const untagged = '<Link to="/x" title="a > b">go</Link>';
    expect(scanSource('ui/Fixture.jsx', tagged)).toEqual([]);
    expect(scanSource('ui/Fixture.jsx', untagged)).toHaveLength(1);
  });

  it('text, number, date and file inputs, select, textarea and look-alike names are never reported', () => {
    const source = [
      '<input type="text" />',
      '<input type="number" />',
      '<input type="date" />',
      '<input type="file" tabIndex={-1} />',
      '<input type={kind} />',
      '<select><option>a</option></select>',
      '<textarea />',
      '<abbr>x</abbr>',
      '<article>x</article>',
      '<LinkButton>x</LinkButton>',
      '<NavLinkGroup>x</NavLinkGroup>',
    ].join('\n');
    expect(scanSource('ui/Fixture.jsx', source)).toEqual([]);
  });

  it('tags inside block, line and JSX comments are ignored', () => {
    const source = [
      '/* <button>old</button> */',
      '// <Link to="/x">old</Link>',
      '{/* <a href="/x">old</a> */}',
      'const x = 1; // <button>trailing</button>',
    ].join('\n');
    expect(scanSource('ui/Fixture.jsx', source)).toEqual([]);
  });

  it('a double slash inside a URL string does not hide the tag, and the line stays right', () => {
    const found = scanSource('ui/Fixture.jsx', 'x;\n<a href="http://x.test">go</a>\n');
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ line: 2, name: 'a' });
  });

  it('comment stripping keeps the length and every newline', () => {
    const source = 'a /* one\ntwo */ b\n// three\nc';
    const stripped = stripComments(source);
    expect(stripped).toHaveLength(source.length);
    expect(stripped.split('\n')).toHaveLength(source.split('\n').length);
  });

  describe('allowlist', () => {
    const entry = { file: 'ui/A.jsx', name: 'button', contains: 'tabIndex={tabIndex ?? 0}', reason: 'r' };
    const tag = (file, extra) => ({ file, line: 1, name: 'button', text: `<button ${extra}>` });

    it('exempts a tag matching file, name and string', () => {
      const out = applyAllowlist([tag('ui/A.jsx', 'tabIndex={tabIndex ?? 0}')], [entry]);
      expect(out).toEqual({ violations: [], stale: [] });
    });

    it('does not exempt the same tag in another file', () => {
      const found = [tag('ui/B.jsx', 'tabIndex={tabIndex ?? 0}')];
      expect(applyAllowlist(found, [entry]).violations).toEqual(found);
    });

    it('does not exempt a tag of that name lacking the string', () => {
      const found = [tag('ui/A.jsx', 'tabIndex={-1}')];
      expect(applyAllowlist(found, [entry]).violations).toEqual(found);
    });

    it('returns an entry that exempts nothing as stale', () => {
      expect(applyAllowlist([], [entry])).toEqual({ violations: [], stale: [entry] });
    });
  });
});

describe('the real tree: every link, button, radio and checkbox under app/src is an explicit Tab stop', () => {
  const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const labels = readdirSync(srcDir, { recursive: true })
    .map((p) => p.split(path.sep).join('/'))
    .filter((p) => p.endsWith('.jsx') && !p.includes('.test.'))
    .sort();
  const read = (label) => readFileSync(path.join(srcDir, label), 'utf8');

  it('reads router.jsx, ui/RecipePage.jsx and ui/Method.jsx, and sees in-scope tags', () => {
    expect(labels).toEqual(expect.arrayContaining(['router.jsx', 'ui/RecipePage.jsx', 'ui/Method.jsx']));
    const seen = labels.flatMap((label) => inScopeTags(label, read(label)));
    expect(seen.length).toBeGreaterThan(0);
  });

  const outcome = () =>
    applyAllowlist(
      labels.flatMap((label) => scanSource(label, read(label))),
      ALLOWLIST,
    );

  it('leaves no violation after the allowlist', () => {
    const lines = outcome().violations.map((v) => `${v.file}:${v.line} <${v.name}> lacks tabIndex={0}`);
    expect(lines).toEqual([]);
  });

  it('leaves no stale allowlist entry', () => {
    const lines = outcome().stale.map((e) => `${e.file} <${e.name}> ${e.contains}`);
    expect(lines).toEqual([]);
  });
});
