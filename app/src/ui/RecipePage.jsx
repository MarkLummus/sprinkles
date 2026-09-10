import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { repository } from '../store/repository.js';
import { buildFigures } from '../domain/figures.js';
import { createBatch, addTasting, recordAmendment, sortedBatches, isTastingSaveable } from '../domain/batch.js';
import { setMark } from '../domain/axes.js';
import { activeRows, activeSteps } from '../domain/rows.js';
import {
  createChildVersion,
  saveOverVersion,
  versionsForRecipe,
  blockedSaveMessage,
  blockedSaveRowId,
  parseGramsDraft,
} from '../domain/lineage.js';
import { buildDiff } from '../domain/diff.js';
import { stepsWithStaleAmounts } from '../domain/uses.js';
import { displayNumbers } from '../domain/stepNumbers.js';
import { IngredientTable } from './IngredientTable.jsx';
import { Method } from './Method.jsx';
import { Authored } from './Authored.jsx';
import { FormulationNote } from './FormulationNote.jsx';
import { BasisNote } from './BasisNote.jsx';
import { BatchRow } from './BatchRow.jsx';
import { Headnote } from './Headnote.jsx';
import { VersionRow } from './VersionRow.jsx';
import { PenFoot } from './PenFoot.jsx';
import { DerivedAdvisories } from './DerivedAdvisories.jsx';

// Two as-made maps compared by key set and, for a shared key, by their
// arrays element-wise (D-10) — the same presence-over-truthiness
// discipline the rest of this file applies: a row present in one draft
// and absent in the other is a difference, and a portion differing at
// any index is a difference, even when the two arrays share the same
// length (Pitfall 5, every value the raw string the maker typed).
function asMadeMapsDiffer(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return true;
  return aKeys.some((key) => {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return true;
    const aValues = a[key];
    const bValues = b[key];
    if (aValues.length !== bValues.length) return true;
    return aValues.some((value, i) => value !== bValues[i]);
  });
}

// The step-changes map compared by key set and by both fields of each
// entry — an untouched step never rests at a key at all (D-13/BATCH1-01),
// so a key-set difference alone is already a real change.
function stepChangesDiffer(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return true;
  return aKeys.some((key) => {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return true;
    return a[key].struck !== b[key].struck || a[key].line !== b[key].line;
  });
}

// D-24's dirty check: true only while recording holds ink the maker has
// actually typed. Every field is tested against '' / {} rather than
// truthiness, so a written 0 (draft.overrunPercent === '0') still counts as
// dirty — matching the presence-over-truthiness discipline domain/batch.js
// already applies to the stored record.
//
// `baseline` is the draft-shaped object handleStartAmending pre-filled the
// draft from, or null for a fresh recording (03-07, T-03-43): comparing an
// amend draft against blank made it read dirty the instant Amend opened,
// training the maker to dismiss a warning that fires on nothing. With a
// baseline, every field is compared against it instead of against blank —
// the same presence-over-truthiness discipline, applied to the record the
// draft actually started from.
export function isDraftDirty(mode, draft, baseline = null) {
  if (mode !== 'recording' || !draft) return false;
  if (!baseline) {
    return (
      draft.churnDate !== '' ||
      Object.keys(draft.asMade).length > 0 ||
      Object.keys(draft.stepChanges).length > 0 ||
      draft.comeUpMinutes !== '' ||
      draft.drawTempC !== '' ||
      draft.overrunPercent !== '' ||
      draft.drawNotes !== '' ||
      draft.ingredientNotes !== '' ||
      draft.nextTimeNote !== ''
    );
  }
  return (
    draft.churnDate !== baseline.churnDate ||
    draft.comeUpMinutes !== baseline.comeUpMinutes ||
    draft.drawTempC !== baseline.drawTempC ||
    draft.overrunPercent !== baseline.overrunPercent ||
    draft.drawNotes !== baseline.drawNotes ||
    draft.ingredientNotes !== baseline.ingredientNotes ||
    draft.nextTimeNote !== baseline.nextTimeNote ||
    asMadeMapsDiffer(draft.asMade, baseline.asMade) ||
    stepChangesDiffer(draft.stepChanges, baseline.stepChanges)
  );
}

// The same presence-over-truthiness dirty check, extended to an
// in-progress tasting (D-24's "unsaved ink" applies to a tasting draft
// exactly as it does to the churn draft above).
function isTastingDraftDirty(tastingDraft) {
  if (!tastingDraft) return false;
  return (
    tastingDraft.date !== '' ||
    Object.keys(tastingDraft.marks).length > 0 ||
    tastingDraft.tastingTempC !== '' ||
    tastingDraft.meltdownLossG !== '' ||
    tastingDraft.words !== '' ||
    tastingDraft.nextTimeNote !== ''
  );
}

// An absent optional field and an empty-string one are the same fact —
// nothing written — normalised on both sides before comparing, exactly as
// diff.js's buildStepDiff does for the same two fields (03-09, T-03-54): a
// first keystroke into an empty purpose/aside, deleted again, must not
// read as ink.
function normalizedText(value) {
  return value ?? '';
}

// A uses list compared as a set — order is not a fact the maker authored
// (route-recipe-version.md § 3).
function usesListsDiffer(a = [], b = []) {
  if (a.length !== b.length) return true;
  const bSet = new Set(b);
  return a.some((rowId) => !bSet.has(rowId));
}

// Targets compared by position, on both label and value — matching
// handleChangePenStepTarget's own matching rule (by index, not by label).
function targetsDiffer(a = [], b = []) {
  if (a.length !== b.length) return true;
  return a.some((target, index) => target.label !== b[index].label || target.value !== b[index].value);
}

// A step is ink the instant any of its seven writers has moved it: the
// four text fields, its removed flag, its uses list, or a target.
function isStepDirty(draftStep, baseStep) {
  return (
    draftStep.leadIn !== baseStep.leadIn ||
    draftStep.instruction !== baseStep.instruction ||
    normalizedText(draftStep.purpose) !== normalizedText(baseStep.purpose) ||
    normalizedText(draftStep.aside) !== normalizedText(baseStep.aside) ||
    (draftStep.removed ?? false) !== (baseStep.removed ?? false) ||
    usesListsDiffer(draftStep.uses, baseStep.uses) ||
    targetsDiffer(draftStep.targets, baseStep.targets)
  );
}

