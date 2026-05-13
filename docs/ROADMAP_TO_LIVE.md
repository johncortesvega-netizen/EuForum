# Roadmap to Live

## Current state

European Public Square v0.6 is a local static prototype with receipts and clarify-only prompts. Patch 06 adds accountable post identity display.

Patch 01 locks the concept documents and public promises.

## Build path

### Patch 02 — Local Data Model

- load forums/threads/posts from local JSON;
- render rooms from data;
- create threads/replies in browser memory;
- update counters and latest activity.

### Patch 03 — Composer + Posting Limits

- real post/reply composer;
- cooldown timer;
- max posts per session/day placeholder;
- pause-before-reply prompt.

### Patch 04 — Clarify-Only Protocol Prompts

- basic local signal detection;
- strong claim prompt;
- evidence prompt;
- pressure prompt;
- translation caveat;
- dignity/escalation prompt.

### Patch 05 — Receipts System

- post receipt;
- protocol prompt receipt;
- moderation receipt mock;
- evidence note receipt mock;
- donation/spending receipt mock.

### Patch 06 — Accountable Identity Display

- posts show name and country;
- photo is optional;
- composer includes name/country demo fields;
- identity display receipt;
- privacy language distinguishes conversation records from hidden profiling.

### Patch 07 — Backend MVP

- users;
- rooms;
- threads;
- posts;
- receipts;
- moderation actions;
- evidence notes.

### Patch 08 — Minimal Login

- minimal account;
- public post name + country;
- no hidden profile;
- no ad model;
- no behavioral scoring.

### Patch 09 — Human Review Pipeline

- hide post;
- lock thread;
- request edit;
- moderation receipts;
- appeal route.

### Patch 10 — Evidence Reviewer Notes

- source missing;
- source added;
- claim needs context;
- disputed;
- unverifiable;
- translation issue.

### Patch 11 — Donation Transparency Page

- server cost target;
- donation receipt mock;
- spending receipt mock;
- no donor privilege rule.

### Patch 12 — Translation Layer

- original/translated view;
- translation receipt;
- provider adapter placeholder.

### Patch 13 — Closed Alpha

- invited users;
- limited rooms;
- posting limits;
- receipts;
- moderation/evidence-review workflow.

## Go-live definition

The forum can go live when it has:

1. stable login;
2. rooms/threads/replies;
3. posting limits;
4. name + country on posts, photo optional;
5. no hidden profiles;
5. no algorithmic feed;
6. Sydney Protocol clarify-only prompts;
7. visible receipts;
8. moderation tools;
9. evidence reviewer tools;
10. donation page;
11. spending receipts;
12. appeal system;
13. backup/security basics;
14. privacy and rules pages;
15. clear public promise.


## Patch 07 — Backend MVP Skeleton

Added an optional FastAPI + SQLite backend contract for rooms, threads, posts, and receipts. This is the first step toward a functional prototype, but it does not yet add login, identity verification, real translation, moderation enforcement, or donation/payment flows.

Next likely patch: connect the frontend to the backend API or add minimal login, depending on test results.


## Patch 08 note

Minimal login backend contract is now present. It supports accountable posting through display name + country while preserving the no-hidden-profile boundary. Frontend/backend connection remains a future patch.


## Patch 09 alignment

Patch 09 clarifies the public-good path:

- The public forum remains free.
- Donations may cover operating costs later.
- Donations do not buy influence.
- Spending should be shown through receipts.
- Open-source/public-interest stewardship remains the preferred direction.

This should happen before adding donation processing or public registration.


## Patch 11 insertion — EU hard-boundary floor

Before expanding evidence-review or moderation tooling, the platform must preserve this separation:

- EU hard-boundary floor: direct harm and illegal-content categories route to accountable human moderation.
- Sydney Protocol THRESHOLD layer: pressure, evidence gaps, dignity risk, escalation risk, translation caveats, and repair questions are clarified only.

This prevents Sydney Protocol prompts from becoming enforcement or hidden filtering.
