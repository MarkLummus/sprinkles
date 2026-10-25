# The page notice's words: a clarify pass on every line the card shows

Sid, 2026-10-25. From Mark: "I need to review every message that is shown in the notification card. just saw the message for close the open pen before importing. a user won't know what an 'open pen' means - that is Sid language leaking through." Then: "send the whole set to Sid for a clarify pass". Decision row: `decide-notice-copy`. Nothing under `app/` is touched here; the change lands by `/gsd-fast` once Mark answers.

Method: `/impeccable clarify` (reference/clarify.md) read against the whole path, not the strings alone. The maker's words are recipe, version, batch, tasting, draft, import. Ours, which never reach the screen: pen, ink, log column, ceremony, store. The card holds one line at 16px at the prose measure, so every line stays under 60 characters. The voice to keep is the one the good lines already have: a short sentence, a capital, a full stop ("Version saved.", "Draft discarded.").

## 1. The card: seven triggers, three changes

| Trigger | As built | Proposed | Why | Where in code | Tests to follow |
|---|---|---|---|---|---|
| Save batch (first save) | `recorded 25 Oct 2026` | **`Batch recorded 25 Oct 2026.`** (recommended, 27) | The lower-case fragment was the brief's tail of a longer sentence; alone on a card it reads as a note left mid-thought. Named object, capital, stop: the shape of "Version saved." with the date the brief asked for. Alternative: `Batch saved.` (the exact sibling of "Version saved.", but it drops the date the brief fixed in the words; not recommended). | `app/src/domain/recordDraft.js` `batchSavedStatus` | `app/src/ui/RecipePage.test.jsx` lines 848, 859, 861 pin the literal; `app/src/domain/recordDraft.test.js` 346–360 and `app/src/ui/RecipePage.shell.test.js` 305 test identity and call shape, so they follow unchanged |
| Save batch after Correct (the amendment) | `changed 17 Sep 2026` | **`Batch changed 17 Sep 2026.`** (recommended, 26) | Same function, same shape; "changed" is the read view's own word (the Changed row under the batch), so the card and the page agree. Alternative: `Batch corrected 17 Sep 2026.`, the control's verb; not recommended because the page says Changed. | same | same |
| Save as a new version / save edits | `Version saved.` | **keep** | Says what happened in two words. The planned creation save ("Recipe saved.", board P11_Save) follows it. | `app/src/ui/useVersionPen.js` `VERSION_SAVED_STATUS` | none |
| Leaving a batch or version form with something typed | `Draft kept. Cancel discards it.` | **keep** | What happened, and what the one control that undoes it does. "Draft" is the maker's word. Alternative: `Draft kept.` alone, since the Notebook's own "Draft open on this version" line shows the way back; not recommended, the second sentence is what tells a maker the draft is not a save. | `app/src/ui/useKeptDraft.js` `DRAFT_KEPT_STATUS` | none |
| Discarding a kept draft from the Notebook | `Draft discarded.` | **keep** | | `app/src/ui/NotebookPlace.jsx` `DRAFT_DISCARDED_STATUS` | none |
| Import pressed while a batch or version form is open | `Close the open pen before importing.` | **`Save or cancel your changes before importing.`** (recommended, 45) | "Pen" is ours. The maker sees two buttons at the foot of what is open, Save and Cancel; the line names them and the reason. Alternative: `Save or cancel the open batch or version before importing.` (58), which names the object instead of the changes; defensible when the form is open with nothing typed yet, but longer and the two buttons are the same either way. | `app/src/ui/Shell.jsx` `IMPORT_BLOCKED_STATUS` (and its comment, which cites `decide-new-lines-import-block-and-too-long`, where Mark kept the old line on 2026-10-11; this row supersedes that) | `Shell.importGuard.test.jsx`, `Shell.creationGuard.test.jsx` import the constant by name and follow unchanged |
| Import pressed while a new recipe is being written | `Cancel the new recipe draft before importing.` | **keep** | Plain, and true: in Phase 10 the creation editor has no Save, so Cancel is the one way out. When Phase 11 adds Save, this line becomes the batch line's twin ("Save or cancel the new recipe before importing."); not now. | `app/src/ui/Shell.jsx` `CREATION_IMPORT_BLOCKED_STATUS` | none |
| The app's data cannot be opened | `Could not open the local store. Try reloading.` | **`Couldn't open your recipes. Try reloading.`** (recommended, 42) | "Local store" is developer language. The boot line already says "Opening your recipes…", so the failure answers it in the same words; "Couldn't" (curly apostrophe) is the voice every other failure line uses. Reaches the card from the Notebook, the creation editor and the Shell's Import, and stands as the whole page in `RecipePage`, `IngredientsPlace` (where "your recipes" is a little wide for the Ingredients place; the data is one thing, and one sentence for one failure is worth more than a per-place variant) and `main.jsx`'s boot. | `app/src/ui/RecipePage.jsx` `PAGE_LOAD_ERROR` (one home, imported by `CreationPage`, `NotebookPlace`, `IngredientsPlace`, `Shell`), and the same literal in `app/src/main.jsx` line 35, which must change with it | `Shell.creationGuard`, `RecipePage.drafts`, `CreationFlow`, `IngredientsPlace`, `NotebookPlace` tests import `PAGE_LOAD_ERROR` by name and follow; `app/src/styles/binder.test.js` 496 reads the `.app-boot` rule, not the words |

The proposed set in full, as the card will show it:

- Batch recorded 25 Oct 2026.
- Batch changed 17 Sep 2026.
- Version saved.
- Draft kept. Cancel discards it.
- Draft discarded.
- Save or cancel your changes before importing.
- Cancel the new recipe draft before importing.
- Couldn't open your recipes. Try reloading.

Longest line 45 characters; at 16px in the card's measure every line stays on one line at 393 and 1366.

**The brief's "against …" tail.** `route-recipe-batch.md` § 3 and its Feedback line want "recorded 4 Aug 2026 against 50 g oil · 800 g". The app never built the tail, and the omission is not an accident: `batchSavedStatus`'s comment records Mark's call of 2026-10-04 that the page already shows the version, so the sentence does not repeat it. The tail is settled out, not pending. The brief should be brought into line with that call (a `document` edit, mine, in the next brief touch), and if Mark wants the version named in the card after all it is a separate decide row, because it adds a second clause ("Batch recorded 25 Oct 2026 against 50 g oil · 800 g.", 52) that fits the card and repeats the heading the maker lands on.

## 2. The lines that are not the card, read for consistency

Left where they are and as they are; none uses our words. Listed so Mark sees the whole set in one place.

| Where | Line | Verdict |
|---|---|---|
| Batch form, `.form-status` | Check the marked measurements. Your entries have been kept. | keep; says what to look at and that nothing was lost |
| Batch form | Check the churn date. Your entries have been kept. | keep |
| Batch form | Couldn't save the batch. Try again. | keep; the voice the store line now joins |
| Version form | Check the version. Your changes have been kept. | keep |
| Version form | Couldn't save the version. Try again. | keep |
| Batch form, tasting | Tasting removed. / Tasting removed. You can restore it. / Tasting restored. | keep; "restore" matches the Restore control |
| Import panel | The file was imported. Reload the page to see it. | keep; the panel has room for the full sentence |
| Import panel | This file is from an older version of Sprinkles and can't be imported. | keep |
| Import panel | Couldn't save this file. Nothing was changed. | keep |
| Boot | Opening your recipes… / Close other Sprinkles tabs to finish updating. | keep; the first is the model for the new store line, the second Mark approved 2026-10-11 |

Two things to carry forward, not decisions now: the Notebook's "Draft open on this version ·" line (`RecipeList.jsx` 157) is the only other place the kept draft is named, and it uses the same word; and the Phase 11 "Recipe saved." line should land in the `VERSION_SAVED_STATUS` shape when it is built.

## 3. The change set, for `/gsd-fast` once Mark answers

1. `app/src/domain/recordDraft.js`: `batchSavedStatus` returns `Batch changed ${date}.` / `Batch recorded ${date}.`; update its comment. `app/src/ui/RecipePage.test.jsx` 848, 859, 861: the three literals.
2. `app/src/ui/Shell.jsx`: `IMPORT_BLOCKED_STATUS = 'Save or cancel your changes before importing.'`; the comment above it cites this row instead of `decide-new-lines-import-block-and-too-long`.
3. `app/src/ui/RecipePage.jsx`: `PAGE_LOAD_ERROR = 'Couldn’t open your recipes. Try reloading.'` (curly apostrophe, as `BATCH_SAVE_ERROR`); `app/src/main.jsx` 35: the same words.
4. `npm --prefix app test`; nothing else moves.
5. DESIGN.md's page-notice paragraph (line 655) lists the triggers, not the words, so it stands; the batch brief's Feedback line is mine to bring into line with the 2026-10-04 call.
