from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_private_alpha_readiness_docs_exist():
    docs = [
        "PRIVATE_ALPHA_SETUP_GUIDE.md",
        "PRIVATE_ALPHA_ADMIN_CHECKLIST.md",
        "PRIVATE_ALPHA_MODERATOR_GUIDE.md",
        "PRIVATE_ALPHA_EVIDENCE_REVIEWER_GUIDE.md",
        "PRIVATE_ALPHA_PRIVACY_AND_RULES.md",
        "PRIVATE_ALPHA_KNOWN_LIMITATIONS.md",
        "PRIVATE_ALPHA_FEEDBACK_FORM.md",
        "PRIVATE_ALPHA_LAUNCH_CHECKLIST.md",
    ]
    for doc in docs:
        text = read(f"docs/{doc}")
        assert "private alpha" in text.lower() or "alpha" in text.lower()


def test_alpha_pack_ui_entrypoint_exists():
    html = read("index.html")
    app = read("app.js")
    styles = read("styles.css")
    assert "alphaReadinessBtn" in html
    assert "sideAlphaReadinessBtn" in html
    assert "renderPrivateAlphaReadinessPack" in app
    assert "Private alpha readiness pack" in app
    assert ".alpha-doc-grid" in styles


def test_patch_20_boundaries_are_explicit():
    manifest = read("PATCH_20_MANIFEST.txt")
    status = read("PATCH_STATUS.md")
    limitations = read("docs/PRIVATE_ALPHA_KNOWN_LIMITATIONS.md")
    checklist = read("docs/PRIVATE_ALPHA_LAUNCH_CHECKLIST.md")
    assert "controlled invited testing only" in manifest
    assert "not public launch" in status.lower()
    assert "not ready for open public registration" in limitations
    assert "No real donation/payment processor enabled" in checklist
    assert "No automated moderation claims" in checklist


def test_role_guides_preserve_review_boundaries():
    moderator = read("docs/PRIVATE_ALPHA_MODERATOR_GUIDE.md")
    evidence = read("docs/PRIVATE_ALPHA_EVIDENCE_REVIEWER_GUIDE.md")
    privacy_rules = read("docs/PRIVATE_ALPHA_PRIVACY_AND_RULES.md")
    feedback = read("docs/PRIVATE_ALPHA_FEEDBACK_FORM.md")
    assert "Sydney Protocol prompts do not moderate" in moderator
    assert "They do not decide truth" in evidence
    assert "No hidden second profile" in privacy_rules
    assert "must not become a hidden behavioral profile" in feedback
