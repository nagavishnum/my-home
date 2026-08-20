// lib/expense/expenseWarningTypes.ts

export type WarningType =
  | "danger"
  | "warning"
  | "success";

export type Warning = {
  type: WarningType;
  title: string;
  value: string;
  priority: number;
};

export type ExpenseCategory = {
  n?: string;
  a?: number | string | null;
};

export type ExpenseMonth = {
  m?: string;
  t?: number | string | null;
  c?: ExpenseCategory[] | null;
};

export type ExpenseAnalysis = {
  latestMonth: ExpenseMonth;
  latestExpense: number;

  previousMonth: ExpenseMonth | null;
  previousExpense: number;

  baselineMonths: ExpenseMonth[];
  baselineExpenseAverage: number;
  hasBaselineHistory: boolean;
};