// lib/expense/expenseWarningRules.ts

import {
  Warning,
  ExpenseMonth,
} from "./smartExpenseMetricsTypes";

import {
  formatAmount,
  formatCategoryName,
  formatPercent,
  getCategoryAmount,
  getCategoryMap,
  getPercentageChange,
} from "./smartExpenseMetricsUtils";

/* =====================================================
   CONFIGURATION
   ===================================================== */

/**
 * Total expense
 */
const TOTAL_EXPENSE_DANGER_PERCENT = 40;
const TOTAL_EXPENSE_WARNING_PERCENT = 25;
const TOTAL_EXPENSE_MIN_INCREASE = 5000;

/**
 * Category increase
 */
const CATEGORY_SPIKE_PERCENT = 50;
const CATEGORY_SPIKE_MIN_INCREASE = 1000;

/**
 * Category dominance
 */
const CATEGORY_DOMINANCE_DANGER_PERCENT = 75;
const CATEGORY_DOMINANCE_WARNING_PERCENT = 60;

/**
 * Repeated high category
 */
const REPEATED_CATEGORY_MIN_AMOUNT = 2000;
const REPEATED_CATEGORY_MONTHS = 3;

/**
 * Other
 */
const OTHER_WARNING_AMOUNT = 3000;
const OTHER_DANGER_PERCENT = 10;

/**
 * Improvement
 *
 * We intentionally use a lower amount than the
 * total-expense improvement threshold.
 *
 * Example:
 *
 * Outside Food:
 * ₹3,026 → ₹2,270
 *
 * Saved ₹756
 * ↓25%
 *
 * This is meaningful enough to show as green.
 */
const CATEGORY_IMPROVEMENT_PERCENT = 20;
const CATEGORY_IMPROVEMENT_MIN_SAVING = 500;
const CATEGORY_IMPROVEMENT_MIN_PREVIOUS = 2000;

/**
 * Maximum category alerts.
 */
const MAX_CATEGORY_ALERTS = 5;

/* =====================================================
   TOTAL EXPENSE ALERT
   ===================================================== */

export function getTotalExpenseWarning(
  latestExpense: number,
  previousExpense: number,
  averageExpense: number,
  hasBaselineHistory: boolean
): Warning | null {
  const baseline = hasBaselineHistory
    ? averageExpense
    : previousExpense;

  if (baseline <= 0) {
    return null;
  }

  const percentageChange =
    getPercentageChange(
      latestExpense,
      baseline
    );

  const absoluteChange =
    latestExpense - baseline;

  if (
    percentageChange >=
      TOTAL_EXPENSE_DANGER_PERCENT &&
    absoluteChange >=
      TOTAL_EXPENSE_MIN_INCREASE
  ) {
    return {
      type: "danger",
      title:
        "Expenses are significantly above your recent average",
      value: `+ ${formatPercent(
        percentageChange
      )}`,
      priority: 1,
    };
  }

  if (
    percentageChange >=
      TOTAL_EXPENSE_WARNING_PERCENT &&
    absoluteChange >=
      TOTAL_EXPENSE_MIN_INCREASE
  ) {
    return {
      type: "warning",
      title:
        "Expenses are above your recent average",
      value: `+ ${formatPercent(
        percentageChange
      )}`,
      priority: 2,
    };
  }

  return null;
}

/* =====================================================
   TOTAL EXPENSE IMPROVEMENT
   ===================================================== */

export function getTotalExpenseImprovement(
  latestExpense: number,
  previousExpense: number,
  averageExpense: number,
  hasBaselineHistory: boolean,
  hasDangerWarning: boolean
): Warning | null {
  /**
   * Don't show "expenses improving" while total
   * spending itself has a danger alert.
   */
  if (hasDangerWarning) {
    return null;
  }

  const baseline = hasBaselineHistory
    ? averageExpense
    : previousExpense;

  if (baseline <= 0) {
    return null;
  }

  const percentageChange =
    getPercentageChange(
      latestExpense,
      baseline
    );

  const saving =
    baseline - latestExpense;

  if (
    percentageChange <= -20 &&
    saving >= 3000
  ) {
    return {
      type: "success",
      title:
        "Great! Your overall expenses are improving",
      value: `- ${formatPercent(
        percentageChange
      )} saved ${formatAmount(
        saving
      )}`,
      priority: 5,
    };
  }

  return null;
}

/* =====================================================
   CATEGORY ANALYSIS
   ===================================================== */

