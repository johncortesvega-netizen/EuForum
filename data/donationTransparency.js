window.EPS_DONATION_TRANSPARENCY = (() => {
  const MONTHLY_COSTS = [
    { category: "Server hosting", amount: 24, cadence: "monthly", note: "Small prototype server and database." },
    { category: "Domain reserve", amount: 2, cadence: "monthly reserve", note: "Annual domain cost reserved monthly." },
    { category: "Backups", amount: 5, cadence: "monthly", note: "Basic backup storage." },
    { category: "Security monitoring", amount: 0, cadence: "not active", note: "Planned before public launch." },
    { category: "Translation/API", amount: 0, cadence: "not active", note: "No real translation provider connected yet." },
    { category: "Human review support", amount: 0, cadence: "not active", note: "Volunteer/demo-only in this prototype." },
  ];

  const PUBLIC_SPENDING_RECEIPTS = [
    {
      id: "spend-demo-2026-05-server",
      date: "2026-05",
      amount: 24,
      category: "Server hosting",
      reason: "Prototype hosting estimate",
      coveredPeriod: "May 2026",
      publicNote: "Mock receipt for transparency model; no payment processor is connected.",
      proofAvailable: false,
    },
    {
      id: "spend-demo-2026-05-backups",
      date: "2026-05",
      amount: 5,
      category: "Backups",
      reason: "Backup reserve estimate",
      coveredPeriod: "May 2026",
      publicNote: "Mock receipt showing how spending records should be public.",
      proofAvailable: false,
    },
  ];

  const SUMMARY = {
    month: "May 2026",
    donationsReceived: 184.2,
    totalSpent: PUBLIC_SPENDING_RECEIPTS.reduce((sum, item) => sum + item.amount, 0),
    reserve: 155.2,
    currency: "EUR",
    boundary: "Donations buy no influence over speech, moderation, visibility, ranking, protocol rules, or governance.",
  };

  return {
    MONTHLY_COSTS,
    PUBLIC_SPENDING_RECEIPTS,
    SUMMARY,
  };
})();
