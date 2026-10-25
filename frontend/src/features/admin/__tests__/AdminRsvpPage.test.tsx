import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../test/test-utils';
import { AdminRsvpPage } from '../pages/AdminRsvpPage';
import * as cateringExportModule from '../../../lib/export/cateringExport';
import * as rsvpExportModule from '../../../lib/export/rsvpExport';

describe('AdminRsvpPage - Control RSVP & Exportación Catering', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza las tarjetas de estadísticas KPI y la lista de invitados', async () => {
    renderWithRouter(<AdminRsvpPage />);

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.getByText(/Control RSVP & Catering/i)).toBeInTheDocument();
    });

    // Validar KPIs
    expect(screen.getByText('Invitados Confirmados')).toBeInTheDocument();
    expect(screen.getByText('Marcos Gómez')).toBeInTheDocument();
    expect(screen.getByText('Laura Vega')).toBeInTheDocument();
  });

  it('permite cambiar a la pestaña de Catering & Alérgenos y muestra el desglose', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminRsvpPage />);

    await waitFor(() => {
      expect(screen.getByText('Marcos Gómez')).toBeInTheDocument();
    });

    const cateringTabBtn = screen.getByRole('button', {
      name: /Reporte para Catering & Alérgenos/i,
    });
    await user.click(cateringTabBtn);

    // Verificar desglose de menús y alertas de alérgenos
    await waitFor(() => {
      expect(screen.getByText(/Recuento de Menús Confirmados/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Solomillo Ibérico')).toBeInTheDocument();
    expect(screen.getAllByText('Risotto de Setas').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Registro de Alergias, Intolerancias y Notas para Cocina/i)).toBeInTheDocument();
    expect(screen.getByText('⚠️ Celíaca / Sin Gluten')).toBeInTheDocument();
  });

  it('dispara la exportación a Excel (.xlsx) al hacer clic en el botón de la pestaña Catering', async () => {
    const user = userEvent.setup();
    const excelSpy = vi.spyOn(cateringExportModule, 'exportCateringToExcel').mockImplementation(() => Promise.resolve());

    renderWithRouter(<AdminRsvpPage />);

    await waitFor(() => {
      expect(screen.getByText('Marcos Gómez')).toBeInTheDocument();
    });

    const cateringTabBtn = screen.getByRole('button', {
      name: /Reporte para Catering & Alérgenos/i,
    });
    await user.click(cateringTabBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Exportar Excel \(\.xlsx\)/i })).toBeInTheDocument();
    });

    const exportExcelBtn = screen.getByRole('button', { name: /Exportar Excel \(\.xlsx\)/i });
    await user.click(exportExcelBtn);

    expect(excelSpy).toHaveBeenCalledOnce();
    const [report, eventName] = excelSpy.mock.calls[0];
    expect(report.totalConfirmedAttendees).toBe(2);
    expect(eventName).toBe('Todos los eventos con menú');
  });

  it('dispara la exportación a CSV al hacer clic en el botón de la pestaña Catering', async () => {
    const user = userEvent.setup();
    const csvSpy = vi.spyOn(cateringExportModule, 'exportCateringToCsv').mockImplementation(() => {});

    renderWithRouter(<AdminRsvpPage />);

    await waitFor(() => {
      expect(screen.getByText('Marcos Gómez')).toBeInTheDocument();
    });

    const cateringTabBtn = screen.getByRole('button', {
      name: /Reporte para Catering & Alérgenos/i,
    });
    await user.click(cateringTabBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Exportar CSV/i })).toBeInTheDocument();
    });

    const exportCsvBtn = screen.getByRole('button', { name: /Exportar CSV/i });
    await user.click(exportCsvBtn);

    expect(csvSpy).toHaveBeenCalledOnce();
    const [report] = csvSpy.mock.calls[0];
    expect(report.allSelections.length).toBe(2);
  });

  it('permite exportar la lista de invitados a Excel y CSV desde la pestaña de asistencia', async () => {
    const user = userEvent.setup();
    const excelGuestsSpy = vi.spyOn(rsvpExportModule, 'exportRsvpGuestsToExcel').mockImplementation(() => Promise.resolve());
    const csvGuestsSpy = vi.spyOn(rsvpExportModule, 'exportRsvpGuestsToCsv').mockImplementation(() => {});

    renderWithRouter(<AdminRsvpPage />);

    await waitFor(() => {
      expect(screen.getByText('Marcos Gómez')).toBeInTheDocument();
    });

    const excelBtn = screen.getByRole('button', { name: /Excel/i });
    const csvBtn = screen.getByRole('button', { name: /^📄 CSV$/i });

    await user.click(excelBtn);
    expect(excelGuestsSpy).toHaveBeenCalledOnce();

    await user.click(csvBtn);
    expect(csvGuestsSpy).toHaveBeenCalledOnce();
  });

  it('filtra adecuadamente por píldoras de estado para invitados confirmados', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminRsvpPage />);

    await waitFor(() => {
      expect(screen.getByText('Marcos Gómez')).toBeInTheDocument();
    });

    const confirmedPill = screen.getByRole('button', { name: /^Confirmados$/i });
    await user.click(confirmedPill);

    // Marcos Gómez tiene asistencia confirmada
    expect(screen.getByText('Marcos Gómez')).toBeInTheDocument();
  });

  it('abre el modal de gestión manual enfocado en el invitado seleccionado', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminRsvpPage />);

    await waitFor(() => {
      expect(screen.getByText('Marcos Gómez')).toBeInTheDocument();
    });

    const modifyButtons = screen.getAllByRole('button', { name: /Modificar/i });
    await user.click(modifyButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Asistencia: Marcos Gómez/i)).toBeInTheDocument();
    });
  });

  it('muestra la información y badges de transporte en la tabla y en la tarjeta KPI', async () => {
    renderWithRouter(<AdminRsvpPage />);

    await waitFor(() => {
      expect(screen.getByText('Marcos Gómez')).toBeInTheDocument();
    });

    // Validar KPI de transporte
    expect(screen.getByText('Logística Transporte')).toBeInTheDocument();

    // Validar badges en la tabla
    expect(screen.getAllByText(/Vehículo propio/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Necesita transporte/i).length).toBeGreaterThanOrEqual(1);
  });

  it('filtra los invitados según la opción de transporte seleccionada', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminRsvpPage />);

    await waitFor(() => {
      expect(screen.getByText('Marcos Gómez')).toBeInTheDocument();
      expect(screen.getByText('Laura Vega')).toBeInTheDocument();
    });

    const transportSelect = screen.getByRole('combobox', {
      name: /Filtrar por disponibilidad de transporte/i,
    });

    // Filtrar por quienes tienen vehículo propio
    await user.selectOptions(transportSelect, 'OWN');
    expect(screen.getByText('Marcos Gómez')).toBeInTheDocument();
    expect(screen.queryByText('Laura Vega')).not.toBeInTheDocument();

    // Filtrar por quienes necesitan transporte
    await user.selectOptions(transportSelect, 'NEED');
    expect(screen.queryByText('Marcos Gómez')).not.toBeInTheDocument();
    expect(screen.getByText('Laura Vega')).toBeInTheDocument();
  });

  it('permite modificar la opción de transporte desde el modal de RSVP manual', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminRsvpPage />);

    await waitFor(() => {
      expect(screen.getByText('Marcos Gómez')).toBeInTheDocument();
    });

    const modifyButtons = screen.getAllByRole('button', { name: /Modificar/i });
    await user.click(modifyButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Disponibilidad de transporte/i)).toBeInTheDocument();
    });

    const ownBtn = screen.getByRole('button', { name: /Vehículo propio/i });
    const needBtn = screen.getByRole('button', { name: /Necesita transporte \/ autobús/i });

    expect(ownBtn).toHaveAttribute('aria-pressed', 'true');
    expect(needBtn).toHaveAttribute('aria-pressed', 'false');

    await user.click(needBtn);
    expect(ownBtn).toHaveAttribute('aria-pressed', 'false');
    expect(needBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
