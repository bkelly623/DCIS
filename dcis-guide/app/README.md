# DCIS Field Guide App

Mobile-first visitor guide prototype for the Delaware County Institute of Science.

## Run

```bash
npm install
npm run dev -- --port 5173
```

Open:

```text
http://localhost:5173/
```

## Current Surfaces

- Path picker: Cabinet of Wonders, The Hidden Institute, and Specimen Safari.
- Onboarding: expedition name and six field identities.
- Tour player: room cue, visual anchor, discovery prompt, choices, hint, reveal, stamp, next-room cue, and saved local progress.
- Field notebook: live list of discoveries unlocked during the visit.
- Recap: completed expedition title, stats, and collected stamps.
- Content view: seed room coverage and the mapping gaps needed before replacing prototype zones with verified case-level records.

## Important Constraint

This prototype does not claim fake AI recognition or exact physical mapping. It uses existing DCIS media as visual anchors and labels unverified areas as awaiting a photo/case index. The entrance/front hall is treated as app launch/orientation only, not as a content-heavy exhibit zone.

## Real Vision Validation

The validator requires a server-side `OPENAI_API_KEY`. It exits instead of inventing results when credentials are missing.

```bash
OPENAI_API_KEY=... npm run validate:image -- public/assets/mineral-tray.jpg "Mineral Room Trays"
```

Results are written to `validation-results/`.
