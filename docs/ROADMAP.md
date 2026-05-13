# Roadmap

## v0.1

Static forum home shell.

## v0.2

Clickable raw-shell forum draft:

- rooms;
- thread lists;
- thread view;
- original/translated post display;
- receipt preview;
- posting-limit model.

## v0.3 candidate

- local-only mock account state;
- room rules panel;
- moderation receipt mockups;
- evidence-review note mockups;
- better mobile thread view;
- language preference selector.

## Later product questions

- Backend architecture;
- privacy-preserving login;
- identity-ready but not identity-dependent design;
- actual translation provider;
- real moderation workflow;
- appeal workflow;
- legal review for EU contexts.


## Patch 07 — Backend MVP Skeleton

Added an optional FastAPI + SQLite backend contract for rooms, threads, posts, and receipts. This is the first step toward a functional prototype, but it does not yet add login, identity verification, real translation, moderation enforcement, or donation/payment flows.

Next likely patch: connect the frontend to the backend API or add minimal login, depending on test results.


## Patch 08 note

Minimal login backend contract is now present. It supports accountable posting through display name + country while preserving the no-hidden-profile boundary. Frontend/backend connection remains a future patch.


## Patch 09 — Public Launch Concept Pack

Status: complete.

Purpose: make the project explainable as a free public-interest forum before adding more power features.

Next likely patches:

1. Patch 10 — Human Review Pipeline: reports → human moderator → temporary visibility action → two-moderator review → receipt.
2. Patch 11 — EU Hard-Boundary Map + Sydney Protocol THRESHOLD Layer: direct-harm floor separated from clarification-only THRESHOLD signals. [complete]
3. Patch 12 — Evidence Reviewer Notes: source/context notes, no truth-throne.
4. Patch 13 — Donation Transparency Page: mock monthly costs and public spending receipts.
5. Patch 14 — Translation Layer: original language preserved, translation as bridge.
6. Patch 15 — Frontend/Backend Connection: connect raw-shell frontend to backend endpoints.


## Patch 11 note

Patch 11 separates the EU hard-boundary floor from the Sydney Protocol THRESHOLD layer. Direct-harm/illegal-content categories can route to accountable human moderation. Sydney Protocol THRESHOLD signals clarify only and cannot trigger visibility actions by themselves.


## Current roadmap update after Patch 12+16

Completed: Patch 12+16 — Evidence Reviewer Notes + Receipts Ledger.

Next recommended sequence:

1. Patch 13+14 — Translation Layer v1 + Frontend/Backend Connection.
2. Patch 15+18 — Login UI + Moderation Dashboard v1.
3. Patch 17+19 — Donation Transparency Page + Appeal Flow v1.
4. Patch 20 — Private Alpha Readiness Pack.

Evidence reviewers add source/context notes only. They do not decide truth, guilt, corruption, or legitimacy.
