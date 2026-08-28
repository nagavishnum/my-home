'use client';

import {
  useEffect,
  useMemo,
  useRef,
} from 'react';

import * as d3 from 'd3';

import {
  AssetAllocationItem,
  FinanceHistoryItem,
  FinancialSafetyStatus,
  FinanceScore,
  InsuranceStatus,
  WealthTrend,
} from '../calculations/getFinanceCalculations';
import { FinanceScoreCard } from './smartmetrics/finance/FinanceScore';
import './financesection.css';

type Props = {
  selectedYear: number;
  metricMonthName: string;

  networthValue: number;
  previousNetworthValue:
    | number
    | null;
  networthChange:
    | number
    | null;
  networthGrowth:
    | number
    | null;
  hasPreviousSnapshot: boolean;

  totalAssetsValue: number;
  totalLiabilitiesValue: number;
  debtToAssetRatio: number;

  assetAllocation:
    AssetAllocationItem[];

  investmentValue: number;
  retirementValue: number;

  liquidAssetsValue: number;
  averagePreviousThreeMonthExpenses: number;
  emergencyMonths: number;
  financialSafetyStatus:
    FinancialSafetyStatus;

  insuranceStatus: InsuranceStatus;

  wealthTrend: WealthTrend;

  financeScore: FinanceScore;

  financeHistory:
    FinanceHistoryItem[];
};

const formatAmount = (
  value: number | null | undefined,
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return '—';
  }

  return `₹${Math.round(
    Number(value) || 0,
  ).toLocaleString('en-IN')}`;
};

const formatPercentage = (
  value:
    | number
    | null
    | undefined,
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return '—';
  }

  return `${Number(value).toFixed(
    1,
  )}%`;
};

const formatCompactAmount = (
  value: number,
) => {
  const amount =
    Number(value) || 0;

  if (
    Math.abs(amount) >=
    10000000
  ) {
    return `₹${(
      amount / 10000000
    ).toFixed(2)}Cr`;
  }

  if (
    Math.abs(amount) >=
    100000
  ) {
    return `₹${(
      amount / 100000
    ).toFixed(1)}L`;
  }

  if (
    Math.abs(amount) >=
    1000
  ) {
    return `₹${(
      amount / 1000
    ).toFixed(0)}K`;
  }

  return `₹${Math.round(
    amount,
  ).toLocaleString(
    'en-IN',
  )}`;
};

/* =========================================================
   NET WORTH D3 CHART
========================================================= */

const WEALTH_MILESTONE_TARGET =
  20000000; // ₹1 Crore

const WEALTH_MILESTONE_HORIZON_MONTHS =
  60; // 5 years

const WEALTH_SAFETY_SPLIT = 0.4;

const WEALTH_GROWTH_SPLIT = 0.6;

/*
 * Illustrative FD / income-yield assumption.
 *
 * This is NOT a guaranteed return.
 * It is only used to estimate recurring
 * income capacity after reaching the milestone.
 */
const WEALTH_RECURRING_INCOME_RATE =
  0.065;

type WealthMilestoneStatus =
  | 'achieved'
  | 'on-track'
  | 'building'
  | 'slow'
  | 'no-momentum';

type WealthMilestoneData = {
  target: number;
  current: number;
  remaining: number;
  progress: number;

  averageMonthlyGrowth: number;
  latestMonthlyGrowth: number;

  requiredMonthlyGrowth: number;

  estimatedMonthsToTarget:
    | number
    | null;

  estimatedTargetDate:
    | Date
    | null;

  status: WealthMilestoneStatus;

  safetyCapital: number;
  growthCapital: number;

  estimatedMonthlyIncome: number;
  estimatedAnnualIncome: number;
};

/*
 * Calculates the actual wealth-building
 * velocity from existing finance snapshots.
 *
 * No new API.
 * No new database field.
 */
