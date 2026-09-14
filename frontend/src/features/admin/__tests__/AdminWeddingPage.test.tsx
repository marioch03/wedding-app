import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../test/test-utils';
import { AdminWeddingPage } from '../pages/AdminWeddingPage';
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/mocks/server';
import { mockWeddingAdmin } from '../../../test/mocks/handlers';

import type { WeddingRequest } from '../../../types';

describe('Feature: Configuración de Boda y Secciones Prácticas (AdminWeddingPage)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('carga y renderiza la configuración actual de la boda', async () => {
    renderWithRouter(<AdminWeddingPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockWeddingAdmin.partner1Name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockWeddingAdmin.partner2Name)).toBeInTheDocument();
    });

    expect(screen.getByText(/Detalles Prácticos para Invitados/i)).toBeInTheDocument();
    expect(screen.getByText(/Secciones Adicionales Personalizadas/i)).toBeInTheDocument();
  });

  it('permite añadir una nueva sección personalizada con icono, título y descripción', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminWeddingPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockWeddingAdmin.partner1Name)).toBeInTheDocument();
    });

    // Añadir una nueva sección práctica
    const addBtn = screen.getByRole('button', { name: /\+ Añadir Sección/i });
    await user.click(addBtn);

    // Debe aparecer la tarjeta de Sección 1
    expect(screen.getByText(/Sección 1/i)).toBeInTheDocument();

    // Rellenar título
    const titleInput = screen.getByPlaceholderText(/Introduce un título descriptivo/i);
    await user.type(titleInput, 'Lista de Bodas y Regalos');

    // Rellenar descripción
    const descInput = screen.getByPlaceholderText(/Escribe aquí las indicaciones o detalles para los invitados/i);
    await user.type(descInput, 'Vuestra presencia es lo más importante para nosotros.');

    // Seleccionar icono 🎁
    const giftIconBtn = screen.getByTitle('Seleccionar 🎁');
    await user.click(giftIconBtn);

    expect(titleInput).toHaveValue('Lista de Bodas y Regalos');
    expect(descInput).toHaveValue('Vuestra presencia es lo más importante para nosotros.');
  });

  it('permite eliminar una sección personalizada creada', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminWeddingPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockWeddingAdmin.partner1Name)).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /\+ Añadir Sección/i });
    await user.click(addBtn);

    expect(screen.getByText(/Sección 1/i)).toBeInTheDocument();

    // Eliminar la sección
    const deleteBtn = screen.getByTitle('Eliminar esta sección');
    await user.click(deleteBtn);

    expect(screen.queryByText(/Sección 1/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/No hay secciones personalizadas adicionales añadidas todavía/i)
    ).toBeInTheDocument();
  });

  it('permite guardar la configuración enviando las secciones personalizadas al backend', async () => {
    let capturedPayload: WeddingRequest | null = null;
    server.use(
      http.put('*/api/v1/admin/weddings/current', async ({ request }) => {
        capturedPayload = (await request.json()) as WeddingRequest;
        return HttpResponse.json({
          ...mockWeddingAdmin,
          ...capturedPayload,
          updatedAt: new Date().toISOString(),
        });
      })
    );

    const user = userEvent.setup();
    renderWithRouter(<AdminWeddingPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockWeddingAdmin.partner1Name)).toBeInTheDocument();
    });

    // Añadir una sección
    const addBtn = screen.getByRole('button', { name: /\+ Añadir Sección/i });
    await user.click(addBtn);

    const titleInput = screen.getByPlaceholderText(/Introduce un título descriptivo/i);
    await user.type(titleInput, 'Niños en la Fiesta');

    const descInput = screen.getByPlaceholderText(/Escribe aquí las indicaciones o detalles para los invitados/i);
    await user.type(descInput, 'Contaremos con ludoteca y monitores.');

    // Click en Guardar Secciones (accesible directamente en Detalles Prácticos)
    const saveBtn = screen.getAllByRole('button', { name: /Guardar Secciones/i })[0];
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/¡Configuración guardada con éxito!/i)).toBeInTheDocument();
    });

    expect(capturedPayload).not.toBeNull();
    const payload = capturedPayload as unknown as WeddingRequest;
    expect(payload.content.customSections).toHaveLength(1);
    expect(payload.content.customSections?.[0].title).toBe('Niños en la Fiesta');
    expect(payload.content.customSections?.[0].description).toBe(
      'Contaremos con ludoteca y monitores.'
    );
  });

  it('permite subir una foto de portada y actualizar la URL automáticamente', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminWeddingPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockWeddingAdmin.partner1Name)).toBeInTheDocument();
    });

    const file = new File(['fake-cover-content'], 'nueva-portada.jpg', { type: 'image/jpeg' });
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const coverFileInput = fileInputs[0] as HTMLInputElement;

    await user.upload(coverFileInput, file);

    await waitFor(() => {
      expect(screen.getByDisplayValue('/media/mock-image.webp')).toBeInTheDocument();
    });
  });

  it('permite subir múltiples fotos de golpe al álbum de la galería', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminWeddingPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockWeddingAdmin.partner1Name)).toBeInTheDocument();
    });

    const file1 = new File(['fake-photo-1'], 'foto1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['fake-photo-2'], 'foto2.jpg', { type: 'image/jpeg' });
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const galleryFileInput = fileInputs[2] as HTMLInputElement; // 0: cover, 1: story, 2: gallery

    await user.upload(galleryFileInput, [file1, file2]);

    await waitFor(() => {
      // Las fotos mockeadas son /media/mock-image-1.webp y /media/mock-image-2.webp
      const imgs = screen.getAllByRole('img');
      const hasUploadedPhoto = imgs.some((img) =>
        img.getAttribute('src')?.includes('/media/mock-image-1.webp')
      );
      expect(hasUploadedPhoto).toBe(true);
    });
  });

  it('permite editar el pie de foto de un momento especial en la galería', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminWeddingPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockWeddingAdmin.partner1Name)).toBeInTheDocument();
    });

    const captionInput = screen.getByDisplayValue('Momento especial 1');
    await user.clear(captionInput);
    await user.type(captionInput, 'El día que nos prometimos');

    expect(captionInput).toHaveValue('El día que nos prometimos');
  });

  it('permite añadir y gestionar un hotel recomendado en la configuración de la boda', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminWeddingPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockWeddingAdmin.partner1Name)).toBeInTheDocument();
    });

    // Debe mostrar la sección de hoteles y el hotel precargado
    expect(screen.getByText(/Hoteles y Alojamiento Recomendado/i)).toBeInTheDocument();
    expect(screen.getByText('Parador de Alcalá de Henares')).toBeInTheDocument();

    // Pulsar Añadir Hotel
    const addHotelBtn = screen.getByRole('button', { name: /\+ Añadir Hotel \/ Alojamiento/i });
    await user.click(addHotelBtn);

    expect(screen.getByText('➕ Nuevo Alojamiento')).toBeInTheDocument();

    // Rellenar datos
    const nameInput = screen.getByPlaceholderText('Ej. Parador de Alcalá de Henares');
    await user.type(nameInput, 'Hotel Boutique Las Rosas');

    const distanceInput = screen.getByPlaceholderText('Ej. A 5 minutos en coche');
    await user.type(distanceInput, 'A 3 minutos de la iglesia');

    // Guardar hotel en la lista
    const saveHotelBtn = screen.getByRole('button', { name: /✓ Añadir Alojamiento/i });
    await user.click(saveHotelBtn);

    // Debe aparecer en la lista
    expect(screen.getByText('Hotel Boutique Las Rosas')).toBeInTheDocument();
    expect(screen.getByText('⏱️ A 3 minutos de la iglesia')).toBeInTheDocument();
  });
});

