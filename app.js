// Compatibility boundary phrase: No truth verdict • No enforcement action • No ranking • No moderation action • No enforcement
// Patch 05 receipt boundary phrase: The post is the print. No hidden second profile.
// Patch 06 identity boundary phrase: Name and country for accountability. Private life protected.
// Patch 09 public-good boundary phrase: Donations keep the lights on. They do not buy influence.
// Compatibility boundary phrase exact: No truth verdict • No ranking • No moderation action • No enforcement
// Patch 10 human review phrase: Reports trigger review. Human moderators decide visibility. Serious actions require two-moderator review.
// Patch 11 boundary phrase: European hard-boundary floor plus Sydney Protocol THRESHOLD clarification layer.
// Patch 12+16 phrase: Evidence reviewers add source/context notes, not truth verdicts. Receipts ledger is visible and filterable.
// Patch 15+18 phrase: Backend login connects to frontend; moderators get a review queue page and two-moderator action UI.
// Patch 17+19 phrase: Donation transparency shows mock public spending receipts; appeals are visible, receipted, and buy no influence.
// Patch 20 phrase: Readiness pack prepared controlled testing before the public demo.
// Patch 21 phrase: Prototype smoke test and runbook gate demo sessions before production claims.
// Patch 22 phrase: First test session kit turns readiness into structured demo testing.
// Legacy invariant phrase preserved: Sydney Protocol clarifies only.
const sourceData = window.EPS_LOCAL_DATA || { categories: [], threadsByForum: {} };

const state = {
  categories: structuredCloneSafe(sourceData.categories),
  threadsByForum: structuredCloneSafe(sourceData.threadsByForum),
  postAttempts: [],
  cooldownEndsAt: 0,
  postWindowMs: 30 * 60 * 1000,
  postCooldownMs: 45 * 1000,
  maxPostsPerWindow: 3,
  currentForumId: null,
  currentThreadId: null,
  draftCounter: 1,
  receiptLedger: [],
  selectedReviewPostId: null,
  selectedReceiptFilter: "all",
  apiBaseUrl: "http://127.0.0.1:8000",
  authToken: null,
  currentUser: null,
  backendStatus: "unknown",
  authMessage: "Not connected yet.",
  moderationMessage: "",
};

