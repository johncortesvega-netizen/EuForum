# Patch 06 Recovery Note — Accountable Identity Display

If Patch 06 causes issues, revert these changes:

- restore `app.js` from Patch 05 / v0.6;
- restore `styles.css` from Patch 05 / v0.6;
- restore `data/localData.js` and `data/receiptSystem.js` from Patch 05 / v0.6;
- remove `docs/ACCOUNTABLE_IDENTITY_MODEL.md` and `docs/PATCH_06_ACCOUNTABLE_IDENTITY.md`;
- remove `tests/test_patch_06_accountable_identity.py`.

Patch 06 does not add backend storage, login, identity verification, moderation enforcement, payments, real translation, or EU wallet integration.
