import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function expectFile(path) {
  if (!existsSync(join(root, path))) failures.push(`Missing file: ${path}`);
}

function expectIncludes(path, text) {
  const body = read(path);
  if (!body.includes(text)) failures.push(`${path} does not include: ${text}`);
}

function expectNotIncludes(path, text) {
  const body = read(path);
  if (body.includes(text)) failures.push(`${path} unexpectedly includes: ${text}`);
}

const requiredFiles = [
  "index.html",
  "app.js",
  "styles.css",
  "data/receiptSystem.js",
  "data/donationTransparency.js",
  "docs/PRIVATE_ALPHA_SETUP_GUIDE.md",
  "docs/PRIVATE_ALPHA_ADMIN_CHECKLIST.md",
  "docs/PRIVATE_ALPHA_MODERATOR_GUIDE.md",
  "docs/PRIVATE_ALPHA_EVIDENCE_REVIEWER_GUIDE.md",
  "docs/PRIVATE_ALPHA_PRIVACY_AND_RULES.md",
  "docs/PRIVATE_ALPHA_KNOWN_LIMITATIONS.md",
  "docs/PRIVATE_ALPHA_FEEDBACK_FORM.md",
  "docs/PRIVATE_ALPHA_LAUNCH_CHECKLIST.md",
  "docs/PRIVATE_ALPHA_TEST_RUNBOOK.md",
  "docs/PRIVATE_ALPHA_INVITE_TEXT.md",
  "docs/PRIVATE_ALPHA_TESTER_ONBOARDING.md",
  "docs/PRIVATE_ALPHA_WHAT_TO_TEST.md",
  "docs/PRIVATE_ALPHA_ISSUE_LOG_TEMPLATE.md",
  "docs/PRIVATE_ALPHA_MODERATOR_SHIFT_SHEET.md",
  "docs/PRIVATE_ALPHA_SESSION_REPORT.md",
  "docs/PRIVATE_ALPHA_GO_NO_GO_DECISION.md",
  "docs/ABOUT.md",
  "docs/EUROPEAN_MEDIA_FEED.md",
  "data/europeanMediaFeeds.json",
  "PATCH_STATUS.md",
  "README.md",
  "streamlit_app.py",
  "requirements.txt",
];

for (const file of requiredFiles) expectFile(file);

expectIncludes("index.html", "European Public Square v1.0");
expectIncludes("index.html", "mediaFeedBtn");
expectIncludes("index.html", "aboutBtn");
expectIncludes("index.html", "alphaReadinessBtn");
expectIncludes("app.js", "About European Public Square");
expectIncludes("app.js", "feature-map");
expectIncludes("app.js", "renderPrivateAlphaReadinessPack");
expectIncludes("app.js", "renderDonationTransparencyPage");
expectIncludes("app.js", "renderMediaFeedTab");
expectIncludes("app.js", "mediaFeedSources");
expectIncludes("app.js", "showAppealFlow");
expectIncludes("app.js", "Patch 22 phrase");
expectIncludes("data/receiptSystem.js", "createAppealReceipt");
expectIncludes("data/receiptSystem.js", "createSpendingReceipt");
expectIncludes("docs/PRIVATE_ALPHA_TEST_RUNBOOK.md", "Smoke Test");
expectIncludes("docs/PRIVATE_ALPHA_INVITE_TEXT.md", "controlled invited test");
expectIncludes("README.md", "public demo ready build");
expectIncludes("streamlit_app.py", "public demo ready build");
expectIncludes("docs/PRIVATE_ALPHA_WHAT_TO_TEST.md", "Decision");
expectIncludes("docs/PRIVATE_ALPHA_GO_NO_GO_DECISION.md", "Go / No-Go");
expectIncludes("docs/ABOUT.md", "Feature Implementation Map");
expectIncludes("docs/ABOUT.md", "How it is implemented in this public demo");
expectIncludes("docs/PRIVATE_ALPHA_LAUNCH_CHECKLIST.md", "No automated moderation claims");
expectIncludes("PATCH_STATUS.md", "PUBLIC_DEMO_READY_V1");
expectIncludes("README.md", "npm run smoke");
expectIncludes("streamlit_app.py", "components.html");
expectIncludes("streamlit_app.py", "inline_static_assets");
expectIncludes("streamlit_app.py", "render_european_media_feed");
expectIncludes("streamlit_app.py", "st.tabs");
expectIncludes("streamlit_app.py", "Forum");
expectIncludes("streamlit_app.py", "Media Feed");
expectIncludes("streamlit_app.py", "st.cache_data(ttl=600");
expectIncludes("streamlit_app.py", "Open original");
expectIncludes("requirements.txt", "streamlit");
expectIncludes("requirements.txt", "feedparser");
expectIncludes("docs/EUROPEAN_MEDIA_FEED.md", "There are no replies");
expectIncludes("docs/EUROPEAN_MEDIA_FEED.md", "forum tab");
expectIncludes("data/europeanMediaFeeds.json", "BBC News Europe");

for (const forbidden of ["localStorage", "sessionStorage", "XMLHttpRequest", "indexedDB", "navigator.sendBeacon"]) {
  expectNotIncludes("app.js", forbidden);
}

if (failures.length) {
  console.error("Prototype smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Prototype smoke check passed.");
