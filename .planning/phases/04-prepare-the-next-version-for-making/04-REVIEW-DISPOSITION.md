# Phase 04 code review disposition

Recorded by the execute-phase orchestrator on 2026-10-11. Source: 04-REVIEW.md (0 critical, 9 warning, 5 info). Every finding starts `open`; nothing has been fixed or skipped yet.

| ID | Severity | Disposition | Reason |
|----|----------|-------------|--------|
| WR-01 | warning | open | Import validator accepts shapes the app never writes (orphan batches, duplicate ids, undeclared mark axes, any date format) |
| WR-02 | warning | open | Deeply nested JSON throws RangeError in validateStoreFile; Shell import/export do not catch it |
| WR-03 | warning | open | Import overwrites by id with no confirmation; an open page can revert imported records on Save |
| WR-04 | warning | open | draftMatchesVersion checks shape, not values; a restored draft can save a batch the import validator rejects |
| WR-05 | warning | open | RecipePage loads have no .catch; a failed listBatchesForVersion silently stops draft restore and persistence |
| WR-06 | warning | open | Print button can call window.print() before sheet.pages is laid out |
| WR-07 | warning | open | SheetCodeSearch: submit before load, no failure path, repeated message not re-announced, malformed code reads as missing |
| WR-08 | warning | open | openStore has no blocked/blocking handlers; a second tab on the old version hangs boot |
| WR-09 | warning | open | Home lead and band name drafts that fail draftMatchesVersion; the link then deletes the draft quietly |
| IN-01 | info | open | MarkOneField off-state reason not tied to the disabled radiogroup |
| IN-02 | info | open | Blank Sheet title leaves an unnamed link on the print route and a leading separator in the feet |
| IN-03 | info | open | Restore overwrites a kept draft if a pen opens during the read |
| IN-04 | info | open | Seed-only putAll* methods lack importAll's abort handling |
| IN-05 | info | open | exportStore reads the three stores in separate transactions |
