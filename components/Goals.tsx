'use client';

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

import { api } from '@/lib/api';

import {
  Goal,
  Category,
  PaginatedResponse,
} from '@/lib/types';

import Categories from './Categories';


import Loader from './Loader';

import { today } from '@/lib/helpers';
import TableFilters, {
  applyFilters,
  emptyFilters,
  FilterValues,
} from './TableFilters';
import { GoalsForm } from './forms/GoalsForm';
import { useMediaQuery } from '@/lib/hooks';
import TablePlusFiltersLayout from './TablePlusFilters';
import { Column, CommonTable } from './CommonTable';
const initial = {
  t: '',
  d: '',
  c: '',
  td: today(),
  p: 'medium',
  s: 'pending',
  tv: '',
  cv: '',
};
export const goalsColumns: Column<Goal>[] = [
  {
    key: "t",
    label: "Goal",
    render: (row) => row.t ?? "-",
  },
  {
    key: "c",
    label: "Category",
    render: (row) => row.c?.n ?? "-",
  },
  {
    key: "p",
    label: "Priority",
    render: (row) => row.p ?? "-",
  },
  {
    key: "s",
    label: "Status",
    render: (row) => row.s ?? "-",

  },
];
export default function Goals() {
  const [data, setData] = useState<
    Goal[]
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
  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [editingId, setEditingId] =
    useState<string | null>(null);
      const [showCategories, setShowCategories] = useState(false);
      const [addGoalModel, setAddGoalModel] = useState(false);
const isMobile = useMediaQuery("(max-width: 768px)");


  const load = useCallback(
    async () => {
      try {
        setLoading(true);

        const [g, c] =
          await Promise.all([
            api.get<
              PaginatedResponse<Goal>
            >('/goal?limit=200'),

            api.get<Category[]>(
              '/categories/goal'
            ),
          ]);

        setData(g.data.data);

        setCats(c.data);

        setError(null);
      } catch {
        setError(
          'Failed to load goals'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;

    mounted.current = true;

    load();
  }, [load]);

  const set = (
    key: string,
    val: string
  ) =>
    setForm((p) => ({
      ...p,
      [key]: val,
    }));

  const selectedCategory =
    cats.find(
      (i) => i._id === form.c
    );

  const isFinance =
    selectedCategory?.n
      ?.toLowerCase()
      .includes('finance') || false;

  const submit = async () => {
    if (
      !form.t.trim() ||
      !form.c ||
      !form.td
    ) {
      alert(
        'Please fill required fields'
      );

      return;
    }

    try {
      const body = {
        t: form.t.trim(),
        d: form.d.trim(),
        c: form.c,
        td: form.td,
        p: form.p,
        s: form.s,
        tv: Number(form.tv) || 0,
        cv: Number(form.cv) || 0,
      };

      if (editingId) {
        const res = await api.put(
          `/goal/${editingId}`,
          body
        );

        setData((p) =>
          p.map((i) =>
            i._id === editingId
              ? res.data
              : i
          )
        );

        setEditingId(null);
        setAddGoalModel(false);
      } else {
        const res = await api.post(
          '/goal',
          body
        );

        setData((p) => [
          res.data,
          ...p,
        ]);
      }

      setForm(initial);
      setAddGoalModel(false);
    } catch {
      setError('Failed to save goal');
    }
  };

  const remove = async (
    id: string
  ) => {
    try {
      await api.delete(`/goal/${id}`);

      setData((p) =>
        p.filter((i) => i._id !== id)
      );
    } catch {
      setError(
        'Failed to delete goal'
      );
    }
  };
const handleFormModelClose = () => {
  setForm(initial);
  setAddGoalModel(false);
}

const handleEditClick = (i: Goal) => {
  setEditingId(i._id);
  setAddGoalModel(true);
  setForm({
    t: i.t ?? '',
    d: i.d ?? '',
    c: i.c?._id ?? '',
    td: i.td
      ? new Date(i.td)
          .toISOString()
          .split('T')[0]
      : today(),
    p: i.p ?? 'medium',
    s: i.s ?? 'pending',
    tv: String(i.tv ?? ''),
    cv: String(i.cv ?? ''),
  });
};
  const filtered = applyFilters(data, filters, 'td');

  if (loading) return <Loader />;

  return (
    <div>
      {error && (
        <p className='error'>
          {error}
        </p>
      )}
            <button
        className="btn-primary"
        onClick={() => setShowCategories(true)}
                style={{marginRight: 8}}

      >
        View Categories
      </button>

{        isMobile &&   
 <button
        className="btn-primary"
        onClick={() => setAddGoalModel(true)}
      >
        Add Goal
      </button>}
      {
        addGoalModel && isMobile && (
          <div
            className="modal-overlay"
            onClick={handleFormModelClose}
          >
            <div
              className="modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="modal-header">
                <h3>{editingId ? 'Edit Goal' : 'Add Goal'}</h3>

                <button
                  className="btn-secondary"
                  onClick={handleFormModelClose}
                >
                  Close
                </button>
              </div>

              {/* BODY */}
              <GoalsForm form={form} set={set} cats={cats} isFinance={isFinance} submit={submit} editingId={editingId} />
            </div>
          </div>
        )
      }
      {/* ✅ MODAL WRAPPER */}
      {showCategories && (
        <div
          className="modal-overlay"
          onClick={() => setShowCategories(false)}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="modal-header">
              <h3>Categories</h3>

              <button
                className="btn-secondary"
                onClick={() => setShowCategories(false)}
              >
                Close
              </button>
            </div>

            {/* BODY */}
            <Categories
              type="goal"
              categories={cats}
              onCategoriesChange={setCats}
              reload={load}
            />
          </div>
        </div>
      )}
{!isMobile &&    <GoalsForm form={form} set={set} cats={cats} isFinance={isFinance} submit={submit} editingId={editingId} />
}
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
      columns={goalsColumns}
      onDeleteClick={remove}
      onEditClick={handleEditClick}
    />
  }
/>
        </div>
    </div>
  );
}