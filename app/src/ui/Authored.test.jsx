// Component test for the authored notes (route-recipe-version.md § 3;
// D-13 § 8, task 1; 03.5-CONTEXT.md decision 10: the Authored wrapper and
// its Carried forward legend are gone — NoteList is the whole component
// now, exercised directly the way Method.jsx's "Before you start" already
// calls it). In the existing house style: renderToStaticMarkup
// (react-dom/server) in the node test environment, no jsdom, no
// testing-library, no MemoryRouter — NoteList renders no Link. Follows
// Headnote.test.jsx's render-helper convention (03.1-04 task 3).
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NoteList } from './Authored.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';

const noop = () => {};

function renderNoteList(props) {
  return renderToStaticMarkup(
    <NoteList
      listKey="beforeYouStart"
      notes={oliveOilVersion.authored.beforeYouStart}
      mode="reading"
      onChangeNoteText={noop}
      onRemoveNote={noop}
      {...props}
    />,
  );
}

describe('NoteList — a note in the reading state', () => {
  it('renders the note as plain prose, not a field', () => {
    const markup = renderNoteList({});
    expect(markup).toContain(oliveOilVersion.authored.beforeYouStart[0].text);
    expect(markup).not.toContain('<textarea');
    expect(markup).not.toContain('ink-field');
    expect(markup).not.toContain('prose-field');
  });

  it('renders no remove control while reading', () => {
    const markup = renderNoteList({});
    expect(markup).not.toContain('<button');
  });

  it('renders no Carried forward legend of any kind — the list left the store (decisions_recorded 10)', () => {
    const markup = renderNoteList({});
    expect(markup).not.toContain('Carried forward');
    expect(markup).not.toContain('authored__legend');
  });
});

describe('NoteList — a note while developing (03.1-04, D-13 § 8)', () => {
  it('renders the note as a prose field, not the counted field\'s class', () => {
    const markup = renderNoteList({ mode: 'developing' });
    expect(markup).toMatch(/<textarea[^>]*class="prose-field"/);
    expect(markup).not.toContain('ink-field');
  });

  it('carries the note\'s own accessible name, with no visible label word', () => {
    const markup = renderNoteList({ mode: 'developing' });
    expect(markup).toMatch(/<textarea[^>]*aria-label="beforeYouStart note 1"/);
  });

  it('renders a remove control beside the field', () => {
    const markup = renderNoteList({ mode: 'developing' });
    expect(markup).toMatch(/<button[^>]*>Remove<\/button>/);
  });

  it('the remove control takes the row remove\'s link look, class text-control (sketch 010 D31)', () => {
    const markup = renderNoteList({ mode: 'developing' });
    const tags = markup.match(/<button\b[^>]*>/g);
    expect(tags).toHaveLength(2);
    for (const tag of tags) expect(tag).toContain('class="text-control"');
  });
});

describe('NoteList — the inherited-from marker survives both states (D-06)', () => {
  it('renders the marker in the reading state', () => {
    const markup = renderNoteList({
      notes: [{ text: 'A before-you-start note.', inheritedFrom: '50 g oil · 800 g' }],
      mode: 'reading',
    });
    expect(markup).toContain('authored__inherited');
    expect(markup).toContain('from 50 g oil · 800 g');
  });

  it('renders the marker beside the field while developing', () => {
    const markup = renderNoteList({
      notes: [{ text: 'A before-you-start note.', inheritedFrom: '50 g oil · 800 g' }],
      mode: 'developing',
    });
    expect(markup).toContain('authored__inherited');
    expect(markup).toContain('from 50 g oil · 800 g');
  });

  it('renders no marker at all for a note with none', () => {
    const markup = renderNoteList({});
    expect(markup).not.toContain('authored__inherited');
  });
});

// Quick task 261001-doi: WebKit without Safari's tab-to-highlight preference
// Tabs only into text entry and into controls that carry an explicit
// tabindex — the same rule as every link, recorded in .claude/CLAUDE.md
// (the cause is spelled out in Segmented.test.jsx). Pinned on rendered
// markup: the attribute's whole effect is in the DOM WebKit reads.
describe('NoteList — the remove controls carry an explicit tabindex (quick task 261001-doi)', () => {
  it('renders one remove button per note while developing, each tabindex="0"', () => {
    const markup = renderNoteList({ mode: 'developing' });
    const buttons = markup.match(/<button\b[^>]*>/g);
    expect(buttons).toHaveLength(oliveOilVersion.authored.beforeYouStart.length);
    expect(buttons).toHaveLength(2);
    for (const tag of buttons) {
      expect(tag).toContain('tabindex="0"');
    }
  });

  it('renders no button while reading', () => {
    expect(renderNoteList({}).match(/<button\b[^>]*>/g)).toBeNull();
  });
});

// Quick task 261101-mbe (bug-p11-bys-note-dot-on-right): Safari 27 drew the editing
// note's list dot inside the note's flex row, before Remove. The editing li now
// generates no list marker; it opens with an empty aria-hidden span the CSS draws
// the dot from, in the list's left margin, and the editing ul names its list role
// because WebKit exposes a ul whose items draw no marker as a group. The reading
// list is untouched.
describe('NoteList — the editing note draws its own dot (bug-p11-bys-note-dot-on-right)', () => {
  const notes = oliveOilVersion.authored.beforeYouStart;

  it('keeps the fixture text free of characters renderToStaticMarkup escapes', () => {
    for (const note of notes) {
      expect(note.text).not.toMatch(/[&<>"']/);
    }
  });

  for (const mode of ['creating', 'developing']) {
    it(`renders the ul as a named list with the editing modifier while ${mode}`, () => {
      const markup = renderNoteList({ mode });
      expect(markup).toMatch(/^<ul class="authored__notes authored__notes--editing" role="list">/);
    });

    it(`opens each li with an empty aria-hidden bullet before the note field while ${mode}`, () => {
      const markup = renderNoteList({ mode });
      const items = markup.match(/<li>.*?<\/li>/g);
      expect(items).toHaveLength(notes.length);
      for (const item of items) {
        expect(item.startsWith('<li><span class="authored__note-bullet" aria-hidden="true"></span><span class="authored__note-field">')).toBe(true);
      }
      expect(markup.match(/authored__note-bullet/g)).toHaveLength(notes.length);
    });

    it(`keeps only the textarea and Remove inside the note field while ${mode}`, () => {
      const markup = renderNoteList({ mode });
      const fields = markup.match(/<span class="authored__note-field">.*?<\/span>/g);
      expect(fields).toHaveLength(notes.length);
      for (const field of fields) {
        expect(field).toMatch(/^<span class="authored__note-field"><textarea\b.*<\/textarea><button\b.*>Remove<\/button><\/span>$/);
      }
    });
  }

  it('renders the reading list as the plain ul and its text, with no bullet, role or modifier', () => {
    const expected =
      '<ul class="authored__notes">' + notes.map((note) => `<li>${note.text}</li>`).join('') + '</ul>';
    expect(renderNoteList({ mode: 'reading' })).toBe(expected);
  });
});
