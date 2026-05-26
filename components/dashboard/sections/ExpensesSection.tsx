'use client';

import { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { MONTHS, CHART_COLORS } from '@/lib/constants';
import { useGlobalApiLoading } from '@/lib/hooks';

type AppliedExp = {
  month: string;
  year: string;
};

type Props = {
  expenses: any[];
};

const initialAppliedExp: AppliedExp = {
  month: String(new Date().getMonth()),
  year: String(new Date().getFullYear()),
};

export default function ExpensesSection({ expenses }: Props) {
  const [expMonth, setExpMonth] = useState(String(new Date().getMonth()));
  const [expYear, setExpYear] = useState(String(new Date().getFullYear()));

  const [appliedExp, setAppliedExp] = useState<AppliedExp>(initialAppliedExp);
      const isApiLoading = useGlobalApiLoading();
  
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (!e.d) return false;
      const d = new Date(e.d);

      return (
        d.getMonth() === Number(appliedExp.month) &&
        d.getFullYear() === Number(appliedExp.year)
      );
    });
  }, [expenses, appliedExp]);

  const filteredExpTotal = useMemo(() => {
    return filteredExpenses.reduce((s, e) => s + (Number(e.a) || 0), 0);
  }, [filteredExpenses]);

  const catMap: Record<string, number> = {};

  filteredExpenses.forEach((e) => {
    const name = e.c?.n || 'Uncategorized';
    catMap[name] = (catMap[name] || 0) + Number(e.a || 0);
  });

  const expByCat = Object.entries(catMap).map(([name, value]) => ({
    name,
    value,
  }));

  // 🔥 SAFE GUARDS (this fixes your crash permanently)
  const safeMonth =
    appliedExp?.month !== undefined && appliedExp?.month !== null
      ? appliedExp.month
      : String(new Date().getMonth());

  const safeYear =
    appliedExp?.year !== undefined && appliedExp?.year !== null
      ? appliedExp.year
      : String(new Date().getFullYear());

  return (
    <div className="dash-section" id="expenses-section">
      <h3>📊 Expenses</h3>

      <div className="dash-filter-row">
        <select value={expMonth} onChange={(e) => setExpMonth(e.target.value)}>
          {MONTHS.map((m, i) => (
            <option key={m} value={String(i)}>
              {m}
            </option>
          ))}
        </select>

        <select value={expYear} onChange={(e) => setExpYear(e.target.value)}>
          {Array.from({ length: 5 }).map((_, i) => {
            const y = new Date().getFullYear() - i;
            return (
              <option key={y} value={String(y)}>
                {y}
              </option>
            );
          })}
        </select>

        <button
          className="btn-primary"
          onClick={() =>
            setAppliedExp({
              month: expMonth,
              year: expYear,
            })
          }
          disabled={isApiLoading}
        >
          Apply
        </button>
      </div>

      {/* ✅ FIXED LINE (NO CRASH EVER) */}
      <p className="dash-subtitle">
        Spending in {MONTHS[Number(safeMonth)]} {safeYear}:{' '}
        <strong>₹{filteredExpTotal.toLocaleString()}</strong>
      </p>

      <div className="charts-row">
        <div className="chart-card">
          <h4>Category-wise Spending</h4>

          {expByCat.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={expByCat}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {expByCat.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No expenses this period</p>
          )}
        </div>

        <div className="chart-card">
          <h4>Daily Trend</h4>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={filteredExpenses.map((e) => ({
                day: new Date(e.d).getDate(),
                amount: Number(e.a),
              }))}
            >
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
              <Bar dataKey="amount" fill="#e74c3c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}