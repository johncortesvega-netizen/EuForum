# Patch 24 Recovery Note

Patch 24 changes the UX starting point and backend posting rules.

To revert the patch manually:

1. In `app.js`, restore initial rendering from `renderMediaFeedTab()` back to `renderForums()`.
2. Remove the media-feed compact composer helpers:
   - `forumRoomOptions`
   - `renderMediaFeedComposer`
   - `updateMediaPostStatus`
   - `previewMediaPostReceipt`
   - `submitMediaPostDraft`
   - `wireMediaFeedComposer`
3. Restore the old `renderMediaFeedTab()` body if needed.
4. In `backend/eps_backend.py`, remove the `post_events` table, posting-limit constants, posting-limit helpers, and the logged-in-only checks in `/api/threads` and `/api/threads/{thread_id}/replies`.
5. Remove `docs/PATCH_24_MEDIA_FEED_POSTING.md`, `tests/test_patch_24_media_feed_posting.py`, `PATCH_24_MANIFEST.txt`, and this recovery note.

Privacy boundary to preserve even after revert: Sydney Protocol / clarity receipts should remain on-demand and not stored as user records.
