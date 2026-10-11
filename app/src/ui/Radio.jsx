// The one shared radio (D-19). tabIndex={0} sits after the prop spread so no
// caller can drop a radio out of the Tab order: WebKit without Safari's
// tab-to-highlight preference (every browser on the iPad) Tabs only into
// controls that carry an explicit tabindex. A disabled radio still carries it;
// the browser removes a disabled input from the Tab order natively. Why:
// .planning/notes/2026-10-01-engineering-notes.md.
export function Radio({ ref, ...props }) {
  return <input ref={ref} type="radio" {...props} tabIndex={0} />;
}
