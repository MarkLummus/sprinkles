// Phase 8 test audit (ROADMAP criterion 4, review 08-05 MEDIUM): proves that no
// existing test was removed or weakened between the phase's base commit and the
// working tree, beyond the read-target edits and the shell-test rewrite the
// plans enumerate.
//
//   node .planning/phases/08-split-the-recipe-page-along-its-jobs/08-test-audit.mjs <base sha>
//
// It compares the base commit with the working tree, so an uncommitted edit is
// caught too. Prints one `AUDIT FAIL` line per failure and exits 1; otherwise
// the last line is `AUDIT OK`.
//
// Plan 08-06 (gap closure, WR-01 and WR-02) adds cases to RecipeSheet.test.jsx,
// so check (E) lets that one file gain lines after the commit that created it,
// and never lose one.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

// true when `git diff --quiet` exits 0 (no change)
function gitQuietSame(args) {
  try {
    execFileSync('git', ['diff', '--quiet', ...args], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const failures = [];
const fail = (message) => {
  failures.push(message);
  console.log('AUDIT FAIL ' + message);
};

const root = git(['rev-parse', '--show-toplevel']).trim();
process.chdir(root);

// (0) the base commit resolves
let base;
try {
  base = git(['rev-parse', '--verify', (process.argv[2] ?? '') + '^{commit}']).trim();
} catch {
  console.log('AUDIT FAIL no base commit');
  process.exit(1);
}

const PAGE_TEST = 'app/src/ui/RecipePage.test.jsx';
const SHELL_TEST = 'app/src/ui/RecipePage.shell.test.js';

const countExpects = (text) => text.split('expect(').length - 1;
const baseText = (file) => git(['show', base + ':' + file]);

// The changed content lines of a -U0 diff of one file, and each hunk's new-side start.
function parseDiff(file, from = base) {
  const diff = git(['diff', '-U0', from, '--', file]);
  const changed = [];
  const hunks = [];
  let inHunk = false;
  for (const line of diff.split('\n')) {
    const header = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
    if (header) {
      inHunk = true;
      hunks.push({ start: Number(header[1]), lines: [] });
      continue;
    }
    if (!inHunk) continue;
    if (line.startsWith('-') || line.startsWith('+')) {
      changed.push(line);
      hunks[hunks.length - 1].lines.push(line);
    }
  }
  return { changed, hunks };
}

// (A) presence, (B) untouched
const baseTests = git(['ls-tree', '-r', '--name-only', base, '--', 'app/src'])
  .split('\n')
  .filter((name) => name && path.basename(name).includes('.test.'));
for (const file of baseTests) {
  if (!existsSync(file)) fail('missing ' + file);
}
for (const file of baseTests) {
  if (file === PAGE_TEST || file === SHELL_TEST || !existsSync(file)) continue;
  if (!gitQuietSame([base, '--', file])) fail('changed ' + file);
}

// (C) RecipePage.test.jsx changes only D-11 read targets
const pageNow = readFileSync(PAGE_TEST, 'utf8');
const pageBase = baseText(PAGE_TEST);
if (countExpects(pageBase) !== countExpects(pageNow)) {
  fail('RecipePage.test.jsx expect( count ' + countExpects(pageBase) + ' at the base, ' + countExpects(pageNow) + ' now');
}
const READ_TARGET = ['readFileSync(', 'new URL(', 'fileURLToPath(', '.join('];
const BANNED = /expect\(|\bdescribe\(|\bit\(|\.replace\(|\.to(Be|Equal|Match|Contain|Have)/;
const pageDiff = parseDiff(PAGE_TEST);
for (const line of pageDiff.changed) {
  if (!READ_TARGET.some((needle) => line.includes(needle))) fail('RecipePage.test.jsx changed line is not a read target: ' + line.trim());
  if (BANNED.test(line)) fail('RecipePage.test.jsx changed line holds an assertion or structure: ' + line.trim());
}
const D11_DESCRIBES = [
  'refusal and failure route through announce, never onPageStatus',
  'the running head is gone; PageStatus anchors outside the keyed page',
  'the steps region is named Instructions',
  'the empty Instructions section is left out',
  'the Ingredients heading carries Show changes below 724 through the one handler',
  ...(existsSync('app/src/ui/useBatchRecording.js') ? ['record act is wired to the log'] : []),
];
const pageLines = pageNow.split('\n');
const repoints = new Map();
for (const hunk of pageDiff.hunks) {
  let at = Math.min(hunk.start, pageLines.length) - 1;
  while (at >= 0 && !pageLines[at].startsWith('describe(')) at -= 1;
  const opening = at >= 0 ? pageLines[at] : '(no describe above)';
  if (at < 0 || !D11_DESCRIBES.some((title) => opening.includes(title))) {
    fail('RecipePage.test.jsx hunk at line ' + hunk.start + ' is outside the enumerated D-11 describes: ' + opening.trim());
  }
  if (!repoints.has(opening)) repoints.set(opening, []);
  repoints.get(opening).push(...hunk.lines);
}
console.log('RecipePage.test.jsx D-11 re-points');
for (const [opening, lines] of repoints) {
  console.log('  ' + opening.trim());
  for (const line of lines) console.log('    ' + line.trim());
}

// (D) RecipePage.shell.test.js, rewritten by design and reviewed separately
const shellNow = readFileSync(SHELL_TEST, 'utf8');
const shellBase = baseText(SHELL_TEST);
const BASE_TITLES = [
  'RecipePage.jsx holds no draft setter (D-12)',
  'stripComments keeps what a string holds (WR-02)',
  'the two hooks sit in the shell above the early returns',
  'each reset is written in one place',
  'the domain modules stay pure (D-01)',
  'the hooks stop at the draft (D-07)',
  'RecipePage.jsx is the route shell',
  'notes and prose render as text, never as markup',
  'has none of the five setters D-12 names',
  'has none of the seven other setters the hooks own',
  'the pattern is anchored: it matches the hook-owned calls and not the page-owned ones',
  'a setter after a comment marker inside a string is still caught: %s',
  'a reset or markup after a URL string is still seen',
  'real comments are still stripped, a quote inside one included',
  'finds the first early return',
  '%s is called exactly once, before the early returns',
  'usePenDraft.js resets the blocked save once',
  'useRecordDraft.js resets the churn-date block once',
  '%s imports only sibling domain modules',
  '%s carries no jsdom docblock on its first line',
  '%s imports only react and the domain',
  'declares no module-level function beyond joinNames, PageLoadFailed, RecipeNotFound and RecipePage',
  'exports only RecipeNotFound and RecipePage as functions',
  'still loads its records through the repository seam',
  'imports nothing it does not use',
  '%s has no dangerouslySetInnerHTML',
];
const RENAMES = [
  ['still loads its records through the repository seam', 'still writes through the repository seam'],
  [
    'declares no module-level function beyond joinNames, PageLoadFailed, RecipeNotFound and RecipePage',
    'declares no module-level function beyond PageLoadFailed, RecipeNotFound and RecipePage',
  ],
  ['the two hooks sit in the shell above the early returns', 'the draft hooks sit above the early returns'],
];
const quoted = (title) => "'" + title + "'";
for (const title of BASE_TITLES) {
  if (!shellBase.includes(quoted(title))) fail('base title list stale: ' + title);
}
const renamedOld = new Set(RENAMES.map(([oldTitle]) => oldTitle));
for (const title of BASE_TITLES) {
  if (renamedOld.has(title)) continue;
  if (!shellNow.includes(quoted(title))) fail('shell test lost base title: ' + title);
}
for (const [oldTitle, newTitle] of RENAMES) {
  if (shellNow.includes(quoted(oldTitle))) fail('shell test still holds the old title: ' + oldTitle);
  if (!shellNow.includes(quoted(newTitle))) fail('shell test lacks the renamed title: ' + newTitle);
}
for (const title of [
  'RecipePage.jsx is cut along its jobs (EDIT-05, EDIT-06)',
  'each job check can fail: %s',
  'every job EDIT-05 names has a module of its own (completeness)',
  'usePenDraft() is called once, inside useVersionPen.js, and the shell calls useVersionPen once above the early returns',
]) {
  if (!shellNow.includes(quoted(title))) fail('shell test lacks the added title: ' + title);
}
const shellDiff = parseDiff(SHELL_TEST);
const ALLOWED_REMOVED_EXPECT = "expect([...moduleFunctions].sort()).toEqual(['PageLoadFailed', 'RecipeNotFound', 'RecipePage', 'joinNames']);";
const removed = shellDiff.changed.filter((line) => line.startsWith('-')).map((line) => line.slice(1));
for (const line of removed) {
  if (line.includes('expect(') && line.trim() !== ALLOWED_REMOVED_EXPECT) fail('shell expect removed: ' + line.trim());
}
if (!(countExpects(shellNow) > countExpects(shellBase))) {
  fail('shell test expect( count did not grow: ' + countExpects(shellBase) + ' at the base, ' + countExpects(shellNow) + ' now');
}
console.log('Shell test review');
for (const [oldTitle, newTitle] of RENAMES) console.log('  renamed: ' + oldTitle + '  ->  ' + newTitle);
for (const line of removed) console.log('  removed: ' + line.trim());

// (E) tests the phase added stay as committed
// 08-03 Task 2 created RecipeSheet.test.jsx, and 08-06 adds to it.
const ADDITIONS_ONLY = { 'app/src/ui/RecipeSheet.test.jsx': 'b2264ca1878bab2ff6fba59fb1d9406e7f9d5164' };
const additionLines = new Map();
for (const file of [
  'app/src/ui/RecipePage.shellEffects.test.jsx',
  'app/src/ui/RecipePage.strictMode.test.jsx',
  'app/src/ui/sheetView.test.js',
  'app/src/ui/RecipeSheet.test.jsx',
  'app/src/ui/useKeptDraft.test.jsx',
]) {
  if (!existsSync(file)) {
    fail('phase test missing ' + file);
    continue;
  }
  if (ADDITIONS_ONLY[file]) {
    const from = ADDITIONS_ONLY[file];
    const { changed } = parseDiff(file, from);
    for (const line of changed) {
      if (line.startsWith('-')) fail('phase test ' + file + ' lost a line since ' + from.slice(0, 7) + ': ' + line.trim());
    }
    if (!(countExpects(readFileSync(file, 'utf8')) > countExpects(git(['show', from + ':' + file])))) {
      fail('phase test ' + file + ' expect( count did not grow since ' + from.slice(0, 7));
    }
    additionLines.set(file, changed.filter((line) => line.startsWith('+') && /\b(describe|it)\(/.test(line)));
    continue;
  }
  const commits = git(['log', '--format=%h', base + '..HEAD', '--', file]).split('\n').filter(Boolean);
  if (commits.length !== 1) fail('phase test ' + file + ' has ' + commits.length + ' commits since the base, expected 1');
  if (!gitQuietSame(['HEAD', '--', file])) fail('phase test ' + file + ' differs from HEAD');
}
console.log('Gap-closure additions (08-06)');
for (const [file, lines] of additionLines) {
  console.log('  ' + file + ' since ' + ADDITIONS_ONLY[file].slice(0, 7));
  for (const line of lines) console.log('    ' + line.slice(1).trim());
}

if (failures.length > 0) process.exit(1);
console.log('AUDIT OK');
