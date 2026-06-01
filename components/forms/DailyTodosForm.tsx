'use client';

import { useGlobalApiLoading } from "@/lib/hooks";
import React from "react";

type DailyTodosFormState = {
  t: string;
};

type Props = {
  form: DailyTodosFormState;
  setForm: React.Dispatch<
    React.SetStateAction<DailyTodosFormState>
  >;
  submit: () => void;
  editingId: string | null;
  onCancelEdit: () => void;
};

export const DailyTodosForm = ({
  form,
  setForm,
  submit,
  editingId,
  onCancelEdit,
}: Props) => {

  const isApiLoading =
    useGlobalApiLoading();

  return (
    <div className="form">

      <input
        value={form.t}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            t: e.target.value,
          }))
        }
        placeholder="Daily Todo"
        onKeyDown={(e) => {
          if (e.key === "Enter")
            submit();
        }}
      />

      <button
        className={
          editingId
            ? "btn-edit"
            : "btn-add"
        }
        onClick={submit}
        disabled={isApiLoading}
      >
        {editingId
          ? "Update"
          : "Save"}
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