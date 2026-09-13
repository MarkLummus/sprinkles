import { COEFFICIENT_SET, LACTOSE_FRACTION_OF_MSNF, PAC_LACTOSE } from '../domain/composition.js';
import { buildFigures } from '../domain/figures.js';

function joinNames(names) {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

// The standing statement of what every figure in the formulation note rests
// on — one small-print note (D-11), not six per-figure ones. Per-figure
// detail belongs to the trace-to-contributors interaction plan 01-04 builds;
// this note only states the coefficient set, both conventions, and which
// rows are estimated, all read from the domain modules rather than typed.
export function BasisNote({ version }) {
  const figures = buildFigures(version);
  if (figures.length === 0) return null;

  const estimatedRowNames = version.rows
    .map((row) => row.ingredientName)
    .filter((name) => figures.some((figure) => figure.estimatedRowNames.includes(name)));

  const lactosePercent = (LACTOSE_FRACTION_OF_MSNF * 100).toFixed(1);

  const estimatedClause =
    estimatedRowNames.length > 0
      ? `${joinNames(estimatedRowNames)} ${estimatedRowNames.length === 1 ? 'is' : 'are'} estimated`
      : 'no row in this version rests on estimated data';

  return (
    <p className="basis-note">
      Computed from {COEFFICIENT_SET.name}. PAC relative to sucrose = 100, the same reference basis lactose's own
      PAC ({PAC_LACTOSE}) is expressed against; lactose is taken as {lactosePercent}% of MSNF. {estimatedClause}.
    </p>
  );
}
