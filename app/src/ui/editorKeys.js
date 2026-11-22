// STRUCT-05, sketch 016 CONTRACT section 6 and section 11 (numbers 8, 10, 11):
// the three keys that add and move a step or an ingredient row from where the
// maker types. Cmd+Return and Ctrl+Return add; Ctrl+Cmd+Up and Ctrl+Cmd+Down
// move; Remove has no key. Cmd+arrow, Option+arrow and Shift+Cmd+arrow keep
// their own work in the text, which is why move is Ctrl+Cmd. A keyboard with
// no Cmd key gets Ctrl+Return for add and nothing for move.

// What a keydown asks for: 'add', 'ignore' (a held add: one step or one picker
// per press, repeats ignored), 'move-up', 'move-down', or null for any other key.
// null too while an IME composes (Return then confirms the composition, the same
// test holdReturn uses) and with Alt or Shift held, which are other combinations.
export function keyIntent(event) {
  if (event.nativeEvent?.isComposing === true || event.keyCode === 229) return null;
  if (event.altKey || event.shiftKey) return null;
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) return event.repeat ? 'ignore' : 'add';
  if (event.ctrlKey && event.metaKey) {
    if (event.key === 'ArrowUp') return 'move-up';
    if (event.key === 'ArrowDown') return 'move-down';
  }
  return null;
}

// Routes a keydown from a field of a step or a row's grams. A recognised
// combination is always prevented, an end of the list and a repeat included, so
// a combination that does nothing never falls through to a default action and
// types nothing into the field. Any other key goes to `otherwise`.
export function editorKeyDown(event, { onAdd, onMove, otherwise }) {
  const intent = keyIntent(event);
  if (intent === null) {
    otherwise?.(event);
    return;
  }
  event.preventDefault();
  if (intent === 'add') onAdd?.();
  else if (intent === 'move-up') onMove?.('up');
  else if (intent === 'move-down') onMove?.('down');
}
