// Clarify only. No truth verdict. No enforcement.
window.EPS_PROTOCOL = (() => {
  const RULES = [
    {
      id: "strong_integrity_claim",
      label: "Evidence prompt",
      category: "evidence_gap",
      terms: [
        "corrupt", "corruption", "fraud", "stolen", "criminal", "bribe", "bribery",
        "omkoping", "corruptie", "fraude", "gestolen", "crimineel", "liegen", "lie", "lying"
      ],
      prompt: "Strong integrity claim - ask for source, scope, and evidence before treating it as established.",
      explanation: "The text may make or discuss a claim about corruption, fraud, lying, or wrongdoing. The protocol clarifies that evidence and scope are needed.",
      boundary: "This does not declare corruption, guilt, illegality, intent, or truth."
    },
    {
      id: "pressure_urgency",
      label: "Pressure prompt",
      category: "pressure",
      terms: [
        "must", "now", "immediately", "no choice", "only option", "you have to", "trust us",
        "geen keuze", "nu meteen", "moet", "moeten", "vertrouw ons", "enige optie"
      ],
      prompt: "Pressure or urgency language - clarify whether people can pause, disagree, or ask questions.",
      explanation: "The text may reduce room for pause, disagreement, or review by creating urgency or necessity pressure.",
      boundary: "This does not prove coercion or manipulation. Context may change the reading."
    },
    {
      id: "dignity_escalation",
      label: "Dignity prompt",
      category: "dignity_risk",
      terms: [
        "they all", "these people", "vermin", "enemy", "traitor", "silence them", "shut them up",
        "verraders", "vijand", "monddood", "ongedierte", "dat soort mensen"
      ],
      prompt: "Dignity or escalation risk - clarify who is meant and avoid reducing people to threat labels.",
      explanation: "The text may generalize, escalate, or reduce people into a hostile group label.",
      boundary: "This does not decide intent or require removal. Moderation handles direct harm separately."
    },
    {
      id: "authority_overclaim",
      label: "Authority prompt",
      category: "authority_overclaim",
      terms: [
        "only we can", "we alone", "final decision", "no appeal", "beyond question", "undeniable",
        "alleen wij", "geen bezwaar", "definitief besluit", "onbetwistbaar"
      ],
      prompt: "Authority claim - clarify who has authority, what mechanism exists, and whether appeal remains possible.",
      explanation: "The text may claim authority or necessity without showing the review or appeal mechanism.",
      boundary: "This does not reject the claim. It asks for mechanism and reviewability."
    },
    {
      id: "mechanism_gap",
      label: "Mechanism prompt",
      category: "mechanism_gap",
      terms: [
        "safe", "transparent", "accountable", "fair", "trusted", "ethical", "secure",
        "veilig", "transparant", "eerlijk", "verantwoord", "ethisch", "betrouwbaar"
      ],
      prompt: "Mechanism gap - clarify what concrete safeguard makes this claim reviewable.",
      explanation: "The text may use trust or safety language without showing the mechanism behind it.",
      boundary: "This does not say the claim is false. It asks how the claim is supported."
    },
    {
      id: "evidence_path_visible",
      label: "Evidence path",
      category: "evidence_path",
      terms: ["source", "evidence", "proof", "data", "citation", "bewijs", "bron", "cijfers", "rapport"],
      prompt: "Evidence path visible - keep the source, date, and scope clear so others can review it.",
      explanation: "The text mentions sources or evidence, which can help keep the discussion reviewable if details are provided.",
      boundary: "Mentioning evidence is not proof by itself. The source still needs review."
    }
  ];

  const QUOTE_CONTEXT = /(example|for example|quote|quoted|someone said|i saw a post|waarschuwt|voorbeeld|citaat|zei dat|ik zag)/i;

  function normalize(text) {
    return String(text || "").toLowerCase();
  }

  function findMatches(lower, terms) {
    return terms.filter((term) => lower.includes(term.toLowerCase()));
  }

  function buildTrace(originalText, term) {
    const lower = normalize(originalText);
    const index = lower.indexOf(term.toLowerCase());
    if (index < 0) return "";
    const start = Math.max(0, index - 34);
    const end = Math.min(originalText.length, index + term.length + 34);
    return originalText.slice(start, end).trim();
  }

  function analyzeProtocol(text) {
    const original = String(text || "");
    const lower = normalize(original);
    const isQuoteContext = QUOTE_CONTEXT.test(original);
    const prompts = [];

    for (const rule of RULES) {
      const matches = findMatches(lower, rule.terms);
      if (!matches.length) continue;
      prompts.push({
        id: rule.id,
        label: rule.label,
        category: rule.category,
        severity: "clarify",
        prompt: rule.prompt,
        explanation: rule.explanation,
        boundary: rule.boundary,
        matches,
        traces: matches.slice(0, 3).map((match) => ({ match, context: buildTrace(original, match) })),
        quoteContext: isQuoteContext,
        quoteContextNote: isQuoteContext
          ? "Possible quote/example context detected. Treat the prompt as a request for clarification, not as a claim about the author."
          : "No quote/example context detected in this simple local scan."
      });
    }

    return {
      engine: "Sydney Protocol language-trigger receipt layer",
      version: "eps-protocol-demo-0.4",
      decisionBoundary: "Language-trigger receipts only. No pre-selected prompt. No truth verdict. No enforcement action. No ranking. No moderation action.",
      triggerCount: prompts.length,
      prompts
    };
  }

  return { analyzeProtocol, RULES };
})();
