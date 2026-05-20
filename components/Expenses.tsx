'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Expense, Category, PaginatedResponse } from '@/lib/types';
import Categories from './Categories';
import Table from './Table';
import { today } from '@/lib/helpers';
import TableFilters, { applyFilters, emptyFilters, FilterValues } from './TableFilters';

const initial = { a: '', r: '', c: '', d: today() };

export default function Expenses() {
  const [data, setData] = useState<Expense[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState(initial);
  const [filters, setFilters] = useState<FilterValues>({ ...emptyFilters });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [e, c] = await Promise.all([
        api.get<PaginatedResponse<Expense>>('/expenses?limit=200'),
        api.get<Category[]>('/categories/expense'),
      ]);
      setData(e.data.data);
      setCats(c.data);
      setError(null);
    } catch(e) {
      setError('Failed to load expenses');
      console.warn(e);
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
      alert('Please fill all fields');
      return;
    }
    try {
      const res = await api.post('/expenses', {
        a: Number(form.a),
        r: form.r.trim(),
        c: form.c,
        d: form.d,
      });
      setData((p) => [res.data, ...p]);
      setForm(initial);
    } catch {
      setError('Failed to save expense');
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/expenses/${id}`);
      setData((p) => p.filter((i) => i._id !== id));
    } catch {
      setError('Failed to delete expense');
    }
  };

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));
  const filtered = applyFilters(data, filters, 'd');

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {error && <p className='error'>{error}</p>}

      <Categories type='expense' categories={cats} onCategoriesChange={setCats} reload={load} />

      <div className='form'>
        <input placeholder='Amount' type='number' value={form.a} onChange={(e) => set('a', e.target.value)} />
        <select value={form.c} onChange={(e) => set('c', e.target.value)}>
          <option value=''>Category</option>
          {cats.map((i) => (
            <option key={i._id} value={i._id}>{i.n}</option>
          ))}
        </select>
        <input placeholder='Reason' type='text' value={form.r} onChange={(e) => set('r', e.target.value)} />
        <input type='date' value={form.d} onChange={(e) => set('d', e.target.value)} />
        <button className='btn-primary' onClick={submit}>Save</button>
      </div>

      <Table
        head={['Amount', 'Reason', 'Category', 'Date', 'Action']}
        filterPanel={
          <TableFilters config={{ categories: cats, showDateRange: true }} filters={filters} onChange={setFilters} />
        }
      >
        {filtered.map((i) => (
          <tr key={i._id}>
            <td>{i.a}</td>
            <td>{i.r}</td>
            <td>{i.c?.n ?? '-'}</td>
            <td>{new Date(i.d).toLocaleDateString()}</td>
            <td>
              <button className='btn-danger' onClick={() => remove(i._id)}>Delete</button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}