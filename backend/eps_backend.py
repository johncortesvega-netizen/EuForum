"""European Public Square backend MVP.

Public demo ready v1.0 keeps the backend prototype EU-hard-boundary-aware and frontend-connectable while the project is positioned for open demo testing. Direct-harm categories are mapped to human moderation routes, while Sydney Protocol handles THRESHOLD clarification only. The identity posture remains deliberately narrow:
accounts provide display name + country for accountable posting, but the backend
stores conversation records, not hidden profiles, ad profiles, ranking models, or
behavioral personalization.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

APP_VERSION = "1.0-public-demo-ready"
BOUNDARY = "The backend stores conversation records, not hidden profiles."
LOGIN_BOUNDARY = "Minimal login supports accountable posting: display name + country, no hidden profile."
HUMAN_REVIEW_BOUNDARY = "Reports trigger review. Human moderators decide visibility. Serious actions require two-moderator review."
EU_HARD_BOUNDARY_BOUNDARY = "European legal and human-rights categories define the hard floor for direct harm; Sydney Protocol handles THRESHOLD pressure by clarification only."
EVIDENCE_REVIEW_BOUNDARY = "Evidence reviewers add source/context notes. They do not decide truth, guilt, corruption, or legitimacy."
DB_PATH = Path(os.environ.get("EPS_DB_PATH", Path(__file__).resolve().parents[1] / "data" / "eps_local.sqlite3"))

EU_HARD_BOUNDARY_CATEGORIES = [
    "child sexual abuse or exploitation",
    "terrorist content or violent extremism",
    "direct threat or incitement to violence",
    "doxxing or private personal-data exposure",
    "illegal hate speech under applicable law",
    "targeted harassment campaign",
    "illegal harmful instructions",
    "spam or bot flooding",
    "severe safety emergency",
]

SYDNEY_THRESHOLD_EXAMPLES = [
    "strong political claim without evidence",
    "corruption-risk language without sources",
    "propaganda-like framing",
    "pressure language",
    "authority overclaim",
    "mechanism gap",
    "translation caveat",
    "dignity-risk wording that does not meet hard-boundary criteria",
    "escalation risk",
    "repair question needed",
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def stable_hash(*parts: str) -> str:
    payload = "|".join(parts)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]


def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    """Return a PBKDF2 password hash and salt for prototype-local login.

    This is intentionally simple but avoids plaintext passwords. Production use
    should replace this with a reviewed auth provider and stronger operational
    controls.
    """
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120_000)
    return digest.hex(), salt


def verify_password(password: str, password_hash: str, salt: str) -> bool:
    candidate, _ = hash_password(password, salt)
    return hmac.compare_digest(candidate, password_hash)


def hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


@contextmanager
def db_connection(path: Path | None = None):
    path = path or DB_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def row_to_dict(row: sqlite3.Row | None) -> dict[str, Any] | None:
    if row is None:
        return None
    return {key: row[key] for key in row.keys()}


SCHEMA_SQL = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL UNIQUE,
    country TEXT NOT NULL,
    photo_url TEXT DEFAULT NULL,
    role TEXT DEFAULT 'member',
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    token_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    revoked_at TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    language_hint TEXT DEFAULT '',
    prompt_hint TEXT DEFAULT '',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS threads (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES rooms(id),
    user_id TEXT DEFAULT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_country TEXT NOT NULL,
    original_language TEXT NOT NULL,
    shown_language TEXT NOT NULL,
    prompt_label TEXT DEFAULT 'Context prompt',
    views INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL REFERENCES threads(id),
    user_id TEXT DEFAULT NULL REFERENCES users(id),
    author_name TEXT NOT NULL,
    author_country TEXT NOT NULL,
    photo_url TEXT DEFAULT NULL,
    role TEXT DEFAULT 'member',
    original_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    language_label TEXT NOT NULL,
    prompt_text TEXT DEFAULT 'Clarify: context needed before conclusion.',
    visibility_status TEXT DEFAULT 'visible',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS receipts (
    id TEXT PRIMARY KEY,
    post_id TEXT REFERENCES posts(id),
    receipt_type TEXT NOT NULL,
    summary TEXT NOT NULL,
    details_json TEXT NOT NULL,
    boundary TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_threads_room ON threads(room_id);
CREATE INDEX IF NOT EXISTS idx_threads_user ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_thread ON posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_post ON receipts(post_id);


CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id),
    reporter_name TEXT DEFAULT NULL,
    reporter_country TEXT DEFAULT NULL,
    category TEXT NOT NULL,
    note TEXT DEFAULT '',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS review_actions (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id),
    action_type TEXT NOT NULL,
    moderator_name TEXT NOT NULL,
    moderator_country TEXT NOT NULL,
    reviewer_one_name TEXT DEFAULT NULL,
    reviewer_one_country TEXT DEFAULT NULL,
    reviewer_two_name TEXT DEFAULT NULL,
    reviewer_two_country TEXT DEFAULT NULL,
    reason_category TEXT NOT NULL,
    note TEXT DEFAULT '',
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_post ON reports(post_id);
CREATE INDEX IF NOT EXISTS idx_review_actions_post ON review_actions(post_id);

CREATE TABLE IF NOT EXISTS evidence_notes (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id),
    note_type TEXT NOT NULL,
    reviewer_name TEXT NOT NULL,
    reviewer_country TEXT NOT NULL,
    source_label TEXT DEFAULT '',
    note TEXT DEFAULT '',
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_evidence_notes_post ON evidence_notes(post_id);
"""

