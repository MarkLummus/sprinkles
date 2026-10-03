---
status: diagnosed
trigger: "iPhone Record a tasting: Tasted date calendar appears then disappears; field untappable until another field is focused; the calendar's Reset does nothing"
created: 2026-10-03
updated: 2026-10-03
---

## Symptoms

DATA_START
Reported by Mark on 2026-10-03, device-checked on the build served at :4173 (iPhone, 393):

- Expected: tapping the band's "Record a tasting" on Coconut v2 opens the amend pen on Add tasting with the Tasted date ready to use; tapping the Tasted date opens iOS's date calendar and it stays open; the calendar's Reset clears the date.
- Actual: the iOS date calendar for the Tasted date appears, then disappears immediately; the Tasted date field cannot then be tapped open. Tapping the Tempering field focuses it normally, and after that the Tasted date field can be tapped and its calendar opens. It behaves as if the calendar is moved off screen or hidden after the first open. Cancel returns to the band (that part works). Second symptom: the "Reset" button in the iOS date calendar does nothing, so Mark cannot clear the tasting date to test the empty-date edge case.
- Errors: none reported.
- Timeline: new path. Quick 261002-wn0 (commits 0a44095, da87dce, e40e99a, 5fbe805, b403acc) made the band's Record a tasting open the amend pen on Add tasting and focus the Tasted date; it also added the app's first scrollIntoView in the band's focus-return effect. Not known whether the same symptom exists via Correct then Add tasting (old path) or the Churn date on Record another.
- Reproduction: iPhone, Coconut v2, tap Record a tasting in the band.
DATA_END

## Current Focus

