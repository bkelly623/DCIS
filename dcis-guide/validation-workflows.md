# Validation Workflows

This project should not depend on mock AI or fake vision as proof. Interface prototypes are useful for shaping the product, but technical confidence has to come from real validation against DCIS media.

## Principle

Validate risky capabilities in narrow slices using actual museum images, video frames, labels, and guide-style content.

The first successful version does not need to recognize every specimen. It does need to reliably handle useful guide-level context: rooms, cases, zones, labels, highlight objects, and nearby next stops.

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
