'use client';

import { useGlobalApiLoading } from "@/lib/hooks";
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
  setEditingId: (id: string | null) => void;
  initial: TodosFormState;
};

export const TodosForm = ({
  form,
  setForm,
  submit,
  editingId,
  setEditingId,
  initial,
}: Props) => {
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(initial);
  };
  const isApiLoading = useGlobalApiLoading();
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
                onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
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