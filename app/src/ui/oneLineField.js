// bug-p11-ipad-hardware-tab-skips-fields: iPadOS 27 Safari drops a hardware Tab
// from every input element, and a textarea takes it. The creation editor's
// step lead-in and ingredient-row grams field are therefore one-row textareas
// that must still behave as one-line fields: Return inserts nothing, and no
// line break reaches the draft by paste or any other edit.

// Prevents an Enter keydown, with or without modifier keys, unless an IME is
// composing (Enter then confirms the composition). Other keys, and bubbling,
// are left alone.
export function holdReturn(event) {
  if (event.key !== 'Enter') return;
  if (event.nativeEvent?.isComposing === true || event.keyCode === 229) return;
  event.preventDefault();
}

// HTML's strip-newlines rule for a single-line input's value: every LF and CR
// is removed, not replaced by a space.
export function stripNewlines(text) {
  return text.replace(/[\n\r]/g, '');
}
