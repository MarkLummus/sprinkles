import { NavLink, Outlet } from 'react-router';

// One source of truth for the App's five destinations (DESIGN.md "App
// marks", D-09, D-10, D-16): the rail, the bottom tab row, and router.jsx's
// placeholder routes all read this array, so a place can never exist in
// one of the three without existing in the other two.
export const PLACES = [
  { path: '/notebook', name: 'Notebook', slug: 'notebook' },
  { path: '/recipe-book', name: 'Recipe book', slug: 'recipe-book' },
  { path: '/idea-log', name: 'Idea log', slug: 'idea-log' },
  { path: '/ingredients', name: 'Ingredients', slug: 'ingredients' },
  { path: '/kitchen', name: 'Kitchen', slug: 'kitchen' },
];

// The shell every route renders inside (D-09): a header carrying the
// wordmark, and a 224px rail of destinations beside the routed page. In
// this task the rail carries two entries only — Home and the first
// destination, Notebook — so the layout-route wiring (Shell -> Outlet ->
// every leaf route) is proved end to end before the rest of the rail, the
// brand mark and the tools row are drawn (Task 2) and the bottom tab row
// is added below the phone step (Task 3). NavLink supplies aria-current
// from the router's own match, never from hand-written state.
export function Shell() {
  return (
    <div className="shell">
      <header className="shell__head">
        <p className="shell__brand">Sprinkles</p>
      </header>
      <div className="shell__body">
        <nav className="shell__rail" aria-label="Places">
          <NavLink to="/" end className="shell__place shell__place--home">
            Home
          </NavLink>
          <NavLink to={PLACES[0].path} className={`shell__place shell__place--${PLACES[0].slug}`}>
            {PLACES[0].name}
          </NavLink>
        </nav>
        <main className="shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
