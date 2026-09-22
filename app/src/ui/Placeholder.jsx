// D-10: all five destinations are links; an unbuilt place opens a page
// with the shell intact (the rail survives, since this renders inside
// Shell's Outlet), the place's name as its title, and one sentence naming
// its status. Nothing else — no list, no empty-state illustration, no
// link back; the rail is the way out.
export function Placeholder({ name }) {
  return (
    <div className="list-page">
      <h1 className="place__title">{name}</h1>
      <p className="place__note">{name} is not built yet.</p>
    </div>
  );
}
