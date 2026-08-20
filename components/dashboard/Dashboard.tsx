'use client';

import './dashboard.css';

import ExpensesSection from './sections/ExpensesSection';
import FinanceSection from './sections/FinanceSection';
import { FinancialWarningSystem } from './sections/SmartAlerts';

import { useDashboardData } from './useDashboardData';

export default function Dashboard() {
  const data = useDashboardData();

  return (
    <div className="dashboard-wrapper">
      <div>
        <div className="dashboard">
          <FinancialWarningSystem expensesSummaryData={data.expenseSummaryData} />
          <ExpensesSection {...data} />
          <FinanceSection {...data} />
        </div>
      </div>
    </div>
  );
}