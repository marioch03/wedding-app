import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as XLSX from 'xlsx';
import { exportCateringToExcel, exportCateringToCsv } from '../cateringExport';
import type { CateringReportResponse } from '../../../types/menu';

vi.mock('xlsx', async (importOriginal) => {
  const actual = await importOriginal<typeof import('xlsx')>();
  return {
    ...actual,
    writeFile: vi.fn(),
  };
});

describe('cateringExport', () => {
  const mockReport: CateringReportResponse = {
    totalConfirmedAttendees: 2,
    attendeesWithDietaryAlertsCount: 1,
    menuCounts: [
      { menuOptionId: 'm1', menuOptionName: 'Menú Solomillo', dietType: 'STANDARD', count: 1 },
      { menuOptionId: 'm2', menuOptionName: 'Menú Vegano', dietType: 'VEGAN', count: 1 },
    ],
    attendeesWithDietaryAlerts: [
      {
        guestId: 'g2',
        guestName: 'Laura Vega',
        partyDisplayName: 'Familia Vega',
        eventId: 'e1',
        eventName: 'Banquete Principal',
        menuOptionName: 'Menú Vegano',
        dietType: 'VEGAN',
        dietaryRestrictions: 'Celíaca / Sin Gluten',
        specialNotes: 'Mesa cerca del jardín',
      },
    ],
    allSelections: [
      {
        guestId: 'g1',
        guestName: 'Carlos Gómez',
        partyDisplayName: 'Familia Gómez',
        eventId: 'e1',
        eventName: 'Banquete Principal',
        menuOptionName: 'Menú Solomillo',
        dietType: 'STANDARD',
        dietaryRestrictions: '',
        specialNotes: '',
      },
      {
        guestId: 'g2',
        guestName: 'Laura Vega',
        partyDisplayName: 'Familia Vega',
        eventId: 'e1',
        eventName: 'Banquete Principal',
        menuOptionName: 'Menú Vegano',
        dietType: 'VEGAN',
        dietaryRestrictions: 'Celíaca / Sin Gluten',
        specialNotes: 'Mesa cerca del jardín',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportCateringToExcel', () => {
    it('generates workbook with 3 sheets and triggers file download', () => {
      exportCateringToExcel(mockReport, 'Banquete de Gala');

      expect(XLSX.writeFile).toHaveBeenCalledOnce();
      const [wb, fileName] = (XLSX.writeFile as any).mock.calls[0];

      expect(fileName).toContain('catering_banquete_de_gala_');
      expect(fileName).toContain('.xlsx');

      expect(wb.SheetNames).toEqual(['Resumen Menús', 'Lista Completa', 'Alertas Cocina']);
      expect(wb.Sheets['Resumen Menús']).toBeDefined();
      expect(wb.Sheets['Lista Completa']).toBeDefined();
      expect(wb.Sheets['Alertas Cocina']).toBeDefined();
    });

    it('handles empty selections cleanly', () => {
      const emptyReport: CateringReportResponse = {
        totalConfirmedAttendees: 0,
        attendeesWithDietaryAlertsCount: 0,
        menuCounts: [],
        attendeesWithDietaryAlerts: [],
        allSelections: [],
      };

      exportCateringToExcel(emptyReport, 'ALL');

      expect(XLSX.writeFile).toHaveBeenCalledOnce();
      const [, fileName] = (XLSX.writeFile as any).mock.calls[0];
      expect(fileName).toContain('catering_todos_los_eventos_');
    });
  });

  describe('exportCateringToCsv', () => {
    let createdAnchor: HTMLAnchorElement;
    let clickMock: any;

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

    it('creates a CSV blob with UTF-8 BOM, triggers download and cleans up', () => {
      exportCateringToCsv(mockReport, 'Banquete de Gala');

      expect(clickMock).toHaveBeenCalledOnce();
      expect(createdAnchor.getAttribute('download')).toContain('catering_banquete_de_gala_');
      expect(createdAnchor.getAttribute('download')).toContain('.csv');
      expect(createdAnchor.getAttribute('href')).toBe('blob:mock-url');
    });
  });
});
