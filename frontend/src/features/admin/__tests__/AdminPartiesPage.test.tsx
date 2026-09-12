import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../test/test-utils';
import { AdminPartiesPage } from '../pages/AdminPartiesPage';
import { mockParties } from '../../../test/mocks/handlers';

// Polyfill Canvas for QRCode in JSDOM
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Array(4) })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => []),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
  }) as any;

  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,fakePngData');

  let clipboardValue = '';
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn((text: string) => {
        clipboardValue = text;
        return Promise.resolve();
      }),
      readText: vi.fn(() => Promise.resolve(clipboardValue)),
    },
    writable: true,
    configurable: true,
  });
});

describe('Feature: Panel de Invitaciones y Gestión de QR (AdminPartiesPage)', () => {
  it('renderiza la lista de invitaciones y estadísticas correctamente', async () => {
    renderWithRouter(<AdminPartiesPage />);

    expect(screen.getByText(/Cargando invitados y grupos/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Invitados & Grupos')).toBeInTheDocument();
    });

    // Validar tarjetas de estadísticas
    expect(screen.getByText('Total Grupos')).toBeInTheDocument();
    expect(screen.getByText('Grupos Confirmados')).toBeInTheDocument();
    expect(screen.getByText('Grupos Pendientes')).toBeInTheDocument();

    // Validar grupos renderizados en la tabla
    expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
    expect(screen.getByText('Carlos & Laura')).toBeInTheDocument();
    expect(screen.getByText('✓ Confirmado')).toBeInTheDocument();
    expect(screen.getByText('⏱ Pendiente')).toBeInTheDocument();
  });

  it('permite copiar el enlace RSVP personalizado con feedback visual', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminPartiesPage />);

    await waitFor(() => {
      expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
    });

    const copyButtons = screen.getAllByRole('button', { name: /Copiar Enlace/i });
    expect(copyButtons.length).toBeGreaterThanOrEqual(1);

    // Copiar enlace del primer grupo
    await user.click(copyButtons[0]);

    // Verificar que el portapapeles recibió la URL completa
    const clipboardText = await navigator.clipboard.readText();
    expect(clipboardText).toContain(`/rsvp/${mockParties[0].rsvpToken}`);

    // Feedback visual "¡Copiado!"
    expect(screen.getByText('¡Copiado!')).toBeInTheDocument();
  });

  it('abre el modal de código QR con opciones de descarga y enlace para compartir', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminPartiesPage />);

    await waitFor(() => {
      expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
    });

    const qrButtons = screen.getAllByTitle('Ver código QR y compartir');
    expect(qrButtons.length).toBeGreaterThanOrEqual(1);

    // Clic en el botón QR del primer grupo
    await user.click(qrButtons[0]);

    // Modal abierto
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Invitación & Código QR')).toBeInTheDocument();
    expect(screen.getByText(/Grupo: Familia Gómez Martínez/i)).toBeInTheDocument();

    // Comprobar elementos del modal
    expect(screen.getByText(/Descargar QR \(PNG\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Enviar por WhatsApp/i)).toBeInTheDocument();

    // Cerrar el modal
    const closeBtn = screen.getByRole('button', { name: /Cerrar modal/i });
    await user.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('filtra los grupos por término de búsqueda', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminPartiesPage />);

    await waitFor(() => {
      expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
      expect(screen.getByText('Carlos & Laura')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Buscar por nombre de familia o notas/i);
    await user.type(searchInput, 'Carlos');

    expect(screen.getByText('Carlos & Laura')).toBeInTheDocument();
    expect(screen.queryByText('Familia Gómez Martínez')).not.toBeInTheDocument();
  });

  it('filtra los grupos por píldoras de estado RSVP', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminPartiesPage />);

    await waitFor(() => {
      expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
    });

    // Filtrar solo Pendientes
    const pendingPill = screen.getByRole('button', { name: /Pendientes/i });
    await user.click(pendingPill);

    expect(screen.getByText('Carlos & Laura')).toBeInTheDocument();
    expect(screen.queryByText('Familia Gómez Martínez')).not.toBeInTheDocument();

    // Filtrar Confirmados
    const confirmedPill = screen.getByRole('button', { name: /Confirmados/i });
    await user.click(confirmedPill);

    expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
    expect(screen.queryByText('Carlos & Laura')).not.toBeInTheDocument();
  });

  it('permite copiar únicamente el código corto para tarjeta física', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminPartiesPage />);

    await waitFor(() => {
      expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
    });

    const codeBadges = screen.getAllByTitle(/Código para tarjeta física/i);
    expect(codeBadges.length).toBeGreaterThanOrEqual(1);

    await user.click(codeBadges[0]);

    const clipboardText = await navigator.clipboard.readText();
    expect(clipboardText).toBe(mockParties[0].rsvpToken);
    expect(screen.getByText('¡Copiado!')).toBeInTheDocument();
  });

  it('abre el modal de edición mostrando el enlace de invitación y acceso a QR', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminPartiesPage />);

    await waitFor(() => {
      expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
    });

    const manageButtons = screen.getAllByRole('button', { name: /Gestionar/i });
    await user.click(manageButtons[0]);

    // Modal de edición abierto
    expect(screen.getByText(/Editar: Familia Gómez Martínez/i)).toBeInTheDocument();
    expect(screen.getByText(/Código para Tarjeta Física/i)).toBeInTheDocument();

    // El input contiene el enlace con el token
    const linkInput = screen.getByLabelText('Enlace RSVP del grupo');
    expect(linkInput).toHaveValue(`${window.location.origin}/rsvp/${mockParties[0].rsvpToken}`);

    // Clic en botón QR dentro del formulario abre el visor de QR
    const qrBtnInModal = screen.getByRole('button', { name: /QR/i });
    await user.click(qrBtnInModal);

    expect(screen.getByText('Invitación & Código QR')).toBeInTheDocument();
  });
});
