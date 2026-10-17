import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Source-text proof that RecipePage.jsx stays the route shell (Phase 5, Plan 06).
// RecipePage.test.jsx renders static markup and never runs effects. The jsdom
// RecipePage tests (drafts, undoRetire, recordTasting and the others) mount the
// page and run its effects, but they check what the page does, not which module
// owns the draft state. So this is how the split's shape is pinned: no direct
// draft setter in the page, each reset written once, the domain modules pure,
// the hooks stopping at the draft.
// Phase 8 (EDIT-06) adds the other half: this test now names each job's module
// and proves the shell imports it and the job lives there (JOBS and
// jobProblems below), so a cut that leaves its job behind, or a job that
// drifts back into the shell, turns a named case red. The seven broken
// fixtures show each check can fire on its own.
// Node environment on purpose: no docblock, no DOM.

function raw(relative) {
  return readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');
}

// A string is matched before a comment, so a // or /* inside one stays code (WR-02).
const STRING_OR_COMMENT = /('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\[\s\S]|[^`\\])*`)|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;

function stripComments(source) {
  return source.replace(STRING_OR_COMMENT, (_match, literal) => literal ?? '');
}

function count(source, needle) {
  return source.split(needle).length - 1;
}

function specifiersOf(source) {
  return [...source.matchAll(/\bfrom\s+'([^']+)'/g)].map((match) => match[1]);
}

const recipePage = stripComments(raw('./RecipePage.jsx'));
const usePenDraft = stripComments(raw('./usePenDraft.js'));
const useRecordDraft = stripComments(raw('./useRecordDraft.js'));
const useVersionPen = stripComments(raw('./useVersionPen.js'));
const useKeptDraft = stripComments(raw('./useKeptDraft.js'));
const penDraft = stripComments(raw('../domain/penDraft.js'));
const recordDraft = stripComments(raw('../domain/recordDraft.js'));
const ingredientTable = stripComments(raw('./IngredientTable.jsx'));

// D-12 names these five; D-09 and Plans 03 and 05 gave the hooks the other seven.
const D12_SETTERS = ['setPenDraft', 'setDraft', 'setBlockedMessage', 'setBlockedTarget', 'setBlockedDateMessage'];
const OTHER_HOOK_SETTERS = [
  'setFieldErrors',
  'setInvalidFieldTarget',
  'setBlockedDateAttempt',
  'setPendingUndo',
  'setAmendingBatchId',
  'setAmendBaseline',
  'setAmendOpener',
];
const wholeWord = (names) => new RegExp('\\b(' + names.join('|') + ')\\b');

// Phase 8: the modules the page was cut into, as [label, path].
const NEW_MODULES = [
  ['useAnnouncer.js', './useAnnouncer.js'],
  ['useRecipeData.js', './useRecipeData.js'],
  ['sheetView.js', './sheetView.js'],
  ['RecipeSheet.jsx', './RecipeSheet.jsx'],
  ['useVersionPen.js', './useVersionPen.js'],
  ['useKeptDraft.js', './useKeptDraft.js'],
  ['useRouteIntents.js', './useRouteIntents.js'],
];

// The names a source imports with `import { a, b as c } from` and then uses
// fewer than twice (the import and one use): the algorithm of the shell's own
// "imports nothing it does not use" case, for any one file.
function unusedImports(source) {
  const imported = [];
  for (const block of source.matchAll(/import\s*\{([^}]*)\}\s*from/g)) {
    for (const part of block[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop();
      if (name) imported.push(name);
    }
  }
  return imported.filter((name) => (source.match(new RegExp('\\b' + name + '\\b', 'g')) || []).length < 2);
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// jobProblems(entry, moduleSource, shellSource) -> the problems with one job,
// each starting with the tag of the check that found it; [] when the job is in
// place. Both sources arrive with comments stripped. An entry is
// { name, file, specifier, call, hook, markers, shellLacks, allow }:
//   export:     the module exports `function name(` exactly once
//   import:     the shell imports name from specifier
//   call:       the shell holds `call` exactly once
//   order:      a hook is called before the shell's first early return
//   marker:     each [needle, n] occurs exactly n times in the module
//   shellLacks: no needle in shellLacks occurs in the shell
//   allow:      every module import is on the allow-list (an entry ending in /
//               allows anything under it)
function jobProblems(entry, moduleSource, shellSource) {
  const problems = [];
  const exported = count(moduleSource, 'export function ' + entry.name + '(');
  if (exported !== 1) problems.push('export: ' + entry.name + ' is exported ' + exported + ' times, expected 1');
  const importPattern = new RegExp(
    'import\\s*\\{[^}]*\\b' + entry.name + '\\b[^}]*\\}\\s*from\\s*\'' + escapeRegExp(entry.specifier) + '\'',
  );
  if (!importPattern.test(shellSource)) {
    problems.push('import: the shell does not import ' + entry.name + ' from ' + entry.specifier);
  }
  const calls = count(shellSource, entry.call);
  if (calls !== 1) problems.push('call: ' + entry.call + ' occurs ' + calls + ' times in the shell, expected 1');
  if (entry.hook) {
    const at = shellSource.indexOf(entry.call);
    const early = shellSource.indexOf('if (loadFailed) return');
    if (early < 0 || at < 0 || at > early) {
      problems.push('order: ' + entry.call + ' is not called before the first early return');
    }
  }
  for (const [needle, n] of entry.markers) {
    const found = count(moduleSource, needle);
    if (found !== n) problems.push("marker: '" + needle + "' occurs " + found + ' times, expected ' + n);
  }
  for (const needle of entry.shellLacks) {
    if (shellSource.includes(needle)) problems.push("shellLacks: the shell still holds '" + needle + "'");
  }
  for (const specifier of specifiersOf(moduleSource)) {
    const allowed = entry.allow.some((rule) => specifier === rule || (rule.endsWith('/') && specifier.startsWith(rule)));
    if (!allowed) problems.push("allow: the module imports '" + specifier + "', which is not on its allow-list");
  }
  return problems;
}

// One entry per cut, in the order the shell calls the hooks.
const JOBS = [
  {
    name: 'useAnnouncer',
    file: './useAnnouncer.js',
    specifier: './useAnnouncer.js',
    call: 'useAnnouncer()',
    hook: true,
    markers: [
      ['5000', 3],
      ['function announce(', 1],
    ],
    shellLacks: ['function announce(', 'StatusTimerRef'],
    allow: ['react'],
  },
  {
    name: 'useRecipeData',
    file: './useRecipeData.js',
    specifier: './useRecipeData.js',
    call: 'useRecipeData(versionId)',
    hook: true,
    markers: [
      ['.getVersion(', 2],
      ['.listBatchesForVersion(', 1],
      ['.listDrafts(', 1],
      ['.listVersions(', 1],
      ['.getRecipe(', 1],
      ['.getBatch(', 1],
      ['.getAllBatches(', 1],
      ['setLoadFailed(true)', 8],
    ],
    shellLacks: [
      '.getVersion(',
      '.listBatchesForVersion(',
      '.listDrafts(',
      '.listVersions(',
      '.getRecipe(',
      '.getBatch(',
      '.getAllBatches(',
      'setLoadFailed',
    ],
    allow: ['react', '../store/repository.js'],
  },
  {
    name: 'sheetView',
    file: './sheetView.js',
    specifier: './sheetView.js',
    call: 'sheetView(',
    hook: false,
    markers: [
      ['export function markedFigure(', 1],
      ['function joinNames(', 1],
      ['buildDiff(', 2],
    ],
    shellLacks: ['buildDiff(', 'penDraftVersion(', 'displayNumbers(', 'function joinNames('],
    allow: ['../domain/'],
  },
  {
    name: 'RecipeSheet',
    file: './RecipeSheet.jsx',
    specifier: './RecipeSheet.jsx',
    call: '<RecipeSheet',
    hook: false,
    markers: [
      ['<article className={sheetClassName}', 1],
      ['<IngredientTable', 1],
      ['<Method', 1],
      ['<FormulationNote', 1],
      ['useSheetTwoColumns()', 1],
      ['markedFigure(view, focusedFigureKey)', 1],
      ['{foot}', 1],
    ],
    shellLacks: [
      '<article',
      '<IngredientTable',
      '<Method',
      '<FormulationNote',
      'sheetClassName',
      'useSheetTwoColumns',
      'focusedFigureKey',
      'markedFigure(',
    ],
    allow: ['react', './'],
  },
  {
    name: 'useVersionPen',
    file: './useVersionPen.js',
    specifier: './useVersionPen.js',
    call: 'useVersionPen(',
    hook: true,
    markers: [
      ['usePenDraft()', 1],
      ['repository.saveVersion(', 2],
      ['createChildVersion(', 1],
      ['saveOverVersion(', 1],
      ['function restorePlan(', 1],
      ['announce(VERSION_BLOCKED_STATUS)', 1],
      ['onPageStatus(VERSION_SAVED_STATUS)', 2],
    ],
    shellLacks: ['usePenDraft', 'saveVersion', 'createChildVersion', 'versionPen.', 'versionSaveLockRef', 'function handleStartDeveloping('],
    allow: ['react', '../store/repository.js', '../domain/', './usePenDraft.js', './notebookPaths.js'],
  },
  {
    name: 'useDraftWriter',
    file: './useKeptDraft.js',
    specifier: './useKeptDraft.js',
    call: 'useDraftWriter(versionId)',
    hook: true,
    markers: [
      ['function flushPendingDraft(', 1],
      ['function discardDraft(', 1],
    ],
    shellLacks: ['function flushPendingDraft(', 'function discardDraft('],
    allow: ['react', '../store/repository.js', '../domain/', './notebookPaths.js'],
  },
  {
    name: 'useKeptDraft',
    file: './useKeptDraft.js',
    specifier: './useKeptDraft.js',
    call: 'useKeptDraft(',
    hook: true,
    markers: [
      ['repository.getDraft(versionId)', 1],
      ['repository.saveDraft(record)', 1],
      ['repository.deleteDraft(versionId)', 3],
      ['draftMatchesVersion(', 1],
      ['buildDraftRecord(', 2],
      ['setTimeout(flushPendingDraft, 250)', 1],
      ['if (draftRestoreStartedRef.current) return;', 1],
      ['draftRestoreStartedRef.current = true', 1],
      ['onRestorePlan(record.payload, record.penOpenedAt)', 1],
      ['onRestoreRecord(record)', 1],
      ['onPageStatus(DRAFT_KEPT_STATUS)', 1],
      ["window.addEventListener('pagehide', flushPendingDraft)", 1],
    ],
    shellLacks: [
      '.getDraft(',
      '.saveDraft(',
      '.deleteDraft(',
      'draftRestoreStartedRef',
      'setTimeout(flushPendingDraft',
      'pagehide',
      'buildDraftRecord(',
      'setDraftRestoreDone',
    ],
    allow: ['react', '../store/repository.js', '../domain/', './notebookPaths.js'],
  },
  {
    name: 'useRouteIntents',
    file: './useRouteIntents.js',
    specifier: './useRouteIntents.js',
    call: 'useRouteIntents(',
    hook: true,
    markers: [
      ['location.state?.startTasting', 1],
      ['location.state?.startNextVersion', 1],
      ['state: null', 3],
      ["onStartAmending(target, { opener: 'record-a-tasting' })", 1],
      ['onStartDeveloping()', 1],
      ['versionsForRecipe(', 1],
    ],
    shellLacks: ['startTastingConsumedRef', 'startNextVersionConsumedRef', 'location.state?.startTasting', 'location.state?.startNextVersion'],
    allow: ['react', '../domain/'],
  },
];

// The shell's hook calls in the order they must appear, all above the early returns.
const HOOK_ORDER = [
  'useAnnouncer()',
  'useRecipeData(versionId)',
  'useRecordDraft()',
  'useDraftWriter(versionId)',
  'useVersionPen(',
  'useKeptDraft(',
  'useRouteIntents(',
];

describe('RecipePage.jsx holds no draft setter (D-12)', () => {
  it('has none of the five setters D-12 names', () => {
    expect(recipePage).not.toMatch(wholeWord(D12_SETTERS));
  });

  it('has none of the seven other setters the hooks own', () => {
    expect(recipePage).not.toMatch(wholeWord(OTHER_HOOK_SETTERS));
  });

  it.each(NEW_MODULES)('%s holds none of the draft setters either', (_name, path) => {
    expect(stripComments(raw(path))).not.toMatch(wholeWord([...D12_SETTERS, ...OTHER_HOOK_SETTERS]));
  });

  it('the pattern is anchored: it matches the hook-owned calls and not the page-owned ones', () => {
    const pattern = wholeWord(D12_SETTERS);
    expect(pattern.test('setDraft(')).toBe(true);
    expect(pattern.test('setBlockedTarget(null)')).toBe(true);
    expect(pattern.test('setDraftRestoreDone(true)')).toBe(false);
    expect(pattern.test('setDrafts(result)')).toBe(false);
  });
});

describe('stripComments keeps what a string holds (WR-02)', () => {
  it.each([
    "const u = 'http://x'; setDraft(null);",
    'const u = "a // b"; setDraft(null);',
    'const u = `${base}//x`; setDraft(null);',
    "const open = '/*'; setDraft(null); const close = '*/';",
  ])('a setter after a comment marker inside a string is still caught: %s', (line) => {
    expect(stripComments(line)).toMatch(wholeWord(D12_SETTERS));
  });

  it('a reset or markup after a URL string is still seen', () => {
    expect(count(stripComments("const u = 'http://x'; setBlockedMessage(null);"), 'setBlockedMessage(null)')).toBe(1);
    expect(stripComments("const u = 'http://x'; dangerouslySetInnerHTML")).toContain('dangerouslySetInnerHTML');
  });

  it('real comments are still stripped, a quote inside one included', () => {
    const stripped = stripComments(
      "// setDraft(null) can't run\nconst a = 'x'; /* setDraft(null) */ const b = \"y\"; // setDraft(null)\n",
    );
    expect(stripped).not.toMatch(wholeWord(D12_SETTERS));
    expect(stripped).toContain("const a = 'x';");
    expect(stripped).toContain('const b = "y";');
  });
});

describe('the draft hooks sit above the early returns', () => {
  const earlyReturn = recipePage.indexOf('if (loadFailed) return');

  it('finds the first early return', () => {
    expect(earlyReturn).toBeGreaterThan(-1);
  });

  it.each(['useRecordDraft()'])('%s is called exactly once, before the early returns', (call) => {
    expect(count(recipePage, call)).toBe(1);
    expect(recipePage.indexOf(call)).toBeLessThan(earlyReturn);
  });

  it('usePenDraft() is called once, inside useVersionPen.js, and the shell calls useVersionPen once above the early returns', () => {
    expect(count(useVersionPen, 'usePenDraft()')).toBe(1);
    expect(count(recipePage, 'usePenDraft()')).toBe(0);
    expect(count(recipePage, 'useVersionPen(')).toBe(1);
    expect(recipePage.indexOf('useVersionPen(')).toBeLessThan(earlyReturn);
  });
});

describe('each reset is written in one place', () => {
  it('usePenDraft.js resets the blocked save once', () => {
    expect(count(usePenDraft, 'setBlockedMessage(null)')).toBe(1);
    expect(count(usePenDraft, 'setBlockedTarget(null)')).toBe(1);
  });

  it('useRecordDraft.js resets the churn-date block once', () => {
    expect(count(useRecordDraft, 'setBlockedDateMessage(null)')).toBe(1);
  });
});

describe('the domain modules stay pure (D-01)', () => {
  it.each([
    ['penDraft.js', penDraft],
    ['recordDraft.js', recordDraft],
  ])('%s imports only sibling domain modules', (_name, source) => {
    const specifiers = specifiersOf(source);
    expect(specifiers.length).toBeGreaterThan(0);
    for (const specifier of specifiers) {
      expect(specifier).toMatch(/^\.\/[\w.-]+\.js$/);
    }
  });

  it.each(['../domain/penDraft.test.js', '../domain/recordDraft.test.js', './sheetView.test.js'])(
    '%s carries no jsdom docblock on its first line',
    (path) => {
      expect(raw(path).split('\n')[0]).not.toContain('@vitest-environment');
    },
  );
});

describe('the hooks stop at the draft (D-07)', () => {
  it.each([
    ['usePenDraft.js', usePenDraft],
    ['useRecordDraft.js', useRecordDraft],
  ])('%s imports only react and the domain', (_name, source) => {
    for (const specifier of specifiersOf(source)) {
      expect(specifier === 'react' || specifier.startsWith('../domain/')).toBe(true);
    }
    expect(source).not.toContain('repository');
  });
});

describe('RecipePage.jsx is the route shell', () => {
  const moduleFunctions = [...recipePage.matchAll(/^(?:export )?function (\w+)/gm)].map((match) => match[1]);
  const exportedFunctions = [...recipePage.matchAll(/^export function (\w+)/gm)].map((match) => match[1]);

  it('declares no module-level function beyond PageLoadFailed, RecipeNotFound and RecipePage', () => {
    expect([...moduleFunctions].sort()).toEqual(['PageLoadFailed', 'RecipeNotFound', 'RecipePage']);
  });

  it('exports only RecipeNotFound and RecipePage as functions', () => {
    expect([...exportedFunctions].sort()).toEqual(['RecipeNotFound', 'RecipePage']);
  });

  it('still writes through the repository seam', () => {
    expect(recipePage).toContain("import { repository } from '../store/repository.js';");
  });

  it('imports nothing it does not use', () => {
    const imported = [];
    for (const block of recipePage.matchAll(/import\s*\{([^}]*)\}\s*from/g)) {
      for (const part of block[1].split(',')) {
        const name = part.trim().split(/\s+as\s+/).pop();
        if (name) imported.push(name);
      }
    }
    expect(imported.length).toBeGreaterThan(0);
    for (const name of imported) {
      const uses = recipePage.match(new RegExp('\\b' + name + '\\b', 'g')) || [];
      expect(uses.length, name + ' is imported but never used').toBeGreaterThanOrEqual(2);
    }
  });

  it.each(NEW_MODULES)('%s imports nothing it does not use', (_name, path) => {
    expect(unusedImports(stripComments(raw(path)))).toEqual([]);
  });
});

describe('notes and prose render as text, never as markup', () => {
  it.each([
    ['RecipePage.jsx', recipePage],
    ['IngredientTable.jsx', ingredientTable],
    ['usePenDraft.js', usePenDraft],
    ['useRecordDraft.js', useRecordDraft],
    ['penDraft.js', penDraft],
    ['recordDraft.js', recordDraft],
  ])('%s has no dangerouslySetInnerHTML', (_name, source) => {
    expect(source).not.toContain('dangerouslySetInnerHTML');
  });

  it.each(NEW_MODULES)('%s has no dangerouslySetInnerHTML', (_name, path) => {
    expect(stripComments(raw(path))).not.toContain('dangerouslySetInnerHTML');
  });
});

describe('RecipePage.jsx is cut along its jobs (EDIT-05, EDIT-06)', () => {
  it.each(JOBS.map((job) => [job.name, job]))('%s lives in its module, and the shell imports and calls it', (_name, job) => {
    expect(jobProblems(job, stripComments(raw(job.file)), recipePage)).toEqual([]);
  });

  it('the shell calls its hooks in the planned order, all above the early returns', () => {
    const earlyReturn = recipePage.indexOf('if (loadFailed) return');
    expect(earlyReturn).toBeGreaterThan(-1);
    const at = HOOK_ORDER.map((call) => recipePage.indexOf(call));
    for (const index of at) expect(index).toBeGreaterThan(-1);
    for (let i = 1; i < at.length; i += 1) expect(at[i]).toBeGreaterThan(at[i - 1]);
    expect(at[at.length - 1]).toBeLessThan(earlyReturn);
  });

  // Each fixture breaks exactly one check of jobProblems, so exactly one
  // problem comes back and it carries that check's tag; the clean one returns [].
  const FIXTURE_ENTRY = {
    name: 'useThing',
    file: './useThing.js',
    specifier: './useThing.js',
    call: 'useThing()',
    hook: true,
    markers: [['5000', 3]],
    shellLacks: ['function announce('],
    allow: ['react'],
  };
  const CLEAN_MODULE =
    "import { useRef } from 'react';\nexport function useThing() {\n  useRef(5000);\n  useRef(5000);\n  useRef(5000);\n}\n";
  const CLEAN_SHELL =
    "import { useThing } from './useThing.js';\nexport function Page() {\n  useThing();\n  if (loadFailed) return null;\n}\n";
  const FIXTURES = [
    ['export:', CLEAN_MODULE.replace('export function', 'function'), CLEAN_SHELL],
    ['import:', CLEAN_MODULE, CLEAN_SHELL.replace("import { useThing } from './useThing.js';\n", '')],
    ['call:', CLEAN_MODULE, CLEAN_SHELL.replace('  useThing();\n', '  useThing();\n  useThing();\n')],
    ['order:', CLEAN_MODULE, CLEAN_SHELL.replace('  useThing();\n  if (loadFailed) return null;\n', '  if (loadFailed) return null;\n  useThing();\n')],
    ['marker:', CLEAN_MODULE.replace('  useRef(5000);\n', ''), CLEAN_SHELL],
    ['shellLacks:', CLEAN_MODULE, CLEAN_SHELL + 'function announce() {}\n'],
    ['allow:', "import x from 'lodash';\n" + CLEAN_MODULE, CLEAN_SHELL],
    [null, CLEAN_MODULE, CLEAN_SHELL],
  ];

  it.each(FIXTURES)('each job check can fail: %s', (tag, moduleSource, shellSource) => {
    const problems = jobProblems(FIXTURE_ENTRY, moduleSource, shellSource);
    if (tag === null) {
      expect(problems).toEqual([]);
    } else {
      expect(problems).toHaveLength(1);
      expect(problems[0].startsWith(tag)).toBe(true);
    }
  });
});

// D-08: the writer is the effect-free half of the kept-draft job. The text from
// its declaration to the next exported function holds no useEffect(.
function writerDeclaresNoEffect(source) {
  const start = source.indexOf('export function useDraftWriter(');
  if (start < 0) return false;
  const next = source.indexOf('export function ', start + 1);
  const body = next < 0 ? source.slice(start) : source.slice(start, next);
  return !body.includes('useEffect(');
}

describe('useDraftWriter declares no effect (D-08)', () => {
  it('useDraftWriter declares no effect (D-08)', () => {
    expect(writerDeclaresNoEffect(useKeptDraft)).toBe(true);
  });

  it('the check can fail: a writer body holding a useEffect( is refused', () => {
    const withEffect =
      "export function useDraftWriter(versionId) {\n  useEffect(() => {}, []);\n  return {};\n}\nexport function useKeptDraft() {}\n";
    const clean = "export function useDraftWriter(versionId) {\n  return {};\n}\nexport function useKeptDraft() {\n  useEffect(() => {}, []);\n}\n";
    expect(writerDeclaresNoEffect(withEffect)).toBe(false);
    expect(writerDeclaresNoEffect(clean)).toBe(true);
  });
});

// D-10: the restore keeps its started-ref guard and gets no cancellation flag,
// which would drop the one read the guard lets through under StrictMode.
function hasCancellationFlag(source) {
  return /\bcancell?ed\b/.test(source);
}

// Pitfall 4: the amend redirect leaves draftRestoreDone unset, so the next page
// instance owns the draft. The text from `record.kind === 'amend'` to the first
// `return;` after it.
function amendRedirectSpan(source) {
  const start = source.indexOf("record.kind === 'amend'");
  if (start < 0) return null;
  const end = source.indexOf('return;', start);
  return end < 0 ? null : source.slice(start, end);
}

describe('the kept-draft restore keeps its order-sensitive shape (D-10, Pitfall 4)', () => {
  it('the restore keeps its started-ref guard and no cancellation flag (D-10)', () => {
    expect(hasCancellationFlag(useKeptDraft)).toBe(false);
    expect(hasCancellationFlag('let cancelled = false;\nreturn () => { cancelled = true; };')).toBe(true);
    expect(hasCancellationFlag('let canceled = false;')).toBe(true);
  });

  it('the amend redirect leaves draftRestoreDone unset (Pitfall 4)', () => {
    const span = amendRedirectSpan(useKeptDraft);
    expect(span).not.toBeNull();
    expect(span).toContain('navigate(');
    expect(span).not.toContain('setDraftRestoreDone');
    const broken = "if (record.kind === 'amend' && x) {\n  setDraftRestoreDone(true);\n  return;\n}";
    expect(amendRedirectSpan(broken)).toContain('setDraftRestoreDone');
  });
});
