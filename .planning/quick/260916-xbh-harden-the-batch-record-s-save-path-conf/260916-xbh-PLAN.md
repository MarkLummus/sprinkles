---
quick_id: 260916-xbh
slug: harden-the-batch-record-s-save-path-conf
date: 2026-09-17
mode: quick
authority:
  - .planning/quick/260916-xbh-harden-the-batch-record-s-save-path-conf/260916-xbh-CONTEXT.md work item 3 ONLY. Mark split the task on 2026-09-17 — work items 1 (the save's confirmation) and 2 (the focus landing) leave this task for the page shell's own Impeccable brief. Work item 3, the churn date, lands now. CONTEXT's other two items are not to be built here, not even in a smaller form.
  - .impeccable/surfaces/route-recipe-batch.md as revised in cdafb8e (2026-09-17) — § 3's third bullet, "The churn date is named required before the refusal, not only in it", is the whole design authority for this task. § 3's first two bullets defer the confirmation region to the page shell's brief and say explicitly that no pen-scoped or row-scoped stand-in is built in the meantime; § 6 now narrows the 2026-09-08 focus rule — cancel returns to the opener, a completing save lands on the saved record's heading. Neither is this task's to build.
  - .planning/todos/pending/2026-09-16-page-owned-feedback-scope-and-the-save-announcement.md — the live path for the two split-out items. Do not edit, close or delete it.
  - .impeccable/critique/2026-09-16T18-58-36Z__app-src-ui-batchrow-jsx.md Priority Issue 2 ONLY. Issue 1 is the split-out work. Issues 3, 4 and 5 are closed in code. Every Minor Observation (the 46px void, the letter-spacing literals, the duplicated hint sentence, the stranded segmented Clear, readMarkWord, the missing region name, the prose-field size) is out of scope and explicitly deferred.
  - app/src/router.jsx — untouched. No route key change, no `navigate()` change, no route state.
  - CLAUDE.md §3 (surgical) — every changed line traces to work item 3; nothing adjacent is improved, reflowed or reindented. .claude/CLAUDE.md conventions — every visual value reads a token, prose renders as text never markup, the repository seam and domain purity are untouched by this task.
  - DESIGN.md / app/src/styles/tokens.css — no colour change, no red on the error, four colours on the page, nothing animates.
files_modified:
  - app/src/ui/BatchRow.jsx
  - app/src/ui/BatchRow.test.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/RecipePage.test.jsx
autonomous: true
must_haves:
  truths:
    - The churn date input carries `required` and `aria-required="true"`, and its caption reads `Churn date, required` — so the field is named required BEFORE the save is refused. No other control in the record gains `required` — not a measured value, not a mark, not a note, not a defect chip, not the tasting date.
    - A refused save renders `Enter the date you churned.` EXACTLY ONCE in the rendered document, inside the churn date's own label, as a `.field-error` wired by `aria-invalid="true"` and `aria-describedby` — exactly as `MeasuredField` renders a malformed number. Neither ceremony carries it any more.
    - The refused save announces a form-scoped SUMMARY of its own, never a copy of the field's sentence — `Check the churn date. Your entries have been kept.`, the sibling of `MEASURED_INVALID_STATUS` in the same register. The block status does not self-clear.
    - The date's error never shoves its neighbours sideways — `.field-row__label--date` carries a fixed `width` token, so the three measured fields beside it keep their left offsets to the pixel.
    - Nothing moves on focus, hover or selection. No colour changes. Nothing animates. The page still renders four colours. No stylesheet is touched at all.
    - Nothing in this task builds a save confirmation, a live region of its own, a focus landing, a route-state payload or any change to `navigate()`. `router.jsx`, `VersionRow.jsx`, `PenFoot.jsx` and `app/src/styles/` are not in the diff.
    - `npm --prefix app test` green at 33 files / 953 tests (baseline 950, measured at planning time).
  artifacts:
    - "app/src/ui/BatchRow.jsx: `CHURN_DATE_ERROR_ID` at module scope; `required`/`aria-required`/`aria-invalid`/`aria-describedby` and an in-label `.field-error` on the CHURN date (~477-487, NOT the tasted date at ~593); `hint={blockedDateMessage}` removed from ceremony A (~770)"
    - "app/src/ui/RecipePage.jsx: exported `CHURN_DATE_BLOCKED_STATUS` beside `MEASURED_INVALID_STATUS` (~39); `announce(CHURN_DATE_BLOCKED_STATUS)` in the block branch (~1292-1297); `penHint` (~847) no longer carries the blocked-date sentence"
    - "app/src/ui/BatchRow.test.jsx: four rewritten tests in the date block plus four updated caption literals"
    - "app/src/ui/RecipePage.test.jsx: one new verbatim-sentence test for `CHURN_DATE_BLOCKED_STATUS`"
  key_links:
    - "There are TWO `field-row__label--date` labels in BatchRow.jsx — the churn date at ~477 and the TASTED date at ~593. This task touches the first only. A `required` on the tasting date would break the narrowed anti-goal outright (no required anywhere in the record's CONTENT)."
    - "BatchRow.test.jsx pins the churn caption as a literal at FOUR sites: the regex at ~209, the `indexOf` at ~211, the `indexOf` at ~265 and the regex at ~280. Lines 211 and 265 are `indexOf` ordering gates that would SILENTLY PASS at -1 once the caption text changes — stale, not failing. All four must be updated."
    - "Test ~209's regex is `<input[^>]*type=\"date\"[^>]*class=\"ink-field\"[^>]*value=\"...\"`. Keep `type` first, `className` second and `value` after the new attributes, or that test fails for no reason."
    - "The caption reserve absorbs the longer caption with nothing to spare and nothing moving: `.field-row .pen-caption:not(.segmented-field__caption)` (app.css ~1723) sets `min-height: var(--caption-two-lines)` = 2.4em, and `--leading-table` is 1.2 — exactly two lines. There is no media override of that rule. `Churn date, required` must wrap to no more than two lines at `--field-w-date` (128px); confirm in the browser, do not assume."
    - "The blocked sentence must reach ONE rendering. It is fed to ceremony A (BatchRow ~770) AND, via `penHint` (RecipePage ~847), to PenFoot's ceremony B — the two copies the critique measured at y=1306 and y=4279. Both feeds must stop or the label's error is a THIRD copy."
    - "The form scope gets its OWN summary sentence, never a copy of the field's. `.form-status` is a visible paragraph (app.css ~2092) and this stylesheet has no visually-hidden utility at all — grepped `clip-path`, `clip:`, `sr-only`, `visually-hidden`: zero hits. Announcing `CHURN_DATE_BLOCKED_MESSAGE` would therefore print a second visible copy of the field's own sentence at the pen foot, which is the y=4279 defect this task exists to remove. `MEASURED_INVALID_STATUS` sets the register: the field says its own thing, the form says `Check the … Your entries have been kept.`"
    - "`required` paints nothing: grepped app.css for `:required`, `:invalid`, `[required]` and `[aria-invalid]` — zero hits. No colour, no new token, no stylesheet change."
---

# The churn date is named required, and its refusal renders once

Critique fix 2 (P1). A blank-date save is refused with no warning that the field was required, and
the refusal prints its sentence twice — measured at y=1306 and y=4279 in an 873px viewport, with
neither copy on screen. The date input carries no `required`, no `aria-required`, no `aria-invalid`
and no `aria-describedby`; only 6 of 59 controls in the pen have any error wiring, all of them
`MeasuredField`. That inline path is the one the critique praised, and it is the pattern to copy.

One task, one commit.

## Discovered at planning — read this before editing

Every line number below was read live on 2026-09-17 against the current files. They are a guide to
where things live, not authority: re-grep and authorize scope from what you find.

**1. Mark split this task; only work item 3 lands here.** Work items 1 and 2 of CONTEXT.md — the
save's confirmation and the focus landing — go back to the page shell's path:
`.planning/todos/pending/2026-09-16-page-owned-feedback-scope-and-the-save-announcement.md`
(`/impeccable shape` for the shell, a layout route, a page-owned region, focus to the saved record's
heading). The brief was corrected to match in `cdafb8e`: § 3 now defers the region and states that
**no pen-scoped or row-scoped stand-in is built in the meantime** — "every live region inside the pen
unmounts at the moment of the save that should fill it, which is the defect, not a smaller version of
the fix" — and § 6 narrows the 2026-09-08 focus rule so cancel returns to the opener while a
completing save lands on the record. Build none of it here. Do not edit the todo file.

**2. `penHint` is the second feed of the blocked sentence, and it is easy to miss.**
`RecipePage.jsx:847` derives one `penHint` for the whole page and hands it to both VersionRow
(~1666) and PenFoot (~1798). VersionRow renders it only inside its `openPen === 'plan'` branch
(~328), so the plan pen is unaffected. PenFoot renders it at ~90 for the plan pen and passes it to
`SaveCeremony` at ~114 for the record and amend pens — that is the y=4279 copy. Ceremony A's own
`hint={blockedDateMessage}` (BatchRow ~770) is the y=1306 copy. **Both must stop.**

`SaveCeremony`'s `hint` prop itself stays — it is a shared presentational prop with its own passing
tests (`PenFoot.test.jsx` ~93-95, ~216-221) that this task has no reason to touch. Leaving one prop
unfed is a smaller diff than unpicking it, and the plan pen's branch still renders a hint of its own.

**3. The form scope gets a summary, never a copy of the field's sentence.** `.form-status`
(app.css ~2092) is a **visible** paragraph — this stylesheet has no visually-hidden utility anywhere
(`clip-path`, `clip:`, `sr-only`, `visually-hidden`: zero hits). Announcing
`CHURN_DATE_BLOCKED_MESSAGE` into it would render a literal second visible copy of the field's own
sentence at the pen foot: the exact defect this task removes. The established register is the one
`MEASURED_INVALID_STATUS` already sets — the field says its own thing ("Enter a temperature, such as
−6, or leave blank.") while the form says a summary ("Check the marked measurements. Your entries
have been kept."). The date gets the sibling of that summary. **The rule, for whoever reads this
later: a form-scoped announcement never repeats a field-scoped sentence. Do not "simplify" this back
to `announce(dateMessage)`.**

**4. The date's error cannot shove anything sideways, and this was checked rather than assumed.**
Riley's caveat in the critique is real for `MeasuredField`: its label is `flex: 0 0 auto` with no
width, so a long error sets the label's content width and pushes siblings ~118px across. The churn
date's label is `.field-row__label--date { width: var(--field-w-date) }` (app.css ~1714) — a fixed
128px, so the error wraps inside the box and no neighbour moves horizontally. The row does get taller
while the error shows, exactly as it already does for a malformed measurement (the path the critique
praised). That is the accepted behaviour; CONTEXT's caveat is about the sideways shove. **Do not
reserve permanent space for the error** — a permanent void is the defect the critique docks elsewhere.

**5. Two date inputs exist in the pen; only one is the batch's name.** The churn date (~477) is the
batch's identifying field and is named required. The tasted date (~593) shares the same two classes
and must NOT gain `required` — the narrowed anti-goal still forbids it on every value of the record's
content. Assert that: exactly one `aria-required` in the pen's markup.

**6. The longer caption is free, and this is arithmetic, not hope.**
`.field-row .pen-caption:not(.segmented-field__caption)` (app.css ~1723) reserves
`min-height: var(--caption-two-lines)` = 2.4em, and `--leading-table` is 1.2 — exactly two lines —
with no media override of that selector anywhere in the file. So `Churn date, required` wrapping to a
second line changes no height and moves nothing, provided it stays within two lines at the 128px
field width. Confirm that in the browser.

**7. No colour, no motion, no new token, no stylesheet.** `grep` over app.css found no `:required`,
`:invalid`, `[required]` or `[aria-invalid]` selector, so `required` paints nothing. `.field-error`
already exists (app.css ~2105) with its own comment recording that it carries no colour of its own —
the field's `aria-invalid` is the fact, not a red line. `app/src/styles/` must not appear in the diff.

**8. Security.** No package installed, no trust boundary crossed, no network call, no store shape
change, no new data path. Four ARIA attributes, one caption string and one status constant, all
rendered as React text nodes — never markup, no `dangerouslySetInnerHTML`. No STRIDE item applies.

## The task — the churn date is named required, and its refusal renders once, in its own label

**Files:** `app/src/ui/BatchRow.jsx`, `app/src/ui/RecipePage.jsx`, `app/src/ui/BatchRow.test.jsx`,
`app/src/ui/RecipePage.test.jsx`

**Read first (live):** `BatchRow.jsx` 56-95 (`MeasuredField` — the pattern to copy exactly) and
470-500 (the churn `.field-row`); 750-785 (ceremony A and the form-status region);
`RecipePage.jsx` 30-45 (the verbatim-sentence constants), 841-848 (`penHint`) and 1278-1300 (the two
block branches of `handleSaveBatch`); `BatchRow.test.jsx` 200-290 (the four caption literals) and
783-805 (the describe block to rewrite); `RecipePage.test.jsx` 656-665 (the verbatim-sentence block).

**a. `BatchRow.jsx` — one module-scope id**, directly above `MeasuredField`'s comment block, with a
one-line comment that `churnDate` is not a `BATTERY_FIELDS` key and so carries its own id rather than
flowing through `MeasuredField`:

```
+ const CHURN_DATE_ERROR_ID = 'field-error-churnDate';
```

**b. The churn date field (~477-487).** The caption gains the plain word; the input is named required
and wired to its error; the error renders inside the label as `MeasuredField`'s last child:

```
-       <span className="pen-caption">Churn date</span>
+       <span className="pen-caption">Churn date, required</span>
        <input
          type="date"
          className="ink-field"
+         required
+         aria-required="true"
+         aria-invalid={blockedDateMessage ? 'true' : undefined}
+         aria-describedby={blockedDateMessage ? CHURN_DATE_ERROR_ID : undefined}
          autoFocus
          ref={churnDateRef}
          value={draft.churnDate}
          onChange={...}
        />
+       {blockedDateMessage && (
+         <span id={CHURN_DATE_ERROR_ID} className="field-error">
+           {blockedDateMessage}
+         </span>
+       )}
```

Keep `type` first and `className` second; put `value` after the new attributes. Extend the comment
above the `.field-row` (~470-476) with the origin in one or two sentences: Mark's 2026-09-16 ruling
that the batch's name is not the record's content, and that the refusal renders here — once, beside
the field focus lands on — rather than at either ceremony. **The tasted date at ~593 is not touched.**

The caption carries the word and `aria-required` states the fact, so a screen reader may say
"required" twice. That is accepted, not an oversight: the visible word is for the maker who never
hears it, and the attribute is for the one who does. Say so in the comment so nobody trims one later.

**c. Ceremony A stops carrying it (~755-772).** Delete the `hint={blockedDateMessage}` prop and
rewrite the sentences of that comment that describe the hint as the shared blocked-date state, so the
comment states the new fact: the blocked-date sentence renders in the date's own label, one
occurrence, and neither ceremony carries it.

**d. `RecipePage.jsx` ~847** — the record and amend pens contribute no hint:

```
- const penHint = openPen === 'record' || openPen === 'amend' ? blockedDateMessage : blockedMessage;
+ const penHint = openPen === 'record' || openPen === 'amend' ? null : blockedMessage;
```

Update the comment above it (~841-846) to say where the record pen's blocked-date sentence now
renders. `blockedDateMessage` keeps flowing to BatchRow as a prop — that is the label's error source
now. Do not touch `blockedDateAttempt` or the focus effect it drives: focus already lands on the date
on a refusal, and that is what puts the one copy of the sentence in the viewport.

**e. `RecipePage.jsx` — the form-scoped summary.** A new exported constant immediately after
`MEASURED_INVALID_STATUS` (~39), in the same register and with a comment saying why the two are
siblings — the field says its own sentence, the form says the summary, and a form-scoped
announcement never repeats a field-scoped one:

```
+ export const CHURN_DATE_BLOCKED_STATUS = 'Check the churn date. Your entries have been kept.';
```

Then, in the `dateMessage` branch (~1292-1297), announce it after `setBlockedDateAttempt(...)` and
before the `return`: `announce(CHURN_DATE_BLOCKED_STATUS);`. No `selfClear` — block statuses never
self-clear, per `announce`'s own contract comment — and the same default `form` target the branch
above it at ~1286 uses. **Do not announce `dateMessage`**: `.form-status` is visible, so that would
put a second visible copy of the field's sentence at the pen foot.

**f. Tests — `BatchRow.test.jsx`.** Update the four stale caption literals (~209, ~211, ~265, ~280)
to `Churn date, required`. **Lines 211 and 265 are `indexOf` ordering gates that would pass silently
at -1 if left stale** — they are not optional. Then replace the describe block at ~787-803 with four
tests, keeping the block's naming style and citing § 3's third bullet:

1. The date is named required before any refusal: caption `Churn date, required`, and the input
   carries both `required` and `aria-required="true"`.
2. With `blockedDateMessage` set: the sentence appears **exactly once** in the whole markup (count
   occurrences, do not merely `toContain`), inside the date's label, with `aria-invalid="true"` and
   `aria-describedby="field-error-churnDate"`; and `save-ceremony__hint` is absent.
3. With `blockedDateMessage` null: no `field-error-churnDate`, no `aria-invalid`, no hint paragraph.
4. Nothing else in the record is required: `aria-required` appears exactly once in the pen's markup,
   with the tasting section open so the tasted date is rendered and provably not required.

**g. Tests — `RecipePage.test.jsx`.** One `it` in the verbatim-sentence describe block (~656),
asserting `CHURN_DATE_BLOCKED_STATUS` is `'Check the churn date. Your entries have been kept.'`, and
add the constant to that block's title, which enumerates the sentences it pins and would otherwise be
stale by this change. Add the import to the existing named-import list (~36 area). Do not alter the
two tests already there.

**Verify:**

1. `npm --prefix app test -- BatchRow` → `Test Files 1 passed (1)`, `Tests 124 passed (124)`
   (122 baseline − 2 replaced + 4 new). A different number means a test was dropped or one this plan
   did not ask for was added.
2. `npm --prefix app test -- RecipePage` → `Tests 61 passed (61)` (60 baseline + 1).
3. `npm --prefix app test` → `Test Files 33 passed (33)`, `Tests 953 passed (953)`. This is the gate
   that proves `PenFoot.test.jsx` and `VersionRow.test.jsx` still pass untouched.
4. `git diff --name-only` → exactly `app/src/ui/BatchRow.jsx`, `app/src/ui/BatchRow.test.jsx`,
   `app/src/ui/RecipePage.jsx`, `app/src/ui/RecipePage.test.jsx`. No CSS, no `router.jsx`, no
   `VersionRow.jsx`, no `PenFoot.jsx`.

**Done:** the churn date says it is required before the save is refused; a refusal renders its
sentence once, in the date's own label, wired for assistive tech, with focus on the field and a
form-scoped summary announced beside it; no other control in the record is required; nothing moves
sideways; no stylesheet changed.

## Browser check — the gate this task actually turns on

At `/recipe/olive-oil-ice-cream-v1` (`npm --prefix app run dev`), Chrome at 1280 wide. Mark's standing
notes apply: the first click after a route change often misses, so wait, re-find and probe state by
JS; and a store reset clears the two throwaway batches the 2026-09-16 critique left (churned 2 and
9 Aug 2026) — they are not a regression.

- [ ] **The required date, before any refusal.** The caption reads `Churn date, required`, wraps to no
      more than two lines, and the field's bottom is still on one baseline with the three measured
      fields beside it. The caption's measured height is within `var(--caption-two-lines)`.
- [ ] **The refusal.** Open the pen, scroll to the foot ceremony, press Save with a blank date.
      Exactly one visible copy of `Enter the date you churned.`, inside the date's label and in the
      viewport; `document.activeElement` is the date input; the form-status region carries
      `Check the churn date. Your entries have been kept.` and not the field's sentence.
      `document.body.innerText.split('Enter the date you churned.').length - 1` is **1**, and no copy
      sits at either ceremony.
- [ ] **Nothing moved sideways.** Record the three measured inputs'
      `getBoundingClientRect().left` before and after the refusal: identical to the pixel.
- [ ] **Nothing else is required.** `document.querySelectorAll('[aria-required]').length` is 1 with
      the tasting section open, and it is the churn date.
- [ ] **Narrow and touch.** At 759 and 600, and once with a coarse pointer emulated: the longer
      caption still fits, the error still wraps inside the date's box, and nothing overlaps.
- [ ] **Four colours.** Sample the error's computed colour: `--ink`. No red anywhere, nothing
      animated, nothing moved on focus, hover or selection.
- [ ] **The save still says nothing, and that is correct today.** Saving a record still leaves
      `[role=status]` silent and focus on `<body>`. That is critique issue 1, now the page shell's
      work — not a regression from this task, and not to be patched here.

## Success criteria

- [ ] The churn date carries `required` and `aria-required="true"`; its caption reads
      `Churn date, required`; the tasted date and every measured value, mark, note and chip carry
      neither.
- [ ] `Enter the date you churned.` renders exactly once as a `.field-error` inside the churn date's
      label, wired by `aria-invalid` and `aria-describedby`; `save-ceremony__hint` and
      `pen-foot__blocked` never carry it again.
- [ ] `CHURN_DATE_BLOCKED_STATUS` exists beside `MEASURED_INVALID_STATUS` and is what the date branch
      announces; the field's own sentence is never announced.
- [ ] `SaveCeremony`'s `hint` prop, `PenFoot.jsx`, `VersionRow.jsx`, `router.jsx` and
      `app/src/styles/` are all untouched.
- [ ] No save confirmation, live region, focus landing, route state or `navigate()` change appears in
      the diff — those are the page shell's, per the todo.
- [ ] Five tests written — four in BatchRow's date block, replacing the two there, and one in
      RecipePage — for a net +3 (BatchRow 122 → 124, RecipePage 60 → 61); four stale caption literals
      updated; no other existing test modified or deleted.
      `npm --prefix app test` green at 33 files / 953 tests.
- [ ] One commit.
- [ ] No Minor Observation from the critique appears in the diff.

## Output

`.planning/quick/260916-xbh-harden-the-batch-record-s-save-path-conf/260916-xbh-SUMMARY.md`,
recording: that Mark split the task and work items 1 and 2 went to the page shell's brief and the
pending todo, which stays open; the chosen names (`CHURN_DATE_ERROR_ID`,
`CHURN_DATE_BLOCKED_STATUS`) and the rule that a form-scoped announcement never repeats a
field-scoped sentence; the measured proof that the date's error moves no neighbour sideways and that
the two-line caption reserve absorbed the longer caption; and the accepted `aria-required`
redundancy, so a later pass does not trim the visible word.
