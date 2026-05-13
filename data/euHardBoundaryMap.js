window.EPS_EU_HARD_BOUNDARY_MAP = (() => {
  const VERSION = "eps-eu-hard-boundary-map-demo-0.11";
  // Lowercase test phrases: child sexual abuse or exploitation; direct threat or incitement to violence; doxxing or private personal-data exposure; illegal hate speech under applicable law

  const PRINCIPLE = "European law and human-rights categories define the hard floor. The Sydney Protocol handles THRESHOLD pressure through clarification only.";

  const HARD_BOUNDARY_CATEGORIES = [
    {
      key: "child_safety",
      label: "Child sexual abuse or exploitation",
      route: "EU hard-boundary human moderation route",
      possibleActions: ["hide", "remove", "escalate", "legal/safety referral where required"],
      receiptReason: "child safety hard-boundary review",
      note: "Handled through human moderation and applicable law, not Sydney Protocol enforcement."
    },
    {
      key: "terrorist_or_violent_extremism",
      label: "Terrorist content or violent extremism",
      route: "EU hard-boundary human moderation route",
      possibleActions: ["hide", "remove", "escalate"],
      receiptReason: "terrorist/violent-extremism hard-boundary review",
      note: "Requires careful legal/human-rights review and visible reasons where possible."
    },
    {
      key: "direct_threat",
      label: "Direct threat or incitement to violence",
      route: "EU hard-boundary human moderation route",
      possibleActions: ["temporary hide", "remove", "lock", "escalate"],
      receiptReason: "direct threat / incitement hard-boundary review",
      note: "Visibility actions require human accountability and receipts."
    },
    {
      key: "doxxing_private_data",
      label: "Doxxing or private personal-data exposure",
      route: "EU hard-boundary human moderation route",
      possibleActions: ["hide private data", "remove", "request edit", "escalate"],
      receiptReason: "privacy/private-data hard-boundary review",
      note: "Protects people from unnecessary identity exposure while preserving reviewability."
    },
    {
      key: "illegal_hate_speech",
      label: "Illegal hate speech under applicable law",
      route: "EU hard-boundary human moderation route",
      possibleActions: ["temporary hide", "remove", "lock", "escalate"],
      receiptReason: "illegal hate-speech hard-boundary review",
      note: "Not all offensive speech is hard-boundary; illegality/hard harm requires human review."
    },
    {
      key: "targeted_harassment_campaign",
      label: "Targeted harassment campaign",
      route: "EU hard-boundary human moderation route",
      possibleActions: ["limit visibility", "lock", "suspend", "escalate"],
      receiptReason: "targeted harassment hard-boundary review",
      note: "Distinguishes isolated harsh speech from coordinated abuse."
    },
    {
      key: "illegal_harmful_instructions",
      label: "Illegal harmful instructions",
      route: "EU hard-boundary human moderation route",
      possibleActions: ["hide", "remove", "escalate"],
      receiptReason: "illegal harmful-instructions hard-boundary review",
      note: "Applies to actionable harmful instructions, not ordinary debate about policy or risk."
    },
    {
      key: "spam_bot_flooding",
      label: "Spam or bot flooding",
      route: "platform integrity hard-boundary route",
      possibleActions: ["rate limit", "lock", "remove duplicate floods", "suspend automation"],
      receiptReason: "spam/bot-flooding hard-boundary review",
      note: "Protects the square from manipulation and overload."
    },
    {
      key: "severe_safety_issue",
      label: "Severe safety emergency",
      route: "safety hard-boundary human moderation route",
      possibleActions: ["hide", "escalate", "safety referral where required"],
      receiptReason: "severe safety hard-boundary review",
      note: "Narrow route for urgent safety concerns, with receipts where safe and lawful."
    }
  ];

  const THRESHOLD_EXAMPLES = [
    "strong political claim without evidence",
    "corruption-risk language without sources",
    "propaganda-like framing",
    "pressure language",
    "authority overclaim",
    "mechanism gap",
    "translation caveat",
    "dignity-risk wording that does not meet hard-boundary criteria",
    "escalation risk",
    "repair question needed"
  ];

  function routeFor(categoryKey) {
    return HARD_BOUNDARY_CATEGORIES.find((category) => category.key === categoryKey) || null;
  }

  return {
    VERSION,
    PRINCIPLE,
    HARD_BOUNDARY_CATEGORIES,
    THRESHOLD_EXAMPLES,
    routeFor,
  };
})();
