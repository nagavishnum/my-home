"use client";

import { useEffect, useRef, useState, useCallback } from "react";

import { api } from "@/lib/api";
import { Expense, Category, PaginatedResponse } from "@/lib/types";

import Categories from "./Categories";
import { today } from "@/lib/helpers";

import TableFilters, {
  applyFilters,
  emptyFilters,
  FilterValues,
} from "./TableFilters";

import Loader from "./Loader";
import { ExpensesForm } from "./forms/ExpensesForm";
import { CommonTable } from "./CommonTable";
import TablePlusFiltersLayout from "./TablePlusFilters";

const initial = {
  a: "",
  r: "",
  c: "",
  d: today(),
};
export const expenseColumns = [
  {
    key: "a",
    label: "Amount",
    render: (row) => `₹${Number(row.a || 0).toLocaleString()}`,
  },
  {
    key: "r",
    label: "Reason",
    render: (row) => row.r ?? "-",
  },
  {
    key: "c",
    label: "Category",
    render: (row) => row.c?.n ?? "-",
  },
  {
    key: "d",
    label: "Date",
    render: (row) =>
      new Date(row.d).toLocaleDateString(),
  },
];
export default function Expenses() {
  const [data, setData] = useState<Expense[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState(initial);
  const [filters, setFilters] = useState<FilterValues>({ ...emptyFilters });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [showCategories, setShowCategories] = useState(false);
  const [addExpenseModel, setAddExpenseModel] = useState(false);

  // ✅ MOBILE DETECTION
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const [e, c] = await Promise.all([
        api.get<PaginatedResponse<Expense>>("/expenses?limit=200"),
        api.get<Category[]>("/categories/expense"),
      ]);

      setData(e.data.data);
      setCats(c.data);
      setError(null);
    } catch {
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, []);

  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    load();
  }, [load]);

  const submit = async () => {
    if (!form.a || !form.r.trim() || !form.c || !form.d) {
      alert("Please fill all fields");
      return;
    }

    try {
      const payload = {
        a: Number(form.a),
        r: form.r.trim(),
        c: form.c,
        d: form.d,
      };

      if (editingId) {
        const res = await api.put(`/expenses/${editingId}`, payload);

        setData((p) => p.map((i) => (i._id === editingId ? res.data : i)));

        setEditingId(null);
        setAddExpenseModel(false);
      } else {
        const res = await api.post("/expenses", payload);
        setData((p) => [res.data, ...p]);
        setAddExpenseModel(false);
      }

      setForm(initial);
    } catch {
      setError("Failed to save expense");
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/expenses/${id}`);
      setData((p) => p.filter((i) => i._id !== id));
      setSelected((p) => p.filter((x) => x !== id));
    } catch {
      setError("Failed to delete expense");
    }
  };

  const filtered = applyFilters(data, filters, "d");
  const handleFormModelClose = () => {
    setForm(initial);
    setAddExpenseModel(false);
  };
  const handleEditClick = (row: Expense) => {
    setForm({
      a: String(row.a),
      r: row.r,
      c: row.c ? (typeof row.c === "string" ? row.c : (row.c as any)._id ?? "") : "",
      d: row.d.slice(0, 10),
    });
    setEditingId(row._id);
    setAddExpenseModel(true);
  }
  if (loading) return <Loader />;

  return (
    <div className="page">
      {error && <p className="error">{error}</p>}
      <button
        className="btn-primary"
        onClick={() => setShowCategories(true)}
        style={{ marginRight: 8 }}
      >
        View Categories
      </button>

      {showCategories && (
        <div className="modal-overlay" onClick={() => setShowCategories(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Categories</h3>

              <button
                className="btn-secondary"
                onClick={() => setShowCategories(false)}
              >
                Close
              </button>
            </div>

            <Categories
              type="expense"
              categories={cats}
              onCategoriesChange={setCats}
              reload={load}
            />
          </div>
        </div>
      )}
      {isMobile && (
        <button
          className="btn-primary"
          onClick={() => setAddExpenseModel(true)}
        >
          Add Expense
        </button>
      )}
      {addExpenseModel && isMobile && (
        <div className="modal-overlay" onClick={handleFormModelClose}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {/* HEADER */}
            <div className="modal-header">
              <h3>{editingId ? "Edit Expense" : "Add Expense"}</h3>

              <button className="btn-secondary" onClick={handleFormModelClose}>
                Close
              </button>
            </div>

            <ExpensesForm
              form={form}
              setForm={setForm}
              submit={submit}
              cats={cats}
            />
          </div>
        </div>
      )}
      {!isMobile && (
        <ExpensesForm
          form={form}
          setForm={setForm}
          submit={submit}
          cats={cats}
        />
      )}
        <div className="table-wrapper">

<TablePlusFiltersLayout
  isMobile={isMobile}
  filtersPanel={
    <TableFilters
      config={{
        categories: cats,
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
      columns={expenseColumns}
      onDeleteClick={remove}
      onEditClick={handleEditClick}
    />
  }
/>
        </div>

    </div>
  );
}
