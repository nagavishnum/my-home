export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const CURRENT_YEAR =
  new Date().getFullYear();

export const YEARS = Array.from(
  {
    length:
      Math.max(
        CURRENT_YEAR - 2026 + 1,
        1,
      ),
  },
  (_, index) =>
    String(
      CURRENT_YEAR - index,
    ),
);

export const PRIORITY_COLORS: Record<string, string> = {
  low: "#22c55e",
  medium: "#fbbf24",
  high: "#f97316",
  mandatory: "#ef4444",
};

export const CHART_COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export const FINANCE_BUCKETS = {
  // Everything you own that contributes to net worth
  ASSETS_BUCKET: [
    "ASSETS",
    "INVESTMENTS",
    "RETIREMENT F",
    "CHILD EDUC F",
    "ENTERTAINEMENT F",
    "CASH",
    "SAVINGS",
    "EMERGENCY F",
    "LENT",
  ],

  // Wealth creation assets only
  INVESTMENTS_BUCKET: [
    "INVESTMENTS",
    "RETIREMENT F",
    "CHILD EDUC F",
    "ENTERTAINEMENT F",
  ],

  // Immediately available money
  LIQUID_ASSETS_BUCKET: ["CASH", "SAVINGS", "EMERGENCY F"],

  // Physical / personal assets
  REAL_ASSETS_BUCKET: ["ASSETS"],

  // Retirement and long-term security
  RETIREMENT_BUCKET: ["RETIREMENT F"],

  // Goal-based funds
  GOALS_BUCKET: ["CHILD EDUC F", "ENTERTAINEMENT F", "GIFTS F"],

  // Money protection (not counted as assets)
  INSURANCE_BUCKET: ["HEALTH I", "LIFE I", "TERM I", "HEALTH F"],

  // Money you should receive back
  RECEIVABLES_BUCKET: ["LENT"],

  // What you owe
  LIABILITY_BUCKET: ["LOAN"],

  // Monthly cash flow obligations
  COMMITMENTS_BUCKET: ["EMI"],

  // Uncategorized
  OTHER_BUCKET: ["OTHER"],
};

export const EXPENSE_BUCKETS = {
  // -----------------------------
  // Essential / Regular Expenses
  // -----------------------------

  ESSENTIAL_BUCKET: [
    "HOME FOOD",

    "NEED",

    "MEDICINE",

    "HOME GOODS",
    "OUTSIDE HEALTHY FOOD",
  ],
  AVOID_BUCKET: ["OUTSIDE FOOD", "ENTERTAINMENT", "LUXURY", "CLOTHES"],

  // -----------------------------
  // Financial / Wealth Related
  // -----------------------------

  ASSET_BUCKET: ["ASSET"],

  // -----------------------------
  // Miscellaneous
  // -----------------------------

  OTHER_BUCKET: ["OTHER", "TRAVEL"],
};
export const EXPENSE_BUCKET_STYLES = {
  ESSENTIAL_BUCKET: {
    label: "Essential",
    color: "#2563eb",
  },

  AVOID_BUCKET: {
    label: "Avoid",
    color: "#dc2626",
  },

  ASSET_BUCKET: {
    label: "Asset",
    color: "#16a34a",
  },

  OTHER_BUCKET: {
    label: "Other",
    color: "#6b7280",
  },
};
