import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { computeBalance, formatGrams, formatPortionLine } from '../domain/composition.js';
import { activeRows, rowGrams } from '../domain/rows.js';
import { displayNumbers } from '../domain/stepNumbers.js';
import { buildFigures } from '../domain/figures.js';
import { layPages } from '../domain/sheetPages.js';
import { groupPortionsByStep, dataFlagFor } from './IngredientTable.jsx';
import { Headnote } from './Headnote.jsx';
import { NoteList } from './Authored.jsx';
import { RuleDrawing } from './GraduatedRule.jsx';
import { BasisNote } from './BasisNote.jsx';

// The Sheet's formula pages on paper (Phase 4, plan 04-07; PRINT-01, D-06,
// D-06a, D-06b; sketch 010 D29, E1 to E8). The Sheet is laid into pages by
// measurement, not by the printer: the blocks are rendered once in a hidden
// box of the printing engine's own content width, their heights are read, the
// pure layPages (domain/sheetPages.js) decides which block stands on which
// page, and every page is then its own box. So no browser table or grid is
// ever split by a printer, and WebKit repeats the header row exactly as
// Chrome does (sketch 010 D29: the design the build keeps by its own means).

// Safari prints one CSS px as 0.8 pt, so its content box is 630 x 900 CSS px
// and every other engine's is 672 x 960 (CONTRACT § 1). The engine is told
// apart by a feature only WebKit has (debug record safari-print-ingredient-
// table, evidence 2026-10-06 14:14); jsdom has no CSS.supports, so it counts as
// the other. The two content boxes are tokens (print.css reads them by the
// print-pages--webkit and print-pages--other classes), never numbers here.
export function printEngine() {
  const supports = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' ? CSS.supports : null;
  return supports && supports.call(CSS, 'font: -apple-system-body') ? 'webkit' : 'other';
}

// What the Sheet prints, read once from the saved version: the table's groups
// and lines through the very same groupPortionsByStep the screen table uses (so
// the order is the screen's), the Before you start notes, and the Total.
export function sheetBlocks(version) {
  const steps = version.method;
  const active = activeRows(version);
  const balance = computeBalance(active);
  const mass = balance ? balance.mass : 0;
  const activeById = new Map(active.map((row) => [row.id, row]));
  const groups = groupPortionsByStep(version.rows, steps, displayNumbers(steps), false);
  // A lone Unallocated head labels nothing (IngredientTable.jsx draws none).
  const showHeads = !(groups.length === 1 && groups[0].kind === 'unallocated');
  return {
    version,
    notes: version.authored.beforeYouStart,
    groups: groups.map((group) => ({
      key: group.kind === 'removed' ? `removed:${group.n}` : String(group.displayNumber ?? 'unallocated'),
      head: showHeads
        ? {
            label: group.kind === 'unallocated' ? 'Unallocated' : group.kind === 'removed' ? 'Removed' : `Step ${group.displayNumber}`,
            leadIn: group.kind === 'unallocated' ? null : group.leadIn,
          }
        : null,
      lines: group.entries.map(({ row, portion, portionIndex }) => {
        // A split ingredient with one line still in reads like a one-line row
        // (the reading branch of IngredientTable.jsx, quick task 261005-cgb).
        const liveRow = activeById.get(row.id) ?? row;
        return {
          key: `${row.id}:${portionIndex}`,
          grams: `${portion.grams} g`,
          name: row.ingredientName,
          flag: dataFlagFor(row),
          note: liveRow.portions.length > 1 ? formatPortionLine(portion.grams, rowGrams(liveRow), mass) : null,
        };
      }),
    })),
    totalText: formatGrams(mass),
    figures: buildFigures(version),
  };
}

