# Patch 08 Recovery Note — Minimal Login

If Patch 08 causes issues, revert:

- `backend/eps_backend.py`
- `README.md`
- `PATCH_STATUS.md`
- `docs/PATCH_08_MINIMAL_LOGIN.md`
- `docs/ROADMAP.md`
- `docs/ROADMAP_TO_LIVE.md`
- `tests/test_patch_08_minimal_login.py`

The frontend raw shell is not connected to the backend login in this patch, so reverting backend files restores Patch 07 behavior.

No production identity, EU wallet integration, moderation enforcement, payment, or tracking layer was added.
