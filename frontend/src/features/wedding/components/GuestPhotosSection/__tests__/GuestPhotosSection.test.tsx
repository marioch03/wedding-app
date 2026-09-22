import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuestPhotosSection } from '../GuestPhotosSection';
import * as downloadModule from '../../../../../common/utils/download';
import { server } from '../../../../../test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('Feature: Álbum de Fotos de los Invitados (GuestPhotosSection)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza las fotos públicas de los invitados correctamente', async () => {
    render(<GuestPhotosSection />);

    expect(screen.getByText('Fotos de los Invitados')).toBeInTheDocument();
    expect(screen.getByText(/¡Vuestra mirada de nuestro gran día!/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('👤 Tía Carmen')).toBeInTheDocument();
      expect(screen.getByText('¡Vivan los novios!')).toBeInTheDocument();
      expect(screen.getByText('👤 Pablo y Laura')).toBeInTheDocument();
      expect(screen.getByText('El mejor baile')).toBeInTheDocument();
    });
  });

  it('muestra estado vacío si todavía no hay fotos subidas', async () => {
    server.use(
      http.get('*/api/v1/public/guest-photos', () => {
        return HttpResponse.json([]);
      })
    );

    render(<GuestPhotosSection />);

    await waitFor(() => {
      expect(screen.getByText('Aún no hay fotos en el álbum')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /\+ Subir las primeras fotos/i })).toBeInTheDocument();
    });
  });

  it('permite abrir el modal de subida de fotos y cerrarlo con el botón de cancelar', async () => {
    const user = userEvent.setup();
    render(<GuestPhotosSection />);

    const uploadBtn = screen.getByRole('button', { name: /Subir Fotos de la Boda/i });
    await user.click(uploadBtn);

    expect(screen.getByText('Subir Fotos a la Boda')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tía Carmen/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    await user.click(cancelBtn);

    expect(screen.queryByText('Subir Fotos a la Boda')).not.toBeInTheDocument();
  });

  it('permite abrir el visor lightbox al pulsar sobre una foto', async () => {
    const user = userEvent.setup();
    render(<GuestPhotosSection />);

    await waitFor(() => {
      expect(screen.getByText('👤 Tía Carmen')).toBeInTheDocument();
    });

    const photoCard = screen.getByLabelText(/Ver foto de Tía Carmen/i);
    await user.click(photoCard);

    expect(screen.getByText(/Foto de:\s*Tía Carmen/i)).toBeInTheDocument();
    expect(screen.getByText(/"¡Vivan los novios!"/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Cerrar foto/i });
    await user.click(closeBtn);

    expect(screen.queryByText(/Foto de:\s*Tía Carmen/i)).not.toBeInTheDocument();
  });

  it('permite navegar entre fotos usando las flechas de navegación y el teclado', async () => {
    const user = userEvent.setup();
    render(<GuestPhotosSection />);

    await waitFor(() => {
      expect(screen.getByText('👤 Tía Carmen')).toBeInTheDocument();
    });

    const photoCard = screen.getByLabelText(/Ver foto de Tía Carmen/i);
    await user.click(photoCard);

    expect(screen.getByText(/Foto de:\s*Tía Carmen/i)).toBeInTheDocument();
    expect(screen.getByText(/1\s*de\s*2/i)).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Foto siguiente/i });
    await user.click(nextBtn);

    expect(screen.getByText(/Foto de:\s*Pablo y Laura/i)).toBeInTheDocument();
    expect(screen.getByText(/2\s*de\s*2/i)).toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: /Foto anterior/i });
    await user.click(prevBtn);

    expect(screen.getByText(/Foto de:\s*Tía Carmen/i)).toBeInTheDocument();
    expect(screen.getByText(/1\s*de\s*2/i)).toBeInTheDocument();

    // Navegación por teclado
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText(/Foto de:\s*Pablo y Laura/i)).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByText(/Foto de:\s*Pablo y Laura/i)).not.toBeInTheDocument();
  });

  it('permite descargar una foto tanto desde la tarjeta como desde el visor lightbox', async () => {
    const user = userEvent.setup();
    const downloadSpy = vi.spyOn(downloadModule, 'downloadFile').mockResolvedValue(true);

    render(<GuestPhotosSection />);

    await waitFor(() => {
      expect(screen.getByText('👤 Tía Carmen')).toBeInTheDocument();
    });

    // 1. Descarga rápida desde la miniatura
    const cardDownloadBtn = screen.getByRole('button', { name: /Descargar foto de Tía Carmen/i });
    await user.click(cardDownloadBtn);

    expect(downloadSpy).toHaveBeenCalledWith(
      expect.stringContaining('mock-guest-1.jpg'),
      expect.stringContaining('carmen')
    );

    // 2. Abrir lightbox y descargar desde el visor
    const photoCard = screen.getByLabelText(/Ver foto de Tía Carmen/i);
    await user.click(photoCard);

    const lightboxDownloadBtns = screen.getAllByRole('button', { name: /^Descargar foto$/i });
    expect(lightboxDownloadBtns.length).toBeGreaterThanOrEqual(1);

    await user.click(lightboxDownloadBtns[0]);
    expect(downloadSpy).toHaveBeenCalledTimes(2);
  });
});
