---
target: app/src/ui/BatchRow.jsx
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
p2_count: 3
p3_count: 0
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/BatchRow.jsx"
target_fingerprint: "sha256:608f2be0fb5e90ac2cd7af7377cd3816ddcbc890de9444d91977f9e23ffcd157"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/BatchRow.jsx
timestamp: 2026-09-15T18-26-03Z
slug: app-src-ui-batchrow-jsx
---
Method: dual-agent (A: box_design · B: box_evidence), independent source assessments plus parent live desktop inspection.

Scope: recording a batch and optional tasting from a recipe version. The recipe list was used only for navigation and was not critiqued. No data was saved.

Design specificity: strong. Churn conditions, actual ingredient quantities, method deviations, optional tasting, sensory axes, defects, melt behavior, and Next time form a recipe-development notebook rather than a generic form. The visual language is restrained and coherent. The main problems concern sequence, completion cues, and recovery.

Overall impression: the individual controls are largely settled and accessible. The page-level journey is not. It presents the outcome summary first, then tasting, then a Save ceremony, then Next time, ingredient actuals, and method deviations, followed by another Save ceremony. This makes a long record look complete before the work represented below it has been reviewed.

Strengths:
- Tasting is optional and appears only on request.
- Empty segmented choices and axes remain truly unrecorded; Clear is explicit.
- Three-column axes are compact and their Every recipe / This recipe only grouping is legible.
- Native radio and checkbox semantics, descriptive accessible names, and Home/End support are strong.
- Numeric errors preserve the entered value and are associated with their fields.
- Removing a tasting with content offers Restore; restoration was verified live and preserved the note.
- Save controls are repeated at the bottom of the long recipe, so completion does not require scrolling back up.

Priority findings:

1. P1 — Put the recording flow in the record's natural sequence, and keep the decisive Save at the end. Current order: churn summary → optional tasting → Save → Next time → ingredient actuals → method deviations → Save. Recommended editing order: ingredient actuals → method deviations → churn outcome → tasting → Next time → Save. If a summary-first overview is valuable, make it a compact progress/index rather than an early completion ceremony. At minimum move Next time before the first Save and relabel that first control as Save progress if it intentionally permits incomplete records. The present order can cause optional actuals and deviations to be missed.

2. P1 — Put the churn-date error at the churn date. Live: Save with a blank required date focuses the field, but Enter the date you churned remains near the ceremony. With tasting expanded, the explanation is outside the focused viewport, leaving only a focus ring. Give the date aria-invalid and an adjacent aria-describedby message, matching measured numeric fields; the repeated ceremony can also retain a summary. Source BatchRow.jsx date field near 465 and ceremonies near 734/PenFoot.

3. P2 — Give the two churn prose fields persistent visible labels. At the machine and Ingredient notes exist only as accessible names; visually they are examples e.g. bowl frozen overnight and e.g. oil bottle opened 24 Jul. Once typed, the distinction disappears. Add compact captions and retain examples as placeholders. Source BatchRow.jsx505–528.

4. P2 — Make per-step deviations lighter and more progressive. Ten full-width boxed done differently actions create the strongest visual repetition on the page and look like empty fields or commit buttons. In the settled control language this is an inline action on existing content: use an underlined done differently control beside or immediately below the step; reveal the field only when invoked. Keep Skipped visible. Source Method.jsx412/473; the missing text-control class currently allows generic boxed-button styling.

5. P2 — Make later tasting discoverable from read view. A newly recorded batch can omit tasting, but returning later requires Correct, language that implies fixing an error. Since batch+tasting are one record, rename the single door Edit record; in an untasted state, a small Add tasting cue can explain what editing enables without creating a separate data model. Source BatchRow read head around433.

Minor: Exit consistency Clear appears at the far right of the 640px pen rather than beside the group label, weakening association. At ≤600px, editable fields shrink to13px while targets grow; the settled design called for16px field text. Mobile rendering and browser auto-zoom were not tested, so treat this as a source risk rather than observed failure.

Cognitive load: moderate-to-high at page level. The tasting battery itself is structured, but the full pen exposes ingredient actuals and 20 method controls across ten steps below it. The user must remember that an earlier Save does not necessarily mean the record is complete. A process-order sequence and on-demand deviations would reduce that memory bridge.

Personas/emotional journey: an experienced maker can move quickly through familiar fields and skip blanks. A first-time maker may not distinguish the unnamed note lines or understand that Correct is how to add a later tasting. A distracted kitchen user benefits from optional fields and explicit Restore, but is most vulnerable to early Save and an off-screen required-date explanation. The end state should reassure them that the whole record—including next-step intent—has been captured.

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
|1|Visibility of status|2|Early Save reads as completion; date explanation can be off-screen.|
|2|Match with real work|3|Excellent domain vocabulary; page order conflicts with process order.|
|3|Control and freedom|3|Cancel, Clear, optional tasting, and Restore work well.|
|4|Consistency and standards|2|Per-step boxed actions conflict with the settled inline-action rule.|
|5|Error prevention|2|Incomplete records can appear save-ready.|
|6|Recognition over recall|2|Unnamed notes and later tasting behind Correct require memory.|
|7|Efficiency|2|Very long pen with repeated controls; progressive disclosure is partial.|
|8|Aesthetic/minimalist design|2|Repeated full-width deviation buttons dominate.|
|9|Error recovery|3|Tasting restore is strong; date recovery placement is weak.|
|10|Help/documentation|3|Examples and domain labels help, with a few missing explanations.|
|Total||24/40|Acceptable; individual controls are stronger than the end-to-end journey.|

Counts: P0 0, P1 2, P2 3, P3 0.

Detector: zero findings on BatchRow.jsx, Segmented.jsx, and AxisMark.jsx. This confirms no deterministic style-rule flags; it cannot assess sequence, copy, or completion cues. Browser evidence covered the recipe route, record entry, tasting expansion, blank-date save, tasting removal/restoration, selection/Clear, and the lower method/foot ceremony at the current desktop viewport. No mobile or actual save/persistence test. No overlay was injected because the browser evaluation surface is read-only. No server was started. Draft changes were discarded with Cancel and the tab was closed.
