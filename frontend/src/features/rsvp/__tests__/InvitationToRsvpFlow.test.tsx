import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import { renderWithRouter } from '../../../test/test-utils';
import { AdminPartiesPage } from '../../admin/pages/AdminPartiesPage';
import { RsvpPage } from '../pages/RsvpPage';
import { mockParties } from '../../../test/mocks/handlers';

// Polyfills for Canvas and Clipboard in JSDOM
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

  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mockPng');

  let clipboardStorage = '';
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn((text: string) => {
        clipboardStorage = text;
        return Promise.resolve();
      }),
      readText: vi.fn(() => Promise.resolve(clipboardStorage)),
    },
    writable: true,
    configurable: true,
  });
});

describe('Flujo de Punta a Punta: Panel de Invitaciones -> Enlace / QR -> Confirmación RSVP', () => {
  it('permite al organizador obtener el enlace copiable o QR y al invitado confirmar su asistencia y menú de principio a fin', async () => {
    const user = userEvent.setup();

    // 1. Organizador entra al panel de invitaciones
    const { unmount: unmountAdmin } = renderWithRouter(
      <Routes>
        <Route path="/admin/parties" element={<AdminPartiesPage />} />
      </Routes>,
      { initialEntries: ['/admin/parties'] }
    );

    // Esperar a que carguen las invitaciones en el panel
    await waitFor(() => {
      expect(screen.getByText('Invitados & Grupos')).toBeInTheDocument();
      expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
    });

    // 2. Probar generación de QR y enlace copiable
    const copyButtons = screen.getAllByRole('button', { name: /Copiar Enlace/i });
    await user.click(copyButtons[0]);

    // Verificar que el enlace en portapapeles contiene el token esperado
    const copiedUrl = await navigator.clipboard.readText();
    expect(copiedUrl).toContain(`/rsvp/${mockParties[0].rsvpToken}`);
    expect(screen.getByText('¡Copiado!')).toBeInTheDocument();

    // Abrir el modal de QR para verificar generación de código QR
    const qrButton = screen.getAllByTitle('Ver código QR y compartir')[0];
    await user.click(qrButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Invitación & Código QR')).toBeInTheDocument();
    expect(screen.getByLabelText(/Enlace directo personalizado/i)).toHaveValue(copiedUrl);

    // Cerrar modal
    const closeQrBtn = screen.getByRole('button', { name: /Cerrar modal/i });
    await user.click(closeQrBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Desmontar vista de admin para simular al invitado abriendo el enlace en su navegador
    unmountAdmin();

    // 3. El invitado accede a su enlace RSVP personalizado
    const rsvpPath = `/rsvp/${mockParties[0].rsvpToken}`;

    renderWithRouter(
      <Routes>
        <Route path="/rsvp/:token" element={<RsvpPage />} />
      </Routes>,
      { initialEntries: [rsvpPath] }
    );

    // Esperar a que la página RSVP cargue los datos del token
    await waitFor(() => {
      expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
      expect(screen.getByText('Confirmación de Asistencia')).toBeInTheDocument();
    });

    // El primer invitado (Marcos Gómez) ya tiene nombre asignado
    expect(screen.getByText(/Marcos Gómez/i)).toBeInTheDocument();

    // El segundo invitado es un +1 que requiere nombre
    const plusOneNameInput = screen.getByPlaceholderText('Nombre');
    await user.type(plusOneNameInput, 'Lucía');

    // Asignar restricciones dietéticas a Marcos
    const dietInputs = screen.getAllByPlaceholderText(/Ej: Celíaco, alérgico/i);
    await user.type(dietInputs[0], 'Sin gluten');

    // Cambiar opción de menú en Cóctel y Banquete seleccionando la tarjeta de Risotto
    const risottoOption = screen.getAllByText('Risotto de Setas Silvestres y Espárragos')[0];
    await user.click(risottoOption);

    // 4. Enviar el formulario de confirmación RSVP
    const submitBtn = screen.getByRole('button', { name: /Enviar Confirmación \(RSVP\)/i });
    await user.click(submitBtn);

    // 5. Verificar pantalla de éxito (flujo de punta a punta completado)
    await waitFor(() => {
      expect(screen.getByText(/¡Confirmación Enviada!/i)).toBeInTheDocument();
      expect(screen.getByText(/Hemos registrado correctamente vuestra confirmación/i)).toBeInTheDocument();
    });
  });
});
