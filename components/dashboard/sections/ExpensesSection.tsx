'use client';

import {
  useState,
  useEffect,
  useMemo,
} from 'react';

import {
  MONTHS,
  CHART_COLORS,
} from '@/lib/constants';

import { useGlobalApiLoading } from '@/lib/hooks';

type ExpenseCategoryTotal = {
  categoryId: string;
  categoryName: string;
  amount: number;
};

type ExpensesSummaryData = {
  totalExpenseValue: number;
  selectedMonthExpenseValue: number;
  categoryTotals: ExpenseCategoryTotal[];
};

type Props = {
  expensesSummaryData: ExpensesSummaryData | null;

  onApplyFilter?: (
    year: number,
    month: number
  ) => void;
};

const initialMonth =
  String(new Date().getMonth() + 1);

const initialYear =
  String(new Date().getFullYear());

export default function ExpensesSection({
  expensesSummaryData,
  onApplyFilter,
}: Props) {

  const [expMonth, setExpMonth] =
    useState(initialMonth);

  const [expYear, setExpYear] =
    useState(initialYear);

  const [windowWidth,
    setWindowWidth] =
    useState(1200);

  const isApiLoading =
    useGlobalApiLoading();

  // -----------------------------------
  // WINDOW WIDTH
  // -----------------------------------

  useEffect(() => {

    const updateWidth = () => {
      setWindowWidth(
        window.innerWidth
      );
    };

    updateWidth();

    window.addEventListener(
      'resize',
      updateWidth
    );

    return () => {

      window.removeEventListener(
        'resize',
        updateWidth
      );
    };

  }, []);



  const isMobile =
    windowWidth < 740;

  const isTablet =
    windowWidth >= 640 &&
    windowWidth < 1024;

  const chartSize =
    isMobile
      ? 260
      : isTablet
      ? 360
      : 520;

  const outerRadius =
    isMobile
      ? 70
      : isTablet
      ? 110
      : 170;

  const innerRadius =
    isMobile
      ? 35
      : isTablet
      ? 60
      : 80;

  const labelFontSize =
    isMobile
      ? 9
      : isTablet
      ? 11
      : 13;

  const legendFontSize =
    isMobile
      ? 10
      : isTablet
      ? 12
      : 14;

  const titleFontSize =
    isMobile
      ? '16px'
      : '25px';
  const expByCat = useMemo(() =>
    expensesSummaryData
      ?.categoryTotals
      ?.map(item => ({

        name:
          item.categoryName,

        value:
          item.amount,
      })) || []
  , [expensesSummaryData]);



  const sortedData =
    useMemo(() => {

      return [...expByCat]
        .sort(
          (a, b) =>
            b.value - a.value
        );

    }, [expByCat]);

const totalAmount = sortedData.reduce(
  (sum, item) => sum + item.value,
  0
);
  const handleApply = () => {

    onApplyFilter?.(
      Number(expYear),
      Number(expMonth)
    );
  };

  return (

    <div
      className="dash-section"
      id="expenses-section"
    >

      {/* TITLE */}

      <h2
        style={{
          fontSize: titleFontSize,
          textAlign:"center"
        }}
      >
        📊 EXPENSES
      </h2>

      {/* FILTERS */}

      <div style={{
        display: 'flex',
        flexDirection: isMobile
          ? 'column'
          : 'row',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px',
      }}>

        <select
          value={expMonth}
          onChange={(e) =>
            setExpMonth(
              e.target.value
            )
          }
        >

          {MONTHS.map((m, i) => (

            <option
              key={m}
              value={String(i + 1)}
            >
              {m}
            </option>
          ))}

        </select>

        <select
          value={expYear}
          onChange={(e) =>
            setExpYear(
              e.target.value
            )
          }
        >

          {Array.from({
            length: 5
          }).map((_, i) => {

            const y =
              new Date()
              .getFullYear() - i;

            return (

              <option
                key={y}
                value={String(y)}
              >
                {y}
              </option>
            );
          })}

        </select>

        <button
          className="btn-primary"
          onClick={handleApply}
          disabled={isApiLoading}
        >
          Apply
        </button>

      </div>

<div className="chart-card large-chart">

  <h4 >
    Category-wise Spending
  </h4>

  {sortedData.length > 0 ? (

    <div>

      {sortedData.map((item, index) => {

        const percent =
          totalAmount === 0
            ? 0
            : (
                item.value /
                totalAmount *
                100
              );

        return (

          <div
            key={item.name}
            style={{
              marginBottom: 20,
            }}
          >

            {/* Top Row */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom: 6,
                fontWeight: 600,
              }}
            >

              <span>

                {index + 1}. {item.name}

              </span>

              <span>

                ₹{item.value.toLocaleString()}

              </span>

            </div>

            {/* Percentage */}

            <div
              style={{
                marginBottom: 6,
                fontSize: 13,
                color: "#666",
              }}
            >

              {percent.toFixed(1)}%

            </div>

            {/* Progress Bar */}

            <div
              style={{
                height: 10,
                background:
                  "#eee",
                borderRadius: 10,
                overflow:
                  "hidden",
              }}
            >

              <div
                style={{
                  width:
                    `${percent}%`,
                  height:
                    "100%",
                  background:
                    CHART_COLORS[
                      index %
                      CHART_COLORS.length
                    ],
                }}
              />

            </div>

          </div>

        );

      })}

    </div>

  ) : (

    <p>No expenses found</p>

  )}

</div>

    </div>
  );
}