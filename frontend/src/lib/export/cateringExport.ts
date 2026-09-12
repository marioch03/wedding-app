import * as XLSX from 'xlsx';
import type { CateringReportResponse } from '../../types/menu';

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
 * Calculates appropriate column widths based on maximum cell content length.
 */
function calculateColumnWidths(data: (string | number | undefined | null)[][]): { wch: number }[] {
  const maxCols = data.reduce((max, row) => Math.max(max, row.length), 0);
  const colWidths: number[] = new Array(maxCols).fill(10);

  data.forEach((row) => {
    row.forEach((cell, colIndex) => {
      const cellLength = cell !== undefined && cell !== null ? String(cell).length : 0;
      if (cellLength > colWidths[colIndex]) {
        colWidths[colIndex] = Math.min(cellLength + 3, 50); // Cap at 50 chars for readability
      }
    });
  });

  return colWidths.map((wch) => ({ wch }));
}

/**
 * Builds and downloads a multi-sheet Excel (.xlsx) workbook for the maître & catering team.
 * - Sheet 1: Resumen de Menús (Executive summary & counts)
 * - Sheet 2: Lista Completa (Nominal guest list with assigned menus & notes)
 * - Sheet 3: Alertas de Cocina (Chef's priority list of allergies & special restrictions)
 */