SEED_ROOMS = [
    ("governance", "Public Square", "Governance & Institutions", "Public decisions, accountability, laws, institutions, and trust.", "NL → EN", "Evidence prompt"),
    ("technology-ai", "Public Square", "Technology & AI", "AI claims, digital tools, platform power, privacy, and safeguards.", "DE → FR", "Boundary note"),
    ("ask-sources", "Context Rooms", "Ask for Sources", "Bring a strong claim and ask others to help find evidence, context, or missing caveats.", "IT → EN", "Strong claim"),
]

SEED_THREADS = [
    {
        "id": "appeal-ai",
        "room_id": "governance",
        "title": "Should public AI systems always show an appeal route?",
        "author_name": "Mira",
        "author_country": "Spain",
        "original_language": "Spanish original",
        "shown_language": "Shown in English",
        "prompt_label": "Human review reminder",
        "posts": [
            {
                "id": "post-appeal-ai-001",
                "author_name": "Mira",
                "author_country": "Spain",
                "role": "member",
                "original_text": "¿Debe todo sistema público de IA mostrar una ruta clara para apelar una decisión?",
                "translated_text": "Should every public AI system show a clear route to appeal a decision?",
                "language_label": "ES → EN",
                "prompt_text": "Clarify: what appeal route exists, who reviews it, and what evidence is visible?",
            }
        ],
    },
    {
        "id": "chatbot-pressure",
        "room_id": "technology-ai",
        "title": "Can a chatbot pressure users without meaning to?",
        "author_name": "Jonas",
        "author_country": "Germany",
        "original_language": "German original",
        "shown_language": "Shown in English",
        "prompt_label": "Pressure prompt",
        "posts": [
            {
                "id": "post-chatbot-pressure-001",
                "author_name": "Jonas",
                "author_country": "Germany",
                "role": "member",
                "original_text": "Wenn ein Bot sagt, dass ich sofort entscheiden muss, ist das Druck oder nur schlechter Text?",
                "translated_text": "If a bot says I must decide immediately, is that pressure or just bad wording?",
                "language_label": "DE → EN",
                "prompt_text": "Clarify: urgency language may reduce freedom to pause; context still needed.",
            }
        ],
    },
]


def ensure_column(conn: sqlite3.Connection, table: str, column: str, column_sql: str) -> None:
    columns = {row["name"] for row in conn.execute(f"PRAGMA table_info({table})").fetchall()}
    if column not in columns:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column_sql}")


