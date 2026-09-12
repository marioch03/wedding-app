import * as XLSX from 'xlsx';
import type { PartyResponse } from '../../types/party';
import type { GuestDetailResponse, GuestEventSummaryDto } from '../../types/guest';

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function calculateColumnWidths(data: (string | number | undefined | null)[][]): { wch: number }[] {
  const maxCols = data.reduce((max, row) => Math.max(max, row.length), 0);
  const colWidths: number[] = new Array(maxCols).fill(10);

  data.forEach((row) => {
    row.forEach((cell, colIndex) => {
      const cellLength = cell !== undefined && cell !== null ? String(cell).length : 0;
      if (cellLength > colWidths[colIndex]) {
        colWidths[colIndex] = Math.min(cellLength + 3, 40);
      }
    });
  });

  return colWidths.map((wch) => ({ wch }));
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

export function exportRsvpGuestsToExcel(
  guests: GuestDetailResponse[],
  parties: PartyResponse[],
  filterTitle = 'General'
): void {
  const today = new Date().toISOString().slice(0, 10);
  const fileName = `invitados_rsvp_${sanitizeFilename(filterTitle)}_${today}.xlsx`;

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
      eventsSummary || 'Sin eventos registrados',
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = calculateColumnWidths(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Invitados RSVP');

  XLSX.writeFile(wb, fileName);
}

export function exportRsvpGuestsToCsv(
  guests: GuestDetailResponse[],
  parties: PartyResponse[],
  filterTitle = 'General'
): void {
  const today = new Date().toISOString().slice(0, 10);
  const fileName = `invitados_rsvp_${sanitizeFilename(filterTitle)}_${today}.csv`;

  const escapeCsv = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = [
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
  ];

  const lines: string[] = [headers.map(escapeCsv).join(';')];

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

    lines.push(
      [
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
        eventsSummary,
      ]
        .map(escapeCsv)
        .join(';')
    );
  });

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
