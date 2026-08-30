"use client";

import { useGlobalApiLoading } from "@/lib/hooks";
import { Category } from "@/lib/types";
import VoiceInput from "@/lib/voicecommand/voicebutton";
import { parseExpenseSpeech } from "@/lib/voicecommand/voiceExpenseParser";

type ExpenseFormState = {
  a: string;
  c: string;
  d: string;
};

type Props = {
  form: ExpenseFormState;
  setForm: React.Dispatch<React.SetStateAction<ExpenseFormState>>;
  submit: () => void;
  cats: Category[];
  editingId: string | null;
  onCancelEdit?: () => void;
};

export const ExpensesForm = ({
  form,
  setForm,
  submit,
  cats,
  editingId,
  onCancelEdit,
}: Props) => {
  const isApiLoading = useGlobalApiLoading();

  const handleVoiceExpense = (data: ExpenseFormState) => {
    setForm((current) => ({
      a: data.a || current.a,
      c: data.c || current.c,
      d: data.d || current.d,
    }));
  };

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
          placeholder="Amount"
          type="number"
          value={form.a}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              a: e.target.value,
            }))
          }
          min={1}
          max={999999999999}
          step={1}
          inputMode="numeric"
          required
        />

        <select
          value={form.c}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              c: e.target.value,
            }))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              submit();
            }
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
          type="date"
          value={form.d}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              d: e.target.value,
            }))
          }
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
              {!editingId && (
        <VoiceInput
          parser={(transcript) => parseExpenseSpeech(transcript, cats)}
          onParsed={handleVoiceExpense}
          disabled={isApiLoading}
          title="Add expense using voice"
        />
      )}
      </div>
    </div>
  );
};
