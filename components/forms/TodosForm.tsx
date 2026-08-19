"use client";

import { useGlobalApiLoading } from "@/lib/hooks";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import "./forms.css";
import React from "react";
import VoiceInput from "@/lib/voicecommand/voicebutton";
import { parseTodoSpeech } from "@/lib/voicecommand/parsers/voiceTodoParser";

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
  onCancelEdit,
}: Props) => {
  const changeDate = (type: "prev" | "next") => {
    const today = new Date();

    if (type === "prev") {
      today.setDate(today.getDate() - 1); // yesterday
    } else {
      today.setDate(today.getDate() + 1); // tomorrow
    }

    const formattedDate = today.toISOString().split("T")[0];

    setForm((prev) => ({
      ...prev,
      da: formattedDate,
    }));
  };

  const handleVoiceTodo = (data: TodosFormState) => {
    setForm((current) => ({
      t: data.t || current.t,
      p: data.p || current.p,
      da: data.da || current.da,
    }));
  };

  const isApiLoading = useGlobalApiLoading();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div className="form">
        <input
          value={form.t}
          onChange={(e) => setForm((f) => ({ ...f, t: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Todo"
          type="text"
          maxLength={100}
          required
        />

        <select
          value={form.p}
          onChange={(e) => setForm((f) => ({ ...f, p: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="mandatory">Mandatory</option>
        </select>
        <button
          type="button"
          className="date-nav-btn"
          onClick={() => changeDate("prev")}
          aria-label="Previous Day"
          title="Previous Day"
        >
          <ArrowLeftIcon size={18} />
        </button>

        <input
          type="date"
          value={form.da}
          onChange={(e) => setForm((f) => ({ ...f, da: e.target.value }))}
        />

        <button
          type="button"
          className="date-nav-btn"
          onClick={() => changeDate("next")}
          aria-label="Next Day"
          title="Next Day"
        >
          <ArrowRightIcon size={18} />
        </button>

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
      {!editingId && (
        <VoiceInput
          parser={parseTodoSpeech}
          onParsed={handleVoiceTodo}
          disabled={isApiLoading}
          title="Add todo using voice"
        />
      )}
    </div>
  );
};
