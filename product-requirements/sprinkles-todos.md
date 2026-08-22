# Sprinkles Design Todos

## Done ✅

### Brand Identity
- [x] App name: Sprinkles
- [x] Icon system (cone + scoop base)
- [x] Animated states (idle, ready, active/sprinkling)
- [x] Color palette: Slate/blue

### Onboarding
- [x] Ice cream type preferences (gelato, ice cream, sorbet, etc.)
- [x] Experience level (beginner → advanced)
- [x] Equipment: freezing (home freezer → batch freezer)
- [x] Equipment: pasteurization (none, stovetop, immersion, commercial)
- [x] Pantry: sugars (single vs multiple, which ones)
- [x] Pantry: stabilizers (none vs yes, which ones)
- [x] Pantry: emulsifiers (none vs yes, which ones)
- [x] Taste preferences: egg preference
- [x] Taste preferences: sweetness level
- [x] Onboarding completion → redirect to empty state / home

### Recipe Page
- [x] Header/nav (aligned with home page)
- [x] Recipe header card (name, type, sliders with ranges)
- [x] Ingredients table (categories, toggleable details)
- [x] Process steps section (numbered, time/temp badges)
- [x] Notes section
- [x] Side panel: Balance, Composition, Freezing Curve
- [x] Freezing curve states (on-target vs off-target)
- [x] AI Chat panel with FAB
- [x] New recipe from template state
- [x] Edit interactions (inline editing for ingredient rows)
- [x] Ice cream type selection (settings slideout with all types)
- [x] Scale slideout (by yield or by ingredient)
- [x] Optimize slideout (balance to range, smart constraints)
- [x] Validation errors (human-readable warnings/errors)
- [x] Print view
- [x] Tablet responsive (portrait/landscape, bottom sheets)
- [x] Drag and drop for ingredients (manual reordering + sort options)
- [x] Save dropdown (Save, Save as Template, Export to File)

### Home Page
- [x] Header/nav
- [x] Recipes list (cards/list view)
- [x] Quick actions
- [x] AI suggestions section
- [x] Feedback prompt
- [x] AI Chat slideout with FAB
- [x] Search bar
- [x] Empty state (no recipes yet)
- [x] Limit to recent 10 recipes + "View all" link
- [x] Recipe card hover actions (edit, duplicate, delete, print)
- [x] Delete confirmation modal
- [x] "New Recipe" button flow (connects to template selection)
- [x] Tablet responsive (portrait/landscape)
- [x] Feedback prompt variants (dismissed, completed, multiple pending)

### Recipes Page (Full Library)
- [x] Full recipes list with pagination
- [x] Filtering: Type, Rating
- [x] Sorting: Date, Name, Rating, Type
- [x] Grid/List view toggle
- [x] Search
- [x] Recipe card hover actions (duplicate, print, delete)
- [x] Bulk selection and actions (export, delete)
- [x] Delete confirmation modal

### Template Management
- [x] Template selection modal (search, filter by type, favorites)
- [x] Start from scratch option
- [x] Template library page (view/browse outside of new recipe flow)
- [x] Create template from recipe (Save as Template)
- [x] Edit/delete templates (in library page)
- [x] User vs system templates
- [x] Base recipe templates (16 total: Simple/Advanced for each type)

### Ingredients Page
- [x] Ingredients table (Name, Category, Water%, Sugar%, Fat%, MSNF%, Solids%, PAC, POD, Stabilizer%, Emulsifier%, kcal)
- [x] Search
- [x] Filter by category
- [x] Add new ingredient (modal with USDA/AI lookup)
- [x] Edit ingredient (inline editing)
- [x] Duplicate ingredient
- [x] Delete ingredient
- [x] AI-assisted nutritional data lookup (pain point solver)
- [x] Conditional column visibility (Stabilizer/Emulsifier based on user prefs)

### Flows
- [x] Import from web flow

---

## Todo 🔲

### Other Pages
- [ ] Tools page
- [ ] Help page
- [ ] Sign in / account UI

### Flows
- [ ] Import from file flow

