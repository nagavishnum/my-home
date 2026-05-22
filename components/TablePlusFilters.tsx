export default function TablePlusFiltersLayout({
  isMobile,
  filtersPanel,
  tablePanel,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: 20,
        marginTop: 20,
      }}
    >
      <div className="table-filters-sidebar">
        {filtersPanel}
      </div>

      <div style={{ flex: 1 }}>
        {tablePanel}
      </div>
    </div>
  );
}