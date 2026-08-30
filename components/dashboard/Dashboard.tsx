"use client";

import "./dashboard.css";

import ExpensesSection from "./sections/ExpensesSection";
import FinanceSection from "./sections/FinanceSection";

import { useDashboardData } from "./useDashboardData";

export default function Dashboard() {
  const data = useDashboardData();

  return (
        <div className="dashboard">
          <ExpensesSection {...data} />

          <FinanceSection {...data} />
        </div>
  );
}
