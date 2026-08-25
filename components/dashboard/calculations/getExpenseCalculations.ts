import { ExpenseSummaryData } from "@/lib/types";
import { get } from "http";

export const getExpenseCalculations = (
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
    expenseSummaryData,
    getExpenseAmount,
  };
};
