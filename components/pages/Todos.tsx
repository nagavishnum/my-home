import { todoColumns, todoMobileColumns } from "@/lib/columns";
import { CommonTable } from "../common/CommonTable";
import { useGlobalApiLoading, useMediaQuery } from "@/lib/hooks";
import { useEffect, useRef, useState } from "react";
import { PaginatedResponse, Todo } from "@/lib/types";
import { api } from "@/lib/api";
import { today } from "@/lib/helpers";
import TableFilters, {
  applyFilters,
  emptyFilters,
  FilterValues,
} from "../common/TableFilters";
import { ListFilter } from "lucide-react";
import { TodosForm } from "../forms/TodosForm";
import TablePlusFiltersLayout from "../common/TablePlusFilters";

const initial = {
  t: "",
  da: today(),
  p: "medium",
};

export default function Todos() {
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Todo[]>([]);

  const [form, setForm] = useState(initial);
  const [openFilterModel, setOpenFilterModel] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    ...emptyFilters,
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const [addTodoModel, setAddTodoModel] = useState(false);
  const mounted = useRef(false);
  const isApiLoading = useGlobalApiLoading();
  useEffect(() => {
    if (mounted.current) return;

    mounted.current = true;

    const loadTodos = async () => {
      try {
        const t = await api.get<PaginatedResponse<Todo>>("/todos?limit=200");

        setData(t.data.data);

        setError(null);
      } catch {
        setError("Failed to load todos");
      }
    };

    loadTodos();
  }, []);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const submit = async () => {
    if (!form.t.trim() || !form.da || !form.p) {
      alert("Please fill all fields");

      return;
    }

    try {
      const payload = {
        t: form.t.trim(),
        da: form.da,
        p: form.p,
      };

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
    try {
      await api.delete(`/todos/${id}`);

      setData((p) => p.filter((i) => i._id !== id));
    } catch {
      setError("Failed to delete todo");
    }
  };

  const filtered = applyFilters(data, filters, "da");

const sortedTodosWrtDate = [...filtered].sort((a, b) => {
  const todayDate = new Date(today());
  todayDate.setHours(0, 0, 0, 0);

  const dateA = new Date(a.da);
  const dateB = new Date(b.da);

  dateA.setHours(0, 0, 0, 0);
  dateB.setHours(0, 0, 0, 0);

  const getPriority = (date: Date) => {
    if (date.getTime() === todayDate.getTime()) {
      return 0; // Today
    }

    if (date < todayDate) {
      return 1; // Past
    }

    return 2; // Future
  };

  const priorityA = getPriority(dateA);
  const priorityB = getPriority(dateB);

  // First: Today → Past → Future
  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }

  // Within past: nearest past first
  if (priorityA === 1) {
    return dateB.getTime() - dateA.getTime();
  }

  // Within future: nearest future first
  if (priorityA === 2) {
    return dateA.getTime() - dateB.getTime();
  }

  return 0;
});

  const handleFormModelClose = () => {
    setForm(initial);

    setEditingId(null);

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
  const onCancelEdit = () => {
    setEditingId(null);
    setForm(initial);
    setAddTodoModel(false);
  };
  return (
    <>
      {error && <p className="error">{error}</p>}
      {openFilterModel && isMobile && (
        <div
          className="modal-overlay"
          onClick={() => setOpenFilterModel(!openFilterModel)}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
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
            justifyContent: "space-between",

            gap: 10,
            marginTop: 16,
          }}
        >
          <button
            className="btn-add"
            onClick={() => setAddTodoModel(true)}
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

      {addTodoModel && isMobile && (
        <div className="modal-overlay" onClick={handleFormModelClose}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? "Edit Todo" : "Add Todo"}</h3>
            </div>

            <TodosForm
              form={form}
              setForm={setForm}
              submit={submit}
              editingId={editingId}
              onCancelEdit={onCancelEdit}
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
          onCancelEdit={onCancelEdit}
        />
      )}

      <TablePlusFiltersLayout
        isMobile={isMobile}
        filtersPanel={
          isMobile ? null : (
            <TableFilters
              config={{
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
            data={sortedTodosWrtDate}
            columns={isMobile ? todoMobileColumns : todoColumns}
            onDeleteClick={remove}
            onEditClick={handleEditClick}
          />
        }
      />
    </>
  );
}
