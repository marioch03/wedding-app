import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../../../test/test-utils';
import { TimelineSection } from '../components/TimelineSection/TimelineSection';
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/mocks/server';
import { mockEvents } from '../../../test/mocks/handlers';
import type { EventResponse } from '../../../types';

describe('Feature: Cronograma de Eventos en Web Pública (TimelineSection)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Estado de Carga y Esqueleto', () => {
    it('muestra el TimelineSkeleton mientras se realiza la llamada a la API', async () => {
      let resolvePromise: (value: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      server.use(
        http.get('*/api/v1/public/events', async () => {
          await delayedPromise;
          return HttpResponse.json(mockEvents);
        }),
        http.get('*/api/public/events', async () => {
          await delayedPromise;
          return HttpResponse.json(mockEvents);
        })
      );

      renderWithRouter(<TimelineSection />);

      // Debe mostrarse el esqueleto de carga
      expect(
        screen.getByRole('status', { name: /Cargando cronograma/i })
      ).toBeInTheDocument();
      expect(screen.queryByText('Ceremonia Religiosa')).not.toBeInTheDocument();

      // Resolver llamada
      resolvePromise!(null);

      await waitFor(() => {
        expect(screen.getByText('Ceremonia Religiosa')).toBeInTheDocument();
      });
    });
  });

  describe('Renderizado de Eventos Públicos e Información', () => {
    it('renderiza la lista cronológica de eventos con hora, lugares, descripciones y enlaces a Google Maps', async () => {
      renderWithRouter(<TimelineSection />);

      await waitFor(() => {
        expect(screen.getByText('Cronograma del Día')).toBeInTheDocument();
      });

      // Validar eventos
      expect(screen.getByText('Ceremonia Religiosa')).toBeInTheDocument();
      expect(screen.getByText('Cóctel y Banquete')).toBeInTheDocument();

      // Validar tipos y recintos
      expect(screen.getByText('Capilla Los Pinos')).toBeInTheDocument();
      expect(screen.getByText('Finca Bellavista')).toBeInTheDocument();

      // Validar enlaces de "Cómo llegar" a Google Maps
      const mapLinks = screen.getAllByRole('link', { name: /Cómo llegar/i });
      expect(mapLinks.length).toBe(2);

      mapLinks.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link.getAttribute('href')).toContain('https://www.google.com/maps/search/?api=1&query=');
      });
    });

    it('renderiza inmediatamente cuando se proporcionan eventos vía props sin hacer petición HTTP', () => {
      const customEvents: EventResponse[] = [
        {
          id: 'ev-custom-1',
          weddingId: 'wed-1',
          name: 'Brunch de Despedida',
          eventType: 'OTHER',
          description: 'Desayuno relajado con los invitados',
          startDatetime: '2026-10-19T11:00:00Z',
          venueName: 'Terraza Los Olivos',
          displayOrder: 1,
          isPublic: true,
        },
      ];

      renderWithRouter(<TimelineSection events={customEvents} />);

      expect(screen.getByText('Brunch de Despedida')).toBeInTheDocument();
      expect(screen.getByText('Terraza Los Olivos')).toBeInTheDocument();
      expect(screen.getByText('Desayuno relajado con los invitados')).toBeInTheDocument();
      expect(screen.queryByRole('status', { name: /Cargando cronograma/i })).not.toBeInTheDocument();
    });
  });

  describe('Casos Borde y Filtrado', () => {
    it('no renderiza nada en el DOM si no hay eventos públicos configurados (mantiene la landing limpia)', async () => {
      server.use(
        http.get('*/api/v1/public/events', () => {
          return HttpResponse.json([]);
        }),
        http.get('*/api/public/events', () => {
          return HttpResponse.json([]);
        })
      );

      const { container } = renderWithRouter(<TimelineSection />);

      await waitFor(() => {
        expect(screen.queryByRole('status', { name: /Cargando cronograma/i })).not.toBeInTheDocument();
      });

      expect(container.querySelector('#itinerario')).toBeNull();
      expect(screen.queryByText('Cronograma del Día')).not.toBeInTheDocument();
    });

    it('gestiona errores de API de forma silenciosa sin romper el renderizado de la página', async () => {
      server.use(
        http.get('*/api/v1/public/events', () => {
          return HttpResponse.error();
        }),
        http.get('*/api/public/events', () => {
          return HttpResponse.error();
        })
      );

      const { container } = renderWithRouter(<TimelineSection />);

      await waitFor(() => {
        expect(screen.queryByRole('status', { name: /Cargando cronograma/i })).not.toBeInTheDocument();
      });

      expect(container.querySelector('#itinerario')).toBeNull();
    });
  });
});
