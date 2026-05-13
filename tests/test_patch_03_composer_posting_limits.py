from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(name: str) -> str:
    return (ROOT / name).read_text(encoding="utf-8")


def test_patch_03_files_present():
    expected = [
        "PATCH_03_MANIFEST.txt",
        "PATCH_03_RECOVERY_NOTE.md",
        "docs/PATCH_03_COMPOSER_POSTING_LIMITS.md",
        "tests/test_patch_03_composer_posting_limits.py",
    ]
    for rel in expected:
        assert (ROOT / rel).exists(), rel


def test_composer_has_pause_step_and_clarity_checklist():
    app = read("app.js")
    assert "pauseCheck" in app
    assert "I paused, checked context/evidence" in app
    assert "clarity-checklist" in app
    assert "Before posting" in app


def test_posting_limits_include_cooldown_and_window_limit():
    app = read("app.js")
    assert "postCooldownMs" in app
    assert "45 * 1000" in app
    assert "postWindowMs" in app
    assert "30 * 60 * 1000" in app
    assert "maxPostsPerWindow: 3" in app
    assert "cooldownEndsAt" in app


def test_live_status_and_receipt_preview_are_connected():
    app = read("app.js")
    assert "updateComposerPostStatus" in app
    assert "setInterval" in app
    assert "Live receipt preview. Not stored." in app
    assert "Preview receipt" in app


def test_no_persistence_or_backend_calls_added():
    app = read("app.js")
    forbidden = ["localStorage", "sessionStorage", "fetch(", "XMLHttpRequest", "indexedDB", "navigator.sendBeacon"]
    for token in forbidden:
        assert token not in app


def test_clarify_only_boundary_preserved():
    combined = "\n".join(read(name) for name in [
        "app.js",
        "README.md",
        "docs/PATCH_03_COMPOSER_POSTING_LIMITS.md",
    ])
    assert "clarifies only" in combined or "clarify only" in combined
    assert "No truth verdict" in combined
    assert "No enforcement action" in combined
    assert "does not judge, rank, punish, censor, enforce, or decide truth" in combined
