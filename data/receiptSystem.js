window.EPS_RECEIPTS = (() => {
  const VERSION = "eps-receipts-demo-0.17-19";
  const NO_HIDDEN_PROFILE = "Receipts explain visible platform actions. They are not behavioral profiles, ad profiles, or hidden user scoring.";

  function normalize(value) {
    return String(value || "");
  }

  function simpleHash(text) {
    let hash = 2166136261;
    const input = normalize(text);
    for (let i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function receiptId(type, basis) {
    return `eps-${type}-${simpleHash(`${type}|${basis}|${VERSION}`)}`;
  }

  function createReceipt(type, payload = {}) {
    const basis = [
      payload.postHash,
      payload.postId,
      payload.promptCategory,
      payload.language,
      payload.reason,
      payload.createdAt || "demo-local"
    ].filter(Boolean).join("|");

    return {
      id: receiptId(type, basis || JSON.stringify(payload)),
      type,
      version: VERSION,
      createdAt: payload.createdAt || "local demo session",
      postHash: payload.postHash || null,
      language: payload.language || null,
      reason: payload.reason || "reviewability",
      status: payload.status || "visible",
      actor: payload.actor || "local prototype",
      summary: payload.summary || "Receipt created for a visible forum action.",
      details: payload.details || [],
      privacyNote: payload.privacyNote || NO_HIDDEN_PROFILE,
      boundary: payload.boundary || "Receipt-first reviewability. No hidden profile. No truth verdict by receipt.",
    };
  }

  function createPostReceipt({ postHash, language, summary }) {
    return createReceipt("post", {
      postHash,
      language,
      reason: "post record",
      summary: summary || "Post entered the local forum prototype as visible content.",
      details: [
        "The post content remains the visible record.",
        "This receipt does not create a behavioral profile.",
        "No advertising, ranking, or hidden personalization is attached."
      ],
      boundary: "The post is the print. No hidden second profile."
    });
  }

  function createIdentityReceipt({ postHash, displayName, country }) {
    return createReceipt("identity_display", {
      postHash,
      reason: "accountable post identity",
      summary: "Post displays name and country for accountability; photo remains optional.",
      details: [
        `Display name shown: ${displayName || "not provided"}`,
        `Country shown: ${country || "not provided"}`,
        "No address, exact location, ID document, birthdate, private contact, ad profile, or behavioral score is part of this receipt.",
        "The forum stores conversation records needed for threads/posts, not a hidden second version of the person."
      ],
      privacyNote: "Name and country are visible for accountability. Private life remains protected.",
      boundary: "Verify enough to protect the square. Store little enough to protect the person."
    });
  }

  function createProtocolReceipt({ postHash, language, prompt }) {
    return createReceipt("protocol", {
      postHash,
      language,
      promptCategory: prompt?.category || "context",
      reason: prompt?.category || "clarification",
      summary: prompt?.prompt || "Sydney Protocol clarification prompt attached.",
      details: [
        prompt?.explanation || "Clarifies context for human review.",
        prompt?.boundary || "No truth verdict. No enforcement.",
        "Sydney Protocol clarifies THRESHOLD pressure only; moderators handle EU hard-boundary categories separately."
      ],
      boundary: "THRESHOLD clarification only. No judging, ranking, punishment, censorship, truth decision, or enforcement."
    });
  }

  function createTranslationReceipt({ postHash, sourceLanguage, targetLanguage }) {
    return createReceipt("translation", {
      postHash,
      language: `${sourceLanguage || "unknown"} → ${targetLanguage || "reader language"}`,
      reason: "translation visibility",
      summary: "Translation route kept visible beside the original-language record.",
      details: [
        `Source language: ${sourceLanguage || "unknown"}`,
        `Reader language: ${targetLanguage || "English placeholder"}`,
        "Translation is a bridge, not a replacement for the original."
      ],
      boundary: "Translation may miss tone, idiom, or political nuance. Original remains available."
    });
  }

  function createModerationPlaceholderReceipt({ postHash }) {
    return createReceipt("moderation_placeholder", {
      postHash,
      reason: "hard-boundary placeholder",
      status: "not triggered",
      summary: "No moderation action is attached in this local prototype.",
      details: [
        "Moderation is separate from Sydney Protocol THRESHOLD prompts.",
        "EU hard-boundary categories are handled by accountable human moderation, not Sydney Protocol enforcement.",
        "No post is hidden or removed by this receipt system."
      ],
      boundary: "THRESHOLD language receives Sydney Protocol clarification receipts where possible. EU hard-boundary direct harm is handled separately by accountable human moderation."
    });
  }


  function createReportReceipt({ postHash, category, reporter = "user report", reportCount = 1 }) {
    return createReceipt("user_report", {
      postHash,
      reason: category || "user report",
      status: "review trigger only",
      actor: reporter,
      summary: "User report received as a human-review trigger, not as a verdict.",
      details: [
        `Report category: ${category || "unspecified"}`,
        `Visible report count for this post: ${reportCount}`,
        "Reports do not prove a violation and do not hide content automatically.",
        "Report pressure is routed toward accountable human review."
      ],
      boundary: "Reports trigger review. They do not decide truth, guilt, visibility, or enforcement."
    });
  }

  function createHumanReviewReceipt({ postHash, moderatorName, moderatorCountry, action, reason, note }) {
    return createReceipt("human_review", {
      postHash,
      reason: reason || "human review",
      status: action || "reviewed",
      actor: `${moderatorName || "Human moderator"} (${moderatorCountry || "Europe"})`,
      summary: "Accountable human moderator review recorded with name and country.",
      details: [
        `Moderator: ${moderatorName || "Human moderator"}`,
        `Country: ${moderatorCountry || "Europe"}`,
        `Action: ${action || "reviewed"}`,
        `Reason category: ${reason || "not specified"}`,
        note || "No extra private moderator data is shown."
      ],
      boundary: "Human moderation is accountable, receipted, appealable, and separate from Sydney Protocol clarification."
    });
  }

  function createTemporaryHideReceipt({ postHash, moderatorName, moderatorCountry, reason }) {
    return createReceipt("temporary_visibility_limit", {
      postHash,
      reason: reason || "pending human review",
      status: "temporarily hidden",
      actor: `${moderatorName || "Human moderator"} (${moderatorCountry || "Europe"})`,
      summary: "Post temporarily hidden pending two-moderator human review.",
      details: [
        `Initial moderator: ${moderatorName || "Human moderator"}`,
        `Country: ${moderatorCountry || "Europe"}`,
        `Reason category: ${reason || "pending human review"}`,
        "This is not a truth verdict and not a Sydney Protocol enforcement action.",
        "Two additional human moderators must review the visibility action."
      ],
      boundary: "Temporary hide is a human visibility action with review and appeal, not automated censorship."
    });
  }

  function createPanelReviewReceipt({ postHash, reviewerOne, reviewerTwo, decision, reason }) {
    const r1 = reviewerOne || { name: "Review moderator 1", country: "Europe" };
    const r2 = reviewerTwo || { name: "Review moderator 2", country: "Europe" };
    return createReceipt("two_moderator_panel_review", {
      postHash,
      reason: reason || "panel review",
      status: decision || "reviewed",
      actor: `${r1.name} (${r1.country}) + ${r2.name} (${r2.country})`,
      summary: "Two additional human moderators reviewed the temporary visibility action.",
      details: [
        `Reviewer 1: ${r1.name} — ${r1.country}`,
        `Reviewer 2: ${r2.name} — ${r2.country}`,
        `Panel decision: ${decision || "reviewed"}`,
        `Reason category: ${reason || "not specified"}`,
        "The panel does not decide political truth, guilt, corruption, or legitimacy. It reviews visibility under forum rules."
      ],
      boundary: "Serious visibility actions require multi-moderator review and a visible receipt."
    });
  }
  function createHardBoundaryMapReceipt({ postHash, category, action = "human review route only" }) {
    return createReceipt("eu_hard_boundary_map", {
      postHash,
      reason: category || "EU hard-boundary category",
      status: action,
      actor: "human moderation policy map",
      summary: "EU-aligned hard-boundary category mapped to accountable human review.",
      details: [
        `Category: ${category || "not specified"}`,
        `Route: ${action}`,
        "This receipt does not decide guilt, political truth, corruption, or legitimacy.",
        "Sydney Protocol THRESHOLD prompts do not hide posts or enforce moderation actions."
      ],
      boundary: "European hard-boundary floor for direct harm; Sydney Protocol THRESHOLD layer for clarification only."
    });
  }

  function createEvidenceNoteReceipt({ postHash, postId, evidenceNote }) {
    const note = evidenceNote || {};
    return createReceipt("evidence_note", {
      postHash,
      postId,
      reason: note.type || "evidence review note",
      status: "context note only",
      actor: `${note.reviewerName || "Evidence reviewer"} (${note.reviewerCountry || "Europe"})`,
      summary: note.summary || "Evidence reviewer added source/context note.",
      details: [
        `Evidence note type: ${note.label || note.type || "context"}`,
        `Reviewer: ${note.reviewerName || "Evidence reviewer"}`,
        `Country: ${note.reviewerCountry || "Europe"}`,
        `Source/context: ${note.source || "No external source attached in local prototype."}`,
        note.note || note.prompt || "Evidence reviewers add context; they do not decide truth.",
      ],
      privacyNote: "Evidence notes attach to posts, not hidden behavioral profiles.",
      boundary: "Evidence reviewers add source/context notes only. They do not decide truth, guilt, corruption, or legitimacy."
    });
  }

  function createDonationPlaceholderReceipt() {
    return createReceipt("donation_placeholder", {
      reason: "funding transparency placeholder",
      status: "not connected",
      summary: "Donation/spending receipts are planned but not connected in this prototype.",
      details: [
        "The forum is intended to be free to use.",
        "Donations may cover server, security, maintenance, translation, and moderation costs.",
        "Donors receive no moderation, ranking, speech, or governance privilege."
      ],
      boundary: "Donations keep the lights on. They do not buy influence."
    });
  }

  function createSpendingReceipt(item = {}) {
    return createReceipt("public_spending", {
      reason: item.category || "public spending",
      status: "mock public receipt",
      actor: "funding transparency page",
      summary: `Public spending receipt: ${item.category || "operating cost"}.`,
      details: [
        `Receipt ID: ${item.id || "spend-demo"}`,
        `Date: ${item.date || "local demo"}`,
        `Amount: EUR ${Number(item.amount || 0).toFixed(2)}`,
        `Covered period: ${item.coveredPeriod || "not specified"}`,
        `Proof available: ${item.proofAvailable ? "yes" : "no, mock-only prototype"}`
      ],
      privacyNote: "Spending receipts show operating costs, not donor profiles.",
      boundary: "Donations buy no influence. Spending receipts explain costs, not power."
    });
  }

  function createAppealReceipt({ postHash, appealId, appellantName, appellantCountry, status, reason }) {
    return createReceipt("appeal", {
      postHash,
      reason: reason || "visibility appeal",
      status: status || "appeal submitted",
      actor: `${appellantName || "User"} (${appellantCountry || "Europe"})`,
      summary: "Appeal submitted for a human moderation visibility action.",
      details: [
        `Appeal ID: ${appealId || "appeal-demo"}`,
        `Appellant: ${appellantName || "User"}`,
        `Country: ${appellantCountry || "Europe"}`,
        `Appeal status: ${status || "submitted"}`,
        "Appeals challenge visibility actions; they do not ask Sydney Protocol to enforce."
      ],
      privacyNote: "Appeal receipts attach to visible moderation process, not hidden user scoring.",
      boundary: "Appeals remain human-reviewable, receipted, and separate from donations or protocol prompts."
    });
  }

  function createReceiptBundle({ text, title, language, analysis, identity = {} }) {
    const postHash = `post-${simpleHash(`${title || "untitled"}|${language || "unknown"}|${text || ""}`)}`;
    const promptReceipts = (analysis?.prompts || []).map((prompt) => createProtocolReceipt({ postHash, language, prompt }));
    return {
      postHash,
      receipts: [
        createPostReceipt({ postHash, language }),
        createIdentityReceipt({ postHash, displayName: identity.name, country: identity.country }),
        createTranslationReceipt({ postHash, sourceLanguage: language, targetLanguage: "reader language placeholder" }),
        ...promptReceipts,
        createModerationPlaceholderReceipt({ postHash }),
      ],
    };
  }

  return {
    VERSION,
    NO_HIDDEN_PROFILE,
    createReceipt,
    createPostReceipt,
    createIdentityReceipt,
    createProtocolReceipt,
    createTranslationReceipt,
    createModerationPlaceholderReceipt,
    createReportReceipt,
    createHumanReviewReceipt,
    createTemporaryHideReceipt,
    createPanelReviewReceipt,
    createHardBoundaryMapReceipt,
    createEvidenceNoteReceipt,
    createDonationPlaceholderReceipt,
    createSpendingReceipt,
    createAppealReceipt,
    createReceiptBundle,
    simpleHash,
  };
})();
