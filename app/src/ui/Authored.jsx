// The maker's own judgement, kept visibly apart from anything the app
// derives. Each list carries a legend naming the block and the word
// "authored" so a reader can tell at a glance which is which. Each note is
// now { text, inheritedFrom } (D-06): keyed by index rather than by the
// note string, since two notes may carry the same text.
//
// While developing (03-02), each note becomes a text field with a remove
// control beside it. A note's inheritedFrom marker renders as a trailing
// small-print qualifier on the note's own <li> — a note is still authored
// prose, just carrying provenance — and is read directly off the note
// object handed in: the page (RecipePage) is the one place that decides
// whether that marker still applies, by clearing it in the draft the
// instant the note's text differs from the text it was inherited with
// (route-recipe-version.md, "Inherited notes").
function NoteList({ listKey, notes, mode, onChangeNoteText, onRemoveNote }) {
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

export function Authored({
  carriedForward,
  beforeYouStart,
  mode = 'reading',
  onChangeNoteText = () => {},
  onRemoveNote = () => {},
}) {
  return (
    <div className="authored">
      <p className="authored__legend">
        <span>Carried forward</span>
        <span>authored</span>
      </p>
      <NoteList
        listKey="carriedForward"
        notes={carriedForward}
        mode={mode}
        onChangeNoteText={onChangeNoteText}
        onRemoveNote={onRemoveNote}
      />

      <p className="authored__legend">
        <span>Before you start</span>
        <span>authored</span>
      </p>
      <NoteList
        listKey="beforeYouStart"
        notes={beforeYouStart}
        mode={mode}
        onChangeNoteText={onChangeNoteText}
        onRemoveNote={onRemoveNote}
      />
    </div>
  );
}
