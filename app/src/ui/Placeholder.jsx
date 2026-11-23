// D-10: all five destinations are links; an unbuilt place opens a page
// with the shell intact (the rail survives, since this renders inside
// Shell's Outlet), the place's name as its title, and one sentence naming
// its status. Nothing else — no list, no empty-state illustration, no
// link back; the rail is the way out. The optional note replaces that one
// sentence (DeskOnly's desk line, PHONE-01); without it the sentence is as built.
// DeskOnly also passes Edit's link line as children, set between the title and
// the note, and a null note (no sentence) while its read is out.
export function Placeholder({ name, note = `${name} is not built yet.`, children }) {
  return (
    <div className="list-page place">
      <h1 className="place__title">{name}</h1>
      {children}
      {note !== null && <p className="place__note">{note}</p>}
    </div>
  );
}
