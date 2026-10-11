// layPages (04-07; PRINT-01, D-06a, sketch 010 D29): which block stands on which
// printed page, from the measured heights alone. Pure, so it runs under the node
// environment; the browser proof is the print probe.
import { describe, it, expect } from 'vitest';
import { layPages, PAGE_GUARD_PX } from './sheetPages.js';
import { OLIVE_OIL_V1_SAFARI, OLIVE_OIL_V1_CHROME } from './sheetPages.fixtures.js';

// The groups a page's table holds, as [group, from, to] triples.
const groupsOn = (page) => (page.table ? page.table.slices.map((slice) => [slice.group, slice.from, slice.to]) : []);

// The gauges a page's Balance column holds, by index.
const gaugesOn = (page) => (page.balance ? page.balance.gauges : []);

// A measure with round numbers, so a boundary can be hit exactly.
function constructed(overrides = {}) {
  return {
    band: 100,
    before: 0,
    gap: 20,
    ingredientsHeading: 20,
    header: 30,
    total: 30,
    groups: [],
    balanceHeading: 20,
    gauges: [],
    gaugeGap: 20,
    basis: 0,
    basisGap: 20,
    ...overrides,
  };
}

describe('layPages — the guard', () => {
  it('leaves 8 px of the content box unused', () => {
    expect(PAGE_GUARD_PX).toBe(8);
  });
});

describe('layPages — Olive Oil v1 as sketch 010 D29 draws it', () => {
  it('Safari (630 x 900): Steps 2 and 3 on the formula page; the header row, Steps 6 and 8 and the Total on the next', () => {
    const pages = layPages(OLIVE_OIL_V1_SAFARI.measure, OLIVE_OIL_V1_SAFARI.box);
    expect(pages).toHaveLength(2);
    expect(pages[0]).toMatchObject({ band: true, before: true });
    expect(pages[0].table).toMatchObject({ heading: true, header: true, total: false });
    expect(groupsOn(pages[0])).toEqual([
      [0, 0, 5],
      [1, 0, 6],
    ]);
    expect(pages[1]).toMatchObject({ band: false, before: false });
    expect(pages[1].table).toMatchObject({ heading: false, header: true, total: true });
    expect(groupsOn(pages[1])).toEqual([
      [2, 0, 1],
      [3, 0, 2],
    ]);
  });

  it('Chrome (672 x 960): Steps 2, 3 and 6 on the formula page; the header row, Step 8 and the Total on the next', () => {
    const pages = layPages(OLIVE_OIL_V1_CHROME.measure, OLIVE_OIL_V1_CHROME.box);
    expect(pages).toHaveLength(2);
    expect(groupsOn(pages[0])).toEqual([
      [0, 0, 5],
      [1, 0, 6],
      [2, 0, 1],
    ]);
    expect(pages[0].table.total).toBe(false);
    expect(pages[1].table).toMatchObject({ heading: false, header: true, total: true });
    expect(groupsOn(pages[1])).toEqual([[3, 0, 2]]);
  });

  it('keeps the page 1 foot within the content box less the guard, in both engines', () => {
    for (const { box, measure } of [OLIVE_OIL_V1_SAFARI, OLIVE_OIL_V1_CHROME]) {
      const [first] = layPages(measure, box);
      expect(first.bottom).toBeLessThanOrEqual(box.height - PAGE_GUARD_PX);
    }
  });

  it('puts the Ingredients heading on the first table page only and no word beyond the table', () => {
    for (const { box, measure } of [OLIVE_OIL_V1_SAFARI, OLIVE_OIL_V1_CHROME]) {
      const pages = layPages(measure, box);
      expect(pages.map((page) => page.table.heading)).toEqual([true, false]);
      expect(pages.map((page) => page.table.header)).toEqual([true, true]);
    }
  });
});

describe('layPages — [edge PRINT-01/adjacency] a group whose foot lands on the usable height', () => {
  // Page 1: band 100 + gap 20 puts the row at 120; the box is 1000 tall, so the
  // usable height is 992 and the row has 872. The heading and header take 50, which
  // leaves 822 for the groups. Group 0 is 400. The last group with the Total (30)
  // is 422 when its rows are 117 + 117 + 118 under a 40 head, and 423 with one
  // more pixel.
  const box = { height: 1000 };
  const withLastRows = (rows) =>
    constructed({
      groups: [
        { head: 40, rows: [120, 120, 120] },
        { head: 40, rows: rows },
      ],
    });

  it('stays on the page when it ends exactly on the usable height', () => {
    const pages = layPages(withLastRows([117, 117, 118]), box);
    expect(pages).toHaveLength(1);
    expect(groupsOn(pages[0])).toEqual([
      [0, 0, 3],
      [1, 0, 3],
    ]);
    expect(pages[0].bottom).toBe(box.height - PAGE_GUARD_PX);
    expect(pages[0].table.total).toBe(true);
  });

  it('moves whole to the next page, with the Total, when it ends one pixel past', () => {
    const pages = layPages(withLastRows([117, 117, 119]), box);
    expect(pages).toHaveLength(2);
    expect(groupsOn(pages[0])).toEqual([[0, 0, 3]]);
    expect(pages[0].table.total).toBe(false);
    expect(groupsOn(pages[1])).toEqual([[1, 0, 3]]);
    expect(pages[1].table).toMatchObject({ heading: false, header: true, total: true });
  });
});