const getAverageMonthlyWealthGrowth = (
  history: FinanceHistoryItem[],
): number => {
  if (history.length < 2) {
    return 0;
  }

  const growthValues: number[] = [];

  for (
    let index = 1;
    index < history.length;
    index++
  ) {
    const previous =
      history[index - 1].netWorth;

    const current =
      history[index].netWorth;

    const growth =
      current - previous;

    /*
     * We only use positive wealth creation
     * when calculating the long-term velocity.
     *
     * A negative month is still visible through
     * the existing wealth trend, but should not
     * artificially make the required-growth
     * calculation explode.
     */
    if (growth > 0) {
      growthValues.push(growth);
    }
  }

  if (
    growthValues.length === 0
  ) {
    return 0;
  }

  return (
    growthValues.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) /
    growthValues.length
  );
};

const getLatestMonthlyWealthGrowth = (
  history: FinanceHistoryItem[],
): number => {
  if (history.length < 2) {
    return 0;
  }

  const latest =
    history[history.length - 1];

  const previous =
    history[history.length - 2];

  return (
    latest.netWorth -
    previous.netWorth
  );
};

const getRequiredMonthlyWealthGrowth = (
  currentNetWorth: number,
  target: number,
  months: number,
): number => {
  if (
    currentNetWorth >= target ||
    months <= 0
  ) {
    return 0;
  }

  return (
    target -
    currentNetWorth
  ) / months;
};

const getWealthMilestoneStatus = ({
  current,
  target,
  averageMonthlyGrowth,
  requiredMonthlyGrowth,
}: {
  current: number;
  target: number;
  averageMonthlyGrowth: number;
  requiredMonthlyGrowth: number;
}): WealthMilestoneStatus => {
  if (current >= target) {
    return 'achieved';
  }

  if (
    averageMonthlyGrowth <= 0
  ) {
    return 'no-momentum';
  }

  /*
   * 110%+ of required pace
   */
  if (
    averageMonthlyGrowth >=
    requiredMonthlyGrowth * 1.1
  ) {
    return 'on-track';
  }

  /*
   * 75% - 109%
   */
  if (
    averageMonthlyGrowth >=
    requiredMonthlyGrowth * 0.75
  ) {
    return 'building';
  }

  return 'slow';
};

const getWealthMilestoneData = (
  currentNetWorth: number,
  history: FinanceHistoryItem[],
): WealthMilestoneData => {
  const target =
    WEALTH_MILESTONE_TARGET;

  const current =
    Math.max(
      0,
      currentNetWorth,
    );

  const remaining =
    Math.max(
      0,
      target - current,
    );

  const progress =
    target > 0
      ? Math.min(
          (current / target) *
            100,
          100,
        )
      : 0;

  const averageMonthlyGrowth =
    getAverageMonthlyWealthGrowth(
      history,
    );

  const latestMonthlyGrowth =
    getLatestMonthlyWealthGrowth(
      history,
    );

  const requiredMonthlyGrowth =
    getRequiredMonthlyWealthGrowth(
      current,
      target,
      WEALTH_MILESTONE_HORIZON_MONTHS,
    );

  let estimatedMonthsToTarget:
    | number
    | null = null;

  let estimatedTargetDate:
    | Date
    | null = null;

  if (current >= target) {
    estimatedMonthsToTarget = 0;

    estimatedTargetDate =
      new Date();
  } else if (
    averageMonthlyGrowth > 0
  ) {
    estimatedMonthsToTarget =
      Math.ceil(
        remaining /
          averageMonthlyGrowth,
      );

    estimatedTargetDate =
      new Date();

    estimatedTargetDate.setMonth(
      estimatedTargetDate.getMonth() +
        estimatedMonthsToTarget,
    );
  }

  const status =
    getWealthMilestoneStatus({
      current,
      target,
      averageMonthlyGrowth,
      requiredMonthlyGrowth,
    });

  /*
   * Once ₹1 Cr is achieved:
   *
   * 50% -> safety / recurring income
   * 50% -> growth
   */
  const safetyCapital =
    target *
    WEALTH_SAFETY_SPLIT;

  const growthCapital =
    target *
    WEALTH_GROWTH_SPLIT;

  const estimatedAnnualIncome =
    safetyCapital *
    WEALTH_RECURRING_INCOME_RATE;

  const estimatedMonthlyIncome =
    estimatedAnnualIncome / 12;

  return {
    target,
    current,
    remaining,
    progress,

    averageMonthlyGrowth,
    latestMonthlyGrowth,

    requiredMonthlyGrowth,

    estimatedMonthsToTarget,
    estimatedTargetDate,

    status,

    safetyCapital,
    growthCapital,

    estimatedMonthlyIncome,
    estimatedAnnualIncome,
  };
};

