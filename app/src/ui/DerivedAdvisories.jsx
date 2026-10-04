import { buildAdvisories } from '../domain/advisories.js';
import { FoldRow } from './FoldRow.jsx';
import { useFold } from './useBelowDesktop.js';

// The margin's derived block (FORM2-02): a pure render over
// buildAdvisories' own output, modelled on FormulationNote.jsx — return
// null when there is nothing structural to say, so a version with no
// advisories renders no block at all rather than an empty one. This
// component computes nothing itself: no arithmetic, no number formatting,
// no decision about which advisories apply. Each advisory renders as a
// small-print paragraph in ink, its words followed by its basis line.
//
// Watch for owns its own fold (sketch 011 decisions 18/19, 03.5-16
// decisions_recorded 1): the block already returns null when there is
// nothing to say, so an empty block shows no control either. `foldsOpen`
// (default true, the two-column answer) is RecipePage's 984 read
// (useSheetTwoColumns, decision 33), not the 1366 one the band's and log's
// folds take; useFold resets to it on every crossing of that cut (03.5-15),
// with no state stored. The old
// "Things to check"/"derived" legend paragraph is retired — the section
// now wears its own region-name heading, "Watch for" (decision 18), with
// no "derived" label anywhere.
export function DerivedAdvisories({ version, foldsOpen = true }) {
  const advisories = buildAdvisories(version);
  const [open, toggle] = useFold(foldsOpen);

  if (advisories.length === 0) return null;

  return (
    <div className="derived-advisories">
      <h2 className="region-name">
        <FoldRow label="Watch for" open={open} onToggle={toggle} controls="fold-check" />
      </h2>
      <div id="fold-check" hidden={!open}>
        {advisories.map((advisory) => (
          <p key={advisory.key} className="derived-advisories__item">
            {advisory.words} {`basis: ${advisory.basis}`}
          </p>
        ))}
      </div>
    </div>
  );
}
