import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportRsvpGuestsToExcel, exportRsvpGuestsToCsv } from '../rsvpExport';
import type { PartyResponse } from '../../../types/party';
import type { GuestDetailResponse } from '../../../types/guest';

describe('rsvpExport', () => {
  let createdAnchor: HTMLAnchorElement;
  let clickMock: any;

  const mockParties: PartyResponse[] = [
    {
      id: 'p1',
      displayName: 'Familia Gómez',
      rsvpToken: 'GOM824',
      languagePreference: 'es',
      status: 'CONFIRMED',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  const mockGuests: GuestDetailResponse[] = [
    {
      id: 'g1',
      partyId: 'p1',
      partyDisplayName: 'Familia Gómez',
      firstName: 'Carlos',
      lastName: 'Gómez',
      guestType: 'ADULT',
      isPlusOne: false,
      email: 'carlos@example.com',
      phone: '+34600112233',
      dietaryRestrictions: 'Ninguna',
      eventAttendances: [
        {
          eventId: 'e1',
          eventName: 'Banquete',
          attending: true,
          menuOptionName: 'Menú Solomillo',
        },
      ],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    clickMock = vi.fn();
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const el = document.createElementNS('http://www.w3.org/1999/xhtml', tagName);
      if (tagName.toLowerCase() === 'a') {
        el.click = clickMock;
        createdAnchor = el as HTMLAnchorElement;
      }
      return el;
    });
    vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportRsvpGuestsToExcel', () => {
    it('creates workbook and triggers Excel file download', async () => {
      await exportRsvpGuestsToExcel(mockGuests, mockParties, 'Confirmados');

      expect(clickMock).toHaveBeenCalledOnce();
      expect(createdAnchor.getAttribute('download')).toContain('invitados_rsvp_confirmados_');
      expect(createdAnchor.getAttribute('download')).toContain('.xlsx');
      expect(createdAnchor.getAttribute('href')).toBe('blob:mock-url');
    });
  });

  describe('exportRsvpGuestsToCsv', () => {
    it('creates CSV blob and triggers download', () => {
      exportRsvpGuestsToCsv(mockGuests, mockParties, 'Confirmados');

      expect(clickMock).toHaveBeenCalledOnce();
      expect(createdAnchor.getAttribute('download')).toContain('invitados_rsvp_confirmados_');
      expect(createdAnchor.getAttribute('download')).toContain('.csv');
      expect(createdAnchor.getAttribute('href')).toBe('blob:mock-url');
    });
  });
});
