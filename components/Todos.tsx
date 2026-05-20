'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Todo, PaginatedResponse } from '@/lib/types';
import Table from './Table';
import { today } from '@/lib/helpers';
import TableFilters, {
  applyFilters,
  emptyFilters,
  FilterValues,
} from './TableFilters';
import { PRIORITY_COLORS } from '@/lib/constants';

const initial = { t: '', da: today(), p: 'medium' };

export default function Todos() {
  const [data, setData] = useState<Todo[]>([]);
  const [form, setForm] = useState(initial);
  const [filters, setFilters] = useState<FilterValues>({
    ...emptyFilters,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [selected, setSelected] = useState<string[]>([]);

  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    api
      .get<PaginatedResponse<Todo>>('/todos?limit=200')
      .then((t) => {
        setData(t.data.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load todos');
        setLoading(false);
      });
  }, []);

  // CREATE + UPDATE
  const submit = async () => {
    if (!form.t.trim() || !form.da || !form.p) {
      alert('Please fill all fields');
      return;
    }

    try {
      if (editingId) {
        const res = await api.put(`/todos/${editingId}`, {
          t: form.t.trim(),
          da: form.da,
          p: form.p,
        });

        setData((p) =>
          p.map((i) =>
            i._id === editingId ? res.data : i
          )
        );

        setEditingId(null);
      } else {
        const res = await api.post('/todos', {
          t: form.t.trim(),
          da: form.da,
          p: form.p,
        });

        setData((p) => [res.data, ...p]);
      }

      setForm(initial);
    } catch {
      setError('Failed to save todo');
    }
  };

  const remove = async (id: string) => {
    const prev = data;

    try {
      setData((p) => p.filter((i) => i._id !== id));

      await api.delete(`/todos/${id}`);

      setSelected((p) =>
        p.filter((selectedId) => selectedId !== id)
      );
    } catch {
      setData(prev);
      setError('Failed to delete todo');
    }
  };

  const bulkDelete = async () => {
    if (!selected.length) return;


    const prev = data;

    try {
      setData((p) =>
        p.filter((i) => !selected.includes(i._id))
      );

      await Promise.all(
        selected.map((id) =>
          api.delete(`/todos/${id}`)
        )
      );

      setSelected([]);
    } catch {
      setData(prev);
      setError('Failed to delete todos');
    }
  };

  const set = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const filtered = applyFilters(data, filters, 'da');

  const selectedSet = new Set(selected);

  const allSelected =
    filtered.length > 0 &&
    filtered.every((i) => selectedSet.has(i._id));

  const someSelected =
    filtered.some((i) => selectedSet.has(i._id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected((p) =>
        p.filter(
          (id) =>
            !filtered.some((i) => i._id === id)
        )
      );
    } else {
      setSelected((p) => [
        ...new Set([
          ...p,
          ...filtered.map((i) => i._id),
        ]),
      ]);
    }
  };

  return (
    <div>
      {error && <p className='error'>{error}</p>}

      {/* FORM */}
      <div className='form'>
        <input
          placeholder='Task'
          value={form.t}
          onChange={(e) => set('t', e.target.value)}
        />

        <select
          value={form.p}
          onChange={(e) => set('p', e.target.value)}
        >
          <option value='medium'>Medium</option>
          <option value='low'>Low</option>
          <option value='high'>High</option>
          <option value='mandatory'>Mandatory</option>
        </select>

        <input
          type='date'
          value={form.da}
          onChange={(e) => set('da', e.target.value)}
        />

        <button
          className='btn-primary'
          onClick={submit}
                    disabled={loading}
        >
          {editingId ? 'Update' : 'Save'}
        </button>

        {editingId && (
          <button
            className='btn-secondary'
            onClick={() => {
              setEditingId(null);
              setForm(initial);
            }}
                      disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>

      {/* BULK BAR */}
      {selected.length > 0 && (
        <div className='bulk-bar'>
          <span>{selected.length} selected</span>

          <button
            className='btn-danger'
            onClick={bulkDelete}
                      disabled={loading}
          >
            Delete Selected
          </button>

          <button
            className='btn-secondary'
            onClick={() => setSelected([])}
                      disabled={loading}
          >
            Clear
          </button>
        </div>
      )}

      {/* TABLE */}
      <Table
        head={[
          <input
            key='select-all'
            type='checkbox'
            checked={allSelected}
            ref={(el) => {
              if (el) {
                el.indeterminate =
                  !allSelected && someSelected;
              }
            }}
            onChange={toggleSelectAll}
          />,
          'Task',
          'Date',
          'Priority',
          'Action',
        ]}
        filterPanel={
          <TableFilters
            config={{
              priorities: [
                'low',
                'medium',
                'high',
                'mandatory',
              ],
              month: false,
              year: false,
            }}
            filters={filters}
            onChange={setFilters}
          />
        }
      >
        {filtered.map((i) => (
          <tr key={i._id}>
            <td>
              <input
                type='checkbox'
                checked={selectedSet.has(i._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelected((p) => [
                      ...p,
                      i._id,
                    ]);
                  } else {
                    setSelected((p) =>
                      p.filter(
                        (id) => id !== i._id
                      )
                    );
                  }
                }}
              />
            </td>

            <td>{i.t}</td>

            <td>
              {i.da
                ? new Date(
                    i.da
                  ).toLocaleDateString()
                : '-'}
            </td>

            <td
              style={{
                color:
                  PRIORITY_COLORS[i.p] || '#111',
                fontWeight: 700,
                fontSize: 18,
              }}
              title={i.p}
            >
              {i.p === 'low' && '↓'}
              {i.p === 'medium' && '↔'}
              {i.p === 'high' && '↑'}
              {i.p === 'mandatory' && '★'}
            </td>

            <td>
              <button
                onClick={() => {
                  setEditingId(i._id);

                  setForm({
                    t: i.t,
                    da: new Date(i.da)
                      .toISOString()
                      .split('T')[0],
                    p: i.p,
                  });
                }}
                          disabled={loading}
              >
                Edit
              </button>

              <button
                className='btn-danger'
                onClick={() => remove(i._id)}
                          disabled={loading}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}