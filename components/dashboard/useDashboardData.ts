'use client';

import {
  useEffect,
  useState,
} from 'react';

import { api } from '@/lib/api';

import {
  Finance,
  Todo,
  Goal,
  PaginatedResponse,
  ExpenseYearlySummary,
  FinanceSnapshot,
} from '@/lib/types';

import { today } from '@/lib/helpers';

import {
  getFinanceCalculations,
} from './calculations/getFinanceCalculations';

import {
  getExpenseCalculations,
} from './calculations/getExpenseCalculations';

export function useDashboardData() {
  const currentDate =
    new Date();

  const initialYear =
    currentDate.getFullYear();

  const currentMonth =
    currentDate.getMonth() + 1;

  const [
    selectedYear,
    setSelectedYear,
  ] = useState(
    initialYear,
  );

  const [
    expenseSummaryData,
    setExpenseSummaryData,
  ] =
    useState<ExpenseYearlySummary | null>(
      null,
    );

  const [
    finance,
    setFinance,
  ] =
    useState<Finance[]>([]);

  const [
    financeSnapshots,
    setFinanceSnapshots,
  ] =
    useState<
      FinanceSnapshot[]
    >([]);

  const [
    todos,
    setTodos,
  ] =
    useState<Todo[]>([]);

  const [
    goals,
    setGoals,
  ] =
    useState<Goal[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  // -----------------------------------
  // FETCH EXPENSE DATA
  // -----------------------------------

  const fetchExpenseData = async (
    year: number,
  ) => {
    const response =
      await api.get<
        ExpenseYearlySummary
      >(
        `/expenses/yearly-summary?year=${year}`,
      );

    setExpenseSummaryData(
      response.data,
    );
  };

  // -----------------------------------
  // FETCH FULL YEAR SNAPSHOTS
  // -----------------------------------

  const fetchFinanceSnapshots = async (
    year: number,
  ) => {
const response =
  await api.get<{
    data: FinanceSnapshot[];
  }>(
    `/finance-snapshots?from=${
      year - 1
    }12&to=${year}12`,
  );

    setFinanceSnapshots(
      response.data.data,
    );
  };

  // -----------------------------------
  // INITIAL LOAD
  // -----------------------------------

  useEffect(() => {
    const loadDashboard =
      async () => {
        try {
          setLoading(true);

          const [
            summaryResponse,
            financeResponse,
            snapshotResponse,
            todoResponse,
            goalResponse,
          ] =
            await Promise.all([
              api.get<
                ExpenseYearlySummary
              >(
                `/expenses/yearly-summary?year=${initialYear}`,
              ),

              api.get<
                PaginatedResponse<Finance>
              >(
                '/finance?limit=200',
              ),

              api.get<{
                data: FinanceSnapshot[];
              }>(
                `/finance-snapshots?from=${initialYear}01&to=${initialYear}12`,
              ),

              api.get<
                PaginatedResponse<Todo>
              >(
                '/todos?limit=200',
              ),

              api.get<
                PaginatedResponse<Goal>
              >(
                '/goal?limit=200',
              ),
            ]);

          setExpenseSummaryData(
            summaryResponse.data,
          );

          setFinance(
            financeResponse.data.data,
          );

          setFinanceSnapshots(
            snapshotResponse.data.data,
          );

          setTodos(
            todoResponse.data.data,
          );

          setGoals(
            goalResponse.data.data,
          );
        } catch (err) {
          console.error(
            'Dashboard load failed:',
            err,
          );
        } finally {
          setLoading(false);
        }
      };

    loadDashboard();
  }, []);

  // -----------------------------------
  // APPLY YEAR FILTER
  // -----------------------------------

  const onApplyFilter = async (
    year: number,
  ) => {
    try {
      setLoading(true);

      setSelectedYear(year);

      await Promise.all([
        fetchExpenseData(year),
        fetchFinanceSnapshots(year),
      ]);
    } catch (err) {
      console.error(
        'Dashboard filter failed:',
        err,
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------
  // FINANCE CALCULATIONS
  // -----------------------------------

const financeCalculations =
  getFinanceCalculations(
    finance,
    expenseSummaryData,
    financeSnapshots,
    selectedYear,
    new Date().getMonth() + 1,
  );

  const expenseCalculations =
    getExpenseCalculations(
      expenseSummaryData,
    );

  // -----------------------------------
  // TODOS
  // -----------------------------------

  const totalTodos =
    todos.length;

  const todayDate =
    today();

  const totalTodosToday =
    todos.filter(
      (todo) =>
        todo.da?.startsWith(
          todayDate,
        ),
    ).length;

  return {
    // filters
    selectedYear,

    // expenses
    ...expenseCalculations,

    // finance
    finance,
    financeSnapshots,
    ...financeCalculations,

    // todos / goals
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