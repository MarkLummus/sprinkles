import { Button } from './Button.jsx';
import { liveSteps } from '../domain/creationSteps.js';

// A step's Move up and Move down, as the creation editor has them, shared with the
// Next version pen (sketch 017 README decision 2 and CONTRACT section 2): one copy
// of the buttons, their names and their grey ends. A move that cannot act is
// .mk-off and aria-disabled: it stays in the tab order and does nothing (D-16).
// `keys` names the creation editor's move keys on the buttons. The pen passes
// none (README decision 11): it has no move keys, so no aria-keyshortcuts.
export function StepMoveButtons({ number, isFirst, isLast, keys = false, onMove }) {
  return (
    <>
      <Button
        className={isFirst ? 'text-control mk-off' : 'text-control'}
        data-act="move-up"
        aria-label={`Step ${number}, move up`}
        aria-keyshortcuts={keys ? 'Control+Meta+ArrowUp' : undefined}
        aria-disabled={isFirst ? 'true' : undefined}
        onClick={isFirst ? undefined : () => onMove('up')}
      >
        Move up
      </Button>
      <span aria-hidden="true">·</span>
      <Button
        className={isLast ? 'text-control mk-off' : 'text-control'}
        data-act="move-down"
        aria-label={`Step ${number}, move down`}
        aria-keyshortcuts={keys ? 'Control+Meta+ArrowDown' : undefined}
        aria-disabled={isLast ? 'true' : undefined}
        onClick={isLast ? undefined : () => onMove('down')}
      >
        Move down
      </Button>
    </>
  );
}

/**
 * stepMoveWord(draft, n, direction) -> `Step ${place} of ${count}`: live step n's
 * place among the live steps after the move, of their count (sketch 017 CONTRACT
 * section 3). null when n is not a live step or the move would pass an end, which is
 * also the guard a press runs before moveStep, so a stale press never throws inside
 * a state update. It reads only draft.method, so a create draft, a pen draft and a
 * draft version all work.
 */
export function stepMoveWord(draft, n, direction) {
  const live = liveSteps(draft);
  const at = live.findIndex((step) => step.n === n);
  if (at === -1) return null;
  const to = direction === 'up' ? at - 1 : direction === 'down' ? at + 1 : -1;
  if (to < 0 || to >= live.length) return null;
  return `Step ${to + 1} of ${live.length}`;
}
