import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../test/test-utils';
import { AdminEventsPage } from '../pages/AdminEventsPage';
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/mocks/server';
import { mockEvents } from '../../../test/mocks/handlers';

describe('Feature: Eventos y Menús en Panel Admin (AdminEventsPage)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Estados de Carga y Renderizado', () => {
    it('muestra el estado de carga mientras se obtienen los eventos', async () => {
      renderWithRouter(<AdminEventsPage />);

      expect(
        screen.getByText('Cargando cronograma de eventos...')
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(
          screen.queryByText('Cargando cronograma de eventos...')
        ).not.toBeInTheDocument();
      });
    });

    it('renderiza la lista de eventos con ubicación, fechas, badges y opciones de menú', async () => {
      renderWithRouter(<AdminEventsPage />);

      await waitFor(() => {
        expect(screen.getByText('Ceremonia Religiosa')).toBeInTheDocument();
      });

      // Validar segundo evento
      expect(screen.getByText('Cóctel y Banquete')).toBeInTheDocument();

      // Validar tipos de evento
      expect(screen.getByText('💍 Ceremonia')).toBeInTheDocument();
      expect(screen.getByText('🍽️ Cóctel / Banquete')).toBeInTheDocument();

      // Validar ubicaciones y recintos
      expect(screen.getByText('Capilla Los Pinos')).toBeInTheDocument();
      expect(screen.getByText('Finca Bellavista')).toBeInTheDocument();
      expect(
        screen.getByText(/Camino Viejo de la Sierra, Km 4, Madrid/i)
      ).toBeInTheDocument();

      // Validar opciones de menú para Cóctel y Banquete
      expect(
        screen.getByText('Solomillo Ibérico con Salsa Trufada')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Risotto de Setas Silvestres y Espárragos')
      ).toBeInTheDocument();
      expect(screen.getByText('Menú Infantil Divertido')).toBeInTheDocument();

      // Validar diet badges
      expect(screen.getByText('🥩 Estándar')).toBeInTheDocument();
      expect(screen.getByText('🌱 Vegetariano')).toBeInTheDocument();
      expect(screen.getByText('🧒 Infantil')).toBeInTheDocument();
    });

    it('muestra el estado de error cuando la API falla y permite reintentar', async () => {
      let callCount = 0;
      server.use(
        http.get('*/api/v1/admin/events', () => {
          callCount++;
          if (callCount === 1) {
            return HttpResponse.json(
              { status: 500, message: 'Fallo al consultar base de datos de eventos' },
              { status: 500 }
            );
          }
          return HttpResponse.json(mockEvents);
        }),
        http.get('*/api/admin/events', () => {
          callCount++;
          if (callCount === 1) {
            return HttpResponse.json(
              { status: 500, message: 'Fallo al consultar base de datos de eventos' },
              { status: 500 }
            );
          }
          return HttpResponse.json(mockEvents);
        })
      );

      renderWithRouter(<AdminEventsPage />);

      await waitFor(() => {
        expect(screen.getByText('Error al cargar eventos')).toBeInTheDocument();
      });
      expect(
        screen.getByText(/Fallo al consultar base de datos de eventos/i)
      ).toBeInTheDocument();

      // Reintentar
      const retryButton = screen.getByRole('button', { name: /Reintentar/i });
      const user = userEvent.setup();
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Ceremonia Religiosa')).toBeInTheDocument();
      });
    });
  });

  describe('Flujo CRUD de Gestión de Eventos', () => {
    it('abre el modal de nuevo evento y permite crear uno nuevo', async () => {
      const user = userEvent.setup();
      let createdEventName = '';

      server.use(
        http.post('*/api/v1/admin/events', async ({ request }) => {
          const body = (await request.json()) as any;
          createdEventName = body.name;
          return HttpResponse.json(
            {
              id: 'ev-new-1',
              weddingId: 'wed-1111-2222',
              name: body.name,
              eventType: body.eventType,
              startDatetime: body.startDatetime,
              displayOrder: body.displayOrder,
              isPublic: true,
            },
            { status: 201 }
          );
        })
      );

      renderWithRouter(<AdminEventsPage />);

      await waitFor(() => {
        expect(screen.getByText('Ceremonia Religiosa')).toBeInTheDocument();
      });

      // Abrir modal de nuevo evento
      const newEventButton = screen.getByRole('button', { name: /Nuevo Evento/i });
      await user.click(newEventButton);

      expect(screen.getByText('Nuevo Evento del Día')).toBeInTheDocument();

      // Rellenar formulario
      const nameInput = screen.getByPlaceholderText('Ej: Ceremonia Religiosa');
      await user.type(nameInput, 'Baile Nupcial y Barra Libre');

      const startDatetimeInput = screen.getByLabelText(/Fecha y Hora de Inicio/i);
      fireEvent.change(startDatetimeInput, { target: { value: '2026-10-18T23:30' } });

      // Guardar
      const submitButton = screen.getByRole('button', { name: /Crear Evento/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(createdEventName).toBe('Baile Nupcial y Barra Libre');
      });
    });

    it('abre el modal de confirmación y permite eliminar un evento', async () => {
      const user = userEvent.setup();
      let deletedEventId: string | null = null;

      server.use(
        http.delete('*/api/v1/admin/events/:id', ({ params }) => {
          deletedEventId = params.id as string;
          return new HttpResponse(null, { status: 204 });
        })
      );

      renderWithRouter(<AdminEventsPage />);

      await waitFor(() => {
        expect(screen.getByText('Ceremonia Religiosa')).toBeInTheDocument();
      });

      // Clic en el botón eliminar (primer evento)
      const deleteButtons = screen.getAllByTitle(/Eliminar evento/i);
      await user.click(deleteButtons[0]);

      // Verificar modal de confirmación
      expect(
        screen.getByText('¿Eliminar evento del cronograma?')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/¿Estás seguro de eliminar el evento/i)
      ).toBeInTheDocument();

      // Confirmar eliminación
      const confirmDeleteButton = screen.getByRole('button', { name: 'Eliminar Evento' });
      await user.click(confirmDeleteButton);

      await waitFor(() => {
        expect(deletedEventId).toBe('ev-1');
      });
    });

    it('abre el modal para añadir una opción de menú a un evento', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AdminEventsPage />);

      await waitFor(() => {
        expect(screen.getByText('Cóctel y Banquete')).toBeInTheDocument();
      });

      // Clic en "Añadir Plato"
      const addMenuButtons = screen.getAllByRole('button', { name: /Añadir Plato/i });
      await user.click(addMenuButtons[0]);

      // Debe abrirse el modal de opción de menú
      await waitFor(() => {
        expect(screen.getByText('Añadir Opción de Menú')).toBeInTheDocument();
      });
      expect(screen.getByText(/Evento: Ceremonia Religiosa/i)).toBeInTheDocument();
    });
  });
});
