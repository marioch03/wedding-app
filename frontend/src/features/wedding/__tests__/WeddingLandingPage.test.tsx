import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../../../test/test-utils';
import { WeddingLandingPage } from '../pages/WeddingLandingPage';
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/mocks/server';
import { mockWeddingPublic } from '../../../test/mocks/handlers';

describe('Feature: Visibilidad Condicional de Secciones (WeddingLandingPage)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra todas las secciones por defecto si sectionVisibility no está definido', async () => {
    server.use(
      http.get('*/api/v1/public/wedding', () => {
        return HttpResponse.json({
          ...mockWeddingPublic,
          content: {
            ...mockWeddingPublic.content,
            sectionVisibility: undefined,
          },
        });
      })
    );

    renderWithRouter(<WeddingLandingPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/Nuestra Historia/i).length).toBeGreaterThan(0);
    });

    // Todas las secciones deben estar presentes
    expect(screen.getByText(/Momentos Especiales/i)).toBeInTheDocument(); // Gallery
    expect(screen.getByText(/Fotos de los Invitados/i)).toBeInTheDocument(); // Guest Photos
    expect(screen.getByText(/Hoteles y Alojamientos/i)).toBeInTheDocument(); // Accommodations
    expect(screen.getByText(/¿Qué canción no puede faltar\?/i)).toBeInTheDocument(); // Song suggestions
    expect(screen.getByText(/Preguntas Frecuentes/i)).toBeInTheDocument(); // FAQs / Info
  });

  it('oculta las secciones configuradas con false en sectionVisibility', async () => {
    server.use(
      http.get('*/api/v1/public/wedding', () => {
        return HttpResponse.json({
          ...mockWeddingPublic,
          content: {
            ...mockWeddingPublic.content,
            sectionVisibility: {
              story: false,
              gallery: true,
              guestPhotos: false,
              timeline: true,
              accommodations: false,
              music: false,
              info: true,
            },
          },
        });
      })
    );

    renderWithRouter(<WeddingLandingPage />);

    await waitFor(() => {
      expect(screen.getByText(/Momentos Especiales/i)).toBeInTheDocument();
    });

    // Secciones que deben estar ocultas
    expect(screen.queryByText(/Nuestra Historia/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Fotos de los Invitados/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Hoteles y Alojamientos/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/¿Qué canción no puede faltar\?/i)).not.toBeInTheDocument();

    // Secciones que deben permanecer visibles
    expect(screen.getByText(/Momentos Especiales/i)).toBeInTheDocument();
    expect(screen.getByText(/Preguntas Frecuentes/i)).toBeInTheDocument();
  });

  it('renderiza las secciones en el orden personalizado especificado en sectionOrder', async () => {
    server.use(
      http.get('*/api/v1/public/wedding', () => {
        return HttpResponse.json({
          ...mockWeddingPublic,
          content: {
            ...mockWeddingPublic.content,
            sectionOrder: [
              'music',
              'story',
              'gallery',
              'guestPhotos',
              'timeline',
              'accommodations',
              'info',
            ],
          },
        });
      })
    );

    renderWithRouter(<WeddingLandingPage />);

    await waitFor(() => {
      expect(screen.getByText(/¿Qué canción no puede faltar\?/i)).toBeInTheDocument();
    });

    const musicElement = screen.getByText(/¿Qué canción no puede faltar\?/i);
    const storyElement = screen.getAllByText(/Nuestra Historia/i)[0];

    // music debe preceder a story en el DOM cuando sectionOrder sitúa music antes
    const isStoryFollowingMusic = Boolean(
      musicElement.compareDocumentPosition(storyElement) & Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(isStoryFollowingMusic).toBe(true);
  });
});

