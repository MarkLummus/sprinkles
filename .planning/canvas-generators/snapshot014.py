# Sid, 2026-10-26 (Phase 11 design gate; Mark approved the four boards on the canvas page "Phase 11 steps, structure and save" on Mark's List: P11_Save on look-p11-save-r2 (2026-10-25),
# P11_Steps, P11_Structure and P11_FirstVersion on look-p11-steps-r3 (2026-10-25), with decisions 30 to 34 of sketch 013's list and the roadmap's 22 to 25 drawn on them):
# snapshots the approved boards into .planning/sketches/014-steps-structure-save/.
#   python3 snapshot014.py <dir holding project/*.dc.html as read from the artifact root at approval> <dest>
#   (read them with the Artifact tool: action read, paths ["project/P11_Steps.dc.html", ...], out_dir <dir>; never hand-edit a board or a snapshot)
# The boards are taken AS SERVED by the canvas (version 1792972438-f009, canvas version 468 of 2026-10-25), as snapshot013.py does. Each is self-contained (no canvas asset links,
# no data: URIs), so the only change is that the canvas's support.js line is dropped. p11.py regenerates all four byte for byte (boards/P11_*.dc.html match the served files, sha256 checked
# 2026-10-26). The canvas wins.
# 2026-10-26, later: P11_Structure redrawn for roadmap decision 24 (the removed step's grams fold back; Mark: "redraw it now") and republished as canvas version 469 (1792973563-74b9);
# add-remove-move.html re-taken from that served file the same way (byte-identical minus the support.js line, sha256 05826a8d).
# 2026-10-26, latest: Add to step on every row under "Not in a step yet" (decide-p11-place-unplaced-row, A; sketch 014 decision 1), P11_Steps and P11_Structure republished as canvas version 471
# (1792976158-3b8d); instructions-steps.html (sha256 163cc881) and add-remove-move.html (92c82da8) re-taken from the served files the same way. These two boards now also carry app.css's
# .method-step__open-fields > .method-step__field:first-child rule (the pen fix 21878842), inlined from the app's stylesheet; no P11 panel has that element. P11_Save and P11_FirstVersion stay as served.
# 2026-10-26, third: the reading steps in the printed method's treatment (sketch 014 decision 2; sketch 010 D18), all four boards republished as canvas version 472 (1792977056-dc7e) and all four files
# re-taken from the served files the same way: instructions-steps.html 604d6cdc, add-remove-move.html 4b298a02 (CSS only), save.html 0c9a8327, first-version.html fb6343ad; each byte-identical to
# boards/P11_*.dc.html minus the support.js line (cmp checked). P11_Save and P11_FirstVersion now also carry the pen-fix rule above.
# 2026-10-26, fourth: each step orders its own rows (decide-p11-row-order-across-steps; sketch 014 decision 3; Mark: redraw on decide-p11-sketch-014-boards-vs-row-order): P11_Steps (pD1 gains Whole milk's
# second line under Step 2) and P11_Structure (qD1's step 1 uses line in the moved order) republished as canvas version 489 (1793057443-4cd7); instructions-steps.html (sha256 d9550594)
# and add-remove-move.html (f7aa930c) re-taken from the served files the same way (cmp checked against boards/). These two now also carry the app stylesheet's ultra-wide frame rules
# (--app-frame-max, shell.css; decide-ultrawide-frame 2026-10-26), inlined as every regeneration inlines the current app CSS; nothing changes at 1366. P11_Save and P11_FirstVersion stay as served.
# 2026-10-27: the build's settled decisions and Mark's answers of 2026-10-27 drawn back (sketch 014 decisions 5 to 7; the chip's remove, Print sheet, the one-line History, "600.0 g",
# three P11_FirstVersion panels), all four boards republished as canvas version 492 (1793099733-26a6) and all four files re-taken from the served files the same way:
# instructions-steps.html 44249bb6, add-remove-move.html e3f5b6b3, save.html 0144edf9, first-version.html f547c81d (served = generated, cmp checked against boards/).
# 2026-10-28: every inline control in sentence case (bug-p11-link-case-mixed; sketch 014 decision 8) and the open step's number on its lead-in's baseline (bug-p11-step-number-leadin-misaligned;
# decision 9), all four boards republished as canvas version 494 (1793154101-189e) and all four files re-taken from the served files the same way (served = generated, cmp checked against boards/):
# instructions-steps.html 43e33eda, add-remove-move.html e714dbc2, save.html 1a78bfb9, first-version.html 07adb0ec.
# 2026-10-28, later: the number on its lead-in's baseline on the reading steps too (Mark on look-p11-step-baseline-redraw: "we should be consistent"; sketch 014 decision 10; P11_CSS's rule
# widened from .mk-step to .method-step), all four boards republished as canvas version 496 (1793191521-6988; P11_Structure changes in that inlined rule only) and all four files re-taken
# from the served files the same way (served = generated, cmp checked against boards/): instructions-steps.html babf5258, add-remove-move.html bfeba9c9, save.html e58405b9, first-version.html e8c70708.
# 2026-10-28, later still: the inline controls without articles, Change ingredients, Add purpose, Add aside (look-p11-link-case approved with Mark's note "drop articles according to the house rule
# including the version pen"; sketch 014 decision 8 amended), all four boards republished as canvas version 497 (1793191896-e079) and all four files re-taken from the served files the same way
# (served = generated, cmp checked against boards/): instructions-steps.html 32717f6a, add-remove-move.html 0542f74b, save.html d43268c1, first-version.html 04def55a.
# 2026-10-31: the boxed buttons follow the inline controls' rule, sentence case without articles (look-p11-link-words approved with Mark's note "review all the Buttons for same sentence case rules and
# article usage. Example remaining: Record a batch"; bug-p11-pen-remove-this-step-case answered fix; sketch 014 decision 11): the saved page's Record a batch reads Record batch on P11_Save and
# P11_FirstVersion, republished as canvas version 499 (1793459382-9704); save.html and first-version.html re-taken from the served files the same way (served = generated, cmp checked against
# boards/: save.html 2657d3c6, first-version.html 0ffb9da0). P11_Steps and P11_Structure draw no boxed button and stay as served (497).
import sys, os
SRC, DEST = sys.argv[1], sys.argv[2]
SERVED = {'P11_Steps': 'instructions-steps.html', 'P11_Structure': 'add-remove-move.html', 'P11_Save': 'save.html', 'P11_FirstVersion': 'first-version.html'}
os.makedirs(DEST, exist_ok=True)
for k, out in SERVED.items():
    s = open(os.path.join(SRC, 'project', k + '.dc.html')).read()
    s = s.replace('<script src="./support.js"></script>\n', '', 1).replace('<script src="./support.js"></script>', '', 1)
    assert 'support.js' not in s and '/_blob/' not in s and 'src="data:' not in s
    open(os.path.join(DEST, out), 'w').write(s)
print('ok')
