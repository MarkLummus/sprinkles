# Evaluation scenarios and pilot protocol

Status: **five post-body-reviewed scenario annotations plus six synthetic behavior tests**. Annotations were prepared from the frozen JSONL on 2026-09-04. They are not independent expert validation, full expected parses, or ground-truth diagnoses. Source links identify posts; review used local captured bodies, not current live pages. The two original gold-set-plan CSVs remain unchanged and selected-only.

Under accepted D02, external-recipe troubleshooting is discovery/evaluation work. Test records may be loaded through an evaluation harness or prepared manually; the cases do not require a dedicated customer-facing retrospective troubleshooting flow. Requirement references identify capabilities being exercised, not approval of those requirements. Offline testing does not require contact with the poster; live pilot selection must separately consider recency, current author participation, and whether the problem remains unresolved.

## Primary working case — olive oil recipe development

Accepted D14 identifies Mark's in-progress olive oil recipe as the first product milestone's working case, separate from the Reddit discovery cases below.

- **Available source material, reported by Mark:** an olive oil recipe printout in an alternate format and batch preparation notes from one completed batch. The olive oil recipe is not available as structured input.
- **Format references:** other structured recipes can establish the existing recipe format; their contents are not substitutes for the olive oil recipe.
- **Supporting assets:** calculation-module code and a review/print prototype; code implementing the prototype may exist but is unconfirmed.
- **Desired outcome:** review the recipe and batch notes, explore adjustments, preserve versions, and prepare the next recipe for making through the review/print experience.
- **Boundary:** no source assets have been inspected or expected calculations annotated here. This is a user-reported working case, not a scored fixture. No photo/file import commitment, implementation approach, or guaranteed sensory improvement follows from it.

## EV01 — Partial first-batch recipe and fat-coating complaint

