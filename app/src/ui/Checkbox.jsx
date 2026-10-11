// The one shared checkbox (D-19). tabIndex={0} sits after the prop spread so no
// caller can drop a checkbox out of the Tab order: WebKit without Safari's
// tab-to-highlight preference (every browser on the iPad) Tabs only into
// controls that carry an explicit tabindex. Why:
// .planning/notes/2026-10-01-engineering-notes.md.
export function Checkbox({ ref, ...props }) {
  return <input ref={ref} type="checkbox" {...props} tabIndex={0} />;
}
