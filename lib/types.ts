export interface Category {
  _id: string;
  n: string;
  t: string;
}

export interface Expense {
  _id: string;
  a: number;
  r: string;
  c: Category | null;
  d: string;
}
export interface DailyTodo {
  _id: string;
  t: string;
  d: string;
}

export interface Finance {
  _id: string;
  n: string;
  a: number;
  cv?: number;
  sv?: number; // SIP total invested value
  c?: {
    _id: string;
    n: string;
  };
  ty: 'Monthly' | 'OneTime';
  md?: string;
  lp?: number;
  rt?: number;
  no?: string;
}

export interface Todo {
  _id: string;
  t: string;
  ti: string;
  da: string;
  p: string;
  s: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
export type ExpenseSummaryCategory = {
  n: string;
  a: number;
};

export type ExpenseSummaryMonth = {
  m: string;
  t: number;
  c: ExpenseSummaryCategory[];
};

export type ExpenseYearlySummary = {
  year: number;
  months: ExpenseSummaryMonth[];
};
export type ExpenseSummaryData = {
  year: number;
  months: ExpenseSummaryMonth[];
};
export type DashboardExpenseResponse = {
  totalExpenseValue: number;
  selectedMonthExpenseValue: number;

  categoryTotals: {
    categoryId: string;
    categoryName: string;
    amount: number;
  }[];
};
export interface ReportCategory {
  categoryId: string;
  categoryName: string;
  amount: number;
}

export interface MonthlyExpenseReport {
  expenses: {
    year: number;

    months: {
      month: number;
      monthName: string;
      total: number;
      categories: ReportCategory[];
    }[];
  };
}

export interface YearlyExpenseReport {
  expenses: {
    from: number;
    to: number;

    years: {
      year: number;
      total: number;
      categories: ReportCategory[];
    }[];
  };
}


export type Goal = {
  _id: string;

  t: string;

  d?: string;

  td: string;

  p: string;

  s: string;

  tv?: number;

  cv?: number;

  c?: {
    _id: string;
    n: string;
  };
};

export type TableColumn<T> = {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
};
