import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { repository } from '../store/repository.js';
import { draftMatchesCreate, newestDraft } from '../domain/draft.js';
import { NOTEBOOK_PLACE_PATH } from './notebookPaths.js';
import { CreationPage } from './CreationPage.jsx';

// The /notebook/new wrapper (Phase 10, D-01, D-02): the creation editor has
// one fixed address that holds no id, so this finds the kept create draft the
// address stands for. It reads the drafts once, in a component effect (not a
// route loader: the router is built before the store seeds, the reason
// NotebookRedirects.jsx gives), keeps the newest record the create check
// accepts, and mounts the editor keyed by that record's versionId. With none,
// or when the read fails, it replaces the address with the Notebook, silently.
//
// Start opens the editor with the route state { started: true } (a flag, never
// text). It is read once, at first render, and passed on as justStarted so the
// editor does not announce 'Draft kept' right after Start; the entry's state is
// then replaced with null, so a reload announces it. This does not read the
// drafts again: that effect's dependency list stays empty.
export function CreationRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const [record, setRecord] = useState(null);
  const startedRef = useRef(null);
  if (startedRef.current === null) startedRef.current = location.state?.started === true;
  const startedClearedRef = useRef(false);

  useEffect(() => {
    if (!startedRef.current || startedClearedRef.current) return;
    startedClearedRef.current = true;
    navigate({ pathname: location.pathname }, { replace: true, state: null });
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => repository.listDrafts())
      .then((records) => {
        if (cancelled) return;
        const found = newestDraft(records.filter(draftMatchesCreate));
        if (found) setRecord(found);
        else navigate(NOTEBOOK_PLACE_PATH, { replace: true });
      })
      .catch(() => {
        if (!cancelled) navigate(NOTEBOOK_PLACE_PATH, { replace: true });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (record === null) return null;
  return <CreationPage key={record.versionId} record={record} justStarted={startedRef.current} />;
}
