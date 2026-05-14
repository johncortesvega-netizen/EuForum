import importlib.util
from pathlib import Path

from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]


def read(name: str) -> str:
    return (ROOT / name).read_text(encoding="utf-8")


def load_backend(tmp_path):
    spec = importlib.util.spec_from_file_location("eps_backend_test", ROOT / "backend" / "eps_backend.py")
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    app = module.make_app(tmp_path / "test.sqlite3")
    return module, TestClient(app)


def test_backend_file_contains_privacy_boundary():
    backend = read("backend/eps_backend.py")
    assert "conversation records, not hidden profiles" in backend
    assert "No truth verdict. No ranking. No moderation action. No enforcement." in backend
    assert "identity_display" in backend
    assert "author_country" in backend


def test_health_and_forums(tmp_path):
    _, client = load_backend(tmp_path)
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "ok"
    assert "hidden profiles" in health.json()["boundary"]

    forums = client.get("/api/forums")
    assert forums.status_code == 200
    data = forums.json()
    assert len(data["forums"]) >= 3
    assert any(room["id"] == "governance" for room in data["forums"])


def test_threads_and_receipts_seeded(tmp_path):
    _, client = load_backend(tmp_path)
    thread_response = client.get("/api/threads/appeal-ai")
    assert thread_response.status_code == 200
    thread = thread_response.json()["thread"]
    assert thread["author_country"] == "Spain"
    assert thread["posts"][0]["author_country"] == "Spain"

    receipts = client.get("/api/posts/post-appeal-ai-001/receipts")
    assert receipts.status_code == 200
    receipt_types = {item["receipt_type"] for item in receipts.json()["receipts"]}
    assert "identity_display" in receipt_types
    assert "post_record" in receipt_types
    assert "protocol_prompt" in receipt_types


def test_create_thread_requires_login_after_patch_24(tmp_path):
    _, client = load_backend(tmp_path)
    payload = {
        "room_id": "governance",
        "title": "How should donation receipts be shown?",
        "author_name": "Johnny",
        "author_country": "Netherlands",
        "original_language": "Dutch original",
        "shown_language": "Shown in English",
        "prompt_label": "Transparency prompt",
        "original_text": "Hoe tonen we donatiebonnetjes zonder verborgen invloed?",
        "translated_text": "How do we show donation receipts without hidden influence?",
        "language_label": "NL → EN",
        "prompt_text": "Clarify: donors receive no ranking or moderation privilege.",
    }
    anonymous = client.post("/api/threads", json=payload)
    assert anonymous.status_code == 401

    client.post("/api/auth/register", json={
        "display_name": "Johnny",
        "country": "Netherlands",
        "password": "strong-password-123",
    })
    login = client.post("/api/auth/login", json={
        "display_name": "Johnny",
        "password": "strong-password-123",
    })
    token = login.json()["token"]
    created = client.post("/api/threads", headers={"Authorization": f"Bearer {token}"}, json=payload)
    assert created.status_code == 200
    thread = created.json()["thread"]
    assert thread["author_country"] == "Netherlands"
    assert thread["posts"][0]["author_name"] == "Johnny"
    receipts = client.get(f"/api/posts/{thread['posts'][0]['id']}/receipts")
    assert receipts.status_code == 200
    assert len(receipts.json()["receipts"]) >= 3


def test_patch_docs_exist():
    doc = read("docs/PATCH_07_BACKEND_MVP.md")
    assert "Backend MVP Skeleton" in doc
    assert "Sydney Protocol clarifies only" in doc
    assert "no hidden profile" in doc
