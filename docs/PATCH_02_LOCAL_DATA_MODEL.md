# Patch 02 — Local Data Model

## Purpose

Move the prototype from a static clickable shell toward a local functional forum model.

Patch 02 keeps the project intentionally small: no backend, no login, no persistence, no identity integration, and no real translation. It proves the next behavior layer: rooms, threads, posts, new local threads, new local replies, counters, latest activity, and session-only posting limits.

## What changed

- Added `data/localData.js` as the local sample data source.
- Updated `index.html` to load local data before `app.js`.
- Reworked `app.js` to create a mutable page-memory state from local data.
- Added local thread creation.
- Added local reply creation.
- Updated counters to derive from current state.
- Updated recent threads after local draft submission.
- Kept all Sydney Protocol prompts as clarify-only receipts.

## Boundary

Patch 02 does not store user data. Local drafts disappear on refresh. This preserves the current concept boundary: the app demonstrates behavior without becoming a data-collecting platform.

## Next candidate patch

Patch 03 — Composer and Posting Limits polish:

- clearer cooldown timer;
- visible post-limit countdown;
- better slow-mode copy;
- draft validation messages;
- optional local reset button;
- stronger anti-addiction UX.
