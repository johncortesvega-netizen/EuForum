# Patch 11 Recovery Note

If Patch 11 causes problems, revert:

- index.html
- app.js
- backend/eps_backend.py
- data/euHardBoundaryMap.js
- data/reviewPipeline.js
- data/receiptSystem.js
- docs/EU_HARD_BOUNDARY_MAP.md
- docs/PATCH_11_EU_HARD_BOUNDARY_MAP.md
- docs/ROADMAP.md
- docs/ROADMAP_TO_LIVE.md
- README.md
- PATCH_STATUS.md
- tests/test_patch_11_eu_hard_boundary_map.py

Expected preserved behavior:

- Forum shell remains local/static in the frontend.
- Backend remains optional prototype only.
- Sydney Protocol clarifies only.
- Hard-boundary actions remain human-reviewed and receipted.
- No automatic filtering or enforcement is introduced.
