'use client';

import { useEffect, useState } from 'react';

import { api } from '@/lib/api';

import {
  Finance,
  Todo,
  Goal,
  PaginatedResponse,
  DashboardExpenseResponse,
  ExpenseYearlySummary
} from '@/lib/types';

import { today } from '@/lib/helpers';
import { getFinanceCalculations } from './calculations/getFinanceCalculations';

export function useDashboardData() {
  const currentDate = new Date();

  const initialYear = currentDate.getFullYear();
  const initialMonth = currentDate.getMonth() + 1;

  const [selectedYear, setSelectedYear] =
    useState(initialYear);

  const [selectedMonth, setSelectedMonth] =
    useState(initialMonth);

  const [expenseSummaryData, setExpenseSummaryData] =
    useState<ExpenseYearlySummary | null>(null);

  const [finance, setFinance] =
    useState<Finance[]>([]);

  const [todos, setTodos] =
    useState<Todo[]>([]);

  const [goals, setGoals] =
    useState<Goal[]>([]);

  const [loading, setLoading] =
    useState(true);

  // -----------------------------------
  // EXPENSE APIs
  // -----------------------------------

  const fetchExpenseData = async (
    year: number,
  ) => {
    const [ summaryResponse] =
      await Promise.all([
        api.get<ExpenseYearlySummary>(
          `/expenses/yearly-summary?year=${year}`
        )
      ]);

    setExpenseSummaryData(summaryResponse.data);
  };

  // -----------------------------------
  // INITIAL DASHBOARD LOAD
  // -----------------------------------

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [
          summaryResponse,
          financeResponse,
          todoResponse,
          goalResponse
        ] = await Promise.all([

          api.get<ExpenseYearlySummary>(
            `/expenses/yearly-summary?year=${initialYear}`
          ),

          api.get<PaginatedResponse<Finance>>(
            '/finance?limit=200'
          ),

          api.get<PaginatedResponse<Todo>>(
            '/todos?limit=200'
          ),

          api.get<PaginatedResponse<Goal>>(
            '/goal?limit=200'
          )
        ]);

        setExpenseSummaryData(summaryResponse.data);

        setFinance(financeResponse.data.data);
        setTodos(todoResponse.data.data);
        setGoals(goalResponse.data.data);

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
  // -----------------------------------

  const onApplyFilter = async (
    year: number,
  ) => {
    try {
      setSelectedYear(year);

      await fetchExpenseData(year);

    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------------------
  // FINANCE
  // -----------------------------------

  const financeCalculations =
    getFinanceCalculations(
      finance,
      expenseSummaryData
    );

  // -----------------------------------
  // TODOS
  // -----------------------------------

  const totalTodos =
    todos.length;

  const todayDate = today();

  const totalTodosToday =
    todos.filter(
      todo => todo.da?.startsWith(todayDate)
    ).length;

  return {
    // filters
    selectedYear,
    selectedMonth,

    // expenses
    expenseSummaryData,

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
    onApplyFilter
  };
}