### Batch Feedback & Learning
- [ ] **Structured batch feedback schema** (time-sensitive — batches logged under a thin schema can't be reconstructed later)
  - Captured on ALL batches, not just failures. Failure-only collection has no baseline, so any pattern found is uninterpretable.
  - Per-batch fields: what was off (texture / sweetness / flavor / hardness), direction (too much / too little), optional note
  - Freezer temp: asked once, at the moment a batch disappoints (motivated + likely measured, vs. guessed at onboarding), then stored on profile
  - Per-user constants (equipment, machine, typical aging) live on the profile from onboarding — joined at analysis time, never re-asked per batch
  - Design constraint: must survive a tired user at 11pm. Three taps, not a ten-field form.
- [ ] Update `icecream-feedback-variants.jsx` to capture structured fields beneath the star rating + free text
- [ ] Diagnostic for "validated clean but failed" batches — the Balance Card already said green, so re-explaining PAC/POD is useless here. Needs to distinguish model gap from execution variance.
- [ ] LLM proxy (keeps API key off the client; ~100 lines, no DB/accounts/backend required)

### Deferred Decisions
- [ ] **Cross-user aggregation** — DEFERRED, not rejected. Requires central storage, identity, consent, privacy policy, retention, uptime obligations. Needs hundreds of users logging consistently before signal separates freezer effects from formulation effects. Revisit at that user count, not before.
  - Storage stays local-first + Drive sync (preserves reusable OAuth/Drive layer; user keeps their data if Sprinkles disappears)
  - Batch fields captured locally now in a shape that *could* sync later

### AI-Powered Features (v2+)
- [ ] Flavor optimization via AI — ingredient library includes text hints (usage notes, intensity descriptors, typical ranges) that AI can use as context
- [ ] Combine with user preferences from onboarding + collected notes/feedback to drive personalized optimization
- [ ] AI learns from user's batch notes ("too subtle", "perfect", "too strong")

---

## Files Reference

| File | Description |
|------|-------------|
| icecream-hybrid-concept.jsx | Recipe page (main, slate/blue) |
| icecream-home-page.jsx | Home/landing page |
| icecream-home-empty-state.jsx | Home page empty state (no recipes) |
| icecream-onboarding-flow.jsx | 5-step onboarding with conditional questions |
| icecream-template-selection.jsx | Template picker modal with favorites, search, filters |
| icecream-template-library.jsx | Template library page with 16 system templates |
| icecream-recipes-library.jsx | Full recipes list with filtering, sorting, bulk actions |
| icecream-ingredients-library.jsx | Ingredients library with AI-assisted lookup |
| icecream-delete-modal.jsx | Delete confirmation modal (single + bulk) |
| icecream-feedback-variants.jsx | Feedback prompt states (pending, completed, multiple) |
| icecream-save-as-template.jsx | Save dropdown with Save as Template modal |
| icecream-import-from-web.jsx | Import from web slideout flow |
| icecream-new-recipe-template.jsx | New recipe from template state |
| icecream-freezing-curve-states.jsx | Freezing curve on/off target comparison |
| icecream-ingredient-edit-states.jsx | Inline editing interaction states |
| icecream-ingredient-drag-drop.jsx | Drag/drop reordering + sort options |
| icecream-recipe-settings-slideout.jsx | Type/yield/serving settings panel |
| icecream-scale-slideout.jsx | Scale by yield or ingredient |
| icecream-optimize-slideout.jsx | Balance optimization with smart constraints |
| icecream-validation-with-optimize.jsx | Balance card with two-line rows + Optimize |
| icecream-print-view.jsx | Print layout with optional batch log |
| icecream-tablet-responsive.jsx | Tablet portrait/landscape + bottom sheets |
| icecream-icon-animated.jsx | Animated sprinkles demo |
| icecream-icon-refined.jsx | Icon scale tests |
| icecream-cone-send.jsx | Send icon exploration |
| icecream-mint-palette.jsx | Mint palette variant (not using) |
| icecream-teal-palette.jsx | Teal palette variant (not using) |
| ingredients-page-spec.md | Ingredients page design specification |

---

## Notes

- "Don't Make Me Think" principle: minimize upfront decisions
- New recipes start from working template, not blank canvas
- Default to Gelato type (or user preference from onboarding)
- **Slideout pattern**: Use slideouts (right side) for all editing panels (settings, scale, optimize, AI chat). Reserve modals only for confirmations and critical warnings.
- **PAC:POD ratio**: Dropped as a separate metric. No strong evidence for target ratio. Optimize PAC and POD independently.
- **Optimize constraints**: Keep yield fixed and minimize changes by default. Only surface constraint options when optimization fails.
- **Validation messages**: Human-readable ("Will likely not freeze properly" not "PAC above target"). Two-line rows: metric + issue title always visible, click to expand suggestion.
- **Optimize button**: Lives in Balance Card footer, always visible. When issues: fix them. When balanced: subjective taste adjustments (less sweet, more creamy, etc.).
- **LLM ≠ server**: LLM access needs a key kept off the client — that's a proxy, not a backend. Cross-user learning is the only thing that actually requires a server; it's deferred.
- **Balance Card is a verdict during Formulate, a liability during Evaluate**: continuous feedback means every batch reaching production has already been told it's balanced. So a disappointing batch is by construction one that *passed* — the user is asking "your model said green and my ice cream is icy." A green batch that fails costs more trust than a red one, because the app made a claim.
