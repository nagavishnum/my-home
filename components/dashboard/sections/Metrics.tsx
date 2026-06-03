'use client';

import Loader from "@/components/Loader";
import { scrollToView } from "@/lib/helpers";
import { useGlobalApiLoading } from "@/lib/hooks";

export default function MetricsSection({
  totalExpenses,
  thisMonthExpenses,
  totalInvested,
  totalCurrentValue,
  totalMonthlySip,
  totalTodos,
  totalTodosToday,
}: any) {
    const isApiLoading =
      useGlobalApiLoading();
    if (isApiLoading) return <Loader />;

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
        <div className="metric-label">Todos</div>
        <div className="metric-value">{totalTodos}</div>
      </div>
          <div className="metric-card highlight-card" onClick={()=> scrollToView('todo-section')}>
        <div className="metric-label">Todos Today</div>
        <div className="metric-value">{totalTodosToday}</div>
      </div>
    </div>
  );
}