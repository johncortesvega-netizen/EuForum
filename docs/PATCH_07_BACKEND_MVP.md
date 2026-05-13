# Patch 07 — Backend MVP Skeleton

Patch 07 adds the first real backend layer for the European Public Square prototype.

## Purpose

Create a boring, inspectable backend contract for:

- rooms;
- threads;
- posts;
- receipts;
- post identity display: name + country;
- receipt-first reviewability.

## What changed

Added:

- `backend/eps_backend.py`
- `backend/README.md`
- `tests/test_patch_07_backend_mvp.py`
- `PATCH_07_MANIFEST.txt`
- `PATCH_07_RECOVERY_NOTE.md`

## Endpoints

```text
GET  /health
GET  /api/forums
GET  /api/forums/{room_id}/threads
GET  /api/threads/{thread_id}
POST /api/threads
POST /api/threads/{thread_id}/replies
GET  /api/posts/{post_id}/receipts
GET  /api/receipts
```

## Privacy/accountability boundary

The backend stores what is required to preserve conversation structure:

- room;
- thread;
- post text;
- author display name;
- author country;
- language label;
- visibility status;
- receipts.

It does not add:

- no hidden profile;
- ad profile;
- behavioral scoring;
- algorithmic feed ranking;
- personalization model;
- EU identity integration;
- real-name verification.

## Sydney Protocol boundary

Receipts can attach Sydney Protocol clarification prompts, but the backend does not let the protocol enforce moderation.

> Sydney Protocol clarifies only. Human moderation remains a separate future layer.

## Non-goals

- no production auth;
- no persistent user accounts;
- no moderation enforcement;
- no donation/payment layer;
- no real translation provider;
- no EU wallet integration.
