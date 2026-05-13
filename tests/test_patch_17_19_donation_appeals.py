from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_donation_transparency_module_and_ui_exist():
    html = read("index.html")
    data = read("data/donationTransparency.js")
    app = read("app.js")
    assert "data/donationTransparency.js" in html
    assert "donationTransparencyBtn" in html
    assert "renderDonationTransparencyPage" in app
    assert "MONTHLY_COSTS" in data
    assert "PUBLIC_SPENDING_RECEIPTS" in data
    assert "Server hosting" in data


def test_public_spending_receipts_and_no_influence_boundary():
    receipts = read("data/receiptSystem.js")
    app = read("app.js")
    doc = read("docs/PATCH_17_19_DONATION_TRANSPARENCY_APPEALS.md")
    assert "createSpendingReceipt" in receipts
    assert "public_spending" in receipts
    assert "Donations buy no influence" in receipts
    assert "Monthly server-cost table" in app
    assert "Donations do not buy ranking" in doc


def test_appeal_flow_and_receipts_exist():
    app = read("app.js")
    receipts = read("data/receiptSystem.js")
    assert "showAppealFlow" in app
    assert "applyAppealAction" in app
    assert "data-open-appeal" in app
    assert "Appeal status" in app
    assert "createAppealReceipt" in receipts
    assert "appeal" in receipts


def test_patch_manifest_and_status_updated():
    manifest = read("PATCH_17_19_MANIFEST.txt")
    status = read("PATCH_STATUS.md")
    assert "PATCH 17+19" in manifest
    assert "Donation Transparency + Appeal Flow" in status
    assert "Sydney Protocol remains clarify-only" in manifest
