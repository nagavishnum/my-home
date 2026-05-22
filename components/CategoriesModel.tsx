'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';
import Categories from './Categories';

type Props = {
  type: string;
  categories: Category[];
  onCategoriesChange: (cats: Category[]) => void;
  reload?: () => void;
  onClose: () => void;
};

export default function CategoriesModal({
  type,
  categories,
  onCategoriesChange,
  reload,
  onClose,
}: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Categories</h3>

          <button
            className="btn-danger"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="modal-body">
          <Categories
            type={type}
            categories={categories}
            onCategoriesChange={onCategoriesChange}
            reload={reload}
          />
        </div>
      </div>
    </div>
  );
}