// An authored list is ink when its length differs or any note's text
// differs at the same index — inheritedFrom is not compared: the page
// derives it from the text (handleChangePenNoteText), so text equality
// already decides it.
function isAuthoredListDirty(draftList, baseList) {
  if (draftList.length !== baseList.length) return true;
  return draftList.some((note, index) => note.text !== baseList[index].text);
}

// The pen's own dirty check (route-recipe-version.md § 6, D-24's
// "unsaved ink" principle carried to the plan's pen): every field tested
// against '' / null / the version's own values, never truthiness, so a
// grams field typed back to the version's own value counts as clean again.
// A row's draft entry is { portions: [{ step, grams }], removed } (D-01,
// D-02) — dirty if the removed flag differs, or if any portion's raw
// string or step differs from that portion's own value, in order.
//
// Extended (03-07, T-03-42) to the three fields the pen spends most of its
// time editing — method, headnote, authored — which this check omitted
// entirely: a maker who rewrote a step's prose or an authored note and
// then reloaded lost it with no warning of any kind.
export function isPenDraftDirty(mode, penDraft, version) {
  if (mode !== 'developing' || !penDraft || !version) return false;
  if (penDraft.versionLabel !== '') return true;
  if (penDraft.reason !== '') return true;
  if (penDraft.citedBatchId !== null) return true;
  if (penDraft.headnote !== version.headnote) return true;
  const rowsDirty = version.rows.some((row) => {
    const draftRow = penDraft.rows[row.id];
    if (draftRow.removed !== (row.removed ?? false)) return true;
    return row.portions.some((portion, i) => {
      const draftPortion = draftRow.portions[i];
      return draftPortion.grams !== String(portion.grams) || draftPortion.step !== portion.step;
    });
  });
  if (rowsDirty) return true;
  const methodDirty = version.method.some((step) => {
    const draftStep = penDraft.method.find((candidate) => candidate.n === step.n);
    return isStepDirty(draftStep, step);
  });
  if (methodDirty) return true;
  if (isAuthoredListDirty(penDraft.authored.carriedForward, version.authored.carriedForward)) return true;
  if (isAuthoredListDirty(penDraft.authored.beforeYouStart, version.authored.beforeYouStart)) return true;
  return false;
}

// "A pen is open" used to live in two unrelated states — `mode`
// ('reading'|'recording'|'developing') and `tastingDraft` (null|object) —
// and every disabled condition in Headnote and BatchMargin hand-rolled its
// own subset of those two. Neither could see the tasting pen at all, since
// `tastingDraft` was never folded into `mode` or threaded to Headnote
// (D-UAT-1). This is the one derivation: `openPen` names which of the four
// pens — `plan`, `record`, `amend`, `tasting` — currently holds the page,
// or is `null` when none does; `reason` is the words-form counterpart D-10
// requires beside every control that pen disables ("never just visually
// implied"). An if-chain, not a lookup table (T-02-32's discipline against
// a bare bracket read against a key), so the four reason strings stay
// visible at the site that decides them.
export function derivePenState({ mode, amendingBatchId, tastingDraft }) {
  if (mode === 'developing') {
    return { openPen: 'plan', reason: 'the plan is being developed' };
  }
  if (mode === 'recording') {
    if (amendingBatchId) {
      return { openPen: 'amend', reason: 'a batch is being amended' };
    }
    return { openPen: 'record', reason: 'a batch is being recorded' };
  }
  if (tastingDraft) {
    return { openPen: 'tasting', reason: 'a tasting is being written' };
  }
  return { openPen: null, reason: null };
}

