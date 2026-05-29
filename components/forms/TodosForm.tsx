'use client';

import { useGlobalApiLoading } from "@/lib/hooks";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
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
 onCancelEdit: () => void;
};

export const TodosForm = ({
  form,
  setForm,
  submit,
  editingId,
onCancelEdit
}: Props) => {
 const changeDate = (type: 'prev' | 'next') => {
  const today = new Date();

  if (type === 'prev') {
    today.setDate(today.getDate() - 1); // yesterday
  } else {
    today.setDate(today.getDate() + 1); // tomorrow
  }

  const formattedDate = today.toISOString().split('T')[0];

  setForm((prev) => ({
    ...prev,
    da: formattedDate,
  }));
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
<ArrowLeftIcon onClick={() => changeDate('prev')} />

<input
  type="date"
  value={form.da}
  onChange={(e) =>
    setForm((f) => ({ ...f, da: e.target.value }))
  }
/>

<ArrowRightIcon onClick={() => changeDate('next')} />

      <button className={editingId? "btn-edit":"btn-add"} onClick={submit} disabled={isApiLoading}>
        {editingId ? "Update" : "Save"}
      </button>
                  {editingId && (
        <button
          className="btn-secondary"
          onClick={onCancelEdit}
          disabled={isApiLoading}
        >
          Cancel
        </button>
      )}
    </div>
  );
};