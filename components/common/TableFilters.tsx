'use client';

import { useState } from 'react';

import { MONTHS, YEARS } from '@/lib/constants';
import { useGlobalApiLoading } from '@/lib/hooks';

type FilterConfig = {
  categories?: {
    _id: string;
    n: string;
  }[];
  priorities?: string[];
  statuses?: string[];
  types?: string[];
  showDateRange?: boolean;
  month?: boolean;
  year?: boolean;
};

type FilterValues = {
  category: string;

  priority: string;

  status: string;

  type: string;

  dateFrom: string;

  dateTo: string;

  month: string;

  year: string;
};

const emptyFilters: FilterValues = {
  category: '',
  priority: '',
  status: '',
  type: '',
  dateFrom: '',
  dateTo: '',
  month: '',
  year: '',
};



export default function TableFilters({
  config,
  filters,
  close,
  onChange,
}: {
  config: FilterConfig;
  filters: FilterValues;
  close?: () => void;
  onChange: (f: FilterValues) => void;
}) {
  const [local, setLocal] = useState<FilterValues>({ ...filters });
      const isApiLoading = useGlobalApiLoading();
  
  const set = (key: keyof FilterValues, val: string) => {
    const next = { ...local, [key]: val };
    if (key === 'month' || key === 'year') {
      next.dateFrom = '';
      next.dateTo = '';
    }
    if (key === 'dateFrom' || key === 'dateTo') {
      next.month = '';
      next.year = '';
    }
    setLocal(next);
  };

  const apply = () => {
    onChange({ ...local });
    if (close) close();
  };

  const clear = () => {
    const empty = { ...emptyFilters };
    setLocal(empty);
    onChange(empty);
  };

  const hasAny = Object.values(local).some(Boolean);

  return (
    <div className="filters-panel">

      {config.categories && (
        <div className="filter-group">
          <label>Category</label>
          <select value={local.category} onChange={(e) => set('category', e.target.value)}>
            <option value="">All</option>
            {config.categories.map((c) => (
              <option key={c._id} value={c._id}>{c.n}</option>
            ))}
          </select>
        </div>
      )}

      {config.statuses && (
        <div className="filter-group">
          <label>Status</label>
          <select value={local.status} onChange={(e) => set('status', e.target.value)}>
            <option value="">All</option>
            {config.statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

{config.types && (
  <div className="filter-group">
    <label>Type</label>

    <select
      value={local.type}
      onChange={(e) =>
        set('type', e.target.value)
      }
    >
      <option value="">
        All
      </option>

      {config.types.map((t) => (
        <option
          key={t}
          value={t}
        >
          {t}
        </option>
      ))}
    </select>
  </div>
)}

{config.priorities && (
  <div className="filter-group">
    <label>Priority</label>

    <select
      value={local.priority}
      onChange={(e) =>
        set(
          'priority',
          e.target.value
        )
      }
    >
      <option value="">
        All
      </option>

      {config.priorities.map(
        (p) => (
          <option
            key={p}
            value={p}
          >
            {p
              .charAt(0)
              .toUpperCase() +
              p.slice(1)}
          </option>
        )
      )}
    </select>
  </div>
)}

{config.month && (      <div className="filter-group">
        <label>Month</label>
        <select value={local.month} onChange={(e) => set('month', e.target.value)}>
          <option value="">All</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={String(i)}>{m}</option>
          ))}
        </select>
      </div>)}

    {config.year &&(  <div className="filter-group">
        <label>Year</label>
        <select value={local.year} onChange={(e) => set('year', e.target.value)}>
          <option value="">All</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>)}

      {config.showDateRange && (
        <>
          <div className="filter-group">
            <label>From</label>
            <input type="date" value={local.dateFrom} onChange={(e) => set('dateFrom', e.target.value)} />
          </div>
          <div className="filter-group">
            <label>To</label>
            <input type="date" value={local.dateTo} onChange={(e) => set('dateTo', e.target.value)} />
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button className="btn-primary" onClick={apply} disabled={isApiLoading}>Apply</button>
        {hasAny && (
          <button className="btn-secondary" style={{ marginLeft: 0 }} onClick={clear} disabled={isApiLoading}>Clear</button>
        )}
      </div>
    </div>
  );
}

// Generic filter utility for table data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyFilters<T extends Record<string, any>>(
  data: T[],
  filters: FilterValues,
  dateField: string,
  categoryField = 'c'
) {
  return data.filter((item) => {
    const catVal = item[categoryField] as Record<string, unknown> | string | undefined;
    if (filters.category) {
      const catId = typeof catVal === 'object' && catVal ? (catVal as Record<string, unknown>)._id : catVal;
      if (catId !== filters.category) return false;
    }
    if (filters.priority && item.p !== filters.priority) return false;
    if (filters.status) {
      const done = item.s ? 'Done' : 'Pending';
      if (done !== filters.status) return false;
    }
    if (
  filters.type &&
  item.ty !== filters.type
) {
  return false;
}

    const rawDate = item[dateField];
    const dateVal = rawDate ? new Date(rawDate as string | number) : null;

    if (filters.month !== '' && dateVal) {
      if (dateVal.getMonth() !== Number(filters.month)) return false;
    }
    if (filters.year && dateVal) {
      if (dateVal.getFullYear() !== Number(filters.year)) return false;
    }
    if (filters.dateFrom && dateVal) {
      if (dateVal < new Date(filters.dateFrom)) return false;
    }
    if (filters.dateTo && dateVal) {
      if (dateVal > new Date(filters.dateTo + 'T23:59:59')) return false;
    }

    return true;
  });
}

export { emptyFilters };
export type { FilterValues };
