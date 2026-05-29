'use client';

import { Category } from '@/lib/types';
import Categories from './Categories';
import { useGlobalApiLoading } from '@/lib/hooks';
import { X } from 'lucide-react';

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
  const isApiLoading = useGlobalApiLoading();

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}

        {/* BODY */}
        <Categories
          type={type}
          categories={categories}
          onCategoriesChange={onCategoriesChange}
          reload={reload}
        />
      </div>
    </div>
  );
}