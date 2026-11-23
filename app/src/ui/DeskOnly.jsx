import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { repository } from '../store/repository.js';
import { creationTitle } from '../domain/creation.js';
import { draftMatchesCreate, draftMatchesEdit, newestDraft } from '../domain/draft.js';
import { sortedVersions, versionIdentity, versionsForRecipe } from '../domain/lineage.js';
import { notebookPath } from './notebookPaths.js';
import { DRAFT_LINE_ENDING, EDIT_KEPT_LINE } from './VersionRow.jsx';
import { Placeholder } from './Placeholder.jsx';
import { useBelow724 } from './useBelowDesktop.js';

// The route wrapper for the two addresses that open the creation editor
// (PHONE-01; sketch 016 CONTRACT sections 4 and 12; PRODUCT.md "On the
// phone"): creating and editing are done in a wider window. Below 724 the
// address shows the built placeholder place with one line in place of the
// editor, and from 724 up it shows its children untouched. It sits on the
// route element, outside CreationRoute and EditRoute, so below 724 neither
// mounts and none of their draft reads, writes or redirects runs.
//
// The line says what is kept, in the recipe head's own sentences (README
// decision 25): "Edit kept. ..." for an edit kept on its version, "Draft: <name>.
// ..." for a create draft kept, else "Done in a wider window." On Edit one
// link names the recipe and version the edit would open on. The page READS
// the kept draft through the reads CreationRoute and EditRoute make, and
// never writes or deletes one. The read starts inside Promise.resolve().then,
// as CreationRoute's does: a leaving editor flushes its waiting draft from its
// unmount cleanup the same way, so the flush is called first and the line
// names what was typed.
//
// States the snapshot does not draw, each a built precedent: while the read
// is out, the title alone; a read that fails, an address naming no stored
// version (a version of another recipe, or no recipe) or a create draft that
// is not a creation, "Done in a wider window." and no link; a blank draft
// name, creationTitle's "Untitled"; a version holding a pen draft, or one
// that can no longer be edited, "Done in a wider window." with the link.
const DONE_LINE = 'Done in a wider window.';
const NOTHING = { note: DONE_LINE, link: null };

async function readCreate() {
  const found = newestDraft((await repository.listDrafts()).filter(draftMatchesCreate));
  if (!found) return NOTHING;
  return { note: `Draft: ${creationTitle(found.payload.name)}${DRAFT_LINE_ENDING}`, link: null };
}

async function readEdit(recipeId, versionId) {
  const [version, recipe, versions, draft] = await Promise.all([
    repository.getVersion(versionId),
    repository.getRecipe(recipeId),
    repository.listVersions(),
    repository.getDraft(versionId),
  ]);
  if (!version || version.recipeId !== recipeId || !recipe) return NOTHING;
  const ordered = sortedVersions(versionsForRecipe(versions, version.recipeId));
  return {
    note: draft && draftMatchesEdit(draft) ? EDIT_KEPT_LINE : DONE_LINE,
    link: { text: `${recipe.name} · ${versionIdentity(ordered, version)}`, to: notebookPath(version.recipeId, version.id) },
  };
}

function DeskPage({ title }) {
  const { recipeId, versionId } = useParams();
  const [read, setRead] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setRead(null);
    Promise.resolve()
      .then(() => (versionId === undefined ? readCreate() : readEdit(recipeId, versionId)))
      .then((result) => {
        if (!cancelled) setRead(result);
      })
      .catch(() => {
        if (!cancelled) setRead(NOTHING);
      });
    return () => {
      cancelled = true;
    };
  }, [recipeId, versionId]);

  return (
    <Placeholder name={title} note={read === null ? null : read.note}>
      {read?.link && (
        <p className="place__for">
          <Link to={read.link.to} tabIndex={0}>{read.link.text}</Link>
        </p>
      )}
    </Placeholder>
  );
}

export function DeskOnly({ title, children }) {
  const below724 = useBelow724();
  if (below724) return <DeskPage title={title} />;
  return children;
}