describe('layPages — [edge PRINT-01/empty] no notes, one group, a group taller than a page', () => {
  it('draws no Before you start when the version has none, and begins the row a gap under the band', () => {
    const pages = layPages(constructed({ before: 0, groups: [{ head: 40, rows: [50] }] }), { height: 1000 });
    expect(pages[0].before).toBe(false);
    expect(pages[0].band).toBe(true);
    // The band (100) and one gap (20), then the table: heading 20, header 30, head 40, row 50, Total 30.
    expect(pages[0].bottom).toBe(120 + 20 + 30 + 40 + 50 + 30);
  });

  it('splits a one-group table that does not fit between rows, the header row repeated and the head kept with the first row', () => {
    const rows = Array.from({ length: 20 }, () => 50);
    const pages = layPages(constructed({ groups: [{ head: 40, rows }] }), { height: 600 });
    expect(pages.length).toBeGreaterThan(1);
    expect(pages[0].table.slices[0]).toMatchObject({ group: 0, from: 0, head: true });
    expect(pages[0].table.slices[0].to).toBeGreaterThan(0);
    for (const page of pages.slice(1)) {
      expect(page.table.header).toBe(true);
      expect(page.table.heading).toBe(false);
      expect(page.table.slices[0]).toMatchObject({ head: false });
    }
    // The rows run on without a gap or an overlap.
    const parts = pages.flatMap(groupsOn);
    expect(parts[0][1]).toBe(0);
    parts.slice(1).forEach(([, from], i) => expect(from).toBe(parts[i][2]));
    expect(parts[parts.length - 1][2]).toBe(rows.length);
  });

  it('splits a group taller than a page between rows, with the groups before it kept whole', () => {
    const tall = Array.from({ length: 16 }, () => 60);
    const pages = layPages(
      constructed({
        groups: [
          { head: 40, rows: [50, 50] },
          { head: 40, rows: tall },
        ],
      }),
      { height: 600 },
    );
    expect(groupsOn(pages[0])[0]).toEqual([0, 0, 2]);
    const second = pages.flatMap(groupsOn).filter(([group]) => group === 1);
    expect(second.length).toBeGreaterThan(1);
    expect(second[0][1]).toBe(0);
    expect(second[second.length - 1][2]).toBe(tall.length);
  });
});

describe('layPages — [edge PRINT-01/ordering] the Total', () => {
  it('prints once, on the page that holds the last line', () => {
    const pages = layPages(OLIVE_OIL_V1_SAFARI.measure, OLIVE_OIL_V1_SAFARI.box);
    expect(pages.filter((page) => page.table && page.table.total)).toHaveLength(1);
  });

  it('never stands alone under a repeated header: the last group moves with it when the Total would not fit', () => {
    // Group 0 fills 822 of page 1 exactly; the last group (one 100 px line under a
    // 40 head) is 140 and fits on its own page; the Total (30) would overflow page 1.
    const pages = layPages(
      constructed({
        groups: [
          { head: 40, rows: [260, 261, 261] },
          { head: 40, rows: [100] },
        ],
      }),
      { height: 1000 },
    );
    for (const page of pages) {
      if (page.table && page.table.total) expect(page.table.slices.length).toBeGreaterThan(0);
    }
    expect(pages).toHaveLength(2);
    expect(groupsOn(pages[1])).toEqual([[1, 0, 1]]);
    expect(pages[1].table.total).toBe(true);
    expect(pages[0].table.total).toBe(false);
  });

  it('rides with the last line of a split group', () => {
    const rows = Array.from({ length: 12 }, () => 60);
    const pages = layPages(constructed({ groups: [{ head: 40, rows }] }), { height: 500 });
    const lastPage = pages[pages.length - 1];
    expect(lastPage.table.total).toBe(true);
    expect(lastPage.table.slices[lastPage.table.slices.length - 1].to).toBe(rows.length);
    expect(pages.slice(0, -1).every((page) => page.table.total === false)).toBe(true);
  });

  it('prints the Total under the header of a table with no groups', () => {
    const pages = layPages(constructed({ groups: [] }), { height: 1000 });
    expect(pages).toHaveLength(1);
    expect(pages[0].table).toMatchObject({ heading: true, header: true, total: true, slices: [] });
  });
});

