// The one shared button (D-19). tabIndex={0} sits after the prop spread so no
// caller can drop a button out of the Tab order: WebKit without Safari's
// tab-to-highlight preference (every browser on the iPad) Tabs only into
// controls that carry an explicit tabindex. Why, and the one exemption:
// .planning/notes/2026-10-01-engineering-notes.md. React 19 passes ref as an
// ordinary prop, so it goes straight to the native element.
export function Button({ ref, type = 'button', ...props }) {
  return <button ref={ref} type={type} {...props} tabIndex={0} />;
}
