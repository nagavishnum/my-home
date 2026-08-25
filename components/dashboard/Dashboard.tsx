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
          <FinancialWarningSystem
            expensesSummaryData={
              data.expenseSummaryData
            }
          />

          <ExpensesSection
            {...data}
          />

          <FinanceSection
            selectedYear={
              data.selectedYear
            }
            metricMonthName={
              data.metricMonthName
            }
            previousMetricMonthName={
              data.previousMetricMonthName
            }
            networthValue={
              data.networthValue
            }
            previousNetworthValue={
              data.previousNetworthValue
            }
            networthChange={
              data.networthChange
            }
            networthGrowth={
              data.networthGrowth
            }
            totalAssetsValue={
              data.totalAssetsValue
            }
            totalLiabilitiesValue={
              data.totalLiabilitiesValue
            }
            debtToAssetRatio={
              data.debtToAssetRatio
            }
            assetAllocation={
              data.assetAllocation
            }
            investmentsValue={
              data.investmentsValue
            }
            liquidAssetsValue={
              data.liquidAssetsValue
            }
            selectedMonthExpenses={
              data.selectedMonthExpenses
            }
            emergencyMonths={
              data.emergencyMonths
            }
            wealthCreationRate={
              data.wealthCreationRate
            }
            monthlyCapitalDeployment={
              data.monthlyCapitalDeployment
            }
            financialFreedomNumber={
              data.financialFreedomNumber
            }
            financialFreedomProgress={
              data.financialFreedomProgress
            }
            wealthTrend={
              data.wealthTrend
            }
            profitItems={
              data.profitItems
            }
            lossItems={
              data.lossItems
            }
            monthlyCategories={
              data.monthlyCategories
            }
            monthlyCategoryRows={
              data.monthlyCategoryRows
            }
          />
        </div>
      </div>
    </div>
  );
}