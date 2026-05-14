# Roadmap To A Functional Friends Forum

Goal: move European Public Square from a public demo into a small working forum that John and friends can actually use and test together.

This roadmap assumes no invite-code gate for the first friend test. People can register with display name, country, and password. Admin/moderator controls can be added after the basic loop works.

## Target For The First Real Test

- Friends can register without invite codes.
- Friends can log in and log out.
- Logged-in users can create threads and replies.
- Threads and replies persist in SQLite after refresh/restart.
- Forum pages load from the backend instead of local seed data when the backend is available.
- Name + country remain visible on posts.
- Sydney Protocol / clarity receipts are generated only when requested; they are not stored under posts by default and are not a pre-post mode.
- RSS media feed remains the first screen; it stays read-only, with a small logged-in post box that sends original posts to selected forum rooms instead of replying to feed items.
- Basic report and moderation queue are available for the tester group.


## Receipt Privacy Boundary

The forum stores necessary forum records, not interpretive user profiles. Sydney Protocol / clarity receipts must be generated only when requested and must not be stored as default post metadata, ranking signals, hidden behavioral scores, or moderation decisions. Reports, evidence notes, and moderation actions may persist because they are accountable forum records; receipt-style explanations over those records remain generated views.

## Patch 23 - Persistent Friends Forum Backend

Goal: make the backend the real source of forum data.

Build:

- keep SQLite as the first production-like database;
- keep open registration, no invite code;
- require login for posting;
- keep existing seeded rooms/threads as starter content;
- add `/api/bootstrap` or equivalent endpoint that returns rooms, threads, current backend status, and policy boundaries;
- add an on-demand post receipt endpoint that generates temporary clarity receipts only when explicitly requested;
- add backend health/status fields useful for the frontend;
- keep compatibility tests for register/login/thread/reply/report.

Done when:

- a newly registered user can create a thread through the API;
- a reply remains after backend restart;
- post receipts can be generated on demand from the backend without being stored as user records;
- direct anonymous backend posting is blocked, except seed/demo fixtures.

## Patch 24 - Media Feed Front Door + Compact Anti-Spam Posting

Goal: make the app start from the media feed while allowing a small, careful posting action without opening the full forum first.

Build:

- render the media feed tab as the first screen;
- keep feed sources read-only, with no replies, likes, reposts, or engagement loop;
- add a compact “Do you have a post?” composer inside the media feed tab;
- let the user choose the target forum room, title, language, and contents from that compact composer;
- require login before backend posting from the compact composer;
- require a pause checkbox, minimum title/body content, page-window limits, and cooldown before posting;
- enforce server-side anti-spam limits for logged-in posting: 3 posts per 30 minutes, 45-second cooldown, duplicate blocking, and no anonymous backend posting;
- after posting, stay on the media feed front door and update recent threads instead of forcing the user into the full forum.

Done when:

- page load starts at the media feed;
- a logged-in user can create a thread from the compact media-feed composer;
- anonymous backend thread/reply posting is blocked;
- fast repeated posts and short-window duplicates receive 429 responses;
- the full forum remains available from the Square button for deeper browsing.

## Patch 25 - Small Group Moderation

Goal: make testing with friends survivable without overbuilding governance.

Build:

- report button writes backend reports;
- moderation queue loads reports from backend;
- admin/moderator role field exists in users;
- moderator action can hide/restore posts;
- two-moderator review remains modeled for serious actions;
- moderation actions are logged as human records; any receipt-style explanation is generated on demand and not kept as a user profile.

Done when:

- a reported post appears in a queue;
- a moderator action changes visibility;
- moderation history shows who acted, what action happened, and why; any receipt-style view is generated on demand.

## Patch 26 - Deployment Setup

Goal: make the friends forum easy to run outside your laptop.

Build:

- `README` setup for local backend + frontend;
- deployment notes for Render/Railway/Fly.io;
- environment variables for database path, admin bootstrap name, and CORS origin;
- backup/export instructions for SQLite;
- simple start commands for Windows.

Done when:

- you can run it locally from clean checkout;
- a hosted backend can run with persistent storage;
- Streamlit/static frontend knows the backend URL.

## Patch 27 - Friend Test Readiness

Goal: prepare the first real test session with your mates.

Build:

- short tester guide;
- known limitations page;
- feedback form/questions;
- bug report template;
- moderator quick guide;
- go/no-go checklist.

Done when:

- you can send friends one URL and a short instruction;
- you know what to test;
- feedback can be collected without guessing.

## What We Are Not Building Yet

- no invite-code gate for the first friend test;
- no payment/donation processing;
- no real identity verification;
- no algorithmic feed;
- no automatic moderation;
- no production translation provider;
- no mobile app;
- no large public launch.

## Practical Build Order

1. Patch 23: backend persistence and login-required posting.
2. Patch 24: media-feed-first UI with compact anti-spam posting.
3. Patch 25: moderation queue and visibility actions.
4. Patch 26: deploy setup.
5. Patch 27: friend-test guide and checklist.

After Patch 27, the project should be a functional small-group forum, not just a prototype shell.
