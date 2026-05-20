'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Expense, Finance, Todo, PaginatedResponse } from '@/lib/types';
import { MONTHS, CURRENT_YEAR, YEARS, PRIORITY_COLORS, CHART_COLORS } from '@/lib/constants';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [finance, setFinance] = useState<Finance[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const [expMonth, setExpMonth] = useState(String(new Date().getMonth()));
  const [expYear, setExpYear] = useState(String(CURRENT_YEAR));
  const [todoDate, setTodoDate] = useState(new Date().toISOString().split('T')[0]);
  const [todoMonth, setTodoMonth] = useState('');
  const [todoYear, setTodoYear] = useState('');

  const [appliedExp, setAppliedExp] = useState({ month: expMonth, year: expYear });
  const [appliedTodo, setAppliedTodo] = useState({ date: todoDate, month: '', year: '' });

  useEffect(() => {
    Promise.all([
      api.get<PaginatedResponse<Expense>>('/expenses?limit=200'),
      api.get<PaginatedResponse<Finance>>('/finance?limit=200'),
      api.get<PaginatedResponse<Todo>>('/todos?limit=200'),
    ]).then(([e, f, t]) => {
      setExpenses(e.data.data);
      setFinance(f.data.data);
      setTodos(t.data.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading...</p>;

  // --- METRICS ---
  const now = new Date();
  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.a) || 0), 0);

  const sipInvested = finance.filter(f => f.ty === 'Monthly').reduce((s, f) => {
    const start = f.md ? new Date(f.md) : now;
    const monthsElapsed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;
    return s + (Number(f.a) || 0) * Math.max(monthsElapsed, 1);
  }, 0);
  const lumpInvested = finance.filter(f => f.ty !== 'Monthly').reduce((s, f) => s + (Number(f.a) || 0), 0);
  const totalInvested = sipInvested + lumpInvested;
  const totalCurrentValue = finance.reduce((s, f) => s + (Number(f.cv) || Number(f.a) || 0), 0);
  const totalTodos = todos.length;
  const todayStr = now.toISOString().split('T')[0];
  const pendingToday = todos.filter(t => !t.s && t.da?.startsWith(todayStr)).length;
  const todayExpenses = expenses.filter(e => e.d?.startsWith(todayStr)).reduce((s, e) => s + (Number(e.a) || 0), 0);
  const thisMonthExpenses = expenses.filter(e => {
    if (!e.d) return false;
    const d = new Date(e.d);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, e) => s + (Number(e.a) || 0), 0);
  const monthlyInvestment = finance.filter(f => f.ty === 'Monthly').reduce((s, f) => s + (Number(f.a) || 0), 0);

  // --- EXPENSES CHARTS ---
  const filteredExpenses = expenses.filter(e => {
    if (!e.d) return false;
    const d = new Date(e.d);
    return d.getMonth() === Number(appliedExp.month) && d.getFullYear() === Number(appliedExp.year);
  });

  const catMap: Record<string, number> = {};
  filteredExpenses.forEach(e => {
    const name = e.c?.n || 'Uncategorized';
    catMap[name] = (catMap[name] || 0) + Number(e.a);
  });
  const expByCat = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  const dayMap: Record<string, number> = {};
  filteredExpenses.forEach(e => {
    const day = new Date(e.d).getDate().toString();
    dayMap[day] = (dayMap[day] || 0) + Number(e.a);
  });
  const expByDay = Object.entries(dayMap)
    .map(([day, amount]) => ({ day: `Day ${day}`, amount }))
    .sort((a, b) => parseInt(a.day.split(' ')[1]) - parseInt(b.day.split(' ')[1]));

  // --- FINANCE CHARTS ---
  const sipTotal = finance.filter(f => f.ty === 'Monthly').reduce((s, f) => s + Number(f.a), 0);
  const lumpTotal = finance.filter(f => f.ty === 'OneTime').reduce((s, f) => s + Number(f.a), 0);
  const sipVsLump = [
    { name: 'SIP / Monthly', value: sipTotal },
    { name: 'Lump Sum', value: lumpTotal },
  ].filter(d => d.value > 0);

  const finCatMap: Record<string, number> = {};
  finance.forEach(f => {
    const name = f.c?.n || 'Other';
    finCatMap[name] = (finCatMap[name] || 0) + Number(f.a);
  });
  const finByCat = Object.entries(finCatMap).map(([name, value]) => ({ name, value }));

  const locked = finance.filter(f => {
    if (!f.lp || !f.md) return false;
    const maturity = new Date(f.md);
    maturity.setFullYear(maturity.getFullYear() + Number(f.lp));
    return maturity > now;
  }).reduce((s, f) => s + Number(f.a), 0);
  const free = totalInvested - locked;
  const lockData = [
    { name: 'Locked', value: locked },
    { name: 'Free', value: free },
  ].filter(d => d.value > 0);

  // --- TODO CHARTS ---
  const filteredTodos = todos.filter(t => {
    if (!t.da) return false;
    const d = new Date(t.da);
    if (appliedTodo.date) return t.da.startsWith(appliedTodo.date);
    if (appliedTodo.month !== '' && d.getMonth() !== Number(appliedTodo.month)) return false;
    if (appliedTodo.year && d.getFullYear() !== Number(appliedTodo.year)) return false;
    return true;
  });

  const priMap: Record<string, number> = {};
  filteredTodos.forEach(t => {
    const p = t.p || 'medium';
    priMap[p] = (priMap[p] || 0) + 1;
  });
  const todoPriority = Object.entries(priMap).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  const priCompletion = ['mandatory', 'high', 'medium', 'low'].map(p => {
    const all = filteredTodos.filter(t => t.p === p);
    const done = all.filter(t => t.s);
    return { name: p.charAt(0).toUpperCase() + p.slice(1), total: all.length, done: done.length, pct: all.length ? Math.round((done.length / all.length) * 100) : 0 };
  }).filter(d => d.total > 0);

  const filteredExpTotal = filteredExpenses.reduce((s, e) => s + (Number(e.a) || 0), 0);

  return (
    <div className="dashboard">
      {/* TOP METRICS */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Expenses</div>
          <div className="metric-value">₹{totalExpenses.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">This Month Expenses</div>
          <div className="metric-value">₹{thisMonthExpenses.toLocaleString()}</div>
        </div>
        <div className="metric-card highlight-card">
          <div className="metric-label">Today Expenses</div>
          <div className="metric-value">₹{todayExpenses.toLocaleString()}</div>
        </div>

        <div className="metrics-divider" />

        <div className="metric-card">
          <div className="metric-label">Total Invested</div>
          <div className="metric-value">₹{totalInvested.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Current Value</div>
          <div className="metric-value">₹{totalCurrentValue.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Monthly SIP</div>
          <div className="metric-value">₹{monthlyInvestment.toLocaleString()}</div>
        </div>

        <div className="metrics-divider" />
        <div className="metric-card highlight-card">
          <div className="metric-label">Pending Today</div>
          <div className="metric-value">{totalTodos}</div>
        </div>
      </div>

      {/* EXPENSES SECTION */}
      <div className="dash-section">
        <h3>📊 Expenses</h3>
        <div className="dash-filter-row">
          <select value={expMonth} onChange={e => setExpMonth(e.target.value)}>
            {MONTHS.map((m, i) => <option key={m} value={String(i)}>{m}</option>)}
          </select>
          <select value={expYear} onChange={e => setExpYear(e.target.value)}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn-primary" onClick={() => setAppliedExp({ month: expMonth, year: expYear })}>Apply</button>
        </div>
        <p className="dash-subtitle">Spending in {MONTHS[Number(appliedExp.month)]} {appliedExp.year}: <strong>₹{filteredExpTotal.toLocaleString()}</strong></p>
        <div className="charts-row">
          <div className="chart-card">
            <h4>Category-wise Spending</h4>
            {expByCat.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={expByCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {expByCat.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="no-data">No expenses this period</p>}
          </div>
          <div className="chart-card">
            <h4>Daily Trend</h4>
            {expByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={expByDay}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="no-data">No expenses this period</p>}
          </div>
        </div>
      </div>

      {/* FINANCE SECTION */}
      <div className="dash-section">
        <h3>📈 Finance Book</h3>
        <div className="charts-row">
          <div className="chart-card">
            <h4>SIP vs Lump Sum</h4>
            {sipVsLump.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={sipVsLump} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {sipVsLump.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="no-data">No finance data</p>}
          </div>
          <div className="chart-card">
            <h4>Category-wise Investment</h4>
            {finByCat.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={finByCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {finByCat.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="no-data">No finance data</p>}
          </div>
          <div className="chart-card">
            <h4>Locked vs Free</h4>
            {lockData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={lockData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    <Cell fill="#ef4444" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="no-data">No finance data</p>}
          </div>
        </div>
      </div>

      {/* TODO SECTION */}
      <div className="dash-section">
        <h3>✅ Todos</h3>
        <div className="dash-filter-row">
          <label>Date</label>
          <input type="date" value={todoDate} onChange={e => { setTodoDate(e.target.value); setTodoMonth(''); setTodoYear(''); }} />
          <label>Month</label>
          <select value={todoMonth} onChange={e => { setTodoMonth(e.target.value); setTodoDate(''); }}>
            <option value="">All</option>
            {MONTHS.map((m, i) => <option key={m} value={String(i)}>{m}</option>)}
          </select>
          <label>Year</label>
          <select value={todoYear} onChange={e => { setTodoYear(e.target.value); setTodoDate(''); }}>
            <option value="">All</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn-primary" onClick={() => setAppliedTodo({ date: todoDate, month: todoMonth, year: todoYear })}>Apply</button>
        </div>
        <div className="charts-row">
          <div className="chart-card">
            <h4>Priority Distribution</h4>
            {todoPriority.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={todoPriority} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                    {todoPriority.map((d, i) => <Cell key={i} fill={PRIORITY_COLORS[d.name.toLowerCase()] || CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="no-data">No todos this period</p>}
          </div>
          <div className="chart-card">
            <h4>Completion by Priority</h4>
            {priCompletion.length > 0 ? (
              <div className="progress-bars">
                {priCompletion.map(p => (
                  <div key={p.name} className="progress-item">
                    <div className="progress-label">
                      <span>{p.name}</span>
                      <span>{p.done}/{p.total} ({p.pct}%)</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${p.pct}%`, background: PRIORITY_COLORS[p.name.toLowerCase()] || '#2563eb' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="no-data">No todos this period</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
