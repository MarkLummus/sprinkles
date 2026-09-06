import { buildFigures } from '../domain/figures.js';
import { GraduatedRule } from './GraduatedRule.jsx';

// The six graduated rules under the ingredient table — the brief's focal
// moment. buildFigures computes every value, band, and deviation; this
// component only renders them, in the order the domain module returns.
export function FormulationNote({ version, onFocusFigure, onBlurFigure }) {
  const figures = buildFigures(version);

  if (figures.length === 0) return null;

  return (
    <div className="formulation-note">
      <h2 className="region-name">Formulation note</h2>
      {figures.map((figure) => (
        <div key={figure.key} className="formulation-note__rule">
          <GraduatedRule figure={figure} onFocusFigure={onFocusFigure} onBlurFigure={onBlurFigure} />
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
