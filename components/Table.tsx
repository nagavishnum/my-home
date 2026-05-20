type Props = {
  head: string[];
  children: React.ReactNode;
  filterPanel?: React.ReactNode;
};

export default function Table({
  head,
  children,
  filterPanel
}: Props) {
  return (
    <div className='table-with-filters'>
      {filterPanel && <div className='table-filters-sidebar'>{filterPanel}</div>}
      <div className='table-wrapper' style={{ flex: 1 }}>
        <table className='table'>
          <thead>
            <tr>
              {head.map((item) => (
                <th key={item}>{item}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}