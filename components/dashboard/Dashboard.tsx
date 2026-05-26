'use client';


import { useGlobalApiLoading } from '@/lib/hooks';
import Loader from '../Loader';
import './dashboard.css';
import ExpensesSection from './sections/ExpensesSection';
import FinanceSection from './sections/FinanceSection';
import GoalsSection from './sections/GoalsSection';
import MetricsSection from './sections/Metrics';
import TodosSection from './sections/TodosSection';
import { useDashboardData } from './useDashboardData';



export default function Dashboard() {
  const data = useDashboardData();
  const isApiLoading = useGlobalApiLoading();

  return (
    <div className="dashboard-wrapper">
      {isApiLoading && <Loader />}

      <div className={isApiLoading ? 'disabled-section' : ''}>
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