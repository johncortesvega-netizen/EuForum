# Private Alpha Test Runbook

This runbook is the first operational gate after Patch 20. It checks whether the private alpha candidate can be opened, explained, and tested without drifting into public-launch claims.

## Smoke Test

Run the dependency-free smoke check:

```bash
npm run smoke
```

Equivalent direct command:

```bash
node tests/private_alpha_smoke_check.mjs
```

The smoke check verifies:

- the v0.17 UI shell is present;
- alpha readiness pack entrypoints exist;
- donation transparency and appeal flow code exists;
- spending and appeal receipt creators exist;
- private alpha docs exist;
- forbidden browser persistence APIs are not used in `app.js`;
- status and README mention the smoke gate.

## Manual Session Walkthrough

Before inviting testers, one admin should complete this walkthrough.

1. Open the forum shell.
2. Open the Alpha Pack.
3. Open the donation transparency page.
4. Open the receipts ledger.
5. Create or log in with a test account if the backend is running.
6. Create one test post.
7. Report that post.
8. Apply a temporary visibility action.
9. Submit an appeal.
10. Confirm appeal status and receipt are visible.
11. Add one evidence note.
12. Confirm the known limitations are shared with testers.

## Stop Conditions

Stop the invited session if:

- the Alpha Pack is not visible;
- receipts do not render;
- testers mistake Sydney Protocol prompts for enforcement;
- appeal flow cannot be explained;
- donation transparency is misunderstood as donor influence;
- moderators cannot keep up with reports;
- direct harm cannot be handled by available humans.

## Result Log

Record:

- date;
- tester count;
- rooms used;
- languages used;
- smoke test result;
- manual walkthrough result;
- issues found;
- decision: repeat alpha, pause, or fix before next invite.

## Boundary

Passing the smoke test means ready for a controlled invited session. It does not mean public launch.
