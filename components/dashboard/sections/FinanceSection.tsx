'use client';

import { useMemo } from 'react';

type AssetAllocationItem = {
  categoryId: string;
  name: string;
  value: number;
  percentage: number;
};

type FinancePerformanceItem = {
  name: string;
  invested: number;
  current: number;
  profit: number;
  returnPercentage: number;
};

type WealthTrend = {
  status:
    | 'insufficient-data'
    | 'getting-richer'
    | 'mixed'
    | 'getting-poorer';

  consecutiveGrowthMonths: number;
  positiveMonths: number;
  negativeMonths: number;
};

type MonthlyCategory = {
  categoryId: string;
  categoryName: string;
};

type MonthlyCategoryRow = {
  month: number;
  monthName: string;
  values: Record<string, number>;
};

type Props = {
  selectedYear: number;

  metricMonthName: string;
  previousMetricMonthName: string;

  networthValue: number;
  previousNetworthValue: number;
  networthChange: number;
  networthGrowth: number;

  totalAssetsValue: number;
  totalLiabilitiesValue: number;
  debtToAssetRatio: number;

  assetAllocation: AssetAllocationItem[];

  investmentsValue: number;

  liquidAssetsValue: number;
  selectedMonthExpenses: number;
  emergencyMonths: number;

  wealthCreationRate: number;
  monthlyCapitalDeployment: number;

  financialFreedomNumber: number;
  financialFreedomProgress: number;

  wealthTrend: WealthTrend;

  profitItems: FinancePerformanceItem[];
  lossItems: FinancePerformanceItem[];

  monthlyCategories: MonthlyCategory[];
  monthlyCategoryRows: MonthlyCategoryRow[];
};

const formatAmount = (
  value: number,
) => {
  return `₹${Math.round(
    Number(value) || 0,
  ).toLocaleString('en-IN')}`;
};

const formatPercentage = (
  value: number,
) => {
  return `${(
    Number(value) || 0
  ).toFixed(1)}%`;
};

