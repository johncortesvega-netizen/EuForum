# Patch Status

Current prototype: European Public Square v0.18

Latest patch: PATCH_22_FIRST_INVITED_ALPHA_SESSION_KIT

Status: local functional prototype, working locally.

Implemented:

- Local data file for forum content.
- Forums/threads/posts render from local data.
- New thread creation in browser/page memory.
- New reply creation in browser/page memory.
- Derived thread/reply counters.
- Recent thread updates after local submissions.
- Session-only posting limits.
- 45-second demo cooldown after posting.
- Visible pause checkbox before posting.
- Live receipt preview while drafting.
- Pre-post clarity checklist.
- Local Sydney Protocol clarify-only prompt layer.
- Structured prompt categories for evidence, pressure, dignity, authority, mechanism, and evidence path.
- Prompt traces with matched terms and simple quote/example context notes.
- Richer draft/post receipt display for local drafts.

Still intentionally absent:

- No backend.
- No persistent storage.
- No real login.
- No tracking.
- No hidden profile.
- No real translation.
- No enforcement engine.
- No payment/donation system.
- No identity integration.


Boundary phrase: No enforcement action.


## PATCH_05_RECEIPTS_SYSTEM
Status: applied

Scope:
- Added local receipt system module at `data/receiptSystem.js`.
- Added visible receipt bundle previews for drafts and local posts.
- Added post, translation, protocol, moderation-placeholder, and donation-placeholder receipt shapes.
- Added sidebar receipt ledger for visible local receipts.
- Preserved boundary: receipts do not decide truth, rank users, enforce moderation, or create hidden profiles.

Non-goals:
- No backend.
- No login.
- No persistent storage.
- No payment/donation connection.
- No moderation enforcement.
- No real translation provider.


Historical preserved status: PATCH_04_CLARIFY_ONLY_PROTOCOL_PROMPTS — Local Sydney Protocol clarify-only prompt layer; No enforcement engine.

## Patch 06 — Accountable Identity Display

Status: built

Scope:
- posts show name and country for accountability;
- photo remains optional;
- local composer includes display name and country fields;
- receipt bundle includes an identity-display receipt;
- privacy promise distinguishes necessary forum conversation records from hidden profiling;
- roadmap updated so Backend MVP comes after this identity/accountability layer.

Boundaries:
- no backend;
- no login;
- no persistent storage;
- no real identity verification;
- no EU wallet integration;
- no moderation enforcement;
- no hidden profile, ad profile, or behavioral scoring.


## Patch 07 — Backend MVP Skeleton

Status: built

Scope:
- added optional FastAPI + SQLite backend contract;
- added rooms, threads, posts, and receipts tables;
- added endpoints for forums, threads, replies, and post receipts;
- preserves name + country on posts;
- creates identity, post-record, and protocol-prompt receipts for posts;
- preserves privacy boundary: conversation records, not hidden profiles.

Boundaries:
- frontend is not connected to backend yet;
- no login;
- no persistent user accounts;
- no real identity verification;
- no EU wallet integration;
- no moderation enforcement;
- no real translation provider;
- no payment/donation integration.


## Patch 08 — Minimal Login
Status: BUILT

Adds backend-only local account endpoints for register/login/me/logout and public user lookup. Posts can now be linked to a minimal user account and authenticated requests use display name + country from that account. No hidden profile, identity verification, EU wallet integration, moderation enforcement, tracking, donations, or frontend/backend connection added.


## Patch 09 — Public Launch Concept Pack — PASS

Patch 09 prepares the concept for public-facing explanation without launching it.

Added:
- public concept documentation;
- public-good promise;
- donation transparency model;
- open-source and stewardship note;
- what-this-is-not boundary document;
- roadmap to private alpha;
- UI Funding dialog and sidebar funding concept card;
- README/roadmap updates;
- tests for Patch 09 public-good boundaries.

Still not added:
- no real donations/payments;
- no public launch;
- no frontend/backend connection;
- no moderation enforcement;
- no evidence reviewer tooling;
- no real translation;
- no EU identity integration.

Boundary: donations keep the lights on; they do not buy influence.