Source: [post 1vdh6i8](https://www.reddit.com/r/icecreamery/comments/1vdh6i8/). Input boundary: captured title/body only. Requirements: IMP-01, IMP-02, BATCH-01, OBS-01, DIAG-01.

**Reviewed facts:** Four ingredient amounts are stated: milk 1½ cups; granulated sugar 1⅛ cup (misspelled in source); heavy cream 2 cups; vanilla extract 1½ tablespoons. The maker reports an aftertaste and fat coating on the spoon. Machine, method, dairy composition, and serving conditions are unspecified.

**Expected partial import:** Four ingredient entries; preserve volumes and typo-bearing source text while normalizing sugar identity for review. No invented gram weights, yield, or cooking/churning steps. Keep the two observed issues as observations rather than a diagnosis.

**Diagnostic behavior:** Ask about relevant ingredients/process before asserting one cause or prescribing a precise replacement amount. The app may explain plausible categories with uncertainty. Test whether the question's answer could actually alter the advice.

**Critical failures:** Declare missing eggs the cause; assert fat percentage from unspecified milk/cream composition; fabricate method; present community opinion as confirmed science.

**Still needed:** Independent annotation review, complete expected object, reviewed acceptable hypothesis set, and user follow-up. No diagnosis is scored as correct here.

## EV02 — PB&J with base, compote, and cookie dough

Source: [post 1vems2c](https://www.reddit.com/r/icecreamery/comments/1vems2c/). Input boundary: captured title/body. Requirements: IMP-01–IMP-03, REC-02, FORM-01, OBS-01, DIAG-01.

**Reviewed facts:** The recipe adapts two named sources. Five emphasized base ingredients sum to a stated 1,000 g pre-boil target; other ingredients are subsequently added. The method restores that intermediate mixture's weight after simmering. Berry compote and cookie dough are layered in separately. The result is hard directly from the freezer but more acceptable after warming.

**Expected partial annotation:** Distinguish churned base, berry compote, and cookie dough. Preserve 1,000 g as an intermediate target, not total finished recipe mass or yield. Compote quantity is stated but its full composition is not. Preserve separately listed salt additions rather than merging them as accidental duplicates. Method references to portions of the base are not additional ingredients.

**Diagnostic behavior:** Clarify storage/serving conditions and which component is hard; explain calculation limitations. Do not automatically rebalance the whole layered product as if every ingredient were churned together.

**Critical failures:** Count cookie-dough ingredients in the base calculation without scope labeling; use the named source to overwrite the actual adaptation; endorse source flour-treatment instructions as a verified safety procedure.

**Still needed:** Full ingredient/step annotation, conversion assumptions, independent review. Neither a definitive cause nor safety validation is supplied.

## EV03 — Good cereal base, soggy inclusion the next day

Source: [post 1vgexwu](https://www.reddit.com/r/icecreamery/comments/1vgexwu/). Input boundary: captured title/body. Requirements: IMP-02, IMP-03, REC-02, OBS-01, DIAG-01, DIAG-02.

**Reviewed facts:** Maker reports successful cereal-infused base using a named external recipe. Caramelized/baked cereal is initially crisp but loses crispness by the next day. The post mentions differing bake durations and both “while churning” and “after churning” descriptions of addition timing.

**Expected behavior:** Save a partial base reference and inclusion method; do not reconstruct the external base. Attach the undesirable result to the inclusion, preserve the successful base observation, and retain the timing ambiguity for review. The number 350 in the source lacks an explicit temperature unit; do not silently assert one.

**Diagnostic behavior:** Focus follow-up on component handling and storage rather than automatically changing base fat/sugars. A proposed component experiment must explain the expected result and tradeoff without promising it will work.

**Critical failures:** Mark the whole batch/base as failed; fabricate ingredient quantities; silently normalize contradictory timing; prescribe a numerical base adjustment from absent composition.

**Still needed:** Technical review of acceptable experimental advice and follow-up evidence.

## EV04 — Stalled paddle, later recovery with two changes

Source: [post 1vk4ms3](https://www.reddit.com/r/icecreamery/comments/1vk4ms3/). Input boundary: captured title/body, with the leading update separable from the original narrative. Requirements: IMP-01, IMP-03, BATCH-01, DIAG-01, DIAG-02, LEARN-01.

**Reviewed facts:** The original attempt uses an adapted coffee/chocolate recipe and a named freezer-bowl machine. The maker describes a frozen layer and stalled paddle. The leading update reports both diluting remaining flavored base with plain base and starting the machine before adding it; the maker reports improved results.

**Expected behavior:** Preserve original recipe/attempt and later recovery separately. Retain both changes. Do not convert the leading update into steps asserted to have occurred during the original attempt.

**Diagnostic test boundary:** For prospective diagnosis, withhold the update from model input. For history/comparison testing, provide the full body. Record which boundary was used so the answer cannot leak from the outcome into the diagnostic test.

**Critical failures:** Attribute success conclusively to one of the two changes; silently append recovery amounts to the original full recipe; score matching the update as proof of causal correctness.

**Still needed:** Full parse annotation and expert review. The reported recovery can test consistency and history handling, not uniquely identify the cause.

## EV05 — Showcase body without a recipe

Source: [post 1nahsio](https://www.reddit.com/r/icecreamery/comments/1nahsio/). Input boundary: captured title/body only, **not** the separate comment-sourced fixture. Requirements: IMP-03.

**Reviewed facts:** The body describes a pop-up menu, flavor concepts, and customer reactions, not a quantified recipe.

**Expected behavior:** Explain that the supplied body lacks a recipe and request ingredient/method text. It may retain a source bookmark if supported; it must not fabricate recipes from flavor names.

**Critical failure:** Assert that the whole thread or comment fixture contains no recipe based solely on this body. The fixture must be inspected separately before scoring it as a negative import example.

## Synthetic tests — not Reddit findings

These are proposed behavior contracts invented to cover product invariants. They are not factual summaries of source posts.

| ID | Setup | Expected result | Requirements |
|---|---|---|---|
| SYN01 | Import an ingredient with a missing amount, then supply it and later change its composition record | Partial save works; affected calculations are limited; corrections persist; historical data is not silently recalculated | IMP-02, ING-01, FORM-01 |
| SYN02 | Log batch A, edit the recipe and current equipment profile, then log batch B | A retains its recipe/context; B can use new defaults; unknown execution details stay unknown when notes are added after making | REC-01, BATCH-01, BATCH-02 |
| SYN03 | Record a successful dense batch, create a variation, then compare results | Dense is not automatically bad; original remains; differences and desired result are visible | REC-01, OBS-01, LEARN-01 |
| SYN04 | Record a reduction with only input/output weights, then an infusion with unknown absorption | Measured yield is retained; unsupported composition changes remain explicit assumptions/unknowns | ING-02 |
| SYN05 | Request less sweetness with a fixed total mix amount and a locked ingredient | Show proposed changes/tradeoffs; respect constraints or explain infeasibility; require acceptance before applying | FORM-02, DIAG-02 |
| SYN06 | Double a recipe with known ingredient masses but unknown finished volume and machine capacity | Proportional amounts are correct; no invented finished yield or assertion that it fits | SCALE-01 |

Run critical flows with long text, fractions, mixed units, missing data, keyboard navigation, agreed narrow/wide layouts, and recoverable save/service failures (UX-01). These are proposed test dimensions, not completed test results.

## Annotation record for expansion

For each selected fixture, record: case ID; capture version; input boundary; source spans/locations; expected ingredients/components/units/method; explicit/inferred/missing fields; accepted alternatives; forbidden inferences; relevant requirement IDs; annotator/reviewer/date; and annotation status.

For diagnosis add: observations; desired result; known facts; missing/contradictory evidence; acceptable hypotheses and rationale; useful questions; unacceptable certainty; acceptable next checks; and whether follow-up was withheld. Use reviewed domain references to evaluate science, not Reddit votes.

## Manual pilot

1. Choose cases across complete/partial input, components, process issues, and repeat attempts—not only easy recipes.
2. Import and record correction time, edits, omissions, invented facts, and component/unit errors.
3. Review the recipe and actual batch context before preparing a diagnostic draft.
4. Have a knowledgeable reviewer check evidence and proposed advice. Mark reviews any public reply and posts manually if appropriate; observe the community's current rules before posting.
5. Ask whether the next action is understandable and feasible; record whether it was attempted and the outcome if voluntarily provided.
6. Keep reported follow-up distinct from causal proof. Use failures to refine requirements and evaluation cases.

Track coverage, correction burden, critical-error count, appropriate abstention/questions, advice comprehension, attempt rate, and follow-up availability. Establish a baseline before numerical release thresholds. Missing follow-up is missing evidence, not success. This packet contains no executed import benchmark, usability study, or validated diagnosis.