def init_db(path: Path | None = None) -> None:
    with db_connection(path) as conn:
        conn.executescript(SCHEMA_SQL)
        # Patch compatibility for older local SQLite files created before Patch 08.
        ensure_column(conn, "threads", "user_id", "user_id TEXT DEFAULT NULL REFERENCES users(id)")
        ensure_column(conn, "posts", "user_id", "user_id TEXT DEFAULT NULL REFERENCES users(id)")

        existing = conn.execute("SELECT COUNT(*) AS count FROM rooms").fetchone()["count"]
        if existing:
            return
        now = utc_now()
        conn.executemany(
            "INSERT INTO rooms (id, category, name, description, language_hint, prompt_hint, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [(room_id, category, name, desc, language, prompt, now) for room_id, category, name, desc, language, prompt in SEED_ROOMS],
        )
        for thread in SEED_THREADS:
            conn.execute(
                """INSERT INTO threads
                (id, room_id, user_id, title, author_name, author_country, original_language, shown_language, prompt_label, views, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    thread["id"], thread["room_id"], None, thread["title"], thread["author_name"], thread["author_country"],
                    thread["original_language"], thread["shown_language"], thread["prompt_label"], 0, now, now,
                ),
            )
            for post in thread["posts"]:
                insert_post(conn, thread["id"], PostCreate(**post), post_id=post["id"], now=now)


def public_user(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": user["id"],
        "display_name": user["display_name"],
        "country": user["country"],
        "photo_url": user.get("photo_url"),
        "role": user.get("role", "member"),
        "boundary": LOGIN_BOUNDARY,
    }


def get_user_by_token(conn: sqlite3.Connection, token: str | None) -> dict[str, Any] | None:
    if not token:
        return None
    token_hash = hash_session_token(token)
    row = conn.execute(
        """SELECT users.* FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.token_hash = ? AND sessions.revoked_at IS NULL""",
        (token_hash,),
    ).fetchone()
    if not row:
        return None
    now = utc_now()
    conn.execute("UPDATE sessions SET last_seen_at = ? WHERE token_hash = ?", (now, token_hash))
    return row_to_dict(row)


def create_receipts_for_post(post_id: str, post: dict[str, Any], now: str) -> list[dict[str, Any]]:
    post_hash = stable_hash(post_id, post.get("author_name", ""), post.get("original_text", ""))
    user_link = "Linked to minimal account identity." if post.get("user_id") else "No account link on this seed/local post."
    receipts = [
        {
            "id": f"id-{post_hash}",
            "post_id": post_id,
            "receipt_type": "identity_display",
            "summary": "Post displays name and country for accountability; photo is optional.",
            "details": [
                f"Display name: {post.get('author_name')}",
                f"Country: {post.get('author_country')}",
                user_link,
                "No address, ID document, birthdate, ad profile, or behavioral score is created by this receipt.",
            ],
            "boundary": "Name and country for accountability. Private life protected.",
            "created_at": now,
        },
        {
            "id": f"post-{post_hash}",
            "post_id": post_id,
            "receipt_type": "post_record",
            "summary": "Conversation record stored so the forum can function.",
            "details": [
                f"Post hash: {post_hash}",
                f"Thread post: {post_id}",
                "This is a forum record, not a hidden second profile.",
            ],
            "boundary": BOUNDARY,
            "created_at": now,
        },
        {
            "id": f"protocol-{post_hash}",
            "post_id": post_id,
            "receipt_type": "protocol_prompt",
            "summary": "Sydney Protocol prompt attached as clarification only.",
            "details": [
                post.get("prompt_text") or "Clarify: context needed before conclusion.",
                "No truth verdict. No ranking. No moderation action. No enforcement.",
            ],
            "boundary": "Sydney Protocol handles THRESHOLD clarification only.",
            "created_at": now,
        },
    ]
    return receipts




def create_evidence_note_receipt(post_id: str, note: dict[str, Any], now: str) -> dict[str, Any]:
    post_hash = stable_hash(post_id, note.get("note_type", ""), note.get("reviewer_name", ""), now)
    return {
        "id": f"evidence-{post_hash}",
        "post_id": post_id,
        "receipt_type": "evidence_note",
        "summary": "Evidence reviewer added a source/context note without a truth verdict.",
        "details": [
            f"Evidence note type: {note.get('note_type')}",
            f"Reviewer: {note.get('reviewer_name')}",
            f"Country: {note.get('reviewer_country')}",
            f"Source/context: {note.get('source_label') or 'No external source attached.'}",
            note.get("note") or "Evidence reviewers add context; they do not decide truth.",
        ],
        "boundary": EVIDENCE_REVIEW_BOUNDARY,
        "created_at": now,
    }


def create_report_receipt(post_id: str, report: dict[str, Any], report_count: int, now: str) -> dict[str, Any]:
    post_hash = stable_hash(post_id, report.get("category", ""), str(report_count))
    return {
        "id": f"report-{post_hash}",
        "post_id": post_id,
        "receipt_type": "user_report",
        "summary": "User report received as a human-review trigger, not as a verdict.",
        "details": [
            f"Report category: {report.get('category')}",
            f"Visible report count for this post: {report_count}",
            "Reports do not prove a violation and do not hide content automatically.",
            "Reports are routed toward accountable human review.",
        ],
        "boundary": "Reports trigger review. They do not decide truth, guilt, visibility, or enforcement.",
        "created_at": now,
    }


def create_review_action_receipt(post_id: str, action: dict[str, Any], now: str) -> dict[str, Any]:
    post_hash = stable_hash(post_id, action.get("action_type", ""), action.get("moderator_name", ""), now)
    details = [
        f"Moderator: {action.get('moderator_name')}",
        f"Country: {action.get('moderator_country')}",
        f"Action: {action.get('action_type')}",
        f"Reason category: {action.get('reason_category')}",
        action.get("note") or "No extra private moderator data is shown.",
    ]
    if action.get("reviewer_one_name") or action.get("reviewer_two_name"):
        details.extend([
            f"Reviewer 1: {action.get('reviewer_one_name')} — {action.get('reviewer_one_country')}",
            f"Reviewer 2: {action.get('reviewer_two_name')} — {action.get('reviewer_two_country')}",
            "Panel review concerns visibility under forum rules, not political truth, guilt, corruption, or legitimacy.",
        ])
    return {
        "id": f"review-{post_hash}",
        "post_id": post_id,
        "receipt_type": "human_review",
        "summary": "Accountable human review recorded with moderator name and country.",
        "details": details,
        "boundary": "EU hard-boundary actions need human moderation; Sydney Protocol handles THRESHOLD clarification only.",
        "created_at": now,
    }
class RegisterPayload(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=80)
    country: str = Field(..., min_length=2, max_length=80)
    password: str = Field(..., min_length=8, max_length=200)
    photo_url: str | None = Field(default=None, max_length=500)


class LoginPayload(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=80)
    password: str = Field(..., min_length=8, max_length=200)


class ReportCreate(BaseModel):
    category: str = Field(..., min_length=2, max_length=120)
    note: str = Field(default="", max_length=1000)
    reporter_name: str | None = Field(default=None, max_length=80)
    reporter_country: str | None = Field(default=None, max_length=80)


class ReviewActionCreate(BaseModel):
    action_type: str = Field(..., min_length=2, max_length=80)
    moderator_name: str = Field(..., min_length=2, max_length=80)
    moderator_country: str = Field(..., min_length=2, max_length=80)
    reason_category: str = Field(..., min_length=2, max_length=120)
    note: str = Field(default="", max_length=1000)
    reviewer_one_name: str | None = Field(default=None, max_length=80)
    reviewer_one_country: str | None = Field(default=None, max_length=80)
    reviewer_two_name: str | None = Field(default=None, max_length=80)
    reviewer_two_country: str | None = Field(default=None, max_length=80)


class EvidenceNoteCreate(BaseModel):
    note_type: str = Field(..., min_length=2, max_length=120)
    reviewer_name: str = Field(..., min_length=2, max_length=80)
    reviewer_country: str = Field(..., min_length=2, max_length=80)
    source_label: str = Field(default="", max_length=500)
    note: str = Field(default="", max_length=1000)


class PostCreate(BaseModel):
    author_name: str | None = Field(default=None, min_length=1, max_length=80)
    author_country: str | None = Field(default=None, min_length=1, max_length=80)
    photo_url: str | None = Field(default=None, max_length=500)
    role: str = Field(default="member", max_length=60)
    original_text: str = Field(..., min_length=1, max_length=8000)
    translated_text: str = Field(..., min_length=1, max_length=8000)
    language_label: str = Field(default="Original", max_length=80)
    prompt_text: str = Field(default="Clarify: context needed before conclusion.", max_length=1000)


class ThreadCreate(BaseModel):
    room_id: str = Field(..., min_length=1, max_length=80)
    title: str = Field(..., min_length=1, max_length=180)
    author_name: str | None = Field(default=None, min_length=1, max_length=80)
    author_country: str | None = Field(default=None, min_length=1, max_length=80)
    original_language: str = Field(default="Original", max_length=80)
    shown_language: str = Field(default="Shown as written", max_length=80)
    prompt_label: str = Field(default="Context prompt", max_length=120)
    original_text: str = Field(..., min_length=1, max_length=8000)
    translated_text: str = Field(..., min_length=1, max_length=8000)
    language_label: str = Field(default="Original", max_length=80)
    prompt_text: str = Field(default="Clarify: context needed before conclusion.", max_length=1000)


def resolve_author(payload: PostCreate | ThreadCreate, user: dict[str, Any] | None) -> dict[str, Any]:
    if user:
        return {
            "user_id": user["id"],
            "author_name": user["display_name"],
            "author_country": user["country"],
            "photo_url": user.get("photo_url"),
            "role": user.get("role", "member"),
        }
    if not payload.author_name or not payload.author_country:
        raise HTTPException(status_code=401, detail="Login required, or provide display name and country for prototype compatibility")
    return {
        "user_id": None,
        "author_name": payload.author_name,
        "author_country": payload.author_country,
        "photo_url": getattr(payload, "photo_url", None),
        "role": getattr(payload, "role", "member"),
    }


def insert_receipts(conn: sqlite3.Connection, receipts: Iterable[dict[str, Any]]) -> None:
    for receipt in receipts:
        conn.execute(
            """INSERT OR REPLACE INTO receipts
            (id, post_id, receipt_type, summary, details_json, boundary, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                receipt["id"], receipt.get("post_id"), receipt["receipt_type"], receipt["summary"],
                json.dumps(receipt.get("details", []), ensure_ascii=False), receipt["boundary"], receipt["created_at"],
            ),
        )


