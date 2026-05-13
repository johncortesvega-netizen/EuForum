# Identity-Ready, Not Identity-Dependent

## Core rule

Proof when needed, privacy by default.

European Public Square should be designed so future European digital identity systems can be integrated, but the forum should not depend on identity infrastructure to exist.

## Participation model

Possible identity levels:

| Level | Meaning |
|---|---|
| Reader | Can read public rooms |
| Pseudonymous account | Can post under a display name |
| Verified human | Proves personhood without public legal identity |
| Verified adult | Proves age bracket where needed |
| Verified region | Proves region if needed for local rooms |
| Verified organization representative | Used for official/institutional accounts |

## Privacy-first identity principle

If a credential is used, the forum should verify the necessary attribute, not store the whole person.

Examples:

- store: `verified_adult = true`
- do not store: full birthdate, ID number, address, government document

## Receipts

Identity-sensitive actions should create minimal receipts:

- what was requested;
- why it was requested;
- what attribute was verified;
- what was stored;
- what was not stored;
- expiry/revocation if applicable;
- appeal route if verification fails.

## Boundary

Identity should support accountability, not become surveillance.