export function exportCateringToExcel(report: CateringReportResponse, eventName?: string): void {
  const safeEventName = eventName && eventName !== 'ALL' ? eventName : 'Todos_los_Eventos';
  const today = new Date().toISOString().slice(0, 10);
  const fileName = `catering_${sanitizeFilename(safeEventName)}_${today}.xlsx`;

  const wb = XLSX.utils.book_new();

  // -------------------------------------------------------------
  // HOJA 1: RESUMEN DE MENÚS
  // -------------------------------------------------------------
  const summaryAoa: (string | number)[][] = [
    ['REPORTE EJECUTIVO DE CATERING Y MENÚS'],
    ['Evento:', eventName && eventName !== 'ALL' ? eventName : 'Todos los eventos combinados'],
    ['Fecha de Generación:', new Date().toLocaleDateString('es-ES', { dateStyle: 'long' })],
    ['Total Comensales Confirmados:', report.totalConfirmedAttendees],
    ['Comensales con Alergias / Notas Especiales:', report.attendeesWithDietaryAlertsCount],
    [],
    ['DESGLOSE DE MENÚS CONFIRMADOS'],
    ['Menú / Opción', 'Tipo de Dieta', 'Comensales', 'Porcentaje (%)'],
  ];

  if (report.menuCounts.length === 0) {
    summaryAoa.push(['Sin selecciones de menú registradas', '-', 0, '0%']);
  } else {
    report.menuCounts.forEach((mc) => {
      const percentage =
        report.totalConfirmedAttendees > 0
          ? `${Math.round((mc.count / report.totalConfirmedAttendees) * 100)}%`
          : '0%';
      summaryAoa.push([mc.menuOptionName, mc.dietType, mc.count, percentage]);
    });
    summaryAoa.push(['TOTAL', '', report.totalConfirmedAttendees, '100%']);
  }

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryAoa);
  wsSummary['!cols'] = calculateColumnWidths(summaryAoa);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen Menús');

  // -------------------------------------------------------------
  // HOJA 2: LISTA COMPLETA DE COMENSALES
  // -------------------------------------------------------------
  const fullListAoa: (string | number)[][] = [
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
    fullListAoa.push(['-', 'Sin invitados confirmados', '-', '-', '-', '-', '-', '-']);
  } else {
    report.allSelections.forEach((s, idx) => {
      fullListAoa.push([
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

  const wsFullList = XLSX.utils.aoa_to_sheet(fullListAoa);
  wsFullList['!cols'] = calculateColumnWidths(fullListAoa);
  XLSX.utils.book_append_sheet(wb, wsFullList, 'Lista Completa');

  // -------------------------------------------------------------
  // HOJA 3: ALERTAS DE COCINA & ALÉRGENOS
  // -------------------------------------------------------------
  const alertsAoa: (string | number)[][] = [
    [
      'Nº',
      'Invitado',
      'Grupo / Familia',
      'Evento',
      'Menú Asignado',
      'Alergias / Intolerancias',
      'Observaciones para Cocina',
    ],
  ];

  if (report.attendeesWithDietaryAlerts.length === 0) {
    alertsAoa.push(['-', 'Sin requerimientos especiales ni alergias registradas', '-', '-', '-', '-', '-']);
  } else {
    report.attendeesWithDietaryAlerts.forEach((att, idx) => {
      alertsAoa.push([
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

  const wsAlerts = XLSX.utils.aoa_to_sheet(alertsAoa);
  wsAlerts['!cols'] = calculateColumnWidths(alertsAoa);
  XLSX.utils.book_append_sheet(wb, wsAlerts, 'Alertas Cocina');

  // Generate binary XLSX file and trigger browser download
  XLSX.writeFile(wb, fileName);
}

/**
 * Builds and downloads a standardized UTF-8 BOM CSV file compatible with Microsoft Excel.
 */
export function exportCateringToCsv(report: CateringReportResponse, eventName?: string): void {
  const safeEventName = eventName && eventName !== 'ALL' ? eventName : 'Todos_los_Eventos';
  const today = new Date().toISOString().slice(0, 10);
  const fileName = `catering_${sanitizeFilename(safeEventName)}_${today}.csv`;

  const escapeCsv = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const lines: string[] = [];

  // Summary header block
  lines.push(`${escapeCsv('REPORTE DE CATERING Y MENÚS')};`);
  lines.push(`${escapeCsv('Evento:')};${escapeCsv(eventName && eventName !== 'ALL' ? eventName : 'Todos los eventos')}`);
  lines.push(`${escapeCsv('Fecha de Generación:')};${escapeCsv(today)}`);
  lines.push(`${escapeCsv('Total Comensales:')};${escapeCsv(report.totalConfirmedAttendees)}`);
  lines.push(`${escapeCsv('Comensales con Alergias:')};${escapeCsv(report.attendeesWithDietaryAlertsCount)}`);
  lines.push('');

  // Menu Counts Breakdown
  lines.push(`${escapeCsv('RESUMEN DE MENÚS')};;;`);
  lines.push(
    ['Menú / Opción', 'Tipo de Dieta', 'Comensales', 'Porcentaje (%)']
      .map(escapeCsv)
      .join(';')
  );

  report.menuCounts.forEach((mc) => {
    const percentage =
      report.totalConfirmedAttendees > 0
        ? `${Math.round((mc.count / report.totalConfirmedAttendees) * 100)}%`
        : '0%';
    lines.push([mc.menuOptionName, mc.dietType, mc.count, percentage].map(escapeCsv).join(';'));
  });

  lines.push('');

  // Detailed Attendee List
  lines.push(`${escapeCsv('LISTA COMPLETA DE COMENSALES Y REQUERIMIENTOS')};;;;;;;`);
  const headers = [
    'Nº',
    'Invitado',
    'Grupo / Familia',
    'Evento',
    'Menú Asignado',
    'Tipo de Dieta',
    'Alergias / Intolerancias',
    'Observaciones para Cocina',
  ];
  lines.push(headers.map(escapeCsv).join(';'));

  report.allSelections.forEach((s, idx) => {
    lines.push(
      [
        idx + 1,
        s.guestName,
        s.partyDisplayName,
        s.eventName,
        s.menuOptionName,
        s.dietType || 'STANDARD',
        s.dietaryRestrictions || '',
        s.specialNotes || '',
      ]
        .map(escapeCsv)
        .join(';')
    );
  });

  // UTF-8 BOM prefix (\uFEFF) ensures Excel opens special characters (ñ, á, é, etc.) cleanly
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
