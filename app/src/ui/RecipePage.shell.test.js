import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Source-text proof that RecipePage.jsx stays the route shell (Phase 5, Plan 06).
// The RecipePage tests render static markup and never run effects, so this is
// how the split's shape is pinned: no direct draft setter in the page, each
// reset written once, the domain modules pure, the hooks stopping at the draft.
// Node environment on purpose: no docblock, no DOM.

function raw(relative) {
  return readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
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

describe('RecipePage.jsx holds no draft setter (D-12)', () => {
  it('has none of the five setters D-12 names', () => {
    expect(recipePage).not.toMatch(wholeWord(D12_SETTERS));
  });

  it('has none of the seven other setters the hooks own', () => {
    expect(recipePage).not.toMatch(wholeWord(OTHER_HOOK_SETTERS));
  });

  it('the pattern is anchored: it matches the hook-owned calls and not the page-owned ones', () => {
    const pattern = wholeWord(D12_SETTERS);
    expect(pattern.test('setDraft(')).toBe(true);
    expect(pattern.test('setBlockedTarget(null)')).toBe(true);
    expect(pattern.test('setDraftRestoreDone(true)')).toBe(false);
    expect(pattern.test('setDrafts(result)')).toBe(false);
  });
});

describe('the two hooks sit in the shell above the early returns', () => {
  const earlyReturn = recipePage.indexOf('if (loadFailed) return');

  it('finds the first early return', () => {
    expect(earlyReturn).toBeGreaterThan(-1);
  });

  it.each(['usePenDraft()', 'useRecordDraft()'])('%s is called exactly once, before the early returns', (call) => {
    expect(count(recipePage, call)).toBe(1);
    expect(recipePage.indexOf(call)).toBeLessThan(earlyReturn);
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

  it.each(['../domain/penDraft.test.js', '../domain/recordDraft.test.js'])(
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

  it('declares no module-level function beyond joinNames, PageLoadFailed, RecipeNotFound and RecipePage', () => {
    expect([...moduleFunctions].sort()).toEqual(['PageLoadFailed', 'RecipeNotFound', 'RecipePage', 'joinNames']);
  });

  it('exports only RecipeNotFound and RecipePage as functions', () => {
    expect([...exportedFunctions].sort()).toEqual(['RecipeNotFound', 'RecipePage']);
  });

  it('still loads its records through the repository seam', () => {
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
});
