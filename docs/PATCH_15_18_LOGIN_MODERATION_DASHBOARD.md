# Patch 15+18 - Login UI + Moderation Dashboard v1

Patch 15+18 connects the existing backend login contract to the frontend shell and adds a first moderation dashboard.

## Added

- Frontend register/login/logout controls.
- Current user display using backend display name + country.
- Memory-only bearer token handling for the prototype page session.
- Composer identity locking while logged in.
- Backend posting path for logged-in users:
  - new threads use `/api/threads`;
  - replies use `/api/threads/{thread_id}/replies`;
  - backend identity supplies author name + country.
- Moderation dashboard page.
- Backend review queue loading from `/api/review-queue`.
- Moderator action UI for:
  - initial human check;
  - temporary hide pending panel;
  - two-moderator restore;
  - two-moderator keep-hidden.
- Backend review-action posting to `/api/posts/{post_id}/review-actions`.
- Local demo fallback when the backend is not running.

## Boundary

Backend login supports accountable posting only: display name + country, no hidden profile.

Human moderators decide visibility. Serious visibility actions require two additional human moderators and receipts. Sydney Protocol remains clarify-only and does not hide, rank, punish, judge truth, or enforce.

## Still not added

- No production auth provider.
- No persistent browser token storage.
- No EU identity verification.
- No automatic moderation.
- No real translation provider.
- No payment or donation processing.
