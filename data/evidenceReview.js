window.EPS_EVIDENCE_REVIEW = (() => {
  const VERSION = "eps-evidence-review-demo-0.12-16";
  const BOUNDARY = "Evidence reviewers add source and context notes. They do not decide truth, guilt, corruption, or legitimacy.";

  const NOTE_TYPES = [
    {
      id: "source_missing",
      label: "Source missing",
      summary: "The post makes a claim but no source is visible.",
      prompt: "What source, document, dataset, or direct evidence supports this claim?",
    },
    {
      id: "source_added",
      label: "Source added",
      summary: "A source or evidence path was added for human review.",
      prompt: "Review the source date, origin, relevance, and limitations before relying on it.",
    },
    {
      id: "claim_needs_context",
      label: "Claim needs context",
      summary: "The claim may be incomplete without historical, legal, local, or translation context.",
      prompt: "What surrounding context changes how this claim should be read?",
    },
    {
      id: "disputed",
      label: "Disputed",
      summary: "The available evidence or interpretation appears contested.",
      prompt: "Which parts are agreed, disputed, or not yet established?",
    },
    {
      id: "unverifiable_current_evidence",
      label: "Unverifiable from current evidence",
      summary: "The post cannot be verified from the visible material in this thread.",
      prompt: "What would make this claim reviewable without asking users to accept it on trust?",
    },
    {
      id: "translation_nuance",
      label: "Translation nuance",
      summary: "Meaning, tone, idiom, or political weight may shift across languages.",
      prompt: "Open the original and ask a native speaker or context-aware reviewer before judging intent.",
    },
  ];

  const DEMO_REVIEWERS = [
    { name: "Sofia Marin", country: "Spain", role: "evidence reviewer" },
    { name: "Lukas Vermeer", country: "Netherlands", role: "evidence reviewer" },
    { name: "Katarzyna Nowak", country: "Poland", role: "evidence reviewer" },
  ];

  function getNoteType(typeId) {
    return NOTE_TYPES.find((item) => item.id === typeId) || NOTE_TYPES[0];
  }

  function createEvidenceNote({ postId, postHash, typeId = "source_missing", reviewer = DEMO_REVIEWERS[0], note = "", source = "" } = {}) {
    const type = getNoteType(typeId);
    return {
      id: `evidence-note-${postId || postHash || "local"}-${type.id}-${Date.now().toString(36)}`,
      postId: postId || null,
      postHash: postHash || null,
      type: type.id,
      label: type.label,
      summary: type.summary,
      prompt: type.prompt,
      reviewerName: reviewer.name,
      reviewerCountry: reviewer.country,
      reviewerRole: reviewer.role || "evidence reviewer",
      note: note || type.prompt,
      source: source || "No external source attached in local prototype.",
      createdAt: "local demo session",
      boundary: BOUNDARY,
    };
  }

  function publicEvidenceSummary(note) {
    if (!note) return "No evidence note.";
    return `${note.label}: ${note.summary}`;
  }

  return {
    VERSION,
    BOUNDARY,
    NOTE_TYPES,
    DEMO_REVIEWERS,
    getNoteType,
    createEvidenceNote,
    publicEvidenceSummary,
  };
})();
