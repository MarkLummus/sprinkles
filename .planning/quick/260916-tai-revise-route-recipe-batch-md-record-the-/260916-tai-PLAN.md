---
quick_id: 260916-tai
slug: revise-route-recipe-batch-md-record-the-
date: 2026-09-16
mode: quick
doc_only: true
authority:
  - .planning/.continue-here.md <decisions_made> — "Keep both Save ceremony mounts with identical labels — the redundancy is intentional; the brief's two-scope idea was what was wrong. Brief revision, not a code change." (Mark, 2026-09-16)
  - .impeccable/critique/2026-09-16T18-58-36Z__app-src-ui-batchrow-jsx.md lines 68-72 — the "Contract conflicts — Mark's decision, not a builder's" register; the source of both threads and of the measured distance between the two ceremonies
  - DESIGN.md line 372 — "Save ceremony (.save-ceremony): one component mounted twice — at the end of the record body and in the pen foot — so the two can never drift." The shipped truth for thread (a).
  - DESIGN.md line 369 — "Picking is final: a joined group is a radio, and Clear is the only way back." The shipped truth for thread (b).
  - DESIGN.md line 370 — the segmented control's caption line "with Clear as the last child".
  - .claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md lines 460, 471, 520, 540 — sketch 007's tenth round retiring the second-click clear; line 520 records it as superseding D-04's second half explicitly.
  - app/src/ui/PenFoot.jsx lines 1-51 and 111, app/src/ui/BatchRow.jsx line 738 — READ-ONLY evidence: one SaveCeremony component, the label "Save batch" hardcoded at PenFoot.jsx:46, both mounts calling onSaveBatch, neither gated on draft.tastingOpen.
files_modified:
  - .impeccable/surfaces/route-recipe-batch.md
