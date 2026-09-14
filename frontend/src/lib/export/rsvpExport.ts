import ExcelJS from 'exceljs';
import type { PartyResponse } from '../../types/party';
import type { GuestDetailResponse, GuestEventSummaryDto } from '../../types/guest';
import { downloadWorkbook, autoFitColumnWidths } from './excelDownload';

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function formatStatus(status?: string): string {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmado';
    case 'DECLINED':
      return 'Declinado';
    case 'PARTIAL':
      return 'Parcial';
    default:
      return 'Pendiente';
  }
}

function formatGuestType(type?: string): string {
  switch (type) {
    case 'CHILD':
      return 'Niño';
    case 'INFANT':
      return 'Bebé';
    default:
      return 'Adulto';
  }
}

export async function exportRsvpGuestsToExcel(
  guests: GuestDetailResponse[],
  parties: PartyResponse[],
  filterTitle = 'General'
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const fileName = `invitados_rsvp_${sanitizeFilename(filterTitle)}_${today}.xlsx`;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'WeddingApp';
  wb.created = new Date();

  const ws = wb.addWorksheet('Invitados RSVP');
  ws.addRow([
    'Nº',
    'Nombre',
    'Apellidos',
    'Grupo / Familia',
    'Estado RSVP',
    'Código Invitación',
    'Tipo de Invitado',
    'Acompañante (+1)',
    'Teléfono',
    'Email',
    'Restricciones Dietéticas',
    'Asistencia a Eventos & Menús',
  ]);

  guests.forEach((g, idx) => {
    const parentParty = parties.find((p) => p.id === g.partyId);
    const partyName = g.partyDisplayName || parentParty?.displayName || '';
    const partyStatus = formatStatus(parentParty?.status);
    const inviteCode = parentParty?.rsvpToken || '';

    const eventsSummary = (g.eventAttendances || [])
      .map((ea: GuestEventSummaryDto) => {
        const state =
          ea.attending === true
            ? ea.menuOptionName
              ? `Asiste (${ea.menuOptionName})`
              : 'Asiste'
            : ea.attending === false
            ? 'No asiste'
            : 'Pendiente';
        return `${ea.eventName}: ${state}`;
      })
      .join(' | ');

    ws.addRow([
      idx + 1,
      g.firstName || '',
      g.lastName || '',
      partyName,
      partyStatus,
      inviteCode,
      formatGuestType(g.guestType),
      g.isPlusOne ? 'Sí' : 'No',
      g.phone || '',
      g.email || '',
      g.dietaryRestrictions || '',
      eventsSummary || 'Sin asignaciones',
    ]);
  });

  autoFitColumnWidths(ws);

  await downloadWorkbook(wb, fileName);
}

export function exportRsvpGuestsToCsv(
  guests: GuestDetailResponse[],
  parties: PartyResponse[],
  filterTitle = 'General'
): void {
  const today = new Date().toISOString().slice(0, 10);
  const fileName = `invitados_rsvp_${sanitizeFilename(filterTitle)}_${today}.csv`;

  const rows: (string | number)[][] = [
    [
      'Nº',
      'Nombre',
      'Apellidos',
      'Grupo / Familia',
      'Estado RSVP',
      'Código Invitación',
      'Tipo de Invitado',
      'Acompañante (+1)',
      'Teléfono',
      'Email',
      'Restricciones Dietéticas',
      'Asistencia a Eventos & Menús',
    ],
  ];

  guests.forEach((g, idx) => {
    const parentParty = parties.find((p) => p.id === g.partyId);
    const partyName = g.partyDisplayName || parentParty?.displayName || '';
    const partyStatus = formatStatus(parentParty?.status);
    const inviteCode = parentParty?.rsvpToken || '';

    const eventsSummary = (g.eventAttendances || [])
      .map((ea: GuestEventSummaryDto) => {
        const state =
          ea.attending === true
            ? ea.menuOptionName
              ? `Asiste (${ea.menuOptionName})`
              : 'Asiste'
            : ea.attending === false
            ? 'No asiste'
            : 'Pendiente';
        return `${ea.eventName}: ${state}`;
      })
      .join(' | ');

    rows.push([
      idx + 1,
      g.firstName || '',
      g.lastName || '',
      partyName,
      partyStatus,
      inviteCode,
      formatGuestType(g.guestType),
      g.isPlusOne ? 'Sí' : 'No',
      g.phone || '',
      g.email || '',
      g.dietaryRestrictions || '',
      eventsSummary || 'Sin asignaciones',
    ]);
  });

  const escapeCsv = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
  const csvContent = rows.map((r) => r.map(escapeCsv).join(';')).join('\r\n');

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
