import { useEffect, useRef } from 'react';
import { versionsForRecipe } from '../domain/lineage.js';

// The route-intent job (Phase 8 cut 7): consume-once openers that wait on the
// draft restore. Home and the band ask the page to open a pen through route
// state; this hook reads the two requests and, once the kept draft has been
// decided, calls the opener it was given. The hook never opens a pen itself.
export function useRouteIntents({
  location,
  navigate,
  mode,
  batchId,
  batches,
  draftRestoreDone,
  versionsLoaded,
  draftsLoaded,
  versions,
  drafts,
  version,
  onStartAmending,
  onStartDeveloping,
}) {
  // The band's Record a tasting, pressed on an older batch's address, moves
  // to the awaiting batch's own address and sets this (handleStartTasting);
  // the effect below opens the pen once that page instance has its batches.
  const startTastingOnMount = Boolean(location.state?.startTasting);
  // Home's Next version sets this; the effect below opens the Next version pen
  // once this page has decided its kept draft.
  const startNextVersionOnMount = Boolean(location.state?.startNextVersion);

  // Opens the pen the band's Record a tasting asked for across a remount
  // (route state, the focusBatch pattern: the router keys RecipePage by
  // address, so state is all that crosses). Consumed once: the entry's
  // state is replaced with null, so Back or a reload never reopens a pen.
  // It waits for the draft restore: a draft kept on this page reopens its own
  // pen and consumes the request without opening a second one.
  // onStartAmending is useBatchRecording's handleStartAmending, a function
  // declaration that reads only refs, setters, the onPageStatus prop and the
  // recordPen hook value, so calling it from here, above the early returns, is
  // safe.
  const startTastingConsumedRef = useRef(false);
  useEffect(() => {
    if (!startTastingOnMount || startTastingConsumedRef.current || !draftRestoreDone) return;
    if (!batchId) return;
    if (mode !== 'reading') {
      startTastingConsumedRef.current = true;
      navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });
      return;
    }
    const target = batches.find((batch) => batch.id === batchId);
    if (!target || target.tasting) return;
    startTastingConsumedRef.current = true;
    navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });
    onStartAmending(target, { opener: 'record-a-tasting' });
  }, [startTastingOnMount, mode, batchId, batches, draftRestoreDone]);

  // Opens the Next version pen Home's Next version asked for, the startTasting
  // effect's pattern: used once, the entry's state replaced with null before
  // the pen opens, so Back, Forward or a reload never reopens it. A kept draft
  // wins, twice over: a pen already open (a restored one included) means
  // nothing more is opened, and so does a draft kept on another version of
  // this recipe (this version's own was decided by the restore). The pen
  // itself is the button's own, through handleStartDeveloping.
  const startNextVersionConsumedRef = useRef(false);
  useEffect(() => {
    if (!startNextVersionOnMount || startNextVersionConsumedRef.current) return;
    if (!draftRestoreDone || !versionsLoaded || !draftsLoaded) return;
    startNextVersionConsumedRef.current = true;
    navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });
    if (mode !== 'reading') return;
    const recipeVersionIds = new Set(versionsForRecipe(versions, version.recipeId).map((candidate) => candidate.id));
    if (drafts.some((record) => record.versionId !== version.id && recipeVersionIds.has(record.versionId))) return;
    onStartDeveloping();
  }, [startNextVersionOnMount, mode, draftRestoreDone, versionsLoaded, draftsLoaded, versions, drafts, version]);
}
