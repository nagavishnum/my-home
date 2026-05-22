'use client';

type ExpenseFormState = {
  a: string;
  c: string;
  r: string;
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
};

export const ExpensesForm = ({
  form,
  setForm,
  submit,
  cats,
}: Props) => {
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
        placeholder="Reason"
        value={form.r}
        onChange={(e) =>
          setForm((f) => ({ ...f, r: e.target.value }))
        }
      />

      <input
        type="date"
        value={form.d}
        onChange={(e) =>
          setForm((f) => ({ ...f, d: e.target.value }))
        }
      />

      <button className="btn-primary" onClick={submit}>
        Save
      </button>
    </div>
  );
};