"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

import {
  Finance,
  PaginatedResponse,
  ExpenseYearlySummary,
  FinanceSnapshot,
  ExpenseSummaryData,
} from "@/lib/types";

import { getFinanceCalculations } from "./calculations/getFinanceCalculations";

export function useDashboardData() {
  const currentDate = new Date();

  const initialYear = currentDate.getFullYear();

  const currentMonth = currentDate.getMonth() + 1;

  const [expenseSummaryData, setExpenseSummaryData] =
    useState<ExpenseYearlySummary | null>(null);

  const [finance, setFinance] = useState<Finance[]>([]);

  const [financeSnapshots, setFinanceSnapshots] = useState<FinanceSnapshot[]>(
    [],
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [summaryResponse, financeResponse, snapshotResponse] =
          await Promise.all([
            api.get<ExpenseYearlySummary>(
              `/expenses/yearly-summary?year=${initialYear}`,
            ),

            api.get<PaginatedResponse<Finance>>("/finance?limit=200"),

            api.get<{
              data: FinanceSnapshot[];
            }>(
              `/finance-snapshots?from=${
                initialYear - 1
              }12&to=${initialYear}12`,
            ),
          ]);

        setExpenseSummaryData(summaryResponse.data);

        setFinance(financeResponse.data.data);

        setFinanceSnapshots(snapshotResponse.data.data);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [initialYear]);

  const financeExpenseSummaryData = (() => {
    if (!expenseSummaryData) {
      return null;
    }

    return {
      ...expenseSummaryData,
      months: [...(expenseSummaryData.months ?? [])],
    };
  })();

const getExpenseCalculations = (
  expenseSummaryData: ExpenseSummaryData | null = null,
) => {
  const expenseSummaryCategories = Array.from(
    new Set(
      expenseSummaryData?.months?.flatMap((month) =>
        month.c.map((category) => category.n),
      ) ?? [],
    ),
  );

  const getExpenseAmount = (
    month: ExpenseSummaryData["months"][number],
    category: string,
  ): number => {
    return month.c.find((item) => item.n === category)?.a ?? 0;
  };
  return {
    expenseSummaryCategories,
    getExpenseAmount,
  };
};
  const financeCalculations = getFinanceCalculations(
    finance,
    financeExpenseSummaryData,
    financeSnapshots,
    currentMonth,
  );

  const expenseCalculations = getExpenseCalculations(expenseSummaryData);
  const postExpensesData = async (payload: {
    a: number;
    c: string;
    d: string;
  }) => {
    try {
      await api.post("/expenses", payload);
      await api.post("/expenses/compress");
      const ExpenseYearlySummary = await api.get<ExpenseYearlySummary>(
        `/expenses/yearly-summary?year=${initialYear}`,
      );
      setExpenseSummaryData(ExpenseYearlySummary.data);
    } catch (error) {
      console.error("Failed to post expenses data:", error);
    }
  };
  return {
    expenseSummaryData,
    ...expenseCalculations,
    finance,
    financeSnapshots,
    ...financeCalculations,
    loading,
    postExpensesData,
  };
}
