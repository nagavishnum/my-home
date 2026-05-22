'use client';

import React from "react";

type Props = {
  isMobile: boolean;
  filtersPanel: React.ReactNode;
  tablePanel: React.ReactNode;
};

export default function TablePlusFiltersLayout({
  isMobile,
  filtersPanel,
  tablePanel,
}: Props) {
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