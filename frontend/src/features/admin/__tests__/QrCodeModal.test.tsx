import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../test/test-utils';
import { QrCodeModal } from '../components/QrCodeModal/QrCodeModal';
import { AdminPartiesPage } from '../pages/AdminPartiesPage';
import { mockParties } from '../../../test/mocks/handlers';

describe('Feature: Código QR y Enlace de Invitación (QrCodeModal & AdminPartiesPage)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });

    // Mock Canvas getContext & toDataURL para JSDOM
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
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
    });
    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,mockPngData');
  });

  describe('Componente QrCodeModal (Unitario)', () => {
    it('renderiza el título, el nombre del grupo, el canvas del código QR y el enlace completo', () => {
      renderWithRouter(
        <QrCodeModal party={mockParties[0]} onClose={vi.fn()} />
      );

      expect(screen.getByText('Invitación & Código QR')).toBeInTheDocument();
      expect(screen.getByText(/Grupo: Familia Gómez Martínez/i)).toBeInTheDocument();

      // Canvas del código QR
      const canvas = document.getElementById(`qr-canvas-${mockParties[0].id}`);
      expect(canvas).toBeInTheDocument();

      // Input con la URL directa
      const input = screen.getByLabelText(/Enlace directo personalizado/i) as HTMLInputElement;
      expect(input.value).toContain(`/rsvp/${mockParties[0].rsvpToken}`);
    });

    it('copia el enlace al portapapeles y muestra confirmación "¡Copiado!"', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <QrCodeModal party={mockParties[0]} onClose={vi.fn()} />
      );

      const copyButton = screen.getByRole('button', { name: /Copiar/i });
      await user.click(copyButton);

      expect(screen.getByText('¡Copiado!')).toBeInTheDocument();
      const clipboardContent = await navigator.clipboard.readText();
      expect(clipboardContent).toContain(`/rsvp/${mockParties[0].rsvpToken}`);
    });

    it('genera el enlace directo a WhatsApp con mensaje personalizado en español', () => {
      renderWithRouter(
        <QrCodeModal party={mockParties[0]} onClose={vi.fn()} />
      );

      const whatsappLink = screen.getByRole('link', { name: /Enviar por WhatsApp/i });
      expect(whatsappLink).toHaveAttribute('target', '_blank');
      expect(whatsappLink).toHaveAttribute('rel', 'noopener noreferrer');

      const href = whatsappLink.getAttribute('href') || '';
      expect(href).toContain('https://api.whatsapp.com/send?text=');
      expect(decodeURIComponent(href)).toContain('Familia Gómez Martínez');
      expect(decodeURIComponent(href)).toContain(`/rsvp/${mockParties[0].rsvpToken}`);
    });

    it('invoca onClose al hacer clic en el botón de cerrar', async () => {
      const user = userEvent.setup();
      const onCloseMock = vi.fn();

      renderWithRouter(
        <QrCodeModal party={mockParties[0]} onClose={onCloseMock} />
      );

      const closeButtons = screen.getAllByRole('button', { name: /Cerrar/i });
      await user.click(closeButtons[0]);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('permite descargar la imagen del código QR en PNG', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <QrCodeModal party={mockParties[0]} onClose={vi.fn()} />
      );

      const downloadButton = screen.getByRole('button', { name: /Descargar QR \(PNG\)/i });

      // Mock canvas toDataURL
      const canvas = document.getElementById(`qr-canvas-${mockParties[0].id}`) as HTMLCanvasElement;
      if (canvas) {
        canvas.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,mockPngData');
      }

      await user.click(downloadButton);

      if (canvas) {
        expect(canvas.toDataURL).toHaveBeenCalledWith('image/png');
      }
    });
  });

  describe('Integración con AdminPartiesPage', () => {
    it('abre el QrCodeModal al hacer clic en el botón 📱 de la tabla de grupos', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AdminPartiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
      });

      // Localizar botones con tooltip de QR
      const qrButtons = screen.getAllByTitle(/Ver código QR/i);
      expect(qrButtons.length).toBeGreaterThan(0);

      // Clic en el botón QR del primer grupo
      await user.click(qrButtons[0]);

      // Debe abrirse el modal con la información del primer grupo
      await waitFor(() => {
        expect(screen.getByText('Invitación & Código QR')).toBeInTheDocument();
      });
      expect(screen.getByText(/Grupo: Familia Gómez Martínez/i)).toBeInTheDocument();
    });
  });
});
