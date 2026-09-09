---
phase: quick-260909-oov
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/Method.jsx
autonomous: true
requirements: [CRITIQUE-2026-09-09-P0]

estimate:
  tokens: 14000
  raw_tokens: 14000
  tasks: 1
  confidence: low

must_haves:
  truths:
    - "Pressing Develop on a version whose steps already carry purpose or aside text lands focus on the version-line input, with the page still at the top (scrollY 0)."
    - "Pressing an on-demand opener — add purpose, add aside, or done differently — still moves focus into the field that press just opened."
    - "A step whose purpose or aside already holds text still renders that field open with no opener beside it (D-23), and Amend still opens the batch pen lines that hold text (D-25) — what changes is only where focus goes, never what renders."
    - "An empty blur still collapses the field back to its opener and still clears the draft value through onCollapse; re-opening it by press focuses it again."
  artifacts:
    - app/src/ui/Method.jsx
  key_links:
    - "openField -> openedByUser.current -> the focus effect: the only path that can now reach fieldRef.current.focus()"
    - "handleBlur's empty-value branch -> openedByUser.current reset -> a later press focuses the re-opened field"
    - "Versions.jsx line 148's version-line autoFocus -> uncontested on mount, because no on-demand field focuses itself during the pen's first render"
---

<objective>
Close the [P0] of the 2026-09-09 recipe-page critique: pressing Develop scrolls the maker
2757px down to step 8's aside. `useOnDemandField` focuses its field whenever `isOpen` is
true, and `isOpen` starts as `initialOpen` — true for every step whose purpose or aside
already carries text — so on mount every such field focuses itself and the last in DOM
order beats the version line's `autoFocus`.

Purpose: the pen's first moment belongs to the version line and the table, not to the
bottom of the method column.
Output: one guard in `useOnDemandField` so focus follows the maker's own press and nothing
else. Fixing the hook once fixes all three of its users — purpose, aside, and the batch
pen's "done differently" line.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.impeccable/critique/2026-09-09T11-54-37Z__app-src-ui-recipepage-jsx.md
@app/src/ui/Method.jsx
@app/src/ui/Method.test.jsx
@app/src/ui/Versions.jsx
</context>

<interface_context>
Facts established by reading the source before planning — treat these as given, do not
re-derive them:

- `useOnDemandField(initialOpen, onCollapse)` is `app/src/ui/Method.jsx` lines 47–67. It
  holds `const [isOpen, setIsOpen] = useState(initialOpen)` and `const fieldRef =
  useRef(null)`; `openField()` calls `setIsOpen(true)`; the effect is
  `useEffect(() => { if (isOpen) fieldRef.current?.focus(); }, [isOpen])`; `handleBlur`
  collapses on an empty trimmed value with `setIsOpen(false)` then `onCollapse()`. It
  returns `{ isOpen, openField, fieldRef, handleBlur }`.
- Three call sites, all inside this file: `purpose` (line 95) and `aside` (line 98) in
  `StepPenBody`, and `line` (line 331) in `StepRecordingControls`. All three pass
  `Boolean(...)` of existing text as `initialOpen`, so all three carry the same mount bug.
  Fixing the hook fixes all three; do not touch the call sites.
- `setIsOpen(false)` appears nowhere but `handleBlur`'s empty-value branch, so a collapse
  has exactly one route.
- The version line that should win on mount is `app/src/ui/Versions.jsx` line 148 — a bare
  `autoFocus` on the ceremony's `.ink-field` input. `autoFocus` is a mount-time DOM
  mechanism; an effect calling `.focus()` after it always wins. Do not change Versions.jsx.
- Versions.jsx also holds two deliberate focus effects that this task must leave alone: the
  tasting-close return (lines 40–49) and the blocked-save move to the version line
  (lines 125–128).
- Tests run under Vitest in the `node` environment through `renderToStaticMarkup`
  (`app/vitest.config.js`); there is no jsdom and no testing-library, and the project has
  ruled both out. Effects therefore never run in the suite, so no existing test asserts
  focus and no new test can. The suite's role here is a regression guard on what renders.
- Two existing tests already guard the render behaviour that the naive over-fix
  (`useState(false)`) would break: Method.test.jsx line 685, "renders the purpose and aside
  fields, and no opener, when the draft already carries text", and line 80, "renders the
  line field, not the opener, when the step's entry already holds a line (what Amend
  opens)". Both must stay green, untouched.
- Baseline measured before planning: `npm --prefix app test` → 30 files, 618 tests, all
  passing, 493ms.
</interface_context>

<tasks>

<task type="tracer">
  <name>Task 1: Focus follows the maker's press, not the mount</name>
  <files>app/src/ui/Method.jsx</files>
  <read_first>app/src/ui/Method.jsx lines 40–70 (the hook and the comment block above it)</read_first>
  <action>
