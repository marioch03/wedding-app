import ExcelJS from 'exceljs';
import type { CateringReportResponse } from '../../types/menu';
import { downloadWorkbook, autoFitColumnWidths } from './excelDownload';

/**
 * Normalizes a string for clean use in downloaded filenames.
 */
function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Builds and downloads a multi-sheet Excel (.xlsx) workbook for the maître & catering team.
 * - Sheet 1: Resumen Menús (Executive summary & counts)
 * - Sheet 2: Lista Completa (Nominal guest list with assigned menus & notes)
 * - Sheet 3: Alertas Cocina (Chef's priority list of allergies & special restrictions)
 */
export async function exportCateringToExcel(report: CateringReportResponse, eventName?: string): Promise<void> {
  const safeEventName = eventName && eventName !== 'ALL' ? eventName : 'Todos_los_Eventos';
  const today = new Date().toISOString().slice(0, 10);
  const fileName = `catering_${sanitizeFilename(safeEventName)}_${today}.xlsx`;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'WeddingApp';
  wb.created = new Date();

  // -------------------------------------------------------------
  // HOJA 1: RESUMEN DE MENÚS
  // -------------------------------------------------------------
  const wsSummary = wb.addWorksheet('Resumen Menús');
  wsSummary.addRow(['REPORTE EJECUTIVO DE CATERING Y MENÚS']);
  wsSummary.addRow(['Evento:', eventName && eventName !== 'ALL' ? eventName : 'Todos los eventos combinados']);
  wsSummary.addRow(['Fecha de Generación:', new Date().toLocaleDateString('es-ES', { dateStyle: 'long' })]);
  wsSummary.addRow(['Total Comensales Confirmados:', report.totalConfirmedAttendees]);
  wsSummary.addRow(['Comensales con Alergias / Notas Especiales:', report.attendeesWithDietaryAlertsCount]);
  wsSummary.addRow([]);
  wsSummary.addRow(['DESGLOSE DE MENÚS CONFIRMADOS']);
  wsSummary.addRow(['Menú / Opción', 'Tipo de Dieta', 'Comensales', 'Porcentaje (%)']);

  if (report.menuCounts.length === 0) {
    wsSummary.addRow(['Sin selecciones de menú registradas', '-', 0, '0%']);
  } else {
    report.menuCounts.forEach((mc) => {
      const percentage =
        report.totalConfirmedAttendees > 0
          ? `${Math.round((mc.count / report.totalConfirmedAttendees) * 100)}%`
          : '0%';
      wsSummary.addRow([mc.menuOptionName, mc.dietType, mc.count, percentage]);
    });
    wsSummary.addRow(['TOTAL', '', report.totalConfirmedAttendees, '100%']);
  }

  autoFitColumnWidths(wsSummary);

  // -------------------------------------------------------------
  // HOJA 2: LISTA COMPLETA DE COMENSALES
  // -------------------------------------------------------------
  const wsFullList = wb.addWorksheet('Lista Completa');
  wsFullList.addRow([
    'Nº',
    'Invitado',
    'Grupo / Familia',
    'Evento',
    'Menú Asignado',
    'Tipo de Dieta',
    'Alergias / Intolerancias',
    'Observaciones para Cocina',
  ]);

  if (report.allSelections.length === 0) {
    wsFullList.addRow(['-', 'Sin invitados confirmados', '-', '-', '-', '-', '-', '-']);
  } else {
    report.allSelections.forEach((s, idx) => {
      wsFullList.addRow([
        idx + 1,
        s.guestName,
        s.partyDisplayName,
        s.eventName,
        s.menuOptionName,
        s.dietType || 'STANDARD',
        s.dietaryRestrictions || 'Ninguna',
        s.specialNotes || '—',
      ]);
    });
  }

  autoFitColumnWidths(wsFullList);

  // -------------------------------------------------------------
  // HOJA 3: ALERTAS DE COCINA & ALÉRGENOS
  // -------------------------------------------------------------
  const wsAlerts = wb.addWorksheet('Alertas Cocina');
  wsAlerts.addRow([
    'Nº',
    'Invitado',
    'Grupo / Familia',
    'Evento',
    'Menú Asignado',
    'Alergias / Intolerancias',
    'Observaciones para Cocina',
  ]);

  if (report.attendeesWithDietaryAlerts.length === 0) {
    wsAlerts.addRow(['-', 'Sin requerimientos especiales ni alergias registradas', '-', '-', '-', '-', '-']);
  } else {
    report.attendeesWithDietaryAlerts.forEach((att, idx) => {
      wsAlerts.addRow([
        idx + 1,
        att.guestName,
        att.partyDisplayName,
        att.eventName,
        att.menuOptionName,
        att.dietaryRestrictions || 'Revisar notas',
        att.specialNotes || '—',
      ]);
    });
  }

  autoFitColumnWidths(wsAlerts);

  await downloadWorkbook(wb, fileName);
}

/**
 * Generates and downloads a clean UTF-8 CSV with semicolon delimiters (Excel-compatible).
 */
export function exportCateringToCsv(report: CateringReportResponse, eventName?: string): void {
  const safeEventName = eventName && eventName !== 'ALL' ? eventName : 'Todos_los_Eventos';
  const today = new Date().toISOString().slice(0, 10);
  const fileName = `catering_${sanitizeFilename(safeEventName)}_${today}.csv`;

  const rows: string[][] = [
    [
      'Nº',
      'Invitado',
      'Grupo / Familia',
      'Evento',
      'Menú Asignado',
      'Tipo de Dieta',
      'Alergias / Intolerancias',
      'Observaciones para Cocina',
    ],
  ];

  if (report.allSelections.length === 0) {
    rows.push(['-', 'Sin comensales confirmados', '-', '-', '-', '-', '-', '-']);
  } else {
    report.allSelections.forEach((s, idx) => {
      rows.push([
        String(idx + 1),
        s.guestName,
        s.partyDisplayName,
        s.eventName,
        s.menuOptionName,
        s.dietType || 'STANDARD',
        s.dietaryRestrictions || 'Ninguna',
        s.specialNotes || '—',
      ]);
    });
  }

  const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const csvContent = rows.map((r) => r.map(escapeCsv).join(';')).join('\r\n');

  // UTF-8 BOM (\uFEFF) ensures Excel opens special characters (ñ, á, é...) properly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
