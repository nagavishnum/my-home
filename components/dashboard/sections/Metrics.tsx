'use client';

export default function MetricsSection({
  totalExpenses,
  thisMonthExpenses,
  todayExpenses,
  totalInvested,
  totalCurrentValue,
  totalMonthlySip,
  totalTodos,
}: any) {
  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <div className="metric-label">Total Expenses</div>
        <div className="metric-value">₹{totalExpenses}</div>
      </div>

      <div className="metric-card">
        <div className="metric-label">This Month Expenses</div>
        <div className="metric-value">₹{thisMonthExpenses}</div>
      </div>

      <div className="metric-card highlight-card">
        <div className="metric-label">Today Expenses</div>
        <div className="metric-value">₹{todayExpenses}</div>
      </div>

      <div className="metric-card">
        <div className="metric-label">Total Invested</div>
        <div className="metric-value">₹{totalInvested}</div>
      </div>

      <div className="metric-card">
        <div className="metric-label">Current Value</div>
        <div className="metric-value">₹{totalCurrentValue}</div>
      </div>

      <div className="metric-card">
        <div className="metric-label">Monthly SIP</div>
        <div className="metric-value">₹{totalMonthlySip}</div>
      </div>

      <div className="metric-card highlight-card">
        <div className="metric-label">Pending Today</div>
        <div className="metric-value">{totalTodos}</div>
      </div>
    </div>
  );
}