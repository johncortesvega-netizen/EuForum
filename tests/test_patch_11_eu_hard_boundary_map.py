from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_eu_hard_boundary_map_script_loaded_and_uses_threshold_language():
    html = read("index.html")
    app = read("app.js")
    assert "data/euHardBoundaryMap.js" in html
    assert "EU hard-boundary map" in html
    assert "THRESHOLD" in html
    combined = html + app
    assert "Sydney Protocol THRESHOLD" in combined or "THRESHOLD clarification" in combined


def test_policy_map_defines_hard_floor_and_threshold_layer():
    policy = read("data/euHardBoundaryMap.js")
    assert "European law and human-rights categories define the hard floor" in policy
    assert "Sydney Protocol handles THRESHOLD pressure through clarification only" in policy
    assert "child sexual abuse or exploitation" in policy
    assert "direct threat or incitement to violence" in policy
    assert "doxxing or private personal-data exposure" in policy
    assert "illegal hate speech under applicable law" in policy
    assert "corruption-risk language without sources" in policy


def test_review_pipeline_exports_threshold_boundary():
    pipeline = read("data/reviewPipeline.js")
    assert "THRESHOLD_LAYER_BOUNDARY" in pipeline
    assert "EU_HARD_BOUNDARY_FLOOR" in pipeline
    assert "Sydney Protocol handles THRESHOLD pressure by clarification only" in pipeline


def test_receipts_support_hard_boundary_map_without_enforcement():
    receipts = read("data/receiptSystem.js")
    assert "createHardBoundaryMapReceipt" in receipts
    assert "eu_hard_boundary_map" in receipts
    assert "Sydney Protocol THRESHOLD prompts do not hide posts" in receipts
    assert "does not decide guilt, political truth, corruption, or legitimacy" in receipts


def test_backend_exposes_policy_endpoint():
    backend = read("backend/eps_backend.py")
    assert "/api/policy/eu-hard-boundaries" in backend
    assert "EU_HARD_BOUNDARY_CATEGORIES" in backend
    assert "SYDNEY_THRESHOLD_EXAMPLES" in backend
    assert "not_automatic_filtering" in backend
    assert "THRESHOLD" in backend


def test_docs_record_patch_boundary():
    doc = read("docs/EU_HARD_BOUNDARY_MAP.md")
    patch_doc = read("docs/PATCH_11_EU_HARD_BOUNDARY_MAP.md")
    assert "Sydney Protocol THRESHOLD layer" in doc
    assert "No automatic filtering" in patch_doc
    assert "No enforcement by Sydney Protocol" in patch_doc
