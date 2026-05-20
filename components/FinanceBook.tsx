'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Finance, Category, PaginatedResponse } from '@/lib/types';
import Categories from './Categories';
import Table from './Table';
import { today } from '@/lib/helpers';
import TableFilters, { applyFilters, emptyFilters, FilterValues } from './TableFilters';

const initial = { n: '', a: '', c: '', ty: 'Monthly', md: today(), lp: '', rt: '', cv: '', no: '' };

export default function FinanceBook() {
  const [data, setData] = useState<Finance[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState(initial);
  const [filters, setFilters] = useState<FilterValues>({ ...emptyFilters });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [f, c] = await Promise.all([
        api.get<PaginatedResponse<Finance>>('/finance?limit=200'),
        api.get<Category[]>('/categories/finance'),
      ]);
      setData(f.data.data);
      setCats(c.data);
      setError(null);
    } catch {
      setError('Failed to load finance data');
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
    if (!form.n.trim() || !form.a || !form.c || !form.ty || !form.md) {
      alert('Please fill required fields');
      return;
    }
    try {
      const res = await api.post('/finance', {
        n: form.n.trim(),
        a: Number(form.a),
        c: form.c,
        ty: form.ty,
        md: form.md,
        lp: Number(form.lp) || 0,
        rt: Number(form.rt) || 0,
        cv: Number(form.cv) || Number(form.a),
        no: form.no.trim(),
      });
      setData((p) => [res.data, ...p]);
      setForm(initial);
    } catch {
      setError('Failed to save finance item');
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/finance/${id}`);
      setData((p) => p.filter((i) => i._id !== id));
    } catch {
      setError('Failed to delete finance item');
    }
  };

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));
  const filtered = applyFilters(data, filters, 'md');

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {error && <p className='error'>{error}</p>}

      <Categories type='finance' categories={cats} onCategoriesChange={setCats} reload={load} />

      <div className='form'>
        <input placeholder='Name' type='text' value={form.n} onChange={(e) => set('n', e.target.value)} />
        <input placeholder='Amount' type='number' value={form.a} onChange={(e) => set('a', e.target.value)} />
        <select value={form.c} onChange={(e) => set('c', e.target.value)}>
          <option value=''>Category</option>
          {cats.map((i) => (
            <option key={i._id} value={i._id}>{i.n}</option>
          ))}
        </select>
        <select value={form.ty} onChange={(e) => set('ty', e.target.value)}>
          <option value='Monthly'>Monthly</option>
          <option value='OneTime'>One Time</option>
        </select>
        <input type='date' value={form.md} onChange={(e) => set('md', e.target.value)} />
        <input placeholder='Lock Period (years)' type='number' value={form.lp} onChange={(e) => set('lp', e.target.value)} />
        <input placeholder='Returns %' type='number' value={form.rt} onChange={(e) => set('rt', e.target.value)} />
        <input placeholder='Current Value' type='number' value={form.cv} onChange={(e) => set('cv', e.target.value)} />
        <input placeholder='Notes' type='text' value={form.no} onChange={(e) => set('no', e.target.value)} />
        <button className='btn-primary' onClick={submit}>Save</button>
      </div>

      <Table
        head={['Name', 'Amount', 'Current Value', 'Category', 'Type', 'Returns', 'Maturity', 'Action']}
        filterPanel={
          <TableFilters config={{ categories: cats, showDateRange: false }} filters={filters} onChange={setFilters} />
        }
      >
        {filtered.map((i) => (
          <tr key={i._id}>
            <td>{i.n}</td>
            <td>{i.a}</td>
            <td>{i.cv ?? i.a}</td>
            <td>{i.c?.n ?? '-'}</td>
            <td>{i.ty}</td>
            <td>{i.rt}%</td>
            <td>{i.md ? new Date(i.md).toLocaleDateString() : '-'}</td>
            <td>
              <button className='btn-danger' onClick={() => remove(i._id)}>Delete</button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}