// A field the maker left blank and a field holding ink that is not a
// number are the same fact — nothing written — and neither may become a
// stored NaN, which readMeasured would print as the word "NaN" in the
// record forever. A written 0 is a value, not an absence, and still
// returns 0 (260909-oox).
export function toNumberOrNull(raw) {
  if (raw === '') return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

// The brief's book spread, in semantic regions, each wearing its
// plain-language name. The margin's derived-advisories block (FORM2-02)
// renders nothing visible when the version has none — no placeholder text.
export function RecipePage() {
  const { id, batchId } = useParams();
  const navigate = useNavigate();
  // The fork's landing focus signal (D-27): read once, here, so Versions
  // stays prop-driven and testable without a router state of its own.
  const location = useLocation();
  const focusDevelopOnMount = Boolean(location.state?.focusDevelop);
  // The show-changes state (D-02): on when the `changes` key is present in
  // the URL's search parameters at all — its value is never consulted, so
  // presence is the whole signal. Composes with both /recipe/:id and
  // /recipe/:id/batch/:batchId with no new route, since both already
  // resolve to this component. setSearchParams's default history behaviour
  // (a push, not a replace) is left alone: that is what makes the browser's
  // own back button return to the clean reading, with no extra code.
  const [searchParams, setSearchParams] = useSearchParams();
  const showingChanges = searchParams.has('changes');
  const [version, setVersion] = useState(undefined);
  const [versions, setVersions] = useState([]);
  const [batches, setBatches] = useState([]);
  // The signature trace (route-recipe.md § 3, § 5): focusing a balance
  // figure marks the ingredient rows it rests on. This page is the shared
  // parent of the figures and the table, so it is the one place the
  // focused figure's key can live.
  const [focusedFigureKey, setFocusedFigureKey] = useState(null);
  // The pen layer's state (route-recipe-batch.md § 3): a mode, one of
  // 'reading' | 'recording' | 'developing', and the draft form state it is
  // recorded into. mode is never derived from the URL — only the margin's
  // own control, and now the headnote's, ask for it (D-19).
  const [mode, setMode] = useState('reading');
  const [draft, setDraft] = useState(null);
  // The in-progress tasting's own draft state, alongside the churn draft
  // above (task 1). A tasting is added to an already-saved batch, so
  // setting it never touches `mode`/`draft`, the churn recording state —
  // but it is no longer treated as separate from them: derivePenState
  // above folds all three into the one "a pen is open" fact (D-UAT-1).
  const [tastingDraft, setTastingDraft] = useState(null);
  // Non-null while `mode === 'recording'` means the pen layer is amending
  // this existing batch's churn fields, rather than recording a new one
  // (task 3, D-06). Amending pre-fills the fields from the batch, never
  // from the version, and saving calls recordAmendment, never createBatch.
  const [amendingBatchId, setAmendingBatchId] = useState(null);
  // The draft-shaped object handleStartAmending pre-filled `draft` from
  // (03-07, T-03-43) — the baseline isDraftDirty compares an amend draft
  // against, instead of blank. Cleared everywhere amendingBatchId is
  // cleared, for the same class of reason (T-02-24): a stale baseline left
  // over from a prior amendment would make a fresh recording's own dirty
  // check compare against the wrong record.
  const [amendBaseline, setAmendBaseline] = useState(null);
  // The plan's own pen draft (03-CONTEXT.md D-01 to D-10): version line,
  // reason, citation and headnote start blank/null — never defaulted from
  // the parent — while rows is a map keyed by row id holding the raw
  // string the maker typed for grams, the draft.asMade precedent (never
  // Number() on keystroke, so a value typed finer than the display
  // survives, RESEARCH.md Pitfall 5).
  const [penDraft, setPenDraft] = useState(null);
  const [blockedMessage, setBlockedMessage] = useState(null);
  // The offending field a blocked save names (critique P1 #3, D-21): the
  // version-line field, or a row's grams field by id — read by
  // IngredientTable and Versions to mark and focus exactly the field
  // blockedSaveMessage's own sentence names, and cleared everywhere
  // blockedMessage is cleared so the two can never point at different
  // fields.
  const [blockedTarget, setBlockedTarget] = useState(null);
  // WR-01's fix (03.1 REVIEW.md, Versions.jsx's half): an incrementing
  // counter, stamped onto blockedTarget on every blocked buildPenFields
  // call, so a second consecutive blocked save on the same field re-fires
  // VersionRow's focus-return effect — a value-equal boolean cannot.
  const blockedAttemptRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    repository.getVersion(id).then((result) => {
      if (!cancelled) setVersion(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    repository.listBatchesForVersion(id).then((result) => {
      if (!cancelled) setBatches(result);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Every stored version, loaded once beside the two effects above — the
  // strip (03-03) and the version-line uniqueness check (D-04) both read
  // this list.
  useEffect(() => {
    let cancelled = false;
    repository.listVersions().then((result) => {
      if (!cancelled) setVersions(result);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // The cited batch this version's lineage line names (route-recipe-version.md
  // § 3): citedBatchId is an id only — the batch itself lives on the
  // parent, never copied onto the child — so its churn date is read once
  // per version here, purely to render the lineage line's date-linked
  // clause.
  const [citedBatch, setCitedBatch] = useState(null);
  useEffect(() => {
    let cancelled = false;
    if (!version || !version.citedBatchId) {
      setCitedBatch(null);
      return undefined;
    }
    repository.getBatch(version.citedBatchId).then((result) => {
      if (!cancelled) setCitedBatch(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [version]);

  // The live parent read (T-03-23, T-03-24): show-changes reads the parent
  // record through the repository at render time, never a copy stored on
  // the child, so a parent saved over afterwards is reflected rather than
  // frozen. Held as null when the version has no parent, or when the read
  // comes back with nothing — either way the toggle is absent and the
  // lineage line still names the parent from the child's own
  // parentVersionLabel snapshot (D-10).
  const [parentVersion, setParentVersion] = useState(null);
  useEffect(() => {
    let cancelled = false;
    if (!version || !version.parentVersionId) {
      setParentVersion(null);
      return undefined;
    }
    repository.getVersion(version.parentVersionId).then((result) => {
      if (!cancelled) setParentVersion(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [version]);

  // The version ids that have at least one batch, for the strip's
  // "churned" word (route-recipe-version.md § 3, 03-03) — one
  // repository.getAllBatches() read, not a query per version, since the
  // realistic range is 1–6 versions per recipe this milestone.
  const [versionIdsWithBatches, setVersionIdsWithBatches] = useState(new Set());
  useEffect(() => {
    let cancelled = false;
    repository.getAllBatches().then((allBatches) => {
      if (!cancelled) setVersionIdsWithBatches(new Set(allBatches.map((batch) => batch.versionId)));
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // D-24: leaving the page with unsaved ink uses the browser's own leave
  // warning only, registered while recording, tasting, or the plan's pen
  // holds a dirty draft, and removed as soon as none does — no invented
  // dialog, no draft persistence across a reload (that is UX1-02, Phase 4).
  useEffect(() => {
    if (
      !isDraftDirty(mode, draft, amendBaseline) &&
      !isTastingDraftDirty(tastingDraft) &&
      !isPenDraftDirty(mode, penDraft, version)
    ) {
      return undefined;
    }
    const handleBeforeUnload = (event) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [mode, draft, amendBaseline, tastingDraft, penDraft, version]);

  // Escape (D-27): closes only an untouched pen, and does nothing at all
  // once the pen holds ink — Cancel is the one exit, so a stray key can
  // never discard a sheet of transcription. Registered on `document`, not
  // the article, so an Escape pressed while focus rests on `body` (the
  // state the critique found batch Cancel leaving behind) still closes
  // the pen. Reads the same three dirty checks the beforeunload guard
  // above already reads — introducing no fourth notion of dirtiness.
  // openPen is recomputed here via derivePenState (not read as an outer
  // variable) because this effect must sit above the early returns below,
  // where the page-level openPen constant does not exist yet.
  useEffect(() => {
    const { openPen: escapeOpenPen } = derivePenState({ mode, amendingBatchId, tastingDraft });
    if (escapeOpenPen === null) return undefined;
    function handleKeyDown(event) {
      if (event.key !== 'Escape') return;
      if (escapeOpenPen === 'plan' && !isPenDraftDirty(mode, penDraft, version)) {
        handleCancelDeveloping();
      } else if ((escapeOpenPen === 'record' || escapeOpenPen === 'amend') && !isDraftDirty(mode, draft, amendBaseline)) {
        handleCancelRecording();
      } else if (escapeOpenPen === 'tasting' && !isTastingDraftDirty(tastingDraft)) {
        handleCancelTasting();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mode, amendingBatchId, tastingDraft, penDraft, version, draft, amendBaseline]);

  if (version === undefined) return null;
  // The running head is the way home in every state, including this one
  // (route-recipe-version.md § 4): it identifies the book, never carries
  // status, and never changes with state. A mistyped or since-removed
  // version id is no longer a dead end.
  if (version === null) {
    return (
      <>
        <p className="running-head">
          <Link to="/">Sprinkles</Link>
        </p>
        <div className="not-found">
          <p>No recipe found for this version.</p>
          <Link to="/">Back to the recipe list</Link>
        </div>
      </>
    );
  }

  // The one call site (D-UAT-1): every control that disables while a pen
  // is open reads openPen/penReason from here, never mode or tastingDraft
  // directly.
  const { openPen, reason: penReason } = derivePenState({ mode, amendingBatchId, tastingDraft });

  // D-01: on any version with no batch recorded, both saves are offered;
  // on a churned version only Save (a fork) exists, so a churned
  // version's own record is never written to (D04). Computed once here
  // and passed to both Versions' ceremony and PenFoot's repeated pair —
  // never twice (RESEARCH.md Pattern 2).
  const canSaveOver = batches.length === 0;

  // The save gate, one derivation beside canSaveOver (T-03.1-08): the
  // tasting pen's Save is gated on isTastingSaveable, exactly as
  // TastingForm computed it locally before this plan; every other pen's
  // Save stays enabled (D-21's own blocked-but-enabled rule covers the
  // plan pen; the batch pen has never gated its Save). penHint carries
  // the tasting's own hint sentence while that gate is active, and
  // blockedMessage (the plan pen's own blocked-save sentence) otherwise —
  // both are passed to Versions' ceremony and to PenFoot, so the two
  // screen positions can never disagree (RESEARCH.md Anti-Patterns).
  const penSaveDisabled =
    openPen === 'tasting' && tastingDraft
      ? !isTastingSaveable({ words: tastingDraft.words, marks: tastingDraft.marks })
      : false;
  const penHint = penSaveDisabled ? 'Write words or mark at least one axis to save.' : blockedMessage;

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
  const draftVersion =
    mode === 'developing' && penDraft
      ? {
          ...version,
          rows: version.rows.map((row) => {
            const draftRow = penDraft.rows[row.id];
            return {
              ...row,
              portions: row.portions.map((portion, i) => {
                const draftPortion = draftRow.portions[i];
                return { step: draftPortion.step, grams: parseGramsDraft(draftPortion.grams) ?? portion.grams };
              }),
              removed: draftRow.removed,
            };
          }),
          method: penDraft.method,
          headnote: penDraft.headnote,
          authored: penDraft.authored,
        }
      : null;

  // While developing, the six rules and the basis note answer live against
  // the maker's typed grams and removed rows (route-recipe-version.md § 3).
  const liveVersion =
    mode === 'developing' && draftVersion
      ? { ...draftVersion, rows: activeRows(draftVersion), method: activeSteps(draftVersion) }
      : readingVersion;

  const figures = buildFigures(liveVersion);
  const focusedFigure = figures.find((figure) => figure.key === focusedFigureKey) ?? null;
  const markedRowIds = focusedFigure?.contributorRowIds ?? [];
  const markedFigureLabel = focusedFigure?.label ?? '';

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
  const penDiff = mode === 'developing' && draftVersion ? buildDiff(draftVersion, version) : null;
  const penStaleSteps = penDiff ? stepsWithStaleAmounts(draftVersion, version) : [];

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
  const baselineStepNumbers = mode === 'developing' ? displayNumbers(version.method) : changeDiff ? displayNumbers(parentVersion.method) : null;

  // The batch this page shows: the one the URL names, or — with no batch
  // named in the URL — the version's most recent batch by churn date,
  // undated last, or null when the version has no batch yet.
  let openBatch = null;
  if (batchId) {
    openBatch = batches.find((batch) => batch.id === batchId) ?? null;
  } else if (batches.length > 0) {
    openBatch = sortedBatches(batches)[0];
  }

  // Clearing the amend target here is load-bearing, not redundant: without
  // it, a maker who amends and then starts a fresh recording would leave
  // amendingBatchId set from the earlier amendment, so handleSaveBatch
  // would take the amend path — overwriting the amended batch's churn and
  // stamping a false amendment date on it, while the new batch is never
  // created (T-02-24).
  function handleStartRecording() {
    setAmendingBatchId(null);
    setAmendBaseline(null);
    setDraft({
      churnDate: '',
      asMade: {},
      stepChanges: {},
      comeUpMinutes: '',
      drawTempC: '',
      overrunPercent: '',
      drawNotes: '',
      ingredientNotes: '',
      nextTimeNote: '',
    });
    setMode('recording');
  }

  // A generic setter for the churn section's remaining fields (D-17, D-18):
  // each stores the raw string the maker typed while recording, exactly as
  // the as-made column already does, so the maker's typed precision is
  // never lost to an early Number() coercion — the conversion (and the
  // '' -> null discipline) happens once, at save time.
  function handleChangeChurnField(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  // Clearing both the strike and the line for a step removes that step's
  // key from the draft entirely (D-13/BATCH1-01): an untouched step must
  // never rest at { struck: false, line: null }, which would be
  // indistinguishable from a step the maker deliberately marked as
  // unchanged — a fact this record never states.
  function handleChangeStepChange(stepNumber, patch) {
    setDraft((prev) => {
      const stepChanges = { ...prev.stepChanges };
      const key = String(stepNumber);
      if (!patch.struck && !patch.line) {
        delete stepChanges[key];
      } else {
        stepChanges[key] = { struck: patch.struck, line: patch.line };
      }
      return { ...prev, stepChanges };
    });
  }

  function handleChangeChurnDate(value) {
    setDraft((prev) => ({ ...prev, churnDate: value }));
  }

  // Writes one portion's raw string (D-10). A row with no key yet is
  // seeded with an array of empty strings the length of that row's own
  // portions first, so the array is always aligned with row.portions —
  // the same alignment contract asMadeForPortion reads. Once every
  // portion of a row is back to an empty string, the row's key is deleted
  // entirely — the existing "an empty field means nothing was written"
  // rule (D-13/BATCH1-01), applied at the row level as it is today.
  function handleChangeAsMade(rowId, portionIndex, rawValue) {
    setDraft((prev) => {
      const asMade = { ...prev.asMade };
      const row = version.rows.find((candidate) => candidate.id === rowId);
      const existing = Object.prototype.hasOwnProperty.call(asMade, rowId) ? asMade[rowId] : null;
      const next = existing ? [...existing] : new Array(row.portions.length).fill('');
      next[portionIndex] = rawValue;
      if (next.every((value) => value === '')) {
        delete asMade[rowId];
      } else {
        asMade[rowId] = next;
      }
      return { ...prev, asMade };
    });
  }

  // "Amend" reopens the pen layer with the record's own values in the
  // fields — the as-made column, the step strikes and lines, and the
  // churn section, all pre-filled from the batch, never from the version
  // (task 3). Every draft field is the string form the recording inputs
  // already expect, matching handleStartRecording's shape.
  function handleStartAmending(batch) {
    const asMade = {};
    for (const [rowId, values] of Object.entries(batch.churn.asMade)) {
      asMade[rowId] = values.map((value) => (value === null ? '' : String(value)));
    }
    const toDraftString = (value) => (value == null ? '' : String(value));
    const filledDraft = {
      churnDate: batch.churn.churnDate ?? '',
      asMade,
      stepChanges: structuredClone(batch.churn.stepChanges),
      comeUpMinutes: toDraftString(batch.churn.comeUpMinutes),
      drawTempC: toDraftString(batch.churn.drawTempC),
      overrunPercent: toDraftString(batch.churn.overrunPercent),
      drawNotes: batch.churn.drawNotes ?? '',
      ingredientNotes: batch.churn.ingredientNotes ?? '',
      nextTimeNote: batch.churn.nextTimeNote ?? '',
    };
    setDraft(filledDraft);
    // The baseline isDraftDirty compares against (03-07, T-03-43) — a
    // separate clone, not the same object setDraft was just given, so a
    // later edit to draft (always a new object via setDraft's own spread)
    // can never be mistaken for a mutation of the baseline itself.
    setAmendBaseline(structuredClone(filledDraft));
    setAmendingBatchId(batch.id);
    setMode('recording');
  }

  // The two impure calls (a fresh id, the current instant) live here, in
  // the one save handler — every domain function stays deterministic.
  // Amending (amendingBatchId set) calls recordAmendment on the batch
  // being amended instead of createBatch — a correction is never a new
  // event and never retakes the snapshot (D-06).
  function handleSaveBatch() {
    // Each portion parses through parseGramsDraft (D-10): a value the
    // grams rule rejects (a stray letter, a lone space, a leading minus,
    // exponent notation, more than two decimals) or a blank portion
    // becomes null — the same fact as a portion the maker never touched,
    // never a stored NaN (D-11, D-18). A row whose every portion resolves
    // to null drops its key entirely, preserving the existing rule that a
    // row that fails to parse reads exactly like a row never touched.
    const asMade = {};
    for (const [rowId, rawValues] of Object.entries(draft.asMade)) {
      const parsedValues = rawValues.map((rawValue) => parseGramsDraft(rawValue));
      if (parsedValues.some((value) => value !== null)) asMade[rowId] = parsedValues;
    }
    const toTextOrNull = (raw) => (raw === '' ? null : raw);
    const churnFields = {
      churnDate: draft.churnDate === '' ? null : draft.churnDate,
      asMade,
      stepChanges: draft.stepChanges,
      comeUpMinutes: toNumberOrNull(draft.comeUpMinutes),
      drawTempC: toNumberOrNull(draft.drawTempC),
      overrunPercent: toNumberOrNull(draft.overrunPercent),
      drawNotes: toTextOrNull(draft.drawNotes),
      ingredientNotes: toTextOrNull(draft.ingredientNotes),
      nextTimeNote: toTextOrNull(draft.nextTimeNote),
    };

    if (amendingBatchId) {
      const batchBeingAmended = batches.find((batch) => batch.id === amendingBatchId);
      const amendedAt = new Date().toISOString().slice(0, 10);
      const record = recordAmendment(batchBeingAmended, churnFields, amendedAt);
      repository.saveBatch(record).then(() => {
        setBatches((prev) => prev.map((batch) => (batch.id === record.id ? record : batch)));
        setMode('reading');
        setDraft(null);
        setAmendingBatchId(null);
        setAmendBaseline(null);
      });
      return;
    }

    const record = createBatch(version, churnFields, { id: crypto.randomUUID(), now: new Date().toISOString() });

    repository.saveBatch(record).then(() => {
      setBatches((prev) => [...prev, record]);
      setMode('reading');
      setDraft(null);
      setAmendBaseline(null);
      navigate(`/recipe/${id}/batch/${record.id}`);
    });
  }

  // The deliberate, in-app abandonment path (A-1): returns to reading,
  // drops the draft, and clears the amend target, writing nothing. This is
  // distinct from D-24's beforeunload warning, which only guards
  // accidental loss on document unload — the brief conflated the two, but
  // they are different requirements (see pen-layer-no-cancel-save-hard-to-find.md).
  // Nothing needs to navigate: the batch on screen is derived from the URL
  // and the loaded batch list, never from the draft, so the page already
  // shows the right thing once mode returns to reading.
  function handleCancelRecording() {
    setMode('reading');
    setDraft(null);
    setAmendingBatchId(null);
    setAmendBaseline(null);
  }

  function handleStartTasting() {
    setTastingDraft({
      date: '',
      tastingTempC: '',
      marks: {},
      meltdownLossG: '',
      words: '',
      nextTimeNote: '',
    });
  }

  // Discards silently, exactly as the churn Cancel does (handleCancelRecording
  // above): the brief forbids a dialog of the app's own for leaving with
  // unsaved ink (route-recipe-batch.md § 6). The beforeunload guard needs no
  // change here — isTastingDraftDirty(null) is already false, so the effect
  // above removes the listener on its own once tastingDraft goes null.
  function handleCancelTasting() {
    setTastingDraft(null);
  }

  function handleChangeTastingField(field, value) {
    setTastingDraft((prev) => ({ ...prev, [field]: value }));
  }

  // Clearing is a first-class move on this control (G-02-6), not an
  // omission: setMark writes the draft's marks through the one rule that
  // handles both the set and the clear, so this handler gains a delete
  // path without gaining a branch. A marks object holds a key only for a
  // marked axis, so clearing the last mark is what returns the save gate
  // (isTastingSaveable) and its hint to their pre-mark state.
  function handleChangeTastingMark(axisKey, stop) {
    setTastingDraft((prev) => ({ ...prev, marks: setMark(prev.marks, axisKey, stop) }));
  }

  // D-05's shortcut: writes exactly those words into the tasting's words
  // field and sets nothing else.
  function handleUseAsExpectedShortcut() {
    setTastingDraft((prev) => ({ ...prev, words: 'As expected, nothing to note' }));
  }

  // The two impure calls live here, in the one save handler — addTasting
  // itself stays deterministic. Reloads the version's batch list after the
  // write so the margin re-reads what is stored.
  function handleSaveTasting() {
    const toTextOrNull = (raw) => (raw === '' ? null : raw);
    const tastingFields = {
      date: tastingDraft.date === '' ? null : tastingDraft.date,
      tastingTempC: toNumberOrNull(tastingDraft.tastingTempC),
      marks: tastingDraft.marks,
      meltdownLossG: toNumberOrNull(tastingDraft.meltdownLossG),
      words: toTextOrNull(tastingDraft.words),
      nextTimeNote: toTextOrNull(tastingDraft.nextTimeNote),
    };
    const updated = addTasting(openBatch, tastingFields, { id: crypto.randomUUID() });

    repository.saveBatch(updated).then(() => repository.listBatchesForVersion(id)).then((reloaded) => {
      setBatches(reloaded);
      setTastingDraft(null);
    });
  }

  // Seeds penDraft from the version the pen opened on — a row's own
  // portions mapped to { step, grams }, each grams a string (Pitfall 5),
  // everything else the maker's own to write, never defaulted from the
  // parent (D-10: no default reason, citation, or version line). Never
  // touches draft or amendingBatchId — mode alone still decides which of
  // developing/recording is live; derivePenState above is what now
  // decides availability everywhere else (RESEARCH.md Pattern 4).
  function handleStartDeveloping() {
    const rows = {};
    for (const row of version.rows) {
      rows[row.id] = {
        portions: row.portions.map((portion) => ({ step: portion.step, grams: String(portion.grams) })),
        removed: row.removed ?? false,
      };
    }
    setPenDraft({
      versionLabel: '',
      reason: '',
      citedBatchId: null,
      headnote: version.headnote,
      rows,
      method: structuredClone(version.method),
      authored: structuredClone(version.authored),
    });
    setBlockedMessage(null);
    setBlockedTarget(null);
    setMode('developing');
  }

  // The show-changes toggle (D-02): adds or deletes the `changes` key,
  // building a new URLSearchParams from the previous one rather than
  // mutating it, and leaving setSearchParams's default push behaviour
  // alone so the browser's own back button returns to the clean reading.
  function handleToggleShowChanges() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (next.has('changes')) next.delete('changes');
      else next.set('changes', '');
      return next;
    });
  }

  // Discards with no dialog of the app's own (D-10) — mirrors
  // handleCancelRecording exactly.
  function handleCancelDeveloping() {
    setMode('reading');
    setPenDraft(null);
    setBlockedMessage(null);
    setBlockedTarget(null);
  }

  function handleChangePenField(field, value) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({ ...prev, [field]: value }));
  }

  // Writes exactly one portion's raw typed string, leaving every other
  // portion and the removed flag untouched — the pen's amounts edit, the
  // split does not (CONTEXT.md phase boundary).
  function handleChangePenGrams(rowId, portionIndex, value) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      rows: {
        ...prev.rows,
        [rowId]: {
          ...prev.rows[rowId],
          portions: prev.rows[rowId].portions.map((portion, i) =>
            i === portionIndex ? { ...portion, grams: value } : portion,
          ),
        },
      },
    }));
  }

  // Removing sets only the draft row's removed flag — it does not clear
  // the grams and does not touch any step (route-recipe-version.md § 3).
  // The same handler restores: removal never cascades, so this is always
  // the maker's own tap, whether flipping a row's own control or the
  // orphaned-row flag's "remove this row" control.
  function handleTogglePenRowRemoved(rowId) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      rows: { ...prev.rows, [rowId]: { ...prev.rows[rowId], removed: !prev.rows[rowId].removed } },
    }));
  }

  // A step field setter for leadIn/instruction/purpose/aside (03-02):
  // `field` is always one of these four literal strings supplied by this
  // file's own call sites, never a maker-influenced key, so a computed
  // property name here carries no T-02-32 risk.
  function handleChangePenStepField(stepN, field, value) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      method: prev.method.map((step) => (step.n === stepN ? { ...step, [field]: value } : step)),
    }));
  }

  // A target chip's label or value, matched by its index within the
  // step's own targets array rather than by label — a label can itself be
  // mid-edit, so matching by index avoids two chips momentarily colliding
  // on the same label while the maker types.
  function handleChangePenStepTarget(stepN, targetIndex, field, value) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      method: prev.method.map((step) => {
        if (step.n !== stepN) return step;
        const targets = step.targets.map((target, index) => (index === targetIndex ? { ...target, [field]: value } : target));
        return { ...step, targets };
      }),
    }));
  }

  // The step's uses list, written through a filter and a concat
  // (route-recipe-version.md § 3), never a bare bracket write — a
  // different fact from the row's own step allocation, and both are kept.
  function handleTogglePenStepUses(stepN, rowId) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      method: prev.method.map((step) => {
        if (step.n !== stepN) return step;
        const uses = step.uses ?? [];
        const nextUses = uses.includes(rowId) ? uses.filter((id) => id !== rowId) : uses.concat(rowId);
        return { ...step, uses: nextUses };
      }),
    }));
  }

  // Removing sets only the draft step's removed flag — removal never
  // cascades, so this is always the maker's own tap, whether flipping a
  // step's own control or the removed-row cross-flag's "remove this step"
  // control.
  function handleTogglePenStepRemoved(stepN) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      method: prev.method.map((step) => (step.n === stepN ? { ...step, removed: !step.removed } : step)),
    }));
  }

  // An authored note's text, and the inherited-from marker it carries
  // (route-recipe-version.md, "Inherited notes"): the marker persists when
  // the edited text still equals the text this version inherited it with,
  // and clears the instant it differs — computed once, here, so every
  // reader (Authored.jsx included) can read `note.inheritedFrom` directly
  // rather than re-deriving it.
  function handleChangePenNoteText(listKey, index, value) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => {
      const originalNote = version.authored[listKey][index];
      const notes = prev.authored[listKey].map((note, i) =>
        i === index
          ? { ...note, text: value, inheritedFrom: value === originalNote.text ? originalNote.inheritedFrom : null }
          : note,
      );
      return { ...prev, authored: { ...prev.authored, [listKey]: notes } };
    });
  }

  // A note can be removed per note (route-recipe-version.md § 3) — an
  // outright removal from the list, not a struck-in-place flag: an
  // authored note carries no cross-flag concern the way a row or step does.
  function handleRemovePenNote(listKey, index) {
    setBlockedMessage(null);
    setBlockedTarget(null);
    setPenDraft((prev) => ({
      ...prev,
      authored: { ...prev.authored, [listKey]: prev.authored[listKey].filter((_, i) => i !== index) },
    }));
  }

  // Shared by both save paths: the one message that blocks the save is
  // computed by the tested domain function (D-04) — the same sentence can
  // never drift between the two save controls. `excludeId` scopes the
  // uniqueness check: null for a fresh child (compared against every
  // version of the recipe, including the one the pen opened on), the
  // current version's own id for a save-over (so keeping its own line
  // never reads as a collision with itself). Returns null when blocked, or
  // the pen's fields coerced for the domain constructor (rows' grams
  // strings are Number()'d here, at save time, never on keystroke —
  // Pitfall 5). A reason of nothing but whitespace is treated as blank and
  // stored as null, exactly as an empty reason already was.
  function buildPenFields(excludeId) {
    const scopedVersions = versionsForRecipe(versions, version.recipeId).filter((v) => v.id !== excludeId);
    const message = blockedSaveMessage(penDraft, version, scopedVersions);
    if (message) {
      setBlockedMessage(message);
      // D-21: the same traversal that named the message also names the
      // row it blocked on, so the two can never disagree (T-03.1-21) — a
      // row id marks and focuses that row's grams field; no row id means
      // the block is the version line's own. blockedAttemptRef increments
      // on every blocked press (WR-01) so a second consecutive block on
      // the same field still moves focus.
      const rowId = blockedSaveRowId(penDraft, version, scopedVersions);
      blockedAttemptRef.current += 1;
      setBlockedTarget(
        rowId ? { kind: 'row', rowId, attempt: blockedAttemptRef.current } : { kind: 'versionLine', attempt: blockedAttemptRef.current },
      );
      return null;
    }
    const rows = version.rows.map((row) => {
      const draftRow = penDraft.rows[row.id];
      return {
        ...row,
        portions: row.portions.map((portion, i) => {
          const draftPortion = draftRow.portions[i];
          return { step: draftPortion.step, grams: parseGramsDraft(draftPortion.grams) ?? portion.grams };
        }),
        removed: draftRow.removed,
      };
    });
    return {
      versionLabel: penDraft.versionLabel,
      reason: penDraft.reason.trim() === '' ? null : penDraft.reason,
      citedBatchId: penDraft.citedBatchId,
      rows,
      method: penDraft.method,
      headnote: penDraft.headnote,
      authored: penDraft.authored,
    };
  }

  // The two impure calls (a fresh id, the current instant) live here, in
  // the one save handler — createChildVersion stays deterministic. The
  // parent is never passed to repository.saveVersion (D04, T-03-03).
  function handleSaveAsNewVersion() {
    const penFields = buildPenFields(null);
    if (!penFields) return;
    const child = createChildVersion(version, penFields, { id: crypto.randomUUID(), now: new Date().toISOString() });
    repository.saveVersion(child).then(() => {
      setVersions((prev) => [...prev, child]);
      setMode('reading');
      setPenDraft(null);
      setBlockedMessage(null);
      setBlockedTarget(null);
      // D-27: focus lands on the child's Develop control on mount. The
      // router keys RecipePage by `${id}::${batchId}` (router.jsx), so
      // the child mounts fresh and this state is read exactly once.
      navigate(`/recipe/${child.id}`, { state: { focusDevelop: true } });
    });
  }

  // Available only on a version with zero batches (D-01). The control's
  // absence from the headnote is the design; this re-check is the
  // guarantee — a churned version's own record is never written to (D04)
  // even if this handler were somehow reached with the control hidden.
  function handleSaveOverVersion() {
    if (batches.length > 0) return;
    const penFields = buildPenFields(version.id);
    if (!penFields) return;
    const updated = saveOverVersion(version, penFields, { now: new Date().toISOString() });
    repository.saveVersion(updated).then(() => {
      setVersion(updated);
      setVersions((prev) => prev.map((existing) => (existing.id === updated.id ? updated : existing)));
      setMode('reading');
      setPenDraft(null);
      setBlockedMessage(null);
      setBlockedTarget(null);
    });
  }

  return (
    <>
      {/* The running head (route-recipe-version.md § 4): the way home in
          every state, identifying the book, never the recipe's name and
          never changing with state. */}
      <p className="running-head">
        <Link to="/">Sprinkles</Link>
      </p>
      <article className="recipe-page">
        {/* The front matter (sketch 003 variant B, 03.3-01): two
            full-width stacked rows — the version's row, then the batch's
            row (app.css .recipe-band). Recipe block first in DOM order,
            so the intro paragraph field precedes every save in the tab
            order (D-28). */}
        <div className="recipe-band">
          <div className="recipe-band__row-version">
            <Headnote
              version={version}
              mode={mode}
              penDraft={penDraft}
              onChangePenField={handleChangePenField}
            />

            <VersionRow
              version={version}
              versions={versions}
              mode={mode}
              penDraft={penDraft}
              batches={batches}
              versionIdsWithBatches={versionIdsWithBatches}
              citedBatch={citedBatch}
              parentVersion={parentVersion}
              showingChanges={showingChanges}
              openPen={openPen}
              penReason={penReason}
              canSaveOver={canSaveOver}
              penHint={penHint}
              versionLineBlockedAttempt={blockedTarget?.kind === 'versionLine' ? blockedTarget.attempt : null}
              onStartDeveloping={handleStartDeveloping}
              onCancelDeveloping={handleCancelDeveloping}
              onChangePenField={handleChangePenField}
              onSaveAsNewVersion={handleSaveAsNewVersion}
              onSaveOverVersion={handleSaveOverVersion}
              onToggleShowChanges={handleToggleShowChanges}
              focusDevelopOnMount={focusDevelopOnMount}
            />
          </div>

          <BatchRow
            version={version}
            batches={batches}
            openBatch={openBatch}
            mode={mode}
            draft={draft}
            onChangeChurnField={handleChangeChurnField}
            tastingDraft={tastingDraft}
            onChangeTastingField={handleChangeTastingField}
            onChangeTastingMark={handleChangeTastingMark}
            openPen={openPen}
            penReason={penReason}
            penSaveDisabled={penSaveDisabled}
            penHint={penHint}
            onStartRecording={handleStartRecording}
            onStartAmending={handleStartAmending}
            onChangeChurnDate={handleChangeChurnDate}
            onCancelRecording={handleCancelRecording}
            onSaveBatch={handleSaveBatch}
            onStartTasting={handleStartTasting}
            onUseAsExpectedShortcut={handleUseAsExpectedShortcut}
            onSaveTasting={handleSaveTasting}
            onCancelTasting={handleCancelTasting}
          />
        </div>

        <section className="ingredient-table-region" aria-label="Ingredients">
          <h2 className="region-name">Ingredients</h2>
          {hasRows ? (
            <IngredientTable
              rows={mode === 'developing' || showingChanges ? version.rows : readingVersion.rows}
              draftVersion={draftVersion}
              diff={changeDiff}
              showingChanges={showingChanges}
              blockedRowId={blockedTarget?.kind === 'row' ? blockedTarget.rowId : null}
              blockedRowAttempt={blockedTarget?.kind === 'row' ? blockedTarget.attempt : null}
              markedRowIds={markedRowIds}
              markedFigureLabel={markedFigureLabel}
              mode={mode}
              draft={draft}
              penDraft={penDraft}
              openBatch={openBatch}
              steps={mode === 'developing' || showingChanges ? version.method : readingVersion.method}
              currentStepNumbers={currentStepNumbers}
              onChangeAsMade={handleChangeAsMade}
              onChangePenGrams={handleChangePenGrams}
              onTogglePenRowRemoved={handleTogglePenRowRemoved}
            />
          ) : (
            <p>This version has no ingredient rows.</p>
          )}
        </section>

        <section className="method-region" aria-label="Method">
          <Method
            steps={mode === 'developing' || showingChanges ? version.method : readingVersion.method}
            stepChanges={mode === 'recording' ? draft.stepChanges : openBatch ? openBatch.churn.stepChanges : {}}
            mode={mode}
            onChangeStepChange={handleChangeStepChange}
            rows={version.rows}
            draftVersion={draftVersion}
            baselineVersion={version}
            penDiff={penDiff}
            penStaleSteps={penStaleSteps}
            showingChanges={showingChanges}
            changeDiff={changeDiff}
            staleSteps={changeStaleSteps}
            staleFlagVisible={mode === 'developing' || showingChanges}
            currentStepNumbers={currentStepNumbers}
            baselineStepNumbers={baselineStepNumbers}
            onChangePenStepField={handleChangePenStepField}
            onChangePenStepTarget={handleChangePenStepTarget}
            onTogglePenStepUses={handleTogglePenStepUses}
            onTogglePenStepRemoved={handleTogglePenStepRemoved}
            beforeYouStart={mode === 'developing' && penDraft ? penDraft.authored.beforeYouStart : version.authored.beforeYouStart}
            onChangeNoteText={handleChangePenNoteText}
            onRemoveNote={handleRemovePenNote}
          />
        </section>

        {/* Column two, what the sheet does not print: the formulation note
            beside the table, then the margin beneath it. One flow, so the
            method's height never separates the two. */}
        <div className="side-region">
          <section className="formulation-note-region" aria-label="Balance">
            <FormulationNote
              version={liveVersion}
              mode={mode}
              diff={mode === 'developing' ? penDiff : changeDiff}
              onFocusFigure={setFocusedFigureKey}
              onBlurFigure={() => setFocusedFigureKey(null)}
            />
            <BasisNote version={liveVersion} />
          </section>

          <div className="margin-region">
            <DerivedAdvisories version={liveVersion} />
            <Authored
              carriedForward={mode === 'developing' && penDraft ? penDraft.authored.carriedForward : version.authored.carriedForward}
              mode={mode}
              onChangeNoteText={handleChangePenNoteText}
              onRemoveNote={handleRemovePenNote}
            />
          </div>
        </div>

        <PenFoot
          openPen={openPen}
          canSaveOver={canSaveOver}
          penSaveDisabled={penSaveDisabled}
          penHint={penHint}
          onCancelDeveloping={handleCancelDeveloping}
          onSaveAsNewVersion={handleSaveAsNewVersion}
          onSaveOverVersion={handleSaveOverVersion}
          onCancelRecording={handleCancelRecording}
          onSaveBatch={handleSaveBatch}
          onCancelTasting={handleCancelTasting}
          onSaveTasting={handleSaveTasting}
        />
      </article>
    </>
  );
}
