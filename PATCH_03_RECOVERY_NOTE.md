# PATCH 03 Recovery Note — Composer + Posting Limits

If Patch 03 causes problems, revert these files to Patch 02 versions:

- `app.js`
- `styles.css`
- `README.md`
- `PATCH_STATUS.md`

Then remove:

- `docs/PATCH_03_COMPOSER_POSTING_LIMITS.md`
- `tests/test_patch_03_composer_posting_limits.py`
- `PATCH_03_MANIFEST.txt`
- `PATCH_03_RECOVERY_NOTE.md`

Patch 03 does not add a backend, persistent storage, login, external network calls, or identity integration. It only changes local browser-memory composer behavior and documentation.
