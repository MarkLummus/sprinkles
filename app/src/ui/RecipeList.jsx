import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { repository } from '../store/repository.js';
import { computeBalance } from '../domain/composition.js';
import { exportStore, importStore } from '../store/transfer.js';

// The arrival the brief calls "departing from the list" (D-13). One item
// per stored version: recipe name, version line, and batch mass.
export function RecipeList() {
  const [versions, setVersions] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    repository.listVersions().then((result) => {
      if (!cancelled) setVersions(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Export hands the maker a file, using the browser's own object URL and
  // an anchor click — no upload, no network, no external service (D-06).
  async function handleExport() {
    const exported = await exportStore(repository);
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'sprinkles-store.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  // Import reads a file the maker chose, using the browser's local file
  // reading. On rejection the errors render as text; nothing is replaced
  // or cleared.
  async function handleImportChange(event) {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;

    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      setImportErrors(['$: the file is not valid JSON']);
      return;
    }

    const result = await importStore(repository, parsed);
    if (!result.ok) {
      setImportErrors(result.errors);
      return;
    }
    setImportErrors([]);
    setVersions(await repository.listVersions());
  }

  if (versions === null) return null;

  return (
    <>
      <div className="recipe-list__transfer">
        <button type="button" onClick={handleExport}>
          Export
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="recipe-list__file-input"
          onChange={handleImportChange}
          tabIndex={-1}
          aria-hidden="true"
        />
        {importErrors.length > 0 && (
          <ul className="recipe-list__import-errors">
            {importErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </div>
      <ul className="recipe-list">
        {versions.map((version) => {
          const balance = computeBalance(version.rows);
          return (
            <li key={version.id}>
              <Link to={`/recipe/${version.id}`}>
                <span className="recipe-list__name">{version.recipeName}</span>
                <span className="recipe-list__version">{version.versionLabel}</span>
                <span className="recipe-list__mass">{balance ? `${balance.mass.toFixed(1)} g` : 'no ingredient rows'}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
