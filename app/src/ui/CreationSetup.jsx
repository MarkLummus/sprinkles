import { Button } from './Button.jsx';
import { readSignedInput, shownSignedValue } from './BatchRow.jsx';
import { useCatalog } from './CatalogContext.jsx';
import { FIGURE_SPECS, figureLabelText } from '../domain/figures.js';
import { applyStyle, clearStyle, setBandEnd } from '../domain/creation.js';

// The creation editor's log column (Phase 10, MAKE-09, sketch 013
// style-menu-and-bands.html): the Style region, a menu of the catalog's styles,
// the serving temperature and the six balance bands. There is no machine and
// no process here (decisions 15 and 20). Every change is handed to onChange as
// an updater over the newest draft, never as a draft built from this render's
// createDraft, so two edits in one React batch both land (usePenDraft.js:41-45:
// read the value first, then update). createDraft is read only to draw the
// fields. The regions are returned without a wrapper: the aside is the page's.

export function CreationSetup({ createDraft, onChange }) {
  const { catalog } = useCatalog();

  const handleStyle = (event) => {
    const chosen = event.target.value;
    const row = catalog.styles.find((style) => style.id === chosen);
    if (row) onChange((prev) => applyStyle(prev, row));
    else onChange((prev) => clearStyle(prev));
  };

  // A number input hands over no text for an entry it cannot read, and React's
  // onChange misses a lone minus, so one handler serves change and input.
  const handleTemperature = (event) => {
    const raw = readSignedInput(event.target);
    onChange((prev) => ({ ...prev, serveTempC: raw }));
  };

  const handleBandEnd = (targetKey, endIndex) => (event) => {
    const raw = event.target.value;
    onChange((prev) => setBandEnd(prev, targetKey, endIndex, raw));
  };

  return (
    <section className="batch-row mk-region" aria-label="Style">
      <div className="batch-row__head">
        <div className="batch-row__head-lead">
          <h2 className="region-name">Style</h2>
        </div>
        {createDraft.style !== null && (
          <div className="batch-row__head-acts">
            <Button className="text-control" aria-label="Clear Style" onClick={() => onChange((prev) => clearStyle(prev))}>
              Clear
            </Button>
          </div>
        )}
      </div>
      <div className="mk-body">
        <div className="mk-menu-wrap">
          <select
            className="ink-field mk-menu"
            aria-label="Style"
            tabIndex={0}
            value={createDraft.style ?? ''}
            onChange={handleStyle}
          >
            <option value="">No style</option>
            {catalog.styles.map((style) => (
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
          </select>
        </div>
        <label className="notebook-field">
          <span className="notebook-caption">Serving temperature</span>
          <span className="mk-field-row">
            <input
              className="ink-field"
              type="number"
              step="any"
              aria-label="Serving temperature, degrees Celsius"
              value={shownSignedValue(createDraft.serveTempC)}
              onChange={handleTemperature}
              onInput={handleTemperature}
              onWheel={(event) => event.currentTarget.blur()}
            />
            <span className="mk-unit">°C</span>
          </span>
        </label>
        <span className="notebook-caption">Targets</span>
        <div>
          {FIGURE_SPECS.map((spec) => {
            const label = figureLabelText(spec.label);
            const ends = createDraft.targets[spec.targetKey] ?? ['', ''];
            return (
              <div className="mk-band" key={spec.key}>
                <span className="mk-band__label">
                  {spec.label.word}
                  {spec.label.term && ' '}
                  {spec.label.term && <small>· {spec.label.term}</small>}
                </span>
                <span className="mk-band__ends">
                  <input
                    className="ink-field"
                    type="text"
                    inputMode="decimal"
                    aria-label={`${label}, target low`}
                    value={ends[0]}
                    onChange={handleBandEnd(spec.targetKey, 0)}
                  />
                  <span className="mk-band__unit" aria-hidden="true">
                    –
                  </span>
                  <input
                    className="ink-field"
                    type="text"
                    inputMode="decimal"
                    aria-label={`${label}, target high`}
                    value={ends[1]}
                    onChange={handleBandEnd(spec.targetKey, 1)}
                  />
                  <span className="mk-band__unit">{spec.unit}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
