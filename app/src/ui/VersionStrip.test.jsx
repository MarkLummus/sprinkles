// Component test for the version strip (route-recipe-version.md § 3, § 6).
// In the existing style — renderToStaticMarkup (react-dom/server) in the
// node test environment. Wrapped in a MemoryRouter because the strip
// renders react-router Links, which throw outside a router context even
// under static rendering (Task 3's RecipeList.test.jsx precedent).
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { VersionStrip } from './VersionStrip.jsx';

function makeVersion(overrides = {}) {
  return {
    id: 'v1',
    recipeId: 'r1',
    createdAt: '2026-01-01T00:00:00.000Z',
    versionLabel: 'line',
    ...overrides,
  };
}

function renderStrip(props) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <VersionStrip
        versions={[]}
        recipeId="r1"
        currentId="v1"
        versionIdsWithBatches={new Set()}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe('VersionStrip — a strip of one is not a strip', () => {
  it('renders nothing for a single version', () => {
    const versions = [makeVersion({ id: 'v1' })];
    const markup = renderStrip({ versions, currentId: 'v1' });
    expect(markup).toBe('');
  });
});

describe('VersionStrip — three versions of one recipe', () => {
  const versions = [
    makeVersion({ id: 'a', versionLabel: 'first', createdAt: '2026-01-01T00:00:00.000Z' }),
    makeVersion({ id: 'b', versionLabel: 'second', createdAt: '2026-02-01T00:00:00.000Z' }),
    makeVersion({ id: 'c', versionLabel: 'third', createdAt: '2026-03-01T00:00:00.000Z' }),
  ];

  it('renders three links in creation order, most recently created first', () => {
    const markup = renderStrip({ versions, currentId: 'a' });
    const thirdIndex = markup.indexOf('third');
    const secondIndex = markup.indexOf('second');
    const firstIndex = markup.indexOf('first');
    expect(markup.match(/<a /g)).toHaveLength(3);
    expect(thirdIndex).toBeGreaterThan(-1);
    expect(thirdIndex).toBeLessThan(secondIndex);
    expect(secondIndex).toBeLessThan(firstIndex);
  });

  it('does not render a version belonging to a different recipeId', () => {
    const withOther = [...versions, makeVersion({ id: 'd', recipeId: 'other-recipe', versionLabel: 'elsewhere' })];
    const markup = renderStrip({ versions: withOther, currentId: 'a' });
    expect(markup).not.toContain('elsewhere');
    expect(markup.match(/<li/g)).toHaveLength(3);
  });

  it("carries the current version's entry with the distinguishing class, still a link", () => {
    const markup = renderStrip({ versions, currentId: 'b' });
    expect(markup).toMatch(/<li class="version-strip__item is-current"><a[^>]*href="\/recipe\/b"/);
  });

  it('wears "churned" on a version with a batch and not on one without, with no count', () => {
    const markup = renderStrip({ versions, currentId: 'a', versionIdsWithBatches: new Set(['b']) });
    // Matches the "churned" text node, not the CSS class of the same name.
    expect((markup.match(/>churned</g) ?? []).length).toBe(1);
    expect(markup).not.toMatch(/churned\s*\(\d+\)/);
    expect(markup).not.toMatch(/\d+\s*churned/);
  });
});