const dialog = document.getElementById("conceptDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogBody = document.getElementById("dialogBody");
const forumArea = document.getElementById("forumArea");
const searchInput = document.getElementById("searchInput");

function authHeaders() {
  return state.authToken ? { Authorization: `Bearer ${state.authToken}` } : {};
}

async function apiRequest(path, options = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...authHeaders(),
    ...(options.headers || {}),
  };
  const response = await window["fetch"](`${state.apiBaseUrl}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || `Backend request failed: ${response.status}`);
  }
  state.backendStatus = "connected";
  return payload;
}

function mapBackendPost(post = {}) {
  return {
    id: post.id,
    author: post.author_name || post.author || "Unknown",
    country: post.author_country || post.country || "Europe",
    photo: post.photo_url || null,
    role: post.role || "member",
    original: post.original_text || post.original || "",
    translated: post.translated_text || post.translated || post.original_text || "",
    language: post.language_label || post.language || "Original",
    prompt: post.prompt_text || post.prompt || "Clarify: context needed before conclusion.",
    receipt: post.id,
    postHash: post.id,
    receipts: [],
    reviewState: createReviewState(post.id),
    reviewReceipts: [],
  };
}

function mapBackendThread(thread = {}) {
  return {
    id: thread.id,
    title: thread.title,
    author: thread.author_name || "Unknown",
    country: thread.author_country || "Europe",
    originalLanguage: thread.original_language || "Original language",
    shownLanguage: thread.shown_language || "Shown in English",
    updated: thread.updated_at || "backend",
    views: thread.views || 0,
    prompt: thread.prompt_label || "Context prompt",
    posts: (thread.posts || []).map(mapBackendPost),
  };
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char]));
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "draft";
}

function showDialog(title, html) {
  dialogTitle.textContent = title;
  dialogBody.innerHTML = html;
  dialog.showModal();
}

function getForumById(id) {
  for (const category of state.categories) {
    const forum = category.forums.find((item) => item.id === id);
    if (forum) return { forum, category };
  }
  return null;
}

function getThreads(forumId) {
  return state.threadsByForum[forumId] || [];
}

function getThreadById(forumId, threadId) {
  return getThreads(forumId).find((thread) => thread.id === threadId) || null;
}

function countReplies(forumId) {
  return getThreads(forumId).reduce((total, thread) => total + Math.max(0, thread.posts.length - 1), 0);
}

function flattenThreads() {
  return Object.entries(state.threadsByForum).flatMap(([forumId, threads]) =>
    threads.map((thread) => ({ ...thread, forumId, forumName: getForumById(forumId)?.forum.name || forumId }))
  );
}

function prunePostAttempts(now = Date.now()) {
  state.postAttempts = state.postAttempts.filter((time) => now - time < state.postWindowMs);
}

function formatSeconds(ms) {
  return Math.max(0, Math.ceil(ms / 1000));
}

function getPostingStatus(now = Date.now()) {
  prunePostAttempts(now);
  const remaining = Math.max(0, state.maxPostsPerWindow - state.postAttempts.length);
  const cooldownRemainingMs = Math.max(0, state.cooldownEndsAt - now);
  const allowed = remaining > 0 && cooldownRemainingMs === 0;
  let reason = "Ready to post slowly.";
  if (remaining <= 0) reason = "Session posting limit reached. This protects against spam and compulsive posting.";
  else if (cooldownRemainingMs > 0) reason = `Cooldown active: wait ${formatSeconds(cooldownRemainingMs)}s before posting again.`;
  return { allowed, remaining, cooldownRemainingMs, reason };
}

function registerPostAttempt() {
  const status = getPostingStatus();
  if (!status.allowed) return false;
  state.postAttempts.push(Date.now());
  state.cooldownEndsAt = Date.now() + state.postCooldownMs;
  renderLimitMeter();
  updateComposerPostStatus();
  return true;
}

function renderLimitMeter() {
  const status = getPostingStatus();
  const used = state.maxPostsPerWindow - status.remaining;
  const meter = document.getElementById("limitMeter");
  if (!meter) return;
  meter.innerHTML = `
    <div class="meter-bar"><span style="width:${(used / state.maxPostsPerWindow) * 100}%"></span></div>
    <p><strong>${status.remaining}</strong> post${status.remaining === 1 ? "" : "s"} left in this 30-minute demo window.</p>
    <small>${escapeHtml(status.reason)}</small>
  `;
}

function renderAuthPanel() {
  const container = document.getElementById("authPanel");
  if (!container) return;
  if (state.currentUser) {
    container.innerHTML = `
      <div class="auth-user">
        ${renderIdentity({
          name: state.currentUser.display_name,
          country: state.currentUser.country,
          photo: state.currentUser.photo_url,
          role: state.currentUser.role || "member",
        })}
        <small>Current user display comes from backend login. Posting uses this name + country.</small>
        <button class="ghost-btn small-btn" id="logoutBtn" type="button">Log out</button>
      </div>
    `;
    document.getElementById("logoutBtn")?.addEventListener("click", logoutCurrentUser);
    return;
  }
  container.innerHTML = `
    <div class="auth-fields">
      <label>
        <span>Display name</span>
        <input id="authName" type="text" value="Alpha Tester" autocomplete="username" />
      </label>
      <label>
        <span>Country</span>
        <input id="authCountry" type="text" value="Netherlands" autocomplete="country-name" />
      </label>
      <label>
        <span>Password</span>
        <input id="authPassword" type="password" value="alpha-password-123" autocomplete="current-password" />
      </label>
      <div class="auth-actions">
        <button class="ghost-btn small-btn" id="registerBtn" type="button">Register</button>
        <button class="primary-btn small-btn" id="loginBtn" type="button">Log in</button>
      </div>
      <small>${escapeHtml(state.authMessage)}</small>
    </div>
  `;
  document.getElementById("registerBtn")?.addEventListener("click", registerUser);
  document.getElementById("loginBtn")?.addEventListener("click", loginUser);
}

function readAuthForm() {
  return {
    display_name: (document.getElementById("authName")?.value || "").trim(),
    country: (document.getElementById("authCountry")?.value || "").trim(),
    password: document.getElementById("authPassword")?.value || "",
  };
}

async function registerUser() {
  const form = readAuthForm();
  try {
    await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(form),
    });
    state.authMessage = "Registered. You can log in now.";
  } catch (error) {
    state.authMessage = error.message;
  }
  renderAuthPanel();
}

async function loginUser() {
  const form = readAuthForm();
  try {
    const result = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ display_name: form.display_name, password: form.password }),
    });
    state.authToken = result.token;
    state.currentUser = result.user;
    state.authMessage = "Logged in for this page session.";
  } catch (error) {
    state.authMessage = error.message;
  }
  renderAuthPanel();
  updateComposerIdentityFields();
}

async function logoutCurrentUser() {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
  } catch (error) {
    state.authMessage = error.message;
  }
  state.authToken = null;
  state.currentUser = null;
  state.authMessage = "Logged out. Token cleared from page memory.";
  renderAuthPanel();
  updateComposerIdentityFields();
}

function updateComposerIdentityFields() {
  const name = document.getElementById("draftName");
  const country = document.getElementById("draftCountry");
  if (!name || !country || !state.currentUser) return;
  name.value = state.currentUser.display_name;
  country.value = state.currentUser.country;
  name.disabled = true;
  country.disabled = true;
  previewDraftReceipt("Logged-in identity preview. Posting uses backend display name + country.");
}

function updateComposerPostStatus() {
  const button = document.getElementById("demoPostBtn");
  const note = document.getElementById("composerLimitNote");
  if (!button && !note) return;
  const status = getPostingStatus();
  const pauseChecked = document.getElementById("pauseCheck")?.checked || false;
  if (button) {
    button.disabled = !status.allowed || !pauseChecked;
    button.textContent = status.allowed ? button.dataset.readyLabel : status.reason;
  }
  if (note) {
    note.innerHTML = `
      <strong>Slow-posting status:</strong> ${escapeHtml(status.reason)}<br />
      ${status.remaining} post${status.remaining === 1 ? "" : "s"} left in this 30-minute demo window. The pause checkbox is required before posting.
    `;
  }
}


function receiptSystem() {
  return window.EPS_RECEIPTS || null;
}

function donationTransparency() {
  return window.EPS_DONATION_TRANSPARENCY || { MONTHLY_COSTS: [], PUBLIC_SPENDING_RECEIPTS: [], SUMMARY: {} };
}

function reviewPipeline() {
  return window.EPS_REVIEW_PIPELINE || null;
}

function evidenceReview() {
  return window.EPS_EVIDENCE_REVIEW || null;
}

function boundaryMap() {
  return window.EPS_EU_HARD_BOUNDARY_MAP || null;
}

function createReviewState(postId) {
  const pipeline = reviewPipeline();
  const base = pipeline && typeof pipeline.createReviewState === "function"
    ? pipeline.createReviewState(postId)
    : { postId, reportCount: 0, reports: [], status: "visible", queueStatus: "none", receipts: [], appealAvailable: false };
  if (!Array.isArray(base.appeals)) base.appeals = [];
  if (!base.appealStatus) base.appealStatus = "none";
  return base;
}

function publicReviewSummary(reviewState) {
  const pipeline = reviewPipeline();
  if (pipeline && typeof pipeline.publicReviewSummary === "function") return pipeline.publicReviewSummary(reviewState);
  if (!reviewState) return "No human review activity.";
  if (reviewState.status === "temporarily_hidden") return "Temporarily hidden pending human review.";
  if (reviewState.reportCount > 0) return "Reports received as review triggers.";
  return "No human review activity.";
}

function createReceiptBundleForDraft({ title, body, language, analysis, identity = {} }) {
  const receipts = receiptSystem();
  if (receipts && typeof receipts.createReceiptBundle === "function") {
    return receipts.createReceiptBundle({ text: body, title, language, analysis, identity });
  }
  const postHash = simpleHash(`${title}|${language}|${body}`);
  return {
    postHash,
    receipts: [{
      id: `fallback-receipt-${postHash}`,
      type: "fallback",
      summary: "Fallback receipt created because receipt system was not loaded.",
      boundary: "No truth verdict. No hidden profile.",
      details: ["Receipt system unavailable."],
      privacyNote: "No hidden second profile."
    }]
  };
}

function pushReceipts(receipts) {
  const list = Array.isArray(receipts) ? receipts : [];
  if (!list.length) return;
  state.receiptLedger = [...list, ...state.receiptLedger].slice(0, 16);
  renderReceiptLedger();
}

function renderReceiptCards(receipts = []) {
  if (!receipts.length) return `<p>No receipts attached in this local view.</p>`;
  return `
    <div class="receipt-card-list">
      ${receipts.map((receipt) => `
        <article class="receipt-card-mini">
          <div class="receipt-card-head">
            <span class="receipt-type">${escapeHtml(receipt.type || "receipt")}</span>
            <code>${escapeHtml(receipt.id || "no-id")}</code>
          </div>
          <p><strong>${escapeHtml(receipt.summary || "Visible receipt")}</strong></p>
          <ul>
            ${(receipt.details || []).slice(0, 4).map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}
          </ul>
          <small>${escapeHtml(receipt.boundary || "Receipt-first reviewability.")}</small>
          <small>${escapeHtml(receipt.privacyNote || "No hidden second profile.")}</small>
        </article>
      `).join("")}
    </div>
  `;
}


function renderEvidenceNotes(notes = []) {
  if (!notes.length) return `<small>No evidence-review notes yet. Evidence reviewers add context; they do not decide truth.</small>`;
  return `
    <div class="evidence-note-list">
      ${notes.map((note) => `
        <article class="evidence-note-card">
          <div class="receipt-card-head">
            <span class="receipt-type">${escapeHtml(note.label || note.type || "evidence note")}</span>
            <code>${escapeHtml(note.id || "local-note")}</code>
          </div>
          <p><strong>${escapeHtml(note.summary || "Evidence/context note")}</strong></p>
          <p>${escapeHtml(note.note || note.prompt || "Context note added for human review.")}</p>
          <small>Reviewer: ${escapeHtml(note.reviewerName || "Evidence reviewer")} • ${escapeHtml(note.reviewerCountry || "Europe")}</small>
          <small>Source/context: ${escapeHtml(note.source || "No external source attached in local prototype.")}</small>
          <small>${escapeHtml(note.boundary || "Evidence reviewers add context, not truth verdicts.")}</small>
        </article>
      `).join("")}
    </div>
  `;
}

function allPostsWithEvidenceNotes() {
  const posts = [];
  for (const [forumId, threads] of Object.entries(state.threadsByForum)) {
    for (const thread of threads) {
      thread.posts.forEach((post, index) => {
        ensurePostMeta(post, forumId, thread.id, index);
        if ((post.evidenceNotes || []).length) posts.push({ forumId, threadId: thread.id, threadTitle: thread.title, post });
      });
    }
  }
  return posts;
}

function renderReceiptLedger() {
  const container = document.getElementById("receiptLedger");
  if (!container) return;
  const placeholder = receiptSystem()?.createDonationPlaceholderReceipt?.();
  const baseReceipts = state.receiptLedger.length ? state.receiptLedger : [placeholder].filter(Boolean);
  const filter = state.selectedReceiptFilter || "all";
  const receipts = filter === "all" ? baseReceipts : baseReceipts.filter((receipt) => receipt.type === filter || receipt.receipt_type === filter);
  const types = [...new Set(baseReceipts.map((receipt) => receipt.type || receipt.receipt_type || "receipt"))].sort();
  container.innerHTML = `
    <div class="ledger-filter-row">
      <button class="ghost-btn small-btn ${filter === "all" ? "active-filter" : ""}" type="button" data-ledger-filter="all">All</button>
      ${types.map((type) => `<button class="ghost-btn small-btn ${filter === type ? "active-filter" : ""}" type="button" data-ledger-filter="${escapeHtml(type)}">${escapeHtml(type)}</button>`).join("")}
    </div>
    ${(receipts.length ? receipts : []).slice(0, 8).map((receipt) => `
      <article class="ledger-row">
        <strong>${escapeHtml(receipt.type || receipt.receipt_type || "receipt")}</strong>
        <span>${escapeHtml(receipt.summary || "Visible receipt")}</span>
        <code>${escapeHtml(receipt.id || "no-id")}</code>
      </article>
    `).join("") || `<p class="mini-stat">No receipts match this filter.</p>`}
    <button class="ghost-btn small-btn ledger-open-btn" id="openReceiptLedgerBtn" type="button">Open full ledger</button>
  `;
  container.querySelectorAll("[data-ledger-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedReceiptFilter = button.dataset.ledgerFilter;
      renderReceiptLedger();
    });
  });
  container.querySelector("#openReceiptLedgerBtn")?.addEventListener("click", showFullReceiptLedger);
}

function showFullReceiptLedger() {
  const receipts = state.receiptLedger.length
    ? state.receiptLedger
    : [receiptSystem()?.createDonationPlaceholderReceipt?.()].filter(Boolean);
  const types = [...new Set(receipts.map((receipt) => receipt.type || receipt.receipt_type || "receipt"))].sort();
  showDialog("Receipts ledger", `
    <p><strong>Purpose:</strong> Receipts make visible forum actions reviewable. They are not hidden behavioral profiles, ad profiles, rankings, or truth verdicts.</p>
    <p><strong>Available receipt types:</strong> ${types.map(escapeHtml).join(", ") || "none yet"}</p>
    ${renderReceiptCards(receipts)}
    <p><small>Evidence notes, reports, moderation actions, translation notes, protocol prompts, donation placeholders, and post records remain separate receipt types.</small></p>
  `);
}

function protocolAnalysis(text) {
  if (window.EPS_PROTOCOL && typeof window.EPS_PROTOCOL.analyzeProtocol === "function") {
    return window.EPS_PROTOCOL.analyzeProtocol(text);
  }
  return {
    engine: "fallback clarify-only prompt layer",
    version: "fallback",
    decisionBoundary: "Clarify only. No truth verdict. No enforcement.",
    prompts: [{
      id: "context_prompt",
      label: "Context prompt",
      category: "context",
      severity: "clarify",
      prompt: "No protocol engine loaded — human context still matters.",
      explanation: "The local prompt layer was not available.",
      boundary: "No prompt is not approval, safety certification, or truth validation.",
      matches: [],
      traces: [],
      quoteContext: false,
      quoteContextNote: "No quote/example context checked."
    }]
  };
}

function protocolPreview(text) {
  return protocolAnalysis(text).prompts.map((item) => item.prompt);
}

function selectPrimaryPrompt(analysisOrPrompts) {
  const prompts = Array.isArray(analysisOrPrompts) ? analysisOrPrompts : analysisOrPrompts.prompts;
  const first = prompts?.[0];
  if (!first) return "Context prompt";
  if (typeof first === "string") {
    if (first.startsWith("Strong integrity")) return "Evidence prompt";
    if (first.startsWith("Pressure")) return "Pressure prompt";
    if (first.startsWith("Dignity")) return "Dignity prompt";
    if (first.startsWith("Evidence path")) return "Evidence path";
    return "Context prompt";
  }
  return first.label || "Context prompt";
}

function renderPromptList(analysis) {
  const prompts = analysis.prompts || [];
  return `
    <div class="signal-list">
      ${prompts.map((item) => `
        <article class="signal-card">
          <div class="signal-card-head">
            <span class="prompt-badge">◇ ${escapeHtml(item.label)}</span>
            <span class="mini-stat">${escapeHtml(item.category)}</span>
          </div>
          <p><strong>${escapeHtml(item.prompt)}</strong></p>
          <p>${escapeHtml(item.explanation)}</p>
          <small>${escapeHtml(item.boundary)}</small>
          ${item.matches?.length ? `<small>Matched terms: ${item.matches.map(escapeHtml).join(", ")}</small>` : ""}
          ${item.quoteContext ? `<small>${escapeHtml(item.quoteContextNote)}</small>` : ""}
        </article>
      `).join("")}
    </div>
  `;
}

function simpleHash(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `demo-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function languageToCode(language) {
  const map = {
    "English": "EN",
    "Dutch / Nederlands": "NL → EN",
    "French": "FR → EN",
    "German": "DE → EN",
    "Spanish": "ES → EN",
    "Polish": "PL → EN",
    "Italian": "IT → EN",
    "Portuguese": "PT → EN",
  };
  return map[language] || "Unknown → EN";
}

function normalizedIdentity({ name, country, photo = null, role = "member" } = {}) {
  return {
    name: (name || "Local demo user").trim() || "Local demo user",
    country: (country || "Europe").trim() || "Europe",
    photo: photo || null,
    role: role || "member",
  };
}

function ensurePostMeta(post, forumId = "forum", threadId = "thread", index = 0) {
  if (!post.id) {
    post.id = `post-${simpleHash(`${forumId}|${threadId}|${index}|${post.author || "unknown"}|${post.original || ""}`)}`;
  }
  if (!post.postHash) post.postHash = post.receipt || post.id;
  if (!Array.isArray(post.evidenceNotes)) post.evidenceNotes = [];
  if (!Array.isArray(post.evidenceReceipts)) post.evidenceReceipts = [];
  if (!post.reviewState) post.reviewState = createReviewState(post.id);
  if (!Array.isArray(post.reviewState.appeals)) post.reviewState.appeals = [];
  if (!post.reviewState.appealStatus) post.reviewState.appealStatus = "none";
  if (!Array.isArray(post.reviewReceipts)) post.reviewReceipts = [];
  return post;
}

function findPostById(postId) {
  for (const [forumId, threads] of Object.entries(state.threadsByForum)) {
    for (const thread of threads) {
      for (let index = 0; index < thread.posts.length; index += 1) {
        const post = ensurePostMeta(thread.posts[index], forumId, thread.id, index);
        if (post.id === postId) return { forumId, thread, post, index };
      }
    }
  }
  return null;
}

function allPostsWithReview() {
  const posts = [];
  for (const [forumId, threads] of Object.entries(state.threadsByForum)) {
    for (const thread of threads) {
      thread.posts.forEach((post, index) => {
        ensurePostMeta(post, forumId, thread.id, index);
        if ((post.reviewState?.reportCount || 0) > 0 || post.reviewState?.queueStatus !== "none" || post.reviewState?.status !== "visible") {
          posts.push({ forumId, threadId: thread.id, threadTitle: thread.title, post });
        }
      });
    }
  }
  return posts;
}

function renderIdentity(identity = {}) {
  const person = normalizedIdentity({
    name: identity.name || identity.author,
    country: identity.country,
    photo: identity.photo,
    role: identity.role,
  });
  const initials = person.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "?";
  const avatar = person.photo
    ? `<img src="${escapeHtml(person.photo)}" alt="" class="identity-avatar-img" />`
    : `<span class="identity-avatar-placeholder" aria-hidden="true">${escapeHtml(initials)}</span>`;
  return `
    <div class="identity-line">
      <span class="identity-avatar">${avatar}</span>
      <span>
        <strong>${escapeHtml(person.name)}</strong>
        <small>${escapeHtml(person.country)} • ${escapeHtml(person.role)} • photo optional</small>
      </span>
    </div>
  `;
}

function renderForums(query = "") {
  state.currentForumId = null;
  state.currentThreadId = null;
  const q = query.trim().toLowerCase();
  const filtered = state.categories
    .map((category) => ({
      ...category,
      forums: category.forums.filter((forum) => {
        const threads = getThreads(forum.id);
        const threadText = threads.map((thread) => `${thread.title} ${thread.author}`).join(" ");
        const haystack = `${forum.name} ${forum.desc} ${threadText}`.toLowerCase();
        return !q || haystack.includes(q);
      }),
    }))
    .filter((category) => category.forums.length > 0);

  if (!filtered.length) {
    forumArea.innerHTML = `<div class="empty-state">No rooms matched your search.</div>`;
    return;
  }

  forumArea.innerHTML = filtered.map((category) => `
    <article class="category">
      <header class="category-head">
        <div>
          <h2>${escapeHtml(category.title)}</h2>
          <p>${escapeHtml(category.description)}</p>
        </div>
      </header>
      ${category.forums.map((forum) => {
        const threads = getThreads(forum.id);
        const latestThread = threads[0];
        const threadCount = threads.length;
        const replyCount = countReplies(forum.id);
        return `
          <div class="forum-row">
            <div class="forum-main">
              <div class="forum-icon" aria-hidden="true">□</div>
              <div>
                <button type="button" data-open-forum="${escapeHtml(forum.id)}">${escapeHtml(forum.name)} <span aria-hidden="true">›</span></button>
                <p>${escapeHtml(forum.desc)}</p>
              </div>
            </div>
            <div class="latest-box">
              <strong title="${escapeHtml(latestThread?.title || "No threads yet")}">${escapeHtml(latestThread?.title || "No threads yet")}</strong>
              <span>${escapeHtml(latestThread?.updated || "no activity yet")}</span>
            </div>
            <span class="lang-badge">${escapeHtml(forum.lang)}</span>
            <span class="prompt-badge">◇ ${escapeHtml(forum.prompt)}</span>
            <div class="stats">
              <span><strong>${threadCount.toLocaleString()}</strong> threads</span>
              <span><strong>${replyCount.toLocaleString()}</strong> replies</span>
            </div>
          </div>
        `;
      }).join("")}
    </article>
  `).join("");

  forumArea.querySelectorAll("[data-open-forum]").forEach((button) => {
    button.addEventListener("click", () => renderThreadList(button.dataset.openForum));
  });
}

function renderThreadList(forumId) {
  state.currentForumId = forumId;
  state.currentThreadId = null;
  const found = getForumById(forumId);
  if (!found) return renderForums();
  const { forum } = found;
  const threads = getThreads(forumId);

  forumArea.innerHTML = `
    <article class="category">
      <header class="category-head category-head-row">
        <div>
          <button class="back-link" type="button" data-home>← Square</button>
          <h2>${escapeHtml(forum.name)}</h2>
          <p>${escapeHtml(forum.desc)}</p>
        </div>
        <button class="light-btn" type="button" data-compose-forum="${escapeHtml(forumId)}">+ New thread here</button>
      </header>
      <div class="memory-note">
        Local prototype: room/thread data is loaded from <code>data/localData.js</code>. New drafts exist in browser memory only until refresh.
      </div>
      <div class="thread-list">
        ${threads.map((thread) => `
          <button class="thread-row" type="button" data-open-thread="${escapeHtml(thread.id)}">
            <div>
              <strong>${escapeHtml(thread.title)}</strong>
              <p>${escapeHtml(thread.author)}${thread.country ? ` • ${escapeHtml(thread.country)}` : ""} • ${escapeHtml(thread.originalLanguage)} • ${escapeHtml(thread.shownLanguage)}</p>
            </div>
            <span class="prompt-badge">◇ ${escapeHtml(thread.prompt)}</span>
            <span class="mini-stat">${Math.max(0, thread.posts.length - 1)} replies</span>
            <span class="mini-stat">${thread.views} views</span>
            <span class="mini-stat">${escapeHtml(thread.updated)}</span>
          </button>
        `).join("")}
      </div>
    </article>
  `;

  forumArea.querySelector("[data-home]").addEventListener("click", () => renderForums(searchInput.value));
  forumArea.querySelector("[data-compose-forum]").addEventListener("click", () => renderComposer(forumId));
  forumArea.querySelectorAll("[data-open-thread]").forEach((button) => {
    button.addEventListener("click", () => renderThread(forumId, button.dataset.openThread));
  });
}

function renderThread(forumId, threadId) {
  state.currentForumId = forumId;
  state.currentThreadId = threadId;
  const found = getForumById(forumId);
  const thread = getThreadById(forumId, threadId);
  if (!found || !thread) return renderThreadList(forumId);

  forumArea.innerHTML = `
    <article class="category">
      <header class="category-head category-head-row">
        <div>
          <button class="back-link" type="button" data-back-forum>← ${escapeHtml(found.forum.name)}</button>
          <h2>${escapeHtml(thread.title)}</h2>
          <p>${escapeHtml(thread.author)}${thread.country ? ` • ${escapeHtml(thread.country)}` : ""} • ${escapeHtml(thread.originalLanguage)} • ${escapeHtml(thread.shownLanguage)}</p>
        </div>
        <button class="light-btn" type="button" data-reply-thread>Reply with clarification</button>
      </header>
      <section class="thread-view">
        ${thread.posts.map((post, index) => renderPost(ensurePostMeta(post, forumId, threadId, index))).join("")}
      </section>
    </article>
  `;

  wirePostReviewButtons();
  forumArea.querySelector("[data-back-forum]").addEventListener("click", () => renderThreadList(forumId));
  forumArea.querySelector("[data-reply-thread]").addEventListener("click", () => renderComposer(forumId, threadId));
}

function renderPost(post) {
  const reviewState = post.reviewState || createReviewState(post.id || post.postHash);
  const isHidden = reviewState.status === "temporarily_hidden" || reviewState.status === "kept_hidden";
  const reviewReceipts = [...(post.reviewReceipts || []), ...(reviewState.receipts || [])];
  const evidenceNotes = post.evidenceNotes || [];
  const evidenceReceipts = post.evidenceReceipts || [];
  const reportCount = reviewState.reportCount || 0;
  const reviewSummary = publicReviewSummary(reviewState);
  const appealStatus = reviewState.appealStatus && reviewState.appealStatus !== "none" ? reviewState.appealStatus : "";
  return `
    <article class="post-card ${isHidden ? "post-card-hidden" : ""}">
      <div class="post-head">
        ${renderIdentity({ name: post.author, country: post.country, photo: post.photo, role: post.role })}
        <span class="lang-badge">${escapeHtml(post.language)}</span>
      </div>
      ${isHidden ? `
        <div class="visibility-limited">
          <strong>Temporarily limited visibility</strong>
          <p>This local demo models a human moderation action. The Sydney Protocol did not hide this post. A two-moderator review and appeal path are required for serious actions.</p>
        </div>
      ` : ""}
      <div class="post-columns">
        <div>
          <h4>Original</h4>
          <p>${escapeHtml(post.original)}</p>
        </div>
        <div>
          <h4>Reader language</h4>
          <p>${escapeHtml(post.translated)}</p>
        </div>
      </div>
      <div class="review-strip">
        <div>
          <strong>Human review status</strong>
          <span>${escapeHtml(reviewSummary)}</span>
        </div>
        <div class="review-actions-inline">
          <span class="mini-stat">${reportCount} report${reportCount === 1 ? "" : "s"}</span>
          <button class="ghost-btn small-btn" type="button" data-report-post="${escapeHtml(post.id)}">Report for review</button>
          <button class="ghost-btn small-btn" type="button" data-open-review="${escapeHtml(post.id)}">Review flow</button>
          ${reviewState.appealAvailable ? `<button class="ghost-btn small-btn" type="button" data-open-appeal="${escapeHtml(post.id)}">${appealStatus ? "View appeal" : "Appeal"}</button>` : ""}
          <button class="ghost-btn small-btn" type="button" data-add-evidence="${escapeHtml(post.id)}">Add evidence note</button>
        </div>
        ${appealStatus ? `<small>Appeal status: ${escapeHtml(appealStatus)}</small>` : ""}
      </div>
      <div class="receipt-box">
        <strong>Visible receipts — post, translation, protocol prompts, human review</strong>
        <p>${escapeHtml(post.prompt)}</p>
        ${post.protocolAnalysis ? renderPromptList(post.protocolAnalysis) : ""}
        <div class="evidence-section"><strong>Evidence reviewer notes</strong>${renderEvidenceNotes(evidenceNotes)}</div>
        ${renderReceiptCards(post.receipts || [])}
        ${evidenceReceipts.length ? renderReceiptCards(evidenceReceipts) : `<small>No evidence-note receipts yet. Evidence reviewers add source/context notes without truth verdicts.</small>`}
        ${reviewReceipts.length ? renderReceiptCards(reviewReceipts) : `<small>No human-review receipts yet. Reports trigger review; they do not decide.</small>`}
        <small>Legacy receipt/hash: ${escapeHtml(post.receipt || post.postHash || "local-only")} • The post is the print • No hidden second profile • Sydney Protocol handles THRESHOLD clarification only • EU hard-boundary actions need human moderation.</small>
      </div>
    </article>
  `;
}

function renderComposer(forumId = state.currentForumId, threadId = state.currentThreadId) {
  const status = getPostingStatus();
  const readyLabel = threadId
    ? (state.currentUser ? "Add reply with login" : "Add reply locally")
    : (state.currentUser ? "Create thread with login" : "Create thread locally");
  const identityName = state.currentUser?.display_name || "Local demo user";
  const identityCountry = state.currentUser?.country || "Europe";
  const identityLocked = state.currentUser ? "disabled" : "";

  forumArea.innerHTML = `
    <article class="category">
      <header class="category-head category-head-row">
        <div>
          <button class="back-link" type="button" data-cancel-compose>← Back</button>
          <h2>${threadId ? "Reply with clarification" : "New thread draft"}</h2>
          <p>${state.currentUser ? "Logged-in drafts can post to the backend. Receipts remain visible review records, not hidden profiles." : "Drafts are local-only until you log in. Receipts are visible review records in page memory, not hidden profiles or server storage."}</p>
        </div>
      </header>
      <section class="composer">
        <div class="identity-notice">
          <strong>Accountable posting model</strong>
          <p>Every post shows name and country for accountability. ${state.currentUser ? "Your backend login supplies those fields for posting." : "Without login, this remains a local demo identity."} Photo is optional.</p>
        </div>
        <div class="composer-grid identity-grid">
          <label>
            <span>Display name</span>
            <input id="draftName" type="text" value="${escapeHtml(identityName)}" placeholder="Name shown on post" ${identityLocked} />
          </label>
          <label>
            <span>Country</span>
            <input id="draftCountry" type="text" value="${escapeHtml(identityCountry)}" placeholder="Country shown on post" ${identityLocked} />
          </label>
        </div>
        <div class="composer-grid">
          <label>
            <span>Title</span>
            <input id="draftTitle" type="text" value="${threadId ? "Reply: clarify before reacting" : ""}" placeholder="Thread title" ${threadId ? "disabled" : ""} />
          </label>
          <label>
            <span>Language</span>
            <select id="draftLang">
              <option>English</option>
              <option>Dutch / Nederlands</option>
              <option>French</option>
              <option>German</option>
              <option>Spanish</option>
              <option>Polish</option>
              <option>Italian</option>
              <option>Portuguese</option>
            </select>
          </label>
        </div>
        <label>
          <span>Post text</span>
          <textarea id="draftBody" rows="8" placeholder="Write in your language. The original remains the primary record."></textarea>
        </label>
        <div class="composer-actions">
          <button class="ghost-btn" type="button" id="previewReceiptBtn">Preview receipt</button>
          <button class="primary-btn" type="button" id="demoPostBtn" data-ready-label="${escapeHtml(readyLabel)}" ${status.allowed ? "" : "disabled"}>${escapeHtml(readyLabel)}</button>
        </div>
        <label class="pause-check">
          <input id="pauseCheck" type="checkbox" />
          <span>I paused, checked context/evidence, and understand this is not urgent posting.</span>
        </label>
        <div class="note blue" id="composerLimitNote">
          <strong>Slow-posting status:</strong> ${escapeHtml(status.reason)}<br />
          ${status.remaining} post${status.remaining === 1 ? "" : "s"} left in this 30-minute demo window. The pause checkbox is required before posting.
        </div>
        <div class="clarity-checklist" aria-label="Pre-post checklist">
          <strong>Before posting</strong>
          <ul>
            <li>Can someone ask for evidence without being attacked?</li>
            <li>Does the post preserve the original language/context?</li>
            <li>Is the Sydney Protocol prompt clarifying only?</li>
          </ul>
        </div>
        <div id="receiptPreview" class="receipt-preview"></div>
      </section>
    </article>
  `;

  forumArea.querySelector("[data-cancel-compose]").addEventListener("click", () => {
    if (threadId) renderThread(forumId, threadId);
    else if (forumId) renderThreadList(forumId);
    else renderForums(searchInput.value);
  });

  document.getElementById("previewReceiptBtn").addEventListener("click", previewDraftReceipt);
  document.getElementById("demoPostBtn").addEventListener("click", () => submitDraft(forumId, threadId));
  document.getElementById("pauseCheck").addEventListener("change", updateComposerPostStatus);
  document.getElementById("draftBody").addEventListener("input", () => previewDraftReceipt("Live receipt preview. Not stored."));
  document.getElementById("draftTitle").addEventListener("input", () => previewDraftReceipt("Live receipt preview. Not stored."));
  document.getElementById("draftName").addEventListener("input", () => previewDraftReceipt("Live identity/receipt preview. Not stored."));
  document.getElementById("draftCountry").addEventListener("input", () => previewDraftReceipt("Live identity/receipt preview. Not stored."));
  previewDraftReceipt("Draft receipt preview. Not stored.");
  updateComposerPostStatus();
}

function previewDraftReceipt(status = "Draft receipt preview. Not stored.") {
  const title = document.getElementById("draftTitle")?.value || "Untitled";
  const body = document.getElementById("draftBody")?.value || "";
  const language = document.getElementById("draftLang")?.value || "Unknown";
  const identity = normalizedIdentity({
    name: document.getElementById("draftName")?.value,
    country: document.getElementById("draftCountry")?.value,
  });
  const analysis = protocolAnalysis(`${title} ${body}`);
  const bundle = createReceiptBundleForDraft({ title, body, language, analysis, identity });
  const target = document.getElementById("receiptPreview");
  target.innerHTML = `
    <div class="receipt-box large">
      <strong>Receipt preview — visible, local, clarify-only</strong>
      <p>${escapeHtml(status)}</p>
      ${renderPromptList(analysis)}
      ${renderReceiptCards(bundle.receipts)}
      <small>Post hash: ${escapeHtml(bundle.postHash)} • Name shown: ${escapeHtml(identity.name)} • Country shown: ${escapeHtml(identity.country)} • Language: ${escapeHtml(language)} • ${escapeHtml(analysis.decisionBoundary)}</small>
      <small>Name and country are for accountability. Photo is optional. No address, ID document, political profile, ad profile, or hidden behavioral score is created.</small>
    </div>
  `;
}

async function submitDraft(forumId, threadId) {
  const titleInput = document.getElementById("draftTitle");
  const bodyInput = document.getElementById("draftBody");
  const languageInput = document.getElementById("draftLang");
  const identity = normalizedIdentity({
    name: document.getElementById("draftName")?.value,
    country: document.getElementById("draftCountry")?.value,
  });
  const title = (titleInput?.value || "").trim();
  const body = (bodyInput?.value || "").trim();
  const language = languageInput?.value || "English";

  if (!forumId) {
    previewDraftReceipt("Choose a room first. This prototype keeps new threads inside a selected forum.");
    return;
  }
  if (!body) {
    previewDraftReceipt("Write post text before adding it locally.");
    return;
  }
  if (!threadId && !title) {
    previewDraftReceipt("Add a thread title before creating a local thread.");
    return;
  }
  if (!document.getElementById("pauseCheck")?.checked) {
    previewDraftReceipt("Pause step missing. This forum is designed against impulsive and addictive posting.");
    updateComposerPostStatus();
    return;
  }
  if (!registerPostAttempt()) {
    previewDraftReceipt(getPostingStatus().reason);
    return;
  }

  if (state.currentUser && state.authToken) {
    try {
      await submitBackendDraft({ forumId, threadId, title, body, language });
      return;
    } catch (error) {
      previewDraftReceipt(`Backend posting failed: ${error.message}. Keeping the draft available for local fallback.`);
      return;
    }
  }

  const analysis = protocolAnalysis(`${title} ${body}`);
  const promptLabel = selectPrimaryPrompt(analysis);
  const bundle = createReceiptBundleForDraft({ title, body, language, analysis, identity });
  const receipt = bundle.postHash;
  const post = {
    author: identity.name,
    country: identity.country,
    photo: identity.photo,
    role: identity.role,
    original: body,
    translated: body,
    language: languageToCode(language),
    prompt: `Clarify only: ${analysis.prompts[0].prompt}`,
    protocolAnalysis: analysis,
    receipt,
    postHash: bundle.postHash,
    receipts: bundle.receipts,
    reviewState: createReviewState(bundle.postHash),
    reviewReceipts: [],
  };
  pushReceipts(bundle.receipts);

  if (threadId) {
    const thread = getThreadById(forumId, threadId);
    if (!thread) return renderThreadList(forumId);
    thread.posts.push(post);
    thread.updated = "just now";
    thread.prompt = promptLabel;
    renderRecentThreads();
    renderThread(forumId, threadId);
    return;
  }

  const newThreadId = `${slugify(title)}-${state.draftCounter++}`;
  const newThread = {
    id: newThreadId,
    title,
    author: identity.name,
    country: identity.country,
    originalLanguage: `${language} original`,
    shownLanguage: "Shown in English",
    updated: "just now",
    views: 1,
    prompt: promptLabel,
    posts: [post],
  };
  if (!state.threadsByForum[forumId]) state.threadsByForum[forumId] = [];
  state.threadsByForum[forumId].unshift(newThread);
  renderRecentThreads();
  renderThread(forumId, newThreadId);
}

async function submitBackendDraft({ forumId, threadId, title, body, language }) {
  const analysis = protocolAnalysis(`${title} ${body}`);
  const promptLabel = selectPrimaryPrompt(analysis);
  const payload = {
    original_text: body,
    translated_text: body,
    language_label: languageToCode(language),
    prompt_text: `Clarify only: ${analysis.prompts[0].prompt}`,
  };
  if (threadId) {
    const result = await apiRequest(`/api/threads/${encodeURIComponent(threadId)}/replies`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const thread = getThreadById(forumId, threadId);
    if (thread && result.post) {
      thread.posts.push(mapBackendPost(result.post));
      thread.updated = "backend just now";
      thread.prompt = promptLabel;
    }
    renderRecentThreads();
    renderThread(forumId, threadId);
    return;
  }

  const result = await apiRequest("/api/threads", {
    method: "POST",
    body: JSON.stringify({
      room_id: forumId,
      title,
      original_language: `${language} original`,
      shown_language: "Shown in English",
      prompt_label: promptLabel,
      ...payload,
    }),
  });
  const newThread = mapBackendThread(result.thread);
  if (!state.threadsByForum[forumId]) state.threadsByForum[forumId] = [];
  state.threadsByForum[forumId].unshift(newThread);
  renderRecentThreads();
  renderThread(forumId, newThread.id);
}


function wirePostReviewButtons() {
  forumArea.querySelectorAll("[data-report-post]").forEach((button) => {
    button.addEventListener("click", () => reportPost(button.dataset.reportPost));
  });
  forumArea.querySelectorAll("[data-open-review]").forEach((button) => {
    button.addEventListener("click", () => showReviewFlow(button.dataset.openReview));
  });
  forumArea.querySelectorAll("[data-open-appeal]").forEach((button) => {
    button.addEventListener("click", () => showAppealFlow(button.dataset.openAppeal));
  });
  forumArea.querySelectorAll("[data-add-evidence]").forEach((button) => {
    button.addEventListener("click", () => showEvidenceNoteFlow(button.dataset.addEvidence));
  });
}

function showAppealFlow(postId) {
  const found = findPostById(postId);
  if (!found) return;
  const { post } = found;
  const review = post.reviewState || createReviewState(post.id);
  const appeals = review.appeals || [];
  showDialog("Appeal flow", `
    <p><strong>Appeal boundary:</strong> Appeals are for human moderation visibility actions. Donations buy no influence over appeals, moderation, ranking, speech, or protocol rules.</p>
    <p><strong>Current status:</strong> ${escapeHtml(review.appealStatus || "none")}</p>
    <div class="appeal-panel">
      <button class="primary-btn" type="button" data-submit-appeal="${escapeHtml(postId)}">Submit appeal</button>
      <button class="ghost-btn" type="button" data-advance-appeal="${escapeHtml(postId)}">Mark appeal under review</button>
      <button class="ghost-btn" type="button" data-resolve-appeal="${escapeHtml(postId)}">Resolve appeal</button>
    </div>
    ${appeals.length ? `
      <div class="evidence-note-list">
        ${appeals.map((appeal) => `
          <article class="evidence-note-card">
            <strong>${escapeHtml(appeal.id)}</strong>
            <p>${escapeHtml(appeal.reason)}</p>
            <small>Status: ${escapeHtml(appeal.status)} • ${escapeHtml(appeal.createdAt)}</small>
          </article>
        `).join("")}
      </div>
    ` : `<p class="mini-stat">No appeal submitted yet.</p>`}
    ${renderReceiptCards((review.receipts || []).filter((receipt) => receipt.type === "appeal"))}
  `);
  dialogBody.querySelector("[data-submit-appeal]")?.addEventListener("click", () => applyAppealAction(postId, "submitted"));
  dialogBody.querySelector("[data-advance-appeal]")?.addEventListener("click", () => applyAppealAction(postId, "under_review"));
  dialogBody.querySelector("[data-resolve-appeal]")?.addEventListener("click", () => applyAppealAction(postId, "resolved"));
}

function applyAppealAction(postId, status) {
  const found = findPostById(postId);
  if (!found) return;
  const { post, forumId, thread } = found;
  const review = post.reviewState || createReviewState(post.id);
  if (!Array.isArray(review.appeals)) review.appeals = [];
  const user = state.currentUser || { display_name: post.author || "Local appellant", country: post.country || "Europe" };
  const appeal = {
    id: `appeal-${simpleHash(`${postId}|${status}|${review.appeals.length}`)}`,
    postId,
    status,
    createdAt: "local demo session",
    reason: status === "submitted"
      ? "User requests human reconsideration of a visibility action."
      : status === "under_review"
        ? "Appeal is under human review."
        : "Appeal resolved in local prototype.",
  };
  review.appealStatus = status;
  if (status === "submitted") review.appeals.push(appeal);
  else if (review.appeals.length) review.appeals[review.appeals.length - 1] = { ...review.appeals[review.appeals.length - 1], status, reason: appeal.reason };
  else review.appeals.push(appeal);

  const receipt = receiptSystem()?.createAppealReceipt?.({
    postHash: post.postHash || post.receipt || post.id,
    appealId: appeal.id,
    appellantName: user.display_name,
    appellantCountry: user.country,
    status,
    reason: appeal.reason,
  });
  if (receipt) {
    review.receipts.push(receipt);
    pushReceipts([receipt]);
  }
  post.reviewState = review;
  renderReviewQueue();
  dialog.close();
  renderThread(forumId, thread.id);
}


function showEvidenceNoteFlow(postId) {
  const found = findPostById(postId);
  if (!found) return;
  const { post } = found;
  const evidence = evidenceReview();
  const noteTypes = evidence?.NOTE_TYPES || [];
  const reviewers = evidence?.DEMO_REVIEWERS || [{ name: "Evidence reviewer", country: "Europe", role: "evidence reviewer" }];
  showDialog("Evidence reviewer note", `
    <p><strong>Boundary:</strong> Evidence reviewers add source/context notes. They do not decide truth, guilt, corruption, legitimacy, or whether a user is right or wrong.</p>
    <p><strong>Visible reviewer model:</strong> name + country for accountability; no private contact, exact location, ID document, or hidden profile.</p>
    <div class="evidence-action-grid">
      ${noteTypes.map((type) => `
        <button class="ghost-btn evidence-action" type="button" data-evidence-type="${escapeHtml(type.id)}">
          <strong>${escapeHtml(type.label)}</strong><br />
          <span>${escapeHtml(type.summary)}</span>
        </button>
      `).join("")}
    </div>
    <p><strong>Demo reviewers:</strong> ${reviewers.map((r) => `${escapeHtml(r.name)} — ${escapeHtml(r.country)}`).join("; ")}</p>
    ${renderEvidenceNotes(post.evidenceNotes || [])}
  `);
  dialogBody.querySelectorAll("[data-evidence-type]").forEach((button) => {
    button.addEventListener("click", () => addEvidenceNote(postId, button.dataset.evidenceType));
  });
}

function addEvidenceNote(postId, typeId = "source_missing") {
  const found = findPostById(postId);
  if (!found) return;
  const { post, forumId, thread } = found;
  const evidence = evidenceReview();
  const reviewers = evidence?.DEMO_REVIEWERS || [{ name: "Evidence reviewer", country: "Europe", role: "evidence reviewer" }];
  const reviewer = reviewers[(post.evidenceNotes || []).length % reviewers.length];
  const note = evidence?.createEvidenceNote?.({
    postId: post.id,
    postHash: post.postHash || post.receipt || post.id,
    typeId,
    reviewer,
  }) || {
    id: `evidence-note-${post.id}-${Date.now()}`,
    type: typeId,
    label: "Evidence note",
    summary: "Evidence/context note added.",
    note: "Evidence reviewers add context; they do not decide truth.",
    reviewerName: reviewer.name,
    reviewerCountry: reviewer.country,
    source: "No external source attached in local prototype.",
    boundary: "Evidence reviewers add context, not truth verdicts.",
  };
  if (!Array.isArray(post.evidenceNotes)) post.evidenceNotes = [];
  post.evidenceNotes.push(note);
  const receipt = receiptSystem()?.createEvidenceNoteReceipt?.({
    postHash: post.postHash || post.receipt || post.id,
    postId: post.id,
    evidenceNote: note,
  });
  if (receipt) {
    if (!Array.isArray(post.evidenceReceipts)) post.evidenceReceipts = [];
    post.evidenceReceipts.push(receipt);
    pushReceipts([receipt]);
  }
  renderEvidenceQueue();
  dialog.close();
  renderThread(forumId, thread.id);
}

function renderEvidenceQueue() {
  const container = document.getElementById("evidenceQueue");
  if (!container) return;
  const items = allPostsWithEvidenceNotes().slice(0, 6);
  if (!items.length) {
    container.innerHTML = `<p class="mini-stat">No evidence notes yet.</p>`;
    return;
  }
  container.innerHTML = items.map(({ forumId, threadId, threadTitle, post }) => `
    <article class="review-queue-row">
      <strong>${escapeHtml(threadTitle)}</strong>
      <span>${escapeHtml(post.author)} • ${escapeHtml(post.country)} • ${(post.evidenceNotes || []).length} evidence note${(post.evidenceNotes || []).length === 1 ? "" : "s"}</span>
      <button type="button" class="ghost-btn small-btn" data-evidence-jump-forum="${escapeHtml(forumId)}" data-evidence-jump-thread="${escapeHtml(threadId)}">Open thread</button>
    </article>
  `).join("");
  container.querySelectorAll("[data-evidence-jump-thread]").forEach((button) => {
    button.addEventListener("click", () => renderThread(button.dataset.evidenceJumpForum, button.dataset.evidenceJumpThread));
  });
}

async function reportPost(postId, category = "needs human review") {
  const found = findPostById(postId);
  if (!found) return;
  const { post, forumId, thread } = found;
  const review = post.reviewState || createReviewState(post.id);
  const report = {
    category,
    createdAt: "local demo session",
    summary: "User report received as review trigger only.",
  };
  review.reports.push(report);
  review.reportCount = review.reports.length;
  if (review.reportCount >= (reviewPipeline()?.REPORT_THRESHOLD || 2)) review.queueStatus = "needs_human_review";
  post.reviewState = review;
  const receipt = receiptSystem()?.createReportReceipt?.({
    postHash: post.postHash || post.receipt || post.id,
    category,
    reportCount: review.reportCount,
  });
  if (receipt) {
    review.receipts.push(receipt);
    pushReceipts([receipt]);
  }
  try {
    await apiRequest(`/api/posts/${encodeURIComponent(postId)}/reports`, {
      method: "POST",
      body: JSON.stringify({
        category,
        note: "Frontend report from Patch 15+18.",
        reporter_name: state.currentUser?.display_name || "Frontend demo reporter",
        reporter_country: state.currentUser?.country || "Europe",
      }),
    });
    state.moderationMessage = "Report sent to backend review queue.";
  } catch (error) {
    state.moderationMessage = `Local report recorded. Backend unavailable or post not found: ${error.message}`;
  }
  renderReviewQueue();
  renderThread(forumId, thread.id);
}

function showReviewFlow(postId) {
  state.selectedReviewPostId = postId;
  const found = findPostById(postId);
  if (!found) return;
  const { post } = found;
  const review = post.reviewState || createReviewState(post.id);
  const moderators = reviewPipeline()?.DEMO_MODERATORS || [
    { name: "Elena Kovács", country: "Hungary", role: "human moderator" },
    { name: "Mateo Duarte", country: "Portugal", role: "review moderator" },
    { name: "Aino Lehtinen", country: "Finland", role: "review moderator" },
  ];
  showDialog("Human review pipeline", `
    <p><strong>Process:</strong> Sydney Protocol clarifies THRESHOLD signals only → reports trigger review → a human moderator checks EU hard-boundary categories → temporary hide is possible → two additional human moderators review → receipt and appeal path stay visible.</p>
    <p><strong>Current status:</strong> ${escapeHtml(publicReviewSummary(review))}</p>
    <ul>
      <li>Reports: ${review.reportCount || 0}</li>
      <li>Status: ${escapeHtml(review.status || "visible")}</li>
      <li>Queue: ${escapeHtml(review.queueStatus || "none")}</li>
    </ul>
    <div class="review-panel-actions">
      <button class="ghost-btn" type="button" data-review-action="initial">Initial moderator check</button>
      <button class="ghost-btn" type="button" data-review-action="hide">Temporarily hide pending panel</button>
      <button class="ghost-btn" type="button" data-review-action="restore">Two-moderator panel: restore</button>
      <button class="ghost-btn" type="button" data-review-action="keep_hidden">Two-moderator panel: keep hidden</button>
    </div>
    <p><strong>Demo moderators:</strong> ${moderators.map((m) => `${escapeHtml(m.name)} — ${escapeHtml(m.country)}`).join("; ")}</p>
    <p><small>Name and country are shown for accountability. No address, private contact, exact location, ID document, or hidden profile is shown.</small></p>
    ${renderReceiptCards([...(review.receipts || [])])}
  `);
  dialogBody.querySelectorAll("[data-review-action]").forEach((button) => {
    button.addEventListener("click", () => applyReviewAction(postId, button.dataset.reviewAction));
  });
}

async function applyReviewAction(postId, action) {
  const found = findPostById(postId);
  if (!found) return;
  const { post, forumId, thread } = found;
  const pipeline = reviewPipeline();
  const moderators = pipeline?.DEMO_MODERATORS || [
    { name: "Elena Kovács", country: "Hungary", role: "human moderator" },
    { name: "Mateo Duarte", country: "Portugal", role: "review moderator" },
    { name: "Aino Lehtinen", country: "Finland", role: "review moderator" },
  ];
  const review = post.reviewState || createReviewState(post.id);
  const receipts = receiptSystem();
  let newReceipt = null;
  if (action === "initial") {
    review.initialModerator = moderators[0];
    review.queueStatus = "initial_human_reviewed";
    newReceipt = receipts?.createHumanReviewReceipt?.({
      postHash: post.postHash || post.receipt || post.id,
      moderatorName: moderators[0].name,
      moderatorCountry: moderators[0].country,
      action: "initial review completed",
      reason: "report threshold / context check",
      note: "No visibility action was required by this initial check."
    });
  }
  if (action === "hide") {
    review.initialModerator = moderators[0];
    review.temporaryHiddenBy = moderators[0];
    review.status = "temporarily_hidden";
    review.queueStatus = "pending_two_moderator_review";
    review.appealAvailable = true;
    newReceipt = receipts?.createTemporaryHideReceipt?.({
      postHash: post.postHash || post.receipt || post.id,
      moderatorName: moderators[0].name,
      moderatorCountry: moderators[0].country,
      reason: "pending hard-boundary/context review"
    });
  }
  if (action === "restore" || action === "keep_hidden") {
    review.panelReview = { reviewers: [moderators[1], moderators[2]], decision: action === "restore" ? "restore" : "keep hidden", reason: "two-moderator review" };
    review.status = action === "restore" ? "visible" : "kept_hidden";
    review.queueStatus = "panel_review_complete";
    review.appealAvailable = true;
    newReceipt = receipts?.createPanelReviewReceipt?.({
      postHash: post.postHash || post.receipt || post.id,
      reviewerOne: moderators[1],
      reviewerTwo: moderators[2],
      decision: review.panelReview.decision,
      reason: "visibility under forum hard-boundary rules"
    });
  }
  if (newReceipt) {
    review.receipts.push(newReceipt);
    pushReceipts([newReceipt]);
  }
  try {
    await postBackendReviewAction(postId, action, moderators);
    state.moderationMessage = "Moderator action sent to backend.";
  } catch (error) {
    state.moderationMessage = `Local moderator action recorded. Backend unavailable or post not found: ${error.message}`;
  }
  post.reviewState = review;
  renderReviewQueue();
  dialog.close();
  renderThread(forumId, thread.id);
}

async function postBackendReviewAction(postId, action, moderators) {
  const actionMap = {
    initial: "initial_check",
    hide: "temporary_hide",
    restore: "restore",
    keep_hidden: "keep_hidden",
  };
  const payload = {
    action_type: actionMap[action] || action,
    moderator_name: moderators[0].name,
    moderator_country: moderators[0].country,
    reason_category: action === "hide" ? "possible hard-boundary review" : "human review",
    note: "Frontend moderation dashboard action.",
  };
  if (action === "restore" || action === "keep_hidden") {
    payload.reviewer_one_name = moderators[1].name;
    payload.reviewer_one_country = moderators[1].country;
    payload.reviewer_two_name = moderators[2].name;
    payload.reviewer_two_country = moderators[2].country;
  }
  return apiRequest(`/api/posts/${encodeURIComponent(postId)}/review-actions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function renderModerationDashboard() {
  state.currentForumId = null;
  state.currentThreadId = null;
  let backendQueue = [];
  let backendError = "";
  try {
    const result = await apiRequest("/api/review-queue");
    backendQueue = result.queue || [];
    state.moderationMessage = "Backend review queue loaded.";
  } catch (error) {
    backendError = error.message;
    state.moderationMessage = "Showing local review queue because backend is unavailable.";
  }
  const localQueue = allPostsWithReview();
  forumArea.innerHTML = `
    <article class="category">
      <header class="category-head category-head-row">
        <div>
          <button class="back-link" type="button" data-home>Back to square</button>
          <h2>Moderation dashboard v1</h2>
          <p>Reports trigger review. Human moderators decide visibility. Serious actions require two-moderator review.</p>
        </div>
      </header>
      <section class="moderation-dashboard">
        <div class="identity-notice">
          <strong>Patch 15+18 boundary</strong>
          <p>Moderator actions are human, named, receipted, and separate from Sydney Protocol THRESHOLD clarification. Donations, translations, and protocol prompts do not decide visibility.</p>
          <small>${escapeHtml(state.moderationMessage)}${backendError ? ` ${escapeHtml(backendError)}` : ""}</small>
        </div>
        <div class="moderation-grid">
          <section>
            <h3>Backend review queue</h3>
            ${backendQueue.length ? backendQueue.map(renderBackendQueueRow).join("") : `<p class="mini-stat">No backend review items loaded.</p>`}
          </section>
          <section>
            <h3>Local demo queue</h3>
            ${localQueue.length ? localQueue.map(renderLocalQueueRow).join("") : `<p class="mini-stat">No local posts currently in human review.</p>`}
          </section>
        </div>
      </section>
    </article>
  `;
  forumArea.querySelector("[data-home]")?.addEventListener("click", () => renderForums(searchInput.value));
  forumArea.querySelectorAll("[data-dashboard-review]").forEach((button) => {
    button.addEventListener("click", () => showDashboardBackendReview(button.dataset.dashboardReview));
  });
  forumArea.querySelectorAll("[data-local-review]").forEach((button) => {
    button.addEventListener("click", () => showReviewFlow(button.dataset.localReview));
  });
}

function renderDonationTransparencyPage() {
  state.currentForumId = null;
  state.currentThreadId = null;
  const model = donationTransparency();
  const summary = model.SUMMARY || {};
  const costs = model.MONTHLY_COSTS || [];
  const spending = model.PUBLIC_SPENDING_RECEIPTS || [];
  const spendingReceipts = spending.map((item) => receiptSystem()?.createSpendingReceipt?.(item)).filter(Boolean);
  forumArea.innerHTML = `
    <article class="category">
      <header class="category-head category-head-row">
        <div>
          <button class="back-link" type="button" data-home>Back to square</button>
          <h2>Donation transparency</h2>
          <p>Free to use. Public spending receipts. Donations buy no influence.</p>
        </div>
      </header>
      <section class="transparency-page">
        <div class="identity-notice">
          <strong>Donations buy no influence</strong>
          <p>${escapeHtml(summary.boundary || "Donations do not affect speech, moderation, ranking, visibility, protocol rules, or governance.")}</p>
        </div>
        <div class="transparency-summary">
          <article><strong>Month</strong><span>${escapeHtml(summary.month || "Demo month")}</span></article>
          <article><strong>Donations received</strong><span>EUR ${Number(summary.donationsReceived || 0).toFixed(2)}</span></article>
          <article><strong>Total spent</strong><span>EUR ${Number(summary.totalSpent || 0).toFixed(2)}</span></article>
          <article><strong>Reserve</strong><span>EUR ${Number(summary.reserve || 0).toFixed(2)}</span></article>
        </div>
        <h3>Monthly server-cost table</h3>
        <div class="cost-table" role="table" aria-label="Monthly server-cost table">
          <div class="cost-row cost-head" role="row">
            <span>Category</span><span>Amount</span><span>Cadence</span><span>Note</span>
          </div>
          ${costs.map((item) => `
            <div class="cost-row" role="row">
              <span>${escapeHtml(item.category)}</span>
              <span>EUR ${Number(item.amount || 0).toFixed(2)}</span>
              <span>${escapeHtml(item.cadence)}</span>
              <span>${escapeHtml(item.note)}</span>
            </div>
          `).join("")}
        </div>
        <h3>Public spending receipts</h3>
        ${renderReceiptCards(spendingReceipts)}
        <p><small>No real donation or payment processing is connected. This is a public-prototype transparency mock for a future public-interest funding model.</small></p>
      </section>
    </article>
  `;
  pushReceipts(spendingReceipts);
  forumArea.querySelector("[data-home]")?.addEventListener("click", () => renderForums(searchInput.value));
}

function renderPrivateAlphaReadinessPack() {
  state.currentForumId = null;
  state.currentThreadId = null;
  const docs = [
    ["Setup guide", "docs/PRIVATE_ALPHA_SETUP_GUIDE.md", "How to run the static frontend and optional backend for demo testing."],
    ["Admin checklist", "docs/PRIVATE_ALPHA_ADMIN_CHECKLIST.md", "Session operations, access, review, and closeout checks."],
    ["Moderator guide", "docs/PRIVATE_ALPHA_MODERATOR_GUIDE.md", "Human moderation boundaries, serious actions, receipts, and appeals."],
    ["Evidence reviewer guide", "docs/PRIVATE_ALPHA_EVIDENCE_REVIEWER_GUIDE.md", "Source/context notes without truth verdicts."],
    ["Privacy and rules", "docs/PRIVATE_ALPHA_PRIVACY_AND_RULES.md", "Minimal records, no hidden profile, and alpha rules."],
    ["Known limitations", "docs/PRIVATE_ALPHA_KNOWN_LIMITATIONS.md", "What the prototype cannot safely claim yet."],
    ["Feedback form", "docs/PRIVATE_ALPHA_FEEDBACK_FORM.md", "Questions for testers without hidden profiling."],
    ["Launch checklist", "docs/PRIVATE_ALPHA_LAUNCH_CHECKLIST.md", "Gate checklist and stop conditions for demo testing."],
    ["Smoke test runbook", "docs/PRIVATE_ALPHA_TEST_RUNBOOK.md", "Dependency-free smoke check and manual walkthrough before invited sessions."],
    ["Invite text", "docs/PRIVATE_ALPHA_INVITE_TEXT.md", "Plain invitation copy for controlled testers."],
    ["Tester onboarding", "docs/PRIVATE_ALPHA_TESTER_ONBOARDING.md", "What this is, what it is not, and what testers should try."],
    ["What to test", "docs/PRIVATE_ALPHA_WHAT_TO_TEST.md", "Checklist for the first invited session."],
    ["Issue log", "docs/PRIVATE_ALPHA_ISSUE_LOG_TEMPLATE.md", "Structured issue log with severity and ownership."],
    ["Moderator shift sheet", "docs/PRIVATE_ALPHA_MODERATOR_SHIFT_SHEET.md", "Session roles, review tracking, and closeout."],
    ["Session report", "docs/PRIVATE_ALPHA_SESSION_REPORT.md", "Post-session summary, safety review, and decision input."],
    ["Go/no-go decision", "docs/PRIVATE_ALPHA_GO_NO_GO_DECISION.md", "Decision gate for repeating, fixing, or pausing the alpha."],
  ];
  forumArea.innerHTML = `
    <article class="category">
      <header class="category-head category-head-row">
        <div>
          <button class="back-link" type="button" data-home>Back to square</button>
          <h2>Public prototype launch kit</h2>
          <p>Open demo/testing build. Not a finished production platform, not production moderation, and not a real payment system.</p>
        </div>
      </header>
      <section class="alpha-pack">
        <div class="identity-notice">
          <strong>Public prototype</strong>
          <p>This build is meant to be publicly testable while keeping real donations, production identity verification, production moderation, and automated enforcement out of scope.</p>
        </div>
        <div class="alpha-doc-grid">
          ${docs.map(([title, href, summary]) => `
            <article class="alpha-doc-card">
              <strong>${escapeHtml(title)}</strong>
              <p>${escapeHtml(summary)}</p>
              <code>${escapeHtml(href)}</code>
            </article>
          `).join("")}
        </div>
        <div class="clarity-checklist">
          <strong>Alpha gate</strong>
          <ul>
            <li>Public demo feedback is welcome, but production claims stay off.</li>
            <li>Keep rooms and languages limited while testing.</li>
            <li>Receipts, appeals, moderation boundaries, and limitations visible before testing.</li>
            <li>No finished-platform claims.</li>
          </ul>
        </div>
      </section>
    </article>
  `;
  forumArea.querySelector("[data-home]")?.addEventListener("click", () => renderForums(searchInput.value));
}

function renderBackendQueueRow(item) {
  return `
    <article class="review-queue-row">
      <strong>${escapeHtml(item.thread_title || item.thread_id || "Backend post")}</strong>
      <span>${escapeHtml(item.author_name || "Unknown")} - ${escapeHtml(item.author_country || "Europe")} - ${escapeHtml(item.visibility_status || "visible")} - ${item.report_count || 0} report${item.report_count === 1 ? "" : "s"}</span>
      <button type="button" class="ghost-btn small-btn" data-dashboard-review="${escapeHtml(item.id)}">Moderator actions</button>
    </article>
  `;
}

function renderLocalQueueRow({ forumId, threadId, threadTitle, post }) {
  return `
    <article class="review-queue-row">
      <strong>${escapeHtml(threadTitle)}</strong>
      <span>${escapeHtml(post.author)} - ${escapeHtml(post.country)} - ${escapeHtml(publicReviewSummary(post.reviewState))}</span>
      <button type="button" class="ghost-btn small-btn" data-local-review="${escapeHtml(post.id)}" data-local-forum="${escapeHtml(forumId)}" data-local-thread="${escapeHtml(threadId)}">Open local review</button>
    </article>
  `;
}

function showDashboardBackendReview(postId) {
  const moderators = reviewPipeline()?.DEMO_MODERATORS || [
    { name: "Elena Kovacs", country: "Hungary", role: "human moderator" },
    { name: "Mateo Duarte", country: "Portugal", role: "review moderator" },
    { name: "Aino Lehtinen", country: "Finland", role: "review moderator" },
  ];
  showDialog("Backend moderator action", `
    <p><strong>Two-moderator review UI:</strong> temporary hide can be followed by restore or keep-hidden decisions from two additional named moderators.</p>
    <div class="review-panel-actions">
      <button class="ghost-btn" type="button" data-backend-review-action="initial">Initial moderator check</button>
      <button class="ghost-btn" type="button" data-backend-review-action="hide">Temporarily hide pending panel</button>
      <button class="ghost-btn" type="button" data-backend-review-action="restore">Two-moderator panel: restore</button>
      <button class="ghost-btn" type="button" data-backend-review-action="keep_hidden">Two-moderator panel: keep hidden</button>
    </div>
    <p><strong>Demo moderators:</strong> ${moderators.map((m) => `${escapeHtml(m.name)} - ${escapeHtml(m.country)}`).join("; ")}</p>
    <p><small>Actions create backend review-action receipts. Sydney Protocol remains clarify-only.</small></p>
  `);
  dialogBody.querySelectorAll("[data-backend-review-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await postBackendReviewAction(postId, button.dataset.backendReviewAction, moderators);
        state.moderationMessage = "Backend moderator action recorded.";
      } catch (error) {
        state.moderationMessage = error.message;
      }
      dialog.close();
      renderModerationDashboard();
    });
  });
}

function renderReviewQueue() {
  const container = document.getElementById("reviewQueue");
  if (!container) return;
  const items = allPostsWithReview().slice(0, 6);
  if (!items.length) {
    container.innerHTML = `<p class="mini-stat">No posts currently in human review.</p>`;
    return;
  }
  container.innerHTML = items.map(({ forumId, threadId, threadTitle, post }) => `
    <article class="review-queue-row">
      <strong>${escapeHtml(threadTitle)}</strong>
      <span>${escapeHtml(post.author)} • ${escapeHtml(post.country)} • ${escapeHtml(publicReviewSummary(post.reviewState))}</span>
      <button type="button" class="ghost-btn small-btn" data-review-jump-forum="${escapeHtml(forumId)}" data-review-jump-thread="${escapeHtml(threadId)}">Open thread</button>
    </article>
  `).join("");
  container.querySelectorAll("[data-review-jump-thread]").forEach((button) => {
    button.addEventListener("click", () => renderThread(button.dataset.reviewJumpForum, button.dataset.reviewJumpThread));
  });
}

function renderRecentThreads() {
  const container = document.getElementById("recentThreads");
  if (!container) return;
  const recent = flattenThreads().slice(0, 5);
  container.innerHTML = recent.map((thread) => `
    <article class="thread-card">
      <button type="button" data-recent-forum="${escapeHtml(thread.forumId)}" data-recent-thread="${escapeHtml(thread.id)}">${escapeHtml(thread.title)}</button>
      <p>${escapeHtml(thread.author)}${thread.country ? ` • ${escapeHtml(thread.country)}` : ""} • ${escapeHtml(thread.originalLanguage)}</p>
      <div class="thread-card-footer">
        <span class="lang-badge">${escapeHtml(thread.shownLanguage)}</span>
        <span class="prompt-badge">◇ ${escapeHtml(thread.prompt)}</span>
      </div>
      <p>${escapeHtml(thread.updated)}</p>
    </article>
  `).join("");
  container.querySelectorAll("[data-recent-thread]").forEach((button) => {
    button.addEventListener("click", () => renderThread(button.dataset.recentForum, button.dataset.recentThread));
  });
}

searchInput.addEventListener("input", (event) => renderForums(event.target.value));

document.getElementById("homeBtn").addEventListener("click", () => renderForums(searchInput.value));

document.getElementById("aboutBtn")?.addEventListener("click", () => {
  showDialog("About European Public Square", `
    <p><strong>European Public Square</strong> is currently a public prototype for a future European public-square model. It tests rooms, threads, original-language preservation, visible receipts, accountable identity, human review, appeal paths, and donation transparency without donor influence.</p>
    <p><strong>Current stage:</strong> open demo/testing build. It is public to try, but it is not a finished production platform.</p>
    <div class="feature-map">
      <article>
        <strong>Forum structure</strong>
        <p>Rooms, threads, replies, latest activity, and recent-thread lists are rendered from <code>data/localData.js</code> by <code>app.js</code>. There is no algorithmic feed.</p>
      </article>
      <article>
        <strong>Posting and limits</strong>
        <p>The composer creates local demo threads/replies in page memory. A 3-posts-per-30-minutes demo window and 45-second cooldown are tracked in <code>app.js</code>.</p>
      </article>
      <article>
        <strong>Accountability</strong>
        <p>Posts show display name + country; photo is optional. Backend login can supply those fields via FastAPI when running. Tokens stay in page memory.</p>
      </article>
      <article>
        <strong>Translation layer</strong>
        <p>Original and reader-language text render side by side. Translation receipts explain that translation is a bridge, not a replacement. No real translation provider is connected.</p>
      </article>
      <article>
        <strong>Sydney Protocol prompts</strong>
        <p><code>data/protocolRules.js</code> performs local clarify-only prompt analysis. Prompts surface context questions; they do not judge, rank, punish, hide, or enforce.</p>
      </article>
      <article>
        <strong>Receipts ledger</strong>
        <p><code>data/receiptSystem.js</code> creates visible receipts for posts, identity, translation, protocol prompts, reports, moderation, evidence notes, spending, and appeals.</p>
      </article>
      <article>
        <strong>Human review</strong>
        <p>Reports route to human review. The UI supports temporary hide and two-moderator panel review. Backend endpoints exist for reports, review queue, and review actions.</p>
      </article>
      <article>
        <strong>Evidence notes</strong>
        <p>Evidence reviewers add source/context notes through <code>data/evidenceReview.js</code>. They do not decide truth, guilt, corruption, or legitimacy.</p>
      </article>
      <article>
        <strong>Appeals</strong>
        <p>Appeal buttons appear for appealable visibility actions. The local flow tracks submitted, under-review, and resolved states, with appeal receipts.</p>
      </article>
      <article>
        <strong>Donation transparency</strong>
        <p><code>data/donationTransparency.js</code> provides mock monthly costs and spending receipts. No payment processor is connected. Donations buy no influence.</p>
      </article>
      <article>
        <strong>Public prototype kit</strong>
        <p>The <code>docs/PRIVATE_ALPHA_*</code> files now serve as the launch/testing kit: setup, runbook, onboarding, test checklist, issue log, moderator shifts, session report, and go/no-go decision.</p>
      </article>
      <article>
        <strong>Smoke test</strong>
        <p><code>tests/private_alpha_smoke_check.mjs</code> verifies the alpha shell, docs, core UI markers, receipt functions, and no forbidden browser persistence APIs.</p>
      </article>
    </div>
    <p><strong>Not implemented:</strong> real translation, real donations/payments, production auth, production moderation case management, automated moderation, ranking, or hidden behavioral profiles.</p>
    <p><small>Full implementation map: <code>docs/ABOUT.md</code>.</small></p>
  `);
});

document.getElementById("languageBtn").addEventListener("click", () => {
  showDialog("Language concept", `
    <p>People write in their native language. Readers see their preferred language, with the original always available.</p>
    <ul>
      <li>Original text remains the primary record.</li>
      <li>Translations are labelled as translations.</li>
      <li>Translation caveats appear when tone or meaning may shift.</li>
      <li>Patch 04 still uses same-text placeholders for new local drafts; real translation comes later.</li>
    </ul>
  `);
});

document.getElementById("safeguardsBtn").addEventListener("click", () => {
  showDialog("Safeguards concept", `
    <p>The Sydney Protocol layer handles THRESHOLD pressure through clarification only. It does not punish, rank, censor, judge truth, or decide legitimacy.</p>
    <ul>
      <li>THRESHOLD language receives Sydney Protocol clarification receipts where possible.</li>
      <li>Direct harm routes through EU-aligned hard-boundary categories and human moderation.</li>
      <li>Evidence reviewers add source/context notes with receipts; they do not decide truth, guilt, corruption, or legitimacy.</li>
      <li>Posting limits reduce spam and addiction loops.</li>
    </ul>
  `);
});

document.getElementById("moderationBtn")?.addEventListener("click", () => {
  renderModerationDashboard();
});

document.getElementById("donationTransparencyBtn")?.addEventListener("click", () => {
  renderDonationTransparencyPage();
});

document.getElementById("sideDonationTransparencyBtn")?.addEventListener("click", () => {
  renderDonationTransparencyPage();
});

document.getElementById("alphaReadinessBtn")?.addEventListener("click", () => {
  renderPrivateAlphaReadinessPack();
});

document.getElementById("sideAlphaReadinessBtn")?.addEventListener("click", () => {
  renderPrivateAlphaReadinessPack();
});

document.getElementById("boundaryMapBtn")?.addEventListener("click", () => {
  const map = boundaryMap();
  const categories = map?.HARD_BOUNDARY_CATEGORIES || [];
  const thresholdExamples = map?.THRESHOLD_EXAMPLES || [];
  const categoryRows = categories.map((category) => `
    <li><strong>${escapeHtml(category.label)}</strong><br><span>${escapeHtml(category.route)} — ${escapeHtml(category.note)}</span></li>
  `).join("");
  const thresholdRows = thresholdExamples.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  showDialog("EU hard-boundary map + Sydney THRESHOLD layer", `
    <p><strong>Boundary:</strong> ${escapeHtml(map?.PRINCIPLE || "European law/human-rights categories define hard boundaries. Sydney Protocol clarifies THRESHOLD pressure only.")}</p>
    <h4>EU hard-boundary floor</h4>
    <p>These categories can route to accountable human moderation, temporary visibility limits, removal, escalation, and appeal receipts where appropriate.</p>
    <ul>${categoryRows}</ul>
    <h4>Sydney Protocol THRESHOLD layer</h4>
    <p>Everything outside the hard-boundary floor remains in the clarification layer unless human moderators determine otherwise under the hard-boundary policy.</p>
    <ul>${thresholdRows}</ul>
    <p><strong>Rule:</strong> Sydney Protocol does not enforce. It clarifies THRESHOLD pressure and creates review prompts.</p>
  `);
});

document.getElementById("fundingBtn").addEventListener("click", () => {
  const donationReceipt = receiptSystem()?.createDonationPlaceholderReceipt?.();
  const spendingReceipts = (donationTransparency().PUBLIC_SPENDING_RECEIPTS || [])
    .map((item) => receiptSystem()?.createSpendingReceipt?.(item))
    .filter(Boolean);
  showDialog("Funding concept", `
    <p>European Public Square is testing a future public-interest funding model. In this public prototype, optional donations are mock-only and no payment processor is connected.</p>
    <ul>
      <li>Donations do not buy ranking, speech privilege, moderation privilege, or governance control.</li>
      <li>Spending should be shown through public receipts.</li>
      <li>The future forum should remain free to use.</li>
      <li>No ads, no data monetization, no hidden behavioral profile.</li>
    </ul>
    <p><strong>Boundary:</strong> Donations keep the lights on. They do not buy influence.</p>
    ${donationReceipt ? renderReceiptCards([donationReceipt, ...spendingReceipts]) : renderReceiptCards(spendingReceipts)}
  `);
});

document.getElementById("newThreadBtn").addEventListener("click", () => renderComposer(state.currentForumId, state.currentThreadId));

document.getElementById("receiptsBtn").addEventListener("click", () => {
  const donationReceipt = receiptSystem()?.createDonationPlaceholderReceipt?.();
  showDialog("Receipts concept", `
    <p>Receipts make visible forum actions reviewable without creating a hidden behavioral profile.</p>
    <ul>
      <li>The post remains the primary record.</li>
      <li>Protocol receipts clarify why prompts appeared.</li>
      <li>Translation receipts keep original-language context visible.</li>
      <li>Human review receipts record reports, initial moderator checks, temporary visibility limits, two-moderator panel reviews, and appeals.</li><li>Evidence-note receipts record source/context notes without truth verdicts.</li><li>Donation receipts explain costs, not donor influence.</li>
      <li>Receipts do not decide truth, rank users, or sell attention.</li>
      <li>Posts show name and country for accountability; photo is optional.</li>
    </ul>
    ${donationReceipt ? renderReceiptCards([donationReceipt]) : ""}
  `);
});

renderForums();
renderRecentThreads();
renderReceiptLedger();
renderReviewQueue();
renderEvidenceQueue();
renderAuthPanel();
renderLimitMeter();
setInterval(() => {
  renderLimitMeter();
  updateComposerPostStatus();
}, 1000);
