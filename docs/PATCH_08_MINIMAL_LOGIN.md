# Patch 08 — Minimal Login

Patch 08 adds the first backend account contract for European Public Square.

The purpose is not identity expansion or profiling. The purpose is accountable posting:

> Posts show display name + country. Photo remains optional. No hidden second profile is created.

## Added

- `users` table for minimal local accounts.
- `sessions` table for bearer-token sessions.
- PBKDF2 password hashing for local prototype login.
- `/api/auth/register`.
- `/api/auth/login`.
- `/api/auth/me`.
- `/api/auth/logout`.
- `/api/users/{user_id}` public profile endpoint.
- `user_id` support on threads and posts.
- authenticated posting path: backend uses account display name + country when a valid bearer token is supplied.
- compatibility path: prototype requests may still provide display name + country directly until the frontend connects.

## Stored for accounts

- display name;
- country;
- optional photo URL;
- role;
- password hash + salt;
- session hash.

## Not stored

- address;
- legal ID document;
- birthdate;
- ad profile;
- political profile;
- interest graph;
- behavioral ranking score;
- hidden personalization model.

## Boundary

Minimal login supports accountable posting. It does not create a surveillance identity layer or hidden profile.

## Not added

- no frontend/backend connection yet;
- no real EU wallet integration;
- no real identity verification;
- no moderation enforcement;
- no donations/payments;
- no real translation.
