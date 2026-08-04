import { AlertTriangle, CircleAlert, MinusCircle, ShieldAlert } from "lucide-react";

export const today = () => {
  const d = new Date();

  d.setMinutes(
    d.getMinutes() - d.getTimezoneOffset()
  );

  return d.toISOString().split('T')[0];
};
export const yesterday = () => {
  const d = new Date();

  d.setDate(d.getDate() - 1);

  d.setMinutes(
    d.getMinutes() - d.getTimezoneOffset()
  );

  return d.toISOString().split('T')[0];
};
export const tomorrow = () => {
  const d = new Date();

  d.setDate(d.getDate() + 1);

  d.setMinutes(
    d.getMinutes() - d.getTimezoneOffset()
  );

  return d.toISOString().split('T')[0];
};

export const scrollToView = (id: string) => {
  const el = document.getElementById(id);

  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};
export const getPriorityIcon = (
  priority: string
) => {
  switch (priority?.toLowerCase()) {
    // CRITICAL / MUST DO
    case "mandatory":
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "#7f1d1d",
            border: "2px solid #dc2626",
            boxShadow:
              "0 0 10px rgba(220,38,38,0.45)",
          }}
        >
          <ShieldAlert
            size={18}
            color="#ffffff"
            strokeWidth={3}
          />
        </div>
      );

    // IMPORTANT / HIGH ATTENTION
    case "high":
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "#ffedd5",
            border: "2px solid #ea580c",
          }}
        >
          <AlertTriangle
            size={18}
            color="#c2410c"
            strokeWidth={2.8}
          />
        </div>
      );

    // NORMAL PRIORITY
    case "medium":
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 8,
            background: "#fef9c3",
            border: "1.5px solid #ca8a04",
          }}
        >
          <CircleAlert
            size={18}
            color="#a16207"
            strokeWidth={2.5}
          />
        </div>
      );

    // LOW PRIORITY
    case "low":
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 8,
            background: "#dcfce7",
            border: "1px solid #16a34a",
            opacity: 0.75,
          }}
        >
          <MinusCircle
            size={18}
            color="#15803d"
            strokeWidth={2}
          />
        </div>
      );

    default:
      return priority;
  }
};
import {
  TimerReset,
  Hourglass,
} from "lucide-react";

export const getStatusIcon = (
  status: string
) => {
  switch (status?.toLowerCase()) {
    case "inprogress":
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "#dbeafe",
            border: "2px solid #2563eb",
            boxShadow:
              "0 0 8px rgba(37,99,235,0.25)",
          }}
        >
          <TimerReset
            size={18}
            color="#1d4ed8"
            strokeWidth={2.8}
          />
        </div>
      );

    case "pending":
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 8,
            background: "#f3f4f6",
            border: "1.5px solid #6b7280",
          }}
        >
          <Hourglass
            size={18}
            color="#4b5563"
            strokeWidth={2.5}
          />
        </div>
      );

    default:
      return status;
  }
};
import {
  Wallet,
  HeartPulse,
  ShoppingBasket,
} from "lucide-react";

export const getGoalsCategoryIcon = (
  category: string
) => {
  switch (category?.toLowerCase()) {
    case "finance":
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "#dcfce7",
            border: "2px solid #16a34a",
          }}
        >
          <Wallet
            size={18}
            color="#15803d"
            strokeWidth={2.5}
          />
        </div>
      );

    case "health":
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "#fee2e2",
            border: "2px solid #dc2626",
            boxShadow:
              "0 0 8px rgba(220,38,38,0.25)",
          }}
        >
          <HeartPulse
            size={18}
            color="#b91c1c"
            strokeWidth={2.5}
          />
        </div>
      );

    case "needs":
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 8,
            background: "#dbeafe",
            border: "2px solid #2563eb",
          }}
        >
          <ShoppingBasket
            size={18}
            color="#1d4ed8"
            strokeWidth={2.5}
          />
        </div>
      );

    default:
      return category;
  }
};