// The table in its print form (sketch 010 E1, E2, E6, E7, E8): As made | Grams
// | Ingredient, one tbody per step group headed by the step and its lead-in
// under an ink tick rule, no rule between lines, no tick box, no % of batch;
// the Total closes it once. `groups` are the group slices this page holds;
// `columns`, when given, pin the three column widths measured on the whole
// table so a slice lays exactly as it was measured.
export function PrintIngredientTable({ groups, showHeader, showTotal, totalText, columns = null }) {
  return (
    <table className={columns ? 'ps-table ps-table--pinned' : 'ps-table'}>
      {columns && (
        <colgroup>
          {columns.map((width, i) => (
            <col key={i} style={{ width: `${width}px` }} />
          ))}
        </colgroup>
      )}
      {showHeader && (
        <thead>
          <tr>
            <th scope="col" className="ps-col-asmade">
              As made
            </th>
            <th scope="col" className="ps-col-name" colSpan={2}>
              Ingredient
            </th>
          </tr>
        </thead>
      )}
      {groups.length === 0 && <tbody />}
      {groups.map((group) => (
        <tbody key={group.key} className="ps-group">
          {group.head && (
            <tr className="ps-step-head">
              <td colSpan={3}>
                {group.head.label}
                {group.head.leadIn != null && <span className="ps-step-lead">{group.head.leadIn}</span>}
              </td>
            </tr>
          )}
          {group.lines.map((line) => (
            <tr key={line.key}>
              <td className="ps-col-asmade">
                <span className="ps-asmade" />
              </td>
              <td className="ps-col-grams">{line.grams}</td>
              <td className="ps-col-name">
                {line.name}
                {line.flag && (
                  <span className="target-chip ps-flag">
                    <span className="target-chip__value">{line.flag}</span>
                  </span>
                )}
                {line.note && <span className="ps-note">{line.note}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      ))}
      {showTotal && (
        <tfoot>
          <tr>
            <td className="ps-col-asmade" />
            <td className="ps-col-grams">{totalText}</td>
            <td className="ps-col-name">Total</td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}

// Balance in column 2 (sketch 010 E3, E4, D29): the plain heading, no Hide
// control and no Watch for; the gauges it holds, each whole, drawn static (paper
// has no controls) by the same RuleDrawing the screen button wraps; the basis
// note last. A page that continues Balance carries no heading again. The fat
// gauge's breakdown line is FormulationNote's own sentence.
export function PrintBalance({ figures, gaugeIndexes, showHeading, showBasis, version }) {
  return (
    <section className="ps-balance" aria-label="Balance">
      {showHeading && <h2 className="region-name">Balance</h2>}
      {gaugeIndexes.length > 0 && (
        <div className="formulation-note">
          {gaugeIndexes.map((index) => {
            const figure = figures[index];
            return (
              <div key={figure.key} className="formulation-note__rule">
                <div className="ps-gauge">
                  <RuleDrawing figure={figure} />
                </div>
                {figure.key === 'fat' && (
                  <p className="formulation-note__fat-breakdown">
                    Milkfat {figure.milkfat.toFixed(1)}% and added fat {figure.addedFat.toFixed(1)}% —{' '}
                    {Math.round(figure.addedFatShareOfFat)}% of fat.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
      {showBasis && <BasisNote version={version} />}
    </section>
  );
}

// The groups a page's table holds: each slice names a group and the lines of
// it that stand here, and whether the step head stands with them (a group that
// splits between rows keeps its head with its first line only).
function slicedGroups(blocks, slices) {
  return slices.map(({ group, from, to, head }) => {
    const whole = blocks.groups[group];
    return { ...whole, head: head ? whole.head : null, lines: whole.lines.slice(from, to) };
  });
}

// One page of the Sheet from its plan: the band, Before you start and the row.
// The words are the built page's own (D-00, D-00a): the band is Headnote in
// its reading mode, Before you start is the same NoteList.
export function SheetPage({ plan, blocks, columns = null }) {
  const { table, balance } = plan;
  return (
    <div className="ps-page">
      {plan.band && (
        <div className="ps-band">
          <Headnote version={blocks.version} mode="reading" />
        </div>
      )}
      {plan.before && (
        <section className="ps-before" aria-label="Before you start">
          <h2 className="region-name">Before you start</h2>
          <NoteList listKey="beforeYouStart" notes={blocks.notes} mode="reading" />
        </section>
      )}
      {(table || balance) && (
        <div className="ps-row">
          <div className="ps-col1">
            {table && (
              <section className="ps-ingredients" aria-label="Ingredients">
                {table.heading && <h2 className="region-name">Ingredients</h2>}
                <PrintIngredientTable
                  groups={slicedGroups(blocks, table.slices)}
                  showHeader={table.header}
                  showTotal={table.total}
                  totalText={blocks.totalText}
                  columns={columns}
                />
              </section>
            )}
          </div>
          <div className="ps-col2">
            {balance && (
              <PrintBalance
                figures={blocks.figures}
                gaugeIndexes={balance.gauges}
                showHeading={balance.heading}
                showBasis={balance.basis}
                version={blocks.version}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// The plan that holds everything at once: what the measuring box renders.
function wholePlan(blocks) {
  return {
    band: true,
    before: blocks.notes.length > 0,
    table: {
      heading: true,
      header: true,
      slices: blocks.groups.map((group, i) => ({ group: i, from: 0, to: group.lines.length, head: true })),
      total: true,
    },
    balance: blocks.figures.length > 0 ? { heading: true, gauges: blocks.figures.map((_, i) => i), basis: true } : null,
    bottom: 0,
  };
}

// Reads the measuring box: every block's height in CSS px, the content box's
// height, the three column widths of the whole table and the ratio of the
// page picture's content width to the box's width. It needs a layout engine;
// jsdom has none and answers zeros, which readSheet treats as "one page".
export function readSheet(root) {
  const box = root.querySelector('.ps-box');
  const top = (el) => el.getBoundingClientRect().top;
  const height = (el) => (el ? el.getBoundingClientRect().height : 0);
  const number = (value) => Number.parseFloat(value) || 0;
  const page = box.querySelector('.ps-page');
  const region = box.querySelector('.ps-ingredients');
  const table = box.querySelector('.ps-table');
  const lineRow = table.querySelector('tbody tr:not(.ps-step-head)');
  const balance = box.querySelector('.ps-balance');
  const rules = balance ? [...balance.querySelectorAll('.formulation-note__rule')] : [];
  const basis = balance ? balance.querySelector('.basis-note') : null;
  const measure = {
    band: height(box.querySelector('.ps-band')),
    before: height(box.querySelector('.ps-before')),
    gap: number(getComputedStyle(page).rowGap),
    ingredientsHeading: top(table) - top(region),
    header: height(table.querySelector('thead')),
    total: height(table.querySelector('tfoot')),
    groups: [...table.querySelectorAll('.ps-group')].map((tbody) => {
      const rows = [...tbody.children];
      const hasHead = rows.length > 0 && rows[0].classList.contains('ps-step-head');
      return { head: hasHead ? height(rows[0]) : 0, rows: rows.slice(hasHead ? 1 : 0).map(height) };
    }),
    // The heading and its margin sit above the first gauge; the gauges stand a
    // gap apart; the basis note has its own margin above it.
    balanceHeading: rules.length > 0 ? top(rules[0]) - top(balance) : 0,
    gauges: rules.map(height),
    gaugeGap: rules.length > 1 ? top(rules[1]) - (top(rules[0]) + height(rules[0])) : 0,
    basis: height(basis),
    basisGap: basis ? number(getComputedStyle(basis).marginTop) : 0,
  };
  const boxWidth = box.getBoundingClientRect().width;
  const probeWidth = root.querySelector('.ps-probe').getBoundingClientRect().width;
  return {
    measure,
    height: box.getBoundingClientRect().height,
    columns: lineRow ? [...lineRow.children].map((cell) => cell.getBoundingClientRect().width) : null,
    // One scale takes the box's width to the page picture's content width:
    // 16/15 for Safari's 630, 1 for the 672 of every other engine.
    fit: boxWidth > 0 && probeWidth > 0 ? Math.round((probeWidth / boxWidth) * 100000) / 100000 : 1,
  };
}

// Lays the saved version's Sheet into pages. `version` is null until the
// route has loaded it. `read` is the measuring step (readSheet), a parameter
// so a test can answer fixed heights where jsdom measures nothing. Returns
// { pages, blocks, columns, fit, engine, measureElement }: `pages` is null
// until the heights are read (after the fonts are ready, since a late font
// would move every height); `measureElement` is the hidden box to render once
// in the page, AFTER the pictures, so a hatch pattern id a picture draws is
// the first one the document knows.
export function useSheetPages(version, read = readSheet) {
  const engine = useMemo(printEngine, []);
  const blocks = useMemo(() => (version ? sheetBlocks(version) : null), [version]);
  const rootRef = useRef(null);
  const [laid, setLaid] = useState(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!blocks || !root) {
      setLaid(null);
      return undefined;
    }
    let cancelled = false;
    const lay = () => {
      if (cancelled) return;
      const { measure, height, columns, fit } = read(root);
      // No layout engine (height 0): there is nothing to lay by, so one page
      // holds everything.
      const pages = height > 0 ? layPages(measure, { height }) : [wholePlan(blocks)];
      root.setAttribute('data-ps-measure', JSON.stringify({ measure, height, columns, fit }));
      setLaid({ pages, columns, fit });
    };
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) document.fonts.ready.then(lay);
    else lay();
    return () => {
      cancelled = true;
    };
  }, [blocks, read]);

  const measureElement = blocks ? (
    <div className="ps-measure" aria-hidden="true" ref={rootRef}>
      <div className="ps-box ps-frame">
        <SheetPage plan={wholePlan(blocks)} blocks={blocks} />
      </div>
      <div className="ps-probe" />
    </div>
  ) : null;

  return {
    pages: laid ? laid.pages : null,
    blocks,
    columns: laid ? laid.columns : null,
    fit: laid ? laid.fit : 1,
    engine,
    measureElement,
  };
}
