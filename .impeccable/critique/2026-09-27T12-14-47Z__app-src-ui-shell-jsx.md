---
target: mobile web practices and navigation
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/Shell.jsx"
target_fingerprint: "sha256:fd53c2bd258b4db9839343c2ecaa44fa150adf67b7a9139787e955fd5253f9af"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/Shell.jsx
timestamp: 2026-09-27T12-14-47Z
slug: app-src-ui-shell-jsx
---
Method: dual-agent (A: /root/design_review; B: /root/technical_review). Source-only assessment; live browser unavailable.

Keep the responsive sidebar/bottom-navigation structure. Sprinkles already switches at 984px based on content fit. Bottom navigation suits frequent peer destinations; top bars should carry page context, back navigation and actions. Preserve Sprinkles styling rather than copying iOS chrome. Desktop sidebar suits the five durable workspaces and secondary tools.

Design specificity: strong, with a paper recipe sheet and explicit plan/actual distinction. The phone's approved role is transcription, not full formulation.

Strengths: labeled semantic links and active states; content-based breakpoint; coarse-pointer 44px targets and 16px fields; explicit units, linked errors and save status; stable version and batch URLs.

Priority issues:
1. P1: Draft recovery. RecipePage.jsx:849–865 stores unsaved input in React state, relies on beforeunload, and explicitly defers draft persistence. Shell links navigate without a router blocker. Persist recoverable local drafts without silently committing a version or batch; restore them on return.
2. P1: Premature navigation destinations. router.jsx:121–126 maps Notebook, Recipe book, Idea log, Ingredients, Kitchen and Search to placeholders. Three direct bottom destinations are unfinished. Stage availability until useful; eventual architecture is sound. Reassess whether Home remains distinct from Notebook once both work.
3. P1 validation item: Signed temperature input. BatchRow.jsx:82–90 uses decimal inputmode for temperatures; device keyboards may omit minus. Verify negative temperatures on iPhone and supply a dependable sign-entry path.
4. P2: Safe-area and keyboard readiness. shell.css fixed 56px bar and matching content padding contain no safe-area inset policy. No collision confirmed. Validate keyboard, collapsed Safari toolbar and landscape; coordinate bar and content inset if adopting edge-to-edge mode.
5. P2: Navigation orientation. More has no parent active indication for its destinations; no global title/focus/scroll restoration policy found. Restore list position and orient focus to new content. Make dismissal predictable.

Additional task-flow recommendation: prioritize opening the relevant batch, entering measurements/notes, and saving with minimal scrolling. Evaluate a contextual recording action area with the keyboard visible before adding another fixed bar. Offline reload/install support is a later product choice; local storage alone does not establish it.

Heuristic scores (provisional source-based, 0–4):
| Heuristic | Score | Basis |
|---|---:|---|
| System status | 3 | Save feedback; draft durability unclear |
| Real-world match | 4 | Recipe/version/batch language |
| User control | 2 | Unguarded unsaved departures |
| Consistency | 3 | Shared shell; More active gap |
| Error prevention | 2 | Draft loss and signed-input risk |
| Recognition | 3 | Labels and units |
| Efficiency | 2 | Dead destinations |
| Minimalism | 3 | Strong sheet, premature navigation |
| Error recovery | 3 | Inline errors preserve text |
| Help | 2 | Domain guidance, limited task help |
| Total | 27/40 | Significant mobile workflow gaps |

Scenarios: distracted transcriber switches to a photo and returns; maker enters -6 degrees Celsius and saves one-handed; first-time visitor taps Notebook; VoiceOver user opens a destination through More. Emotional risk centers on losing carefully transcribed work and encountering dead ends; saved-record fidelity supports confidence after completion.

Follow-up choices: prioritize recording reliability or navigation availability; validate Safari in-browser only or Safari plus home-screen use.
