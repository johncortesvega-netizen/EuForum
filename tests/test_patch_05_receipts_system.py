from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_receipt_system_file_exists_and_has_core_boundary():
    text = read("data/receiptSystem.js")
    assert "window.EPS_RECEIPTS" in text
    assert "No hidden second profile" in text
    assert "Donations keep the lights on" in text
    assert "createReceiptBundle" in text


def test_index_loads_receipt_system_before_app_and_shows_ledger():
    html = read("index.html")
    assert "data/receiptSystem.js" in html
    assert html.index("data/receiptSystem.js") < html.index("app.js")
    assert "receiptLedger" in html
    assert "local prototype v0.6 / patch 05" in html


def test_app_uses_receipt_bundle_and_ledger():
    text = read("app.js")
    assert "createReceiptBundleForDraft" in text
    assert "renderReceiptCards" in text
    assert "renderReceiptLedger" in text
    assert "pushReceipts" in text
    assert "The post is the print" in text


def test_styles_include_receipt_components():
    text = read("styles.css")
    assert ".receipt-card-list" in text
    assert ".receipt-ledger" in text
    assert ".ledger-row" in text


def test_patch_docs_preserve_non_goals():
    text = read("docs/PATCH_05_RECEIPTS_SYSTEM.md")
    for phrase in [
        "decide truth",
        "rank users",
        "create hidden profiles",
        "replace human review",
    ]:
        assert phrase in text
