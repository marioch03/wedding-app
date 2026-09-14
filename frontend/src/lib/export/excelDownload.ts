import ExcelJS from 'exceljs';

/**
 * Downloads an ExcelJS workbook in the browser as an .xlsx file.
 */
export async function downloadWorkbook(workbook: ExcelJS.Workbook, fileName: string): Promise<void> {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Adjusts column widths based on cell text lengths with minimum and maximum caps.
 */
export function autoFitColumnWidths(sheet: ExcelJS.Worksheet, maxCap = 50): void {
  sheet.columns.forEach((col) => {
    let maxLength = 10;
    col.eachCell?.({ includeEmpty: true }, (cell) => {
      const val = cell.value !== undefined && cell.value !== null ? String(cell.value) : '';
      if (val.length > maxLength) {
        maxLength = Math.min(val.length + 3, maxCap);
      }
    });
    col.width = maxLength;
  });
}