const formatTargetDate = (
  date: Date | null,
): string => {
  if (!date) {
    return '—';
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      month: 'short',
      year: 'numeric',
    },
  );
};

const getMilestoneStatusUI = (
  status: WealthMilestoneStatus,
) => {
  switch (status) {
    case 'achieved':
      return {
        icon: '🏆',
        label: 'MILESTONE ACHIEVED',
        className: 'success',
        description:
          'You have crossed your first major capital milestone. The strategy now shifts from accumulation to capital architecture.',
      };

    case 'on-track':
      return {
        icon: '🟢',
        label: 'ON TRACK',
        className: 'success',
        description:
          'Your current wealth-creation velocity is sufficient to reach the ₹1 Cr milestone within the planned horizon.',
      };

    case 'building':
      return {
        icon: '🟡',
        label: 'BUILDING',
        className: 'warning',
        description:
          'You are moving toward the milestone, but increasing monthly capital creation would accelerate the journey.',
      };

    case 'slow':
      return {
        icon: '🟠',
        label: 'TOO SLOW',
        className: 'warning',
        description:
          'You are creating wealth, but not fast enough for the current target horizon.',
      };

    default:
      return {
        icon: '🔴',
        label: 'NO MOMENTUM',
        className: 'danger',
        description:
          'Your recent snapshots do not show enough positive wealth creation to project a reliable path to the milestone.',
      };
  }
}
function NetWorthChart({
  history,
}: {
  history: FinanceHistoryItem[];
}) {
  const containerRef =
    useRef<HTMLDivElement>(null);
/* =========================================================
   WEALTH MILESTONE ENGINE
   ADD-ONLY SECTION
========================================================= */

  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    container.innerHTML = '';

    if (history.length < 2) {
      return;
    }

    const width =
      container.clientWidth ||
      700;

    const height = 280;

    const margin = {
      top: 20,
      right: 24,
      bottom: 42,
      left: 64,
    };

    const svg = d3
      .select(container)
      .append('svg')
      .attr(
        'width',
        '100%',
      )
      .attr(
        'viewBox',
        `0 0 ${width} ${height}`,
      )
      .attr(
        'preserveAspectRatio',
        'xMidYMid meet',
      );

    const innerWidth =
      width -
      margin.left -
      margin.right;

    const innerHeight =
      height -
      margin.top -
      margin.bottom;

    const chart =
      svg
        .append('g')
        .attr(
          'transform',
          `translate(${margin.left},${margin.top})`,
        );

    const x =
      d3
        .scalePoint<number>()
        .domain(
          history.map(
            (item) =>
              item.period,
          ),
        )
        .range([
          0,
          innerWidth,
        ]);

    const values =
      history.map(
        (item) =>
          item.netWorth,
      );

    const minValue =
      Math.min(...values);

    const maxValue =
      Math.max(...values);

    const padding =
      Math.max(
        (maxValue -
          minValue) *
          0.15,
        1000,
      );

    const y =
      d3
        .scaleLinear()
        .domain([
          Math.max(
            0,
            minValue -
              padding,
          ),
          maxValue +
            padding,
        ])
        .nice()
        .range([
          innerHeight,
          0,
        ]);

    chart
      .append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat(
            (value) =>
              formatCompactAmount(
                Number(value),
              ),
          ),
      )
      .call((group) => {
        group
          .select('.domain')
          .remove();

        group
          .selectAll(
            '.tick line',
          )
          .attr(
            'x2',
            innerWidth,
          )
          .attr(
            'stroke',
            'currentColor',
          )
          .attr(
            'opacity',
            0.08,
          );
      });

    chart
      .append('g')
      .attr(
        'transform',
        `translate(0,${innerHeight})`,
      )
      .call(
        d3
          .axisBottom(x)
          .tickFormat(
            (value) => {
              const item =
                history.find(
                  (entry) =>
                    entry.period ===
                    Number(
                      value,
                    ),
                );

              return item
                ? `${item.monthName.slice(
                    0,
                    3,
                  )} ${item.year}`
                : '';
            },
          ),
      )
      .call((group) => {
        group
          .select('.domain')
          .attr(
            'opacity',
            0.15,
          );

        group
          .selectAll(
            '.tick line',
          )
          .remove();
      });

    const line =
      d3
        .line<FinanceHistoryItem>()
        .x(
          (item) =>
            x(item.period) ??
            0,
        )
        .y(
          (item) =>
            y(item.netWorth),
        )
        .curve(
          d3.curveMonotoneX,
        );

    chart
      .append('path')
      .datum(history)
      .attr(
        'fill',
        'none',
      )
      .attr(
        'stroke',
        'currentColor',
      )
      .attr(
        'stroke-width',
        3,
      )
      .attr(
        'stroke-linecap',
        'round',
      )
      .attr(
        'd',
        line,
      );

    chart
      .selectAll(
        '.net-worth-point',
      )
      .data(history)
      .enter()
      .append('circle')
      .attr(
        'class',
        'net-worth-point',
      )
      .attr(
        'cx',
        (item) =>
          x(item.period) ??
          0,
      )
      .attr(
        'cy',
        (item) =>
          y(item.netWorth),
      )
      .attr(
        'r',
        4,
      )
      .attr(
        'fill',
        'currentColor',
      );

    const tooltip =
      d3
        .select(container)
        .append('div')
        .style(
          'position',
          'absolute',
        )
        .style(
          'display',
          'none',
        )
        .style(
          'pointer-events',
          'none',
        )
        .style(
          'padding',
          '8px 10px',
        )
        .style(
          'border',
          '1px solid var(--border-color, #e5e7eb)',
        )
        .style(
          'border-radius',
          '8px',
        )
        .style(
          'background',
          'var(--card-bg, #fff)',
        )
        .style(
          'font-size',
          '12px',
        )
        .style(
          'z-index',
          '10',
        );

    chart
      .selectAll(
        '.net-worth-point',
      )
      .on(
        'mouseenter',
        function (
          event,
          item,
        ) {
          const entry =
            item as FinanceHistoryItem;

          tooltip
            .style(
              'display',
              'block',
            )
            .html(
              `<strong>${entry.monthName} ${entry.year}</strong><br/>${formatAmount(entry.netWorth)}`,
            );

          d3.select(this).attr(
            'r',
            6,
          );

          const [mouseX, mouseY] =
            d3.pointer(
              event,
              container,
            );

          tooltip
            .style(
              'left',
              `${mouseX + 12}px`,
            )
            .style(
              'top',
              `${mouseY - 12}px`,
            );
        },
      )
      .on(
        'mouseleave',
        function () {
          tooltip.style(
            'display',
            'none',
          );

          d3.select(this).attr(
            'r',
            4,
          );
        },
      );

    return () => {
      container.innerHTML = '';
    };
  }, [history]);

  if (
    history.length < 2
  ) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="finance-d3-chart"
      style={{
        position: 'relative',
        width: '100%',
      }}
    />
  );
}
/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function FinanceSection({
  selectedYear,
  metricMonthName,

  networthValue,
  previousNetworthValue,
  networthChange,
  networthGrowth,
  hasPreviousSnapshot,

  totalAssetsValue,
  totalLiabilitiesValue,
  debtToAssetRatio,

  assetAllocation,

  investmentValue,
  retirementValue,

  liquidAssetsValue,
  averagePreviousThreeMonthExpenses,
  emergencyMonths,
  financialSafetyStatus,

  insuranceStatus,

  wealthTrend,

  financeScore,

  financeHistory,
}: Props) {
  const wealthTrendMessage =
    useMemo(() => {
      if (
        wealthTrend.status ===
        'insufficient-data'
      ) {
        return {
          icon: '⏳',
          title:
            'Your wealth baseline is established',
          description:
            `${selectedYear} is your first finance snapshot. Future monthly snapshots will measure whether your net worth is actually growing.`,
        };
      }

      if (
        wealthTrend.status ===
        'getting-richer'
      ) {
        return {
          icon: '🟢',
          title:
            'Yes — your net worth is growing',
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
            `${wealthTrend.positiveMonths} months increased and ${wealthTrend.negativeMonths} months decreased.`,
        };
      }

      return {
        icon: '🔴',
        title:
          'Your net worth is trending down',
        description:
          'Recent snapshots show more declines than increases.',
      };
    }, [
      wealthTrend,
      selectedYear,
    ]);

  const historyForChart =
    financeHistory.filter(
      (item) =>
        item.year <=
        selectedYear,
    );
  /* =======================================================
     WEALTH MILESTONE
  ======================================================= */

  const wealthMilestone =
    useMemo(
      () =>
        getWealthMilestoneData(
          networthValue,
          financeHistory,
        ),
      [
        networthValue,
        financeHistory,
      ],
    );

  const wealthMilestoneUI =
    getMilestoneStatusUI(
      wealthMilestone.status,
    );

  const milestoneMonthlyGap =
    Math.max(
      0,
      wealthMilestone.requiredMonthlyGrowth -
        wealthMilestone.averageMonthlyGrowth,
    );

  const milestonePacePercentage =
    wealthMilestone.requiredMonthlyGrowth >
    0
      ? Math.min(
          (wealthMilestone.averageMonthlyGrowth /
            wealthMilestone.requiredMonthlyGrowth) *
            100,
          200,
        )
      : 100;
return (
  <section
    className="dash-section finance-command-center"
    id="finance-section"
  >
    <div className="finance-section-header">
        <h3>
          WEALTH OVERVIEW
        </h3>
    </div>

    {/* ================================================= */}
    {/* ROW 1 — NET WORTH + CAPITAL ALLOCATION */}
    {/* ================================================= */}

    <div className="finance-grid">
      {/* NET WORTH */}

<div className="finance-section-block">
  <div className="chart-card wealth-capital-engine">

    {/* ================================================= */}
    {/* HEADER */}
    {/* ================================================= */}

    <div className="finance-card-heading">
      <div>
        <span className="finance-card-label">
          FINANCIAL FREEDOM TARGET
        </span>

        <h3>
          🎯 ₹2 Crore
        </h3>

        <p className="finance-helper-text">
          Build capital first. Then create income from
          part of it and keep the rest growing.
        </p>
      </div>
    </div>

    {/* ================================================= */}
    {/* CURRENT NET WORTH */}
    {/* ================================================= */}

    <div className="wealth-engine-overview">

      <div className="wealth-engine-primary">

        <span className="finance-card-label">
          CURRENT NET WORTH
        </span>

        <strong>
          {formatAmount(networthValue)}
        </strong>

        {!hasPreviousSnapshot ? (
          <small>
            Starting point established
          </small>
        ) : (
          <div
            className={`wealth-engine-change ${
              (networthChange ?? 0) >= 0
                ? 'finance-positive'
                : 'finance-negative'
            }`}
          >
            {(networthChange ?? 0) >= 0 ? '↑' : '↓'}{' '}
            {formatAmount(
              Math.abs(networthChange ?? 0),
            )}{' '}
            ·{' '}
            {formatPercentage(networthGrowth)}
          </div>
        )}

      </div>

      <div className="wealth-engine-stat">

        <span>
          ASSETS
        </span>

        <strong>
          {formatAmount(totalAssetsValue)}
        </strong>

      </div>

      <div className="wealth-engine-stat">

        <span>
          LIABILITIES
        </span>

        <strong>
          {formatAmount(totalLiabilitiesValue)}
        </strong>

      </div>

      <div className="wealth-engine-stat">

        <span>
          DEBT / ASSET
        </span>

        <strong>
          {formatPercentage(debtToAssetRatio)}
        </strong>

      </div>

    </div>

    {/* ================================================= */}
    {/* ₹2 CRORE PROGRESS */}
    {/* ================================================= */}

    <div className="wealth-engine-target">

      <div className="wealth-engine-target-header">

        <div>
          <span className="finance-card-label">
            CAPITAL PROGRESS
          </span>

          <strong>
            {formatCompactAmount(
              wealthMilestone.current,
            )}
          </strong>

          <small>
            of {formatCompactAmount(
              wealthMilestone.target,
            )} target
          </small>
        </div>

        <div className="wealth-engine-target-gap">

          <span>
            CAPITAL GAP
          </span>

          <strong>
            {wealthMilestone.remaining > 0
              ? formatCompactAmount(
                  wealthMilestone.remaining,
                )
              : '₹0'}
          </strong>

          <small>
            {wealthMilestone.progress.toFixed(1)}% achieved
          </small>

        </div>

      </div>

      <div className="wealth-engine-progress-header">
        <span>₹0</span>

        <strong>
          {wealthMilestone.progress.toFixed(1)}%
        </strong>

        <span>₹2 Cr</span>
      </div>

      <div className="wealth-engine-progress">

        <div
          style={{
            width: `${Math.min(
              wealthMilestone.progress,
              100,
            )}%`,
          }}
        />

      </div>

    </div>

    {/* ================================================= */}
    {/* CURRENT CAPITAL ALLOCATION */}
    {/* ================================================= */}



    {/* ================================================= */}
    {/* ₹2 CRORE CAPITAL ARCHITECTURE */}
    {/* ================================================= */}

    {/* ================================================= */}
    {/* CORE RULE */}
    {/* ================================================= */}

    <div className="wealth-engine-rule">

      <span>
        💡 THE WEALTH-BUILDING RULE
      </span>

      <strong>
        Build capital → create income → keep the
        remaining capital growing → rebalance as
        expenses increase.
      </strong>

      <p>
        The ₹2 Cr milestone is not the end goal.
        It is the point where your capital starts
        working alongside your income to fund your
        lifestyle and build future wealth.
      </p>

    </div>

  </div>
</div>

      {/* CAPITAL ALLOCATION */}

      <div className="finance-section-block">


        <div className="chart-card">
                  <div className="finance-section-title">
          <div>
            <span>
              📊 Capital Allocation
            </span>

            <small>
              Where is my wealth currently
              sitting?
            </small>
          </div>
        </div>
          {assetAllocation.length >
          0 ? (
            <div className="asset-allocation-layout">
              <div className="asset-allocation-list">
                {assetAllocation.map(
                  (item) => (
                    <div
                      className="asset-allocation-row"
                      key={
                        item.categoryId
                      }
                    >
                      <div>
                        <span className="asset-allocation-name">
                          {
                            item.name
                          }
                        </span>

                        <div className="asset-allocation-progress">
                          <div
                            style={{
                              width: `${Math.min(
                                item.percentage,
                                100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="asset-allocation-value">
                        <strong>
                          {formatAmount(
                            item.value,
                          )}
                        </strong>

                        <small>
                          {formatPercentage(
                            item.percentage,
                          )}
                        </small>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : (
            <p className="finance-empty">
              No asset allocation data
              available.
            </p>
          )}
        </div>
      </div>
    </div>

    {/* ================================================= */}
    {/* ROW 2 — NET WORTH GRAPH + RISK BUFFER */}
    {/* ================================================= */}

    <div className="finance-grid">
      {/* NET WORTH GRAPH */}

      <div className="finance-section-block">
        <div className="finance-trend-card chart-card">
          <div className="finance-trend-summary">
            <div className="finance-trend-icon">
              {
                wealthTrendMessage.icon
              }
            </div>

            <div>
              <h3>
                {
                  wealthTrendMessage.title
                }
              </h3>

              <p>
                {
                  wealthTrendMessage.description
                }
              </p>
            </div>
          </div>

          {historyForChart.length >=
          2 ? (
            <NetWorthChart
              history={
                historyForChart
              }
            />
          ) : (
            <div className="finance-empty-chart">
              <div className="finance-empty-chart-line">
                <span />
                <span />
                <span />
                <span />
              </div>

              <p>
                Your net-worth graph
                will appear after
                your second monthly
                snapshot.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RISK BUFFER */}

      <div className="chart-card">
        <div className="finance-card-heading">
          <div>
            <span className="finance-card-label">
              RISK BUFFER
            </span>

            <h3>
              🛡️ Financial Safety
            </h3>
          </div>

          <span
            className={`finance-status-pill ${
              financialSafetyStatus ===
              'Strong'
                ? 'success'
                : financialSafetyStatus ===
                    'Moderate'
                  ? 'warning'
                  : 'danger'
            }`}
          >
            {
              financialSafetyStatus
            }
          </span>
        </div>

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
            Avg. Previous 3 Months
          </span>

          <strong>
            {formatAmount(
              averagePreviousThreeMonthExpenses,
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

        <div className="finance-safety-bar">
          <div
            style={{
              width: `${Math.min(
                (emergencyMonths /
                  6) *
                  100,
                100,
              )}%`,
            }}
          />
        </div>

        <small className="finance-helper-text">
          Target: 6 months of
          average previous
          3-month expenses
        </small>

        {/* INSURANCE */}

        <div className="finance-risk-buffer-insurance">
          <div className="summary-row">
            <span>
              Health Insurance
            </span>

            <strong>
              {insuranceStatus
                .healthInsurance
                .active
                ? '✓ Yes'
                : '✕ No'}
            </strong>
          </div>

          <div className="summary-row">
            <span>
              Term Insurance
            </span>

            <strong>
              {insuranceStatus
                .termInsurance
                .active
                ? '✓ Yes'
                : '✕ No'}
            </strong>
          </div>

          {insuranceStatus
            .lifeInsurance
            .active && (
            <div className="summary-row">
              <span>
                Life Insurance
              </span>

              <strong>
                ✓ Yes
              </strong>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* ================================================= */}
    {/* ROW 3 — WEALTH BUILDER SCORE + MONTHLY METRICS */}
    {/* ================================================= */}

    <div className="finance-grid">
      {/* WEALTH BUILDER SCORE */}

      <div className="finance-section-block">
        <FinanceScoreCard
          financeScore={
            financeScore
          }
        />
      </div>

      {/* MONTHLY METRICS */}

      <div
        className="chart-card finance-table-card"
      >
        {financeHistory.length ===
        0 ? (
          <p className="finance-empty">
            No finance snapshots
            available.
          </p>
        ) : (
          <div className="finance-table-wrapper">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>
                    Month
                  </th>

                  <th>
                    Net Worth
                  </th>

                  <th>
                    Assets
                  </th>

                  <th>
                    Liabilities
                  </th>

                  <th>
                    Debt / Asset
                  </th>
                </tr>
              </thead>

              <tbody>
                {financeHistory.map(
                  (item) => (
                    <tr
                      key={
                        item.period
                      }
                      className={
                        item.period ===
                        Number(
                          `${selectedYear}${String(
                            item.month,
                          ).padStart(
                            2,
                            '0',
                          )}`,
                        )
                          ? 'current-period'
                          : ''
                      }
                    >
                      <td>
                        <strong>
                          {
                            item.monthName
                          }
                        </strong>

                        <small>
                          {
                            item.year
                          }
                        </small>
                      </td>

                      <td className="finance-table-primary">
                        {formatAmount(
                          item.netWorth,
                        )}
                      </td>

                      <td>
                        {formatAmount(
                          item.assets,
                        )}
                      </td>

                      <td>
                        {formatAmount(
                          item.liabilities,
                        )}
                      </td>

                      <td>
                        {formatPercentage(
                          item.debtToAssetRatio,
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
          {/* ================================================= */}
    {/* ROW 4 — WEALTH MILESTONE / CAPITAL ENGINE */}
    {/* ================================================= */}


    
    </div>


  </section>
);
}