"use client";

import React from "react";
import { Category } from "@/lib/types";
import { useGlobalApiLoading } from "@/lib/hooks";

type FinanceFormState = {
  n: string;
  a: string;
  c: string;
  ty: string;
  sv: string;
  md: string;
  lp: string;
  rt: string;
  cv: string;
  no: string;
};

type Props = {
  form: FinanceFormState;
  submit: () => void;
  cats: Category[];

  editingId: string | null;

  set: (key: keyof FinanceFormState, value: string) => void;
  onCancelEdit: () => void;
};

export const FinanceForm = ({
  form,
  submit,
  cats,
  editingId,
  set,
  onCancelEdit,
}: Props) => {
  const isApiLoading = useGlobalApiLoading();

  return (
    <div className="form">
      <input
        placeholder="Name"
        value={form.n}
        onChange={(e) => set("n", e.target.value)}
        type="text"
        maxLength={100}
        required
      />

      <input
        placeholder="Total Invested"
        type="number"
        value={form.a}
        onChange={(e) => {
          set("a", e.target.value);
          set("cv", e.target.value);
        }}
        min={1}
        max={999999999999}
        step={1}
        inputMode="numeric"
        required
      />

      <select value={form.c} onChange={(e) => set("c", e.target.value)}>
        <option value="">Category</option>

        {cats.map((i) => (
          <option key={i._id} value={i._id}>
            {i.n}
          </option>
        ))}
      </select>

      <select value={form.ty} onChange={(e) => set("ty", e.target.value)}>
        <option value="Monthly">Monthly</option>
        <option value="OneTime">One Time</option>
      </select>

      {form.ty === "Monthly" && (
        <input
          placeholder="Monthly SIP Amount"
          type="number"
          value={form.sv}
          onChange={(e) => set("sv", e.target.value)}
          min={1}
          max={999999999}
          step={1}
          inputMode="numeric"
        />
      )}

      <input
        type="date"
        value={form.md}
        onChange={(e) => set("md", e.target.value)}
      />

      <input
        placeholder="Lock Period (years)"
        type="number"
        value={form.lp}
        onChange={(e) => set("lp", e.target.value)}
        min={0}
        max={100}
        step={1}
        inputMode="numeric"
      />

      <input
        placeholder="Returns %"
        type="number"
        value={form.rt}
        onChange={(e) => set("rt", e.target.value)}
        min={0}
        max={100}
        step="0.01"
        inputMode="decimal"
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

      <input
        placeholder="Notes"
        value={form.no}
        onChange={(e) => set("no", e.target.value)}
        maxLength={200}
        type="text"
      />

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
