from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(name: str) -> str:
    return (ROOT / name).read_text(encoding="utf-8")


def test_post_identity_rendering_present():
    app = read("app.js")
    assert "function renderIdentity" in app
    assert "Name and country for accountability" in app
    assert "photo optional" in app
    assert "draftName" in app
    assert "draftCountry" in app


def test_identity_receipt_present():
    receipts = read("data/receiptSystem.js")
    assert "createIdentityReceipt" in receipts
    assert "identity_display" in receipts
    assert "Post displays name and country for accountability" in receipts
    assert "Store little enough to protect the person" in receipts


def test_seed_posts_have_country():
    data = read("data/localData.js")
    assert "country:" in data
    assert "Spain" in data
    assert "Netherlands" in data
    assert "Ireland" in data


def test_privacy_promise_distinguishes_records_from_profiles():
    privacy = read("docs/PRIVACY_PROMISE.md")
    assert "country shown on posts" in privacy
    assert "Minimal conversation records" in privacy
    assert "hidden profiling" in privacy
    assert "Name and country for accountability" in privacy


def test_accountable_identity_doc_exists():
    doc = read("docs/ACCOUNTABLE_IDENTITY_MODEL.md")
    assert "Name and country on every post" in doc
    assert "Photo optional" in doc
    assert "not to profile the person" in doc
    assert "Sydney Protocol does not verify identity" in doc
