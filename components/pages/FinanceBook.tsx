"use client";

import { useEffect, useRef, useState, useCallback } from "react";

import { api } from "@/lib/api";
import { Finance, Category, PaginatedResponse } from "@/lib/types";
import { formatAmount, today } from "@/lib/helpers";
import { useGlobalApiLoading, useMediaQuery } from "@/lib/hooks";
import { exportPDF } from "@/lib/export";

import Loader from "../common/Loader";
import CategoriesModal from "./CategoriesModel";
import { FinanceForm } from "../forms/FinanceForm";
import { DeleteIcon, EditIcon } from "lucide-react";
import "../dashboard/sections/financesection.css";

const initial = {
  n: "",
  a: "",
  sv: "",
  c: "",
  ty: "Monthly",
  md: today(),
  lp: "",
  rt: "",
  cv: "",
  no: "",
};

export const FINANCE_BUCKET_STYLES = {
  INVESTMENTS_BUCKET: {
    label: "Investments",
    color: "#16a34a",
    background: "#f0fdf4",
  },
  RETIREMENT_BUCKET: {
    label: "Retirement",
    color: "#15803d",
    background: "#f0fdf4",
  },
  GOALS_BUCKET: {
    label: "Goal-based funds",
    color: "#7c3aed",
    background: "#f5f3ff",
  },
  LIQUID_ASSETS_BUCKET: {
    label: "Liquid assets",
    color: "#2563eb",
    background: "#eff6ff",
  },
  REAL_ASSETS_BUCKET: {
    label: "Physical assets",
    color: "#d97706",
    background: "#fffbeb",
  },
  RECEIVABLES_BUCKET: {
    label: "Receivables",
    color: "#0d9488",
    background: "#f0fdfa",
  },
  INSURANCE_BUCKET: {
    label: "Insurance",
    color: "#4f46e5",
    background: "#eef2ff",
  },
  LIABILITY_BUCKET: {
    label: "Liabilities",
    color: "#dc2626",
    background: "#fef2f2",
  },
  COMMITMENTS_BUCKET: {
    label: "Commitments",
    color: "#ea580c",
    background: "#fff7ed",
  },
  OTHER_BUCKET: {
    label: "Other",
    color: "#6b7280",
    background: "#f9fafb",
  },
} as const;

export const FINANCE_BUCKETS = {
  ASSETS_BUCKET: [
    "ASSETS",
    "INVESTMENTS",
    "RETIREMENT F",
    "CHILD EDUC F",
    "ENTERTAINEMENT F",
    "CASH",
    "SAVINGS",
    "EMERGENCY F",
    "LENT",
    "GIFTS F",
    "OTHER",
    "HEALTH F",
  ],
  INVESTMENTS_BUCKET: [
    "INVESTMENTS",
    "RETIREMENT F",
    "CHILD EDUC F",
    "ENTERTAINEMENT F",
    "LENT",
  ],
  LIQUID_ASSETS_BUCKET: ["CASH", "SAVINGS", "EMERGENCY F"],
  REAL_ASSETS_BUCKET: ["ASSETS"],
  RETIREMENT_BUCKET: ["RETIREMENT F"],
  GOALS_BUCKET: ["CHILD EDUC F", "ENTERTAINEMENT F", "GIFTS F"],
  INSURANCE_BUCKET: ["HEALTH I", "LIFE I", "TERM I"],
  RECEIVABLES_BUCKET: ["LENT"],
  LIABILITY_BUCKET: ["LOAN"],
  COMMITMENTS_BUCKET: ["EMI"],
  OTHER_BUCKET: ["OTHER"],
  TARGET_RELATED_BUCKET: ["ASSETS", "INVESTMENTS", "SAVINGS", "LENT"],
} as const;

const FINANCE_CATEGORY_ORDER = [
  "INVESTMENTS",
  "RETIREMENT F",
  "CHILD EDUC F",
  "ENTERTAINEMENT F",
  "GIFTS F",
  "EMERGENCY F",
  "SAVINGS",
  "CASH",
  "ASSETS",
  "LENT",
  "HEALTH F",
  "HEALTH I",
  "LIFE I",
  "TERM I",
  "LOAN",
  "EMI",
  "OTHER",
];

const normalizeCategory = (category: string) => category.trim().toUpperCase();

