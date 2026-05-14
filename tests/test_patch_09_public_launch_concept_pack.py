from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_patch_09_public_concept_docs_exist_and_lock_boundaries():
    public_concept = read("docs/PUBLIC_CONCEPT.md")
    public_good = read("docs/PUBLIC_GOOD_PROMISE.md")
    donation = read("docs/DONATION_TRANSPARENCY_MODEL.md")
    not_this = read("docs/WHAT_THIS_IS_NOT.md")

    assert "free, slower multilingual forum" in public_concept
    assert "No ads" in public_concept
    assert "No hidden behavioral profile" in public_concept
    assert "Donations keep the lights on" in public_good
    assert "do not buy influence" in public_good
    assert "Spending receipt fields" in donation
    assert "not an AI moderation system" in not_this
    assert "Sydney Protocol prompts clarify only" in not_this


def test_patch_09_open_source_and_private_alpha_docs_exist():
    stewardship = read("docs/OPEN_SOURCE_AND_STEWARDSHIP.md")
    alpha = read("docs/ROADMAP_TO_PRIVATE_ALPHA.md")

    assert "Open code. Official stewardship. Public receipts." in stewardship
    assert "20–50 invited users" in alpha
    assert "Slow launch for a slow forum" in alpha


def test_patch_09_ui_exposes_funding_without_payments():
    index = read("index.html")
    app = read("app.js")

    assert "fundingBtn" in index
    assert "Funding model" in index
    assert "Donations keep the lights on" in index
    assert "Donations do not buy ranking" in app
    assert "No ads, no data monetization" in app
    assert "stripe" not in app.lower()
    assert "paypal" not in app.lower()


def test_patch_09_manifest_and_status():
    manifest = read("PATCH_09_MANIFEST.txt")
    recovery = read("PATCH_09_RECOVERY_NOTE.md")
    status = read("PATCH_STATUS.md")

    assert "PATCH 09" in manifest
    assert "PUBLIC LAUNCH CONCEPT PACK" in manifest
    assert "No payment processor" in recovery
    assert "Patch 09" in status
    assert "donations keep the lights on" in status.lower()


def test_patch_09_readme_names_current_non_production_boundaries():
    readme = read("README.md")
    assert "No real donations or payment processing" in readme
    assert "backend" in readme
    assert "No production moderation enforcement UI" in readme
    assert "No EU identity integration" in readme
