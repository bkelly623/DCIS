# Public content boundary

`mineral-hall.public.json` is the explicitly curated, public-safe input, not a mirror of the private knowledge base and not institutional publication approval. Review every changed string before publication. No generator reads the KB, recovery backups, chat archives or canonical ledgers.

This initial conservative selection retains 21 map markers (19 numbered), 50 specimen/group label entries and 20 exhibit entries. Identifiers are non-secret stable lookup keys, not evidence IDs. Names and display links are retained from the reconciled app reference; entry/shell descriptions are rewritten without contributor/process details. Six Pennsylvania identifications are explicitly tentative. All localities and label-detail prose are withheld for now rather than copying mixed-confidence locality plus internal audit notes. No blanket `confirmed` or `searchable` certification is exported. The map shows a prototype/approval/coverage disclaimer.

The private canonical specimen ledger retains independent `location_status`, `label_audit_status` and `locality_status` fields unchanged. Identity confidence must never imply locality confidence. Future public localities need separate editorial review and explicit qualifications; do not auto-upgrade or flatten private statuses. Preserve source evidence in place.

## Reproduce and verify

- `npm run export:public`: validate exact allowlisted fields and generate `src/mineralHallKnowledge.ts` deterministically.
- `npm run check:public`: fail on drift without silently overwriting changes.
- `npm test`: schema/leak rejection, coverage, unchanged geometry, qualification, source boundary, artifact scanner negative tests, plus local-only canonical/recovery checks when available.
- `npm run build`: drift check, tests, TypeScript, Vite, then scan actual emitted files (including assets) for known private/process tokens and internal metadata; reject source maps.
- `uv run --with playwright python scripts/check-public-ui.py`: serve the built artifact on loopback, verify all map selections and keyboard lookup without creating a new visitor flow.

The historical local-only `knowledge-base/recovery-2026-09-15/synchronize-records.py` now exits before any operation. Its old code is retained as recovery history, not a supported bypass. Do not remove its guard or use historical TS backups as app inputs. A clean checkout needs no private KB; its recovery test is explicitly skipped if those local files are absent.

The unused unauthenticated staff renderer and browser-side process metadata were removed, not secured through hidden navigation. No authenticated volunteer backend exists. Public-safe schema validation and token scanning are defense in depth, not proof of museum content accuracy, publication rights, or automatic detection of every possible private fact. Do not publish KB directories or host the repository/Vite development server as a public file service. Only the reviewed build artifact is a deployment candidate. Existing journeys have not been expanded or content-validated by this change.
