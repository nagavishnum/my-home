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
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)}>{col.label}</th>
            ))}
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row._id}>
              {columns.map((col) => (
                <td key={String(col.key)}>
                  {col.render
                    ? col.render(row)
                    : String(row[col.key] ?? "")}
                </td>
              ))}

              <td>
                <button onClick={() => onEditClick(row)}>Edit</button>
                <button onClick={() => onDeleteClick(row._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}