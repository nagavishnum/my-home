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

import { today } from '@/lib/helpers';
import { getFinanceCalculations } from './calculations/getFinanceCalculations';

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

  const financeCalculations = getFinanceCalculations(finance,expensesSummaryData);
  
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
const todayDate = today();

const totalTodosToday = (todos ?? []).filter(
  todo => todo.da?.startsWith(todayDate)
).length;

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
// finance
finance,
...financeCalculations,
    // todos/goals
    todos,
    goals,
    totalTodos,
    totalTodosToday,

    // loading
    loading,

    // actions
    onApplyFilter,
  };
}