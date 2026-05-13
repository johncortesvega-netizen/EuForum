# European Public Square v0.18

A free, slower multilingual forum prototype for Europe.

European Public Square is designed as an old-school forum structure with modern translation concepts, visible receipts, accountable identity display, posting limits, and Sydney Protocol prompts that clarify only.

## Current prototype status

Patch 22 adds the first invited alpha session kit. This is not a public launch, not a payment system, and not automatic filtering.

The prototype currently includes:

- static frontend forum shell;
- local data model for rooms, threads, and posts;
- local browser-memory draft threads and replies;
- posting cooldown and session limit behavior;
- Sydney Protocol clarify-only prompt detection;
- visible receipt bundles;
- name + country on posts, photo optional;
- optional FastAPI + SQLite backend skeleton;
- backend minimal login with display name + country;
- frontend register/login/logout controls;
- logged-in posting through backend thread/reply endpoints when the backend is running;
- moderation dashboard with backend review queue and two-moderator action UI;
- donation transparency page with monthly server-cost table;
- public spending receipt model;
- local appeal button, appeal status, and appeal receipts for appealable visibility actions;
- private alpha setup guide, admin checklist, moderator guide, evidence reviewer guide, privacy/rules page, known limitations, feedback form, and launch checklist;
- dependency-free private alpha smoke check and test runbook;
- invite text, tester onboarding, what-to-test checklist, issue log, moderator shift sheet, session report, and go/no-go decision docs;
- public concept, public-good, donation transparency, open-source/stewardship, and private-alpha roadmap documents;
- EU hard-boundary map for direct-harm categories;
- Sydney Protocol THRESHOLD layer for clarification only.

## Core boundaries

- Free to use.
- No ads.
- No data monetization.
- No hidden behavioral profile.
- No algorithmic feed.
- Name and country for accountability; private life protected.
- The post is the print.
- European legal/human-rights categories define the hard-boundary floor for direct harm.
- Sydney Protocol handles THRESHOLD pressure by clarification only and does not judge, rank, punish, censor, enforce, or decide truth.
- Human moderators handle hard-boundary visibility actions with receipts.
- Donations may later cover costs, with public spending receipts.
- Donations do not buy influence.

## Frontend demo

Open `index.html` directly, or run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Private alpha smoke check

Run the dependency-free smoke gate before invited sessions:

```bash
npm run smoke
```

Or directly:

```bash
node tests/private_alpha_smoke_check.mjs
```

## Optional backend

The frontend can now use the backend for login, logged-in posting, review queue loading, and moderator actions when the server is running.

```bash
pip install -r requirements-backend.txt
uvicorn backend.eps_backend:app --reload
```

API docs: `http://127.0.0.1:8000/docs`

## Public concept docs

See:

- `docs/PUBLIC_CONCEPT.md`
- `docs/PUBLIC_GOOD_PROMISE.md`
- `docs/DONATION_TRANSPARENCY_MODEL.md`
- `docs/OPEN_SOURCE_AND_STEWARDSHIP.md`
- `docs/WHAT_THIS_IS_NOT.md`
- `docs/ROADMAP_TO_PRIVATE_ALPHA.md`
- `docs/EU_HARD_BOUNDARY_MAP.md`

## Not included yet

- No real public launch.
- No real donations or payment processing.
- No donor account model.
- No production appeal case-management workflow.
- No public registration.
- No production auth provider.
- No persistent browser token storage.
- No automatic filtering or automated moderation.
- No production moderation enforcement UI.
- No real translation provider.
- No EU identity integration.


## Patch 10 — Human Review Pipeline

Adds report-triggered human review, initial moderator checks, temporary visibility limits, two-moderator review, and human-review receipts. Sydney Protocol remains clarify-only; reports do not decide; moderators handle visibility under forum boundaries.


## Patch 11 — EU Hard-Boundary Map + Sydney Protocol THRESHOLD Layer

Adds EU-aligned hard-boundary category mapping for direct harm and illegal-content review while keeping the Sydney Protocol in the THRESHOLD clarification layer.

Boundary: European hard-boundary floor for direct harm; Sydney Protocol THRESHOLD layer for clarification only. No automatic filtering, no automated moderation, no truth verdict, no enforcement.


## Patch 12+16

Adds evidence reviewer notes and a filterable receipts ledger. Evidence reviewers add source/context notes only; they do not decide truth, guilt, corruption, or legitimacy.


## Patch 15+18

Adds frontend register/login/logout, current user display, backend posting for logged-in users, a moderation dashboard, backend review queue loading, and two-moderator review actions.

Boundary: login supports accountable posting only. Human moderators decide visibility. Sydney Protocol remains clarify-only.


## Patch 17+19

Adds donation transparency page, monthly server-cost table, public spending receipts, appeal button, appeal receipts, and appeal status.

Boundary: donations buy no influence. Appeals are human-reviewable and receipted. Sydney Protocol remains clarify-only.


## Patch 20

Adds the private alpha readiness pack: setup guide, admin checklist, moderator guide, evidence reviewer guide, privacy/rules page, known limitations, alpha feedback form, and private alpha launch checklist.

Boundary: private alpha candidate means controlled invited testing only. It is still not public launch.


## Patch 21

Adds a dependency-free private alpha smoke test, `npm run smoke`, and a private alpha test runbook with manual walkthrough and stop conditions.

Boundary: passing smoke means ready for a controlled invited session only. It is still not public launch.


## Patch 22

Adds the first invited alpha session kit: invite text, tester onboarding, what-to-test checklist, issue log template, moderator shift sheet, session report, and go/no-go decision doc.

Boundary: this prepares a controlled invited session only. It is still not public launch.
