# Patch 11 — EU Hard-Boundary Map + Sydney Protocol THRESHOLD Layer

Patch 11 adds a policy separation between EU-aligned hard-boundary categories and the Sydney Protocol THRESHOLD clarification layer.

## Added

- `data/euHardBoundaryMap.js` for local prototype policy mapping.
- UI sidebar card and dialog explaining the two routes.
- Backend policy endpoint: `/api/policy/eu-hard-boundaries`.
- Receipt support for `eu_hard_boundary_map` receipts.
- Documentation: `docs/EU_HARD_BOUNDARY_MAP.md`.
- Regression tests protecting the phrase and boundary: Sydney Protocol THRESHOLD clarification only.

## Boundary

- EU hard-boundary categories can route to accountable human moderation.
- Sydney Protocol THRESHOLD signals clarify only.
- No automatic filtering was added.
- No enforcement by Sydney Protocol was added.
- No truth, guilt, corruption, or legitimacy verdict was added.

## Not added

- No production filtering.
- No frontend/backend connection.
- No automated moderation.
- No real legal compliance engine.
- No identity verification.
- No payment/donation integration.
