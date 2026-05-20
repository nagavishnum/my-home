'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Todo, PaginatedResponse } from '@/lib/types';
import Table from './Table';
import { today } from '@/lib/helpers';
import TableFilters, { applyFilters, emptyFilters, FilterValues } from './TableFilters';
import { PRIORITY_COLORS } from '@/lib/constants';

const initial = { t: '', ti: '', da: today(), p: 'medium', s: false };

export default function Todos() {
  const [data, setData] = useState<Todo[]>([]);
  const [form, setForm] = useState(initial);
  const [filters, setFilters] = useState<FilterValues>({ ...emptyFilters });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    api.get<PaginatedResponse<Todo>>('/todos?limit=200').then((t) => {
      setData(t.data.data); setLoading(false);
    }).catch(() => {
      setError('Failed to load todos'); setLoading(false);
    });
  }, []);

  const submit = async () => {
    if (!form.t.trim() || !form.da || !form.p) {
      alert('Please fill all fields');
      return;
    }
    try {
      const res = await api.post('/todos', {
        t: form.t.trim(),
        ti: form.ti,
        da: form.da,
        p: form.p,
        s: false,
      });
      setData((p) => [res.data, ...p]);
      setForm(initial);
    } catch {
      setError('Failed to save todo');
    }
  };

  const toggle = async (id: string, s: boolean) => {
    try {
      setData((p) => p.map((i) => (i._id === id ? { ...i, s: !s } : i)));
      await api.put(`/todos/${id}`, { s: !s });
    } catch {
      setData((p) => p.map((i) => (i._id === id ? { ...i, s } : i)));
      setError('Failed to update todo');
    }
  };

  const remove = async (id: string) => {
    const prev = data;
    try {
      setData((p) => p.filter((i) => i._id !== id));
      await api.delete(`/todos/${id}`);
    } catch {
      setData(prev);
      setError('Failed to delete todo');
    }
  };

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));
  const filtered = applyFilters(data, filters, 'da');

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {error && <p className='error'>{error}</p>}

      <div className='form'>
        <input placeholder='Task' value={form.t} onChange={(e) => set('t', e.target.value)} />
        <select value={form.p} onChange={(e) => set('p', e.target.value)}>
          <option value='medium'>Medium</option>
          <option value='low'>Low</option>
          <option value='high'>High</option>
          <option value='mandatory'>Mandatory</option>
        </select>
        <input type='time' value={form.ti} onChange={(e) => set('ti', e.target.value)} />
        <input type='date' value={form.da} onChange={(e) => set('da', e.target.value)} />
        <button className='btn-primary' onClick={submit}>Save</button>
      </div>

      <Table
        head={['Task', 'Date', 'Priority', 'Status', 'Action']}
        filterPanel={
          <TableFilters
            config={{ statuses: ['Done', 'Pending'], priorities: ['low', 'medium', 'high', 'mandatory'], showDateRange: true }}
            filters={filters}
            onChange={setFilters}
          />
        }
      >
        {filtered.map((i) => (
          <tr key={i._id}>
            <td>{i.t}</td>
            <td>{i.da ? new Date(i.da).toLocaleDateString() : '-'}</td>
            <td style={{ color: PRIORITY_COLORS[i.p] || '#111', fontWeight: 700, fontSize: 22 }} title={i.p}>
              {i.p === 'low' && '↓'}
              {i.p === 'medium' && '↔'}
              {i.p === 'high' && '↑'}
              {i.p === 'mandatory' && '★'}
            </td>
            <td className='font-bold' style={{ color: i.s ? 'green' : 'orange' }}>
              {i.s ? 'Done' : 'Pending'}
            </td>
            <td>
              <button onClick={() => toggle(i._id, i.s)} className={i.s ? 'btn-secondary' : 'btn-primary'}>
                {i.s ? 'Undo' : '✓'}
              </button>
              <button className='btn-danger' onClick={() => remove(i._id)}>Delete</button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}