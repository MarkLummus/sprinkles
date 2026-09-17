# 260916-xbh — Context (locked decisions)

Source: `/impeccable harden` on the batch record's save path, 2026-09-16. Mark answered the one open
design question in-session; everything below is decided, not open. Do not revisit.

**Authority, in order:**

1. `.impeccable/surfaces/route-recipe-batch.md` § 3 "Saving says what it wrote, and the churn date is
   named required" (added in commit 2ec1627) and § 6 "Feedback". Read both before planning.
2. `.impeccable/critique/2026-09-16T18-58-36Z__app-src-ui-batchrow-jsx.md` — Priority Issues 1 and 2
   are the two this task closes. Issues 3, 4 and 5 are already closed in code; do not redo them.
3. `DESIGN.md` and `app/src/styles/tokens.css` for every visual value.

**Mark's ruling (2026-09-16, this session):** the churn date is named required *before* the refusal,
not only in it. That narrows the brief's anti-goal "no required field anywhere in the record" to the
record's *content*; the churn date is the batch's name, not its content. The brief already carries
the narrowed wording.

## Root cause — verified before planning, do not re-derive

`app/src/router.jsx:29` keys `RecipePage` by `${id}::${batchId ?? ''}`. `handleSaveBatch`'s
`navigate(`/recipe/${id}/batch/${record.id}`)` (`app/src/ui/RecipePage.jsx:1326`) therefore
**remounts the page**. Every ref resets — including `app/src/ui/VersionRow.jsx:98` `wasRecordingRef`,
the focus-return latch — `formStatus` re-initialises to `''`, and the `.form-status` region
(`app/src/ui/BatchRow.jsx:780`) unmounts with the pen.

One cause, three measured symptoms: `activeElement` is `<body>`, zero `[role=status]` on the page,
scroll jumps to top. The amend path never navigates, which is why Correct→Save already returns focus
correctly today.

**Do NOT remove or weaken the route key.** Its header comment documents two data-corruption bugs it
makes unreachable (a stale `amendingBatchId` throwing in `recordAmendment`; a child version written
against the wrong parent's rows). The fix goes *through* the remount, not around it.

## Work item 1 — the save's confirmation survives the navigation

- Carry it as route state, mirroring the precedent already in this file:
  `navigate(url, { state: { ... } })` as written at `RecipePage.jsx:1607` (`{ focusDevelop: true }`),
  read back on the fresh instance beside `RecipePage.jsx:562`'s `location.state?.focusDevelop`.
- Render the sentence `recorded <date> against <versionLabel>` — built from `record.recordedAt` and
  `record.snapshot.versionLabel` with the existing `formatRecordDate`, the same shape
  `BatchRow.jsx:844` already prints in the read view. No new content, no new helper, no new copy.
- The region is `role="status" aria-live="polite"` and belongs to the **batch row**, not the pen, so
  the pen's unmounting cannot take it with it.
- It self-clears after 5 s using the existing `announce()`/timer convention
  (`RecipePage.jsx:960-984`), and is never a focus target.
- The amend path (`RecipePage.jsx:1307`) does not navigate, so it writes the same sentence directly
  rather than through route state; it states its changed date the same way.
- Leave the scroll-to-top on the new-record path alone. The opener that focus lands on is in the
  front matter, so scroll and focus agree. This is recorded in the brief as correct, not a defect.

## Work item 2 — focus returns to the opener across the navigation

- The landing is whichever control opened the pen: `VersionRow.jsx:217` ("Record batch" /
  "Record another"), or BatchRow's Amend.
- Persist that intent through the remount as route state — a ref cannot survive it. Consume it on
  mount the way `focusDevelopOnMount` is consumed (`RecipePage.jsx:1674`).
- `VersionRow.jsx:64-74` already documents why this is a `useEffect` and not the native `autoFocus`
  attribute. Follow it.
- Keep the existing amend and cancel focus-return paths working exactly as they do.

## Work item 3 — the churn date is named required before the refusal

- Add `required` and `aria-required="true"` to the churn date input (`BatchRow.jsx:483`) and a plain
  word on its caption saying so. Familiar words, sentence case, no articles.
- Add `required` **nowhere else in the record**. The narrowed anti-goal still forbids it on every
  measured value, mark, note, defect chip and tasting date.
- Render `CHURN_DATE_BLOCKED_MESSAGE` inside the date's own label exactly as `MeasuredField` renders
  a malformed number, with `aria-invalid` and `aria-describedby` wired, **one occurrence**. Today it
  is passed as `hint` to both ceremony mounts (`BatchRow.jsx:770`), which is why the critique
  measured it at y=1306 and y=4279 in an 873px viewport with neither copy on screen.
- Announce the refusal. `handleSaveBatch`'s `dateMessage` branch (`RecipePage.jsx:1291-1296`) returns
  without calling `announce()`, unlike the `invalidFieldKey` branch above it which announces
  `MEASURED_INVALID_STATUS`. Give it the same treatment.
- Watch the critique's own caveat: a `.field-error` grows its label cell and shoves neighbours
  ~118px sideways, against the system's "nothing moves" rule. The date's error must not do that.

## Constraints

- Every visual value reads a custom property from `app/src/styles/tokens.css`. No literal anywhere.
- No colour change. No red on the error. The two-ink discipline holds and the page keeps rendering
  exactly four colours.
- Nothing animates. Nothing moves on focus, hover or selection.
- Notes and prose render as text, never markup. No `dangerouslySetInnerHTML`.
- Repository seam and domain purity rules in `.claude/CLAUDE.md` are unchanged by this task.

## Verification

1. `npm --prefix app test` green. `BatchRow.test.jsx` and `RecipePage.test.jsx` both pass, including
   the existing blocked-date assertions at `RecipePage.test.jsx:630-652`.
2. New coverage for: the save confirmation's text and its `role=status`; the focus landing surviving
   the route change; exactly one in-label date error.
3. Browser at `/recipe/olive-oil-ice-cream-v1`: save a new record and confirm `activeElement` is the
   opener, exactly one `[role=status]` carries the recorded sentence, and it clears after 5 s. Save
   with a blank churn date and confirm one visible in-label error, focus on the date, and an
   announcement.
4. The 2026-09-16 critique left two throwaway batches in the dev IndexedDB (churned 2 Aug and
   9 Aug 2026). A store reset clears them; they are not a regression.
