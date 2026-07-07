'use client';

import Loader from "@/components/Loader";
import { scrollToView } from "@/lib/helpers";
import { useGlobalApiLoading } from "@/lib/hooks";

const currency = (value: number) =>
  `₹${Math.round(value || 0).toLocaleString("en-IN")}`;

const percent = (value: number) =>
  `${(value || 0).toFixed(1)}%`;

const months = (value: number) =>
  `${(value || 0).toFixed(1)} M`;

type Props = {
  financialFreedomScore: number;

  networthValue: number;
  totalAssestsValue: number;
  totalLiabilitiesValue: number;

  investmentsValue: number;
  liquidAssetsValue: number;
  retirementCorpus: number;
  insuranceValue: number;

  debtToAssetRatio: number;
  emergencyMonths: number;

  monthlyCommitments: number;

  totalExpenses: number;
  thisMonthExpenses: number;

  totalTodos: number;
};

export default function MetricsSection({
  financialFreedomScore,

  networthValue,
  totalAssestsValue,
  totalLiabilitiesValue,

  investmentsValue,
  liquidAssetsValue,
  retirementCorpus,
  insuranceValue,

  debtToAssetRatio,
  emergencyMonths,

  monthlyCommitments,

  totalExpenses,
  thisMonthExpenses,

  totalTodos,
}: Props) {
  const isApiLoading = useGlobalApiLoading();

  if (isApiLoading) return <Loader />;

  const metrics = [
    {
      label: "🚀 Freedom Score",
      value: `${financialFreedomScore}/100`,
      section: "finance-section",
    },
    {
      label: "💰 Net Worth",
      value: currency(networthValue),
      section: "finance-section",
    },
    {
      label: "🏦 Total Assets",
      value: currency(totalAssestsValue),
      section: "finance-section",
    },
    {
      label: "📉 Liabilities",
      value: currency(totalLiabilitiesValue),
      section: "finance-section",
    },
    {
      label: "📈 Investments",
      value: currency(investmentsValue),
      section: "finance-section",
    },
    {
      label: "💧 Liquid Assets",
      value: currency(liquidAssetsValue),
      section: "finance-section",
    },
    {
      label: "🏖 Retirement",
      value: currency(retirementCorpus),
      section: "finance-section",
    },
    {
      label: "🛡 Insurance",
      value: currency(insuranceValue),
      section: "finance-section",
    },
    {
      label: "⚖ Debt Ratio",
      value: percent(debtToAssetRatio),
      section: "finance-section",
    },
    {
      label: "🚨 Emergency Fund",
      value: months(emergencyMonths),
      section: "finance-section",
    },
    {
      label: "💳 Monthly Commitments",
      value: currency(monthlyCommitments),
      section: "finance-section",
    },
    {
      label: "📅 Year Expenses",
      value: currency(totalExpenses),
      section: "expenses-section",
    },
    {
      label: "💸 Month Expenses",
      value: currency(thisMonthExpenses),
      section: "expenses-section",
    },
    {
      label: "✅ Todos",
      value: totalTodos,
      section: "todo-section",
    },
  ];

  return (
    <div className="metrics-grid">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={`metric-card ${
            metric.label === "🚀 Freedom Score"
              ? "highlight-card"
              : ""
          }`}
          onClick={() => scrollToView(metric.section)}
        >
          <div className="metric-label">
            {metric.label}
          </div>

          <div className="metric-value">
            {metric.value}
          </div>
        </div>
      ))}
    </div>
  );
}