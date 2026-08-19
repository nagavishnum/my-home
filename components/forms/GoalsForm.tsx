"use client";

import React from "react";
import { Category } from "@/lib/types";
import { useGlobalApiLoading } from "@/lib/hooks";

type GoalsFormState = {
  t: string;
  d: string;
  c: string;
  td: string;
  p: string;
  s: string;
  tv: string;
  cv: string;
};

type Props = {
  form: GoalsFormState;
  set: (key: keyof GoalsFormState, value: string) => void;
  cats: Category[];
  isFinance: boolean;
  submit: () => void;
  editingId: string | null;
  onCancelEdit: () => void;
};

export const GoalsForm = ({
  form,
  set,
  cats,
  isFinance,
  submit,
  editingId,
  onCancelEdit,
}: Props) => {
  const isApiLoading = useGlobalApiLoading();
  return (
    <div className="form">
      <input
        placeholder="Title"
        value={form.t}
        onChange={(e) => set("t", e.target.value)}
        type="text"
        maxLength={70}
        required
      />

      <select
        value={form.c}
        onChange={(e) => set("c", e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      >
        <option value="">Category</option>

        {cats.map((i) => (
          <option key={i._id} value={i._id}>
            {i.n}
          </option>
        ))}
      </select>

      <input
        placeholder="Description"
        value={form.d}
        onChange={(e) => set("d", e.target.value)}
        type="text"
        maxLength={100}
        required
      />

      <input
        type="date"
        value={form.td}
        onChange={(e) => set("td", e.target.value)}
      />

      <select
        value={form.p}
        onChange={(e) => set("p", e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <select
        value={form.s}
        onChange={(e) => set("s", e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      >
        <option value="pending">Pending</option>
        <option value="inprogress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      {isFinance && (
        <>
          <input
            placeholder="Target Value"
            type="number"
            value={form.tv}
            onChange={(e) => set("tv", e.target.value)}
            min={1}
            max={999999999999}
            step={1}
            inputMode="numeric"
          />

          <input
            placeholder="Current Value"
            type="number"
            value={form.cv}
            onChange={(e) => set("cv", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            min={0}
            max={999999999999}
            step={1}
            inputMode="numeric"
          />
        </>
      )}

      <button
        className={editingId ? "btn-edit" : "btn-add"}
        onClick={submit}
        disabled={isApiLoading}
      >
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
