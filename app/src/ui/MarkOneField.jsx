import { useRef } from 'react';
import { MARK_ONE_OPTIONS } from '../domain/battery.js';
import { Button } from './Button.jsx';
import { Radio } from './Radio.jsx';

// The reason shown beside a mark-one group's name while the group holds a
// mark (sketch 010 D10; CONTRACT section 7): its two options are off, and
// the words say what turns them back on.
export const MARK_ONE_OFF_REASON = 'Clear marks below to choose.';

// The pen's two-option "mark one" control (sketch 010 D6 to D14): At draw on
// the batch and From freezer on the tasting. Two words, Nothing to note and
// Not evaluated, say why an evaluation is absent; a pick hides the group's
// evaluation fields (BatchRow decides that) and shows Clear beside the name.
//
// Three states, drawn in pen-states.html:
//   blank   no option on, no Clear;
//   picked  one option on, Clear shows; tapping the picked option again does
//           nothing, tapping the other moves the pick (a radio, as in
//           Segmented.jsx — the click is on onClick with a no-op onChange);
//   off     the group holds a mark, so the field stays but both options are
//           disabled (so out of the Tab order natively), dashed, secondary
//           text, with MARK_ONE_OFF_REASON beside the name. The off state is
//           never conveyed by colour alone (UX1-03): the dashed border and
//           the written reason carry it.
//
// A disabled Radio still carries tabIndex={0} (Radio.jsx); the browser drops
// a disabled input from the Tab order, so the scan's literal rule and this
// state do not conflict.
//
// Clear mirrors Segmented.jsx: focus moves to the first option only on a
// keyboard activation (event.detail 0), so a mouse Clear leaves the tab
// position on Clear.
export function MarkOneField({ field, label, value, off = false, onChange, onClear }) {
  const key = field.toLowerCase();
  const groupName = `mo-${key}`;
  const captionId = `${groupName}-caption`;
  const picked = !off && MARK_ONE_OPTIONS.includes(value);
  const firstOptionRef = useRef(null);

  function handleClear(event) {
    onClear();
    if (event.detail === 0) firstOptionRef.current?.focus();
  }

  return (
    <div className="segmented-field mo-group" data-mo={key}>
      <div className="segmented-field__head">
        <span className="segmented-field__caption pen-caption axes-cue" id={captionId}>
          {label}
        </span>
        {picked && (
          <Button
            className="text-control segmented-field__clear"
            aria-label={`Clear ${label}`}
            onClick={handleClear}
          >
            Clear
          </Button>
        )}
        {off && <span className="mo-hint">{MARK_ONE_OFF_REASON}</span>}
      </div>
      <div className="segmented" role="radiogroup" aria-labelledby={captionId}>
        {MARK_ONE_OPTIONS.map((option, index) => (
          <label key={option} className={off ? 'segmented__option is-off' : 'segmented__option'}>
            <Radio
              name={groupName}
              value={option}
              checked={!off && value === option}
              disabled={off}
              ref={index === 0 ? firstOptionRef : undefined}
              onChange={() => {}}
              onClick={() => onChange(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
