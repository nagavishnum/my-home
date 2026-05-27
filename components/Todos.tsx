"use client";

import { useEffect, useRef, useState } from "react";

import { api } from "@/lib/api";

import {
  Todo,
  PaginatedResponse,
} from "@/lib/types";

import Goals from "./Goals";

import { today } from "@/lib/helpers";

import TableFilters, {
  applyFilters,
  emptyFilters,
  FilterValues,
} from "./TableFilters";

import Loader from "./Loader";

import { TodosForm } from "./forms/TodosForm";

import {
  useGlobalApiLoading,
  useMediaQuery,
} from "@/lib/hooks";

import TablePlusFiltersLayout from "./TablePlusFilters";

import {
  Column,
  CommonTable,
} from "./CommonTable";

import { ListFilter, X } from "lucide-react";

const initial = {
  t: "",
  da: today(),
  p: "medium",
};

export const todoColumns: Column<Todo>[] =
  [
    {
      key: "t",
      label: "Task",
    },
        {
      key: "p",
      label: "Priority",
      render: (row) => row.p,
    },
    {
      key: "da",
      label: "Date",
      render: (row) =>
        new Date(
          row.da
        ).toLocaleDateString(),
    },

  ];

export default function Todos() {
  const [activeTab, setActiveTab] =
    useState<"todo" | "goal">(
      "todo"
    );

  const [data, setData] = useState<
    Todo[]
  >([]);

  const [form, setForm] =
    useState(initial);

  const [filters, setFilters] =
    useState<FilterValues>({
      ...emptyFilters,
    });

  const [error, setError] =
    useState<string | null>(null);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [addTodoModel, setAddTodoModel] =
    useState(false);

  const [pageLoading, setPageLoading] =
    useState(true);
          const [openFilterModel, setOpenFilterModel] = useState(false);


  const isApiLoading =
    useGlobalApiLoading();

  const isMobile = useMediaQuery(
    "(max-width: 768px)"
  );

  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;

    mounted.current = true;

    const loadTodos = async () => {
      try {
        setPageLoading(true);

        const t =
          await api.get<
            PaginatedResponse<Todo>
          >("/todos?limit=200");

        setData(t.data.data);

        setError(null);
      } catch {
        setError(
          "Failed to load todos"
        );
      } finally {
        setPageLoading(false);
      }
    };

    loadTodos();
  }, []);
