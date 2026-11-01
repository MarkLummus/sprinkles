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

// bug-ipad-tab-lost-from-single-line-fields, spec section 4: for a one-line
// field that is the only text field of a form whose submit acts. A textarea
// does not submit on Return, so this does what the input's implicit submission
// did: Enter or Shift+Enter clicks the form's default button once. Control, Alt
// and Meta with Enter submit nothing, as both engines' inputs did when measured
// (2026-11-01). No key ever inserts a line break, and an IME composing is left
// alone. It clicks the button rather than calling requestSubmit because HTML
// defines implicit submission as that click, which does nothing while the
// button is disabled.
export function submitOnReturn(event) {
  if (event.key !== 'Enter') return;
  if (event.nativeEvent?.isComposing === true || event.keyCode === 229) return;
  event.preventDefault();
  if (event.ctrlKey || event.altKey || event.metaKey) return;
  [...event.currentTarget.form.elements].find((control) => control.type === 'submit')?.click();
}
