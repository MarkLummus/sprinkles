# Phase 5: Split the recipe page - Discussion Log

> Audit trail only. Not consumed by downstream agents.

**Date:** 2026-10-14
**Areas discussed:** Where moved code lands, One place for blocked reset, What the hooks own, Hook tests and no-change proof

## Where moved code lands
| Question | Options | Selected |
|---|---|---|
| Module layout | Two new files / Grow draft.js / One file per concern | Two new files |
| Exported status strings | Follow their user / One ui/ messages module / All into domain | Follow their user |

## One place for blocked reset
| Question | Options | Selected |
|---|---|---|
| Mechanism | edit(op, ...args) wrapper / useReducer | edit() wrapper |
| handleChangePenField also clears page status and announce | Keep exactly / onEdit callback for all | Keep exactly |
| Bare penDraft.rows[row.id] reads | One domain accessor / Move as-is | One domain accessor |

## What the hooks own
| Question | Options | Selected |
|---|---|---|
| Saving | Draft only, shell saves / Hooks own saving | Draft only, shell saves |
| Draft-store effects | Stay in shell / Third hook | Stay in shell |
| Record hook | One useRecordDraft / Two hooks | One useRecordDraft |

## Hook tests and no-change proof
| Question | Options | Selected |
|---|---|---|
| Hook tests | Per-file jsdom / @testing-library/react | Per-file jsdom |
| No-change proof | Suite + WebKit walk / Suite only / + iPad check by Mark | Suite + WebKit walk |

## Claude's Discretion
Op names and signatures; location of focus-attempt counters; plan breakdown.

## Deferred Ideas
None. Three matched todos reviewed and not folded.
