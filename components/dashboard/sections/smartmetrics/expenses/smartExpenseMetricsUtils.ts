// lib/expense/expenseWarningUtils.ts

import {
  ExpenseCategory,
  ExpenseMonth,
} from "./smartExpenseMetricsTypes";

/* =====================================================
   CONSTANTS
   ===================================================== */

export const ASSET_CATEGORY = "ASSET";

/* =====================================================
   NUMBER HELPERS
   ===================================================== */

export function toSafeNumber(
  value: unknown
): number {
  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : 0;
}

/* =====================================================
   ASSET
   ===================================================== */

export function getAssetAmount(
  month: ExpenseMonth
): number {
  const assetCategory =
    month.c?.find(
      (category) =>
        category?.n
          ?.trim()
          .toUpperCase() ===
        ASSET_CATEGORY
    );

  return toSafeNumber(
    assetCategory?.a
  );
}

/* =====================================================
   ACTUAL EXPENSE
   ===================================================== */

/**
 * Actual expense excludes ASSET.
 *
 * Example:
 *
 * Total = ₹1,408,529
 * Asset = ₹1,375,300
 *
 * Actual expense = ₹33,229
 */
export function getActualExpense(
  month: ExpenseMonth
): number {
  const total = toSafeNumber(month.t);
  const asset = getAssetAmount(month);

  return Math.max(
    0,
    total - asset
  );
}

/* =====================================================
   CATEGORY MAP
   ===================================================== */

export function getCategoryMap(
  month: ExpenseMonth
): Map<string, number> {
  const map = new Map<string, number>();

  if (!Array.isArray(month.c)) {
    return map;
  }

  month.c.forEach(
    (category: ExpenseCategory) => {
      const name =
        category?.n
          ?.trim()
          .toUpperCase();

      if (
        !name ||
        name === ASSET_CATEGORY
      ) {
        return;
      }

      const amount =
        toSafeNumber(category.a);

      map.set(
        name,
        (map.get(name) ?? 0) +
          amount
      );
    }
  );

  return map;
}

/* =====================================================
   CATEGORY AMOUNT
   ===================================================== */

export function getCategoryAmount(
  month: ExpenseMonth,
  categoryName: string
): number {
  return (
    getCategoryMap(month).get(
      categoryName
        .trim()
        .toUpperCase()
    ) ?? 0
  );
}

/* =====================================================
   PERCENTAGE
   ===================================================== */

export function getPercentageChange(
  current: number,
  previous: number
): number {
  if (previous <= 0) {
    return current > 0
      ? 100
      : 0;
  }

  return (
    ((current - previous) /
      previous) *
    100
  );
}

/* =====================================================
   FORMATTING
   ===================================================== */

export function formatAmount(
  amount: number
): string {
  return `₹${Math.round(
    toSafeNumber(amount)
  ).toLocaleString("en-IN")}`;
}

export function formatPercent(
  percent: number
): string {
  return `${Math.abs(
    percent
  ).toFixed(1)}%`;
}

export function formatCategoryName(
  category: string
): string {
  return category
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

/* =====================================================
   BASELINE
   ===================================================== */

export const MAX_BASELINE_MONTHS = 6;

/**
 * Uses up to the previous 6 months.
 *
 * Example:
 *
 * May
 * June
 * July
 * August ← current
 *
 * Baseline = May + June + July
 *
 * If we have 12 months:
 *
 * Baseline = previous 6 months only.
 */
export function getBaselineMonths(
  months: ExpenseMonth[]
): ExpenseMonth[] {
  return months
    .slice(0, -1)
    .slice(-MAX_BASELINE_MONTHS);
}

export function getAverageExpense(
  months: ExpenseMonth[]
): number {
  if (!months.length) {
    return 0;
  }

  const total = months.reduce(
    (sum, month) =>
      sum + getActualExpense(month),
    0
  );

  return total / months.length;
}

/* =====================================================
   UNIQUE CATEGORIES
   ===================================================== */

export function getAllCategories(
  latestMonth: ExpenseMonth,
  previousMonth: ExpenseMonth
): Set<string> {
  const categories =
    new Set<string>();

  getCategoryMap(
    latestMonth
  ).forEach((_, category) =>
    categories.add(category)
  );

  getCategoryMap(
    previousMonth
  ).forEach((_, category) =>
    categories.add(category)
  );

  return categories;
}