export default function FinanceSection({
  selectedYear,

  metricMonthName,
  previousMetricMonthName,

  networthValue,
  previousNetworthValue,
  networthChange,
  networthGrowth,

  totalAssetsValue,
  totalLiabilitiesValue,
  debtToAssetRatio,

  assetAllocation,

  investmentsValue,

  liquidAssetsValue,
  selectedMonthExpenses,
  emergencyMonths,

  wealthCreationRate,
  monthlyCapitalDeployment,

  financialFreedomNumber,
  financialFreedomProgress,

  wealthTrend,

  profitItems,
  lossItems,

  monthlyCategories,
  monthlyCategoryRows,
}: Props) {
  const wealthTrendMessage =
    useMemo(() => {
      if (
        wealthTrend.status ===
        'insufficient-data'
      ) {
        return {
          icon: 'ℹ️',
          title:
            'Not enough history yet',
          description:
            `We need at least two monthly snapshots in ${selectedYear} to measure your wealth trend.`,
        };
      }

      if (
        wealthTrend.status ===
        'getting-richer'
      ) {
        return {
          icon: '🟢',
          title:
            'Yes — you are getting richer',
          description:
            `${wealthTrend.consecutiveGrowthMonths} consecutive months of net-worth growth.`,
        };
      }

      if (
        wealthTrend.status ===
        'mixed'
      ) {
        return {
          icon: '🟡',
          title:
            'Your wealth trend is mixed',
          description:
            `${wealthTrend.positiveMonths} months increased and ${wealthTrend.negativeMonths} months decreased in ${selectedYear}.`,
        };
      }

      return {
        icon: '🔴',
        title:
          'Your net worth is trending down',
        description:
          'Recent monthly snapshots show more declines than increases.',
      };
    }, [
      wealthTrend,
      selectedYear,
    ]);

  return (
    <div
      className="dash-section"
      id="finance-section"
    >
      <h2
        style={{
          textAlign: 'center',
        }}
      >
        🏦 FINANCIAL COMMAND CENTER
      </h2>

      {/* ================================================= */}
      {/* CURRENT METRIC PERIOD */}
      {/* ================================================= */}

      <div
        style={{
          textAlign: 'center',
          marginBottom: '1rem',
          opacity: 0.75,
        }}
      >
        {selectedYear} —{' '}
        {metricMonthName} vs{' '}
        {previousMetricMonthName}
      </div>

      {/* ================================================= */}
      {/* NET WORTH + DEBT */}
      {/* ================================================= */}

      <div className="finance-grid">
        <div className="chart-card">
          <h4>🏦 Net Worth</h4>

          <div
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            {formatAmount(
              networthValue,
            )}
          </div>

          <div className="summary-row">
            <span>
              {previousMetricMonthName}
            </span>

            <strong>
              {formatAmount(
                previousNetworthValue,
              )}
            </strong>
          </div>

          <div className="summary-row">
            <span>Change</span>

            <strong
              style={{
                color:
                  networthChange >= 0
                    ? '#16a34a'
                    : '#dc2626',
              }}
            >
              {networthChange >= 0
                ? '+'
                : ''}
              {formatAmount(
                networthChange,
              )}
            </strong>
          </div>

          <div className="summary-row">
            <span>Growth</span>

            <strong
              style={{
                color:
                  networthGrowth >= 0
                    ? '#16a34a'
                    : '#dc2626',
              }}
            >
              {networthGrowth >= 0
                ? '+'
                : ''}
              {formatPercentage(
                networthGrowth,
              )}
            </strong>
          </div>
        </div>

        <div className="chart-card">
          <h4>💳 Debt Position</h4>

          <div className="summary-row">
            <span>
              Total Liabilities
            </span>

            <strong>
              {formatAmount(
                totalLiabilitiesValue,
              )}
            </strong>
          </div>

          <div className="summary-row">
            <span>Total Assets</span>

            <strong>
              {formatAmount(
                totalAssetsValue,
              )}
            </strong>
          </div>

          <div className="summary-row">
            <span>
              Debt / Asset
            </span>

            <strong>
              {formatPercentage(
                debtToAssetRatio,
              )}
            </strong>
          </div>

          <div className="summary-row">
            <span>Debt Status</span>

            <strong
              style={{
                color:
                  debtToAssetRatio <= 20
                    ? '#16a34a'
                    : debtToAssetRatio <= 40
                      ? '#f59e0b'
                      : '#dc2626',
              }}
            >
              {debtToAssetRatio <= 20
                ? 'Healthy'
                : debtToAssetRatio <= 40
                  ? 'Moderate'
                  : 'High'}
            </strong>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* ASSET ALLOCATION + LIQUIDITY */}
      {/* ================================================= */}

      <div className="finance-grid">
        <div className="chart-card">
          <h4>📊 Asset Allocation</h4>

          {assetAllocation.length >
          0 ? (
            assetAllocation.map(
              (item) => (
                <div
                  className="summary-row"
                  key={
                    item.categoryId
                  }
                >
                  <span>
                    {item.name}
                  </span>

                  <strong>
                    {formatAmount(
                      item.value,
                    )}{' '}
                    <small>
                      (
                      {formatPercentage(
                        item.percentage,
                      )}
                      )
                    </small>
                  </strong>
                </div>
              ),
            )
          ) : (
            <p>
              No asset data available.
            </p>
          )}

          <div
            className="summary-row"
            style={{
              marginTop: '1rem',
              borderTop:
                '1px solid #e5e7eb',
              paddingTop: '0.75rem',
            }}
          >
            <span>
              Total Assets
            </span>

            <strong>
              {formatAmount(
                totalAssetsValue,
              )}
            </strong>
          </div>
        </div>

        <div className="chart-card">
          <h4>
            🛡️ Liquidity / Financial Safety
          </h4>

          <div className="summary-row">
            <span>
              Liquid Assets
            </span>

            <strong>
              {formatAmount(
                liquidAssetsValue,
              )}
            </strong>
          </div>

          <div className="summary-row">
            <span>
              Monthly Expenses
            </span>

            <strong>
              {formatAmount(
                selectedMonthExpenses,
              )}
            </strong>
          </div>

          <div className="summary-row">
            <span>
              Emergency Coverage
            </span>

            <strong>
              {emergencyMonths.toFixed(
                1,
              )}{' '}
              months
            </strong>
          </div>

          <div className="summary-row">
            <span>Safety Status</span>

            <strong
              style={{
                color:
                  emergencyMonths >= 6
                    ? '#16a34a'
                    : emergencyMonths >= 3
                      ? '#f59e0b'
                      : '#dc2626',
              }}
            >
              {emergencyMonths >= 6
                ? 'Strong'
                : emergencyMonths >= 3
                  ? 'Moderate'
                  : 'Low'}
            </strong>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* WEALTH CREATION */}
      {/* ================================================= */}

      <div className="finance-grid">
        <div className="chart-card">
          <h4>
            📈 Wealth Creation Rate
          </h4>

          <div className="summary-row">
            <span>
              Monthly Wealth Created
            </span>

            <strong
              style={{
                color:
                  wealthCreationRate >= 0
                    ? '#16a34a'
                    : '#dc2626',
              }}
            >
              {wealthCreationRate >= 0
                ? '+'
                : ''}
              {formatAmount(
                wealthCreationRate,
              )}
            </strong>
          </div>

          <div className="summary-row">
            <span>
              Net Worth Growth
            </span>

            <strong
              style={{
                color:
                  networthGrowth >= 0
                    ? '#16a34a'
                    : '#dc2626',
              }}
            >
              {networthGrowth >= 0
                ? '+'
                : ''}
              {formatPercentage(
                networthGrowth,
              )}
            </strong>
          </div>

          <div className="summary-row">
            <span>
              Current Investments
            </span>

            <strong>
              {formatAmount(
                investmentsValue,
              )}
            </strong>
          </div>
        </div>

        <div className="chart-card">
          <h4>
            💰 Monthly Capital Deployment
          </h4>

          <div
            style={{
              fontSize: '1.8rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
            }}
          >
            {formatAmount(
              monthlyCapitalDeployment,
            )}
          </div>

          <p
            style={{
              margin: 0,
              opacity: 0.75,
            }}
          >
            Amount deployed during{' '}
            {metricMonthName}.
          </p>
        </div>
      </div>

      {/* ================================================= */}
      {/* FINANCIAL FREEDOM + WEALTH TREND */}
      {/* ================================================= */}

      <div className="finance-grid">
        <div className="chart-card">
          <h4>
            🕊️ Financial Freedom Number
          </h4>

          <div
            style={{
              fontSize: '1.8rem',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            {formatAmount(
              financialFreedomNumber,
            )}
          </div>

          <div className="summary-row">
            <span>
              Current Net Worth
            </span>

            <strong>
              {formatAmount(
                networthValue,
              )}
            </strong>
          </div>

          <div className="summary-row">
            <span>
              Freedom Progress
            </span>

            <strong>
              {formatPercentage(
                financialFreedomProgress,
              )}
            </strong>
          </div>

          <p
            style={{
              marginTop: '0.75rem',
              marginBottom: 0,
              opacity: 0.75,
            }}
          >
            Based on 25× annual expenses.
          </p>
        </div>

        <div className="chart-card">
          <h4>
            📈 Am I Actually Getting Richer?
          </h4>

          <div
            style={{
              fontSize: '1.3rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
            }}
          >
            {wealthTrendMessage.icon}{' '}
            {wealthTrendMessage.title}
          </div>

          <p
            style={{
              margin: 0,
              opacity: 0.75,
            }}
          >
            {
              wealthTrendMessage.description
            }
          </p>

          {wealthTrend.status !==
            'insufficient-data' && (
            <>
              <div
                className="summary-row"
                style={{
                  marginTop: '1rem',
                }}
              >
                <span>
                  Positive Months
                </span>

                <strong>
                  {
                    wealthTrend.positiveMonths
                  }
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Negative Months
                </span>

                <strong>
                  {
                    wealthTrend.negativeMonths
                  }
                </strong>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================================================= */}
      {/* PERFORMANCE */}
      {/* ================================================= */}

      <div className="finance-grid">
        <div className="chart-card">
          <h4>
            📈 Top Performing Categories
          </h4>

          {profitItems.length >
          0 ? (
            profitItems
              .slice(0, 5)
              .map((item) => (
                <div
                  className="profit-item"
                  key={item.name}
                >
                  <strong>
                    {item.name}
                  </strong>

                  <div
                    style={{
                      color:
                        '#16a34a',
                    }}
                  >
                    +
                    {formatAmount(
                      item.profit,
                    )}{' '}
                    (
                    {formatPercentage(
                      item.returnPercentage,
                    )}
                    )
                  </div>
                </div>
              ))
          ) : (
            <p>
              No profit data.
            </p>
          )}
        </div>

        <div className="chart-card">
          <h4>
            📉 Worst Performing Categories
          </h4>

          {lossItems.length > 0 ? (
            lossItems
              .slice(0, 5)
              .map((item) => (
                <div
                  className="profit-item"
                  key={item.name}
                >
                  <strong>
                    {item.name}
                  </strong>

                  <div
                    style={{
                      color:
                        '#dc2626',
                    }}
                  >
                    {formatAmount(
                      item.profit,
                    )}{' '}
                    (
                    {formatPercentage(
                      item.returnPercentage,
                    )}
                    )
                  </div>
                </div>
              ))
          ) : (
            <p>
              No loss data.
            </p>
          )}
        </div>
      </div>

      {/* ================================================= */}
      {/* YEARLY MONTHLY CATEGORY TABLE */}
      {/* ================================================= */}

      {/* ================================================= */}
      {/* YEARLY MONTHLY CATEGORY TABLE */}
      {/* ================================================= */}

      <div
        className="chart-card"
        style={{
          marginTop: '1.5rem',
          overflowX: 'auto',
        }}
      >
        <div
          style={{
            marginBottom: '1rem',
          }}
        >
          <h4
            style={{
              marginBottom: '0.25rem',
            }}
          >
            📅 {selectedYear} Monthly
            Category Summary
          </h4>

          <small
            style={{
              opacity: 0.7,
            }}
          >
            All 12 months are shown.
            The highest value for each
            category is highlighted.
          </small>
        </div>

        {monthlyCategories.length ===
        0 ? (
          <p>
            No monthly finance snapshot
            data available for{' '}
            {selectedYear}.
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
                borderCollapse:
                  'collapse',
                minWidth: '1100px',
              }}
            >
              <thead>
                <tr>
                  {/* CATEGORY */}
                  <th
                    style={{
                      position:
                        'sticky',
                      left: 0,
                      background:
                        'var(--card-bg, #fff)',
                      textAlign: 'left',
                      padding: '0.75rem',
                      borderBottom:
                        '2px solid #e5e7eb',
                      zIndex: 2,
                      whiteSpace:
                        'nowrap',
                    }}
                  >
                    Category
                  </th>

                  {/* MONTHS */}
                  {monthlyCategoryRows.map(
                    (row) => (
                      <th
                        key={row.month}
                        style={{
                          textAlign:
                            'right',
                          padding:
                            '0.75rem',
                          borderBottom:
                            '2px solid #e5e7eb',
                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {row.monthName}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {monthlyCategories.map(
                  (category) => {
                    const highest =
                      Math.max(
                        ...monthlyCategoryRows.map(
                          (row) =>
                            row.values[
                              category
                                .categoryId
                            ] ?? 0,
                        ),
                      );

                    return (
                      <tr
                        key={
                          category.categoryId
                        }
                      >
                        {/* CATEGORY NAME */}
                        <td
                          style={{
                            position:
                              'sticky',
                            left: 0,
                            background:
                              'var(--card-bg, #fff)',
                            padding:
                              '0.75rem',
                            borderBottom:
                              '1px solid #e5e7eb',
                            fontWeight: 600,
                            whiteSpace:
                              'nowrap',
                            zIndex: 1,
                          }}
                        >
                          {
                            category.categoryName
                          }
                        </td>

                        {/* MONTH VALUES */}
                        {monthlyCategoryRows.map(
                          (row) => {
                            const value =
                              row.values[
                                category
                                  .categoryId
                              ] ?? 0;

                            const isHighest =
                              highest > 0 &&
                              value ===
                                highest;

                            return (
                              <td
                                key={
                                  row.month
                                }
                                style={{
                                  textAlign:
                                    'right',
                                  padding:
                                    '0.75rem',
                                  borderBottom:
                                    '1px solid #e5e7eb',
                                  fontWeight:
                                    isHighest
                                      ? 700
                                      : 400,
                                  background:
                                    isHighest
                                      ? 'rgba(22, 163, 74, 0.12)'
                                      : undefined,
                                  whiteSpace:
                                    'nowrap',
                                }}
                              >
                                {formatAmount(
                                  value,
                                )}

                                {isHighest && (
                                  <span
                                    title="Highest value for this category"
                                    style={{
                                      marginLeft:
                                        '0.35rem',
                                    }}
                                  >
                                    ⭐
                                  </span>
                                )}
                              </td>
                            );
                          },
                        )}
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}