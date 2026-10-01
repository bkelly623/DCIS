# Public content boundary

`mineral-hall.public.json` is the explicitly curated, public-safe input, not a mirror of the private knowledge base and not institutional publication approval. Review every changed string before publication. No generator reads the KB, recovery backups, chat archives or canonical ledgers.

The schemaVersion 2 local preview retains 21 map markers (19 numbered) and adds an unnumbered island browse destination without coordinates or side assignments. It contains 56 curated records, including 28 photographed cards: two for each of 13 catalog-backed numbered displays and two for the island. Legacy overlapping specimen references were replaced, not appended. This is an editorial selection, not inventory coverage. Scheelite offers inspected normal/UV photographs; camera color is not calibrated and no lamp wavelength or afterglow is implied. Malachite uses a brighter existing contextual view, whose original left edge remains clipped. The map retains its prototype/approval/coverage disclaimer.

Optional card fields are hook, observationPrompt and bounded images with src/alt/label. Image paths are closed-schema, same-app assets; selected derivatives are re-encoded without EXIF/XMP/ICC. Original sources, selection manifests, hashes and editorial before/after records remain outside the app in the private dcisagent workspace. Never copy these manifests or the catalog into public assets. Local preview acceptance does not change catalog approval or authorize deployment.

The private canonical specimen ledger retains independent `location_status`, `label_audit_status` and `locality_status` fields unchanged. Identity confidence must never imply locality confidence. Future public localities need separate editorial review and explicit qualifications; do not auto-upgrade or flatten private statuses. Preserve source evidence in place.

## Reproduce and verify

- `npm run export:public`: validate exact allowlisted fields and generate `src/mineralHallKnowledge.ts` deterministically.
- `npm run check:public`: fail on drift without silently overwriting changes.
- `npm test`: schema/leak rejection, coverage, unchanged geometry, qualification, source boundary, artifact scanner negative tests, plus local-only canonical/recovery checks when available.
- `npm run build`: drift check, tests, TypeScript, Vite, then scan actual emitted files (including assets) for known private/process tokens and internal metadata; reject source maps.
- `uv run --with playwright python scripts/check-public-ui.py`: serve the built artifact on loopback, verify all map selections and keyboard lookup without creating a new visitor flow.

The historical local-only `knowledge-base/recovery-2026-09-15/synchronize-records.py` now exits before any operation. Its old code is retained as recovery history, not a supported bypass. Do not remove its guard or use historical TS backups as app inputs. A clean checkout needs no private KB; its recovery test is explicitly skipped if those local files are absent.

The unused unauthenticated staff renderer and browser-side process metadata were removed, not secured through hidden navigation. No authenticated volunteer backend exists. Public-safe schema validation and token scanning are defense in depth, not proof of museum content accuracy, publication rights, or automatic detection of every possible private fact. Do not publish KB directories or host the repository/Vite development server as a public file service. Only the reviewed build artifact is a deployment candidate. Existing journeys have not been expanded or content-validated by this change.
