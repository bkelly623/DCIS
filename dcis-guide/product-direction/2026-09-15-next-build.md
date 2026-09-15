# Next build: a museum adventure, with a separate volunteer workspace

## Reviewed

Local visitor home and setup screens in a mobile browser; existing map/content implementation; Duolingo public landing page (not its logged-in lesson experience); earlier first-floor V2 map and third-floor working blueprint; original archived user corrections and public/back-office architecture. This is not an exhaustive audit of all upper-floor media.

## Diagnosis

Current UI is a text-heavy brochure: beige cards, generic outline icons, long introductory/setup copy, little specimen imagery, six character choices before the first activity. Visitor copy exposes internal reasoning. Content is a freely accessible screen, not an authenticated volunteer workspace. The prototype has local progress and prewritten choices, not a demonstrated live AI/camera identification service or shared volunteer database.

## Visitor direction

- Distinctive illustrated specimens and a recurring guide character; tactile high-contrast buttons; short copy and generous touch targets.
- QR → immediate invitation → first discovery in under 30 seconds. No mandatory account/team configuration before trying it.
- First polished activity: Case 4 glow challenge. Predict → observe the exhibit's real lighting interaction → answer → collect a discovery → short scientific explanation → next nearby stop.
- Intentional character reactions, progress feedback and optional sound; reduced-motion and mute paths. No blanket motion everywhere.
- Keep the three existing routes, but let visitors start a short sample before choosing a longer expedition. Adults should not feel forced into a preschool interface.
- Experience measures: time to first action, first-discovery completion, voluntary next-stop continuation, and whether the visitor looks up at the actual exhibit. No optimizing screen time for its own sake.

## Public navigation

Floor chooser and always-available entrance, stairs, bathroom and return route. First floor includes both entrance spaces, public stairs/bathroom zone, Mineral Hall and Special Exhibit Room. Staff geometry and room names excluded. Second-floor Lecture Hall and third-floor out-and-back galleries integrated after source-backed review. The third-floor working blueprint is provisional and later corrections outrank it.

Scaffolds saved under knowledge-base/building-navigation. These are destination/access models, not finished floor maps. Existing media and maps should be reused before asking for footage again.

## Volunteer workspace

Separate authenticated route/application with server-side authorization; hiding a tab is insufficient. Public export contains only approved public fields/assets. Roles: viewer, editor, publisher/admin. Volunteers can add/edit objects, upload evidence, set locations/access classification and propose interpretation. Changes have drafts, source links, history and rollback; publisher approval controls public release. App-code upgrades remain a separate controlled software workflow, not unrestricted volunteer code execution.

## Build order

1. Produce and test one delightful end-to-end visitor slice: invitation, Case 4 challenge, discovery reward. This establishes visual and interaction quality before repainting every screen.
2. Add building-level public orientation, starting with the already evidenced entrance/stairs/bathroom connection; reconcile floor 2/3 sources at room/route level before detailed cabinets. Do not sink time into survey-grade geometry.
3. Implement the authenticated volunteer workspace, private storage and controlled public publishing; migrate the current Content screen behind it.
4. Extend the proven visitor experience across all three routes/floors, then add real conversational/camera services against the approved corpus.

Acceptance: appealing on a real phone, minimal onboarding, legible/touchable controls, real-world exhibit interaction, correct public navigation, and staff data absent from public payloads. Production has not been changed in this planning pass.
