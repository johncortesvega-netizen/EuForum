# Backend MVP — Patch 07

This folder adds the first backend contract for European Public Square.

It is intentionally small:

- FastAPI;
- SQLite;
- rooms;
- threads;
- posts;
- receipts;
- name + country on posts;
- no hidden profiles;
- no ranking model;
- no ads;
- no real login yet;
- no identity wallet integration yet.

## Run

From the project root:

```bash
pip install -r requirements-backend.txt
python -m uvicorn backend.eps_backend:app --reload
```

Open:

```text
http://127.0.0.1:8000/health
http://127.0.0.1:8000/api/forums
```

## Boundary

The backend stores conversation records so the forum can function. It does not create hidden profiles, ad profiles, behavioral scores, or personalization models.
