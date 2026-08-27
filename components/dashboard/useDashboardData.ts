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
    previousExpenseSummaryData,
    setPreviousExpenseSummaryData,
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

  /* =======================================================
     EXPENSE DATA
  ======================================================= */

  const fetchExpenseData = async (
    year: number,
  ) => {
    const [
      currentResponse,
      previousResponse,
    ] =
      await Promise.all([
        api.get<
          ExpenseYearlySummary
        >(
          `/expenses/yearly-summary?year=${year}`,
        ),

        api.get<
          ExpenseYearlySummary
        >(
          `/expenses/yearly-summary?year=${
            year - 1
          }`,
        ),
      ]);

    setExpenseSummaryData(
      currentResponse.data,
    );

    setPreviousExpenseSummaryData(
      previousResponse.data,
    );
  };

  /* =======================================================
     FINANCE SNAPSHOTS
  ======================================================= */

  const fetchFinanceSnapshots =
    async (
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

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    const loadDashboard =
      async () => {
        try {
          setLoading(true);

          const [
            summaryResponse,
            previousSummaryResponse,
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
                ExpenseYearlySummary
              >(
                `/expenses/yearly-summary?year=${
                  initialYear - 1
                }`,
              ),

              api.get<
                PaginatedResponse<Finance>
              >(
                '/finance?limit=200',
              ),

              api.get<{
                data: FinanceSnapshot[];
              }>(
                `/finance-snapshots?from=${
                  initialYear - 1
                }12&to=${initialYear}12`,
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

          setPreviousExpenseSummaryData(
            previousSummaryResponse.data,
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
  }, [initialYear]);

  /* =======================================================
     YEAR FILTER
  ======================================================= */

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

  /* =======================================================
     MERGE EXPENSE HISTORY
  ======================================================= */

  /*
   * Finance calculations need the
   * selected year plus previous-year
   * expense data for the 3-month
   * rolling average.
   *
   * Keep the selected year's
   * ExpenseYearlySummary API shape
   * unchanged and combine only the
   * months needed for calculations.
   */
  const financeExpenseSummaryData =
    (() => {
      if (
        !expenseSummaryData
      ) {
        return null;
      }

      if (
        !previousExpenseSummaryData
      ) {
        return expenseSummaryData;
      }

      return {
        ...expenseSummaryData,
        months: [
          ...(previousExpenseSummaryData.months ??
            []),
          ...(expenseSummaryData.months ??
            []),
        ],
      };
    })();

  /* =======================================================
     FINANCE
  ======================================================= */

  const financeCalculations =
    getFinanceCalculations(
      finance,
      financeExpenseSummaryData,
      financeSnapshots,
      selectedYear,
      currentMonth,
    );

  /* =======================================================
     EXPENSES
  ======================================================= */

  const expenseCalculations =
    getExpenseCalculations(
      expenseSummaryData,
    );

  /* =======================================================
     TODOS
  ======================================================= */

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
    /*
     * Filters
     */
    selectedYear,

    /*
     * Expenses
     */
    expenseSummaryData,
    ...expenseCalculations,

    /*
     * Finance
     */
    finance,
    financeSnapshots,
    ...financeCalculations,

    /*
     * Todos / Goals
     */
    todos,
    goals,
    totalTodos,
    totalTodosToday,

    /*
     * Loading
     */
    loading,

    /*
     * Actions
     */
    onApplyFilter,
  };
}