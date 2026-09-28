// Pure. No framework, no DOM, no store import. The History rail's own
// entries and hint text (03.5-05, sketch 011 decision 4): a flat, dated
// list of a recipe's own versions, oldest first, replacing the nested
// version/batch tree RecipeHistory.jsx drew before this plan. Batches
// live only in the App-context batch log now (plan 07) — the rail never
// names one.
import { sortedVersions, versionIdentity } from './lineage.js';
import { dayMonthWords, latestChurnDate } from './batch.js';

// The rail's own chronological order (the retired nested tree's own
// compareChronological rule, carried over unchanged): ascending by
// createdAt, undated last. sortedVersions elsewhere in the codebase is
// DESCENDING (most recent first, for the "Latest" ordinal read) — the
// rail draws oldest left, so it keeps its own ascending comparator
// rather than reversing sortedVersions's array (reversing would put an
// undated version FIRST, not last).
function compareChronological(a, b) {
  if (a.createdAt === b.createdAt) return 0;
  if (a.createdAt == null) return 1;
  if (b.createdAt == null) return -1;
  return a.createdAt < b.createdAt ? -1 : 1;
}

/**
 * railEntries(versions, allBatches, { currentVersionId, draft }) -> the
 * rail's own node list, oldest first: one entry per version in `versions`
 * (already scoped to one recipe by the caller), plus a trailing draft
 * entry while `draft` is given (03.5-05 Task 2; the ordinal is the saved
 * count plus one, D-13's in-memory-only draft). `ordered` — for the
 * ordinal versionIdentity prints and for `latest` — reads the same
 * sortedVersions/versionIdentity pair every other version-naming site in
 * the app reads, so the rail's "Latest" word never disagrees with the
 * version column's own. An unchurned version's stateWords split by
 * position (decisions_recorded 2, 03.5-18 Task 2): the latest reads "not
 * yet churned", an older one "not churned" — it was never going to be,
 * unlike the latest, which merely has not been yet.
 */
export function railEntries(versions, allBatches, { currentVersionId, draft = null } = {}) {
  const ordered = sortedVersions(versions);
  const latestId = ordered[0]?.id ?? null;

  const entries = [...versions].sort(compareChronological).map((version) => {
    const versionBatches = allBatches.filter((batch) => batch.versionId === version.id);
    const churned = versionBatches.length > 0;
    const latest = version.id === latestId;
    // The state words split by position (decisions_recorded 2, 03.5-18 Task
    // 2): the LATEST unchurned version reads "not yet churned"
    // (1600-no-batch.html's rail); an OLDER one reads "not churned"
    // (upright-393.html's Version 4) — it was never going to be churned
    // now, unlike the latest, which is only not yet.
    const baseWords = churned
      ? `churned ${dayMonthWords(latestChurnDate(versionBatches))}`
      : latest
        ? 'not yet churned'
        : 'not churned';
    return {
      id: version.id,
      dateWords: dayMonthWords(version.createdAt),
      name: versionIdentity(ordered, version),
      stateWords: latest ? `${baseWords} · Latest` : baseWords,
      churned,
      inView: version.id === currentVersionId,
      latest,
      isDraft: false,
    };
  });

  if (draft) {
    const ordinal = versions.length + 1;
    entries.push({
      id: 'draft',
      dateWords: dayMonthWords(draft.createdAt),
      name: draft.label ? `Version ${ordinal} · ${draft.label}` : `Version ${ordinal}`,
      stateWords: 'draft',
      churned: false,
      inView: false,
      latest: false,
      isDraft: true,
    });
  }

  return entries;
}

/**
 * railHint(count, { open, upright, overflowing }) -> the count beside the
 * History fold's own control (1366-batch.html, upright-393.html; sketch 011
 * decision 19, 03.5-18 Task 1): the bare count while closed, "· latest
 * first" while open and upright (below 1366), "· oldest left, latest
 * right" while open and horizontal (1366 and up) — plus "· opens at the
 * version in view" appended only while the horizontal rail actually
 * overflows its own width (1600-long-history.html; never while upright,
 * which never overflows its own column).
 */
export function railHint(count, { open = false, upright = false, overflowing = false } = {}) {
  const base = `${count} version${count === 1 ? '' : 's'}`;
  if (!open) return base;
  if (upright) return `${base} · latest first`;
  return overflowing ? `${base} · oldest left, latest right · opens at the version in view` : `${base} · oldest left, latest right`;
}
