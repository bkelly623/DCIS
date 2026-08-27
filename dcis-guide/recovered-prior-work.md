# Recovered Prior Work

Inventory from the Google Compute VM / local OpenClaw workspaces, recovered on 2026-08-26.

## Main Location

Prior museum-guide exploration lives in:

`/home/precision_focused_solutions/.openclaw/workspace-athena/`

This appears to be exploratory workspace work rather than a committed application repo. The Athena git repository has no commits, and the museum files are currently untracked there.

## DCIS / Museum Assets

### Media Folder

`/home/precision_focused_solutions/.openclaw/workspace-athena/museum-assets/`

Contains source media for a museum tour-guide prototype:

- `photos/museum-reference-photo-1.jpg`
- `photos/museum-reference-photo-2.jpg`
- `photos/museum-map-label-photo-1.jpg`
- `photos/museum-map-display-photo-1.jpg`
- `photos/museum-eagle-globe-exhibit-photo-1.jpg`
- `photos/museum-eagle-label-photo-1.jpg`
- `videos/hands-on-exhibit-video-1.mp4`
- `videos/hands-on-exhibit-video-2.mp4`
- `videos/willcox-mathues-cassin-bird-displays-video-1.mp4`

Also contains extracted frames:

- `frames/h1/`: 56 JPG frames
- `frames/h2/`: 46 JPG frames

### Mineral Room Folder

`/home/precision_focused_solutions/.openclaw/workspace-athena/museum-mineral-room-videos/`

Contains:

- `mineral-room-video-1.mp4`
- `mineral-room-video-2.mp4`
- `frames/v1/`: 55 JPG frames
- `frames/v2/`: 56 JPG frames
- `VISION-FEASIBILITY.md`

## Key Prior Conclusion

The mineral-room feasibility note says not to bet the first version on recognizing every individual specimen by camera. The reasons:

- dense trays
- many similar dark metallic minerals
- glass glare
- repeated mineral names and localities
- partial crops and motion blur

But it also says the footage is useful for content. Labels are often readable, and the local Delaware County mineral grouping is a strong interpretive theme.

Useful v1 approach from that note:

- case-level or highlight-object recognition before specimen-level recognition
- use labels/OCR where possible
- build 8-15 curated stops before training/testing vision deeply
- use highlight crops rather than trying to classify every rock
- confirm Delaware County vs broader/traveling classics with museum staff

## Mineral-Room Highlight Candidates

From `VISION-FEASIBILITY.md`, visually promising candidates:

- Azurite and malachite, Bisbee, Arizona
- Purple fluorite on white calcite, Rosiclare, Illinois
- Microcline var. amazonite, Mineral Hill
- Gypsum var. selenite "desert rose", Oklahoma
- Quartz var. amethyst, Smedley's / Middletown
- Variscite, Fairfield, Utah
- Chromite in round dish, Chrome Run
- Heulandite pink crystal spray, Nova Scotia

Local Delaware County labels mentioned:

- Mineral Hill
- Leiper's Quarry
- Smedley's
- Ridley
- Middletown
- Leiperville
- Avondale
- Chrome Run / Marple

## Prior Competitive / Technical Research

Cursor agent-tool logs in:

`/home/precision_focused_solutions/.cursor/projects/home-precision-focused-solutions-openclaw-workspace-athena/agent-tools/`

Relevant recovered research:

- `67821263-a264-4c63-84de-6d667f51b4f5.txt`: `Janayan002/obrist`, an art gallery guide architecture using FastAPI, LangGraph, MCP, CLIP embeddings, and an Expo mobile app called Aria.
- `34887b13-88c9-4762-a615-dbccb0aafd73.txt`: `SoumalyaSaha/ArtifactX`, an AI-powered museum artifact scanner using a web app and a "Museum Engine V1.0" concept.
- `7729d6ef-2c11-46bd-83c3-9847c09ae92e.txt`: `museum-semantic-search`, semantic search over museum collections with visual/text embeddings.
- `98d62446-d391-47af-bd33-f9d7d9838a8f.txt`: British Museum audio-guide visitor behavior research.
- `b103639e-fbe3-4ff6-86a5-bcad584e9f12.txt`: audio-guide evolution and museum app strategy notes.
- `f1064d62-31c8-466f-925c-5460f01def7a.txt`: Cleveland Museum of Art Gallery One / ARTLENS case study.
- `2f282014-2f65-464f-8321-c454482102cd.txt`: accessibility research for blind/low-vision visitors using commodity tech in cultural institutions.
- `69b47f14-97b6-41b2-8be0-ff305a290866.txt`: BLE beacon museum multimedia delivery research.

## Useful Design Lessons

- Visitors do not want a tool that demands too much commitment before proving value.
- The guide should ask about time, interests, confidence, and goal, then adapt.
- The app should support wandering, not only fixed tours.
- False confidence matters: some visitors think labels are enough until they become curious or disoriented.
- Physical movement plus audio/visual attention can improve memory and engagement.
- Accessibility should be included early: audio, readable text, multilingual options, and non-camera fallback paths.
- Computer vision should be spatially assisted by a map model and labels, not treated as a magic recognizer.

## Technical Ideas Worth Reusing

From the recovered `obrist` architecture:

- full-screen camera mobile app
- every question can capture the current camera frame
- conversation ID for multi-turn state
- backend endpoint accepting text prompt plus optional image
- local or hosted embedding model for image matching
- proactive prompts after idle time
- TTS and speech input
- glow/active state around the camera to make the guide feel alive

For DCIS, adapt this away from single-artwork recognition and toward:

- room/case/zone recognition
- label OCR
- map-assisted location inference
- guide personality and game mechanics
- Builder Mode for generating the knowledge base from walkthroughs

