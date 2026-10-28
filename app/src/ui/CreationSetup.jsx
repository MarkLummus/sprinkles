import { useEffect, useRef } from 'react';
import { Button } from './Button.jsx';
import { readSignedInput, shownSignedValue } from './BatchRow.jsx';
import { useCatalog } from './CatalogContext.jsx';
import { FieldFeedback } from './FieldFeedback.jsx';
import { Segmented } from './Segmented.jsx';
import { FIGURE_SPECS, figureLabelText } from '../domain/figures.js';
import { mintScaleKey, MAX_RECIPE_PROBLEMS, MAX_RECIPE_SCALES } from '../domain/catalog.js';
import { freshId } from '../domain/id.js';
import {
  applyStyle,
  clearStyle,
  setBandEnd,
  addScale,
  updateScale,
  removeScale,
  scaleStopsLine,
  addProblem,
  updateProblem,
  removeProblem,
} from '../domain/creation.js';

// The creation editor's log column (Phase 10, MAKE-09, TASTE-01, sketch 013
// style-menu-and-bands.html and scales-and-problems.html): the Style region, a
// menu of the catalog's styles, the serving temperature and the six balance
// bands, then the Scales and Problems regions. There is no machine and
// no process here (decisions 15 and 20). Every change is handed to onChange as
// an updater over the newest draft, never as a draft built from this render's
// createDraft, so two edits in one React batch both land (usePenDraft.js:41-45:
// read the value first, then update). createDraft is read only to draw the
// fields. The regions are returned without a wrapper: the aside is the page's.

// The Kind group's two cells, in the maker's words, and what each stores.
const KIND_WORDS = { goldilocks: 'Right in the middle', magnitude: 'Low to high' };
const KIND_OPTIONS = Object.values(KIND_WORDS);
const KIND_BY_WORD = { 'Right in the middle': 'goldilocks', 'Low to high': 'magnitude' };

const isBlank = (text) => text.trim() === '';

// One labelled text field of a card: the caption, the input named by it and,
// while it is blank, the Required line under it, or the refused Save's message
// in its place. Words are React text only.
function CardField({ label, value, onChange, error = null, errorId }) {
  return (
    <label className="notebook-field">
      <span className="notebook-caption">{label}</span>
      <input
        className="ink-field"
        type="text"
        aria-label={label}
        value={value}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={onChange}
      />
      <FieldFeedback error={error} errorId={errorId} required={isBlank(value)} />
    </label>
  );
}

