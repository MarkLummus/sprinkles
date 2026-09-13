// Component test for the authored notes (route-recipe-version.md § 3;
// D-13 § 8, task 1). In the existing house style: renderToStaticMarkup
// (react-dom/server) in the node test environment, no jsdom, no
// testing-library, no MemoryRouter — Authored renders no Link. Follows
// Headnote.test.jsx's render-helper convention (03.1-04 task 3).
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Authored } from './Authored.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';

const noop = () => {};

function renderAuthored(props) {
  return renderToStaticMarkup(
    <Authored
      carriedForward={oliveOilVersion.authored.carriedForward}
      mode="reading"
      onChangeNoteText={noop}
      onRemoveNote={noop}
      {...props}
    />,
  );
}

describe('Authored — a note in the reading state', () => {
  it('renders the note as plain prose, not a field', () => {
    const markup = renderAuthored({});
    expect(markup).toContain(oliveOilVersion.authored.carriedForward[0].text);
    expect(markup).not.toContain('<textarea');
    expect(markup).not.toContain('ink-field');
    expect(markup).not.toContain('prose-field');
  });

  it('renders no remove control while reading', () => {
    const markup = renderAuthored({});
    expect(markup).not.toContain('<button');
  });
});

describe('Authored — a note while developing (03.1-04, D-13 § 8)', () => {
  it('renders the note as a prose field, not the counted field\'s class', () => {
    const markup = renderAuthored({ mode: 'developing' });
    expect(markup).toMatch(/<textarea[^>]*class="prose-field"/);
    expect(markup).not.toContain('ink-field');
  });

  it('carries the note\'s own accessible name, with no visible label word', () => {
    const markup = renderAuthored({ mode: 'developing' });
    expect(markup).toMatch(/<textarea[^>]*aria-label="carriedForward note 1"/);
  });

  it('renders a remove control beside the field', () => {
    const markup = renderAuthored({ mode: 'developing' });
    expect(markup).toMatch(/<button[^>]*>remove<\/button>/);
  });
});

describe('Authored — the inherited-from marker survives both states (D-06)', () => {
  it('renders the marker in the reading state', () => {
    const markup = renderAuthored({
      carriedForward: [{ text: 'A carried note.', inheritedFrom: '50 g oil · 800 g' }],
      mode: 'reading',
    });
    expect(markup).toContain('authored__inherited');
    expect(markup).toContain('from 50 g oil · 800 g');
  });

  it('renders the marker beside the field while developing', () => {
    const markup = renderAuthored({
      carriedForward: [{ text: 'A carried note.', inheritedFrom: '50 g oil · 800 g' }],
      mode: 'developing',
    });
    expect(markup).toContain('authored__inherited');
    expect(markup).toContain('from 50 g oil · 800 g');
  });

  it('renders no marker at all for a note with none', () => {
    const markup = renderAuthored({});
    expect(markup).not.toContain('authored__inherited');
  });
});
