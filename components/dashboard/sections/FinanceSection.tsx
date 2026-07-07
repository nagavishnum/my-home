"use client";

import { useMemo } from "react";

type Props = {
  finance: any[];

  financialFreedomScore: number;

  networthValue: number;
  totalAssestsValue: number;
  totalLiabilitiesValue: number;

  investmentsValue: number;
  liquidAssetsValue: number;
  retirementCorpus: number;
  insuranceValue: number;
  goalsValue: number;

  debtToAssetRatio: number;
  emergencyMonths: number;
  monthlyCommitments: number;
};

export default function FinanceSection({
  finance,

  financialFreedomScore,

  networthValue,
  totalAssestsValue,
  totalLiabilitiesValue,

  investmentsValue,
  liquidAssetsValue,
  retirementCorpus,
  insuranceValue,
  goalsValue,

  debtToAssetRatio,
  emergencyMonths,
  monthlyCommitments,

  investmentAllocation,
  retirementAllocation,
  insuranceAllocation,
  goalAllocation,
}: Props) {
  // 🔥 ALWAYS SAFE INPUT
  const safeFinance = finance ?? [];

  const financePerformance = useMemo(() => {
    const map: Record<string, any> = {};

    safeFinance.forEach((f) => {
      const name = f?.c?.n || "Other";

      const invested = Number(f?.a) || 0;
      const current = Number(f?.cv) || 0;

      if (!map[name]) {
        map[name] = {
          name,
          invested: 0,
          current: 0,
          profit: 0,
        };
      }

      map[name].invested += invested;
      map[name].current += current;
      map[name].profit += current - invested;
    });

    return Object.values(map);
  }, [safeFinance]);

  // 🔥 CRITICAL FIX (never undefined)
  const profitItems = useMemo(
    () => (financePerformance ?? []).filter((i: any) => i.profit > 0),
    [financePerformance],
  );

  const lossItems = useMemo(
    () => (financePerformance ?? []).filter((i: any) => i.profit < 0),
    [financePerformance],
  );

  return (
    <div className="dash-section" id="finance-section">
      <h2 style={{textAlign:"center"}}>📈 FINANCE</h2>

      <div className="finance-grid">
        <div className="chart-card">
          <h4>Financial Health</h4>

          <div className="summary-row">
            <span>Freedom Score</span>
            <strong>{financialFreedomScore}/100</strong>
          </div>

          <div className="summary-row">
            <span>Net Worth</span>
            <strong>₹{networthValue.toLocaleString()}</strong>
          </div>

          <div className="summary-row">
            <span>Total Assets</span>
            <strong>₹{totalAssestsValue.toLocaleString()}</strong>
          </div>

          <div className="summary-row">
            <span>Total Debt</span>
            <strong>₹{totalLiabilitiesValue.toLocaleString()}</strong>
          </div>

          <div className="summary-row">
            <span>Debt / Asset</span>
            <strong>{debtToAssetRatio.toFixed(1)}%</strong>
          </div>

          <div className="summary-row">
            <span>Emergency Fund</span>
            <strong>{emergencyMonths.toFixed(1)} Months</strong>
          </div>
        </div>

        <div className="chart-card">
          <h4>Wealth Allocation</h4>

          <div className="summary-row">
            <span>Investments</span>
            <strong>{investmentAllocation.toFixed(1)}%</strong>
          </div>

          <div className="summary-row">
            <span>Retirement</span>
            <strong>{retirementAllocation.toFixed(1)}%</strong>
          </div>

          <div className="summary-row">
            <span>Insurance</span>
            <strong>{insuranceAllocation.toFixed(1)}%</strong>
          </div>

          <div className="summary-row">
            <span>Goal Funds</span>
            <strong>{goalAllocation.toFixed(1)}%</strong>
          </div>
        </div>
      </div>

      <div className="finance-grid">
        <div className="chart-card">
          <h4>📈 Top Performing Categories</h4>

          {profitItems.length ? (
            profitItems
              .sort((a: any, b: any) => b.profit - a.profit)
              .slice(0, 5)
              .map((i: any) => (
                <div className="profit-item" key={i.name}>
                  <strong>{i.name}</strong>

                  <div style={{ color: "#16a34a" }}>
                    +₹{i.profit.toLocaleString()}
                  </div>
                </div>
              ))
          ) : (
            <p>No Profit Data</p>
          )}
        </div>

        <div className="chart-card">
          <h4>📉 Worst Performing Categories</h4>

          {lossItems.length ? (
            lossItems
              .sort((a: any) => a.profit)
              .slice(0, 5)
              .map((i: any) => (
                <div className="profit-item" key={i.name}>
                  <strong>{i.name}</strong>

                  <div style={{ color: "#dc2626" }}>
                    ₹{i.profit.toLocaleString()}
                  </div>
                </div>
              ))
          ) : (
            <p>No Loss Data</p>
          )}
        </div>
      </div>
    </div>
  );
}
