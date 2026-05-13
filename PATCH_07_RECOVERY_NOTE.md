# Patch 07 Recovery Note — Backend MVP Skeleton

If Patch 07 causes issues, remove:

- `backend/`
- `docs/PATCH_07_BACKEND_MVP.md`
- `tests/test_patch_07_backend_mvp.py`
- `PATCH_07_MANIFEST.txt`
- `PATCH_07_RECOVERY_NOTE.md`

Then restore `README.md`, `PATCH_STATUS.md`, `docs/ROADMAP.md`, and `docs/ROADMAP_TO_LIVE.md` from Patch 06.

Patch 07 does not modify the static frontend behavior. The raw-shell UI should still run from `index.html`.