def insert_post(
    conn: sqlite3.Connection,
    thread_id: str,
    post: PostCreate,
    post_id: str | None = None,
    now: str | None = None,
    user: dict[str, Any] | None = None,
) -> dict[str, Any]:
    now = now or utc_now()
    author = resolve_author(post, user)
    post_id = post_id or f"post-{stable_hash(thread_id, author['author_name'], post.original_text, now)}"
    row = {
        "id": post_id,
        "thread_id": thread_id,
        "user_id": author["user_id"],
        "author_name": author["author_name"],
        "author_country": author["author_country"],
        "photo_url": author["photo_url"],
        "role": author["role"],
        "original_text": post.original_text,
        "translated_text": post.translated_text,
        "language_label": post.language_label,
        "prompt_text": post.prompt_text,
        "visibility_status": "visible",
        "created_at": now,
        "updated_at": now,
    }
    conn.execute(
        """INSERT INTO posts
        (id, thread_id, user_id, author_name, author_country, photo_url, role, original_text, translated_text,
         language_label, prompt_text, visibility_status, created_at, updated_at)
        VALUES (:id, :thread_id, :user_id, :author_name, :author_country, :photo_url, :role, :original_text, :translated_text,
                :language_label, :prompt_text, :visibility_status, :created_at, :updated_at)""",
        row,
    )
    conn.execute("UPDATE threads SET updated_at = ? WHERE id = ?", (now, thread_id))
    insert_receipts(conn, create_receipts_for_post(post_id, row, now))
    return row


