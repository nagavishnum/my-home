import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
} from "docx";

export const exportExcel = (
  data: any[],
  filename = "finance"
) => {
  const ws = XLSX.utils.json_to_sheet(data);

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Finance"
  );

  XLSX.writeFile(
    wb,
    `${filename}.xlsx`
  );
};

export const exportPDF = (
  columns: string[],
  rows: any[],
  filename = "finance"
) => {
  const doc = new jsPDF();

  autoTable(doc, {
    head: [columns],
    body: rows,
    styles: {
      fontSize: 8,
    },
  });

  doc.save(`${filename}.pdf`);
};

export const exportDOC = async (
  columns: string[],
  rows: any[],
  filename = "finance"
) => {
  const tableRows = [
    new TableRow({
      children: columns.map(
        (c) =>
          new TableCell({
            children: [
              new Paragraph(c),
            ],
          })
      ),
    }),

    ...rows.map(
      (row) =>
        new TableRow({
          children: row.map(
            (cell: any) =>
              new TableCell({
                children: [
                  new Paragraph(
                    String(cell)
                  ),
                ],
              })
          ),
        })
    ),
  ];

  const doc = new Document({
    sections: [
      {
        children: [
          new Table({
            rows: tableRows,
          }),
        ],
      },
    ],
  });

  const blob =
    await Packer.toBlob(doc);

  saveAs(
    blob,
    `${filename}.docx`
  );
};