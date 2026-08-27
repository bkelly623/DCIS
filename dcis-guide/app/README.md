# DCIS Guide App Prototype

Local browser prototype for the DCIS public guide and back-office builder.

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

- Visitor Guide: camera-like exhibit view, guide style selection, prompt, challenge, and next stop.
- Builder Mode: staff capture workflow for photo, narration, local draft records, and notes.
- Review Desk: local draft approval/edit/private workflow.
- Map Model: rough room/zone blueprint with confidence values.
- Validation: honest status board for real OCR, image-to-zone, guide grounding, guide response, and Builder capture validation.

## Important Constraint

This prototype does not claim fake AI recognition. It uses real recovered DCIS media as seed content and labels unvalidated AI/vision workflows clearly until real OCR, vision, and LLM adapters are connected.

## Real Vision Validation

The validator requires a server-side `OPENAI_API_KEY`. It exits instead of inventing results when credentials are missing.

```bash
OPENAI_API_KEY=... npm run validate:image -- public/assets/mineral-tray.jpg "Mineral Room Trays"
```

Results are written to `validation-results/`.
