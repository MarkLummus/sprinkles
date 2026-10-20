import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
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
export function CreationRoute() {
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);

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
  return <CreationPage key={record.versionId} record={record} />;
}
