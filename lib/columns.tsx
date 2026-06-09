import { Todo } from "./types";
import {
  Column,
} from "../components/CommonTable";
import { getPriorityIcon } from "./helpers";

export const todoColumns: Column<Todo>[] =
  [
    {
      key: "t",
      label: "Task",
    },
        {
      key: "p",
      label: "Priority",
      render: (row) =>     getPriorityIcon(row.p),

    },
{
  key: "da",
  label: "Date",
  render: (row) => {
    const rowDate = new Date(row.da);
    const today = new Date();

    // Remove time portion
    rowDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const isToday = rowDate.getTime() === today.getTime();
    const isOverdue = rowDate < today;
    const isFuture = rowDate > today;

    let style = {
      padding: "4px 10px",
      borderRadius: 8,
      fontWeight: 500,
      background: "transparent",
      color: "#374151",
      border: "none",
    };

    if (isToday) {
      style = {
        ...style,
        fontWeight: 700,
        background: "#dbeafe",
        color: "#1d4ed8",
        border: "1px solid #2563eb",
      };
    } else if (isOverdue) {
      style = {
        ...style,
        fontWeight: 700,
        background: "#fee2e2",
        color: "#dc2626",
        border: "1px solid #ef4444",
      };
    } else if (isFuture) {
      style = {
        ...style,
        background: "#f3f4f6",
        color: "#4b5563",
        border: "1px solid #4b5563"
      };
    }

    return (
      <span style={style}>
        {rowDate.toLocaleDateString()}
      </span>
    );
  },
},

  ];