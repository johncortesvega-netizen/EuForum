from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_protocol_rules_file_exists_and_is_clarify_only():
    text = read("data/protocolRules.js")
    assert "window.EPS_PROTOCOL" in text
    assert "Clarify only" in text
    assert "No truth verdict" in text
    assert "No enforcement" in text


def test_protocol_rules_include_required_prompt_categories():
    text = read("data/protocolRules.js")
    for category in [
        "evidence_gap",
        "pressure",
        "dignity_risk",
        "authority_overclaim",
        "mechanism_gap",
        "evidence_path",
    ]:
        assert category in text


def test_index_loads_protocol_rules_before_app():
    html = read("index.html")
    assert "data/protocolRules.js" in html
    assert html.index("data/protocolRules.js") < html.index("app.js")
    assert "local prototype v0.5 / patch 04" in html


def test_app_uses_protocol_analysis_and_renders_prompt_list():
    text = read("app.js")
    assert "function protocolAnalysis" in text
    assert "renderPromptList" in text
    assert "protocolAnalysis: analysis" in text
    assert "No truth verdict • No ranking • No moderation action • No enforcement" in text


def test_patch_status_mentions_patch_04_boundaries():
    text = read("PATCH_STATUS.md")
    assert "PATCH_04_CLARIFY_ONLY_PROTOCOL_PROMPTS" in text
    assert "No enforcement engine" in text
    assert "Local Sydney Protocol clarify-only prompt layer" in text


def test_docs_explain_non_goals():
    text = read("docs/PATCH_04_CLARIFY_ONLY_PROTOCOL_PROMPTS.md")
    assert "does not" in text.lower()
    assert "decide truth" in text
    assert "rank posts" in text
    assert "censor content" in text