In `useOnDemandField` only, add a second ref beside `fieldRef` named `openedByUser`,
initialised `false`. Set `openedByUser.current = true` inside `openField`, before
`setIsOpen(true)`. Narrow the existing effect's condition so it reaches
`fieldRef.current?.focus()` only when `isOpen` is true AND `openedByUser.current` is true;
keep its `[isOpen]` dependency list exactly as it is. In `handleBlur`'s empty-value branch,
reset `openedByUser.current = false` alongside the existing `setIsOpen(false)` and
`onCollapse()` call, so a field the maker re-opens later focuses again.

Change nothing else: `initialOpen` still seeds `isOpen`, so a step that already carries
purpose, aside, or a batch line still renders its field open rather than its opener — that
is D-23 and D-25 and it stays. Do not touch the three call sites, `Versions.jsx`, or any
test file. Extend the existing comment above the hook by one sentence naming why the effect
is guarded (the version line's autoFocus must win on mount); do not restate the identifier
names in prose, and do not rewrite the comment that is already there.
  </action>
  <verify>
    <automated>npm --prefix app test && node -e 'const fs=require("fs");const src=fs.readFileSync("app/src/ui/Method.jsx","utf8");const hook=src.slice(src.indexOf("function useOnDemandField"),src.indexOf("function StepPenBody"));const code=hook.replace(/\/\*[\s\S]*?\*\//g,"").split("\n").filter((l)=>!l.trim().startsWith("//")).join("\n");const effect=code.slice(code.indexOf("useEffect("),code.indexOf("[isOpen]"));const ok=/openedByUser\s*=\s*useRef\(/.test(code)&&/openedByUser\.current\s*=\s*true/.test(code)&&/openedByUser\.current\s*=\s*false/.test(code)&&/openedByUser\.current/.test(effect);console.log(ok?"GATE PASS":"GATE FAIL");process.exit(ok?0:1);'</automated>
    <human-check>Run `npm --prefix app run dev`, open a version whose steps already carry purpose or aside text, and press Develop. Confirm `document.activeElement` is the version-line input and `window.scrollY` is 0 — the page has not moved. Then press "add purpose" on any step and confirm focus lands in the field that just opened; blur it empty and confirm it collapses back to its opener; press it again and confirm focus returns. Repeat the press check once in the batch pen's "done differently" line, and confirm Amend still opens the lines that already hold text without moving the page.</human-check>
  </verify>
  <done>The full suite is green at 30 files / 618 tests with no test file changed; the structural gate prints GATE PASS (it strips comments first, so the guard must be real code); `app/src/ui/Method.jsx` is the only changed file and its diff is confined to the `useOnDemandField` body plus one comment sentence.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| maker's keyboard/pointer → component-local state → draft → IndexedDB | The only input path on this surface. This task changes which element holds focus; it adds no reader, no parse, and no write. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-oov-01 | Denial of Service (availability of the control) | `useOnDemandField` focus effect | low | mitigate | A ref left stuck `false` would make a re-opened field unfocusable. The reset sits on the single collapse route (`handleBlur`'s empty-value branch, the only caller of `setIsOpen(false)`), and the human-check exercises open → empty blur → re-open explicitly. |
| T-oov-02 | Tampering | draft step values (purpose, aside, batch line) | low | mitigate | `handleBlur` keeps reading the blur event's own value and still calls `onCollapse()` on an empty trim, so the clear-on-collapse contract is untouched; no draft value, store write, or coefficient snapshot is in this diff. |
| T-oov-03 | Tampering | supply chain (npm install) | low | accept | This plan installs no package: `app/package.json` and `app/package-lock.json` are not in `files_modified`, and the task adds no dependency. No legitimacy gate is required. |
</threat_model>

<verification>
- `npm --prefix app test` passes at 30 files / 618 tests, with no test file edited.
- Method.test.jsx line 685 and line 80 — the two tests that assert an already-texted field
  renders open with no opener — are still green, proving `initialOpen` was narrowed in
  focus only, not in render.
- The structural gate prints GATE PASS: the ref is declared, set on the maker's press, reset
  on collapse, and consulted inside the effect, with comments stripped before matching.
- `git status` shows `app/src/ui/Method.jsx` as the only changed file under `app/`.
- Known limitation, recorded rather than solved: the suite cannot prove focus, because the
  node Vitest environment runs no effects and the project has ruled out jsdom and
  testing-library. The `document.activeElement`/`scrollY` assertion is the human-check
  above; if it is deferred, carry it into the phase's UAT rather than dropping it.
</verification>

<success_criteria>
- After Develop, focus is on the version-line input and the page has not scrolled.
- An on-demand field focuses when, and only when, the maker's own press opened it.
- Steps that already carry purpose, aside, or a batch line still open their fields on sight,
  and an empty blur still collapses and clears them.
- The full suite passes with no test changed, and `app/src/ui/Method.jsx` is the only file
  touched.
</success_criteria>

<output>
Create `.planning/quick/260909-oov-stop-the-on-demand-method-field-stealing/260909-oov-SUMMARY.md` when done.
The SUMMARY must record: the final diff of `useOnDemandField`, the suite's file/test counts,
the gate's verbatim line, and whether the browser human-check was run or deferred to UAT.
</output>
