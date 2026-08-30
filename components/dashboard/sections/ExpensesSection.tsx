"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Category, ExpenseSummaryData } from "@/lib/types";

import { EXPENSE_BUCKETS, EXPENSE_BUCKET_STYLES } from "@/lib/constants";
import { ExpensesForm } from "@/components/forms/ExpensesForm";
import { api } from "@/lib/api";
import { today } from "@/lib/helpers";

type ExpenseBucket = keyof typeof EXPENSE_BUCKETS;

type Props = {
  expenseSummaryData: ExpenseSummaryData | null;
  postExpensesData: (payload: {
    a: number;
    c: string;
    d: string;
  }) => Promise<void>;
};
const initial = {
  a: "",
  c: "",
  d: today(),
};
export default function ExpensesSection({
  expenseSummaryData,
  postExpensesData,
}: Readonly<Props>) {
  const [windowWidth, setWindowWidth] = useState(1200);
  const [addExpenseModel, setAddExpenseModel] = useState(false);
  const [form, setForm] = useState(initial);
  const [cats, setCats] = useState<Category[]>([]);
  const load = useCallback(async () => {
    try {
      const c = await api.get<Category[]>("/categories/expense");
      setCats(c.data);
    } catch {
      console.error("Failed to load categories");
    }
  }, []);

  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    load();
  }, [load]);

  useEffect(() => {
    const updateWidth = () => {
      setWindowWidth(window.innerWidth);
    };

    updateWidth();

    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const isMobile = windowWidth < 740;

  const getBucket = (category: string): ExpenseBucket => {
    const bucketKeys = Object.keys(EXPENSE_BUCKETS) as ExpenseBucket[];

    const matchingBucket = bucketKeys.find((bucket) =>
      EXPENSE_BUCKETS[bucket].includes(category),
    );

    return matchingBucket ?? "OTHER_BUCKET";
  };

  const getCategoryColor = (category: string): string => {
    const bucket = getBucket(category);

    return EXPENSE_BUCKET_STYLES[bucket]?.color ?? "#6b7280";
  };

  const categories = useMemo(() => {
    const allCategories = [
      ...new Set(
        expenseSummaryData?.months?.flatMap((month) =>
          month.c.map((category) => category.n),
        ) ?? [],
      ),
    ];

    const bucketOrder: ExpenseBucket[] = [
      "ESSENTIAL_BUCKET",
      "AVOID_BUCKET",
      "ASSET_BUCKET",
      "OTHER_BUCKET",
    ];

    return allCategories.sort((a, b) => {
      const bucketA = bucketOrder.indexOf(getBucket(a));

      const bucketB = bucketOrder.indexOf(getBucket(b));

      return bucketA - bucketB;
    });
  }, [expenseSummaryData]);

  const getAmount = (
    month: ExpenseSummaryData["months"][number],
    category: string,
  ): number => {
    return month.c.find((item) => item.n === category)?.a ?? 0;
  };

  const getCategoryMax = (category: string): number => {
    const amounts =
      expenseSummaryData?.months?.map((month) => getAmount(month, category)) ??
      [];

    return amounts.length ? Math.max(...amounts) : 0;
  };

  const handleExpenseModel = () => {
    setAddExpenseModel((prev) => !prev);
  };
  const lastTapRef = useRef(0);

  const handleDoubleTap = () => {
    const now = Date.now();

    if (now - lastTapRef.current < 300) {
      handleExpenseModel();
    }

    lastTapRef.current = now;
  };
  const submit = async () => {
    if (!form.a || !form.c || !form.d) {
      alert("Please fill all fields");
      return;
    }

    try {
      const payload = {
        a: Number(form.a),
        c: form.c,
        d: form.d,
      };
      await postExpensesData(payload);
      setAddExpenseModel(false);
      setForm(initial);
    } catch {
      console.error("Failed to save expense");
    }
  };
  return (
    <div className="dash-section" id="expenses-section">
      {!expenseSummaryData?.months?.length ? (
        <p>No expenses found</p>
      ) : (
        <div
          style={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",

              minWidth: isMobile ? "900px" : "100%",

              borderCollapse: "collapse",
            }}
            onTouchEnd={handleDoubleTap}
            onDoubleClick={() => {
              handleExpenseModel();
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    padding: "8px 10px",

                    textAlign: "left",

                    position: "sticky",

                    left: 0,
                    whiteSpace: "nowrap",
                    background: "inherit",
                    width: "1px",
                    zIndex: 2,
                  }}
                >
                  Category
                </th>

                {expenseSummaryData.months.map((month) => (
                  <th
                    key={month.m}
                    style={{
                      padding: "8px 10px",

                      textAlign: "right",

                      whiteSpace: "nowrap",
                    }}
                  >
                    {month.m}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => {
                const bucket = getBucket(category);

                const bucketStyle = EXPENSE_BUCKET_STYLES[bucket];

                const maxAmount = getCategoryMax(category);

                return (
                  <tr
                    key={category}
                    style={{
                      borderTop: "1px solid rgba(128,128,128,0.12)",
                    }}
                  >
                    <td
                      style={{
                        width: "1px",
                        padding: "7px 10px",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        position: "sticky",
                        left: 0,
                        background: "inherit",
                        zIndex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",

                          alignItems: "center",

                          gap: 7,
                        }}
                      >
                        <span
                          title={bucketStyle.label}
                          style={{
                            width: 8,

                            height: 8,

                            minWidth: 8,

                            borderRadius: "50%",

                            background: getCategoryColor(category),

                            display: "inline-block",
                          }}
                        />

                        {category}
                      </div>
                    </td>
                    {expenseSummaryData.months.map((month) => {
                      const amount = getAmount(month, category);

                      const isHighest = amount > 0 && amount === maxAmount;

                      return (
                        <td
                          key={month.m}
                          style={{
                            padding: "7px 10px",

                            textAlign: "right",

                            whiteSpace: "nowrap",

                            fontVariantNumeric: "tabular-nums",

                            fontWeight: isHighest ? 700 : 400,

                            color: isHighest ? bucketStyle.color : "inherit",

                            background: isHighest
                              ? `${bucketStyle.color}12`
                              : "transparent",

                            borderRadius: isHighest ? 4 : undefined,
                          }}
                        >
                          {amount > 0
                            ? `₹${amount.toLocaleString("en-IN")}`
                            : "—"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              <tr
                style={{
                  borderTop: "2px solid currentColor",

                  fontWeight: 700,
                }}
              >
                <td
                  style={{
                    padding: "8px 10px",

                    position: "sticky",

                    left: 0,

                    background: "inherit",

                    zIndex: 1,
                  }}
                >
                  Total
                </td>

                {expenseSummaryData.months.map((month) => (
                  <td
                    key={month.m}
                    style={{
                      padding: "8px 10px",

                      textAlign: "right",

                      whiteSpace: "nowrap",

                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    ₹{month.t.toLocaleString("en-IN")}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          {addExpenseModel && (
            <div className="modal-overlay" onClick={handleExpenseModel}>
              <div
                className="modal-container"
                onClick={(e) => e.stopPropagation()}
              >
                <ExpensesForm
                  form={form}
                  setForm={setForm}
                  submit={submit}
                  cats={cats}
                  editingId={null}
                  onCancelEdit={() => null}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