export function getCategoryWarnings(
  latestMonth: ExpenseMonth,
  previousMonth: ExpenseMonth
): Warning[] {
  const latestCategories =
    getCategoryMap(
      latestMonth
    );

  const previousCategories =
    getCategoryMap(
      previousMonth
    );

  const warnings: Warning[] = [];

  latestCategories.forEach(
    (latestAmount, category) => {
      const previousAmount =
        previousCategories.get(
          category
        ) ?? 0;

      /**
       * New category
       */
      if (
        previousAmount === 0 &&
        latestAmount >=
          CATEGORY_SPIKE_MIN_INCREASE
      ) {
        warnings.push({
          type: "warning",
          title:
            `New ${formatCategoryName(
              category
            )} spending`,
          value:
            formatAmount(
              latestAmount
            ),
          priority: 4,
        });

        return;
      }

      if (previousAmount <= 0) {
        return;
      }

      const percentageChange =
        getPercentageChange(
          latestAmount,
          previousAmount
        );

      const absoluteChange =
        latestAmount -
        previousAmount;

      /**
       * Category increased significantly.
       */
      if (
        percentageChange >=
          CATEGORY_SPIKE_PERCENT &&
        absoluteChange >=
          CATEGORY_SPIKE_MIN_INCREASE
      ) {
        /**
         * Use danger only when the actual
         * increase is meaningful.
         */
        const isMajorIncrease =
          absoluteChange >= 5000 ||
          percentageChange >= 75;

        warnings.push({
          type: isMajorIncrease
            ? "danger"
            : "warning",

          title:
            `${formatCategoryName(
              category
            )} spending increased`,

          value:
            `+ ${formatPercent(
              percentageChange
            )} + ${formatAmount(
              absoluteChange
            )}`,

          priority: isMajorIncrease
            ? 2
            : 3,
        });
      }
    }
  );

  return warnings;
}

/* =====================================================
   CATEGORY IMPROVEMENTS
   ===================================================== */

export function getCategoryImprovements(
  latestMonth: ExpenseMonth,
  previousMonth: ExpenseMonth
): Warning[] {
  const latestCategories =
    getCategoryMap(
      latestMonth
    );

  const previousCategories =
    getCategoryMap(
      previousMonth
    );

  const improvements: Warning[] = [];

  previousCategories.forEach(
    (previousAmount, category) => {
      const latestAmount =
        latestCategories.get(
          category
        ) ?? 0;

      if (
        previousAmount <
        CATEGORY_IMPROVEMENT_MIN_PREVIOUS
      ) {
        return;
      }

      if (
        latestAmount >=
        previousAmount
      ) {
        return;
      }

      const percentageChange =
        getPercentageChange(
          latestAmount,
          previousAmount
        );

      const saving =
        previousAmount -
        latestAmount;

      if (
        percentageChange <=
          -CATEGORY_IMPROVEMENT_PERCENT &&
        saving >=
          CATEGORY_IMPROVEMENT_MIN_SAVING
      ) {
        improvements.push({
          type: "success",
          title:
            `${formatCategoryName(
              category
            )} spending improved`,

          value:
            `- ${formatPercent(
              percentageChange
            )} saved ${formatAmount(
              saving
            )}`,

          priority: 5,
        });
      }
    }
  );

  /**
   * Biggest improvements first.
   *
   * Extract saving from the displayed value is
   * intentionally avoided. Instead sort using
   * the actual calculated amounts again.
   */
  improvements.sort((a, b) => {
    const aSaving =
      extractAmountFromValue(
        a.value
      );

    const bSaving =
      extractAmountFromValue(
        b.value
      );

    return bSaving - aSaving;
  });

  return improvements;
}

/**
 * Safe helper for values generated internally
 * such as:
 *
 * "-69.2% · saved ₹3,195"
 */
function extractAmountFromValue(
  value: string
): number {
  const match =
    value.match(
      /saved\s+₹([\d,]+)/
    );

  if (!match) {
    return 0;
  }

  return Number(
    match[1].replace(/,/g, "")
  ) || 0;
}

/* =====================================================
   CATEGORY DOMINANCE
   ===================================================== */

export function getDominanceWarning(
  latestMonth: ExpenseMonth,
  latestExpense: number
): Warning | null {
  if (latestExpense <= 0) {
    return null;
  }

  const categories =
    getCategoryMap(
      latestMonth
    );

  let dominantCategory:
    | string
    | null = null;

  let dominantAmount = 0;

  categories.forEach(
    (amount, category) => {
      if (
        amount >
        dominantAmount
      ) {
        dominantAmount =
          amount;

        dominantCategory =
          category;
      }
    }
  );

  if (
    !dominantCategory ||
    dominantAmount <= 0
  ) {
    return null;
  }

  const percentage =
    (dominantAmount /
      latestExpense) *
    100;

  if (
    percentage >=
    CATEGORY_DOMINANCE_DANGER_PERCENT
  ) {
    return {
      type: "danger",
      title:
        `${formatCategoryName(
          dominantCategory
        )} dominates your spending`,
      value:
        `${percentage.toFixed(
          1
        )}%`,
      priority: 2,
    };
  }

  if (
    percentage >=
    CATEGORY_DOMINANCE_WARNING_PERCENT
  ) {
    return {
      type: "warning",
      title:
        `${formatCategoryName(
          dominantCategory
        )} is your largest expense`,
      value:
        `${percentage.toFixed(
          1
        )}%`,
      priority: 3,
    };
  }

  return null;
}

