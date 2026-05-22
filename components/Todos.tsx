"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Todo, PaginatedResponse } from "@/lib/types";
import Goals from "./Goals";
import { today } from "@/lib/helpers";
import TableFilters, {
  applyFilters,
  emptyFilters,
  FilterValues,
} from "./TableFilters";
import Loader from "./Loader";
import { TodosForm } from "./forms/TodosForm";
import { useMediaQuery } from "@/lib/hooks";
import TablePlusFiltersLayout from "./TablePlusFilters";
import { Column, CommonTable } from "./CommonTable";

const initial = { t: "", da: today(), p: "medium" };
export const todoColumns: Column<Todo>[] = [
  {
    key: "t",
    label: "Task",
  },
  {
    key: "da",
    label: "Date",
    render: (row) =>
      new Date(row.da).toLocaleDateString(),
  },
  {
    key: "p",
    label: "Priority",
    render: (row) => row.p,
  },
];
export default function Todos() {
  const [activeTab, setActiveTab] = useState<"todo" | "goal">("todo");
  const [data, setData] = useState<Todo[]>([]);
  const [form, setForm] = useState(initial);
  const [filters, setFilters] = useState<FilterValues>({ ...emptyFilters });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [addTodoModel, setAddTodoModel] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    api
      .get<PaginatedResponse<Todo>>("/todos?limit=200")
      .then((t) => {
        setData(t.data.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load todos");
        setLoading(false);
      });
  }, []);

  const submit = async () => {
    if (!form.t.trim() || !form.da || !form.p) {
      alert("Please fill all fields");
      return;
    }

    try {
      const payload = { t: form.t.trim(), da: form.da, p: form.p };

      if (editingId) {
        const res = await api.put(`/todos/${editingId}`, payload);
        setData((p) => p.map((i) => (i._id === editingId ? res.data : i)));
        setEditingId(null);
        setAddTodoModel(false);
      } else {
        const res = await api.post("/todos", payload);
        setData((p) => [res.data, ...p]);
        setAddTodoModel(false);
      }

      setForm(initial);
    } catch {
      setError("Failed to save todo");
    }
  };

  const remove = async (id: string) => {
    await api.delete(`/todos/${id}`);
    setData((p) => p.filter((i) => i._id !== id));
  };

  const filtered = applyFilters(data, filters, "da");
  const handleFormModelClose = () => {
    setForm(initial);
    setAddTodoModel(false);
  };

const handleEditClick = (i: Todo) => {   
   setEditingId(i._id);
    setAddTodoModel(true);
    setForm({
      t: i.t,
      da: i.da ? new Date(i.da).toISOString().split("T")[0] : today(),
      p: i.p,
    });
  };
  if (loading) return <Loader />;

  return (
    <div className="page">
      {/* TABS */}
      <div className="tabs">
        <button
          className={activeTab === "todo" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("todo")}
        >
          Todos
        </button>
        <button
          className={activeTab === "goal" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("goal")}
        >
          Goals
        </button>
      </div>

      {activeTab === "goal" ? (
        <Goals />
      ) : (
        <>
          {error && <p className="error">{error}</p>}
          {isMobile && (
            <button
              className="btn-primary"
              onClick={() => setAddTodoModel(true)}
            >
              Add Todo
            </button>
          )}
          {addTodoModel && isMobile && (
            <div className="modal-overlay" onClick={handleFormModelClose}>
              <div
                className="modal-container"
                onClick={(e) => e.stopPropagation()}
              >
                {/* HEADER */}
                <div className="modal-header">
                  <h3>{editingId ? "Edit Todo" : "Add Todo"}</h3>

                  <button
                    className="btn-secondary"
                    onClick={handleFormModelClose}
                  >
                    Close
                  </button>
                </div>

                {/* BODY */}
                <TodosForm
                  form={form}
                  setForm={setForm}
                  submit={submit}
                  editingId={editingId}
                />
              </div>
            </div>
          )}
          {!isMobile && (
            <TodosForm
              form={form}
              setForm={setForm}
              submit={submit}
              editingId={editingId}
            />
          )}

<TablePlusFiltersLayout
  isMobile={isMobile}
  filtersPanel={
    <TableFilters
      config={{
        showDateRange: true,
        month: true,
        year: true,
      }}
      filters={filters}
      onChange={setFilters}
    />
  }
  tablePanel={
    <CommonTable
      data={filtered}
      columns={todoColumns}
      onDeleteClick={remove}
      onEditClick={handleEditClick}
    />
  }
/>
        </>
      )}
    </div>
  );
}
