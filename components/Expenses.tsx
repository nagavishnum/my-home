"use client";

import { useEffect, useRef, useState, useCallback } from "react";

import { api } from "@/lib/api";
import { Expense, Category, PaginatedResponse } from "@/lib/types";

import { today } from "@/lib/helpers";

import TableFilters, {
  applyFilters,
  emptyFilters,
  FilterValues,
} from "./TableFilters";

import Loader from "./Loader";
import { ExpensesForm } from "./forms/ExpensesForm";
import { Column, CommonTable } from "./CommonTable";
import TablePlusFiltersLayout from "./TablePlusFilters";
import { useGlobalApiLoading } from "@/lib/hooks";
import { ListFilter, X } from "lucide-react";
import CategoriesModal from "./CategoriesModel";

const initial = {
  a: "",
  c: "",
  d: today(),
};
export const expenseColumns: Column<Expense>[] = [
  {
    key: "a",
    label: "Amount",
    render: (row) => `₹${Number(row.a || 0).toLocaleString()}`,
  },
  {
    key: "c",
    label: "Category",
    render: (row) => row.c?.n ?? "-",
  },
  {
    key: "d",
    label: "Date",
    render: (row) => new Date(row.d).toLocaleDateString(),
  },
];
export default function Expenses() {
  const [data, setData] = useState<Expense[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState(initial);
  const [filters, setFilters] = useState<FilterValues>({ ...emptyFilters });
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [showCategories, setShowCategories] = useState(false);
  const [addExpenseModel, setAddExpenseModel] = useState(false);

  // ✅ MOBILE DETECTION
  const [isMobile, setIsMobile] = useState(false);
  const [openFilterModel, setOpenFilterModel] = useState(false);
  const isApiLoading = useGlobalApiLoading();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const load = useCallback(async () => {
    try {
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
    }
  }, []);

  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    load();
  }, [load]);

  const submit = async () => {
    if (!form.a || !form.c || !form.d) {
      alert("Please fill all fields");
      return;
    }

    try {
      const payload = {
        a: Number(form.a),
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
      c: row.c
        ? typeof row.c === "string"
          ? row.c
          : ((row.c as any)._id ?? "")
        : "",
      d: row.d.slice(0, 10),
    });
    setEditingId(row._id);
    setAddExpenseModel(true);
  };

  const handleCompressExpenses = async () => {
    if (!confirm("Are you sure you want to compress expenses? This action cannot be undone.")) {
      return;
    }

    try {
      await api.post("/expenses/compress");
      await load();
    } catch {
      alert("Failed to compress expenses");
    }
  };
  const onCancelEdit = () => {
    setEditingId(null);
    setForm(initial);
    setAddExpenseModel(false);
  }
  if (isApiLoading) return <Loader />;

  return (
    <div className="page">
      {error && <p className="error">{error}</p>}
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
        className="btn-view"
        onClick={() => setShowCategories(true)}
        style={{ marginRight: 8 }}
        disabled={isApiLoading}
      >
        View Categories
      </button>
                <button
            className="btn-compress"
            onClick={handleCompressExpenses}
            disabled={isApiLoading}
          >
            Compress Expenses
          </button>
</div>
      {showCategories && (
        <CategoriesModal
          type="expense"
          categories={cats}
          onCategoriesChange={setCats}
          reload={load}
          onClose={() => setShowCategories(false)}
        />
      )}
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
            onClick={() => setAddExpenseModel(true)}
            disabled={isApiLoading}
          >
            Add Expense
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
      {addExpenseModel && isMobile && (
        <div className="modal-overlay" onClick={handleFormModelClose}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {/* HEADER */}
            <div className="modal-header">
              <h3>{editingId ? "Edit Expense" : "Add Expense"}</h3>

            </div>

            <ExpensesForm
              form={form}
              setForm={setForm}
              submit={submit}
              cats={cats}
              editingId={editingId}
              onCancelEdit={onCancelEdit}
            />
          </div>
        </div>
      )}
      {openFilterModel && isMobile && (
        <div
          className="modal-overlay"
          onClick={() => setOpenFilterModel(!openFilterModel)}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
     

            <TableFilters
              config={{
                categories: cats,
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
      {!isMobile && (
        <ExpensesForm
          form={form}
          setForm={setForm}
          submit={submit}
          cats={cats}
          editingId={editingId}
          onCancelEdit={onCancelEdit}
        />
      )}
      <div className="table-wrapper">
        <TablePlusFiltersLayout
          isMobile={isMobile}
          filtersPanel={
            isMobile ? null : (
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
            )
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
