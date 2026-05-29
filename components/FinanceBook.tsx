'use client';

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

import { api } from '@/lib/api';

import {
  Finance,
  Category,
  PaginatedResponse,
} from '@/lib/types';

import { today } from '@/lib/helpers';

import TableFilters, {
  applyFilters,
  emptyFilters,
  FilterValues,
} from './TableFilters';

import Loader from './Loader';
import { FinanceForm } from './forms/FinanceForm';
import { useGlobalApiLoading, useMediaQuery } from '@/lib/hooks';
import TablePlusFiltersLayout from './TablePlusFilters';
import { Column, CommonTable } from './CommonTable';
import { ListFilter, X } from 'lucide-react';
import CategoriesModal from './CategoriesModel';

const initial = {
  n: '',
  a: '', // total invested

  sv: '', // monthly sip

  c: '',

  ty: 'Monthly',

  md: today(),

  lp: '',

  rt: '',

  cv: '',

  no: '',
};
export const financeColumns: Column<Finance>[] = [
  {
    key: "n",
    label: "Name",
  },
    {
    key: "c",
    label: "Category",
    render: (row) => row.c?.n ?? "-",
  },
  {
    key: "a",
    label: "Total Invested",
    render: (row) => `₹${Number(row.a || 0).toLocaleString()}`,
  },
    {
    key: "cv",
    label: "Current Value",
    render: (row) => `₹${Number(row.cv || row.a || 0).toLocaleString()}`,
  },
    {
    key: "ty",
    label: "Type",
  },
  {
    key: "sv",
    label: "Monthly SIP",
    render: (row) =>
      row.ty === "Monthly"
        ? `₹${Number(row.sv || 0).toLocaleString()}`
        : "-",
  },



  {
    key: "rt",
    label: "Returns",
    render: (row) => (row.rt ? `${row.rt}%` : "-"),
  },
];
export default function FinanceBook() {
  const [data, setData] = useState<
    Finance[]
  >([]);

  const [cats, setCats] = useState<
    Category[]
  >([]);

  const [form, setForm] =
    useState(initial);

  const [filters, setFilters] =
    useState<FilterValues>({
      ...emptyFilters,
    });


  const [error, setError] = useState<
    string | null
  >(null);

  const [editingId, setEditingId] =
    useState<string | null>(null);
    const [showCategories, setShowCategories] = useState(false);

    const [addFinanceModel, setAddFinanceModel] = useState(false);
      const [openFilterModel, setOpenFilterModel] = useState(false);

    const isApiLoading = useGlobalApiLoading();

  const isMobile = useMediaQuery("(max-width: 768px)");
    
  const load = useCallback(async () => {
    try {

      const [f, c] = await Promise.all([
        api.get<
          PaginatedResponse<Finance>
        >('/finance?limit=200'),

        api.get<Category[]>(
          '/categories/finance'
        ),
      ]);

      setData(f.data.data);

      setCats(c.data);

      setError(null);
    } catch {
      setError(
        'Failed to load finance data'
      );
    } 
  }, []);

  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;

    mounted.current = true;

    load();
  }, [load]);

  const submit = async () => {
    if (
      !form.n.trim() ||
      !form.a ||
      !form.c ||
      !form.ty ||
      !form.md
    ) {
      alert(
        'Please fill required fields'
      );

      return;
    }

    try {
const payload = {
  n: form.n.trim(),

  a: Number(form.a),

  sv:
    form.ty === 'Monthly'
      ? Number(form.sv) || 0
      : 0,

  c: form.c,

  ty: form.ty,

  md: form.md,

  lp: Number(form.lp) || 0,

  rt: Number(form.rt) || 0,

  cv:
    Number(form.cv) ||
    Number(form.a),

  no: form.no.trim(),
};

      if (editingId) {
        const res = await api.put(`/finance/${editingId}`, payload)

        setData((p) =>
          p.map((i) =>
            i._id === editingId
              ? res.data
              : i
          )
        );

        setEditingId(null);
            setAddFinanceModel(false);

      } else {
        const res = await api.post(
          '/finance',
          payload
        );

        setData((p) => [
          res.data,
          ...p,
        ]);
      }

      setForm(initial);
                  setAddFinanceModel(false);

    } catch {
      setError(
        'Failed to save finance item'
      );
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/finance/${id}`);

      setData((p) =>
        p.filter((i) => i._id !== id)
      );
    } catch {
      setError(
        'Failed to delete finance item'
      );
    }
  };

  const set = (
    key: string,
    val: string
  ) =>
    setForm((f) => ({
      ...f,
      [key]: val,
    }));

  const filtered = applyFilters(
    data,
    filters,
    'md'
  );
  const handleFormModelClose = () => {
    setForm(initial);
    setAddFinanceModel(false);
  };

  const handleEditClick = (row: Finance) => {
    setForm({
      n: row.n,
      a: String(row.a),
      sv: String(row.sv),
      c: row.c ? (typeof row.c === "string" ? row.c : (row.c as any)._id ?? "") : "",
      ty: row.ty,
      md: row.md ? row.md.slice(0, 10) : "",
      lp: String(row.lp),
      rt: String(row.rt),
      cv: String(row.cv),
      no: row.no ?? "",
    });

    setEditingId(row._id);
    setAddFinanceModel(true);
  }

  if (isApiLoading) return <Loader />;

  return (
    <div>
      {error && (
        <p className='error'>{error}</p>
      )}
            <button
        className="btn-primary"
        onClick={() => setShowCategories(true)}
        style={{marginRight: 8}}
        disabled={isApiLoading}
      >
        View Categories
      </button>
{showCategories && <CategoriesModal type="finance" categories={cats} onCategoriesChange={setCats} reload={load} onClose={() => setShowCategories(false)} />}
      {openFilterModel && isMobile && (
        <div
          className="modal-overlay"
          onClick={() => setOpenFilterModel(!openFilterModel)}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
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
        categories: cats,
        types:["Monthly", "OneTime"],
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
                    className="btn-primary"
                    onClick={() => setAddFinanceModel(true)}
                    disabled={isApiLoading}
                  >
                    Add Finance
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
                {addFinanceModel && isMobile && (
                  <div className="modal-overlay" onClick={handleFormModelClose}>
                    <div
                      className="modal-container"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* HEADER */}
                      <div className="modal-header">
                        <h3>{editingId ? "Edit Finance" : "Add Finance"}</h3>
      
                        <button
                          className="btn-danger"
                          onClick={handleFormModelClose}
                          disabled={isApiLoading}
                        >
            <X/>
                        </button>
                      </div>
      
<FinanceForm form={form} setForm={setForm} submit={submit} cats={cats} editingId={editingId} setEditingId={setEditingId} set={set} initial={initial} />
                    </div>
                  </div>
                )}
{!isMobile && <FinanceForm form={form} setForm={setForm} submit={submit} cats={cats} editingId={editingId} setEditingId={setEditingId} set={set} initial={initial} />}
        <div className="table-wrapper">
<TablePlusFiltersLayout
  isMobile={isMobile}
  filtersPanel={            isMobile ? null : (

    <TableFilters
      config={{
        categories: cats,
        types:["Monthly", "OneTime"],
      }}
      filters={filters}
      onChange={setFilters}
    />            )

  }
  tablePanel={
    <CommonTable
      data={filtered}
      columns={financeColumns}
      onDeleteClick={remove}
      onEditClick={handleEditClick}
    />
  }
/>
        </div>
    </div>
  );
}