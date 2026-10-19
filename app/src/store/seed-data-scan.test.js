// An architectural guard over static imports (LIB-09, criterion 6, D-01): no
// module outside a short, explicit list imports a seed dataset from app/src/data.
// The seed datasets (the core scales, the core problems, the machines, the
// styles, the library) are rows in store tables the app reads at boot; only
// the seeding itself and the test fixtures may import the code that holds them.
//
// What this proves and what it cannot see. It reads every non-test .js, .jsx
// and .mjs file under app/src as text, resolves each relative import
// specifier it finds against that file's directory, and fails, naming the
// importing file and the resolved target, when the target lies inside
// app/src/data. It cannot see a dynamic import(), a value threaded in from
// somewhere else, or a copy of the words typed into another module by hand
// (the second case below looks for the one copy that is easy to make: an array
// literal of all four core problem words or all six scale names). That the app
// reads no seed dataset from code at run time is shown by the behaviour tests:
// boot reads the tables (plan 09-11) and the battery reads the catalog (plans
// 09-12 to 09-14).
//
// Both cases read each file through stripComments first, so a comment or doc
// block that names an import or a word never trips them. The second case looks
// only inside bracketed array literals of the stripped text (a `[` ... `]` span
// whose quoted string elements include all four problem words or all six scale
// names), never at prose.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { CORE_PROBLEM_ROWS } from '../data/core-problems.js';
import { CORE_SCALE_ROWS } from '../data/core-scales.js';

const SRC = fileURLToPath(new URL('..', import.meta.url));
const DATA = path.join(SRC, 'data');

// The files outside app/src/data that may import from it, each by exact path
// relative to app/src: the seeding itself and two test-only fixtures. Every
// file inside app/src/data is allowed too (data modules import data modules).
// app/src/store/catalog.js is deliberately not on this list: it reads the
// tables through the repository, and must never join it.
const ALLOWED_OUTSIDE_DATA = ['store/seed.js', 'ui/catalog.fixtures.jsx', 'store/storeFile.fixtures.js'];

const SOURCE_FILE = /\.(js|jsx|mjs)$/;
const TEST_FILE = /\.test\.(js|jsx|mjs)$/;

// A string is matched before a comment, so a // or /* inside one stays code
// (RecipePage.shell.test.js uses the same pattern).
const STRING_OR_COMMENT = /('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\[\s\S]|[^`\\])*`)|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;

function stripComments(source) {
  return source.replace(STRING_OR_COMMENT, (_match, literal) => literal ?? '');
}

function walk(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full));
    else if (SOURCE_FILE.test(entry.name)) found.push(full);
  }
  return found;
}

// { 'ui/Foo.jsx': text } for every non-test source file under app/src.
function readSources() {
  const sources = {};
  for (const file of walk(SRC)) {
    if (TEST_FILE.test(file)) continue;
    sources[path.relative(SRC, file).split(path.sep).join('/')] = readFileSync(file, 'utf8');
  }
  return sources;
}

