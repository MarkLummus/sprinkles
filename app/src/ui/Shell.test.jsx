// Component test for the shell's layout-route wiring (03.4-03 Task 1). In
// the repo's existing harness: renderToStaticMarkup (react-dom/server) in
// the node test environment, MemoryRouter + Routes/Route for the router
// context — the same convention RecipeList.test.jsx uses for the app's
// links.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
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

const UI_DIR = path.dirname(fileURLToPath(import.meta.url));
const SHELL_JSX_PATH = path.join(UI_DIR, 'Shell.jsx');
const shellJsxSource = readFileSync(SHELL_JSX_PATH, 'utf8');

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

// Finds every opening tag of an <a>, <button> or <summary> element whose
// attributes (in whatever order React emitted them) contain shell__place —
// the class every shell stop carries. Same attribute-order-agnostic idiom
// as findAnchorTag, widened to the three element kinds a stop can be.
function findShellPlaceTags(markup) {
  const re = /<(?:a|button|summary)\b[^>]*>/g;
  const tags = [];
  let match;
  while ((match = re.exec(markup))) {
    if (match[0].includes('shell__place')) tags.push(match[0]);
  }
  return tags;
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

// G-03.4-3 half A (.planning/debug/more-panel-stays-open-import-no-home.md):
// this suite is renderToStaticMarkup in vitest's node environment, so it
// cannot click, toggle a <details>, navigate, or run an effect — 1119
// passing tests coexisted with the defect these facts describe (More never
// closed on item activation or on route change). Reading Shell.jsx's own
// source as text, the way home.test.js reads RecipeList.jsx, is what this
// harness can honestly assert; a real DOM-level interaction test needs
// jsdom or testing-library, a structural choice recorded as a follow-up
// rather than taken here.
describe('Shell — More closes on item activation and route change (G-03.4-3)', () => {
  it('imports useLocation from react-router', () => {
    expect(shellJsxSource).toMatch(/import\s*\{[^}]*\buseLocation\b[^}]*\}\s*from\s*'react-router'/);
  });

  it('imports useEffect from react', () => {
    expect(shellJsxSource).toMatch(/import\s*\{[^}]*\buseEffect\b[^}]*\}\s*from\s*'react'/);
  });

  it('the shell__more details carries both an open prop and an onToggle handler', () => {
    const detailsTag = shellJsxSource.match(/<details className="shell__more"[^>]*>/)?.[0];
    expect(detailsTag, 'expected a <details className="shell__more" ...> opening tag').toBeTruthy();
    expect(detailsTag).toMatch(/\bopen=\{/);
    expect(detailsTag).toMatch(/\bonToggle=\{/);
  });

  it('an effect closes the panel keyed on the route pathname', () => {
    expect(shellJsxSource).toMatch(/useEffect\(\(\) => \{[\s\S]*?\}, \[pathname\]\);/);
  });

  it('the More list carries a click handler closing the panel', () => {
    expect(shellJsxSource).toMatch(/<ul onClick=\{closeMore\}>/);
  });

  it('rendered at rest, the details still emits no open attribute', () => {
    const markup = renderAt('/');
    const detailsTag = markup.match(/<details\b[^>]*>/)?.[0];
    expect(detailsTag, 'expected a <details ...> opening tag').toBeTruthy();
    expect(detailsTag).not.toMatch(/\bopen\b/);
  });
});

// G-03.4-r3-3 (.planning/debug/ipad-tab-never-enters-app.md): WebKit makes
// an <a href> keyboard-focusable only under the embedder's TabsToLinks
// preference — off on Apple platforms, with no iPadOS switch, and
// untouched by Full Keyboard Access, which widens only the form-control
// gate — or when the element carries an explicit tabindex, which routes
// it straight to Element::isKeyboardFocusable. Every shell stop therefore
// sets one. The pin is on rendered markup, not source text: the
// attribute's whole effect is in the DOM WebKit reads, and a source regex
// could pass with the attribute on the wrong element.
describe('every shell stop carries an explicit tabindex, pinned on rendered markup (G-03.4-r3-3, .planning/debug/ipad-tab-never-enters-app.md)', () => {
  it('renders exactly 19 shell__place stops (3 tools + 6 rail + 4 tab row + 1 summary + 5 More items), each carrying tabindex="0"', () => {
    const markup = renderAt('/');
    const tags = findShellPlaceTags(markup);
    expect(tags).toHaveLength(19);
    for (const tag of tags) {
      expect(tag).toContain('tabindex="0"');
    }
  });

  it('tabindex="-1" occurs exactly once in the markup, on the hidden file input alone', () => {
    const markup = renderAt('/');
    expect(markup.match(/tabindex="-1"/g)).toHaveLength(1);
    const inputTag = markup.match(/<input\b[^>]*tabindex="-1"[^>]*>/)?.[0];
    expect(inputTag, 'expected the tabindex="-1" input tag').toBeTruthy();
    expect(inputTag).toContain('type="file"');
  });
});
