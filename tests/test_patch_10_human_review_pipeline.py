from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_review_pipeline_script_loaded():
    html = read("index.html")
    assert "data/reviewPipeline.js" in html
    assert "Human review queue" in html


def test_sydney_protocol_stays_clarify_only():
    app = read("app.js")
    assert "Sydney Protocol clarifies only" in app
    assert "Human moderators decide visibility" in app
    assert "Reports trigger review" in app


def test_receipt_system_has_human_review_receipts():
    receipts = read("data/receiptSystem.js")
    assert "createReportReceipt" in receipts
    assert "createHumanReviewReceipt" in receipts
    assert "createTemporaryHideReceipt" in receipts
    assert "createPanelReviewReceipt" in receipts
    assert "Reports trigger review. They do not decide truth" in receipts


def test_review_pipeline_defines_threshold_and_moderators():
    pipeline = read("data/reviewPipeline.js")
    assert "REPORT_THRESHOLD" in pipeline
    assert "DEMO_MODERATORS" in pipeline
    assert "two-moderator" in pipeline or "two_moderator" in pipeline


def test_backend_has_report_and_review_endpoints():
    backend = read("backend/eps_backend.py")
    assert "/api/posts/{post_id}/reports" in backend
    assert "/api/review-queue" in backend
    assert "/api/posts/{post_id}/review-actions" in backend
    assert "HUMAN_REVIEW_BOUNDARY" in backend


def test_patch_doc_states_not_automated_moderation():
    doc = read("docs/PATCH_10_HUMAN_REVIEW_PIPELINE.md")
    assert "not automated moderation" in doc.lower()
    assert "Reports do not decide" in doc
    assert "Two additional human moderators" in doc
