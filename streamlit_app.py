from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components


ROOT = Path(__file__).parent


def read_text(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def inline_static_assets() -> str:
    html = read_text("index.html")
    css = read_text("styles.css")
    scripts = [
        "data/localData.js",
        "data/protocolRules.js",
        "data/euHardBoundaryMap.js",
        "data/receiptSystem.js",
        "data/reviewPipeline.js",
        "data/evidenceReview.js",
        "data/donationTransparency.js",
        "app.js",
    ]
    html = html.replace('<link rel="stylesheet" href="styles.css" />', f"<style>{css}</style>")
    for script_path in scripts:
        html = html.replace(f'<script src="{script_path}"></script>', f"<script>{read_text(script_path)}</script>")
    return html


st.set_page_config(
    page_title="European Public Square",
    page_icon="EPS",
    layout="wide",
)

st.caption("European Public Square v0.18 - private alpha prototype")
components.html(inline_static_assets(), height=1400, scrolling=True)
