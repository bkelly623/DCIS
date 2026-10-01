# Validation Workflows

This project should not depend on mock AI or fake vision as proof. Interface prototypes are useful for shaping the product, but technical confidence has to come from real validation against DCIS media.

## Principle

Validate risky capabilities in narrow slices using actual museum images, video frames, labels, and guide-style content.

The first successful version does not need to recognize every specimen. It does need to reliably handle useful guide-level context: rooms, cases, zones, labels, highlight objects, and nearby next stops.

## Source-Of-Truth Order For Mapping

Every DCIS map artifact must follow this hierarchy before it is shown to Brendan or used in the app:

1. Start from the current clean-copy blueprint for that floor. For first-floor work, the active source is `knowledge-base/blueprints/dcis-first-floor-clean-copy-v1.md`.
2. Preserve explicit room-shape facts from the blueprint. For Mineral Hall, the room is a broad L-shaped public area; do not redraw it as a rectangle.
3. Attach ordered photos to the clean-copy scaffold before drawing a new map.
4. Separate evidence from placement. A photo can prove that a case/object exists without proving where it belongs geographically.
5. Mark unplaced evidence as pending instead of converting it into a map anchor.
6. Only show confirmed public-route/display anchors on the consumer-facing map. Keep staff/private areas and uncertain geometry out of that layer.

Failure condition: a map that contradicts the clean-copy blueprint, simplifies an L-shaped room into a rectangle, or maps visible background cases as confirmed placement without Brendan's explicit placement must be superseded immediately.

## Workflows To Prove

### 1. Image To Zone

Input:

- visitor photo
- recovered video frame
- staff-captured Builder Mode image

Output:

- likely floor
- room
- exhibit zone or case
- confidence
- nearby candidate stops

Pass condition:

- the system can identify a useful zone often enough to start a guide response or ask a clarifying question.

### 2. Label OCR

Input:

- label close-up
- angled label
- label behind glass
- crop from a wider case image

Output:

- extracted text
- confidence
- linked zone/object candidate

Pass condition:

- the system extracts enough text to ground or disambiguate the guide response.

### 3. Exhibit Grounding

Input:

- likely map location
- camera observation
- OCR text
- approved exhibit records

Output:

- grounded context packet for the guide
- uncertainty flags
- source references

Pass condition:

- the guide knows whether it is talking about a room, case, object, label, or general nearby theme.

### 4. Guide Response

Input:

- grounded context packet
- visitor profile
- selected guide style
- visitor question

Output:

- short entertaining answer
- optional deeper answer
- suggested next stop
- challenge or observation prompt

Pass condition:

- the answer feels like a tour guide, not a database row, while staying tied to approved or clearly marked evidence.

### 5. Builder Capture

Input:

- staff walkthrough audio
- photos/video
- manual corrections
- rough map position

Output:

- draft zone/object records
- labels
- guide notes
- suggested public interpretation
- unanswered questions

Pass condition:

- one staff walkthrough creates reviewable material that would otherwise have required manual data entry.

### 6. Review And Publish

Input:

- AI-created draft records
- OCR observations
- guide responses
- staff corrections

Output:

- approved public guide content
- rejected/private material
- confidence and source metadata

Pass condition:

- staff can quickly decide what becomes public and what remains internal.

### 7. Blueprint Refinement

Input:

- rough floor plan
- corrected image-to-zone observations
- staff-placed objects/zones
- visitor movement patterns

Output:

- improved map model
- stronger zone confidence
- useful nearby-stop suggestions

Pass condition:

- the map becomes more useful over time without needing a perfect architectural model on day one.

### 8. Latency And Museum Conditions

Input:

- real phone photos
- inconsistent lighting
- glare
- crowded cases
- weak signal or noisy rooms

Output:

- response timing
- failure categories
- fallback behavior

Pass condition:

- the app remains usable while someone is standing in front of an exhibit.

### 9. Engagement Loop

Input:

- guide prompts
- quests
- suggested next stops
- visitor questions

Output:

- session length
- number of stops visited
- questions asked
- challenge completion
- repeat-use signals

Pass condition:

- visitors keep looking, moving, and asking.

## First Validation Set

Use recovered media from the prior Athena workspace:

- mineral room videos and extracted frames
- mineral tray image
- eagle/globe image
- historic map image
- hands-on exhibit image
- bird/Cassin display material

## Immediate Build Decision

Build the interface and validation harness together:

- the interface shows the intended visitor/staff workflows
- the validation harness runs real OCR/vision/guide tests on known DCIS assets
- results are stored with confidence, source, and failure notes

This keeps the project honest while still letting the product shape evolve quickly.

## Current Harness

The first validator lives at `app/scripts/validate-image.mjs`.

It requires `OPENAI_API_KEY` and exits without producing a result when credentials are missing:

```bash
cd app
OPENAI_API_KEY=... npm run validate:image -- public/assets/mineral-tray.jpg "Mineral Room Trays"
```

Results are written to `app/validation-results/`.

## Mineral Hall local-preview acceptance (no publication)

From `app`, run `npm run export:public`, `npm run build`, then `DCIS_UI_EVIDENCE=<private-evidence-directory> uv run --with playwright python scripts/check-public-ui.py`. The browser harness serves only `dist` on an ephemeral loopback port and shuts it down afterward; no public server, tunnel or deployment is required.

The browser contract covers 390px and 1440px: whole-first-floor landing, public orientation and keyboard/44px controls, every mapped destination, exact record IDs/names and display joins, every selected photograph decoded, normal/UV switching, every Look closer prompt, unnumbered island, whole-floor return, discovery detour/reward/reload persistence, and existing tour entry. It checks card-internal and page horizontal overflow, console/runtime/network errors, and desktop map/detail alignment. Current local selection has 28 photo cards and 29 sanitized image assets, not a collection census.

Inspect the actual saved first-floor, detail, island, Scheelite and Malachite screenshots. Passing assertions do not establish interpretive quality or institutional approval. Source photographs, private selection manifest and editorial provenance remain outside the app. Build checks retain closed-schema/privacy rejection, immutable map geometry, exact selections, generated-export drift and emitted-bundle scanning. This preview does not implement live vision, AI conversation, volunteer authentication or approval workflows.
