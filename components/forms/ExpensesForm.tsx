'use client';

import { useGlobalApiLoading } from "@/lib/hooks";

type ExpenseFormState = {
  a: string;
  c: string;
  d: string;
};

type Category = {
  _id: string;
  n: string;
};

type Props = {
  form: ExpenseFormState;
  setForm: React.Dispatch<React.SetStateAction<ExpenseFormState>>;
  submit: () => void;
  cats: Category[];
  setEditingId: (id: string | null) => void;
  initial: ExpenseFormState;
  editingId: string | null;
};

export const ExpensesForm = ({
  form,
  setForm,
  submit,
  cats,
  setEditingId,
  initial,
  editingId
}: Props) => {
      const handleCancelEdit = () => {
      setEditingId(null);
      setForm(initial);
    };
        const isApiLoading = useGlobalApiLoading();
  
  return (
    <div className="form">
      <input
        placeholder="Amount"
        value={form.a}
        onChange={(e) =>
          setForm((f) => ({ ...f, a: e.target.value }))
        }
      />

      <select
        value={form.c}
        onChange={(e) =>
          setForm((f) => ({ ...f, c: e.target.value }))
        }
      >
        <option value="">Category</option>

        {cats.map((i) => (
          <option key={i._id} value={i._id}>
            {i.n}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={form.d}
        onChange={(e) =>
          setForm((f) => ({ ...f, d: e.target.value }))
        }
      />

      <button className="btn-primary" onClick={submit} disabled={isApiLoading}>
        {editingId ? "Update" : "Save"}
      </button>
            {editingId && (
        <button
          className="btn-secondary"
          onClick={handleCancelEdit}
          disabled={isApiLoading}
        >
          Cancel
        </button>
      )}
    </div>
  );
};