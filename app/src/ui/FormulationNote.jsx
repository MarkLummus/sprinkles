import { buildFigures } from '../domain/figures.js';
import { GraduatedRule } from './GraduatedRule.jsx';

// The six graduated rules under the ingredient table — the brief's focal
// moment. buildFigures computes every value, band, and deviation; this
// component only renders them, in the order the domain module returns.
export function FormulationNote({ version, mode, onFocusFigure, onBlurFigure }) {
  const figures = buildFigures(version);

  if (figures.length === 0) return null;

  // D-03/D-04: while recording, the sheet's page order runs churn date,
  // as-made, method, then the churn section — the six rules are not on
  // that path, so their tab stop is off (they stay clickable and keep
  // their focus treatment).
  const tabIndex = mode === 'recording' ? -1 : undefined;

  return (
    <div className="formulation-note">
      <h2 className="region-name">Formulation note</h2>
      {figures.map((figure) => (
        <div key={figure.key} className="formulation-note__rule">
          <GraduatedRule figure={figure} tabIndex={tabIndex} onFocusFigure={onFocusFigure} onBlurFigure={onBlurFigure} />
          {figure.key === 'fat' && (
            <p className="formulation-note__fat-breakdown">
              Milkfat {figure.milkfat.toFixed(1)}% and added fat {figure.addedFat.toFixed(1)}% —{' '}
              {Math.round(figure.addedFatShareOfFat)}% of fat.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
