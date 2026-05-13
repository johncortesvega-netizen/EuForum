from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_evidence_review_module_exists_and_is_bounded():
    text = read("data/evidenceReview.js")
    assert "Evidence reviewers add source and context notes" in text or "Evidence reviewers add source/context notes" in text
    assert "They do not decide truth, guilt, corruption, or legitimacy" in text
    assert "NOTE_TYPES" in text
    assert "source_missing" in text
    assert "translation_nuance" in text


def test_receipt_system_has_evidence_note_receipts():
    text = read("data/receiptSystem.js")
    assert "createEvidenceNoteReceipt" in text
    assert "evidence_note" in text
    assert "Evidence notes attach to posts, not hidden behavioral profiles" in text


def test_ui_exposes_evidence_notes_and_filterable_ledger():
    app = read("app.js")
    index = read("index.html")
    assert "Patch 12+16" in app
    assert "showEvidenceNoteFlow" in app
    assert "renderEvidenceNotes" in app
    assert "selectedReceiptFilter" in app
    assert "showFullReceiptLedger" in app
    assert "Evidence review" in index
    assert "Receipts Ledger" in index
    assert "data/evidenceReview.js" in index


def test_backend_has_evidence_note_endpoints():
    text = read("backend/eps_backend.py")
    assert "EVIDENCE_REVIEW_BOUNDARY" in text
    assert "CREATE TABLE IF NOT EXISTS evidence_notes" in text
    assert "/api/posts/{post_id}/evidence-notes" in text
    assert "/api/evidence-notes" in text
    assert "create_evidence_note_receipt" in text


def test_docs_and_status_updated_for_patch_12_16():
    assert (ROOT / "PATCH_12_16_MANIFEST.txt").exists()
    assert (ROOT / "PATCH_12_16_RECOVERY_NOTE.md").exists()
    assert (ROOT / "docs/PATCH_12_16_EVIDENCE_RECEIPTS_LEDGER.md").exists()
    status = read("PATCH_STATUS.md")
    assert "Patch 12+16" in status
    roadmap = read("docs/ROADMAP.md")
    assert "Patch 12+16" in roadmap
