"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { api } from "@/lib/api";

import { DailyTodo } from "@/lib/types";

import Loader from "../common/Loader";

import { DailyTodosForm } from "../forms/DailyTodosForm";

import { useGlobalApiLoading, useMediaQuery } from "@/lib/hooks";

import "../../components/dashboard/dashboard.css";
import "./data-list.css";
import "./dailytodos.css";

const initial = {
  t: "",
};

const STORAGE_KEY = "daily-todos-completion";

type TodoCompletionState = Record<string, Record<string, boolean>>;

type WeekDay = {
  key: string;
  label: string;
  shortLabel: string;
  date: Date;
};

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getMonday = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);

  return result;
};

const getWeekDays = (weekStart: Date): WeekDay[] => {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);

    date.setDate(weekStart.getDate() + index);

    return {
      key: getDateKey(date),
      label: date.toLocaleDateString("en-US", {
        weekday: "long",
      }),
      shortLabel: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      date,
    };
  });
};

const formatWeekRange = (weekStart: Date) => {
  const weekEnd = new Date(weekStart);

  weekEnd.setDate(weekStart.getDate() + 6);

  const start = weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const end = weekEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${start} – ${end}`;
};

export default function DailyTodos() {
  const [data, setData] = useState<DailyTodo[]>([]);

  const [form, setForm] = useState(initial);

  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [addDailyTodoModel, setAddDailyTodoModel] = useState(false);

  const [openFilterModel, setOpenFilterModel] = useState(false);

  const [completionState, setCompletionState] = useState<TodoCompletionState>(
    () => {
      if (typeof window === "undefined") {
        return {};
      }

      try {
        const stored = localStorage.getItem(STORAGE_KEY);

        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    },
  );

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));

  const isApiLoading = useGlobalApiLoading();

  const isMobile = useMediaQuery("(max-width:768px)");

  /*
   * Load localStorage completion data.
   * This does not affect the existing API logic.
   */

  const load = useCallback(async () => {
    try {
      setError(null);

      const res = await api.get<DailyTodo[]>("/todos/dailytodo?limit=200");

      setData(res.data);

      setError(null);
    } catch {
      setError("Failed to load daily todos");
    }
  }, []);

  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;

    mounted.current = true;

    load();
  }, [load]);

  const submit = async () => {
    setError(null);

    if (!form.t.trim()) {
      alert("Please fill task");
      return;
    }

    try {
      const body = {
        t: form.t.trim(),
      };

      let response;

      if (editingId) {
        response = await api.put(`todos/dailytodo/${editingId}`, body);
      } else {
        response = await api.post("todos/dailytodo", body);
      }

      if (response.status >= 200 && response.status < 300) {
        const latest = await api.get<DailyTodo[]>("/todos/dailytodo?limit=200");

        setData(latest.data);

        setEditingId(null);
        setForm(initial);
        setAddDailyTodoModel(false);
      }
    } catch {
      setError("Failed to save daily todo");
    }
  };

  const remove = async (id: string) => {
    try {
      setError(null);

      const response = await api.delete(`/todos/dailytodo/${id}`);

      if (response.status >= 200 && response.status < 300) {
        const latest = await api.get<DailyTodo[]>("/todos/dailytodo?limit=200");

        setData(latest.data);

        /*
         * Remove local completion history
         * for the deleted todo.
         */
        setCompletionState((previous) => {
          const next = {
            ...previous,
          };

          delete next[id];

          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {
            // Ignore localStorage errors.
          }

          return next;
        });
      }
    } catch {
      setError("Failed to delete daily todo");
    }
  };

  const handleEditClick = (item: DailyTodo) => {
    setEditingId(item._id);

    setAddDailyTodoModel(true);

    setForm({
      t: item.t ?? "",
    });
  };

  const handleFormModelClose = () => {
    setForm(initial);

    setEditingId(null);

    setAddDailyTodoModel(false);
  };

  const onCancelEdit = () => {
    setEditingId(null);

    setForm(initial);

    setAddDailyTodoModel(false);
  };

  /*
   * Current week's seven days.
   */
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  /*
   * Checkbox handler.
   *
   * Only this interaction updates localStorage.
   */
  const handleToggle = (todoId: string, dateKey: string) => {
    setCompletionState((previous) => {
      const currentTodo = previous[todoId] ?? {};

      const nextValue = !currentTodo[dateKey];

      const nextState = {
        ...previous,
        [todoId]: {
          ...currentTodo,
          [dateKey]: nextValue,
        },
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      } catch {
        // Ignore localStorage errors.
      }

      return nextState;
    });
  };

  /*
   * Daily completion statistics.
   *
   * Total = number of tasks received from API.
   * Done = number of checked tasks for that date.
   */
  const dailyProgress = useMemo(() => {
    return weekDays.map((day) => {
      const total = data.length;

      const done = data.filter(
        (todo) => completionState[todo._id]?.[day.key] === true,
      ).length;

      const percentage = total === 0 ? 0 : Math.round((done / total) * 100);

      return {
        ...day,
        total,
        done,
        percentage,
      };
    });
  }, [data, completionState, weekDays]);

  /*
   * Weekly percentage.
   *
   * Total possible completions:
   * todos × 7 days.
   */
  const weeklyStats = useMemo(() => {
    const totalPossible = data.length * 7;

    const totalDone = dailyProgress.reduce((sum, day) => sum + day.done, 0);

    const percentage =
      totalPossible === 0 ? 0 : Math.round((totalDone / totalPossible) * 100);

    return {
      totalPossible,
      totalDone,
      percentage,
    };
  }, [data.length, dailyProgress]);

  /*
   * Data used by Recharts.
   */
  const chartData = useMemo(
    () =>
      dailyProgress.map((day) => ({
        day: day.shortLabel,
        completed: day.done,
        total: day.total,
        percentage: day.percentage,
      })),
    [dailyProgress],
  );

  const goToPreviousWeek = () => {
    setWeekStart((previous) => {
      const next = new Date(previous);

      next.setDate(next.getDate() - 7);

      return next;
    });
  };

  const goToNextWeek = () => {
    setWeekStart((previous) => {
      const next = new Date(previous);

      next.setDate(next.getDate() + 7);

      return next;
    });
  };

  const goToCurrentWeek = () => {
    setWeekStart(getMonday(new Date()));
  };

  if (isApiLoading) {
    return <Loader />;
  }

  return (
    <div className="daily-todos-page">
      {error && <p className="error">{error}</p>}

      {/* Existing mobile add button */}
      {isMobile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginTop: 16,
          }}
        >
          <button
            className="btn-add"
            onClick={() => setAddDailyTodoModel(true)}
          >
            Add Daily Todo
          </button>
        </div>
      )}

      {/* Existing mobile filter modal */}
      {openFilterModel && isMobile && (
        <div
          className="modal-overlay"
          onClick={() => setOpenFilterModel(false)}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Existing mobile form modal */}
      {addDailyTodoModel && isMobile && (
        <div className="modal-overlay" onClick={handleFormModelClose}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <DailyTodosForm
              form={form}
              setForm={setForm}
              submit={submit}
              editingId={editingId}
              onCancelEdit={onCancelEdit}
            />
          </div>
        </div>
      )}

      {/* Existing desktop form - untouched */}
      {!isMobile && (
        <DailyTodosForm
          form={form}
          setForm={setForm}
          submit={submit}
          editingId={editingId}
          onCancelEdit={onCancelEdit}
        />
      )}

      {/* Weekly task grid */}
      <div className="common-list-card">
        {/* Rows */}
        {data.map((todo) => (
          <div
            key={todo._id}
            style={{
              display: "contents",
            }}
          >
            <div className="daily-todo-grid-task" title={todo.t ?? ""}>
              <span className="daily-todo-grid-task-name">{todo.t ?? "-"}</span>

              <div className="common-list-actions">
                <button
                  type="button"
                  className="common-list-action edit"
                  onClick={() => handleEditClick(todo)}
                  aria-label={`Edit ${todo.t ?? "task"}`}
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>

                <button
                  type="button"
                  className="common-list-action delete"
                  onClick={() => remove(todo._id)}
                  aria-label={`Delete ${todo.t ?? "task"}`}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
