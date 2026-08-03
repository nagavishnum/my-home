"use client";

import { useEffect, useState } from "react";





import Goals from "./Goals";


import {
  useGlobalApiLoading,
} from "@/lib/hooks";




import DailyTodos from "./DailyTodos";
import Todos from "./Todos";



export default function TodosTab() {
const [activeTab, setActiveTab] = useState<
  "todo" | "goal" | "dailytodo"
>(() => {
  if (typeof window === "undefined") {
    return "todo";
  }

  return (
    (localStorage.getItem("activeTab") as
      | "todo"
      | "goal"
      | "dailytodo") || "todo"
  );
});
    useEffect(() => {
  localStorage.setItem(
    "activeTab",
    activeTab
  );
}, [activeTab]);

  const isApiLoading =
    useGlobalApiLoading();

  return (
    <div>
      <div className="tabs">
        <button
          className={
            activeTab === "todo"
              ? "tab active-tab"
              : "tab"
          }
          onClick={() =>
            setActiveTab("todo")
          }
          disabled={isApiLoading}
        >
          Todos
        </button>

        <button
          className={
            activeTab === "goal"
              ? "tab active-tab"
              : "tab"
          }
          onClick={() =>
            setActiveTab("goal")
          }
          disabled={isApiLoading}
        >
          Goals
        </button>
                <button
          className={
            activeTab === "dailytodo"
              ? "tab active-tab"
              : "tab"
          }
          onClick={() =>
            setActiveTab("dailytodo")
          }
          disabled={isApiLoading}
        >
          Daily Todos
        </button>
      </div>

      {activeTab === "goal" ? (
        <Goals />
      ) :activeTab === "dailytodo" ? (
      <DailyTodos/>
    ) : (
<Todos/>
      )}
    </div>
  );
}