# Architecture

## Two Interfaces

### Public Guide

Visitor-facing app:

- camera-first look-around mode
- conversational guide
- adaptive tours
- game/adventure layer
- floor-aware navigation
- object, case, room, and exhibit interpretation

### Back Office

Staff/volunteer interface:

- builder mode captures walkthroughs
- records guide knowledge
- stores labels, images, and floor-map locations
- reviews AI-generated records
- approves public explanations
- tracks unanswered visitor questions

## Knowledge Layers

### Guide Knowledge

Local and practical knowledge from current DCIS guides:

- popular exhibits
- reliable stories
- common visitor questions
- good pacing
- kid-friendly angles
- local history
- staff corrections

### Institutional Knowledge

Materials already held by DCIS:

- labels
- accession records
- room/case names
- exhibit notes
- floor plans
- images
- collection metadata

### AI Research

Drafted background from web and reference research:

- species/science context
- historical context
- biographies
- regional natural history
- related external sources

This layer should be marked as draft until reviewed.

### Vision And OCR Observations

Data captured by the app:

- room images
- case/object photos
- recognized labels
- likely object matches
- position estimates
- confidence scores

### Public Interpretation

Approved visitor-facing output:

- short explanations
- deeper notes
- kid-friendly versions
- game clues
- tour stops
- recommended next stops

## Museum Map Model

The building layout should be a structured data file that gets refined over time.

It should describe:

- floors
- rooms
- walls
- exhibit zones
- cases
- objects
- labels
- sightlines
- visitor paths
- hotspots
- confidence levels

Initial data can be vague. Use improves it.

Example:

```json
{
  "floors": [
    {
      "id": "floor-1",
      "name": "First Floor",
      "rooms": [
        {
          "id": "front-room",
          "name": "Front Room",
          "zones": [
            {
              "id": "bird-cases",
              "name": "Bird Cases",
              "description": "Cluster of bird specimens along one wall.",
              "confidence": 0.4
            }
          ]
        }
      ]
    }
  ]
}
```

## Learning Loop

1. Staff uses Builder Mode in the museum.
2. The app records camera views, audio notes, labels, and corrections.
3. The system proposes structured records.
4. Staff reviews and approves useful knowledge.
5. Public guide uses approved knowledge.
6. Visitor questions and behavior reveal gaps.
7. Back office improves the map, records, and guide scripts.

