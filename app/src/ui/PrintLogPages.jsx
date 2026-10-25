import { axesForVersion, stopWordsFor } from '../domain/axes.js';
import { problemNames } from '../domain/catalog.js';
import { BATTERY_FIELDS, PRINTED_MARK_ONE_OPTIONS, SEGMENT_OPTIONS } from '../domain/battery.js';

// The two blank log pages the print route lays ahead of the Sheet (D-07a):
// the Batch log on side 1 and the Tasting log on side 2 of one sheet. Their
// markup and words are sketch 010's page-1-batch-log.html and
// page-2-tasting-log.html, read as a structural contract (CONTRACT §§ 3, 4);
// every word comes from the built pens' own tables (battery.js), never a
// literal list here. Text renders as text. Paper, not a screen: no control,
// no hover, no focus, no cue that only the app needs.

// The foot, in flow inside its own page (D7: Safari cannot print a running
// foot): Sheet title, version line, Sheet code and the side. The code is the
// bare code (decide-foot-sheet-code-word); there is no page n of m.
export function logFootText({ sheetTitle, identity, code, side }) {
  return `${[sheetTitle, identity, code].join(' · ')} · Side ${side} of 2`;
}

const FIGURE_FIELDS = Object.fromEntries(BATTERY_FIELDS.map((field) => [field.key, field]));

// The page's title and its date box (D8): the box floats at the right of the
// first line, the title and the figure row beside it.
export function LogHead({ dateCaption, title }) {
  return (
    <>
      <div className="lf-datebox">
        <span className="pen-caption">{dateCaption}</span>
      </div>
      <h2 className="region-name lf-title">{title}</h2>
    </>
  );
}

// One numeric field as a ruled line carrying its unit, never a box (D1). The
// unit sits under the line when `under` (Melt test, whose unit is a phrase).
export function LogFigure({ field, under = false }) {
  return (
    <div className={under ? 'lf-field lf-field--under' : 'lf-field'}>
      <span className="pen-caption">{field.label}</span>
      <div className="lf-rule">
        <span className="lf-base lf-base--figure" />
        <span className="lf-unit">{field.unit}</span>
      </div>
    </div>
  );
}

// Boxes the maker ticks with a pen: a ruled square and its word.
export function LogOption({ word }) {
  return (
    <span className="lf-opt">
      <span className="lf-box" />
      {word}
    </span>
  );
}

// A group's head (D19, D22): its name at the left, its cue at the right,
// under one 2.5 px ink rule.
export function LogGroupHead({ name, cue }) {
  return (
    <div className="lf-ghead">
      <span className="lf-gname">{name}</span>
      <span className="lf-gcue">{cue}</span>
    </div>
  );
}

// The three printed boxes of a mark-one group (At draw, From freezer): the
// print keeps See below, which the pen and the reading do not (D6b).
export function LogVerdict() {
  return (
    <div className="lf-verdict">
      {PRINTED_MARK_ONE_OPTIONS.map((word) => (
        <LogOption key={word} word={word} />
      ))}
    </div>
  );
}

// A caption in the 150 px column and its options beside it (D8).
export function LogMarkRow({ caption, words }) {
  return (
    <div className="lf-mrow">
      <span className="pen-caption">{caption}</span>
      <div className="lf-mark">
        {words.map((word) => (
          <LogOption key={word} word={word} />
        ))}
      </div>
    </div>
  );
}

// A section of writing lines under a group head: one ruled section, not
// several captions (D5, D19).
export function LogNotes({ cue, lines }) {
  return (
    <div className="lf-notes">
      <LogGroupHead name="Notes" cue={cue} />
      <div className="lf-lines">
        {Array.from({ length: lines }, (_, index) => (
          <div key={index} className="lf-line" />
        ))}
      </div>
    </div>
  );
}

// The foot, last in the page, 16 px at least under the body (D22).
export function LogFoot({ footText }) {
  return <div className="lf-foot">{footText}</div>;
}