def fetch_thread(conn: sqlite3.Connection, thread_id: str) -> dict[str, Any] | None:
    thread = row_to_dict(conn.execute("SELECT * FROM threads WHERE id = ?", (thread_id,)).fetchone())
    if not thread:
        return None
    posts = [row_to_dict(row) for row in conn.execute("SELECT * FROM posts WHERE thread_id = ? ORDER BY created_at ASC", (thread_id,)).fetchall()]
    thread["posts"] = posts
    return thread


def make_app(db_path: Path | None = None) -> FastAPI:
    path = db_path or DB_PATH
    init_db(path)
    app = FastAPI(title="European Public Square Backend MVP", version=APP_VERSION)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "version": APP_VERSION, "boundary": BOUNDARY, "login_boundary": LOGIN_BOUNDARY}

    @app.get("/api/policy/eu-hard-boundaries")
    def get_eu_hard_boundary_policy() -> dict[str, Any]:
        return {
            "version": APP_VERSION,
            "boundary": EU_HARD_BOUNDARY_BOUNDARY,
            "hard_boundary_categories": EU_HARD_BOUNDARY_CATEGORIES,
            "sydney_threshold_examples": SYDNEY_THRESHOLD_EXAMPLES,
            "rule": "European hard-boundary floor for direct harm. Sydney Protocol THRESHOLD layer for clarification only.",
            "not_automatic_filtering": True,
        }

    @app.post("/api/auth/register")
    def register(payload: RegisterPayload) -> dict[str, Any]:
        now = utc_now()
        user_id = f"user-{stable_hash(payload.display_name, payload.country, now)}"
        password_hash, password_salt = hash_password(payload.password)
        with db_connection(path) as conn:
            existing = conn.execute("SELECT id FROM users WHERE lower(display_name) = lower(?)", (payload.display_name,)).fetchone()
            if existing:
                raise HTTPException(status_code=409, detail="Display name already exists")
            conn.execute(
                """INSERT INTO users
                (id, display_name, country, photo_url, role, password_hash, password_salt, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (user_id, payload.display_name, payload.country, payload.photo_url, "member", password_hash, password_salt, now, now),
            )
            user = row_to_dict(conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone())
        return {"user": public_user(user), "boundary": LOGIN_BOUNDARY}

    @app.post("/api/auth/login")
    def login(payload: LoginPayload) -> dict[str, Any]:
        now = utc_now()
        with db_connection(path) as conn:
            user = row_to_dict(conn.execute("SELECT * FROM users WHERE lower(display_name) = lower(?)", (payload.display_name,)).fetchone())
            if not user or not verify_password(payload.password, user["password_hash"], user["password_salt"]):
                raise HTTPException(status_code=401, detail="Invalid display name or password")
            token = secrets.token_urlsafe(32)
            session_id = f"session-{stable_hash(user['id'], now, token)}"
            conn.execute(
                "INSERT INTO sessions (id, user_id, token_hash, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?)",
                (session_id, user["id"], hash_session_token(token), now, now),
            )
        return {"token": token, "user": public_user(user), "boundary": LOGIN_BOUNDARY}

    @app.get("/api/auth/me")
    def me(authorization: str | None = Header(default=None)) -> dict[str, Any]:
        token = parse_bearer(authorization)
        with db_connection(path) as conn:
            user = get_user_by_token(conn, token)
            if not user:
                raise HTTPException(status_code=401, detail="Not logged in")
        return {"user": public_user(user), "boundary": LOGIN_BOUNDARY}

    @app.post("/api/auth/logout")
    def logout(authorization: str | None = Header(default=None)) -> dict[str, str]:
        token = parse_bearer(authorization)
        if not token:
            raise HTTPException(status_code=401, detail="Not logged in")
        with db_connection(path) as conn:
            conn.execute("UPDATE sessions SET revoked_at = ? WHERE token_hash = ?", (utc_now(), hash_session_token(token)))
        return {"status": "logged_out", "boundary": LOGIN_BOUNDARY}

    @app.get("/api/users/{user_id}")
    def get_public_user(user_id: str) -> dict[str, Any]:
        with db_connection(path) as conn:
            user = row_to_dict(conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone())
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
        return {"user": public_user(user)}

    @app.get("/api/forums")
    def list_forums() -> dict[str, Any]:
        with db_connection(path) as conn:
            rooms = [row_to_dict(row) for row in conn.execute("SELECT * FROM rooms ORDER BY category, name").fetchall()]
        return {"forums": rooms, "boundary": BOUNDARY}

    @app.get("/api/forums/{room_id}/threads")
    def list_threads(room_id: str) -> dict[str, Any]:
        with db_connection(path) as conn:
            room = row_to_dict(conn.execute("SELECT * FROM rooms WHERE id = ?", (room_id,)).fetchone())
            if not room:
                raise HTTPException(status_code=404, detail="Room not found")
            threads = [row_to_dict(row) for row in conn.execute("SELECT * FROM threads WHERE room_id = ? ORDER BY updated_at DESC", (room_id,)).fetchall()]
        return {"room": room, "threads": threads}

    @app.get("/api/threads/{thread_id}")
    def get_thread(thread_id: str) -> dict[str, Any]:
        with db_connection(path) as conn:
            thread = fetch_thread(conn, thread_id)
            if not thread:
                raise HTTPException(status_code=404, detail="Thread not found")
        return {"thread": thread}

    @app.post("/api/threads")
    def create_thread(payload: ThreadCreate, authorization: str | None = Header(default=None)) -> dict[str, Any]:
        with db_connection(path) as conn:
            user = get_user_by_token(conn, parse_bearer(authorization))
            room = conn.execute("SELECT id FROM rooms WHERE id = ?", (payload.room_id,)).fetchone()
            if not room:
                raise HTTPException(status_code=404, detail="Room not found")
            author = resolve_author(payload, user)
            now = utc_now()
            thread_id = f"thread-{stable_hash(payload.room_id, payload.title, author['author_name'], now)}"
            conn.execute(
                """INSERT INTO threads
                (id, room_id, user_id, title, author_name, author_country, original_language, shown_language, prompt_label, views, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    thread_id, payload.room_id, author["user_id"], payload.title, author["author_name"], author["author_country"],
                    payload.original_language, payload.shown_language, payload.prompt_label, 0, now, now,
                ),
            )
            post = PostCreate(
                author_name=None if user else author["author_name"],
                author_country=None if user else author["author_country"],
                photo_url=None if user else author["photo_url"],
                role=author["role"],
                original_text=payload.original_text,
                translated_text=payload.translated_text,
                language_label=payload.language_label,
                prompt_text=payload.prompt_text,
            )
            insert_post(conn, thread_id, post, now=now, user=user if user else None)
            thread = fetch_thread(conn, thread_id)
        return {"thread": thread, "boundary": BOUNDARY}

    @app.post("/api/threads/{thread_id}/replies")
    def create_reply(thread_id: str, payload: PostCreate, authorization: str | None = Header(default=None)) -> dict[str, Any]:
        with db_connection(path) as conn:
            user = get_user_by_token(conn, parse_bearer(authorization))
            existing = conn.execute("SELECT id FROM threads WHERE id = ?", (thread_id,)).fetchone()
            if not existing:
                raise HTTPException(status_code=404, detail="Thread not found")
            post = insert_post(conn, thread_id, payload, user=user)
        return {"post": post, "boundary": BOUNDARY}


    @app.post("/api/posts/{post_id}/reports")
    def report_post(post_id: str, payload: ReportCreate, authorization: str | None = Header(default=None)) -> dict[str, Any]:
        now = utc_now()
        with db_connection(path) as conn:
            post = row_to_dict(conn.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone())
            if not post:
                raise HTTPException(status_code=404, detail="Post not found")
            user = get_user_by_token(conn, parse_bearer(authorization))
            reporter_name = user["display_name"] if user else payload.reporter_name
            reporter_country = user["country"] if user else payload.reporter_country
            report_id = f"report-{stable_hash(post_id, payload.category, now)}"
            report = {
                "id": report_id,
                "post_id": post_id,
                "reporter_name": reporter_name,
                "reporter_country": reporter_country,
                "category": payload.category,
                "note": payload.note,
                "created_at": now,
            }
            conn.execute(
                """INSERT INTO reports (id, post_id, reporter_name, reporter_country, category, note, created_at)
                VALUES (:id, :post_id, :reporter_name, :reporter_country, :category, :note, :created_at)""",
                report,
            )
            report_count = conn.execute("SELECT COUNT(*) AS count FROM reports WHERE post_id = ?", (post_id,)).fetchone()["count"]
            receipt = create_report_receipt(post_id, report, report_count, now)
            insert_receipts(conn, [receipt])
        return {"report": report, "report_count": report_count, "receipt": receipt, "boundary": HUMAN_REVIEW_BOUNDARY}

    @app.get("/api/review-queue")
    def review_queue() -> dict[str, Any]:
        with db_connection(path) as conn:
            rows = conn.execute(
                """SELECT posts.*, threads.title AS thread_title, COUNT(reports.id) AS report_count
                FROM posts
                JOIN threads ON threads.id = posts.thread_id
                LEFT JOIN reports ON reports.post_id = posts.id
                GROUP BY posts.id
                HAVING report_count > 0 OR posts.visibility_status != 'visible'
                ORDER BY posts.updated_at DESC"""
            ).fetchall()
            queue = [row_to_dict(row) for row in rows]
        return {"queue": queue, "boundary": HUMAN_REVIEW_BOUNDARY}

    @app.post("/api/posts/{post_id}/review-actions")
    def create_review_action(post_id: str, payload: ReviewActionCreate) -> dict[str, Any]:
        now = utc_now()
        with db_connection(path) as conn:
            post = row_to_dict(conn.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone())
            if not post:
                raise HTTPException(status_code=404, detail="Post not found")
            action_id = f"review-{stable_hash(post_id, payload.action_type, payload.moderator_name, now)}"
            action = {
                "id": action_id,
                "post_id": post_id,
                "action_type": payload.action_type,
                "moderator_name": payload.moderator_name,
                "moderator_country": payload.moderator_country,
                "reviewer_one_name": payload.reviewer_one_name,
                "reviewer_one_country": payload.reviewer_one_country,
                "reviewer_two_name": payload.reviewer_two_name,
                "reviewer_two_country": payload.reviewer_two_country,
                "reason_category": payload.reason_category,
                "note": payload.note,
                "created_at": now,
            }
            conn.execute(
                """INSERT INTO review_actions
                (id, post_id, action_type, moderator_name, moderator_country, reviewer_one_name, reviewer_one_country,
                 reviewer_two_name, reviewer_two_country, reason_category, note, created_at)
                VALUES (:id, :post_id, :action_type, :moderator_name, :moderator_country, :reviewer_one_name, :reviewer_one_country,
                        :reviewer_two_name, :reviewer_two_country, :reason_category, :note, :created_at)""",
                action,
            )
            if payload.action_type in {"temporary_hide", "keep_hidden", "restore"}:
                status = "temporarily_hidden" if payload.action_type == "temporary_hide" else ("kept_hidden" if payload.action_type == "keep_hidden" else "visible")
                conn.execute("UPDATE posts SET visibility_status = ?, updated_at = ? WHERE id = ?", (status, now, post_id))
            receipt = create_review_action_receipt(post_id, action, now)
            insert_receipts(conn, [receipt])
        return {"action": action, "receipt": receipt, "boundary": HUMAN_REVIEW_BOUNDARY}


    @app.post("/api/posts/{post_id}/evidence-notes")
    def create_evidence_note(post_id: str, payload: EvidenceNoteCreate) -> dict[str, Any]:
        now = utc_now()
        with db_connection(path) as conn:
            post = row_to_dict(conn.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone())
            if not post:
                raise HTTPException(status_code=404, detail="Post not found")
            note_id = f"evidence-note-{stable_hash(post_id, payload.note_type, payload.reviewer_name, now)}"
            note = {
                "id": note_id,
                "post_id": post_id,
                "note_type": payload.note_type,
                "reviewer_name": payload.reviewer_name,
                "reviewer_country": payload.reviewer_country,
                "source_label": payload.source_label,
                "note": payload.note,
                "created_at": now,
            }
            conn.execute(
                """INSERT INTO evidence_notes
                (id, post_id, note_type, reviewer_name, reviewer_country, source_label, note, created_at)
                VALUES (:id, :post_id, :note_type, :reviewer_name, :reviewer_country, :source_label, :note, :created_at)""",
                note,
            )
            receipt = create_evidence_note_receipt(post_id, note, now)
            insert_receipts(conn, [receipt])
        return {"evidence_note": note, "receipt": receipt, "boundary": EVIDENCE_REVIEW_BOUNDARY}

    @app.get("/api/posts/{post_id}/evidence-notes")
    def get_evidence_notes(post_id: str) -> dict[str, Any]:
        with db_connection(path) as conn:
            post = row_to_dict(conn.execute("SELECT id FROM posts WHERE id = ?", (post_id,)).fetchone())
            if not post:
                raise HTTPException(status_code=404, detail="Post not found")
            rows = conn.execute("SELECT * FROM evidence_notes WHERE post_id = ? ORDER BY created_at ASC", (post_id,)).fetchall()
            notes = [row_to_dict(row) for row in rows]
        return {"post_id": post_id, "evidence_notes": notes, "boundary": EVIDENCE_REVIEW_BOUNDARY}

    @app.get("/api/evidence-notes")
    def list_recent_evidence_notes(limit: int = 30) -> dict[str, Any]:
        limit = max(1, min(100, int(limit)))
        with db_connection(path) as conn:
            rows = conn.execute("SELECT * FROM evidence_notes ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
            notes = [row_to_dict(row) for row in rows]
        return {"evidence_notes": notes, "boundary": EVIDENCE_REVIEW_BOUNDARY}

    @app.get("/api/posts/{post_id}/receipts")
    def get_post_receipts(post_id: str) -> dict[str, Any]:
        with db_connection(path) as conn:
            post = row_to_dict(conn.execute("SELECT id FROM posts WHERE id = ?", (post_id,)).fetchone())
            if not post:
                raise HTTPException(status_code=404, detail="Post not found")
            rows = conn.execute("SELECT * FROM receipts WHERE post_id = ? ORDER BY created_at ASC", (post_id,)).fetchall()
            receipts = []
            for row in rows:
                item = row_to_dict(row)
                item["details"] = json.loads(item.pop("details_json") or "[]")
                receipts.append(item)
        return {"post_id": post_id, "receipts": receipts}

    @app.get("/api/receipts")
    def list_recent_receipts(limit: int = 30) -> dict[str, Any]:
        limit = max(1, min(100, int(limit)))
        with db_connection(path) as conn:
            rows = conn.execute("SELECT * FROM receipts ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
            receipts = []
            for row in rows:
                item = row_to_dict(row)
                item["details"] = json.loads(item.pop("details_json") or "[]")
                receipts.append(item)
        return {"receipts": receipts, "boundary": BOUNDARY}

    return app


def parse_bearer(authorization: str | None) -> str | None:
    if not authorization:
        return None
    prefix = "Bearer "
    if authorization.startswith(prefix):
        return authorization[len(prefix):].strip()
    return None


app = make_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.eps_backend:app", host="127.0.0.1", port=8000, reload=True)