describe('layPages — a heading and header never stand with nothing under them', () => {
  it('moves the whole table to the next page when the formula page has no room for a first line', () => {
    // The band and the notes end at 860, so the row has 112 of the 992 usable: the
    // heading, header, step head and first line need 140.
    const pages = layPages(
      constructed({ band: 500, before: 340, groups: [{ head: 40, rows: [50, 50] }] }),
      { height: 1000 },
    );
    expect(pages).toHaveLength(2);
    expect(pages[0].table).toBeNull();
    expect(pages[0].band).toBe(true);
    expect(pages[0].before).toBe(true);
    expect(pages[1].table).toMatchObject({ heading: true, header: true, total: true });
  });
});

describe('layPages — Balance in column 2 (sketch 010 D29; decide-balance-break = continue)', () => {
  it('Safari: Freezing, Sweetness, Fat and Milk solids with the table; Sugar, Solids and the basis note on the next page', () => {
    const pages = layPages(OLIVE_OIL_V1_SAFARI.measure, OLIVE_OIL_V1_SAFARI.box);
    expect(pages).toHaveLength(2);
    expect(pages[0].balance).toEqual({ heading: true, gauges: [0, 1, 2, 3], basis: false });
    expect(pages[1].balance).toEqual({ heading: false, gauges: [4, 5], basis: true });
  });

  it('Chrome: five gauges with the table; Solids and the basis note on the next page', () => {
    const pages = layPages(OLIVE_OIL_V1_CHROME.measure, OLIVE_OIL_V1_CHROME.box);
    expect(pages).toHaveLength(2);
    expect(pages[0].balance).toEqual({ heading: true, gauges: [0, 1, 2, 3, 4], basis: false });
    expect(pages[1].balance).toEqual({ heading: false, gauges: [5], basis: true });
  });

  it('makes the page row as tall as the taller column, and ends Balance beside the table’s tail', () => {
    const [first, second] = layPages(OLIVE_OIL_V1_SAFARI.measure, OLIVE_OIL_V1_SAFARI.box);
    const m = OLIVE_OIL_V1_SAFARI.measure;
    const rowTop = m.band + m.gap + m.before + m.gap;
    const sum = (list) => list.reduce((a, b) => a + b, 0);
    const group = (g) => m.groups[g].head + sum(m.groups[g].rows);
    const table1 = m.ingredientsHeading + m.header + group(0) + group(1);
    const balance1 = m.balanceHeading + sum(m.gauges.slice(0, 4)) + 3 * m.gaugeGap;
    expect(first.bottom).toBeCloseTo(rowTop + Math.max(table1, balance1), 6);
    // Page 2: the table is 241.6 tall, Balance (two gauges and the basis) 325.6: the row is the taller.
    const table2 = m.header + group(2) + group(3) + m.total;
    const balance2 = sum(m.gauges.slice(4)) + m.gaugeGap + m.basisGap + m.basis;
    expect(balance2).toBeGreaterThan(table2);
    expect(second.bottom).toBeCloseTo(balance2, 6);
  });

  it('never prints the basis note before a gauge, nor a heading without a gauge under it', () => {
    for (const { measure, box } of [OLIVE_OIL_V1_SAFARI, OLIVE_OIL_V1_CHROME]) {
      const pages = layPages(measure, box);
      for (const page of pages) {
        if (page.balance && page.balance.heading) expect(page.balance.gauges.length).toBeGreaterThan(0);
      }
      const basisPage = pages.findIndex((page) => page.balance && page.balance.basis);
      const lastGaugePage = pages.map((page) => gaugesOn(page).length > 0).lastIndexOf(true);
      expect(basisPage).toBeGreaterThanOrEqual(lastGaugePage);
    }
  });

  it('keeps Balance with the row: it does not begin on a page the table has not reached', () => {
    // The notes leave no room for a table line, so the row begins on page 2, Balance with it.
    const pages = layPages(
      constructed({
        band: 500,
        before: 340,
        groups: [{ head: 40, rows: [50, 50] }],
        gauges: [60, 60],
        basis: 40,
      }),
      { height: 1000 },
    );
    expect(pages[0].table).toBeNull();
    expect(pages[0].balance).toBeNull();
    expect(pages[1].table).not.toBeNull();
    expect(pages[1].balance).toMatchObject({ heading: true, gauges: [0, 1], basis: true });
  });

  it('opens a continuing page with the basis note alone when every gauge stood on the pages before', () => {
    const pages = layPages(
      constructed({
        groups: [{ head: 40, rows: [100, 100, 100] }],
        gauges: [300, 300],
        basis: 400,
      }),
      { height: 900 },
    );
    expect(pages.flatMap(gaugesOn)).toEqual([0, 1]);
    const last = pages[pages.length - 1];
    expect(last.balance.basis).toBe(true);
    expect(pages.filter((page) => page.balance && page.balance.basis)).toHaveLength(1);
  });

  it('takes a gauge taller than a page alone rather than loop', () => {
    const pages = layPages(constructed({ groups: [{ head: 40, rows: [50] }], gauges: [2000, 50], basis: 40 }), { height: 900 });
    expect(pages.flatMap(gaugesOn)).toEqual([0, 1]);
    expect(pages.length).toBeLessThan(10);
  });
});

