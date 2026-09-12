import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../test/test-utils';
import { WeddingLandingPage } from '../wedding/pages/WeddingLandingPage';
import { RsvpPage } from '../rsvp/pages/RsvpPage';
import { AdminEventsPage } from '../admin/pages/AdminEventsPage';
import { Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/mocks/server';
import { mockWeddingPublic, mockRsvpInfo, mockEvents } from '../../test/mocks/handlers';

describe('Estados de la Interfaz (UX): Spinners, Skeletons y Recuperación de Red', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Presencia de Spinners o Skeletons durante Llamadas Asíncronas', () => {
    it('muestra WeddingSkeleton con elementos shimmer mientras carga WeddingLandingPage', async () => {
      let resolvePromise: (value: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      server.use(
        http.get('*/api/v1/public/wedding', async () => {
          await delayedPromise;
          return HttpResponse.json(mockWeddingPublic);
        }),
        http.get('*/api/public/wedding', async () => {
          await delayedPromise;
          return HttpResponse.json(mockWeddingPublic);
        })
      );

      const { container } = renderWithRouter(<WeddingLandingPage />);

      // En estado de carga debe estar presente el contenedor de skeleton
      const skeletonContainer = container.querySelector('._skeletonContainer_fa6be7, [class*="skeletonContainer"]');
      expect(skeletonContainer).toBeInTheDocument();

      // No debe mostrarse el contenido definitivo aún
      expect(screen.queryByText('Elena')).not.toBeInTheDocument();

      // Resolver petición
      resolvePromise!(null);

      // Ahora debe aparecer el contenido real
      await waitFor(() => {
        expect(screen.getByText('Elena')).toBeInTheDocument();
      });
    });

    it('muestra RsvpSkeleton mientras se resuelve la consulta de RSVP con token', async () => {
      let resolvePromise: (value: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      server.use(
        http.get('*/api/v1/public/rsvp/:token', async () => {
          await delayedPromise;
          return HttpResponse.json(mockRsvpInfo);
        }),
        http.get('*/api/public/rsvp/:token', async () => {
          await delayedPromise;
          return HttpResponse.json(mockRsvpInfo);
        })
      );

      const { container } = renderWithRouter(
        <Routes>
          <Route path="/rsvp/:token" element={<RsvpPage />} />
        </Routes>,
        { initialEntries: ['/rsvp/my-test-token'] }
      );

      // Durante la carga, el contenedor de shimmer de RSVP debe estar en el DOM
      const rsvpSkeleton = container.querySelector('._container_76d088, [class*="shimmer"]');
      expect(rsvpSkeleton).toBeInTheDocument();
      expect(screen.queryByText('Familia Gómez Martínez')).not.toBeInTheDocument();

      // Resolver la petición
      resolvePromise!(null);

      await waitFor(() => {
        expect(screen.getByText('Familia Gómez Martínez')).toBeInTheDocument();
      });
    });
  });

  describe('Recuperación y Renderizado de Mensajes Amigables tras Fallo de Red (Status 0)', () => {
    it('muestra mensaje amigable en WeddingLandingPage tras fallo de red (status 0) y se recupera con Reintentar', async () => {
      let networkFailing = true;

      server.use(
        http.get('*/api/v1/public/wedding', () => {
          if (networkFailing) {
            return HttpResponse.error();
          }
          return HttpResponse.json(mockWeddingPublic);
        }),
        http.get('*/api/public/wedding', () => {
          if (networkFailing) {
            return HttpResponse.error();
          }
          return HttpResponse.json(mockWeddingPublic);
        })
      );

      renderWithRouter(<WeddingLandingPage />);

      // Verificar que se renderiza el error amigable
      await waitFor(() => {
        expect(screen.getByText('Información no disponible')).toBeInTheDocument();
      });
      expect(
        screen.getByText(/No se pudo conectar con el servidor\. Comprueba la conexión o que el backend esté levantado\./i)
      ).toBeInTheDocument();

      // Botón de reintento presente
      const retryButton = screen.getByRole('button', { name: /Reintentar/i });
      expect(retryButton).toBeInTheDocument();

      // Simular recuperación de la red
      networkFailing = false;
      const user = userEvent.setup();
      await user.click(retryButton);

      // Los datos deben recuperarse y el error desaparecer
      await waitFor(() => {
        expect(screen.getByText('Elena')).toBeInTheDocument();
        expect(screen.getByText('Carlos')).toBeInTheDocument();
      });
      expect(screen.queryByText('Información no disponible')).not.toBeInTheDocument();
    });

    it('muestra mensaje amigable en RsvpPage tras fallo de red (status 0)', async () => {
      server.use(
        http.get('*/api/v1/public/rsvp/:token', () => {
          return HttpResponse.error();
        }),
        http.get('*/api/public/rsvp/:token', () => {
          return HttpResponse.error();
        })
      );

      renderWithRouter(
        <Routes>
          <Route path="/rsvp/:token" element={<RsvpPage />} />
        </Routes>,
        { initialEntries: ['/rsvp/network-error-token'] }
      );

      await waitFor(() => {
        expect(screen.getByText('Invitación no encontrada')).toBeInTheDocument();
      });
      expect(
        screen.getByText(/No se pudo conectar con el servidor\. Comprueba la conexión o que el backend esté levantado\./i)
      ).toBeInTheDocument();
    });

    it('muestra mensaje amigable en AdminEventsPage tras fallo de red y permite recuperar la lista', async () => {
      let networkFailing = true;

      server.use(
        http.get('*/api/v1/admin/events', () => {
          if (networkFailing) {
            return HttpResponse.error();
          }
          return HttpResponse.json(mockEvents);
        }),
        http.get('*/api/admin/events', () => {
          if (networkFailing) {
            return HttpResponse.error();
          }
          return HttpResponse.json(mockEvents);
        })
      );

      renderWithRouter(<AdminEventsPage />);

      await waitFor(() => {
        expect(screen.getByText('Error al cargar eventos')).toBeInTheDocument();
      });
      expect(
        screen.getByText(/No se pudo conectar con el servidor/i)
      ).toBeInTheDocument();

      // Recuperar red y reintentar
      networkFailing = false;
      const retryButton = screen.getByRole('button', { name: /Reintentar/i });
      const user = userEvent.setup();
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Ceremonia Religiosa')).toBeInTheDocument();
      });
      expect(screen.queryByText('Error al cargar eventos')).not.toBeInTheDocument();
    });
  });
});
