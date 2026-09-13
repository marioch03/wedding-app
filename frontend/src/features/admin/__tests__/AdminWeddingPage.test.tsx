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
});