bug_class: Bohrbug (deterministic on the device per Mark's report; DOM side reproducible in desktop WebKit, the native picker is not)
hypothesis: |
  H1 (picker closes): the Record a tasting press commits ONE render in which the Churn date mounts with autoFocus (BatchRow.jsx:683, focused by React in commitMount) and the addTastingAttempt effect (BatchRow.jsx:500-502) then focuses the Tasted date in the same task. iOS receives two date-input focuses back to back: the Churn date popover starts presenting, is torn down, and the Tasted date popover goes down with it, leaving the Tasted date DOM-focused with no picker. A tap on an already focused element does not re-present it; focusing Tempering first resets that.
  H2 (dead Reset): WebKit's Reset calls setFocusedElementValue(ctx, null String); HTMLInputElement::setValue(null) un-dirties the value and falls back to the value CONTENT ATTRIBUTE; React syncs the value attribute of a controlled input to the controlled value, so Reset restores the current value, React's tracker sees no change and onChange never fires.
test: done. Probe date-picker-probe.mjs and reset-fix-check.mjs (scratchpad) in Playwright WebKit, iPhone 14 descriptor at 393x852, against app/dist.
expecting: met. H1's DOM half and all of H2 reproduced (see Evidence); H1's native half needs the iPhone.
next_action: diagnosis returned to the orchestrator (find_root_cause_only); Mark runs the device checks below, then a GSD quick task applies the fix.
reasoning_checkpoint:
  hypothesis: "Two independent causes. (1) The band's Record a tasting opens the pen in one commit that focuses two date inputs inside one user gesture -- React's autoFocus on the Churn date (BatchRow.jsx:683) and then the addTastingAttempt effect on the Tasted date (BatchRow.jsx:500-502, armed in the same handler by 261002-wn0, RecipePage.jsx:1370-1372). iOS starts the Churn date's calendar and then hands over to the Tasted date's mid-presentation; the Tasted date's calendar is torn down, editing ends natively, and the Tasted date stays DOM-focused, so a tap on it is a refocus that shows nothing until focus goes elsewhere. (2) iOS's Reset is setValue(null), which falls back to the input's value content attribute; React writes the controlled value into that attribute, so Reset re-applies the date already shown and React's change tracker never fires onChange."
  confirming_evidence:
    - "Probe PATH 1: focus(Churn date) then focus(Tasted date) inside the tap's own task; PATH 2a, 2b and 3 each have exactly one date focus per tap."
    - "Probe: after the first focus the Tasted date stays the same node, focused, unmoved for 61 frames; no scrollIntoView, no blur, no remount -- nothing on the page side closes it."
    - "WebKit source: Reset sends a null String; HTMLInputElement::value() returns the value attribute when the dirty value is null; HTMLInputElement::reset() uses the same call."
    - "Probe: as built, Reset replayed through WebKit's own setValue(null) leaves 2026-10-01; a true '' clears; with the value attribute removed the same Reset clears (both date inputs)."
  falsification_test: "(1) On the iPhone, Correct then Add tasting (2b) also loses its calendar the same way, or the band's Record a tasting still loses it once the Churn date autoFocus is suppressed for that open. (2) On the iPhone, Reset clears a date on a page where the input carries no value attribute -- or fails to clear one after the attribute is stripped."
  fix_rationale: "(1) Suppressing the Churn date's mount focus when the same open already targets the Tasted date makes Record a tasting produce exactly the single date focus that the Add tasting path produces. (2) Keeping the value attribute off the two date inputs makes WebKit's null Reset fall back to empty, which reaches React as a real change to ''."
  blind_spots: "Desktop WebKit cannot present the native calendar, so the popover tear-down in (1) is inferred from WebKit source plus Mark's report, not observed. Mark's iOS version is unknown (the probe UA says iOS 16; the popover code is iOS 17+). The 'tap on a focused date input does not reopen' detail is Mark's observation, not reproduced. Not yet confirmed on device that Correct/Record another/Add tasting keep their calendar open."
  candidate_causes:
    - "code: Churn date autoFocus plus the addTastingAttempt effect fire in one commit (wn0 armed both in handleStartAmending)"
    - "code: the wn0 scrollIntoView in VersionRow's focus-return effect (eliminated: runs only on close)"
    - "environment: iOS WebKit's date popover handover when focus moves between two date inputs within one gesture"
    - "environment: iOS Reset implemented as setValue(null) -> value attribute fallback"
    - "config/framework: React's value-attribute syncing on controlled inputs (always on in stable React 19)"
    - "data: Coconut v2's batch has churnDate null and no tasting, so both date fields start empty (iOS fills today on open); not causal, but it makes the Churn date write visible"
  and_gate: "yes, for each symptom separately. Symptom 1 needs the app's two focus() calls in one gesture AND iOS's popover handover. Symptom 2 needs WebKit's null Reset AND React's attribute syncing. The two symptoms share no cause; the app-side lever for each is in BatchRow.jsx."

## Evidence

- timestamp: 2026-10-03
  checked: knowledge base (.planning/debug/knowledge-base.md) and resolved sessions
  found: neither exists; no prior pattern to test first
  implication: open-ended investigation

- timestamp: 2026-10-03
  checked: app/src/ui/BatchRow.jsx (HEAD 155e906)
  found: the Churn date input carries autoFocus (line 683) and mounts whenever mode === 'recording'; the Tasted date is focused by an effect keyed on addTastingAttempt (lines 499-502) and is controlled (value={draft.tastedDate}, line 808). No key change, no remount and no scroll on either date input. The only scrollIntoView in app/src is VersionRow.jsx:113, which runs when the pen CLOSES (openPen leaves 'amend'), never when it opens.
  implication: on the Record a tasting path one commit focuses two date inputs: React's commitMount autoFocus on the Churn date, then the passive effect on the Tasted date. The wn0 scrollIntoView cannot fire while the pen is opening.

- timestamp: 2026-10-03
  checked: git show da87dce (261002-wn0) RecipePage.jsx handleStartAmending
  found: the 'record-a-tasting' opener sets tastingOpen true in the draft AND bumps addTastingAttempt inside the same handler that sets mode 'recording'. Before wn0, Add tasting bumped the counter in its own press, after the pen (and its Churn date autoFocus) had already mounted on an earlier press.
  implication: wn0 is what put the two focus() calls into one task; the Churn date autoFocus itself is older (pre-wn0) and still fires alone on Correct and on Record another.

- timestamp: 2026-10-03
  checked: RecipePage.jsx handleChangeRecordField (lines 1176-1194)
  found: the value is stored as given; '' is accepted (tastedDate '' is the blank value, and save maps '' to null at line 561). Nothing rejects or re-fills an empty date.
  implication: the dead Reset is not the app's handler refusing an empty string; if onChange fired with '', the field would clear.

- timestamp: 2026-10-03
  checked: WebKit source (main), Source/WebKit/UIProcess/ios/forms/WKDateTimeInputControl.mm
  found: datePickerPopoverControllerDidReset calls setDateTimePickerToInitialValue then page->setFocusedElementValue(ctx, { }) -- a NULL String. The same null-String Reset has been there since the 2023 popover refactor (9cb30cccf0) and before it (reset: sends String()). controlBeginEditing on an EMPTY date input calls setDateTimePickerToInitialValue, which writes today's date into the element (_dateChanged -> updateFocusedElementValue).
  implication: Reset never sends ''; it sends null. Opening the picker on an empty date fills today's date.

- timestamp: 2026-10-03
  checked: WebKit source (main), WebPageIOS.mm setFocusedElementValue and WebCore HTMLInputElement.cpp / BaseDateAndTimeInputType.cpp
  found: setFocusedElementValue -> input->setValue(value, DispatchInputAndChangeEvent). sanitizeValue(null) on a date input returns the null unchanged (typeMismatchFor is false for an empty string), setValueInternal stores m_valueIfDirty = null, and HTMLInputElement::value() with a null m_valueIfDirty returns the sanitized value CONTENT ATTRIBUTE. HTMLInputElement::reset() uses the very same setValue({ }) to restore the default value.
  implication: on iOS, Reset sets the field back to its value attribute, not to empty. React keeps the value attribute of a controlled input in step with the controlled value, so Reset lands on the value already shown and React's change tracker sees nothing to report. Known React reports of the same symptom: facebook/react #8938, #12313, #23299 (controlled only; uncontrolled clears).

- timestamp: 2026-10-03
  checked: WebKit WKDatePickerPopoverController.mm presentInView and WKDateTimeInputControl controlEndEditing/removeDatePickerPresentation
  found: each date focus presents a popover animated; ending editing on the previous element dismisses its popover with dismissViewControllerAnimated:NO; presentInView walks past a presenting controller only when it isBeingDismissed (a comment names "tabbing between date pickers"). When the popover goes away for any reason other than the web page blurring the element, viewDidDisappear -> datePickerPopoverControllerDidDismiss -> accessoryDone ends editing but leaves the DOM element focused. Two 2023 regressions in this same code were "date picker fails to present when switching focus from a text field to a date input" and "fails to present after dismissing with Done".
  implication: plausible native mechanism for H1 (second popover presented from, or torn down with, the first). This part is inference from source; only the iPhone can show it.

- timestamp: 2026-10-03
  checked: scratchpad probe date-picker-probe.mjs, Playwright WebKit 1.63 (webkit-2359), iPhone 14 descriptor at 393x852 (coarse true, hasTouch, isMobile), app/dist built 06:59:35 (contains the wn0 code), harness servers on 127.0.0.1 ephemeral ports; taps, not clicks; HTMLElement.prototype.focus and Element.prototype.scrollIntoView instrumented; a setTimeout(0) marker scheduled from the tap's click closes the tap's own task
  found: |
    PATH 1, band Record a tasting (Coconut v2): inside the tap's own task, focus() on the Churn date (React internals in the stack: the autoFocus commitMount), then focus() on the Tasted date (the addTastingAttempt effect), then focusout of the Churn date with relatedTarget the Tasted date; task-end reports the Tasted date active at scrollY 0; then ONE scroll to 2100 (focus reveal). Zero scrollIntoView() calls.
    PATH 2a, log Correct: ONE focus() (Churn date autoFocus) in the tap's task. PATH 2b, Add tasting: the tap blurs the Churn date onto the button (separate gesture), then ONE focus() (Tasted date) in the tap's task, then one scroll 1166 -> 2100.
    PATH 3, log Record another: ONE focus() (Churn date autoFocus) in the tap's task.
    In PATH 1 and PATH 2b the Tasted date sat below the viewport at focus time (document y 2504; viewport bottom 852 at scrollY 0, 2018 at scrollY 1166) and was revealed by the same single scroll.
    WebKit dispatches focus but not focusin on a date input (checked separately on a bare page, both contexts), so focus() calls and activeElement are the readings, not focusin.
  implication: the ONLY DOM difference between the broken path and the old Add tasting path is the second date focus in the same task. Off-screen-at-focus, the reveal scroll and the unmounting of the tapped button are common to the paths that are not reported broken.

- timestamp: 2026-10-03
  checked: same probe, every animation frame for 1 s after PATH 1 and PATH 2b opened
  found: 61 frames, one distinct state in each: the same Tasted date node, focused, top 404, scrollY 2100. No blur, no remount, no second scroll.
  implication: nothing in the page blurs, moves or replaces the Tasted date after the first focus. Whatever closes the picker on the device is native, triggered by the focus sequence, not by a later page event.

- timestamp: 2026-10-03
  checked: same probe, H2 on the open pen; Reset replayed through real WebKit setValue(null) (HTMLInputElement::reset via a temporary form tied by the form attribute, no DOM move), then input + change, then an unrelated re-render (typing Tempering)
  found: after a picked 2026-10-01 the input's value ATTRIBUTE reads 2026-10-01 (React syncs it). el.value right after setValue(null) = 2026-10-01; after input + change and a re-render the field still reads 2026-10-01: React's state never changed. Control, a true clear ('' then input + change): field and attribute both ''. With the attribute removed first, the same Reset gives el.value '' and React's state follows to ''.
  implication: H2 reproduced in real WebKit semantics. The app's handler is fine; the value attribute React writes is what Reset falls back to.

- timestamp: 2026-10-03
  checked: scratchpad reset-fix-check.mjs, as built vs a MutationObserver that strips the value attribute from date inputs right after React writes it (stand-in for a layout effect)
  found: as built, Reset leaves the Tasted date at 2026-10-01, then at 2026-09-30 after a second pick, and the Churn date at 2026-09-29. Attribute stripped: each Reset empties the field ('' in value and in React state after a re-render); a pick after a Reset works; picked values display normally with no attribute.
  implication: H2 is path-independent (every date input in the app: only BatchRow's two exist) and predates wn0. Keeping the value attribute off the two date inputs makes iOS Reset clear them.

## Eliminated

- hypothesis: the wn0 scrollIntoView (VersionRow.jsx:113) moves the page and closes the picker
  evidence: it sits in the branch that runs when openPen LEAVES 'amend'; the probe logged zero scrollIntoView() calls while the pen opened on every path
  timestamp: 2026-10-03

- hypothesis: a re-render remounts the Tasted date (key change or tree move), or a later blur/scroll moves focus off it
  evidence: no key on either date input; the same node stayed focused at the same rect for 61 frames with one scroll only, identical to the Add tasting path
  timestamp: 2026-10-03

- hypothesis: the change handler rejects or re-fills an empty date (dead Reset)
  evidence: handleChangeRecordField stores '' as given; a true '' input event empties field and state in the probe
  timestamp: 2026-10-03

- hypothesis: off-screen focus target (the Tasted date below the viewport when focused, then a reveal scroll) is what dismisses the picker
  evidence: the old Add tasting path (2b) focuses the same off-screen Tasted date and reveals it with the same single scroll; only the double focus is unique to PATH 1. (Weakened, not disproven, until Mark confirms 2b keeps its calendar on the iPhone.)
  timestamp: 2026-10-03

## Resolution

root_cause: "(1) Calendar appears then disappears: 261002-wn0 (da87dce) made the band's Record a tasting arm the Tasted date focus (addTastingAttempt) in the same handler that opens the pen, and the freshly mounted Churn date still carries autoFocus (BatchRow.jsx:683, from 03.3-01/03.3.1-02). One commit, inside the tap's gesture, therefore focuses the Churn date and then the Tasted date. iOS begins the Churn date's calendar and hands over mid-presentation; the Tasted date's calendar is torn down natively and the Tasted date stays DOM-focused, so a tap on it shows nothing until focus moves elsewhere. Correct, Add tasting and Record another each focus one date per tap and are not affected in the DOM. The wn0 scrollIntoView is not involved (runs only when the pen closes). (2) Reset does nothing: iOS's Reset calls HTMLInputElement::setValue(null), which falls back to the input's value content attribute; React keeps that attribute equal to the controlled value, so Reset re-applies the date shown and React's change tracker never fires onChange. Pre-existing, independent of wn0, affects both date inputs on every path; the app's handler accepts '' correctly."
fix: "Proposed, not applied (find_root_cause_only; app edits go through a GSD quick task). (1) BatchRow.jsx:683 autoFocus -> autoFocus={addTastingAttempt == null}: the Churn date takes the mount focus unless this same open already targets the Tasted date (addTastingAttempt is null for Correct, line 1374, and for Record another, line 1157; a number only for 'record-a-tasting', line 1372). (2) BatchRow.jsx: a no-deps useLayoutEffect beside the date refs (after line 502) that calls churnDateRef.current?.removeAttribute('value') and tastedDateRef.current?.removeAttribute('value'), so WebKit's null Reset falls back to empty; import useLayoutEffect at line 1."
verification: "Diagnosis only. Desktop WebKit reproduces the DOM sequence (H1) and the Reset fallback plus its fix (H2). The native calendar behaviour needs Mark's iPhone."
files_changed: []
