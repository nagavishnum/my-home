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
      const totalTodos = todoPriority.reduce(
  (sum, item) => sum + item.value,
  0
);
  return (
    <div className="dash-section" id="todo-section">
      <h2 style={{textAlign:"center"}}>✅ TODOS</h2>

<div className="chart-card">

  <h4>Priority Distribution</h4>

  {todoPriority.length ? (

    <div>

      {todoPriority.map((item, index) => {

        const percent =
          totalTodos === 0
            ? 0
            : (
                item.value /
                totalTodos *
                100
              );

        return (

          <div
            key={item.name}
            style={{
              marginBottom: 18,
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginBottom: 6,
                fontWeight: 600,
              }}
            >

              <span>

                {item.name}

              </span>

              <span>

                {item.value} ({percent.toFixed(1)}%)

              </span>

            </div>

            <div
              style={{
                height: 12,
                background: "#eee",
                borderRadius: 20,
                overflow: "hidden",
              }}
            >

              <div
                style={{
                  width: `${percent}%`,
                  height: "100%",
                  background:
                    CHART_COLORS[
                      index %
                      CHART_COLORS.length
                    ],
                }}
              />

            </div>

          </div>

        );

      })}

    </div>
    

  ) : (

    <p className="no-data">

      No todos available

    </p>

  )}

</div>
    </div>
  );
}