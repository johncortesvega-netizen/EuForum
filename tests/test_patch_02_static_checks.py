from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(name: str) -> str:
    return (ROOT / name).read_text(encoding="utf-8")


def test_local_data_file_is_loaded_before_app_js():
    html = read("index.html")
    assert '<script src="data/localData.js"></script>' in html
    assert html.index('data/localData.js') < html.index('app.js')


def test_app_uses_local_data_source_and_page_memory_state():
    app = read("app.js")
    assert "window.EPS_LOCAL_DATA" in app
    assert "threadsByForum" in app
    assert "submitLocalDraft" in app
    assert "state.threadsByForum[forumId].unshift(newThread)" in app
    assert "thread.posts.push(post)" in app


def test_no_persistence_or_backend_calls_added():
    app = read("app.js")
    forbidden = ["localStorage", "sessionStorage", "fetch(", "XMLHttpRequest", "indexedDB", "navigator.sendBeacon"]
    for token in forbidden:
        assert token not in app


def test_sydney_protocol_boundary_preserved():
    app = read("app.js")
    readme = read("README.md")
    combined = app + "\n" + readme
    assert "clarifies only" in combined or "clarify only" in combined
    assert "No truth verdict" in app
    assert "No enforcement action" in app
    assert "does not judge, rank, punish, censor, enforce, or decide truth" in readme


def test_patch_files_present():
    expected = [
        "PATCH_02_MANIFEST.txt",
        "PATCH_02_RECOVERY_NOTE.md",
        "PATCH_STATUS.md",
        "docs/PATCH_02_LOCAL_DATA_MODEL.md",
        "data/localData.js",
        "data/forums.json",
    ]
    for rel in expected:
        assert (ROOT / rel).exists(), rel
