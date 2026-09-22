// Component test for the shell's layout-route wiring (03.4-03 Task 1). In
// the repo's existing harness: renderToStaticMarkup (react-dom/server) in
// the node test environment, MemoryRouter + Routes/Route for the router
// context — the same convention RecipeList.test.jsx uses for the app's
// links.
import { describe, it, expect, vi } from 'vitest';
// Shell.jsx imports repository.js, whose module-level
// `export const repository = createRepository()` opens the real IndexedDB
// at import time — a side effect this test never exercises (Import/Export
// are never clicked here). Stubbed at the one seam Shell.jsx imports
// through, the same convention RecipeList.test.jsx uses.
vi.mock('../store/repository.js', () => ({ repository: {} }));
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router';
import { Shell, PLACES } from './Shell.jsx';
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

describe('Shell — the whole rail, the tools row, and Import/Export (03.4-03 Task 2)', () => {
  it('renders all five destinations as links to their own path, each carrying its own modifier class', () => {
    const markup = renderAt('/');
    for (const place of PLACES) {
      const tag = findAnchorTag(markup, `shell__place--${place.slug}`);
      expect(tag, `expected a link carrying shell__place--${place.slug}`).toBeTruthy();
      expect(tag).toContain(`href="${place.path}"`);
    }
  });

  it('renders Search as a link to /search, Import and Export as buttons, and exactly one file input', () => {
    const markup = renderAt('/');
    const searchLink = findAnchorTag(markup, 'href="/search"');
    expect(searchLink, 'expected a link to /search').toBeTruthy();
    const buttonCount = (markup.match(/<button\b/g) ?? []).length;
    expect(buttonCount).toBeGreaterThanOrEqual(2);
    expect(markup.match(/type="file"/g)).toHaveLength(1);
  });
});

describe('Shell — the bottom tab row and More (D-16, 03.4-03 Task 3)', () => {
  it('renders five tabs — Home, Notebook, Recipe book, Idea log, More', () => {
    const markup = renderAt('/');
    const tabsMatch = markup.match(/<nav class="shell__tabs"[^>]*>([\s\S]*?)<\/nav>/);
    expect(tabsMatch, 'expected a nav.shell__tabs element').toBeTruthy();
    const tabsMarkup = tabsMatch[1];
    for (const name of ['Home', 'Notebook', 'Recipe book', 'Idea log', 'More']) {
      expect(tabsMarkup).toContain(name);
    }
  });

  it('the More disclosure holds Ingredients, Kitchen, Search, Import and Export', () => {
    const markup = renderAt('/');
    const detailsMatch = markup.match(/<details class="shell__more">([\s\S]*?)<\/details>/);
    expect(detailsMatch, 'expected a details.shell__more element').toBeTruthy();
    const moreMarkup = detailsMatch[1];
    for (const name of ['Ingredients', 'Kitchen', 'Search', 'Import', 'Export']) {
      expect(moreMarkup).toContain(name);
    }
  });

  it('renders exactly one <details> element and exactly one file input, shared by the tools row and More', () => {
    const markup = renderAt('/');
    expect(markup.match(/<details\b/g)).toHaveLength(1);
    expect(markup.match(/type="file"/g)).toHaveLength(1);
  });
});
