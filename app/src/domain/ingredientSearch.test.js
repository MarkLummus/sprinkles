// The Ingredients place's search (sketch 012 "The search the board assumes",
// D-11): a name matches when it contains the trimmed query in any case, the
// category matches exactly, 'All' matches every category, and the rows keep
// A to Z order. Nothing smarter. Pure, so it runs in the node environment.
import { describe, test, expect } from 'vitest';
import { filterLibrary, libraryCategories } from './ingredientSearch.js';
import { library } from '../data/library.js';

const records = Object.entries(library).map(([id, entry]) => ({ id, entry }));

function record(id, name, category = 'other') {
  return { id, entry: { name, category, composition: { other: 1 } } };
}

const names = (list) => list.map((item) => item.entry.name);

describe('filterLibrary', () => {
  test('returns every record for no query and All, sorted by name lower-cased then id', () => {
    const result = filterLibrary(records, '', 'All');
    expect(result).toHaveLength(records.length);
    const keys = result.map((item) => [item.entry.name.toLowerCase(), item.id]);
    const sorted = [...keys].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0));
    expect(keys).toEqual(sorted);
  });

  test('finds the names that contain the trimmed query in any case: five of the 26 for milk', () => {
    expect(records).toHaveLength(26);
    const result = filterLibrary(records, '  MILK ', 'All');
    expect(result).toHaveLength(5);
    for (const item of result) expect(item.entry.name.toLowerCase()).toContain('milk');
  });

  test('an empty or whitespace-only query matches every entry', () => {
    expect(filterLibrary(records, '', 'All')).toHaveLength(26);
    expect(filterLibrary(records, '   ', 'All')).toHaveLength(26);
  });

  test('a category keeps only that category: four of the 26 for sugar', () => {
    const result = filterLibrary(records, '', 'sugar');
    expect(result).toHaveLength(4);
    for (const item of result) expect(item.entry.category).toBe('sugar');
  });

  test('a name and a category combine as an intersection', () => {
    const milk = filterLibrary(records, 'milk', 'All');
    const sugarMilk = filterLibrary(records, 'milk', 'sugar');
    expect(sugarMilk.every((item) => item.entry.category === 'sugar' && milk.includes(item))).toBe(true);
    const dairyMilk = filterLibrary(records, 'milk', 'dairy');
    expect(dairyMilk.length).toBeGreaterThan(0);
    expect(dairyMilk.length).toBeLessThanOrEqual(milk.length);
  });

  test('no match returns an empty array', () => {
    expect(filterLibrary(records, 'zzzz', 'All')).toEqual([]);
    expect(filterLibrary(records, 'milk', 'fruit')).toEqual([]);
  });

  test('does not fold accents or split words: creme does not match Crème', () => {
    const list = [record('a', 'Crème fraîche'), record('b', 'Cream cheese')];
    expect(filterLibrary(list, 'creme', 'All')).toEqual([]);
    expect(names(filterLibrary(list, 'crème', 'All'))).toEqual(['Crème fraîche']);
    expect(filterLibrary(list, 'cheese cream', 'All')).toEqual([]);
  });

  test('sorts Whole Milk 3.3% before Whole milk, 3.5% fat, and keeps equal names in id order', () => {
    const list = [
      record('z', 'Whole milk, 3.5% fat'),
      record('y', 'Whole Milk 3.3%'),
      record('b', 'Same'),
      record('a', 'Same'),
    ];
    expect(filterLibrary(list, '', 'All').map((item) => item.id)).toEqual(['a', 'b', 'y', 'z']);
  });

  test('skips a record whose category is an object for a named category and keeps it for All', () => {
    const odd = { id: 'odd', entry: { name: 'Odd', category: { x: 1 }, composition: { other: 1 } } };
    const list = [...records, odd];
    expect(filterLibrary(list, '', 'sugar').some((item) => item.id === 'odd')).toBe(false);
    expect(filterLibrary(list, '', 'All').some((item) => item.id === 'odd')).toBe(true);
  });

  test('never mutates its input array', () => {
    const input = [record('b', 'Beta'), record('a', 'Alpha')];
    const copy = [...input];
    const result = filterLibrary(input, '', 'All');
    expect(input).toEqual(copy);
    expect(result).not.toBe(input);
    expect(names(result)).toEqual(['Alpha', 'Beta']);
  });
});

describe('libraryCategories', () => {
  test('returns the distinct category words A to Z', () => {
    const words = libraryCategories(records);
    expect(words).toEqual([...new Set(records.map((item) => item.entry.category))].sort());
    expect(words[0]).toBe('dairy');
  });

  test('leaves out a category that is not a non-blank string', () => {
    const list = [
      record('a', 'A', 'sugar'),
      record('b', 'B', '  '),
      { id: 'c', entry: { name: 'C', category: { x: 1 }, composition: { other: 1 } } },
      { id: 'd', entry: { name: 'D', composition: { other: 1 } } },
    ];
    expect(libraryCategories(list)).toEqual(['sugar']);
  });
});