const getBucket = (category: string): keyof typeof FINANCE_BUCKET_STYLES => {
  const name = normalizeCategory(category);

  if ((FINANCE_BUCKETS.INSURANCE_BUCKET as readonly string[]).includes(name)) {
    return "INSURANCE_BUCKET";
  }

  if ((FINANCE_BUCKETS.LIABILITY_BUCKET as readonly string[]).includes(name)) {
    return "LIABILITY_BUCKET";
  }

  if (
    (FINANCE_BUCKETS.COMMITMENTS_BUCKET as readonly string[]).includes(name)
  ) {
    return "COMMITMENTS_BUCKET";
  }

  if ((FINANCE_BUCKETS.RETIREMENT_BUCKET as readonly string[]).includes(name)) {
    return "RETIREMENT_BUCKET";
  }

  if ((FINANCE_BUCKETS.GOALS_BUCKET as readonly string[]).includes(name)) {
    return "GOALS_BUCKET";
  }

  if (
    (FINANCE_BUCKETS.LIQUID_ASSETS_BUCKET as readonly string[]).includes(name)
  ) {
    return "LIQUID_ASSETS_BUCKET";
  }

  if (
    (FINANCE_BUCKETS.REAL_ASSETS_BUCKET as readonly string[]).includes(name)
  ) {
    return "REAL_ASSETS_BUCKET";
  }

  if (
    (FINANCE_BUCKETS.RECEIVABLES_BUCKET as readonly string[]).includes(name)
  ) {
    return "RECEIVABLES_BUCKET";
  }

  if (
    (FINANCE_BUCKETS.INVESTMENTS_BUCKET as readonly string[]).includes(name)
  ) {
    return "INVESTMENTS_BUCKET";
  }

  return "OTHER_BUCKET";
};

const getCategoryColor = (category: string): string =>
  FINANCE_BUCKET_STYLES[getBucket(category)]?.color ?? "#6b7280";

const getCategoryBackground = (category: string): string =>
  FINANCE_BUCKET_STYLES[getBucket(category)]?.background ?? "#f9fafb";

