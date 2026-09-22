// Component test for the shell's layout-route wiring (03.4-03 Task 1). In
// the repo's existing harness: renderToStaticMarkup (react-dom/server) in
// the node test environment, MemoryRouter + Routes/Route for the router
// context — the same convention RecipeList.test.jsx uses for the app's
// links.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router';
import { Shell } from './Shell.jsx';
import { Placeholder } from './Placeholder.jsx';

function renderAt(path) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<p>Home page</p>} />
          <Route path="/notebook" element={<Placeholder name="Notebook" />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

// Finds the full opening tag of the <a> whose attributes (in whatever
// order React emitted them) contain `needle` — never assumes an attribute
// order, since aria-current is added by NavLink itself, not authored here.
function findAnchorTag(markup, needle) {
  const re = /<a\b[^>]*>/g;
  let match;
  while ((match = re.exec(markup))) {
    if (match[0].includes(needle)) return match[0];
  }
  return null;
}

describe('Shell — every route renders inside the layout route (D-09, D-10)', () => {
  it('renders the rail and the Notebook placeholder at /notebook, with the Notebook entry marked current', () => {
    const markup = renderAt('/notebook');
    expect(markup).toContain('shell__rail');
    expect(markup).toContain('Notebook is not built yet.');
    const notebookLink = findAnchorTag(markup, 'shell__place--notebook');
    expect(notebookLink, 'expected a link carrying shell__place--notebook').toBeTruthy();
    expect(notebookLink).toContain('aria-current="page"');
  });

  it('does not mark the Notebook entry current at /', () => {
    const markup = renderAt('/');
    expect(markup).toContain('shell__rail');
    const notebookLink = findAnchorTag(markup, 'shell__place--notebook');
    expect(notebookLink, 'expected a link carrying shell__place--notebook').toBeTruthy();
    expect(notebookLink).not.toContain('aria-current');
  });

  it('renders no inline style on any shell element', () => {
    const markup = renderAt('/');
    expect(markup).not.toContain('style=');
  });
});
