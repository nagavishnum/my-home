import { useGlobalApiLoading } from "@/lib/hooks";
import { Pencil, Trash } from "lucide-react";
import "../../app/globals.css";

export type Column<T> = {
  key: keyof T;
  label: string;
  render?: (row: T) => React.ReactNode;
};

type CommonTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  onEditClick: (row: T) => void;
  onDeleteClick: (id: string) => void;
};

export function CommonTable<T extends { _id: string }>({
  data,
  columns,
  onEditClick,
  onDeleteClick,
}: CommonTableProps<T>) {
  const isApiLoading = useGlobalApiLoading();

  const handleEdit = (row: T) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    onEditClick(row);
  };

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)}>
                {col.label}
              </th>
            ))}

            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {data?.map((row) => (
            <tr key={row._id}>
              {columns.map((col) => (
                <td key={String(col.key)}>
                  {col.render
                    ? col.render(row)
                    : String(row[col.key] ?? "")}
                </td>
              ))}

              <td>
                <div className="action-buttons">
                  <button
                    onClick={() => handleEdit(row)}
                    className="edit-btn"
                    disabled={isApiLoading}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() =>
                      onDeleteClick(row._id)
                    }
                    className="delete-btn"
                    disabled={isApiLoading}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}