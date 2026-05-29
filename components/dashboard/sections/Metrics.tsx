'use client';

import { scrollToView } from "@/lib/helpers";

export default function MetricsSection({
  totalExpenses,
  thisMonthExpenses,
  totalInvested,
  totalCurrentValue,
  totalMonthlySip,
  totalTodos,
}: any) {
  return (
    <div className="metrics-grid">
      <div className="metric-card" onClick={()=> scrollToView('expenses-section')}>
        <div className="metric-label">Expenses wrt Year</div>
        <div className="metric-value">₹{totalExpenses}</div>
      </div>

      <div className="metric-card" onClick={()=> scrollToView('expenses-section')}>
        <div className="metric-label">Expenses wrt Month</div>
        <div className="metric-value">₹{thisMonthExpenses}</div>
      </div>

      <div className="metric-card" onClick={()=> scrollToView('finance-section')}>
        <div className="metric-label">Total Invested</div>
        <div className="metric-value">₹{totalInvested}</div>
      </div>

      <div className="metric-card" onClick={()=> scrollToView('finance-section')}>
        <div className="metric-label">Current Value</div>
        <div className="metric-value">₹{totalCurrentValue}</div>
      </div>

      <div className="metric-card" onClick={()=> scrollToView('finance-section')}>
        <div className="metric-label">Monthly SIP</div>
        <div className="metric-value">₹{totalMonthlySip}</div>
      </div>

      <div className="metric-card highlight-card" onClick={()=> scrollToView('todo-section')}>
        <div className="metric-label">Pending Today</div>
        <div className="metric-value">{totalTodos}</div>
      </div>
    </div>
  );
}