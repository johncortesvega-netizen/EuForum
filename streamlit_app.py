from pathlib import Path
from datetime import datetime, timezone
import json

import feedparser
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


def load_media_sources() -> list[dict]:
    return json.loads(read_text("data/europeanMediaFeeds.json"))


def clean_text(value: str, limit: int = 240) -> str:
    text = " ".join(str(value or "").split())
    if len(text) <= limit:
        return text
    return f"{text[:limit].rstrip()}..."


@st.cache_data(ttl=600, show_spinner=False)
def fetch_media_feed(feed_url: str, source_name: str) -> list[dict]:
    parsed = feedparser.parse(feed_url)
    items = []
    for entry in parsed.entries[:8]:
        items.append(
            {
                "source": source_name,
                "title": clean_text(entry.get("title", "Untitled"), 180),
                "summary": clean_text(entry.get("summary", ""), 260),
                "link": entry.get("link", ""),
                "published": entry.get("published", entry.get("updated", "")),
            }
        )
    return items


def render_european_media_feed() -> None:
    sources = load_media_sources()
    st.subheader("European media feed")
    st.caption(
        "Read-only RSS headlines from European media outlets. No replies here: open the original article and use the outlet's own website/app if you want to read, share, comment, subscribe, or follow their process."
    )

    col_a, col_b = st.columns([0.7, 0.3])
    with col_a:
        selected_sources = st.multiselect(
            "Sources",
            [source["name"] for source in sources],
            default=[source["name"] for source in sources],
        )
    with col_b:
        max_items = st.slider("Items", min_value=5, max_value=40, value=20, step=5)

    if st.button("Refresh RSS now"):
        st.cache_data.clear()
        st.rerun()

    feed_items = []
    source_lookup = {source["name"]: source for source in sources}
    for source_name in selected_sources:
        source = source_lookup[source_name]
        try:
            feed_items.extend(fetch_media_feed(source["feed_url"], source["name"]))
        except Exception as exc:
            st.warning(f"Could not load {source_name}: {exc}")

    feed_items = sorted(feed_items, key=lambda item: item.get("published", ""), reverse=True)[:max_items]
    if not feed_items:
        st.info("No RSS items loaded yet. Try Refresh RSS now or check the feed URLs.")
        return

    for item in feed_items:
        with st.container(border=True):
            st.markdown(f"**{item['title']}**")
            meta = f"{item['source']}"
            if item.get("published"):
                meta += f" · {item['published']}"
            st.caption(meta)
            if item.get("summary"):
                st.write(item["summary"])
            if item.get("link"):
                st.link_button("Open original", item["link"])

    st.caption(
        f"RSS checked at {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}. Feeds are publisher-owned; this prototype shows headlines/excerpts and sends readers to the original outlet."
    )


st.set_page_config(
    page_title="European Public Square",
    page_icon="EPS",
    layout="wide",
)

st.caption("European Public Square v0.18 - public prototype / demo build")

forum_tab, media_tab = st.tabs(["Forum", "Media Feed"])

with forum_tab:
    components.html(inline_static_assets(), height=1400, scrolling=True)

with media_tab:
    render_european_media_feed()
