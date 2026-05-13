# Patch 10 Recovery Note — Human Review Pipeline

If Patch 10 causes issues, revert these files:

- index.html
- app.js
- styles.css
- data/reviewPipeline.js
- data/receiptSystem.js
- backend/eps_backend.py
- docs/PATCH_10_HUMAN_REVIEW_PIPELINE.md
- docs/ROADMAP.md
- PATCH_STATUS.md
- tests/test_patch_10_human_review_pipeline.py

Recovery target: Patch 09 / v0.10 public launch concept pack.

No persistent production data is introduced by this patch. The raw-shell review flow is local demo state only. Backend schema additions are prototype-only and can be rebuilt from SQLite during local development.
