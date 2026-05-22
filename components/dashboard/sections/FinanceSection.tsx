'use client';

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Props = {
  finance: any[];
};

export default function FinanceSection({ finance }: Props) {
  // 🔥 ALWAYS SAFE INPUT
  const safeFinance = finance ?? [];

  const financePerformance = useMemo(() => {
    const map: Record<string, any> = {};

    safeFinance.forEach((f) => {
      const name = f?.c?.n || 'Other';

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
    [financePerformance]
  );

  const lossItems = useMemo(
    () => (financePerformance ?? []).filter((i: any) => i.profit < 0),
    [financePerformance]
  );

return (
  <div className="dash-section">
    <h3>📈 Finance Performance</h3>

    <div className="finance-grid">
<div className="chart-card finance-overview">
  <h4>📊 Finance Overview</h4>

  <ResponsiveContainer width="100%" height={320}>
    <BarChart data={financePerformance}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />

      <Bar dataKey="invested" fill="#3b82f6" />
      <Bar dataKey="current" fill="#10b981" />
      <Bar dataKey="profit" fill="#f59e0b" />
    </BarChart>
  </ResponsiveContainer>
</div>
      {/* PROFIT */}
      <div className="chart-card">
        <h4>📈 Profit Categories</h4>

        {profitItems.length > 0 ? (
          <div className="profit-loss-list">
            {profitItems.map((i: any) => (
              <div key={i.name} className="profit-item">
                <strong>{i.name}</strong>

                <div style={{ color: '#10b981', fontWeight: 700 }}>
                  +₹{Number(i.profit).toLocaleString()}
                </div>

                <small>
                  ₹{Number(i.current).toLocaleString()} / ₹
                  {Number(i.invested).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No profit data</p>
        )}
      </div>

      {/* LOSS */}
      <div className="chart-card">
        <h4>📉 Loss Categories</h4>

        {lossItems.length > 0 ? (
          <div className="profit-loss-list">
            {lossItems.map((i: any) => (
              <div key={i.name} className="profit-item">
                <strong>{i.name}</strong>

                <div style={{ color: '#ef4444', fontWeight: 700 }}>
                  ₹{Number(i.profit).toLocaleString()}
                </div>

                <small>
                  ₹{Number(i.current).toLocaleString()} / ₹
                  {Number(i.invested).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No loss data</p>
        )}
      </div>
    </div>
  </div>
);
}