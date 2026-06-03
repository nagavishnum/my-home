'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Goal, PaginatedResponse } from '@/lib/types';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CHART_COLORS, PRIORITY_COLORS } from '@/lib/constants';

export default function GoalsSection() {
  const [goals, setGoals] = useState<Goal[]>([]);
    const [windowWidth,
    setWindowWidth] =
    useState(1200);

  useEffect(() => {
    api
      .get<PaginatedResponse<Goal>>('/goal?limit=200')
      .then((g) => {
        setGoals(g?.data?.data ?? []);
      })
  }, []);
  useEffect(() => {

    const updateWidth = () => {
      setWindowWidth(
        window.innerWidth
      );
    };

    updateWidth();

    window.addEventListener(
      'resize',
      updateWidth
    );

    return () => {

      window.removeEventListener(
        'resize',
        updateWidth
      );
    };

  }, []);


  const safeGoals = goals ?? [];

  const isMobile =
    windowWidth < 740;

  const isTablet =
    windowWidth >= 640 &&
    windowWidth < 1024;
  const legendFontSize =
    isMobile
      ? 10
      : isTablet
      ? 12
      : 14
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

            <ResponsiveContainer width="100%" height={300}>
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
                        <Legend
                                    wrapperStyle={{
                                      fontSize:
                                        legendFontSize,
                
                                      paddingTop: 20,
                                    }}
                
                                    formatter={(value) => (
                
                                      <span
                                        style={{
                                          fontSize:
                                            legendFontSize,
                
                                          wordBreak:
                                            'break-word',
                                        }}
                                      >
                                        {value}
                                      </span>
                                    )}
                                  />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* PRIORITY */}
          <div className="chart-card">
            <h4>Priority-wise Goals</h4>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
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
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {Object.keys(PRIORITY_COLORS).map((k, i) => (
                    <Cell key={i} fill={PRIORITY_COLORS[k] || CHART_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                                  <Legend
                                    wrapperStyle={{
                                      fontSize:
                                        legendFontSize,
                
                                      paddingTop: 20,
                                    }}
                
                                    formatter={(value) => (
                
                                      <span
                                        style={{
                                          fontSize:
                                            legendFontSize,
                
                                          wordBreak:
                                            'break-word',
                                        }}
                                      >
                                        {value}
                                      </span>
                                    )}
                                  />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* STATUS */}
          <div className="chart-card">
            <h4>Status-wise Goals</h4>

            <ResponsiveContainer width="100%" height={300}>
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
                        <Legend
                                    wrapperStyle={{
                                      fontSize:
                                        legendFontSize,
                
                                      paddingTop: 20,
                                    }}
                
                                    formatter={(value) => (
                
                                      <span
                                        style={{
                                          fontSize:
                                            legendFontSize,
                
                                          wordBreak:
                                            'break-word',
                                        }}
                                      >
                                        {value}
                                      </span>
                                    )}
                                  />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}
    </div>
  );
}