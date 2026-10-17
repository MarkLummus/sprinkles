import { buildFigures, figureLabelText } from '../domain/figures.js';
import { formatRecordDate, sortedBatches } from '../domain/batch.js';
import { activeRows, activeSteps } from '../domain/rows.js';
import { buildDiff } from '../domain/diff.js';
import { penDraftVersion } from '../domain/penDraft.js';
import { stepsWithStaleAmounts } from '../domain/uses.js';
import { displayNumbers } from '../domain/stepNumbers.js';

// The recipe sheet's derived values (Phase 8, EDIT-05, cut 3, D-03, D-09).
//
// A pure function of its arguments: it imports only domain modules and touches
// no store, DOM or React. sheetView takes a baseline, the version the pen
// compares against. The editing page passes the stored version. Phase 10's
// creation editor passes null, which means no pen diff, no stale steps and no
// baseline step numbers. markedFigure is the signature trace beside it.

// "a, b, and c" — the joining GraduatedRule and BasisNote each keep their own
// copy of; this is the third, for the marked-rows announcement.
function joinNames(names) {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

export function sheetView({ version, baseline, mode, penDraft, parentVersion, showingChanges, batches, batchId }) {
  const hasRows = version.rows.length > 0;
  // The clean reading: every reader that is not the pen's own table takes
  // this, with every removed row and step already absent (RESEARCH.md
  // Pattern 2) — a removed row must never reach buildFigures/computeBalance.
  const readingVersion = { ...version, rows: activeRows(version), method: activeSteps(version) };

  // The draft version (route-recipe-version.md § 3, 03-02): built once,
  // from the version the pen opened on with the draft's values applied, so
  // the pen's own table, the cross-flags (uses.js) and buildDiff all read
  // the same object rather than each reassembling it. A row's portions
  // become the draft's portions with each `grams` parsed through
  // parseGramsDraft, falling back to that portion's own stored amount when
  // the string is blank or does not parse — never 0 or NaN, applied per
  // portion. Unfiltered — a removed row or step still appears here,
  // struck, for the pen's own table; readers that want the clean figures
  // filter through activeRows/activeSteps first.
  const draftVersion = mode === 'developing' && penDraft ? penDraftVersion(version, penDraft) : null;

  // While developing, the six rules and the basis note answer live against
  // the maker's typed grams and removed rows (route-recipe-version.md § 3).
  const liveVersion =
    mode === 'developing' && draftVersion
      ? { ...draftVersion, rows: activeRows(draftVersion), method: activeSteps(draftVersion) }
      : readingVersion;

  const figures = buildFigures(liveVersion);

  // The show-changes diff (route-recipe-version.md § 3, § 6; D-02, T-03-23):
  // one buildDiff of the version against its live parent — the same
  // function the pen uses against its own baseline — computed once here and
  // threaded into every region (the table, the six rules, the method).
  // Absent whenever the toggle itself would be absent: no parent, the
  // parent record unread, or the parameter not present.
  const changeDiff =
    showingChanges && version.parentVersionId && parentVersion ? buildDiff(version, parentVersion) : null;
  const changeStaleSteps = changeDiff ? stepsWithStaleAmounts(version, parentVersion) : [];

  // The pen's own live diff (critique P1 #2, build gap 1): the draft
  // against the version the plan's pen opened on, computed once here —
  // never in Method, never in FormulationNote — from the same buildDiff
  // the show-changes comparison above already uses. This is what lets the
  // rule heads strike the parent figure and draw the hollow tick while the
  // maker is still typing, and what Method reads instead of computing its
  // own comparison a second time per keystroke (RESEARCH.md Don't
  // Hand-Roll).
  const penDiff = mode === 'developing' && draftVersion && baseline ? buildDiff(draftVersion, baseline) : null;
  const penStaleSteps = penDiff ? stepsWithStaleAmounts(draftVersion, baseline) : [];

  // The two step-position maps (domain/stepNumbers.js, 03-10), computed
  // once here and threaded to every region that names a step, the same
  // shape changeDiff already follows: one comparison, computed once, so no
  // two regions can derive a different answer. `current` is built from the
  // method the page is showing — the draft's while the pen is open, the
  // version's own otherwise; a removed step is absent from it by
  // construction, so the same call serves the reading state (where the
  // method handed down is already filtered) and the pen/show-changes
  // (where it is not). `baseline` is what a struck or removed step's
  // number comes from: the record the pen opened on (D-03) while
  // developing, or the live parent while showing changes — null wherever
  // neither state applies, and null in show-changes when the parent could
  // not be read, the same condition that already makes the toggle absent.
  const currentStepNumbers = displayNumbers(mode === 'developing' && draftVersion ? draftVersion.method : version.method);
  const baselineStepNumbers = mode === 'developing' ? (baseline ? displayNumbers(baseline.method) : null) : changeDiff ? displayNumbers(parentVersion.method) : null;

  // The batch this page shows: the one the URL names, or — with no batch
  // named in the URL — the version's newest batch, where a batch stands at its
  // churn date or else the day it was recorded, or null when it has none.
  let openBatch = null;
  if (batchId) {
    openBatch = batches.find((batch) => batch.id === batchId) ?? null;
  } else if (batches.length > 0) {
    openBatch = sortedBatches(batches)[0];
  }

  // A plan pen shows batch evidence only after the maker explicitly cites
  // it. The route's open/latest batch remains the reading-state record;
  // it must not masquerade as the draft's provenance while From batch is
  // still "no batch cited".
  const comparisonBatch =
    mode === 'developing' && penDraft?.citedBatchId
      ? batches.find((batch) => batch.id === penDraft.citedBatchId) ?? null
      : null;
  const evidenceBatch = mode === 'developing' ? comparisonBatch : openBatch;
  const comparisonBatchLabel = comparisonBatch
    ? `Compared with batch · ${comparisonBatch.churn.churnDate ? formatRecordDate(comparisonBatch.churn.churnDate) : 'date unknown'}`
    : null;

  return {
    baseline,
    hasRows,
    readingVersion,
    draftVersion,
    liveVersion,
    figures,
    changeDiff,
    changeStaleSteps,
    penDiff,
    penStaleSteps,
    currentStepNumbers,
    baselineStepNumbers,
    openBatch,
    comparisonBatch,
    evidenceBatch,
    comparisonBatchLabel,
  };
}

// The signature trace over a view (route-recipe.md § 3, § 5): the rows the
// focused figure rests on, its label, and the sentence a screen reader hears.
export function markedFigure(view, focusedFigureKey) {
  const focusedFigure = view.figures.find((figure) => figure.key === focusedFigureKey) ?? null;
  const markedRowIds = focusedFigure?.contributorRowIds ?? [];
  const markedFigureLabel = focusedFigure ? figureLabelText(focusedFigure.label) : '';
  // What a screen reader hears when a rule takes focus (D-20): the rows it
  // marks, in table order, in the words the rows already carry. Empty when no
  // rule is focused or the focused one marks nothing.
  const markedRowNames = [
    ...new Set(view.liveVersion.rows.filter((row) => markedRowIds.includes(row.id)).map((row) => row.ingredientName)),
  ];
  const markedAnnouncement =
    markedRowNames.length > 0 ? `Contributing to ${markedFigureLabel}: ${joinNames(markedRowNames)}` : '';
  return { markedRowIds, markedFigureLabel, markedAnnouncement };
}
