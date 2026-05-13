# Patch 12+16 Recovery Note

If this patch causes problems, restore the previous `EuropeanPublicSquare_v0.12_full.zip` state.

Likely rollback files:

- `index.html`
- `app.js`
- `styles.css`
- `data/receiptSystem.js`
- `backend/eps_backend.py`

New files that can be removed during rollback:

- `data/evidenceReview.js`
- `docs/PATCH_12_16_EVIDENCE_RECEIPTS_LEDGER.md`
- `PATCH_12_16_MANIFEST.txt`
- `PATCH_12_16_RECOVERY_NOTE.md`
- `tests/test_patch_12_16_evidence_receipts_ledger.py`

The patch is display/prototype focused. It does not add production enforcement, real fact-checking, real translation, payment systems, or EU identity integration.
