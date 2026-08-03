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

import { getGoalsCategoryIcon, getPriorityIcon, getStatusIcon, today } from '@/lib/helpers';

import {
  useGlobalApiLoading,
  useMediaQuery,
} from '@/lib/hooks';

import "../../components/dashboard/dashboard.css"

import { ListFilter } from 'lucide-react';
import TableFilters, { applyFilters, emptyFilters, FilterValues } from '../common/TableFilters';
import { GoalsForm } from '../forms/GoalsForm';
import CategoriesModal from './CategoriesModel';
import TablePlusFiltersLayout from '../common/TablePlusFilters';
import { Column, CommonTable } from '../common/CommonTable';
import Loader from '../common/Loader';

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
    key: 't',
    label: 'Goal',
    render: (row) => row.t ?? '-',
  },
  {
    key: 'c',
    label: 'Category',
    render: (row) => getGoalsCategoryIcon(row.c?.n ?? '') || '-',
  },
  {
    key: 'p',
    label: 'Priority',
    render: (row) =>     getPriorityIcon(row.p ?? '') || '-',
  },
{
  key: 's',
  label: 'Status',
  render: (row) => getStatusIcon(row?.s?.toLowerCase() ?? '') || '-'  ,
},
  {
    key: 'td',
    label: 'Target Date',
    render: (row) =>
      row.td
        ? new Date(row.td).toLocaleDateString()
        : '-',
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

  const [error, setError] =
    useState<string | null>(null);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [showCategories, setShowCategories] =
    useState(false);

  const [addGoalModel, setAddGoalModel] =
    useState(false);


          const [openFilterModel, setOpenFilterModel] = useState(false);

  const isApiLoading =
    useGlobalApiLoading();

  const isMobile = useMediaQuery(
    '(max-width: 768px)'
  );

  const load = useCallback(

    async () => {
              setError(null);

      try {

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
            setError(null);

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
            setError(null);

    try {
      await api.delete(`/goal/${id}`);

      setData((p) =>
        p.filter(
          (i) => i._id !== id
        )
      );
    } catch {
      setError(
        'Failed to delete goal'
      );
    }
  };

  const handleFormModelClose =
    () => {
      setForm(initial);

      setEditingId(null);

      setAddGoalModel(false);
    };

  const handleEditClick = (
    i: Goal
  ) => {
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

  const filtered = applyFilters(
    data,
    filters,
    'td'
  );
    const sortedTodosWrtDate = [...filtered].sort((a, b) =>
    a.td.localeCompare(b.td),
  );
  const onCancelEdit = () => {
    setEditingId(null);
    setForm(initial);
    setAddGoalModel(false);
  }
  if (isApiLoading) return <Loader />;

  return (
    <div>
      {error && (
        <p className="error">
          {error}
        </p>
      )}

      <button
        className="btn-view"
        onClick={() =>
          setShowCategories(true)
        }
        style={{ marginRight: 8 }}
        disabled={isApiLoading}
      >
        View Categories
      </button>

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
          onClick={() =>
            setAddGoalModel(true)
          }
          disabled={isApiLoading}
        >
          Add Goal
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
      {addGoalModel && isMobile && (
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
                  ? 'Edit Goal'
                  : 'Add Goal'}
              </h3>

  
            </div>

            <GoalsForm
              form={form}
              set={set}
              cats={cats}
              isFinance={
                isFinance
              }
              submit={submit}
              editingId={
                editingId
              }
              onCancelEdit={onCancelEdit}
            />
          </div>
        </div>
      )}

      {showCategories && <CategoriesModal type="goal" categories={cats} onCategoriesChange={setCats} reload={load} onClose={() => setShowCategories(false)} />}

      {!isMobile && (
        <GoalsForm
          form={form}
          set={set}
          cats={cats}
          isFinance={isFinance}
          submit={submit}
          editingId={editingId}
onCancelEdit={onCancelEdit}        />
      )}

      <div className="table-wrapper">
        <TablePlusFiltersLayout
          isMobile={isMobile}
          filtersPanel={  isMobile ? null : (
            <TableFilters 
              config={{
                categories: cats,
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
              data={sortedTodosWrtDate}
              columns={
                goalsColumns
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
      </div>
    </div>
  );
}