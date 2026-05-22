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
