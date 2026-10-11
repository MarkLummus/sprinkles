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
        <LogHead dateCaption="Churn date" title="Batch log" />
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
