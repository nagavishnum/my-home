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

    const isToday =
      rowDate.toDateString() ===
      today.toDateString();

    return (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: 8,
          fontWeight: isToday ? 700 : 500,
          background: isToday
            ? "#dbeafe"
            : "transparent",
          color: isToday
            ? "#1d4ed8"
            : "#374151",
          border: isToday
            ? "1px solid #2563eb"
            : "none",
        }}
      >
        {rowDate.toLocaleDateString()}
      </span>
    );
  },
},

  ];