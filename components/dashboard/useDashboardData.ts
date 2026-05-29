'use client';

import { useEffect, useState } from 'react';

import { api } from '@/lib/api';

import {
  Finance,
  Todo,
  Goal,
  PaginatedResponse,
  DashboardExpenseResponse
} from '@/lib/types';

import {
  ALLOWED_FINANCE_CATEGORIES
} from '@/lib/constants';

export function useDashboardData() {

  const currentDate =
    new Date();

  const initialYear =
    currentDate.getFullYear();

  const initialMonth =
    currentDate.getMonth() + 1;

  // -----------------------------------
  // FILTER STATE
  // -----------------------------------

  const [selectedYear,
    setSelectedYear] =
    useState(initialYear);

  const [selectedMonth,
    setSelectedMonth] =
    useState(initialMonth);

  // -----------------------------------
  // DATA STATE
  // -----------------------------------

  const [expensesSummaryData,
    setExpensesSummaryData] =
    useState<DashboardExpenseResponse | null>(
      null
    );

  const [finance, setFinance] =
    useState<Finance[]>([]);

  const [todos, setTodos] =
    useState<Todo[]>([]);

  const [goals, setGoals] =
    useState<Goal[]>([]);

  const [loading, setLoading] =
    useState(true);

  // -----------------------------------
  // ONLY EXPENSE DASHBOARD API
  // -----------------------------------

  const fetchExpenseDashboard =
    async (
      year: number,
      month: number
    ) => {

      try {

        const response =
          await api.get<DashboardExpenseResponse>(

            `/expenses/dashboard?year=${year}&month=${month}`
          );

        setExpensesSummaryData(
          response.data
        );

      } catch (err) {

        console.error(err);
      }
    };

  // -----------------------------------
  // INITIAL DASHBOARD LOAD
  // -----------------------------------

  useEffect(() => {

    const loadDashboard =
      async () => {

        try {

          setLoading(true);

          const [
            expenseResponse,
            financeResponse,
            todoResponse,
            goalResponse
          ] = await Promise.all([

            api.get<DashboardExpenseResponse>(

              `/expenses/dashboard?year=${initialYear}&month=${initialMonth}`
            ),

            api.get<PaginatedResponse<Finance>>(

              '/finance?limit=200'
            ),

            api.get<PaginatedResponse<Todo>>(

              '/todos?limit=200'
            ),

            api.get<PaginatedResponse<Goal>>(

              '/goal?limit=200'
            ),

          ]);

          setExpensesSummaryData(
            expenseResponse.data
          );

          setFinance(
            financeResponse.data.data
          );

          setTodos(
            todoResponse.data.data
          );

          setGoals(
            goalResponse.data.data
          );

        } catch (err) {

          console.error(err);

        } finally {

          setLoading(false);
        }
      };

    loadDashboard();

  }, []);

  // -----------------------------------
  // APPLY FILTER
  // ONLY EXPENSE API CALL
  // -----------------------------------

  const onApplyFilter = async (
    year: number,
    month: number
  ) => {

    setSelectedYear(year);

    setSelectedMonth(month);

    await fetchExpenseDashboard(
      year,
      month
    );
  };

  // -----------------------------------
  // FINANCE
  // -----------------------------------

  const validFinance =
    finance.filter(

      (f) =>

        ALLOWED_FINANCE_CATEGORIES
        .includes(
          f.c?.n || ''
        )
    );

  const totalInvested =
    validFinance.reduce(

      (s, f) =>

        s + (
          Number(f.a) || 0
        ),

      0
    );

  const totalCurrentValue =
    validFinance.reduce(

      (s, f) =>

        s + (
          Number(f.cv) || 0
        ),

      0
    );

  const totalMonthlySip =
    validFinance.reduce(

      (s, f) =>

        s + (
          Number(f.sv) || 0
        ),

      0
    );

  const financeCategoryMap:
    Record<string, any> = {};

  validFinance.forEach((f) => {

    const name =
      f.c?.n || 'Other';

    const invested =
      Number(f.a) || 0;

    const current =
      Number(f.cv) || 0;

    const profit =
      current - invested;

    if (!financeCategoryMap[name]) {

      financeCategoryMap[name] = {

        invested: 0,

        current: 0,

        profit: 0
      };
    }

    financeCategoryMap[name]
      .invested += invested;

    financeCategoryMap[name]
      .current += current;

    financeCategoryMap[name]
      .profit += profit;
  });

  const financePerformance =
    Object.entries(
      financeCategoryMap
    ).map(

      ([name, val]: any) => ({

        name,

        invested:
          val.invested,

        current:
          val.current,

        profit:
          val.profit,
      })
    );

  // -----------------------------------
  // EXPENSES
  // -----------------------------------

  const totalExpenses =
    expensesSummaryData
      ?.totalExpenseValue || 0;

  const thisMonthExpenses =
    expensesSummaryData
      ?.selectedMonthExpenseValue || 0;

  const expenseCategoryTotals =
    expensesSummaryData
      ?.categoryTotals || [];

  // -----------------------------------
  // TODOS
  // -----------------------------------

  const totalTodos =
    (todos ?? []).length;

  return {

    // filters
    selectedYear,
    selectedMonth,

    // expenses
    expensesSummaryData,
    totalExpenses,
    thisMonthExpenses,
    expenseCategoryTotals,

    // finance
    finance,
    validFinance,
    financePerformance,

    totalInvested,
    totalCurrentValue,
    totalMonthlySip,

    // todos/goals
    todos,
    goals,
    totalTodos,

    // loading
    loading,

    // actions
    onApplyFilter,
  };
}