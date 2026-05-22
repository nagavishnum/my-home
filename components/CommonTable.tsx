export const CommonTable = ({
  data,
  columns,
  onEditClick,
  onDeleteClick,
}) => {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row._id}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render
                    ? col.render(row)
                    : row[col.key]}
                </td>
              ))}

              <td>
                <button onClick={() => onEditClick(row)}>
                  Edit
                </button>

                <button
                  className="btn-danger"
                  onClick={() => onDeleteClick(row._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};