window.EPS_REVIEW_PIPELINE = (() => {
  const VERSION = "eps-human-review-demo-0.11";
  const REPORT_THRESHOLD = 2;

  const HARD_BOUNDARY_CATEGORIES = [
    "child sexual abuse or exploitation",
    "terrorist content or violent extremism",
    "direct threat or incitement to violence",
    "doxxing or private personal-data exposure",
    "illegal hate speech under applicable law",
    "targeted harassment campaign",
    "illegal harmful instructions",
    "spam or bot flooding",
    "severe safety emergency",
  ];

  const THRESHOLD_LAYER_BOUNDARY =
    "Sydney Protocol handles THRESHOLD pressure by clarification only. It does not trigger visibility actions.";

  const EU_HARD_BOUNDARY_FLOOR =
    "European legal and human-rights categories define the hard floor for direct-harm moderation.";

  const DEMO_MODERATORS = [
    { name: "Elena Kovács", country: "Hungary", role: "human moderator" },
    { name: "Mateo Duarte", country: "Portugal", role: "review moderator" },
    { name: "Aino Lehtinen", country: "Finland", role: "review moderator" },
  ];

  function createReviewState(postId) {
    return {
      postId,
      reportCount: 0,
      reports: [],
      status: "visible",
      queueStatus: "none",
      initialModerator: null,
      temporaryHiddenBy: null,
      panelReview: null,
      appealAvailable: false,
      receipts: [],
    };
  }

  function reviewNeeded(reviewState) {
    return reviewState.reportCount >= REPORT_THRESHOLD || reviewState.queueStatus === "needs_human_review";
  }

  function publicReviewSummary(reviewState) {
    if (!reviewState) return "No human review activity.";
    if (reviewState.status === "temporarily_hidden") return "Temporarily hidden pending two-moderator review.";
    if (reviewState.panelReview) return `Panel review complete: ${reviewState.panelReview.decision}.`;
    if (reviewNeeded(reviewState)) return "Human review needed.";
    if (reviewState.reportCount > 0) return "Reports received, below review threshold.";
    return "No human review activity.";
  }

  return {
    VERSION,
    REPORT_THRESHOLD,
    HARD_BOUNDARY_CATEGORIES,
    THRESHOLD_LAYER_BOUNDARY,
    EU_HARD_BOUNDARY_FLOOR,
    DEMO_MODERATORS,
    createReviewState,
    reviewNeeded,
    publicReviewSummary,
  };
})();