// A seeded stream of numbers, so the sweep below is the same on every run.
function stream(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe('layPages — every line stands exactly once, in order, within the page', () => {
  it('holds for 300 constructed tables of every size', () => {
    const next = stream(7);
    const between = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
    for (let n = 0; n < 300; n += 1) {
      const groups = Array.from({ length: between(0, 5) }, () => ({
        head: next() < 0.1 ? 0 : between(20, 45),
        rows: Array.from({ length: between(1, 9) }, () => between(25, 70)),
      }));
      const gauges = Array.from({ length: between(0, 7) }, () => between(60, 140));
      const measure = constructed({
        band: between(80, 140),
        before: next() < 0.4 ? 0 : between(60, 220),
        ingredientsHeading: between(15, 30),
        header: between(20, 35),
        total: between(20, 40),
        groups,
        balanceHeading: between(15, 30),
        gauges,
        basis: gauges.length === 0 || next() < 0.2 ? 0 : between(40, 160),
      });
      const box = { height: between(500, 1000) };
      const usable = box.height - PAGE_GUARD_PX;
      const pages = layPages(measure, box);
      const where = `case ${n}`;

      // Every (group, row) appears once, in reading order; the head stands with row 0 only.
      const seen = [];
      for (const page of pages) {
        for (const slice of page.table ? page.table.slices : []) {
          expect(slice.head, where).toBe(slice.from === 0);
          for (let row = slice.from; row < slice.to; row += 1) seen.push(`${slice.group}:${row}`);
        }
      }
      const expected = groups.flatMap((group, g) => group.rows.map((_, row) => `${g}:${row}`));
      expect(seen, where).toEqual(expected);

      // The Total once, with the last line (or alone under the header when there is no group).
      const withTotal = pages.filter((page) => page.table && page.table.total);
      expect(withTotal, where).toHaveLength(1);
      expect(pages.indexOf(withTotal[0]), where).toBe(pages.map((page) => Boolean(page.table)).lastIndexOf(true));

      // The heading once, on the first page that has a table; the header on each.
      const tables = pages.filter((page) => page.table);
      expect(tables.map((page) => page.table.heading), where).toEqual(tables.map((_, i) => i === 0));
      expect(tables.every((page) => page.table.header), where).toBe(true);

      // Balance: every gauge once, in order; the heading on its first page only; the
      // basis note once, after the last gauge; none before the table's first page.
      expect(pages.flatMap(gaugesOn), where).toEqual(gauges.map((_, i) => i));
      const balances = pages.filter((page) => page.balance);
      expect(balances.map((page) => page.balance.heading), where).toEqual(balances.map((_, i) => gauges.length > 0 && i === 0));
      expect(pages.filter((page) => page.balance && page.balance.basis), where).toHaveLength(measure.basis > 0 ? 1 : 0);
      if (measure.basis > 0) {
        const basisPage = pages.findIndex((page) => page.balance && page.balance.basis);
        const lastGaugePage = pages.map((page) => gaugesOn(page).length > 0).lastIndexOf(true);
        expect(basisPage, where).toBeGreaterThanOrEqual(lastGaugePage);
      }
      const firstTable = pages.findIndex((page) => page.table);
      const firstBalance = pages.findIndex((page) => page.balance);
      if (firstBalance !== -1) expect(firstBalance, where).toBeGreaterThanOrEqual(firstTable);

      // A page keeps within the usable height unless it holds one line, or one gauge,
      // alone: a page always takes its first item, however tall.
      for (const page of pages) {
        const lines = page.table ? page.table.slices.reduce((count, slice) => count + (slice.to - slice.from), 0) : 0;
        if (lines === 1 || gaugesOn(page).length === 1) continue;
        expect(page.bottom, where).toBeLessThanOrEqual(usable);
      }
      // Page 1 carries the band; none after does.
      expect(pages.map((page) => page.band), where).toEqual(pages.map((_, i) => i === 0));
    }
  });
});