files_forbidden:
  - app/**  (no source, no CSS, no test — this is a documentation revision; if a code change looks necessary, stop and report)
autonomous: true
estimate:
  tokens: 35000
  raw_tokens: 35000
  tasks: 3
  confidence: low
must_haves:
  truths:
    - No sentence anywhere in the brief states that saving has two scopes, that a save label is chosen from the tasting section's state, or that either save ceremony renders conditionally.
    - Section 3 records the two ceremony mounts as one save act offered twice, names the redundancy as deliberate, dates it to Mark 2026-09-16, and gives the reason (the record is long; the maker saves from wherever they are).
    - No sentence anywhere in the brief states that picking an already-picked stop or segmented option a second time clears it.
    - Section 4's "Out, and named" list carries both retired ideas with a 2026-09-16 supersession clause, so neither is silently deleted — matching the file's existing house style for superseded items.
    - The Status line carries a 2026-09-16 revision clause in the file's own established phrasing ("revised 2026-09-16 after the BatchRow critique (path): ...").
    - The two retired save labels survive only inside section Labels' dated 2026-09-12 register, which now carries its own 2026-09-16 retirement clause; they appear nowhere in sections 1-7.
    - Nothing under app/ changed — git reports no modification under app/ after the edit.
  artifacts:
    - ".impeccable/surfaces/route-recipe-batch.md — revised Status line; revised section 3 save paragraphs; revised section 4 Breadth/Interactivity/In/Out; revised section 5 material states; revised section 6 Marks and battery-controls bullets; revised section 7 binding and carried items; an appended section Labels retirement clause."
  key_links:
    - "The Status line is this file's own revision log. A content revision that does not reach the Status line leaves the file internally inconsistent — the exact defect left in route-recipe.md this session. Task 3 exists only for this."
    - "Section Labels is a DATED REGISTER of what was decided when, not a current contract. Its 2026-09-12 sentence is preserved verbatim and a retirement clause is appended; the region-scoped verify gate depends on that split holding."
    - "Lines 78, 80 and 110 each carry BOTH threads. Task 1 and Task 2 both edit them. Task 2 must re-read the live text after Task 1 rather than matching the pre-Task-1 string."
---

# Revise route-recipe-batch.md: the twin Saves are deliberate; click-again-clears is struck

Documentation only. Mark ruled on 2026-09-16, after the `BatchRow.jsx` critique, that
the shipped code is correct and this brief is stale in two threads. Bring the brief in
line, record the supersessions in the file's own house style, and log the revision in
the file's own Status line.

**Nothing under `app/` may be edited.** No source, no CSS, no test. Reading `app/src`
as evidence is fine; writing to it is out of scope and means the plan is wrong.

**Surgical only.** Touch the passages that carry the two stale ideas, the two
"Out, and named" supersession entries, and the Status line. Do not improve adjacent
prose, do not reflow paragraphs, do not fix unrelated staleness. Two other conflicts
the critique named are deliberately OUT of scope: ceremony ordering beyond what the
rewritten sentences must state, and section 6's "Reading order is the sheet's page
order" claim (critique line 73).

## Scope authority — live observation, 2026-09-16

The line numbers in the task description were a historical grep. They were re-grepped
live at planning time. **The live grep found five passages the historical grep did not**
(lines 76, 110-for-thread-(a), 123, 162, 168). The enumeration below is the authority.
Verify each line's text before editing; if the live file disagrees with a quoted span,
stop and report rather than guessing.

---

## Thread A — the save contract (two scopes struck, twin Saves recorded)

### A-1 · line 54 · section 3, the save paragraph

REPLACE the span beginning `**Saving is decoupled, two scopes (sketch 007, settled 2026-09-12).**`
and ending `each pen's ceremony carries Cancel first.` (four sentences; the paragraph
continues `Clearing or removing a tasting shows a toast...` — that remainder is the
toast/undo contract and stays **verbatim, untouched**).

WITH:

```markdown
**Saving is one act, offered twice (revised 2026-09-16; supersedes the split-scope arrangement settled 2026-09-12 with sketch 007).** There is one save. One ceremony component is mounted twice — at the end of the record body and again in the pen foot — and both mounts read the same label, "Save batch", in every state, call the same handler, and write the same thing: the whole pen draft, the churn section and any open tasting together. The repetition is deliberate redundancy (Mark, 2026-09-16): the record is long — the foot's copy sits roughly 3,000px below the body's at 1280 and roughly 4,650px below it at 600, measured in the 2026-09-16 critique — so the maker saves from wherever they already are instead of hunting for the one button. Neither mount is conditional on the tasting section, neither label names a scope, and no label reads the section's state or the record's content. Each ceremony carries Cancel before Save, with Add tasting ahead of both while the tasting section is absent (D-14).
```

### A-2 · line 60 · section 3, "The ceremony's save pairs"

This paragraph is a dated record of *where* the ceremonies sit. House style (line 115)
is to re-head it with the new date and mark the superseded reading, not to delete it.

REPLACE the whole line WITH:

```markdown
**Where the ceremonies sit, revised 2026-09-12 (sketch 007) and again 2026-09-16.** The pen's save ceremonies live where the battery puts them, superseding the 2026-09-08 imprint arrangement for this pen: the churn date is the churn section's first field, one ceremony closes the record body, and the pen foot carries the second. Both are the same component and both render whenever the record or amend pen is open — the 2026-09-12 reading, which made the body's ceremony conditional on an open tasting section and re-labelled the foot's by that state, is superseded 2026-09-16 (§ 3, "Saving is one act, offered twice"). "Record a batch", "Record another batch", "Amend", and the read state's "Add a tasting" remain the front-matter controls that open the pen. Cancel discards the whole pen draft (D-24) and Save writes it, at either mount, so the two ceremonies share one scope and the phase plan has no scopes left to name.
```

### A-3 · line 76 · section 4, Fidelity/Breadth/Interactivity

Two surgical substitutions inside the existing line:

- `the decoupled saves,` → `the two save ceremonies,`
- `add a tasting, save either scope, reopen, read, amend` → `add a tasting, save, reopen, read, amend`

### A-4 · line 78 · section 4, "In:" — thread (a) clause only

REPLACE the clause `decoupled saves with state-based labels (Save batch only / Save batch / Save batch & tasting);`
WITH `one save act offered from two ceremony mounts, both reading "Save batch";`

(The same line also carries a thread (b) clause — see B-2. Whichever task runs second
must re-read the live line.)

### A-5 · line 110 · section 6, the battery's controls — thread (a) clause only

REPLACE `churn section from the churn date through its Cancel | Save batch only, then the tasting's fields, then the footer row`
WITH `churn section from the churn date through the ceremony that closes the record body, then the tasting's fields, then the footer row`

### A-6 · line 123 · section 7, Binding

REPLACE the final sentence `The empty-visible-tasting-at-save case and the two save scopes' persistence contract are the phase plan's to settle.`
WITH `The empty-visible-tasting-at-save case is the phase plan's to settle; the persistence contract the split saves once needed is not, having dissolved with them (2026-09-16, § 3).`

### A-7 · line 124 · section 7, Binding

REPLACE the whole bullet body WITH:

```markdown
- No default on any stop, segmented option, or field; blank stays visibly blank (sketch 007, settled 2026-09-12). Both save ceremonies carry the same unconditional label, "Save batch"; no save label reads the record's state or its content (Mark, 2026-09-16).
```

### A-8 · line 162 · section 7, "Carried for the phase plan"

REPLACE the whole line WITH:

```markdown
**Carried for the phase plan (recorded in the sketch findings and the roadmap; not open design):** drop the underline on filled controls; the undo-retired-on-resize edge; the matchMedia-under-emulation caveat; the read-view summary line's home (§ 3, read view). Closed 2026-09-16: naming the two Cancels' scopes, and the persistence contract the split saves once needed — both ceremonies share one scope, Cancel discards the whole pen draft (D-24) and Save writes it (§ 3).
```

### A-9 · line 168 · section Labels — APPEND, do not rewrite

Section Labels is a dated register of what was decided when. Its 2026-09-12 sentence
stays **verbatim** — the two retired labels are allowed to survive there, and only
there. Append at the end of the line, after `the note's placeholder reads "e.g. flavor, texture, anything that stood out".`:

```markdown
 Revised 2026-09-16: the two scope-qualified save labels that sentence introduced are retired — both save ceremonies read Save batch, unconditionally (Mark, 2026-09-16; § 3). Add tasting is unchanged.
```

### A-10 · line 80 · section 4, "Out, and named:" — house-style supersession entry

The file names superseded features in the Out list rather than deleting them silently
(`typed overrun as a percentage (superseded by...)`, `half-step marks (superseded by...)`).
Follow that precedent. INSERT before the final item `the "as expected, nothing to note" shortcut`:

```markdown
the split save scopes and their conditional labels (superseded 2026-09-16: one save act, two identical ceremonies — § 3);
```

### Left alone on purpose (thread A)

- **Line 82 anti-goal `no content-sniffing save label`** — still true, and now trivially
  so. Not stale. Do not touch.
- **Line 115's 2026-09-08 record** — says each pen's ceremony carries "Save batch" and
  "Cancel", which matches what shipped, and already carries its own 2026-09-12
  supersession for tab order. Do not touch.
- **Line 58 `"Save batch" is explicit.`** — correct as written.

---

## Thread B — click-again-clears struck

`DESIGN.md` line 369 records the shipped rule: *"Picking is final: a joined group is a
radio, and Clear is the only way back."* Line 370 gives the segmented control the same
Clear in its caption line. Sketch 007's tenth round is the origin (sketch-findings
`batch-record-tasting-battery-structure.md` line 520 records it as superseding D-04's
second half by name). Defect chips are NOT affected — they are independent on/off
squares and do toggle off; leave every defect-chip sentence alone.

### B-1 · line 56 · section 3, "Blank stays visibly blank"

REPLACE `Clicking a picked stop or option again clears it, and each marked axis offers its own Clear next to its inline state ("(3)" in pen blue once marked, "(Not recorded)" in muted italic when not).`
WITH:

```markdown
Picking is final — a joined group is a radio, so picking an already-picked stop or option a second time changes nothing; the Clear in each axis's and each segmented control's caption line is the only way back (`DESIGN.md`, "Save ceremony"/"Axis mark"; sketch 007's tenth round, revised here 2026-09-16). Each marked axis carries that Clear next to its inline state ("(3)" in pen blue once marked, "(Not recorded)" in muted italic when not).
```

### B-2 · line 78 · section 4, "In:" — thread (b) clause only

REPLACE `per-axis Clear and click-again-clears on stops and segmented options;`
WITH `a Clear in each axis's and each segmented control's caption line as the only way back from a picked stop or option;`

### B-3 · line 102 · section 5, Material states

Two-word deletions inside the existing dotted list:

- `a segmented option cleared again` → `a segmented option cleared`
- `an axis cleared again` → `an axis cleared`

Both states remain real — they are now reached by Clear rather than by a second pick.
Nothing else in the list changes.

### B-4 · line 109 · section 6, "Marks"

REPLACE `one click sets a stop, clicking it again clears, and per-axis Clear returns focus to the scale.`
WITH `one click sets a stop and picking is final; per-axis Clear — the only way back — returns focus to the scale.`

Do **not** import the keyboard-only qualification the sketch findings note at line 540.
That is a third thread and is out of scope.

### B-5 · line 110 · section 6, the battery's controls — thread (b) clause only

REPLACE `picked state in pen blue, no default, click-again clears;`
WITH `picked state in pen blue, no default, and a Clear in the caption line as the only way back;`

### B-6 · line 80 · section 4, "Out, and named:" — house-style supersession entry

INSERT alongside the A-10 entry, before `the "as expected, nothing to note" shortcut`:

```markdown
clearing a picked stop or segmented option by picking it a second time (superseded 2026-09-16: picking is final and Clear is the only way back, as `DESIGN.md` records shipped and sketch 007's tenth round settled);
```

---

## Thread C — the revision log (the file's own convention)

### C-1 · line 10 · Status line

This brief logs every revision in its Status line, as one semicolon-joined chain of
`revised DATE after the NAME critique (path): what changed` clauses — compare
`revised 2026-09-07 after the BatchMargin critique;` and `revised 2026-09-08 after the whole-page critique (path): ...`.
Extend that chain rather than starting a new sentence. REPLACE the chain's closing
`updated to the same battery.` (the 2026-09-12 clause's final words, immediately before `**Target:**`)
WITH:

```markdown
updated to the same battery; revised 2026-09-16 after the BatchRow critique (`.impeccable/critique/2026-09-16T18-58-36Z__app-src-ui-batchrow-jsx.md`), on Mark's ruling that the code is right and this brief was stale: the two save ceremonies are one act offered twice as deliberate redundancy, not two scopes with conditional labels, and clearing a picked stop or segmented option by picking it a second time is struck — picking is final, Clear is the only way back.
```

Note the lowercase `revised` and the semicolon: the clause joins the existing chain, it
does not open a new sentence.

---

<tasks>

<!-- planner-discipline-allow: two scopes -->
<!-- planner-discipline-allow: two save scopes -->
<!-- planner-discipline-allow: either scope -->
<!-- planner-discipline-allow: state-based -->
<!-- planner-discipline-allow: decoupled saves -->
<!-- planner-discipline-allow: click-again -->
<!-- planner-discipline-allow: again clears -->
<!-- planner-discipline-allow: cleared again -->
<!-- planner-discipline-allow: Save batch only -->
<!-- planner-discipline-allow: Save batch & tasting -->
<!-- planner-discipline-allow: renders only while a tasting -->
<!-- planner-region-allow: Save batch only|Save batch & tasting -->

<task type="auto">
  <name>Task 1: Apply Thread A — record the twin Saves as deliberate redundancy</name>
  <files>.impeccable/surfaces/route-recipe-batch.md</files>
  <read_first>.impeccable/surfaces/route-recipe-batch.md (read it fully first — 169 lines of long paragraphs; the spans below are single lines each), and DESIGN.md lines 369-373 for the shipped ceremony and control facts.</read_first>
  <precondition>The live file still matches the quoted spans in this plan's Thread A section. Re-grep before editing; if any quoted span is absent or differs, halt and report which one rather than guessing at a near match.</precondition>
  <action>Apply entries A-1 through A-10 of this plan's Thread A section, in that order. Each entry names its target line, quotes the exact current span, and gives the exact replacement. Transcribe each replacement verbatim from this plan — do not re-derive the prose, do not paraphrase, do not reflow the surrounding paragraph, and do not improve adjacent sentences. Use the Edit tool with exact-string matching; the file carries em dashes, en dashes and middle dots that must survive byte-for-byte. A-9 is an APPEND to the end of line 168, not a rewrite: the 2026-09-12 register sentence must survive verbatim, because it is the one place in the file where the retired labels are allowed to remain. A-10 inserts one item into the Out list; B-6 in Task 2 inserts a second item at the same place, so leave the list's trailing item intact. Honour the three "Left alone on purpose" entries: lines 58, 82 and 115 are correct as written and must not change. Edit no file other than the target; nothing under app/ may be written.</action>
  <verify>
    <automated>F=.impeccable/surfaces/route-recipe-batch.md; set -e; ! grep -nE 'two scopes|two save scopes|either scope|state-based|decoupled saves|renders only while a tasting|rendered only while a tasting' "$F"; [ "$(awk '/^## Labels/{exit} {print}' "$F" | grep -cE 'Save batch only|Save batch . tasting')" = 0 ]; [ "$(awk '/^## Labels/,0' "$F" | grep -cE 'Save batch only')" = 1 ]; grep -q 'deliberate redundancy' "$F"; grep -q 'mounted twice' "$F"; grep -q 'the split save scopes and their conditional labels (superseded 2026-09-16' "$F"; grep -q 'both save ceremonies read Save batch, unconditionally' "$F"; grep -q 'no content-sniffing save label' "$F"; [ -z "$(git status --porcelain app/)" ]</automated>
  </verify>
  <done>No statement of two save scopes, a state-based save label, or a conditionally rendered save mount survives anywhere in the file. Section 3 records one save act, two mounts, the identical label, and the redundancy as deliberate with Mark's date and reason. The two retired labels appear only inside section Labels' dated 2026-09-12 register, which now carries its own retirement clause. The Out list names the retired idea with a 2026-09-16 supersession. Line 82's anti-goal is untouched. git reports no change under app/.</done>
</task>

<task type="auto">
  <name>Task 2: Apply Thread B — strike clearing by picking a second time</name>
  <files>.impeccable/surfaces/route-recipe-batch.md</files>
  <read_first>.impeccable/surfaces/route-recipe-batch.md — RE-READ lines 56, 78, 80, 102, 109 and 110 after Task 1, since Task 1 already rewrote parts of lines 78, 80 and 110. Also DESIGN.md lines 369-370 for the shipped rule this thread records.</read_first>
  <precondition>Task 1 is applied and committed, and lines 78, 80 and 110 now carry their Task 1 text. Match against the live file, not against the pre-Task-1 strings.</precondition>
  <action>Apply entries B-1 through B-6 of this plan's Thread B section, in that order, transcribing each replacement verbatim. Lines 78, 80 and 110 are shared with Task 1 — read their live text and edit only the clause each entry names, leaving Task 1's wording alone. Leave every defect-chip sentence untouched: a defect chip is an independent on/off square and does toggle off, so it is not part of this thread. Do not import the keyboard-only focus-return qualification the sketch findings record at line 540 — out of scope. B-3 deletes exactly one word in each of two places in the dotted material-states list; change nothing else in that list. Edit no file other than the target; nothing under app/ may be written.</action>
  <verify>
    <automated>F=.impeccable/surfaces/route-recipe-batch.md; set -e; ! grep -niE 'click-again|again clears|cleared again' "$F"; grep -q 'Picking is final' "$F"; [ "$(grep -c 'only way back' "$F")" -ge 4 ]; grep -q 'clearing a picked stop or segmented option by picking it a second time (superseded 2026-09-16' "$F"; grep -q 'a segmented option cleared · an axis marked' "$F"; grep -q 'toggle chips with pressed state' "$F"; grep -q 'saving again adds an amended-on date' "$F"; [ -z "$(git status --porcelain app/)" ]</automated>
  </verify>
  <done>No phrasing anywhere in the file says that picking an already-picked stop or segmented option clears it. Sections 3 and 6 state that picking is final and Clear is the only way back, citing DESIGN.md and sketch 007's tenth round. The material-states list names the cleared states without naming the retired gesture. The Out list carries the 2026-09-16 supersession entry. Defect-chip prose and the unrelated "saving again" sentence at line 62 are untouched. git reports no change under app/.</done>
</task>

<task type="auto">
  <name>Task 3: Log the revision in the file's own Status line</name>
  <files>.impeccable/surfaces/route-recipe-batch.md</files>
  <read_first>.impeccable/surfaces/route-recipe-batch.md line 10 — the Status line, whose established phrasing this clause must match.</read_first>
  <precondition>Tasks 1 and 2 are applied. The Status line still ends its 2026-09-12 clause with "with the batch row's read view updated to the same battery." immediately before "**Target:**".</precondition>
  <action>Apply entry C-1: insert the 2026-09-16 revision clause into line 10's Status line, between the end of the existing 2026-09-12 clause and "**Target:**", transcribed verbatim from this plan. Match the line's established phrasing and punctuation — the existing clauses are separated by semicolons and the 2026-09-08 clause shows the "revised DATE after the NAME critique (path): what changed" shape. Do not restructure or shorten any existing clause in the Status line; append only. This task exists because this brief logs every revision in its own Status line, and a content revision that does not reach it leaves the file internally inconsistent.</action>
  <verify>
    <automated>F=.impeccable/surfaces/route-recipe-batch.md; set -e; sed -n '10p' "$F" | grep -q 'revised 2026-09-16 after the BatchRow critique'; sed -n '10p' "$F" | grep -q 'same battery; revised 2026-09-16'; sed -n '10p' "$F" | grep -q '2026-09-16T18-58-36Z__app-src-ui-batchrow-jsx.md'; sed -n '10p' "$F" | grep -q 'deliberate redundancy'; sed -n '10p' "$F" | grep -q 'picking is final'; sed -n '10p' "$F" | grep -q 'revised 2026-09-12 for Phase 03.3.1'; sed -n '10p' "$F" | grep -q '\*\*Target:\*\*'; head -6 "$F" | grep -q 'slug: "route-recipe-batch"'; [ -z "$(git status --porcelain app/)" ]</automated>
  </verify>
  <done>Line 10's Status line carries a 2026-09-16 revision clause naming the BatchRow critique by path and summarising both threads, in the file's own established phrasing; every prior clause and the "**Target:**" sentence survive intact; the front matter is unchanged. git reports no change under app/.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| none | A documentation edit to one local markdown design brief. No input crosses a trust boundary, no code path changes, no dependency is installed, no network call is made. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-260916-tai-01 | Tampering | `.impeccable/surfaces/route-recipe-batch.md` (a design authority later phases build from) | low | mitigate | Every edit is an exact-span replacement transcribed from this plan, with negative greps proving the retired statements are gone and positive greps proving the new ones landed; the Status line records the revision so a later reader can date it. |
| T-260916-tai-02 | Tampering | `app/**` | low | mitigate | `files_forbidden` names `app/**`, and every task's verify gate asserts `git status --porcelain app/` is empty. |

No package-manager install is in scope, so the package-legitimacy gate does not apply.
</threat_model>

<verification>
Run from the repo root after all three tasks:

1. `F=.impeccable/surfaces/route-recipe-batch.md; ! grep -niE 'two scopes|two save scopes|either scope|state-based|decoupled saves|click-again|again clears|cleared again|renders only while a tasting' "$F"` — no stale statement of either idea survives anywhere.
2. `awk '/^## Labels/{exit} {print}' "$F" | grep -cE 'Save batch only|Save batch & tasting'` returns `0` — the retired labels are gone from sections 1-7.
3. `awk '/^## Labels/,0' "$F" | grep -c 'Save batch only'` returns `1` — the dated 2026-09-12 register is preserved, as the house style requires.
4. `grep -c 'superseded 2026-09-16' "$F"` returns at least `3` — the Out list's two entries plus section 3's supersession note; nothing was silently deleted.
5. `sed -n '10p' "$F" | grep -c '2026-09-16'` is at least `1` — the revision reached the file's own log.
6. `git status --porcelain app/` is empty — the doc-only constraint held.
7. `git diff --stat` names exactly one file.
</verification>

<success_criteria>
- `.impeccable/surfaces/route-recipe-batch.md` is the only file changed.
- Both stale threads are gone from every passage the live grep found, not only from the four and two lines the historical grep named.
- Both retired ideas are recorded as 2026-09-16 supersessions in the Out list, in the file's own established style, rather than silently deleted.
- Section Labels' dated register keeps its 2026-09-12 history and gains its own retirement clause.
- The Status line logs the revision, so the file stays internally consistent with the convention it enforces on itself.
</success_criteria>

<output>
Write `.planning/quick/260916-tai-revise-route-recipe-batch-md-record-the-/260916-tai-SUMMARY.md` when done,
recording: every passage edited with its line number, the treatment chosen for each
(silent replacement vs recorded supersession), and confirmation that `git status --porcelain app/`
was empty at the end.
</output>
