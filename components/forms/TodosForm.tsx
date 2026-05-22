'use client';

import React from "react";

type TodosFormState = {
  t: string;
  p: string;
  da: string;
};

type Props = {
  form: TodosFormState;
  setForm: React.Dispatch<React.SetStateAction<TodosFormState>>;
  submit: () => void;
  editingId: string | null;
};

export const TodosForm = ({
  form,
  setForm,
  submit,
  editingId,
}: Props) => {
  return (
    <div className="form">
      <input
        value={form.t}
        onChange={(e) =>
          setForm((f) => ({ ...f, t: e.target.value }))
        }
        placeholder="Todo"
      />

      <select
        value={form.p}
        onChange={(e) =>
          setForm((f) => ({ ...f, p: e.target.value }))
        }
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="mandatory">Mandatory</option>
      </select>

      <input
        type="date"
        value={form.da}
        onChange={(e) =>
          setForm((f) => ({ ...f, da: e.target.value }))
        }
      />

      <button className="btn-primary" onClick={submit}>
        {editingId ? "Update" : "Save"}
      </button>
    </div>
  );
};