useEffect(() => {
  if (!('Notification' in window)) {
    return;
  }

  Notification.requestPermission();

  const interval = setInterval(() => {
    const todayTodos = data.filter(
      (todo) => {
        const todoDate =
          new Date(todo.da);

        const now = new Date();

        return (
          todoDate.toDateString() ===
          now.toDateString()
        );
      }
    );

    if (
      todayTodos.length > 0 &&
      Notification.permission ===
        'granted'
    ) {
      new Notification(
        'Pending Todos',
        {
          body: `You have ${todayTodos.length} pending todos`,
        }
      );
    }
  }, 60 * 60 * 1000); // every 1 hour

  return () =>
    clearInterval(interval);
}, [data]);
  const submit = async () => {
    if (
      !form.t.trim() ||
      !form.da ||
      !form.p
    ) {
      alert(
        "Please fill all fields"
      );

      return;
    }

    try {
      const payload = {
        t: form.t.trim(),
        da: form.da,
        p: form.p,
      };

      if (editingId) {
        const res = await api.put(
          `/todos/${editingId}`,
          payload
        );

        setData((p) =>
          p.map((i) =>
            i._id === editingId
              ? res.data
              : i
          )
        );

        setEditingId(null);

        setAddTodoModel(false);
      } else {
        const res = await api.post(
          "/todos",
          payload
        );

        setData((p) => [
          res.data,
          ...p,
        ]);

        setAddTodoModel(false);
      }

      setForm(initial);
    } catch {
      setError(
        "Failed to save todo"
      );
    }
  };

  const remove = async (
    id: string
  ) => {
    try {
      await api.delete(
        `/todos/${id}`
      );

      setData((p) =>
        p.filter(
          (i) => i._id !== id
        )
      );
    } catch {
      setError(
        "Failed to delete todo"
      );
    }
  };

  const filtered = applyFilters(
    data,
    filters,
    "da"
  );

  const handleFormModelClose =
    () => {
      setForm(initial);

      setEditingId(null);

      setAddTodoModel(false);
    };

  const handleEditClick = (
    i: Todo
  ) => {
    setEditingId(i._id);

    setAddTodoModel(true);

    setForm({
      t: i.t,
      da: i.da
        ? new Date(i.da)
            .toISOString()
            .split("T")[0]
        : today(),
      p: i.p,
    });
  };

  if (pageLoading) {
    return <Loader />;
  }

  return (
    <div
      className={
        isApiLoading
          ? "disabled-section"
          : ""
      }
    >
      {/* TABS */}
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
      </div>

      {activeTab === "goal" ? (
        <Goals />
      ) : (
        <>
          {error && (
            <p className="error">
              {error}
            </p>
          )}
      {openFilterModel && isMobile && (
        <div
          className="modal-overlay"
          onClick={() => setOpenFilterModel(!openFilterModel)}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Filter Todo</h3>

              <button
                className="btn-danger"
                onClick={() => setOpenFilterModel(!openFilterModel)}
                disabled={isApiLoading}
              >
                <X />
              </button>
            </div>
    <TableFilters
                    config={{
                  showDateRange: true,
                  month: true,
                  year: true,
                }}
                filters={filters}
                    close={() => setOpenFilterModel(false)}
      onChange={setFilters}
    />
          </div>
        </div>
      )}
          {isMobile && (
                                      <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 16,
          }}
        >
            <button
              className="btn-primary"
              onClick={() =>
                setAddTodoModel(true)
              }
              disabled={isApiLoading}
            >
              Add Todo
            </button>
                                        <ListFilter onClick={() => setOpenFilterModel(!openFilterModel)} />
          {Object.values(filters).some((v) => v !== "") && (
            <button
              className="btn-secondary"
              onClick={() => setFilters({ ...emptyFilters })}
              disabled={isApiLoading}
            >
              Clear Filters
            </button>
          )}
                  </div>
                )}

          {addTodoModel &&
            isMobile && (
              <div
                className="modal-overlay"
                onClick={
                  handleFormModelClose
                }
              >
                <div
                  className="modal-container"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  <div className="modal-header">
                    <h3>
                      {editingId
                        ? "Edit Todo"
                        : "Add Todo"}
                    </h3>

                    <button
                      className="btn-danger"
                      onClick={
                        handleFormModelClose
                      }
                      disabled={
                        isApiLoading
                      }
                    >
                      <X />
                    </button>
                  </div>

                  <TodosForm
                    form={form}
                    setForm={setForm}
                    submit={submit}
                    editingId={
                      editingId
                    }
                    setEditingId={setEditingId}
                    initial={initial}
                  />
                </div>
              </div>
            )}

          {!isMobile && (
            <TodosForm
              form={form}
              setForm={setForm}
              submit={submit}
              editingId={
                editingId
              }
              setEditingId={setEditingId}
              initial={initial}
            />
          )}

          <TablePlusFiltersLayout
            isMobile={isMobile}
            filtersPanel={            isMobile ? null : (

              <TableFilters
                config={{
                  showDateRange: true,
                  month: true,
                  year: true,
                }}
                filters={filters}
                onChange={setFilters}
              />)
            }
            tablePanel={
              <CommonTable
                data={filtered}
                columns={
                  todoColumns
                }
                onDeleteClick={
                  remove
                }
                onEditClick={
                  handleEditClick
                }
              />
            }
          />
        </>
      )}
    </div>
  );
}