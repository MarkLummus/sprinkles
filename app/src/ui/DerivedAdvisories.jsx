import { buildAdvisories } from '../domain/advisories.js';

// The margin's derived block (FORM2-02): a pure render over
// buildAdvisories' own output, modelled on FormulationNote.jsx — return
// null when there is nothing structural to say, so a version with no
// advisories renders no block at all rather than an empty one. This
// component computes nothing itself: no arithmetic, no number formatting,
// no decision about which advisories apply. Each advisory renders as a
// small-print paragraph in ink, its words followed by its basis line.
export function DerivedAdvisories({ version }) {
  const advisories = buildAdvisories(version);

  if (advisories.length === 0) return null;

  return (
    <div className="derived-advisories">
      <p className="derived-advisories__legend">
        <span>Advisories</span>
        <span>derived</span>
      </p>
      {advisories.map((advisory) => (
        <p key={advisory.key} className="derived-advisories__item">
          {advisory.words} {`basis: ${advisory.basis}`}
        </p>
      ))}
    </div>
  );
}
