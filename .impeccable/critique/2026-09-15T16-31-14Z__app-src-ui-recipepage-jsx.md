---
target: app/src/ui/RecipePage.jsx
total_score: 19
max_score: 32
na_heuristics: 5,9
p0_count: 0
p1_count: 0
p2_count: 4
p3_count: 0
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx"
target_fingerprint: "sha256:1280da79bde11dc040d09d84374ba393107cea251226c79306f82eb3b19769f9"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx
timestamp: 2026-09-15T16-31-14Z
slug: app-src-ui-recipepage-jsx
---
Method: dual-agent (A: box_design; B: box_evidence), independent source assessments plus parent live inspection. Target app/src/ui/RecipePage.jsx, live localhost5173 recipe olive-oil-ice-cream-v1 with supplied batch166eb2a8-df98-4ffd-ab93-3778a413dc90. Scope next-version front matter.

The user's diagnosis is right: creation is appended below the parent's front matter rather than replacing the current identity. The old name/Written/Why remain while the new name/reason/citation appear below; the description under the old name is already editable new-draft content. The notebook identity fits; ownership and hierarchy need correction.

P2: Replace the version line below the stable recipe title with the single draft-name input (Headnote.jsx15, VersionRow.jsx250). Keep the recipe title; show a visible Version name label. The draft should occupy the place its saved value will occupy. Suggested pass layout.
P2: Replace the right-hand read metadata with Next version, From[parent], Why input, optional From batch, Cancel/Save. Remove the additional full-width identity ceremony once its fields have their homes. The parent's Written/Why are reference information, not current metadata (VersionRow.jsx136). Suggested pass shape/layout.
P2: Identify inherited editable content. The introduction is draft prose copied from the parent while its neighboring title/metadata remain parent-only. Give the editor a visible Description label. Inherit description, ingredients, method and authored notes; do not clear useful content. Make it obvious that saving changes the child and preserves the parent. Suggested pass clarify.
P2: Show provenance once and label any retained batch as a source. The parent name currently appears in the title line, Next version from and was. Use one From reference; was implies overwriting rather than deriving. If the batch remains during editing label Source batch or explicit comparison, never an unlabeled batch of the draft. Supplied URL currently reports No batch of this version has that address; source-batch populated state not reviewed. Suggested pass clarify.

Recommended layout: stable recipe title and editable Version name/Description on left; Next version, one From reference, Why, From batch and save controls on right. Stack naturally when narrow. Optional source comparison below. Ingredients/method/balance remain the draft's working content. Cancel restores parent reading; save replaces editable fields with saved values and new metadata. No modal or separate creation page needed.

Strengths: stable recipe identity, in-place description editing, optional citation, page-level draft state, current control language. Sources deliberately initialize identity/reason/citation blank but inherit recipe content. Successful child save navigates to a new route; the old003 after-save actuals bug was not attributed to this implementation. No save tested. Empty-name, dirty-cancel and error recovery not runtime tested.

Heuristics: status2, real-world match3, control/freedom3 (untouched Cancel tested), consistency2, error prevention n/a (not tested), recognition2, efficiency2, minimalism2, error recovery n/a (not tested), help3. Total19/32 for this narrow front-matter review. P0 0 P1 0 P2 4 P3 0. Creator must mentally separate parent facts from child fields; unified draft identity removes that burden. No claim about whole-app readiness.

Detector0 findings for RecipePage.jsx,VersionRow.jsx,Headnote.jsx; component scan cannot judge identity ambiguity. Source and desktop screenshot confirmed findings. No overlay read-only browser API, no server started, no app saves or source edits. Review exited via Cancel and tab closed.
