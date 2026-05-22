'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Goal, PaginatedResponse } from '@/lib/types';
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
import { CHART_COLORS, PRIORITY_COLORS } from '@/lib/constants';
import Loader from '@/components/Loader';

export default function GoalsSection() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<PaginatedResponse<Goal>>('/goal?limit=200')
      .then((g) => {
        setGoals(g?.data?.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const safeGoals = goals ?? [];

  return (
    <div className="dash-section">
      <h3>🎯 Goals</h3>

      {safeGoals.length === 0 ? (
        <p className="no-data">No goals available</p>
      ) : (
        <div className="charts-row">

          {/* CATEGORY */}
          <div className="chart-card">
            <h4>Category-wise Goals</h4>

            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={Object.entries(
                    safeGoals.reduce((acc: Record<string, number>, g) => {
                      const key = g.c?.n || 'Uncategorized';
                      acc[key] = (acc[key] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([name, value]) => ({ name, value }))}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {safeGoals.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* PRIORITY */}
          <div className="chart-card">
            <h4>Priority-wise Goals</h4>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={Object.entries(
                  safeGoals.reduce((acc: Record<string, number>, g) => {
                    const key = g.p || 'medium';
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([name, value]) => ({
                  name: name.charAt(0).toUpperCase() + name.slice(1),
                  value,
                }))}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {Object.keys(PRIORITY_COLORS).map((k, i) => (
                    <Cell key={i} fill={PRIORITY_COLORS[k] || CHART_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* STATUS */}
          <div className="chart-card">
            <h4>Status-wise Goals</h4>

            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={Object.entries(
                    safeGoals.reduce((acc: Record<string, number>, g) => {
                      const key = g.s || 'pending';
                      acc[key] = (acc[key] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([name, value]) => ({ name, value }))}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {safeGoals.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}
    </div>
  );
}