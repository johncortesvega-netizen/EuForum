# Patch 10 — Human Review Pipeline

Patch 10 adds a review pipeline model to European Public Square.

The purpose is not automated moderation. The purpose is to make room for accountable human review inside a receipt-first forum.

## Locked boundary

> Sydney Protocol clarifies only. Reports trigger review. Human moderators decide visibility. Serious visibility actions require two-moderator review.

## Flow

1. A post is created and remains visible by default.
2. Sydney Protocol may attach clarification prompts.
3. Users may report a post for human review.
4. Reports do not decide anything and do not hide the post automatically.
5. A human moderator may perform an initial check.
6. A post may be temporarily hidden pending review when a hard-boundary or severe context risk is suspected.
7. Two additional human moderators review serious visibility actions.
8. The post may be restored, restored with context, kept hidden, or escalated.
9. Every serious step creates a visible receipt.

## Public accountability

Moderator review receipts show:

- moderator name;
- moderator country;
- role/action;
- reason category;
- appeal/review status.

They do not show:

- address;
- exact location;
- private contact;
- identity documents;
- unnecessary personal dossiers.

## What this is not

This is not an AI moderation engine.  
This is not a truth engine.  
This is not automatic censorship.  
This is not hidden platform power.  
This is not political verdict-making.

## Local prototype behavior

The raw-shell UI now supports a local demo review flow:

- report a post;
- view a human-review status strip;
- open a local review flow;
- simulate initial moderator check;
- simulate temporary hiding;
- simulate two-moderator restore/keep-hidden decisions;
- see human-review receipts in the post and ledger.

The backend also includes prototype endpoints for reports, review queue, and review actions.
