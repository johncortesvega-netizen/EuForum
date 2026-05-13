# Private Alpha Setup Guide

This guide prepares European Public Square for controlled invited testing. It is not a public launch guide.

## Local frontend

Open `index.html` directly for the static prototype, or serve the folder with a local web server.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Optional backend

Install backend dependencies and run FastAPI.

```bash
pip install -r requirements-backend.txt
uvicorn backend.eps_backend:app --reload
```

Backend docs are available at `http://127.0.0.1:8000/docs`.

## Alpha configuration

- Invite only 20-50 testers.
- Use 3-5 rooms.
- Use 2-3 languages.
- Keep registration limited.
- Keep donation/payment processing disabled.
- Keep real translation providers disabled unless explicitly reviewed.
- Keep receipts visible.
- Keep moderation and evidence review human.

## Before inviting testers

- Confirm the frontend opens.
- Confirm backend `/health` works if backend testing is included.
- Create one test account.
- Create one post.
- Report one post.
- Apply one temporary visibility action.
- Submit one appeal.
- Open the transparency page.
- Open the receipts ledger.

## Boundary

Private alpha means controlled invited testing. It does not mean public launch, public registration, real donations, production identity verification, or automated moderation.
