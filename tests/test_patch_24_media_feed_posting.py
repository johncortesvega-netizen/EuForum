import importlib.util
from pathlib import Path

from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]


def read(name: str) -> str:
    return (ROOT / name).read_text(encoding="utf-8")


def load_backend(tmp_path):
    spec = importlib.util.spec_from_file_location("eps_backend_patch24", ROOT / "backend" / "eps_backend.py")
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    app = module.make_app(tmp_path / "test.sqlite3")
    return module, TestClient(app)


def register_and_login(client, name="Patch24Tester"):
    client.post("/api/auth/register", json={
        "display_name": name,
        "country": "Netherlands",
        "password": "patch-24-password",
    })
    login = client.post("/api/auth/login", json={
        "display_name": name,
        "password": "patch-24-password",
    })
    assert login.status_code == 200
    return login.json()["token"]


def thread_payload(title="Media feed front door post", body="This is an original post written from the media feed composer."):
    return {
        "room_id": "governance",
        "title": title,
        "original_language": "English original",
        "shown_language": "Shown in English",
        "prompt_label": "Context prompt",
        "original_text": body,
        "translated_text": body,
        "language_label": "EN",
        "prompt_text": "No Sydney Protocol trigger attached. Clarity receipts remain on-demand.",
    }


def test_media_feed_is_front_door_with_compact_post_composer():
    app = read("app.js")
    html = read("index.html")
    css = read("styles.css")

    assert "renderMediaFeedTab();" in app
    assert "Do you have a post?" in app
    assert "mediaPostRoom" in app
    assert "mediaPostBody" in app
    assert "Log in before posting" in app
    assert "Server blocks anonymous posting" in app
    assert "media-composer-card" in css
    assert "mediaFeedBtn" in html


def test_backend_blocks_anonymous_posting_and_limits_logged_in_spam(tmp_path):
    _, client = load_backend(tmp_path)

    anonymous = client.post("/api/threads", json=thread_payload())
    assert anonymous.status_code == 401
    assert "Login required" in anonymous.json()["detail"]

    token = register_and_login(client)
    created = client.post("/api/threads", headers={"Authorization": f"Bearer {token}"}, json=thread_payload())
    assert created.status_code == 200
    assert created.json()["posting_limit"]["remaining_after_post"] == 2
    assert "rate-limited server-side" in created.json()["posting_limit"]["boundary"]

    too_fast = client.post("/api/threads", headers={"Authorization": f"Bearer {token}"}, json=thread_payload(
        title="Second post too fast",
        body="This second original post should be stopped by cooldown.",
    ))
    assert too_fast.status_code == 429
    assert "Cooldown active" in too_fast.json()["detail"]


def test_backend_blocks_anonymous_replies(tmp_path):
    _, client = load_backend(tmp_path)
    reply = client.post("/api/threads/appeal-ai/replies", json={
        "author_name": "Anonymous",
        "author_country": "Europe",
        "original_text": "This should not be accepted without login anymore.",
        "translated_text": "This should not be accepted without login anymore.",
        "language_label": "EN",
        "prompt_text": "No anonymous backend posting.",
    })
    assert reply.status_code == 401


def test_patch_24_docs_and_status_exist():
    doc = read("docs/PATCH_24_MEDIA_FEED_POSTING.md")
    status = read("PATCH_STATUS.md")
    roadmap = read("docs/FUNCTIONAL_FORUM_ROADMAP.md")

    assert "Media Feed Front Door" in doc
    assert "3 posts per 30 minutes" in doc
    assert "Patch 24" in status
    assert "media feed remains the first screen" in roadmap
