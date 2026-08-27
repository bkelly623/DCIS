# DCIS Guide

Working notes for a public-facing Delaware County Institute of Science guide app and its private back-office builder.

## Product Idea

Build a camera-first, conversational museum guide that makes DCIS feel alive, playful, and locally intelligent.

The public app should act less like a catalog and more like a guide walking through the museum with the visitor. It should be able to look around through the camera, understand where the visitor probably is, talk about rooms/exhibits/objects, ask questions before a tour, adapt to visitor interests, and support game-like exploration.

The private side should let staff and volunteers build the guide while using it inside the museum. The system learns from walkthroughs, recorded tours, labels, floor maps, corrections, and exhibit knowledge, then stores that knowledge for review and public release.

## Core Principles

- Start with engagement, not exhaustive cataloging.
- Make the app fun enough that people want to keep looking.
- Use computer vision and location context instead of making QR codes the main interaction.
- Preserve local guide knowledge: what experienced guides say, what visitors ask, which exhibits work, and why objects matter to DCIS.
- Let the app learn through use, but keep a review layer before public release.
- Treat the building layout as a first-class data model.

## First Milestone

Build a private prototype for one limited area of the museum:

- one room, case, or exhibit cluster
- rough floor-map/blueprint data
- 10-20 notable objects or zones
- a camera-first "look around" interaction
- a conversational guide voice
- a builder mode for recording notes and corrections
- a simple back-office review screen

The prototype does not need to solve the whole museum. It needs to prove that the guide can make one area more engaging.

## Prior Work

Recovered notes and media from earlier exploration are summarized in `recovered-prior-work.md`.

## Build Strategy

The recommended implementation path is summarized in `build-strategy.md`.

## Validation

Real AI, OCR, vision, grounding, and engagement workflows to validate are listed in `validation-workflows.md`.

## App Prototype

A first local browser prototype lives in `app/`. It includes public guide, Builder Mode, Review Desk, Museum Map Model, and Validation views.
