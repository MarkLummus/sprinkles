// The maker's own judgement, kept visibly apart from anything the app
// derives. Each note is { text, inheritedFrom } (D-06): keyed by index
// rather than by the note string, since two notes may carry the same
// text. Method.jsx is NoteList's one caller now — it heads the Method
// with "Before you start" (03.3-01). The Authored wrapper and its
// Carried forward legend that used to render a second list in column two
// are gone: the list itself is gone from the store, seed and every test
// (03.5-CONTEXT.md decision 10, D-06 of the 03.5 revision) — dropped, not
// moved.
//
// While developing (03-02), each note becomes a text field with a remove
// control beside it. A note's inheritedFrom marker renders as a trailing
// small-print qualifier on the note's own <li> — a note is still authored
// prose, just carrying provenance — and is read directly off the note
// object handed in: the page (RecipePage) is the one place that decides
// whether that marker still applies, by clearing it in the draft the
// instant the note's text differs from the text it was inherited with
// (route-recipe-version.md, "Inherited notes").
export function NoteList({ listKey, notes, mode, onChangeNoteText, onRemoveNote }) {
  const isDeveloping = mode === 'developing';
  return (
    <ul className="authored__notes">
      {notes.map((note, index) => (
        <li key={index}>
          {isDeveloping ? (
            <span className="authored__note-field">
              <textarea
                className="prose-field"
                rows="2"
                value={note.text}
                aria-label={`${listKey} note ${index + 1}`}
                onChange={(event) => onChangeNoteText(listKey, index, event.target.value)}
              />
              <button type="button" onClick={() => onRemoveNote(listKey, index)}>
                remove
              </button>
            </span>
          ) : (
            note.text
          )}
          {note.inheritedFrom && <span className="authored__inherited">{` from ${note.inheritedFrom}`}</span>}
        </li>
      ))}
    </ul>
  );
}