## Patch 10 — Human Review Pipeline

Adds report-triggered human review, initial moderator checks, temporary visibility limits, two-moderator review, and human-review receipts. Sydney Protocol remains clarify-only; reports do not decide; moderators handle visibility under forum boundaries.


## Patch 11 — EU Hard-Boundary Map + Sydney Protocol THRESHOLD Layer

Status: BUILT

Adds:
- `data/euHardBoundaryMap.js`;
- UI hard-boundary map dialog;
- backend `/api/policy/eu-hard-boundaries` endpoint;
- `eu_hard_boundary_map` receipt support;
- `docs/EU_HARD_BOUNDARY_MAP.md`;
- tests for EU hard-boundary floor + Sydney Protocol THRESHOLD separation.

Boundary:
- European legal and human-rights categories define the hard floor for direct harm;
- Sydney Protocol handles THRESHOLD pressure by clarification only;
- no automatic filtering;
- no automated moderation;
- no truth, guilt, corruption, or legitimacy verdict.


## Patch 12+16 — Evidence Reviewer Notes + Receipts Ledger

Status: built.

Adds human evidence/context notes, evidence-note receipts, a filterable receipts ledger, an evidence review sidebar, and backend placeholder endpoints for evidence notes.

Boundary: evidence reviewers add source/context notes only. They do not decide truth, guilt, corruption, or legitimacy. Sydney Protocol remains THRESHOLD clarification only.


## Patch 15+18 - Login UI + Moderation Dashboard

Status: built.

Adds:
- frontend register/login/logout UI;
- current user display from backend login;
- memory-only bearer token handling;
- composer identity lock while logged in;
- logged-in backend posting for new threads and replies;
- moderation dashboard page;
- backend review queue loading;
- moderator action UI;
- two-moderator restore/keep-hidden UI;
- local demo fallback when backend is unavailable.

Boundary:
- login supports accountable posting only: display name + country, no hidden profile;
- human moderators decide visibility;
- serious actions require two-moderator review;
- Sydney Protocol remains clarify-only and does not enforce.


## Patch 17+19 - Donation Transparency + Appeal Flow

Status: built.

Adds:
- donation transparency page;
- monthly server-cost table;
- mock monthly donation/spending summary;
- public spending receipt model;
- spending receipts in the visible receipt style;
- clear donations-buy-no-influence boundary;
- appeal button for appealable visibility actions;
- appeal status display;
- appeal receipts;
- submitted / under-review / resolved appeal flow.

Boundary:
- no real donations or payment processing;
- donors receive no speech, ranking, visibility, moderation, appeal, protocol, or governance privilege;
- appeals are human-reviewable and receipted;
- Sydney Protocol remains clarify-only.


## Patch 20 - Private Alpha Readiness Pack

Status: built.

Adds:
- setup guide;
- admin checklist;
- moderator guide;
- evidence reviewer guide;
- privacy and rules page;
- known limitations;
- alpha feedback form;
- private alpha launch checklist;
- UI readiness pack entrypoint.

Boundary:
- private alpha candidate means controlled invited testing only;
- still not public launch;
- no public registration;
- no real donations or payment processing;
- no automated moderation.


## Patch 22 - First Invited Alpha Session Kit

Status: built.

Adds:
- tester invite text;
- tester onboarding page;
- what-to-test checklist;
- issue log template;
- moderator shift sheet;
- alpha session report template;
- go/no-go decision doc;
- Alpha Pack UI references;
- smoke gate coverage for the session kit.

Boundary:
- prepares a first invited alpha session only;
- still not public launch;
- no public registration;
- no real donations or payment processing;
- no automated moderation.


## Patch 21 - Private Alpha Smoke Test + Runbook

Status: built.

Adds:
- dependency-free Node smoke test;
- `npm run smoke`;
- private alpha test runbook;
- manual walkthrough for invited sessions;
- stop conditions for alpha sessions;
- smoke runbook entry in Alpha Pack UI.

Boundary:
- smoke pass means ready for a controlled invited session only;
- still not public launch;
- no public registration;
- no real donations or payment processing;
- no automated moderation.
