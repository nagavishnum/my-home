"use client";

import { useEffect, useState } from "react";

import Goals from "./Goals";
import DailyTodos from "./DailyTodos";
import Todos from "./Todos";

export default function TodosTab() {
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    const updateWidth = () => {
      setWindowWidth(window.innerWidth);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const isMobile = windowWidth < 740;

  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      <div>
        <Todos />
      </div>

      <hr
        style={{
          display: isMobile ? "block" : "flex",
        }}
      />

      <div>
        <DailyTodos />
      </div>

      <hr
        style={{
          display: isMobile ? "block" : "flex",
        }}
      />

      <div>
        <Goals />
      </div>
    </div>
  );
}