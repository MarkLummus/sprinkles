---
status: diagnosed
trigger: "G-03.5-7 — VoiceOver on the iPad: fold button names read with no pause between the heading and the Show/Hide word (UAT test 7, 03.5)"
created: 2026-09-29T00:00:00Z
updated: 2026-09-29T00:00:00Z
goal: find_root_cause_only
---

## Current Focus

hypothesis: The WR-01 fix (0950f2e) set aria-label = `${label} ${controlWord}` joined by a plain SPACE; speech synthesis treats a space as a word boundary, not a pause, so VoiceOver reads "Version Show details" as one run with no pause. The UAT truth asks for a pause ("Version, Show details"), which needs punctuation (a comma) in the name.
bug_class: Bohrbug (deterministic: the same string every render)
status_note: CONFIRMED. Served bundle builds the name with a space; Chromium AX tree reads "Version Show details" from aria-label; Apple TTS shows 0 ms gap at a space and a ~220 ms gap at a comma.
candidate_causes:
  - code: space-joined aria-label at FoldRow.jsx:21 (confirmed)
  - data/build: stale bundle on the device (eliminated; bundle carries the fix)
  - environment: WebKit/VoiceOver reading the contents instead of aria-label (moot; audio is byte-identical either way)
and_gate: no. One condition is enough: no punctuation in the spoken string.
blind_spots: WebKit's own computed name was not read locally (no WebKit build with an AX snapshot here); iPad VoiceOver's voice is not the macOS `say` voice, though both are Apple TTS with the same comma prosody. Confirm on the iPad.
next_action: return ROOT CAUSE FOUND to the orchestrator (find_root_cause_only).

## Symptoms

expected: VoiceOver on the iPad announces each fold button's name as separate words with a pause (e.g. "Version, Show details") for fold-version, fold-history, fold-balance, fold-check, fold-tasting, fold-batches.
actual: "fail. there is no pause between the heading and the show/hide word" (Mark, UAT test 7)
errors: none
reproduction: VoiceOver on the iPad, built app (dist index-CrtH-8SI.js, built 2026-09-28 12:20), swipe to each fold button.
started: discovered during UAT; the WR-01 fix 0950f2e (12:16) is in the build tested.

## Evidence

- timestamp: 2026-09-29
  checked: git show 0950f2e; app/src/ui/FoldRow.jsx:18-29
  found: accessibleName = `${name} ${controlWord}${count ? `, ${count}` : ''}` — label and control word joined by a single space; only the count gets ", ". Tests pin aria-label="Version Show details", "Watch for Show", "Tasting Show, tasted date unknown".
  implication: the name has word boundaries but no punctuation between label and Show/Hide.

- timestamp: 2026-09-29
  checked: app/dist/assets/index-CrtH-8SI.js (the bundle served on :4173 and tested by Mark)
  found: c=`${typeof e==`string`?e:t} ${s}${o?`, ${o}`:``}` passed as "aria-label":c on the button.
  implication: the fix IS in the tested build; the build is not stale.

- timestamp: 2026-09-29
  checked: 03.5-UAT.md test 7 expected vs 03.5-REVIEW.md WR-01 fix suggestion
  found: UAT expected example is 'Version, Show details' (comma); the review's suggested fix and the applied fix both use a space ('${labelText} ${controlWord}').
  implication: the fix was built to the review's "separate words" criterion, not the UAT's "with a pause" criterion.

- timestamp: 2026-09-29
  checked: Chromium (Google Chrome, headless) CDP Accessibility.getFullAXTree against the served build http://localhost:4173 (olive-oil batch route) at 1366 and 393
  found: fold-version "Version Show details"/"Version Hide details"; fold-check "Watch for Show"; fold-balance "Balance Show"; fold-tasting "Tasting Show, tasted date unknown". Name source reported as attribute:aria-label. DOM textContent is "VersionShow details", "Watch forShow", "TastingShowtasted date unknown". h2/h3 heading parents take the same name from the button. (History/Batches folds absent on this seed with one version and one batch; they go through the same FoldRow.jsx:21 string build.)
  implication: the engine computes exactly the aria-label; there is no comma or other punctuation between the label and Show/Hide anywhere in the name.

