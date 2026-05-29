'use client';

import {
  useState,
  useEffect,
  useMemo,
} from 'react';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

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
      : '20px';
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

      <h3
        style={{
          fontSize: titleFontSize
        }}
      >
        📊 Expenses
      </h3>

      {/* FILTERS */}

      <div className="dash-filter-row">

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

      <div className="charts-row">

        <div className="chart-card large-chart">

          <h4
            style={{
              fontSize:
                isMobile
                  ? '14px'
                  : '18px'
            }}
          >
            Category-wise Spending
          </h4>

          {sortedData.length > 0 ? (

            <div
              style={{
                width: '100%',
                overflowX: 'auto',
              }}
            >

              <ResponsiveContainer
                width="100%"
                height={chartSize}
              >

                <PieChart>

                  <Pie
                    data={sortedData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={outerRadius}
                    innerRadius={innerRadius}
                    paddingAngle={2}
                    labelLine={false}

                    label={({
                      name,
                      percent
                    }) =>

                      isMobile

                        ? `${(
                            (percent || 0) * 100
                          ).toFixed(0)}%`

                        : `${name} ${(
                            (percent || 0) * 100
                          ).toFixed(0)}%`
                    }

                    style={{
                      fontSize:
                        labelFontSize
                    }}
                  >

                    {sortedData.map(
                      (_, i) => (

                      <Cell
                        key={i}
                        fill={
                          CHART_COLORS[
                            i %
                            CHART_COLORS.length
                          ]
                        }
                      />
                    ))}

                  </Pie>

                  <Tooltip
                    formatter={(v) => [

                      `₹${Number(v)
                        .toLocaleString()}`,

                      'Amount'
                    ]}
                  />

                  <Legend
                    wrapperStyle={{
                      fontSize:
                        legendFontSize,

                      paddingTop: 20,
                    }}

                    formatter={(value) => (

                      <span
                        style={{
                          fontSize:
                            legendFontSize,

                          wordBreak:
                            'break-word',
                        }}
                      >
                        {value}
                      </span>
                    )}
                  />

                </PieChart>

              </ResponsiveContainer>

            </div>

          ) : (

            <p className="no-data">

              No expenses found

            </p>
          )}

        </div>

      </div>

    </div>
  );
}