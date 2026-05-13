# Patch 05 Recovery Note

If Patch 05 causes problems, revert:

- `data/receiptSystem.js`
- receipt-related changes in `app.js`
- receipt ledger/button additions in `index.html`
- receipt card styles in `styles.css`
- `docs/PATCH_05_RECEIPTS_SYSTEM.md`
- Patch 05 entries in `PATCH_STATUS.md`

Expected safe fallback:

- Return to Patch 04 clarify-only protocol prompts without the richer receipt bundle and ledger UI.