export function CreationSetup({ createDraft, onChange, saveMessages = null }) {
  const { catalog } = useCatalog();
  // Focus follows an add or a remove, after the render that drew its target
  // (at the two-scale limit Add scale is absent until the remove's render). A
  // handler leaves a request; the effect below finds the target inside its own
  // region, since every card's field is labelled Name, and focuses it once.
  const scalesRef = useRef(null);
  const problemsRef = useRef(null);
  const focusRequestRef = useRef(null);

  useEffect(() => {
    const request = focusRequestRef.current;
    if (!request) return;
    focusRequestRef.current = null;
    const region = (request.endsWith('scale') ? scalesRef : problemsRef).current;
    if (!region) return;
    const target = request.startsWith('new-')
      ? [...region.querySelectorAll('.mk-card')].pop()?.querySelector('input[aria-label="Name"]')
      : region.querySelector('.mk-add');
    target?.focus();
  });

  const coreScales = catalog.scales.filter((scale) => scale.group === 'core').map((scale) => scale.name).join(', ');
  const coreProblems = catalog.problems.map((problem) => problem.name).join(' · ');

  // A new scale's key is minted here, once, never in render (D-03b).
  const handleAddScale = () => {
    const key = mintScaleKey(freshId());
    onChange((prev) => addScale(prev, key));
    focusRequestRef.current = 'new-scale';
  };

  const handleRemoveScale = (key) => {
    onChange((prev) => removeScale(prev, key));
    focusRequestRef.current = 'add-scale';
  };

  const handleScaleField = (key, field) => (event) => {
    const raw = event.target.value;
    onChange((prev) => updateScale(prev, key, field, raw));
  };

  const handleScaleKind = (key, word) => {
    onChange((prev) => updateScale(prev, key, 'kind', KIND_BY_WORD[word]));
  };

  const handleAddProblem = () => {
    onChange((prev) => addProblem(prev));
    focusRequestRef.current = 'new-problem';
  };

  const handleRemoveProblem = (index) => {
    onChange((prev) => removeProblem(prev, index));
    focusRequestRef.current = 'add-problem';
  };

  const handleProblemName = (index) => (event) => {
    const raw = event.target.value;
    onChange((prev) => updateProblem(prev, index, raw));
  };

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
    <>
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
          <h3 className="notebook-caption mk-cue-targets">Targets</h3>
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
      <section className="batch-row mk-region" aria-label="Scales" ref={scalesRef}>
        <div className="batch-row__head">
          <div className="batch-row__head-lead">
            <h2 className="region-name">Scales</h2>
          </div>
        </div>
        <div className="mk-body">
          <h3 className="pen-caption mk-cue">Every recipe</h3>
          <p className="mk-core">{coreScales}</p>
          {createDraft.scales.length > 0 && <h3 className="pen-caption mk-cue">This recipe only</h3>}
          {createDraft.scales.map((scale, index) => {
            const stops = scaleStopsLine(scale);
            // A refused Save's message for a field of this card, by the gate's block id.
            const refused = (field) => saveMessages?.get(`scale:${scale.key}:${field}`) ?? null;
            const errorId = (field) => `create-scale-${scale.key}-${field}-error`;
            return (
              <div className="mk-card" role="group" aria-label={`Scale ${index + 1}`} key={scale.key}>
                <div className="mk-caprow">
                  <CardField
                    label="Name"
                    value={scale.name}
                    onChange={handleScaleField(scale.key, 'name')}
                    error={refused('name')}
                    errorId={errorId('name')}
                  />
                  <Button className="text-control" onClick={() => handleRemoveScale(scale.key)}>
                    Remove
                  </Button>
                </div>
                <div className="mk-pair">
                  <CardField
                    label="Low end"
                    value={scale.low}
                    onChange={handleScaleField(scale.key, 'low')}
                    error={refused('low')}
                    errorId={errorId('low')}
                  />
                  <CardField
                    label="High end"
                    value={scale.high}
                    onChange={handleScaleField(scale.key, 'high')}
                    error={refused('high')}
                    errorId={errorId('high')}
                  />
                </div>
                <Segmented
                  groupLabel="Kind"
                  name={`kind-${scale.key}`}
                  clearable={false}
                  options={KIND_OPTIONS}
                  value={KIND_WORDS[scale.kind] ?? ''}
                  onChange={(word) => handleScaleKind(scale.key, word)}
                  error={refused('kind')}
                  errorId={errorId('kind')}
                />
                {stops !== null && <p className="mk-stops">{stops}</p>}
              </div>
            );
          })}
          {createDraft.scales.length < MAX_RECIPE_SCALES && (
            <p className="mk-add-row">
              <Button className="text-control mk-add" onClick={handleAddScale}>
                Add scale
              </Button>
            </p>
          )}
        </div>
      </section>
      <section className="batch-row mk-region" aria-label="Problems" ref={problemsRef}>
        <div className="batch-row__head">
          <div className="batch-row__head-lead">
            <h2 className="region-name">Problems</h2>
          </div>
        </div>
        <div className="mk-body">
          <h3 className="pen-caption mk-cue">Every recipe</h3>
          <p className="mk-core">{coreProblems}</p>
          {createDraft.problems.length > 0 && <h3 className="pen-caption mk-cue">This recipe only</h3>}
          {createDraft.problems.map((problem, index) => (
            // A problem is words only, with no key of its own: its place is its identity.
            <div className="mk-card" role="group" aria-label={`Problem ${index + 1}`} key={index}>
              <div className="mk-caprow">
                <CardField
                  label="Name"
                  value={problem}
                  onChange={handleProblemName(index)}
                  error={saveMessages?.get(`problem:${index}`) ?? saveMessages?.get(`problem-repeat:${index}`) ?? null}
                  errorId={`create-problem-${index}-error`}
                />
                <Button className="text-control" onClick={() => handleRemoveProblem(index)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {createDraft.problems.length < MAX_RECIPE_PROBLEMS && (
            <p className="mk-add-row">
              <Button className="text-control mk-add" onClick={handleAddProblem}>
                Add problem
              </Button>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
