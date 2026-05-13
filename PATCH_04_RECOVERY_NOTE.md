# Patch 04 Recovery Note

If Patch 04 causes issues, restore the Patch 03 / v0.4 files:

- `index.html`
- `app.js`
- `styles.css`
- `README.md`
- `PATCH_STATUS.md`

And remove:

- `data/protocolRules.js`
- `docs/PATCH_04_CLARIFY_ONLY_PROTOCOL_PROMPTS.md`
- `tests/test_patch_04_protocol_prompts.py`

Patch 04 is display/local-logic only. It does not introduce backend storage, login, moderation enforcement, translation services, payments, or identity integration.
