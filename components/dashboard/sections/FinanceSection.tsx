"use client";

import { useMemo } from "react";

import {
  AssetAllocationItem,
  FinanceHistoryItem,
} from "../calculations/getFinanceCalculations";
import "./financesection.css";
import { CURRENT_YEAR } from "@/lib/constants";

type Props = {
  networthValue: number;
  networthChange: number | null;
  networthGrowth: number | null;
  hasPreviousSnapshot: boolean;
  totalAssetsValue: number;
  totalLiabilitiesValue: number;
  debtToAssetRatio: number;
  assetAllocation: AssetAllocationItem[];
  liquidAssetsValue: number;
  emergencyMonths: number;
  financeHistory: FinanceHistoryItem[];
};

const formatAmount = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "—";
  }

  return `₹${((Number(value) || 0) / 100000).toFixed(2)} L`;
};

const formatPercentage = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${Number(value).toFixed(1)}%`;
};

const formatCompactAmount = (value: number) => {
  const amount = Number(value) || 0;

  if (Math.abs(amount) >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  }

  if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }

  if (Math.abs(amount) >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }

  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
};

const WEALTH_MILESTONE_TARGET = 20000000;

type WealthMilestoneData = {

  remaining: number;
  progress: number;
};

const getAverageMonthlyWealthGrowth = (
  history: FinanceHistoryItem[],
): number => {
  if (history.length < 2) {
    return 0;
  }

  const growthValues: number[] = [];

  for (let index = 1; index < history.length; index++) {
    const previous = history[index - 1].netWorth;

    const current = history[index].netWorth;

    const growth = current - previous;
    if (growth > 0) {
      growthValues.push(growth);
    }
  }

  if (growthValues.length === 0) {
    return 0;
  }

  return (
    growthValues.reduce((sum, value) => sum + value, 0) / growthValues.length
  );
};

const getWealthMilestoneData = (
  currentNetWorth: number,
  history: FinanceHistoryItem[],
): WealthMilestoneData => {
  const target = WEALTH_MILESTONE_TARGET;

  const current = Math.max(0, currentNetWorth);

  const remaining = Math.max(0, target - current);

  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  const averageMonthlyGrowth = getAverageMonthlyWealthGrowth(history);


  let estimatedMonthsToTarget: number | null = null;

  let estimatedTargetDate: Date | null = null;

  if (current >= target) {
    estimatedMonthsToTarget = 0;

    estimatedTargetDate = new Date();
  } else if (averageMonthlyGrowth > 0) {
    estimatedMonthsToTarget = Math.ceil(remaining / averageMonthlyGrowth);

    estimatedTargetDate = new Date();

    estimatedTargetDate.setMonth(
      estimatedTargetDate.getMonth() + estimatedMonthsToTarget,
    );
  }

  return {
    remaining,
    progress,
  };
};

export default function FinanceSection({
  networthValue,
  networthChange,
  networthGrowth,
  hasPreviousSnapshot,
  totalAssetsValue,
  totalLiabilitiesValue,
  debtToAssetRatio,
  assetAllocation,
  liquidAssetsValue,
  emergencyMonths,
  financeHistory,
}: Readonly<Props>) {
  const wealthMilestone = useMemo(
    () => getWealthMilestoneData(networthValue, financeHistory),
    [networthValue, financeHistory],
  );

  return (
    <div className="finance-grid">
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="finance-section-block">
          <div className="chart-card wealth-capital-engine">
            <h4>Build capital → create recurring income + invest for growth</h4>

            <div className="wealth-engine-overview">
              <div className="wealth-engine-primary">
                <span className="finance-card-label">NET WORTH</span>

                <strong>{formatAmount(networthValue)}</strong>

                {!hasPreviousSnapshot ? (
                  <small>Starting point established</small>
                ) : (
                  <div
                    className={`wealth-engine-change ${
                      (networthChange ?? 0) >= 0
                        ? "finance-positive"
                        : "finance-negative"
                    }`}
                  >
                    {(networthChange ?? 0) >= 0 ? "↑" : "↓"}{" "}
                    {formatAmount(Math.abs(networthChange ?? 0))} ·{" "}
                    {formatPercentage(networthGrowth)}
                  </div>
                )}
              </div>

              <div className="wealth-engine-stat">
                <span>ASSETS</span>

                <strong>{formatAmount(totalAssetsValue)}</strong>
              </div>

              <div className="wealth-engine-stat">
                <span>LIABILITIES</span>

                <strong>{formatAmount(totalLiabilitiesValue)}</strong>
                <small>{formatPercentage(debtToAssetRatio)}</small>
              </div>

              <div className="wealth-engine-stat">
                <span>Safety Buffer</span>

                <strong>{emergencyMonths.toFixed(1)} M</strong>
                <small>{formatAmount(liquidAssetsValue)}</small>
              </div>
              <div className="wealth-engine-primary">
                <span className="finance-card-label">TARGET</span>

                <strong>₹2 Cr</strong>

                <div
                  className={`wealth-engine-change ${
                    (networthChange ?? 0) >= 0
                      ? "finance-positive"
                      : "finance-negative"
                  }`}
                >
                  {wealthMilestone.progress.toFixed(1)}% -{" "}
                  {formatCompactAmount(wealthMilestone.remaining)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="finance-table-card">
          {financeHistory.length === 0 ? (
            <p className="finance-empty">No finance snapshots available.</p>
          ) : (
            <div className="finance-table-wrapper">
              <table className="finance-table">
                <thead>
                  <tr>
                    <th>Month</th>

                    <th>Net Worth</th>

                    <th>Assets</th>

                    <th>Liabilities</th>

                    <th>Debt / Asset</th>
                  </tr>
                </thead>

                <tbody>
                  {financeHistory.map((item) => (
                    <tr
                      key={item.period}
                      className={
                        item.period ===
                        Number(
                          `${CURRENT_YEAR}${String(item.month).padStart(
                            2,
                            "0",
                          )}`,
                        )
                          ? "current-period"
                          : ""
                      }
                    >
                      <td>
                        <strong>{item.monthName}</strong>

                        <small>{item.year}</small>
                      </td>

                      <td className="finance-table-primary">
                        {formatAmount(item.netWorth)}
                      </td>

                      <td>{formatAmount(item.assets)}</td>

                      <td>{formatAmount(item.liabilities)}</td>

                      <td>{formatPercentage(item.debtToAssetRatio)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <div className="finance-section-block">
        <div className="chart-card">
          {assetAllocation.length > 0 ? (
            <div className="asset-allocation-layout">
              <div className="asset-allocation-list">
                {assetAllocation.map((item) => (
                  <div className="asset-allocation-row" key={item.categoryId}>
                    <div>
                      <span className="asset-allocation-name">{item.name}</span>

                      <div className="asset-allocation-progress">
                        <div
                          style={{
                            width: `${Math.min(item.percentage, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="asset-allocation-value">
                      <strong>{formatAmount(item.value)}</strong>

                      <small>{formatPercentage(item.percentage)}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="finance-empty">No asset allocation data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
