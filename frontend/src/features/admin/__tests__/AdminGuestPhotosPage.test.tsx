import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../test/test-utils';
import { AdminGuestPhotosPage } from '../pages/AdminGuestPhotosPage';
import { server } from '../../../test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('Feature: Moderación y Gestión de Fotos de Invitados (AdminGuestPhotosPage)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('carga y renderiza la lista de fotos de invitados en el panel de administración', async () => {
    renderWithRouter(<AdminGuestPhotosPage />);

    expect(screen.getByText('Álbum de Fotos de los Invitados')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('2 fotos subidas')).toBeInTheDocument();
      expect(screen.getByText('👤 Tía Carmen')).toBeInTheDocument();
      expect(screen.getByText('👤 Pablo y Laura')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Descargar Álbum \(\.ZIP\)/i })).toBeInTheDocument();
    });
  });

  it('permite al administrador eliminar una foto tras confirmar en el modal personalizado', async () => {
    let deletedId: string | null = null;
    server.use(
      http.delete('*/api/v1/admin/guest-photos/:id', ({ params }) => {
        deletedId = params.id as string;
        return new HttpResponse(null, { status: 204 });
      })
    );

    const user = userEvent.setup();
    renderWithRouter(<AdminGuestPhotosPage />);

    await waitFor(() => {
      expect(screen.getByText('👤 Tía Carmen')).toBeInTheDocument();
    });

    // 1. Pulsar botón de eliminar en la tarjeta
    const deleteButton = screen.getByLabelText(/Eliminar foto de Tía Carmen/i);
    await user.click(deleteButton);

    // 2. Comprobar que se abre el modal personalizado
    expect(screen.getByText('Eliminar Foto del Álbum')).toBeInTheDocument();
    expect(screen.getByText(/¿Estás seguro de que deseas eliminar la foto de "Tía Carmen"?/i)).toBeInTheDocument();

    // 3. Confirmar la eliminación dentro del modal
    const confirmBtn = screen.getByRole('button', { name: /Sí, eliminar foto/i });
    await user.click(confirmBtn);

    // 4. Se cierra el modal y se elimina la foto de la lista
    await waitFor(() => {
      expect(screen.queryByText('👤 Tía Carmen')).not.toBeInTheDocument();
    });

    expect(deletedId).toBe('guest-photo-1');
  });

  it('permite cancelar la eliminación cerrando el modal sin borrar la foto', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminGuestPhotosPage />);

    await waitFor(() => {
      expect(screen.getByText('👤 Tía Carmen')).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText(/Eliminar foto de Tía Carmen/i);
    await user.click(deleteButton);

    expect(screen.getByText('Eliminar Foto del Álbum')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    await user.click(cancelBtn);

    expect(screen.queryByText('Eliminar Foto del Álbum')).not.toBeInTheDocument();
    expect(screen.getByText('👤 Tía Carmen')).toBeInTheDocument();
  });

  it('muestra estado vacío cuando no hay fotos en el panel', async () => {
    server.use(
      http.get('*/api/v1/admin/guest-photos', () => {
        return HttpResponse.json([]);
      })
    );

    renderWithRouter(<AdminGuestPhotosPage />);

    await waitFor(() => {
      expect(screen.getByText('No hay fotos de invitados todavía')).toBeInTheDocument();
      expect(screen.getByText('0 fotos subidas')).toBeInTheDocument();
    });
  });
});
