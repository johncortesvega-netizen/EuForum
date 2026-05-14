import importlib.util
from pathlib import Path

from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]


def read(name: str) -> str:
    return (ROOT / name).read_text(encoding="utf-8")


def load_backend(tmp_path):
    spec = importlib.util.spec_from_file_location("eps_backend_patch08", ROOT / "backend" / "eps_backend.py")
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    app = module.make_app(tmp_path / "patch08.sqlite3")
    return module, TestClient(app)


def test_patch_08_backend_contains_minimal_login_boundary():
    backend = read("backend/eps_backend.py")
    assert "Minimal login supports accountable posting" in backend
    assert "password_hash" in backend
    assert "sessions" in backend
    assert "hidden profile" in backend
    assert "/api/auth/register" in backend
    assert "/api/auth/login" in backend


def test_register_login_me_logout_flow(tmp_path):
    _, client = load_backend(tmp_path)
    register = client.post("/api/auth/register", json={
        "display_name": "Johnny",
        "country": "Netherlands",
        "password": "strong-password-123",
        "photo_url": "https://example.test/photo.png",
    })
    assert register.status_code == 200
    user = register.json()["user"]
    assert user["display_name"] == "Johnny"
    assert user["country"] == "Netherlands"
    assert "password" not in user
    assert "boundary" in user

    duplicate = client.post("/api/auth/register", json={
        "display_name": "Johnny",
        "country": "Netherlands",
        "password": "strong-password-123",
    })
    assert duplicate.status_code == 409

    login = client.post("/api/auth/login", json={
        "display_name": "Johnny",
        "password": "strong-password-123",
    })
    assert login.status_code == 200
    token = login.json()["token"]
    assert token

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["user"]["country"] == "Netherlands"

    logout = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout.status_code == 200
    after_logout = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert after_logout.status_code == 401


def test_authenticated_post_uses_account_identity(tmp_path):
    _, client = load_backend(tmp_path)
    client.post("/api/auth/register", json={
        "display_name": "Elena",
        "country": "Hungary",
        "password": "another-strong-password",
    })
    login = client.post("/api/auth/login", json={
        "display_name": "Elena",
        "password": "another-strong-password",
    })
    token = login.json()["token"]

    created = client.post("/api/threads", headers={"Authorization": f"Bearer {token}"}, json={
        "room_id": "governance",
        "title": "Should account identity be minimal?",
        "original_language": "English original",
        "shown_language": "Shown in English",
        "prompt_label": "Identity boundary",
        "original_text": "Name and country are enough for accountability.",
        "translated_text": "Name and country are enough for accountability.",
        "language_label": "EN",
        "prompt_text": "Clarify: identity supports accountability, not hidden profiling.",
    })
    assert created.status_code == 200
    thread = created.json()["thread"]
    assert thread["author_name"] == "Elena"
    assert thread["author_country"] == "Hungary"
    assert thread["user_id"].startswith("user-")
    assert thread["posts"][0]["author_name"] == "Elena"
    assert thread["posts"][0]["user_id"] == thread["user_id"]

    receipts = client.get(f"/api/posts/{thread['posts'][0]['id']}/receipts")
    assert receipts.status_code == 200
    identity = [r for r in receipts.json()["receipts"] if r["receipt_type"] == "identity_display"]
    assert identity
    assert any("Linked to minimal account identity" in detail for detail in identity[0]["details"])


def test_direct_name_country_backend_posting_is_blocked_after_patch_24(tmp_path):
    _, client = load_backend(tmp_path)
    reply = client.post("/api/threads/appeal-ai/replies", json={
        "author_name": "Mira",
        "author_country": "Spain",
        "original_text": "Prototype compatibility no longer allows anonymous backend posting.",
        "translated_text": "Prototype compatibility no longer allows anonymous backend posting.",
        "language_label": "EN",
        "prompt_text": "Clarify: backend posting now requires login to reduce spam.",
    })
    assert reply.status_code == 401
    assert "Login required" in reply.json()["detail"]


def test_patch_08_docs_exist():
    doc = read("docs/PATCH_08_MINIMAL_LOGIN.md")
    assert "Minimal Login" in doc
    assert "display name + country" in doc
    assert "hidden profile" in doc
    manifest = read("PATCH_08_MANIFEST.txt")
    assert "PATCH 08" in manifest
