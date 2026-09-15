# Build Strategy

## Recommendation

Build a custom DCIS app using proven open-source building blocks. Do not clone a museum guide app wholesale.

The core product is not a standard audio guide. It is a camera-first, spatially aware, conversational, game-like museum guide with a private Builder Mode. Existing open-source museum/audio-guide projects can help with patterns, but none recovered or found so far matches the full DCIS product shape.

## Why Not Clone A Whole App

Most existing museum guide apps are built around:

- static audio stops
- QR/NFC triggers
- CMS-managed tour content
- collection search
- single-object scanning

DCIS needs:

- room/case/zone-level recognition
- a building map model
- visitor discovery and adaptive tours
- live conversation
- game/adventure mechanics
- private data-building workflows
- review/publish controls
- label/OCR and guide-knowledge capture

That is closer to a custom product than a reskinned guide.

## What To Use

### Frontend

Start with a web/PWA prototype, then move to React Native/Expo if device capabilities demand it.

Use:

- React + TypeScript for the first browser prototype
- Vite for fast local development
- IndexedDB/local JSON first for prototype persistence
- later, a real backend database

Reason: fastest path to a clickable prototype. Also avoids app-store friction while product shape is still changing.

### Mobile Path

If the prototype proves the interaction, use React Native/Expo for the real mobile app.

Use:

- Expo
- `react-native-vision-camera` or Expo camera depending on required vision depth
- speech-to-text
- text-to-speech
- haptics
- local cache/offline support

Reason: the guide needs camera, audio, and potentially on-device interaction. Expo is fast, but deeper real-time frame processing may require VisionCamera.

### Backend

Start simple:

- API routes for guide chat and record creation
- structured JSON/schema files
- local database when needed

Then evolve toward:

- Postgres/Supabase or similar database
- object storage for photos/video/audio
- vector database or embedding table for visual/text search
- background jobs for OCR, transcription, and enrichment

### AI / Vision

Use layers instead of one magic recognizer:

- map-assisted location inference
- camera image understanding
- label OCR
- embedding similarity for known highlight images
- staff corrections
- guide knowledge retrieval

Do not build a fake AI demo as the main proof. The first app shell can use fixed museum scenes while the interface is being shaped, but the AI/vision path needs to be validated with real calls against recovered DCIS media from the start.

Validate the real workflow in small slices:

1. label OCR
2. image upload/capture
3. zone/case recognition
4. highlight-object matching
5. later, more fine-grained object recognition

## Open-Source References

Useful references found:

- SmartCompanion Audioguide App: open-source PWA for museums and tourism.
- ACMI static museum audio guide: lightweight Jekyll audio-tour approach.
- AppMuseus: Laravel/Filament/Tailwind multilingual audioguide with accessibility and stats.
- Museum Semantic Search: museum collection search with text/image embeddings.
- Obrist / Aria concept recovered from Cursor logs: FastAPI + LangGraph + CLIP + Expo camera app.
- ArtifactX recovered from Cursor logs: museum artifact scanner concept.
- React Native VisionCamera: high-performance camera library with frame processors.

Use these as references and sources of implementation patterns, not as the main codebase.

## First Concrete Build

Build `dcis-guide/app` as a local prototype with:

- visitor guide screen
- builder mode screen
- review queue
- museum map model view
- seed data from recovered DCIS assets
- real validation hooks for OCR, image understanding, and guide responses
- local in-browser state

This creates the product skeleton while proving the risky AI pieces separately with real museum content.

## Build Order

1. Prototype shell with real recovered assets.
2. Seed data model: floors, rooms, zones, exhibits, highlights, labels, guide notes, public status.
3. Visitor guide loop: discovery questions, look-around result, guide answer, next stop, challenge.
4. Builder Mode: capture note, attach image/zone, create draft record.
5. Review Desk: approve/edit/reject drafts.
6. Local persistence.
7. Real OCR and image upload.
8. Real AI guide response using approved content.
9. Real vision/embedding matching for zones/highlights.
10. Public/private mode separation, including separate internal and consumer-facing map layers.

## Validation Workflows

The app needs these workflows validated before we treat the product direction as technically solid:

- Image-to-zone recognition: given a visitor photo or video frame, identify the likely room, case, or exhibit zone.
- Label OCR: extract usable label text from real museum photos with glare, angles, reflections, and partial crops.
- Exhibit grounding: combine map position, recognized zone, OCR text, and approved records into a useful answer.
- Guide response quality: produce short, entertaining explanations from approved DCIS knowledge without sounding generic.
- Ask-the-guide retrieval: answer visitor questions from the right local context, and admit uncertainty when the evidence is weak.
- Builder capture: turn staff walkthrough audio, photos, corrections, and labels into draft structured records.
- Review/publish: make it easy for staff to approve, edit, reject, or mark content as private.
- Blueprint refinement: let the map start rough and improve through corrected observations.
- Map-layer validation: verify that staff/service areas appear in the internal map but are hidden or abstracted in the consumer-facing visitor map.
- Latency: keep camera/OCR/guide responses fast enough for someone walking through the museum.
- Engagement loop: prove that prompts, quests, and suggested next stops make visitors continue exploring.

## Product Rule

Every technical decision should serve this product rule:

Make the visitor want to keep looking.
