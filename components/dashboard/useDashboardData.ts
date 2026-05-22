'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  Expense,
  Finance,
  Todo,
  Goal,
  PaginatedResponse
} from '@/lib/types';
import {
  ALLOWED_FINANCE_CATEGORIES
} from '@/lib/constants';

export function useDashboardData() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [finance, setFinance] = useState<Finance[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<PaginatedResponse<Expense>>('/expenses?limit=200'),
      api.get<PaginatedResponse<Finance>>('/finance?limit=200'),
      api.get<PaginatedResponse<Todo>>('/todos?limit=200'),
      api.get<PaginatedResponse<Goal>>('/goal?limit=200'),
    ])
      .then(([e, f, t, g]) => {
        setExpenses(e.data.data);
        setFinance(f.data.data);
        setTodos(t.data.data);
        setGoals(g.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const validFinance = finance.filter(
    (f) => ALLOWED_FINANCE_CATEGORIES.includes(f.c?.n || '')
  );

  const totalInvested = validFinance.reduce((s, f) => s + (Number(f.a) || 0), 0);
  const totalCurrentValue = validFinance.reduce((s, f) => s + (Number(f.cv) || 0), 0);
  const totalMonthlySip = validFinance.reduce((s, f) => s + (Number(f.sv) || 0), 0);

  const financeCategoryMap: Record<string, any> = {};

  validFinance.forEach((f) => {
    const name = f.c?.n || 'Other';

    const invested = Number(f.a) || 0;
    const current = Number(f.cv) || 0;
    const profit = current - invested;

    if (!financeCategoryMap[name]) {
      financeCategoryMap[name] = { invested: 0, current: 0, profit: 0 };
    }

    financeCategoryMap[name].invested += invested;
    financeCategoryMap[name].current += current;
    financeCategoryMap[name].profit += profit;
  });

  const financePerformance = Object.entries(financeCategoryMap).map(
    ([name, val]: any) => ({
      name,
      invested: val.invested,
      current: val.current,
      profit: val.profit,
    })
  );

  const now = new Date();

const totalExpenses = (expenses ?? []).reduce(
  (s, e) => s + (Number(e.a) || 0),
  0
);

const todayStr = now.toISOString().split('T')[0];

const todayExpenses = (expenses ?? [])
  .filter((e) => e.d?.startsWith(todayStr))
  .reduce((s, e) => s + (Number(e.a) || 0), 0);

const thisMonthExpenses = (expenses ?? [])
  .filter((e) => {
    if (!e.d) return false;
    const d = new Date(e.d);
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  })
  .reduce((s, e) => s + (Number(e.a) || 0), 0);

const totalTodos = (todos ?? []).length;

return {
  expenses,
  finance,
  todos,
  goals,
  loading,

  validFinance,
  financePerformance,

  totalInvested,
  totalCurrentValue,
  totalMonthlySip,

  // ✅ ADD THIS (FIX)
  totalExpenses,
  todayExpenses,
  thisMonthExpenses,
  totalTodos,
};  
}