'use client';

import './dashboard.css';

import ExpensesSection from './sections/ExpensesSection';
import FinanceSection from './sections/FinanceSection';
import { FinancialWarningSystem } from './sections/SmartAlerts';

import { useDashboardData } from './useDashboardData';

export default function Dashboard() {
  const data =
    useDashboardData();

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

            hasPreviousSnapshot={
              data.hasPreviousSnapshot
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

            investmentValue={
              data.investmentValue
            }

            retirementValue={
              data.retirementValue
            }

            liquidAssetsValue={
              data.liquidAssetsValue
            }

            averagePreviousThreeMonthExpenses={
              data.averagePreviousThreeMonthExpenses
            }

            emergencyMonths={
              data.emergencyMonths
            }

            financialSafetyStatus={
              data.financialSafetyStatus
            }

            insuranceStatus={
              data.insuranceStatus
            }

            wealthTrend={
              data.wealthTrend
            }

            financeScore={
              data.financeScore
            }

            financeHistory={
              data.financeHistory
            }
          />
        </div>
      </div>
    </div>
  );
}