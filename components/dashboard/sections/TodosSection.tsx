'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { CHART_COLORS } from '@/lib/constants';

type Props = {
  todos: any[];
};

export default function TodosSection({ todos }: Props) {
      const [windowWidth,
      setWindowWidth] =
      useState(1200);
  // 🔥 ALWAYS SAFE INPUT
  const safeTodos = todos ?? [];

  // PRIORITY DISTRIBUTION (SAFE)
  const todoPriority = useMemo(() => {
    const map: Record<string, number> = {};

    safeTodos.forEach((t) => {
      const key = t?.p || 'medium';
      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [safeTodos]);
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
    <div className="dash-section" id="todo-section">
      <h3>✅ Todos</h3>

      <div className="chart-card">
        <h4>Priority Distribution</h4>

        {/* 🔥 CRITICAL GUARD */}
        {Array.isArray(todoPriority) && todoPriority.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={todoPriority}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {todoPriority.map((_, i) => (
                  <Cell
                    key={i}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
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
        ) : (
          <p className="no-data">No todos available</p>
        )}
      </div>
    </div>
  );
}