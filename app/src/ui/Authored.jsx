// The maker's own judgement, kept visibly apart from anything the app
// derives. Each list carries a legend naming the block and the word
// "authored" so a reader can tell at a glance which is which.
export function Authored({ carriedForward, beforeYouStart }) {
  return (
    <div className="authored">
      <p className="authored__legend">
        <span>Carried forward</span>
        <span>authored</span>
      </p>
      <ul className="authored__notes">
        {carriedForward.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>

      <p className="authored__legend">
        <span>Before you start</span>
        <span>authored</span>
      </p>
      <ul className="authored__notes">
        {beforeYouStart.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}
