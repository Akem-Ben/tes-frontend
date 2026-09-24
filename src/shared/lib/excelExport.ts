import * as XLSX from "xlsx";
import { downloadBlob } from "./download";

export interface ExportSheet {
  name: string;
  rows: Array<Record<string, string | number>>;
}

/**
 * Builds an .xlsx workbook client-side and downloads it. There is no backend yet,
 * so - unlike a typical server-rendered export - the workbook is generated entirely
 * in the browser from whatever rows the caller has already fetched.
 */
export const exportToExcel = (
  sheets: ExportSheet[],
  filename: string,
): void => {
  const workbook = XLSX.utils.book_new();
  sheets.forEach((sheet) => {
    const worksheet = XLSX.utils.json_to_sheet(sheet.rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.slice(0, 31));
  });
  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  }) as ArrayBuffer;
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  downloadBlob(
    blob,
    filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`,
  );
};
