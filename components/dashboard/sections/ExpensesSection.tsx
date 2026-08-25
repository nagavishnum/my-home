'use client';

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react';

import { useGlobalApiLoading } from '@/lib/hooks';
import {
  ExpenseSummaryData,
} from '@/lib/types';

import {
  EXPENSE_BUCKETS,
  EXPENSE_BUCKET_STYLES,
  YEARS,
} from '@/lib/constants';

type ExpenseBucket =
  keyof typeof EXPENSE_BUCKETS;

type Props = {
  expenseSummaryData:
    ExpenseSummaryData | null;

  onApplyFilter?: (
    year: number,
  ) => void;
};

const initialYear =
  String(new Date().getFullYear());

export default function ExpensesSection({
  expenseSummaryData,
  onApplyFilter,
}: Props) {

  const [expYear, setExpYear] =
    useState(initialYear);

  const [windowWidth, setWindowWidth] =
    useState(1200);

  const isApiLoading =
    useGlobalApiLoading();

  // -----------------------------------
  // WINDOW WIDTH
  // -----------------------------------

  useEffect(() => {

    const updateWidth = () => {
      setWindowWidth(window.innerWidth);
    };

    updateWidth();

    window.addEventListener(
      'resize',
      updateWidth,
    );

    return () => {
      window.removeEventListener(
        'resize',
        updateWidth,
      );
    };

  }, []);

  const isMobile =
    windowWidth < 740;

  // -----------------------------------
  // GET CATEGORY BUCKET
  // -----------------------------------

  const getBucket = (
    category: string,
  ): ExpenseBucket => {

    const bucketKeys =
      Object.keys(
        EXPENSE_BUCKETS,
      ) as ExpenseBucket[];

    const matchingBucket =
      bucketKeys.find(
        bucket =>
          EXPENSE_BUCKETS[bucket].includes(
            category,
          ),
      );

    return (
      matchingBucket ??
      'OTHER_BUCKET'
    );
  };

  // -----------------------------------
  // GET CATEGORY COLOR
  // -----------------------------------

  const getCategoryColor = (
    category: string,
  ): string => {

    const bucket =
      getBucket(category);

    return (
      EXPENSE_BUCKET_STYLES[
        bucket
      ]?.color ??
      '#6b7280'
    );
  };

  // -----------------------------------
  // ALL CATEGORIES
  // -----------------------------------

  const categories = useMemo(() => {

    const allCategories = [
      ...new Set(
        expenseSummaryData?.months?.flatMap(
          month =>
            month.c.map(
              category =>
                category.n,
            ),
        ) ?? [],
      ),
    ];

    const bucketOrder:
      ExpenseBucket[] = [
        'ESSENTIAL_BUCKET',
        'AVOID_BUCKET',
        'ASSET_BUCKET',
        'OTHER_BUCKET',
      ];

    return allCategories.sort(
      (a, b) => {

        const bucketA =
          bucketOrder.indexOf(
            getBucket(a),
          );

        const bucketB =
          bucketOrder.indexOf(
            getBucket(b),
          );

        return bucketA - bucketB;

      },
    );

  }, [expenseSummaryData]);

  // -----------------------------------
  // GET CATEGORY AMOUNT
  // -----------------------------------

  const getAmount = (
    month: ExpenseSummaryData['months'][number],
    category: string,
  ): number => {

    return (
      month.c.find(
        item =>
          item.n === category,
      )?.a ?? 0
    );

  };

  // -----------------------------------
  // CATEGORY MAX
  // -----------------------------------

  const getCategoryMax = (
    category: string,
  ): number => {

    const amounts =
      expenseSummaryData?.months?.map(
        month =>
          getAmount(
            month,
            category,
          ),
      ) ?? [];

    return amounts.length
      ? Math.max(...amounts)
      : 0;
  };

  // -----------------------------------
  // YEAR FILTER
  // -----------------------------------

  const handleYearChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {

    const year =
      Number(event.target.value);

    setExpYear(
      event.target.value,
    );

    onApplyFilter?.(year);

  };

  // -----------------------------------
  // RENDER
  // -----------------------------------

  return (

    <div
      className="dash-section"
      id="expenses-section"
    >

      {/* -------------------------------- */}
      {/* TITLE */}
      {/* -------------------------------- */}
{/* 
      <h2
        style={{
          fontSize: isMobile
            ? '18px'
            : '25px',

          textAlign: 'center',
        }}
      >
        📊 EXPENSES
      </h2> */}

      {/* -------------------------------- */}
      {/* FILTER */}
      {/* -------------------------------- */}

      <div
        style={{
          display: 'flex',

          flexDirection:
            isMobile
              ? 'column'
              : 'row',

          alignItems: 'center',

          gap: '10px',

          marginBottom: '8px',
        }}
      >

        <select
          value={expYear}
          onChange={handleYearChange}
          disabled={isApiLoading}
        >

          {YEARS.map(year => (

            <option
              key={year}
              value={year}
            >
              {year}
            </option>

          ))}

        </select>

      </div>

      {/* -------------------------------- */}
      {/* YEARLY SUMMARY */}
      {/* -------------------------------- */}

      <div className="chart-card large-chart">

        <h4>
          {expenseSummaryData?.year
            ? `${expenseSummaryData.year} Expense Summary`
            : 'Expense Summary'}
        </h4>

        {!expenseSummaryData?.months?.length ? (

          <p>
            No expenses found
          </p>

        ) : (

          <div
            style={{
              overflowX: 'auto',
            }}
          >

            <table
              style={{
                width: '100%',

                minWidth:
                  isMobile
                    ? '900px'
                    : '100%',

                borderCollapse:
                  'collapse',
              }}
            >

              {/* -------------------------------- */}
              {/* HEADER */}
              {/* -------------------------------- */}

              <thead>

                <tr>

                  <th
                    style={{
                      padding:
                        '8px 10px',

                      textAlign:
                        'left',

                      position:
                        'sticky',

                      left: 0,

                      background:
                        'inherit',

                      zIndex: 2,
                    }}
                  >
                    Category
                  </th>

                  {expenseSummaryData.months.map(
                    month => (

                      <th
                        key={month.m}
                        style={{
                          padding:
                            '8px 10px',

                          textAlign:
                            'right',

                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {month.m}
                      </th>

                    ),
                  )}

                </tr>

              </thead>

              {/* -------------------------------- */}
              {/* BODY */}
              {/* -------------------------------- */}

              <tbody>

                {categories.map(
                  category => {

                    const bucket =
                      getBucket(
                        category,
                      );

                    const bucketStyle =
                      EXPENSE_BUCKET_STYLES[
                        bucket
                      ];

                    const maxAmount =
                      getCategoryMax(
                        category,
                      );

                    return (

                      <tr
                        key={category}
                        style={{
                          borderTop:
                            '1px solid rgba(128,128,128,0.12)',
                        }}
                      >

                        {/* CATEGORY */}

                        <td
                          style={{
                            padding:
                              '7px 10px',

                            fontWeight:
                              600,

                            whiteSpace:
                              'nowrap',

                            position:
                              'sticky',

                            left: 0,

                            background:
                              'inherit',

                            zIndex: 1,
                          }}
                        >

                          <div
                            style={{
                              display:
                                'flex',

                              alignItems:
                                'center',

                              gap: 7,
                            }}
                          >

                            {/* BUCKET INDICATOR */}

                            <span
                              title={
                                bucketStyle.label
                              }
                              style={{
                                width: 8,

                                height: 8,

                                minWidth: 8,

                                borderRadius:
                                  '50%',

                                background:
                                  getCategoryColor(
                                    category,
                                  ),

                                display:
                                  'inline-block',
                              }}
                            />

                            {category}

                          </div>

                        </td>

                        {/* MONTH VALUES */}

                        {expenseSummaryData.months.map(
                          month => {

                            const amount =
                              getAmount(
                                month,
                                category,
                              );

                            const isHighest =
                              amount > 0 &&
                              amount ===
                                maxAmount;

                            return (

                              <td
                                key={
                                  month.m
                                }
                                style={{
                                  padding:
                                    '7px 10px',

                                  textAlign:
                                    'right',

                                  whiteSpace:
                                    'nowrap',

                                  fontVariantNumeric:
                                    'tabular-nums',

                                  fontWeight:
                                    isHighest
                                      ? 700
                                      : 400,

                                  color:
                                    isHighest
                                      ? bucketStyle.color
                                      : 'inherit',

                                  background:
                                    isHighest
                                      ? `${bucketStyle.color}12`
                                      : 'transparent',

                                  borderRadius:
                                    isHighest
                                      ? 4
                                      : undefined,
                                }}
                              >

                                {amount > 0
                                  ? `₹${amount.toLocaleString(
                                      'en-IN',
                                    )}`
                                  : '—'}

                              </td>

                            );

                          },
                        )}

                      </tr>

                    );

                  },
                )}

                {/* -------------------------------- */}
                {/* TOTAL */}
                {/* -------------------------------- */}

                <tr
                  style={{
                    borderTop:
                      '2px solid currentColor',

                    fontWeight: 700,
                  }}
                >

                  <td
                    style={{
                      padding:
                        '8px 10px',

                      position:
                        'sticky',

                      left: 0,

                      background:
                        'inherit',

                      zIndex: 1,
                    }}
                  >
                    Total
                  </td>

                  {expenseSummaryData.months.map(
                    month => (

                      <td
                        key={month.m}
                        style={{
                          padding:
                            '8px 10px',

                          textAlign:
                            'right',

                          whiteSpace:
                            'nowrap',

                          fontVariantNumeric:
                            'tabular-nums',
                        }}
                      >

                        ₹
                        {month.t.toLocaleString(
                          'en-IN',
                        )}

                      </td>

                    ),
                  )}

                </tr>

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>

  );
}