// Page 1, the Batch log (CONTRACT § 3). Identical for every recipe except
// its foot.
export function BatchLogPage({ footText }) {
  return (
    <div className="lf">
      <div className="lf-body">
        <LogHead dateCaption="Churned" title="Batch log" />
        <div className="lf-sec lf-row">
          <LogFigure field={FIGURE_FIELDS.outOfMachineTempC} />
          <LogFigure field={FIGURE_FIELDS.churnDurationMinutes} />
        </div>
        <div className="lf-group">
          <LogGroupHead name="At draw" cue="mark one" />
          <LogVerdict />
          <LogMarkRow caption="Exit consistency" words={SEGMENT_OPTIONS.exitConsistency} />
          <LogMarkRow caption="Airiness" words={SEGMENT_OPTIONS.airiness} />
        </div>
        <LogNotes cue="At the machine · Ingredient notes · Next time" lines={14} />
      </div>
      <LogFoot footText={footText} />
    </div>
  );
}

// The five ticks stand on one rule, the ends tall (D21): the maker circles or
// ticks a place on the line. Only 1 and 5 are numbered; the middle is "right".
const TICKS = [1, 2, 3, 4, 5];

// One scale row (D19, D21, D23): the name, the low word, 1, the rule with
// five ticks, 5, the high word, and the fixed middle word "right" under the
// middle tick. No boxes (decide-page-2-scales-boxes-or-rule).
function LogScaleRow({ axis }) {
  const [, , middleWord] = stopWordsFor(axis);
  return (
    <div className="lf-srow">
      <span className="axis-mark__name">{axis.name}</span>
      <div className="lf-sc">
        <span className="lf-track">
          {TICKS.map((tick) => (
            <span key={tick} className={`lf-tick lf-tick--${tick}${tick === 1 || tick === 5 ? ' lf-tick--end' : ''}`} />
          ))}
        </span>
        <span className="lf-anchor lf-lo">{axis.low}</span>
        <span className="lf-num lf-n1">1</span>
        <span className="lf-num lf-n5">5</span>
        <span className="lf-anchor lf-hi">{axis.high}</span>
        <span className="lf-anchor lf-mid">{middleWord}</span>
      </div>
    </div>
  );
}

// Page 2, the Tasting log (CONTRACT § 4): the four core scales then the
// version's own declared ones (0 to 2), the four core problems then its own
// declared ones in one row (0 to 2), five writing lines. Both lists come
// from the catalog (the core scales and the core problems, read from their
// tables) and the version (its declared ones), never from a literal here; no
// "Every recipe" or "This recipe only" cue is printed (D23).
export function TastingLogPage({ version, catalog, footText }) {
  return (
    <div className="lf">
      <div className="lf-body">
        <LogHead dateCaption="Tasted" title="Tasting log" />
        <div className="lf-sec lf-row">
          <LogFigure field={FIGURE_FIELDS.temperingMinutes} />
          <LogFigure field={FIGURE_FIELDS.tastingTempC} />
          <LogFigure field={FIGURE_FIELDS.meltTestG} under />
        </div>
        <LogMarkRow caption="Melt style" words={SEGMENT_OPTIONS.meltStyle} />
        <div className="lf-group">
          <LogGroupHead name="From freezer" cue="mark one" />
          <LogVerdict />
          {axesForVersion(version, catalog).map((axis) => (
            <LogScaleRow key={axis.key} axis={axis} />
          ))}
          <p className="lf-dhead lf-sub">
            <span className="lf-subname">Any problems?</span>
            <span className="pen-helper">select all that apply</span>
          </p>
          <div className="lf-mrow lf-mrow--plain">
            <div className="lf-mark">
              {[...problemNames(catalog.problems), ...(version.declaredFlaws ?? [])].map((word) => (
                <LogOption key={word} word={word} />
              ))}
            </div>
          </div>
        </div>
        <LogNotes cue="How did it turn out?" lines={5} />
      </div>
      <LogFoot footText={footText} />
    </div>
  );
}
