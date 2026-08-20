// components/FinancialWarningSystem.tsx

import { useMemo } from "react";

import { ExpenseSummaryData } from "@/lib/types";
import { ExpenseMonth, Warning } from "./smartmetrics/expenses/smartExpenseMetricsTypes";
import { formatAmount, getActualExpense, getAverageExpense, getBaselineMonths } from "./smartmetrics/expenses/smartExpenseMetricsUtils";
import { getCategoryImprovements, getCategoryWarnings, getDominanceWarning, getOtherWarning, getRepeatedCategoryWarnings, getTotalExpenseImprovement, getTotalExpenseWarning, limitCategoryWarnings, removeDuplicateWarnings, sortWarnings } from "./smartmetrics/expenses/smartExpenseMetricsRules";

type WarningProps = {
  expensesSummaryData:
    | ExpenseSummaryData
    | null;
};

/* =====================================================
   WARNING CALCULATION
   ===================================================== */

function calculateWarnings(
  months: ExpenseMonth[]
): {
  warnings: Warning[];
  latestMonth: ExpenseMonth;
  latestExpense: number;
  averageExpense: number;
  hasBaselineHistory: boolean;
} {
  const latestMonth =
    months[months.length - 1];

  const previousMonth =
    months.length > 1
      ? months[months.length - 2]
      : null;

  const latestExpense =
    getActualExpense(
      latestMonth
    );

  const previousExpense =
    previousMonth
      ? getActualExpense(
          previousMonth
        )
      : 0;

  /* ===================================================
     BASELINE
     =================================================== */

  const baselineMonths =
    getBaselineMonths(
      months
    );

  const hasBaselineHistory =
    baselineMonths.length > 0;

  const averageExpense =
    getAverageExpense(
      baselineMonths
    );

  const warnings: Warning[] =
    [];

  /* ===================================================
     1. TOTAL EXPENSE WARNING
     =================================================== */

  const totalWarning =
    getTotalExpenseWarning(
      latestExpense,
      previousExpense,
      averageExpense,
      hasBaselineHistory
    );

  if (totalWarning) {
    warnings.push(
      totalWarning
    );
  }

  /* ===================================================
     2. TOTAL EXPENSE IMPROVEMENT
     =================================================== */

  const totalImprovement =
    getTotalExpenseImprovement(
      latestExpense,
      previousExpense,
      averageExpense,
      hasBaselineHistory,
      totalWarning?.type ===
        "danger"
    );

  if (totalImprovement) {
    warnings.push(
      totalImprovement
    );
  }

  /* ===================================================
     3. CATEGORY WARNINGS + IMPROVEMENTS
     =================================================== */

  if (previousMonth) {
    const categoryWarnings =
      getCategoryWarnings(
        latestMonth,
        previousMonth
      );

    const categoryImprovements =
      getCategoryImprovements(
        latestMonth,
        previousMonth
      );

    /**
     * Don't show a category improvement for a
     * category that also has a spike warning.
     */
    const categoryWarningNames =
      new Set(
        categoryWarnings.map(
          (warning) =>
            warning.title
        )
      );

    const filteredImprovements =
      categoryImprovements.filter(
        (improvement) => {
          const categoryName =
            improvement.title
              .replace(
                " spending improved",
                ""
              )
              .toLowerCase();

          return !categoryWarnings.some(
            (warning) =>
              warning.title
                .toLowerCase()
                .startsWith(
                  categoryName
                )
          );
        }
      );

    warnings.push(
      ...limitCategoryWarnings([
        ...categoryWarnings,
        ...filteredImprovements,
      ])
    );
  }

  /* ===================================================
     4. CATEGORY DOMINANCE
     =================================================== */

  const dominanceWarning =
    getDominanceWarning(
      latestMonth,
      latestExpense
    );

  if (dominanceWarning) {
    warnings.push(
      dominanceWarning
    );
  }

  /* ===================================================
     5. REPEATED HIGH CATEGORIES
     =================================================== */

  const repeatedWarnings =
    getRepeatedCategoryWarnings(
      months
    );

  repeatedWarnings.forEach(
    (warning) => {
      /**
       * Don't duplicate a category warning that
       * already exists as a stronger alert.
       */
      const exists =
        warnings.some(
          (existing) =>
            existing.title
              .toLowerCase()
              .includes(
                warning.title
                  .replace(
                    " has remained high",
                    ""
                  )
                  .toLowerCase()
              )
        );

      if (!exists) {
        warnings.push(
          warning
        );
      }
    }
  );

  /* ===================================================
     6. OTHER / UNCLASSIFIED
     =================================================== */

  const otherWarning =
    getOtherWarning(
      latestMonth,
      latestExpense
    );

  if (otherWarning) {
    warnings.push(
      otherWarning
    );
  }

  /* ===================================================
     FINALIZE
     =================================================== */

  const uniqueWarnings =
    removeDuplicateWarnings(
      warnings
    );

  return {
    warnings:
      sortWarnings(
        uniqueWarnings
      ),
    latestMonth,
    latestExpense,
    averageExpense,
    hasBaselineHistory,
  };
}

