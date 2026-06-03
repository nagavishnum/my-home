'use client';


import './dashboard.css';
import ExpensesSection from './sections/ExpensesSection';
import FinanceSection from './sections/FinanceSection';
import GoalsSection from './sections/GoalsSection';
import MetricsSection from './sections/Metrics';
import TodosSection from './sections/TodosSection';
import { useDashboardData } from './useDashboardData';



export default function Dashboard() {
  const data = useDashboardData();

  return (
    <div className="dashboard-wrapper">
    

      <div>
        <div className="dashboard">
          <MetricsSection {...data} />
          <ExpensesSection {...data} />
          <FinanceSection {...data} />
          <TodosSection {...data} />
          <GoalsSection />
        </div>
      </div>
    </div>
  );
}