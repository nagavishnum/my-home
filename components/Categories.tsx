'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';
import { useGlobalApiLoading } from '@/lib/hooks';
import { Pencil, Trash } from 'lucide-react';

type Props = {
  type: string;
  categories: Category[];
  onCategoriesChange: (cats: Category[]) => void;
  reload?: () => void;
};

export default function Categories({
  type,
  categories,
  onCategoriesChange,
  reload
}: Props) {
  const [name, setName] = useState('');
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isApiLoading = useGlobalApiLoading();


  const submit = async () => {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const res = await api.post('/categories', { n: trimmed, t: type });
      onCategoriesChange([res.data, ...categories]);
      setName('');
      reload?.();
    } catch {
      setError('Failed to add category');
    }
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      await api.delete(`/categories/${id}`);
      onCategoriesChange(categories.filter((i) => i._id !== id));
      reload?.();
    } catch {
      setError('Failed to delete category');
    }
  };

  const startEdit = (item: Category) => {
    setEditId(item._id);
    setEditName(item.n);
  };

  const update = async () => {
        setError(null);
    const trimmed = editName.trim();
    if (!trimmed) return;
    try {
      const res = await api.put(`/categories/${editId}`, { n: trimmed });
      onCategoriesChange(categories.map((i) => (i._id === editId ? res.data : i)));
      setEditId('');
      setEditName('');
      reload?.();
    } catch {
      setError('Failed to update category');
    }
  };

  return (
    <div className='card'>
      {error && <p className='error'>{error}</p>}

      <div className='form'>
        <input
          placeholder='Category Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button className='btn-primary' onClick={submit} disabled={isApiLoading}>Save</button>
      </div>

      <div className='chips'>
        {categories.map((i) => (
          <div key={i._id} className='chip'>
            {editId === i._id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && update()}
                  style={{ width: '130px',maxWidth:'130px',flex:'none',minWidth:'110px' }}
                />
                <button className='btn-edit' onClick={update} disabled={isApiLoading}>Save</button>
                <button onClick={() => setEditId('')} disabled={isApiLoading}>Cancel</button>
              </>
            ) : (
              <>
                <span>{i.n}</span>
                <button onClick={() => startEdit(i)} className='edit-btn' disabled={isApiLoading}><Pencil/></button>
                <button className='delete-btn' onClick={() => remove(i._id)} disabled={isApiLoading}><Trash/></button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}