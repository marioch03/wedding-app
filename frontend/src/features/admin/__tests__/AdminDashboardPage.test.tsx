import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../test/test-utils';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/mocks/server';
import { mockRsvpStats, mockWeddingPublic } from '../../../test/mocks/handlers';

vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    user: { firstName: 'Mario', fullName: 'Mario Administrador' },
  }),
}));

describe('Feature: Panel de Control Admin (AdminDashboardPage)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza la cabecera de bienvenida con el nombre del administrador y la tarjeta de la boda', async () => {
    renderWithRouter(<AdminDashboardPage />);

    expect(screen.getByText(/¡Hola, Mario! 👋/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Elena & Carlos/i)).toBeInTheDocument();
    });
  });

  it('carga y muestra las métricas KPI y el balance de invitados', async () => {
    renderWithRouter(<AdminDashboardPage />);

    // Esperar a que carguen las estadísticas
    await waitFor(() => {
      expect(screen.getByText('1 grupos confirmados')).toBeInTheDocument();
    });

    expect(screen.getByText('Balance de Invitados')).toBeInTheDocument();
    expect(screen.getByText('100% Asistencia')).toBeInTheDocument();
    expect(screen.getByText('2 invitados totales en lista')).toBeInTheDocument();
  });

  it('muestra aviso de error visible cuando el backend está detenido (PUB-005) y recupera los datos al reintentar', async () => {
    let backendDown = true;

    server.use(
      http.get('*/api/v1/admin/rsvp/stats', () => {
        if (backendDown) {
          return HttpResponse.error();
        }
        return HttpResponse.json(mockRsvpStats);
      }),
      http.get('*/api/admin/rsvp/stats', () => {
        if (backendDown) {
          return HttpResponse.error();
        }
        return HttpResponse.json(mockRsvpStats);
      }),
      http.get('*/api/v1/public/wedding', () => {
        if (backendDown) {
          return HttpResponse.error();
        }
        return HttpResponse.json(mockWeddingPublic);
      }),
      http.get('*/api/public/wedding', () => {
        if (backendDown) {
          return HttpResponse.error();
        }
        return HttpResponse.json(mockWeddingPublic);
      })
    );

    renderWithRouter(<AdminDashboardPage />);

    // El banner de error debe ser visible e informar del fallo
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText('Error de conexión con el servidor')).toBeInTheDocument();
    expect(
      screen.getByText(/No se pudo conectar con el servidor\. Comprueba la conexión o que el backend esté levantado\./i)
    ).toBeInTheDocument();

    // Los KPIs deben mostrar '--' en vez de inducir a error con ceros silenciosos
    const notAvailableElements = screen.getAllByText('Información no disponible');
    expect(notAvailableElements.length).toBeGreaterThanOrEqual(1);

    // El botón de reintento debe estar disponible
    const retryButton = screen.getByRole('button', { name: /Reintentar/i });
    expect(retryButton).toBeInTheDocument();

    // Simular que el backend se levanta de nuevo
    backendDown = false;
    const user = userEvent.setup();
    await user.click(retryButton);

    // Los datos deben cargarse correctamente y el aviso de error debe desaparecer
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('Error de conexión con el servidor')).not.toBeInTheDocument();
    expect(screen.getByText('1 grupos confirmados')).toBeInTheDocument();
  });
});
