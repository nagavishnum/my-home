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
  c: Category | null;
  ty: string;
  md: string;
  lp: number;
  rt: number;
  cv: number;
  no: string;
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