/* =====================================================
   REPEATED HIGH CATEGORY
   ===================================================== */

export function getRepeatedCategoryWarnings(
  months: ExpenseMonth[]
): Warning[] {
  if (
    months.length <
    REPEATED_CATEGORY_MONTHS
  ) {
    return [];
  }

  const recentMonths =
    months.slice(
      -REPEATED_CATEGORY_MONTHS
    );

  const occurrences =
    new Map<string, number>();

  recentMonths.forEach(
    (month) => {
      const categories =
        getCategoryMap(
          month
        );

      categories.forEach(
        (amount, category) => {
          if (
            amount >=
            REPEATED_CATEGORY_MIN_AMOUNT
          ) {
            occurrences.set(
              category,
              (occurrences.get(
                category
              ) ?? 0) + 1
            );
          }
        }
      );
    }
  );

  const warnings: Warning[] =
    [];

  occurrences.forEach(
    (count, category) => {
      if (
        count !==
        REPEATED_CATEGORY_MONTHS
      ) {
        return;
      }

      const latestAmount =
        getCategoryAmount(
          recentMonths[
            recentMonths.length - 1
          ],
          category
        );

      warnings.push({
        type: "warning",
        title:
          `${formatCategoryName(
            category
          )} has remained high`,
        value:
          `${formatAmount(
            latestAmount
          )} for ${REPEATED_CATEGORY_MONTHS} months`,
        priority: 4,
      });
    }
  );

  return warnings;
}

/* =====================================================
   OTHER CATEGORY
   ===================================================== */

export function getOtherWarning(
  latestMonth: ExpenseMonth,
  latestExpense: number
): Warning | null {
  const otherAmount =
    getCategoryAmount(
      latestMonth,
      "OTHER"
    );

  if (
    otherAmount <
    OTHER_WARNING_AMOUNT
  ) {
    return null;
  }

  const percentage =
    latestExpense > 0
      ? (otherAmount /
          latestExpense) *
        100
      : 0;

  if (
    percentage >=
    OTHER_DANGER_PERCENT
  ) {
    return {
      type: "danger",
      title:
        "Too much spending is unclassified",
      value:
        `${formatAmount(
          otherAmount
        )} (${percentage.toFixed(
          1
        )}%)`,
      priority: 2,
    };
  }

  return {
    type: "warning",
    title:
      "High unclassified spending",
    value:
      formatAmount(
        otherAmount
      ),
    priority: 4,
  };
}

/* =====================================================
   DEDUPLICATION
   ===================================================== */

export function removeDuplicateWarnings(
  warnings: Warning[]
): Warning[] {
  const seen =
    new Set<string>();

  return warnings.filter(
    (warning) => {
      const key =
        `${warning.type}|${warning.title}|${warning.value}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    }
  );
}

/* =====================================================
   SORT
   ===================================================== */

export function sortWarnings(
  warnings: Warning[]
): Warning[] {
  return [...warnings].sort(
    (a, b) => {
      if (
        a.priority !==
        b.priority
      ) {
        return (
          a.priority -
          b.priority
        );
      }

      /**
       * When priority is equal:
       *
       * danger → warning → success
       */
      const severity = {
        danger: 1,
        warning: 2,
        success: 3,
      };

      return (
        severity[a.type] -
        severity[b.type]
      );
    }
  );
}

/* =====================================================
   CATEGORY ALERT LIMIT
   ===================================================== */

export function limitCategoryWarnings(
  warnings: Warning[]
): Warning[] {
  /**
   * Keep at least one improvement if available.
   *
   * First sort by priority.
   */
  const sorted =
    sortWarnings(warnings);

  const improvements =
    sorted.filter(
      (warning) =>
        warning.type ===
        "success"
    );

  const nonImprovements =
    sorted.filter(
      (warning) =>
        warning.type !==
        "success"
    );

  const selected =
    nonImprovements.slice(
      0,
      MAX_CATEGORY_ALERTS -
        Math.min(
          improvements.length,
          2
        )
    );

  return [
    ...selected,
    ...improvements.slice(
      0,
      2
    ),
  ];
}