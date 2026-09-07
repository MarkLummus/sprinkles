// The maker's own judgement, kept visibly apart from anything the app
// derives. Each list carries a legend naming the block and the word
// "authored" so a reader can tell at a glance which is which. Each note is
// now { text, inheritedFrom } (D-06): keyed by index rather than by the
// note string, since two notes may carry the same text.
export function Authored({ carriedForward, beforeYouStart }) {
  return (
    <div className="authored">
      <p className="authored__legend">
        <span>Carried forward</span>
        <span>authored</span>
      </p>
      <ul className="authored__notes">
        {carriedForward.map((note, index) => (
          <li key={index}>{note.text}</li>
        ))}
      </ul>

      <p className="authored__legend">
        <span>Before you start</span>
        <span>authored</span>
      </p>
      <ul className="authored__notes">
        {beforeYouStart.map((note, index) => (
          <li key={index}>{note.text}</li>
        ))}
      </ul>
    </div>
  );
}
