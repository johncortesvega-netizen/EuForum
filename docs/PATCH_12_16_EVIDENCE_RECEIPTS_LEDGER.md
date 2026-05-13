# Patch 12+16 — Evidence Reviewer Notes + Receipts Ledger

## Purpose

This patch combines two roadmap items:

- **Patch 12 — Evidence Reviewer Notes**
- **Patch 16 — Receipts Ledger Page / Ledger View**

The purpose is to make human evidence/context review visible and receipt-based without creating a truth-throne.

## Core boundary

> Evidence reviewers add source/context notes. They do not decide truth, guilt, corruption, or legitimacy.

Evidence reviewers may add context such as:

- source missing;
- source added;
- claim needs context;
- disputed;
- unverifiable from current evidence;
- translation nuance.

They do not declare:

- this is true;
- this is false;
- this person is corrupt;
- this user is guilty;
- this claim is legitimate or illegitimate.

## What changed

### Frontend/local prototype

- Added `data/evidenceReview.js`.
- Added evidence note buttons on posts.
- Added evidence reviewer notes to post cards.
- Added evidence-note receipts through `data/receiptSystem.js`.
- Added an evidence review sidebar card.
- Added a filterable receipt ledger.
- Added a full receipts ledger dialog.

### Backend prototype

- Added `evidence_notes` table to the backend schema.
- Added backend endpoints:
  - `POST /api/posts/{post_id}/evidence-notes`
  - `GET /api/posts/{post_id}/evidence-notes`
  - `GET /api/evidence-notes`
- Added evidence-note receipt creation.

## What did not change

- No truth-verdict system was added.
- No automated fact-checking was added.
- No frontend/backend connection was added.
- No real translation API was added.
- No payment/donation system was added.
- No EU identity integration was added.
- No automated moderation was added.

## Concept alignment

The forum now has clearer separation among human roles:

- **Sydney Protocol** clarifies THRESHOLD pressure only.
- **Evidence reviewers** add source/context notes only.
- **Human moderators** decide visibility actions under hard-boundary policy.
- **Users** speak, question, clarify, repair, and appeal.

The receipts ledger is meant to make platform actions reviewable without creating a hidden behavioral profile.