export default function FinanceBook() {
  const [data, setData] = useState<Finance[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState(initial);

  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [addFinanceModel, setAddFinanceModel] = useState(false);

  const isApiLoading = useGlobalApiLoading();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const load = useCallback(async () => {
    setError(null);

    try {
      const [f, c] = await Promise.all([
        api.get<PaginatedResponse<Finance>>("/finance?limit=200"),
        api.get<Category[]>("/categories/finance"),
      ]);

      setData(f.data.data);
      setCats(c.data);
    } catch {
      setError("Failed to load finance data");
    }
  }, []);

  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    load();
  }, [load]);

  const submit = async () => {
    setError(null);

    if (!form.n.trim() || !form.a || !form.c || !form.ty || !form.md) {
      alert("Please fill required fields");
      return;
    }

    try {
      const payload = {
        n: form.n.trim(),
        a: Number(form.a),
        sv: form.ty === "Monthly" ? Number(form.sv) || 0 : 0,
        c: form.c,
        ty: form.ty,
        md: form.md,
        lp: Number(form.lp) || 0,
        rt: Number(form.rt) || 0,
        cv: Number(form.cv) || Number(form.a),
        no: form.no.trim(),
      };

      if (editingId) {
        const res = await api.put(`/finance/${editingId}`, payload);

        setData((prev) =>
          prev.map((item) => (item._id === editingId ? res.data : item)),
        );

        setEditingId(null);
      } else {
        const res = await api.post("/finance", payload);
        setData((prev) => [res.data, ...prev]);
      }

      setForm(initial);
      setAddFinanceModel(false);
    } catch {
      setError("Failed to save finance item");
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/finance/${id}`);

      setData((prev) => prev.filter((item) => item._id !== id));
    } catch {
      setError("Failed to delete finance item");
    }
  };

  const set = (key: string, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleFormModelClose = () => {
    setForm(initial);
    setEditingId(null);
    setAddFinanceModel(false);
  };

  const handleEditClick = (row: Finance) => {
    setForm({
      n: row.n,
      a: String(row.a),
      sv: String(row.sv ?? ""),
      c: row.c
        ? typeof row.c === "string"
          ? row.c
          : ((row.c as Category)._id ?? "")
        : "",
      ty: row.ty,
      md: row.md ? row.md.slice(0, 10) : "",
      lp: String(row.lp ?? ""),
      rt: String(row.rt ?? ""),
      cv: String(row.cv ?? ""),
      no: row.no ?? "",
    });

    setEditingId(row._id);
    setAddFinanceModel(true);
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setForm(initial);
    setAddFinanceModel(false);
  };

  const getCategoryId = (row: Finance) =>
    typeof row.c === "string" ? row.c : (row.c?._id ?? "");

  const getCategoryName = (row: Finance): string => {
    if (typeof row.c === "string") {
      return row.c;
    }

    return row.c?.n ?? "Uncategorized";
  };

  const categoryGroups = cats
    .map((category) => ({
      id: category._id,
      name: category.n,
      items: data.filter(
        (row) =>
          getCategoryId(row) === category._id ||
          getCategoryName(row) === category.n,
      ),
    }))
    .filter((group) => group.items.length > 0);

  const uncategorizedItems = data.filter(
    (row) =>
      !categoryGroups.some((group) =>
        group.items.some((item) => item._id === row._id),
      ),
  );

  if (uncategorizedItems.length > 0) {
    categoryGroups.push({
      id: "uncategorized",
      name: "Uncategorized",
      items: uncategorizedItems,
    });
  }

  categoryGroups.sort((a, b) => {
    const aName = normalizeCategory(a.name);
    const bName = normalizeCategory(b.name);

    const aIndex = FINANCE_CATEGORY_ORDER.indexOf(aName);
    const bIndex = FINANCE_CATEGORY_ORDER.indexOf(bName);

    const aRank = aIndex === -1 ? Infinity : aIndex;
    const bRank = bIndex === -1 ? Infinity : bIndex;

    if (aRank !== bRank) return aRank - bRank;
    return aName.localeCompare(bName);
  });

  const exportData = data.map((row) => ({
    Name: row.n,
    Category: getCategoryName(row),
    "Total Invested": row.a,
    "Current Value": row.cv || row.a,
    Type: row.ty,
    "Monthly SIP": row.ty === "Monthly" ? row.sv : "-",
    Returns: row.rt ? `${row.rt}%` : "-",
  }));

  const exportColumns = Object.keys(
    exportData[0] || {
      Name: "",
      Category: "",
      "Total Invested": "",
      "Current Value": "",
      Type: "",
      "Monthly SIP": "",
      Returns: "",
    },
  );

  const exportRows = exportData.map((row) => Object.values(row));
const lastTapRef = useRef<number>(0);

const handleDoubleTap = useCallback(
  (row: Finance) => {
    const now = Date.now();

    if (now - lastTapRef.current < 300) {
      handleEditClick(row);
      lastTapRef.current = 0;
      return;
    }

    lastTapRef.current = now;
  },
  [handleEditClick],
);
  if (isApiLoading) return <Loader />;

  return (
    <div className="finance-book">
      <style jsx>{`
        .finance-book {
          width: 100%;
          min-width: 0;
        }

        .finance-toolbar {
          display: flex;
          justify-content: flex-end;
        }

.finance-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: start;
  gap: 5px;
  width: 100%;
  min-width: 0;
}
        .finance-card {
          min-width: 0;
          overflow-x: auto;
          border: 1px solid var(--border-color, #dedede);
          border-radius: 8px;
          padding: 2px;
          background: var(--card-background, #fff);
        }

        .finance-card-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 9px 8px;
          border-bottom: 1px solid var(--border-color, #e5e5e5);
          border-top: 3px solid var(--category-color, #6b7280);
          background: var(--category-background, #f9fafb);
        }

        .finance-card-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--category-color, #6b7280);
          overflow-wrap: anywhere;
          margin: 0;
        }

        .finance-count {
          font-size: 12px;
          opacity: 0.75;
          white-space: nowrap;
        }

        .finance-table {
          width: 100%;
          min-width: 0;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 13px;
        }

        .finance-table th {
          text-align: left;
          font-size: 10px;
          font-weight: 600;
          padding: 4px 3px 6px;
          white-space: normal;
          overflow-wrap: anywhere;
        }

        .finance-table td {
          padding: 6px 3px;
          border-bottom: 1px solid var(--border-color, #eee);
          vertical-align: middle;
        }

        .finance-name {
          font-weight: 600;
          overflow-wrap: anywhere;
          min-width: 0;
          font-size: 16px;
          white-space: normal;
        }

        .finance-actions {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 3px;
          min-width: 0;
          white-space: nowrap;
        }

        .finance-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 5px;
          font-size: 15px;
          line-height: 1.2;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .finance-number {
          font-weight: 500;
          font-size: 17px;
          white-space: nowrap;
        }

        .finance-type {
          display: inline-block;
          border: 1px solid var(--border-color, #ddd);
          border-radius: 4px;
          padding: 2px 4px;
          font-size: 10px;
          white-space: nowrap;
        }

        .finance-empty {
          padding: 14px 0;
          font-size: 13px;
          opacity: 0.75;
        }
          .financial-total {
            font-weight: 600;
          }

        @media (max-width: 1100px) {
          .finance-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 768px) {
          .finance-grid {
            grid-template-columns: 1fr !important;
          }

          .finance-card {
            width: 100%;
            min-width: 0;
            box-sizing: border-box;
          }
          .finance-number {
            font-size: 10px;
          }
          .finance-name {
            font-size: 10px;
            font-weight: 300;
          }
          .finance-action {
            font-size: 8px;
          }
        }
        @media (max-width: 640px) {
          .finance-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .finance-card {
            padding: 9px;
          }

          .finance-card-heading {
            margin: -9px -9px 8px;
          }

          .finance-table {
            font-size: 10px;
          }

          .finance-table th {
            font-size: 9px;
            padding-left: 3px;
            padding-right: 3px;
          }

          .finance-table td {
            padding: 7px 3px;
          }

          .finance-action {
            padding: 5px 6px;
            font-size: 11px;
          }
        }
      `}</style>

      {error && <p className="error">{error}</p>}

      {showCategories && (
        <CategoriesModal
          type="finance"
          categories={cats}
          onCategoriesChange={setCats}
          reload={load}
          onClose={() => setShowCategories(false)}
        />
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 3,
        }}
      >
        <button
          className="btn-view"
          onClick={() => setShowCategories(true)}
          style={{ marginRight: 8 }}
          disabled={isApiLoading}
        >
          View Categories
        </button>
        <button
          className="btn-add"
          onClick={() => setAddFinanceModel(true)}
          disabled={isApiLoading}
        >
          Add Finance
        </button>
        <button
          className="btn-view"
          onClick={() => exportPDF(exportColumns, exportRows, "finance")}
        >
          Export PDF
        </button>
      </div>

      {addFinanceModel && (
        <div className="modal-overlay" onClick={handleFormModelClose}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? "Edit Finance" : "Add Finance"}</h3>
            </div>

            <FinanceForm
              form={form}
              submit={submit}
              cats={cats}
              editingId={editingId}
              set={set}
              onCancelEdit={onCancelEdit}
            />
          </div>
        </div>
      )}

      {categoryGroups.length === 0 ? (
        <p className="finance-empty">No finance records found.</p>
      ) : (
        <div
          className="finance-grid"
          style={
            {
              "--finance-columns": data.length > 6 ? 2 : 3,
            } as React.CSSProperties
          }
        >
          {categoryGroups.map((group) => (
            <section
              key={group.id}
              style={
                {
                  "--category-color": getCategoryColor(group.name),
                  "--category-background": getCategoryBackground(group.name),
                } as React.CSSProperties
              }
            >
              <div className="finance-card-heading">
                <h3 className="finance-card-title">{group.name}</h3>

                <span className="finance-count">{group.items.length} </span>
              </div>

              <table className="finance-table">
                <colgroup>
                  <col style={{ width: "40%" }} />
                  {/* <col style={{ width: "15%" }} /> */}
                  <col style={{ width: "25%" }} />
                  {/* <col style={{ width: "15%" }} /> */}
                  <col style={{ width: "25%" }} />
                  <col style={{ width: "10%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Name</th>
                    {/* <th>Invested</th> */}
                    <th>Current</th>
                    {/* <th>Returns</th> */}
                    <th>Type</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {group.items.map((row) => (
                    <tr key={row._id}>
                      <td className="finance-name"              onTouchEnd={() => handleDoubleTap(row)}
  onDoubleClick={() => handleEditClick(row)}>{row.n}</td>

                      {/* <td className="finance-number">{formatAmount(row.a)}</td> */}

                      <td className="finance-number">
                        {formatAmount(row.cv || row.a)}
                      </td>

                      {/* <td className="finance-number">
                        {row.rt != null ? `${row.rt}%` : "-"}
                      </td> */}

                      <td>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: 3,
                          }}
                        >
                          {row.ty === "OneTime" && (
                            <span className="finance-type">OneTime</span>
                          )}

                          {row.ty === "Monthly" && (
                            <span className="finance-number">
                              {formatAmount(row.sv)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="finance-actions">
                       
                            <DeleteIcon   style={{ color: "red", stroke: "red", cursor: "pointer" }}
 onClick={() => remove(row._id)} size={isMobile ? 7 : 17} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {/* Total row */}
<tr className="finance-total-row">
  <td className="finance-name" style={{color:getCategoryColor(group.name)}}>Total</td>

  <td className="finance-number financial-total">
    {formatAmount(
      group.items.reduce((sum, row) => sum + (Number(row.a) || 0), 0)
    )}
  </td>

  <td className="finance-number financial-total">
    {formatAmount(
      group.items.reduce(
        (sum, row) => sum + (Number(row.cv ?? row.a) || 0),
        0
      )
    )}
  </td>

  <td className="finance-number">-</td>


</tr>
                </tbody>
              </table>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
