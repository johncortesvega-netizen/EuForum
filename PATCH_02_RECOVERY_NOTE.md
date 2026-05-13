# Patch 02 Recovery Note

If Patch 02 causes problems, revert these files to v0.2:

- `index.html`
- `app.js`
- `styles.css`
- `README.md`

And remove:

- `data/localData.js`
- `data/forums.json`
- `docs/PATCH_02_LOCAL_DATA_MODEL.md`
- `PATCH_02_MANIFEST.txt`
- `PATCH_02_RECOVERY_NOTE.md`
- `tests/test_patch_02_static_checks.py`

The conceptual behavior to preserve after recovery:

- forum structure;
- no feed;
- no backend/storage/tracking;
- Sydney Protocol clarifies only;
- moderation and evidence review remain separate human roles.
