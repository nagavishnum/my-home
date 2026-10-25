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

export const CURRENT_YEAR = new Date().getFullYear();

export const YEARS = Array.from(
  {
    length: Math.max(CURRENT_YEAR - 2026 + 1, 1),
  },
  (_, index) => String(CURRENT_YEAR - index),
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
  /*
   * Everything explicitly classified
   * as an asset contributes to net worth.
   */
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
    "GIFTS F",
    "OTHER",
    "HEALTH F",
  ],

  /*
   * Wealth-producing / long-term
   * investment assets.
   */
  INVESTMENTS_BUCKET: [
    "INVESTMENTS",
    "RETIREMENT F",
    "CHILD EDUC F",
    "ENTERTAINEMENT F",
    "LENT",
  ],

  /*
   * Immediately accessible money.
   */
  LIQUID_ASSETS_BUCKET: ["CASH", "SAVINGS", "EMERGENCY F"],

  /*
   * Physical assets.
   */
  REAL_ASSETS_BUCKET: ["ASSETS"],

  /*
   * Retirement assets.
   */
  RETIREMENT_BUCKET: ["RETIREMENT F"],

  /*
   * Goal-based funds.
   */
  GOALS_BUCKET: ["CHILD EDUC F", "ENTERTAINEMENT F", "GIFTS F"],

  /*
   * Insurance is protection.
   *
   * It is deliberately NOT part
   * of ASSETS_BUCKET.
   */
  INSURANCE_BUCKET: ["HEALTH I", "LIFE I", "TERM I"],

  /*
   * Money receivable.
   *
   * LENT is explicitly classified
   * as an asset above, therefore it
   * contributes to net worth but does
   * not become an investment.
   */
  RECEIVABLES_BUCKET: ["LENT"],

  /*
   * Actual liability.
   *
   * EMI is intentionally NOT here.
   */
  LIABILITY_BUCKET: ["LOAN"],

  /*
   * Monthly commitments / cash flow.
   *
   * These do not become liabilities
   * merely because they are EMIs.
   */
  COMMITMENTS_BUCKET: ["EMI"],

  OTHER_BUCKET: ["OTHER"],
  TARGET_RELATED_BUCKET: ["ASSETS", "INVESTMENTS", "SAVINGS", "LENT"],
};
// Colors are used for category headings and their borders.
export const FINANCE_BUCKET_STYLES = {
  INVESTMENTS_BUCKET: {
    label: 'Investments',
    color: '#16a34a',
    background: '#f0fdf4',
  },
  RETIREMENT_BUCKET: {
    label: 'Retirement',
    color: '#15803d',
    background: '#f0fdf4',
  },
  GOALS_BUCKET: {
    label: 'Goal-based funds',
    color: '#7c3aed',
    background: '#f5f3ff',
  },
  LIQUID_ASSETS_BUCKET: {
    label: 'Liquid assets',
    color: '#2563eb',
    background: '#eff6ff',
  },
  REAL_ASSETS_BUCKET: {
    label: 'Physical assets',
    color: '#d97706',
    background: '#fffbeb',
  },
  RECEIVABLES_BUCKET: {
    label: 'Receivables',
    color: '#0d9488',
    background: '#f0fdfa',
  },
  INSURANCE_BUCKET: {
    label: 'Insurance',
    color: '#4f46e5',
    background: '#eef2ff',
  },
  LIABILITY_BUCKET: {
    label: 'Liabilities',
    color: '#dc2626',
    background: '#fef2f2',
  },
  COMMITMENTS_BUCKET: {
    label: 'Commitments',
    color: '#ea580c',
    background: '#fff7ed',
  },
  OTHER_BUCKET: {
    label: 'Other',
    color: '#6b7280',
    background: '#f9fafb',
  },
} as const;

export const EXPENSE_BUCKETS = {
  ESSENTIAL_BUCKET: [
    "HOME FOOD",
    "NEED",
    "MEDICINE",
    "HOME GOODS",
    "OUTSIDE HEALTHY FOOD",
  ],

  AVOID_BUCKET: ["OUTSIDE FOOD", "ENTERTAINMENT", "LUXURY", "CLOTHES"],

  ASSET_BUCKET: ["ASSET"],

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