- timestamp: 2026-09-29
  checked: Apple speech synthesis (macOS `say`, voices Samantha en_US and Daniel en_GB) rendered to WAV, silent gaps >=40ms measured by envelope
  found: "Version Show details" -> 0 gaps (1340 ms Samantha); "Version, Show details" -> one 225 ms gap after "Version"; "Watch for Show" -> 0 gaps vs "Watch for, Show" -> 220 ms gap; "Tasting Show, tasted date unknown" -> a gap ONLY at the comma before the count (265 ms), none between Tasting and Show. Same pattern in Daniel. The audio for "Version Show details" and "VersionShow details" (pre-fix contents) is byte-identical (MD5 848cabea11349efd3f7054b09a7e92c6 both).
  implication: a space produces no pause in Apple's synthesizer; the synthesizer already split the run-on "VersionShow" into two words, so the WR-01 fix changed NOTHING audible at the label/Show boundary. Only punctuation (comma) produces the pause the UAT asks for. The existing ", " before the count already pauses, which proves the mechanism.

- timestamp: 2026-09-29
  checked: web sources on screen-reader punctuation and WebKit presentational children
  found: Deque "Screen Readers: A Guide to Punctuation" (commas are voiced as short pauses; periods, commas, semicolons, colons, dashes generate pauses/inflections across JAWS, NVDA, VoiceOver); TPGi "Respect your children" (WebKit on macOS and iOS treats button children as presentational, so VoiceOver reads the button as one element); W3C Understanding SC 2.5.3 (label-in-name matching ignores punctuation, so a comma in aria-label keeps 2.5.3 intact); W3C APG disclosure/accordion guidance (aria-expanded carries the state; the name describes the content).
  implication: adding a comma in aria-label is the standard way to get a VoiceOver pause and does not break Label in Name.

## Eliminated

- hypothesis: stale build on the iPad (the fix not in the bundle Mark tested)
  evidence: app/dist/assets/index-CrtH-8SI.js (served on :4173, built 12:20) contains "aria-label":c with c=`${label} ${s}${count?`, ${count}`:``}`
  timestamp: 2026-09-29
- hypothesis: VoiceOver ignoring aria-label and reading the run-on content is what makes it sound joined
  evidence: irrelevant to the outcome. Apple TTS renders the content "VersionShow details" and the aria-label "Version Show details" byte-identically, so either path sounds the same with no pause. WebKit exposes a button's aria-label as its name with children presentational (TPGi), and Chromium reports the name source as aria-label.
  timestamp: 2026-09-29
- hypothesis: the h2/h3 heading wrapper (Balance, Watch for, Tasting) changes what is read
  evidence: Chromium gives the heading the same name as the button; Version/History/Batches have no heading wrapper yet show the same space-only construction; the defect is in the string itself, not the tree.
  timestamp: 2026-09-29

## Resolution

root_cause: app/src/ui/FoldRow.jsx:21 builds the button's aria-label as `${name} ${controlWord}${count ? `, ${count}` : ''}`, joining the label and the Show/Hide word with a plain space. Speech synthesis does not pause at a space (measured with Apple TTS: 0 ms gap; byte-identical audio to the pre-fix run-on text "VersionShow details"), so VoiceOver reads "Version Show details" / "Watch for Show" / "Tasting Show, …" as one continuous phrase. Only punctuation makes a pause; the count's ", " already pauses. The WR-01 fix (0950f2e) followed the review's suggested template (03.5-REVIEW.md:69, also space-joined) and aimed at "separate words", while UAT test 7 asks for a pause ("Version, Show details"). Tests pin the space form (FoldRow.test.jsx:24,45,126,133,147,154; VersionRow.test.jsx:488,497; DerivedAdvisories.test.jsx:41,49; BatchRow.test.jsx:1421,1433), so they encoded the wrong target and could not catch this.
fix: (not applied — find_root_cause_only)
verification: (not applicable)
files_changed: []