function specifiersOf(stripped) {
  const found = [];
  for (const match of stripped.matchAll(/\bfrom\s+(?:'([^']+)'|"([^"]+)")/g)) found.push(match[1] ?? match[2]);
  for (const match of stripped.matchAll(/\bimport\s+(?:'([^']+)'|"([^"]+)")/g)) found.push(match[1] ?? match[2]);
  return found;
}

function isInsideData(absolute) {
  return absolute === DATA || absolute.startsWith(DATA + path.sep);
}

// The relative specifiers of `relPath`'s text that resolve into app/src/data.
function dataImportsOf(relPath, text) {
  const dir = path.dirname(path.join(SRC, relPath));
  return specifiersOf(stripComments(text))
    .filter((specifier) => specifier.startsWith('.'))
    .map((specifier) => path.resolve(dir, specifier))
    .filter(isInsideData);
}

function importViolations(sources) {
  const violations = [];
  for (const [relPath, text] of Object.entries(sources)) {
    if (isInsideData(path.join(SRC, relPath)) || ALLOWED_OUTSIDE_DATA.includes(relPath)) continue;
    for (const target of dataImportsOf(relPath, text)) {
      violations.push(`${relPath} imports ${path.relative(SRC, target)} (inside app/src/data)`);
    }
  }
  return violations;
}

// The quoted string elements of every bracketed span in the comment-stripped
// text that has no bracket inside it.
function arrayLiteralStrings(stripped) {
  return [...stripped.matchAll(/\[[^[\]]*\]/g)].map((span) =>
    [...span[0].matchAll(/'((?:\\.|[^'\\\n])*)'|"((?:\\.|[^"\\\n])*)"/g)].map((match) => match[1] ?? match[2]),
  );
}

const PROBLEM_WORDS = CORE_PROBLEM_ROWS.map((row) => row.name);
const SCALE_NAMES = CORE_SCALE_ROWS.map((row) => row.name);

function copiedListViolations(sources) {
  const violations = [];
  for (const [relPath, text] of Object.entries(sources)) {
    if (isInsideData(path.join(SRC, relPath))) continue;
    for (const strings of arrayLiteralStrings(stripComments(text))) {
      if (PROBLEM_WORDS.every((word) => strings.includes(word))) violations.push(`${relPath} holds an array of the four core problem words`);
      if (SCALE_NAMES.every((name) => strings.includes(name))) violations.push(`${relPath} holds an array of the six scale names`);
    }
  }
  return violations;
}

const real = readSources();

describe('no seed dataset is imported from app/src/data outside the allow-list (criterion 6, LIB-09)', () => {
  it('reads the real tree, so a pass is not an empty walk', () => {
    expect(Object.keys(real).length).toBeGreaterThan(50);
    expect(Object.keys(real)).toContain('store/seed.js');
    expect(Object.keys(real).some((relPath) => relPath.startsWith('data/'))).toBe(true);
  });

  it('every module under app/src outside the allow-list leaves app/src/data alone', () => {
    expect(importViolations(real)).toEqual([]);
  });

  it('every allow-list entry exists and still imports from app/src/data, so a stale entry cannot outlive its import', () => {
    for (const relPath of ALLOWED_OUTSIDE_DATA) {
      expect(Object.keys(real), relPath).toContain(relPath);
      expect(dataImportsOf(relPath, real[relPath]).length, relPath).toBeGreaterThan(0);
    }
  });

  it('is exact-path: a module with "data" in its path is not exempt, and store/catalog.js is not on the list', () => {
    expect(ALLOWED_OUTSIDE_DATA).not.toContain('store/catalog.js');
    const sneaky = { 'ui/data/Helper.js': "import { SEED_CATALOG } from '../../data/seed-catalog.js';" };
    expect(importViolations(sneaky)).toHaveLength(1);
  });

  it('fires on a ui module that imports a data module, by a named or a side-effect import, and not on a comment', () => {
    const named = { 'ui/Foo.jsx': "import { SEED_CATALOG } from '../data/seed-catalog.js';" };
    const sideEffect = { 'ui/Foo.jsx': "import '../data/library.js';" };
    const commented = { 'ui/Foo.jsx': "// import { SEED_CATALOG } from '../data/seed-catalog.js';\n/* from '../data/library.js' */" };
    expect(importViolations(named)).toEqual(['ui/Foo.jsx imports data/seed-catalog.js (inside app/src/data)']);
    expect(importViolations(sideEffect)).toHaveLength(1);
    expect(importViolations(commented)).toEqual([]);
  });

  it('lets the allow-listed files and the data modules themselves import from app/src/data', () => {
    const allowed = Object.fromEntries(ALLOWED_OUTSIDE_DATA.map((relPath) => [relPath, "import { library } from '../data/library.js';"]));
    allowed['data/mocha.js'] = "import { SEED_CATALOG } from './seed-catalog.js';";
    expect(importViolations(allowed)).toEqual([]);
  });
});

describe('no module outside app/src/data keeps its own copy of the core problem words or scale names', () => {
  it('holds no array literal of all four problem words or all six scale names', () => {
    expect(copiedListViolations(real)).toEqual([]);
  });

  it('fires on an array literal, and stays green for a comment, a doc block, prose or a partial list', () => {
    const literal = { 'ui/Foo.jsx': `const chips = ['Coarse, icy', "Sandy, gritty", 'Gummy, elastic', 'Greasy film'];` };
    const names = { 'ui/Foo.jsx': "const all = ['Hardness', 'Scoopability', 'Smoothness', 'Sweetness', 'Body', 'Oil'];" };
    const comment = {
      'ui/Foo.jsx': "// ['Coarse, icy', 'Sandy, gritty', 'Gummy, elastic', 'Greasy film']\n/** Coarse, icy; Sandy, gritty; Gummy, elastic; Greasy film */",
    };
    const prose = { 'ui/Foo.jsx': "const sentence = 'Coarse, icy and Sandy, gritty and Gummy, elastic and Greasy film';" };
    const partial = { 'ui/Foo.jsx': "const some = ['Coarse, icy', 'Sandy, gritty'];" };
    expect(copiedListViolations(literal)).toHaveLength(1);
    expect(copiedListViolations(names)).toHaveLength(1);
    expect(copiedListViolations(comment)).toEqual([]);
    expect(copiedListViolations(prose)).toEqual([]);
    expect(copiedListViolations(partial)).toEqual([]);
  });

  it('leaves the data modules alone, which hold the rows', () => {
    const rows = { 'data/core-problems.js': `export const WORDS = ['Coarse, icy', 'Sandy, gritty', 'Gummy, elastic', 'Greasy film'];` };
    expect(copiedListViolations(rows)).toEqual([]);
  });
});