/* =====================================================
   COMPONENT
   ===================================================== */

export function FinancialWarningSystem({
  expensesSummaryData,
}: WarningProps) {
  const months =
    useMemo<ExpenseMonth[]>(
      () =>
        Array.isArray(
          expensesSummaryData?.months
        )
          ? (expensesSummaryData
              ?.months ?? []) as ExpenseMonth[]
          : [],
      [expensesSummaryData]
    );

  const analysis =
    useMemo(
      () =>
        months.length
          ? calculateWarnings(
              months
            )
          : null,
      [months]
    );

  /* ===================================================
     NO DATA
     =================================================== */

  if (!analysis) {
    return (
      <section className="chart-card">
        <h3>
          📊 Expense Intelligence
        </h3>

        <p>
          No expense data available
          yet.
        </p>
      </section>
    );
  }

  const {
    warnings,
    latestMonth,
    latestExpense,
    averageExpense,
    hasBaselineHistory,
  } = analysis;

  /* ===================================================
     RENDER
     =================================================== */

  return (
    <section className="chart-card">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
            }}
          >
            📊 Expense Intelligence
          </h3>

          <p
            style={{
              margin:
                "4px 0 0",
              fontSize: 13,
              color:
                "#6b7280",
            }}
          >
            Expense signals for{" "}
            {latestMonth.m ??
              "latest month"}
          </p>
        </div>

        <div
          style={{
            textAlign: "right",
          }}
        >
          <strong
            style={{
              fontSize: 18,
            }}
          >
            {formatAmount(
              latestExpense
            )}
          </strong>

          <div
            style={{
              fontSize: 11,
              color:
                "#6b7280",
            }}
          >
            actual expenses
          </div>
        </div>
      </div>

      {/* Alerts */}
      {!warnings.length ? (
        <div
          style={{
            padding:
              "14px 16px",
            borderRadius: 8,
            border:
              "1px solid #e5e7eb",
          }}
        >
          <div>
            🟢 No major expense
            warnings.
          </div>

          <p
            style={{
              margin:
                "6px 0 0",
              fontSize: 13,
              color:
                "#6b7280",
            }}
          >
            Your spending looks
            stable based on the
            available data.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 10,
          }}
        >
          {warnings.map(
            (
              warning,
              index
            ) => {
              const icon =
                warning.type ===
                "danger"
                  ? "🔴"
                  : warning.type ===
                    "warning"
                  ? "🟡"
                  : "🟢";

              return (
                <div
                  key={`${warning.type}-${warning.title}-${warning.value}-${index}`}
                  style={{
                    padding:
                      "12px 14px",
                    borderRadius: 8,
                    border:
                      "1px solid #e5e7eb",
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    gap: 16,
                  }}
                >
                  <span>
                    {icon}{" "}
                    {warning.title}
                  </span>

                  <strong>
                    {warning.value}
                  </strong>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* Baseline */}
      {hasBaselineHistory &&
        averageExpense > 0 && (
          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              color:
                "#6b7280",
            }}
          >
            Recent{" "}
            {Math.min(
              months.length - 1,
              6
            )}
            -month average:{" "}
            <strong>
              {formatAmount(
                averageExpense
              )}
            </strong>

            {" · "}

            Current:{" "}
            <strong>
              {formatAmount(
                latestExpense
              )}
            </strong>
          </div>
        )}
    </section>
  );
}