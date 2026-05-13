from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_login_ui_is_present():
    html = read("index.html")
    app = read("app.js")
    assert "Account login" in html
    assert "authPanel" in html
    assert "registerUser" in app
    assert "loginUser" in app
    assert "logoutCurrentUser" in app
    assert "/api/auth/register" in app
    assert "/api/auth/login" in app
    assert "/api/auth/logout" in app


def test_logged_in_posting_uses_backend_identity():
    app = read("app.js")
    assert "currentUser" in app
    assert "Posting uses backend display name + country" in app
    assert "Create thread with login" in app
    assert "Add reply with login" in app
    assert "/api/threads" in app
    assert "/api/threads/${encodeURIComponent(threadId)}/replies" in app


def test_moderation_dashboard_and_two_moderator_ui_exist():
    html = read("index.html")
    app = read("app.js")
    assert "moderationBtn" in html
    assert "renderModerationDashboard" in app
    assert "/api/review-queue" in app
    assert "/api/posts/${encodeURIComponent(postId)}/review-actions" in app
    assert "Two-moderator panel: restore" in app
    assert "Two-moderator panel: keep hidden" in app
    assert "Human moderators decide visibility" in app


def test_patch_doc_and_manifest_state_boundaries():
    doc = read("docs/PATCH_15_18_LOGIN_MODERATION_DASHBOARD.md")
    manifest = read("PATCH_15_18_MANIFEST.txt")
    assert "display name + country, no hidden profile" in doc
    assert "Sydney Protocol remains clarify-only" in doc
    assert "tokens stay in page memory" in manifest
    assert "two-moderator review" in manifest
