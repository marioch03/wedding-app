import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SongRequestSection } from '../SongRequestSection';
import { songSuggestionsApi } from '../../../../../lib/api/songSuggestions';

describe('Feature: Buzón de Sugerencias de Canciones (SongRequestSection)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza la sección correctamente con título y botón de acción', () => {
    render(<SongRequestSection />);

    expect(screen.getByText('¿Qué canción no puede faltar?')).toBeInTheDocument();
    expect(screen.getByText(/Queremos que la pista de baile no pare/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sugerir una canción/i })).toBeInTheDocument();
  });

  it('permite abrir y cerrar el modal con el botón de cancelar', async () => {
    const user = userEvent.setup();
    render(<SongRequestSection />);

    const openBtn = screen.getByRole('button', { name: /Sugerir una canción/i });
    await user.click(openBtn);

    expect(screen.getByText('Pide tu temazo')).toBeInTheDocument();
    expect(screen.getByLabelText(/Tu nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/¿Qué canción o temazo quieres pedir\?/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    await user.click(cancelBtn);

    expect(screen.queryByText('Pide tu temazo')).not.toBeInTheDocument();
  });

  it('permite enviar una sugerencia y muestra la confirmación de éxito', async () => {
    const user = userEvent.setup();
    const createSpy = vi.spyOn(songSuggestionsApi, 'createPublic').mockResolvedValueOnce({
      id: 'mock-1',
      guestName: 'Carlos',
      songRequest: 'Danza Kuduro - Don Omar',
      createdAt: '2026-10-17T12:00:00Z',
    });

    render(<SongRequestSection />);

    await user.click(screen.getByRole('button', { name: /Sugerir una canción/i }));

    await user.type(screen.getByLabelText(/Tu nombre/i), 'Carlos');
    await user.type(screen.getByLabelText(/¿Qué canción o temazo quieres pedir\?/i), 'Danza Kuduro - Don Omar');

    await user.click(screen.getByRole('button', { name: /Enviar petición/i }));

    expect(createSpy).toHaveBeenCalledWith({
      guestName: 'Carlos',
      songRequest: 'Danza Kuduro - Don Omar',
    });

    await waitFor(() => {
      expect(screen.getByText('¡Anotada para la fiesta!')).toBeInTheDocument();
      expect(screen.getAllByText('Danza Kuduro - Don Omar').length).toBeGreaterThanOrEqual(1);
    });

    // Cerrar desde la confirmación
    await user.click(screen.getByRole('button', { name: /Listo/i }));
    expect(screen.queryByText('¡Anotada para la fiesta!')).not.toBeInTheDocument();

    // Comprobar que en la sección se muestra la píldora con el último tema
    expect(screen.getByText(/Último tema añadido:/i)).toBeInTheDocument();
    expect(screen.getByText('Danza Kuduro - Don Omar')).toBeInTheDocument();
  });

  it('conserva el nombre del invitado pero limpia el campo de canción al reabrir el modal', async () => {
    const user = userEvent.setup();
    vi.spyOn(songSuggestionsApi, 'createPublic').mockResolvedValueOnce({
      id: 'mock-1',
      guestName: 'Carlos',
      songRequest: 'Danza Kuduro',
      createdAt: '2026-10-17T12:00:00Z',
    });

    render(<SongRequestSection />);

    // Primer envío
    await user.click(screen.getByRole('button', { name: /Sugerir una canción/i }));
    await user.type(screen.getByLabelText(/Tu nombre/i), 'Carlos');
    await user.type(screen.getByLabelText(/¿Qué canción o temazo quieres pedir\?/i), 'Danza Kuduro');
    await user.click(screen.getByRole('button', { name: /Enviar petición/i }));

    await waitFor(() => {
      expect(screen.getByText('¡Anotada para la fiesta!')).toBeInTheDocument();
    });

    // Cerrar modal
    await user.click(screen.getByRole('button', { name: /Listo/i }));

    // Reabrir modal
    await user.click(screen.getByRole('button', { name: /Sugerir una canción/i }));

    // El nombre debe permanecer, pero el campo de la canción debe estar vacío
    expect(screen.getByLabelText(/Tu nombre/i)).toHaveValue('Carlos');
    expect(screen.getByLabelText(/¿Qué canción o temazo quieres pedir\?/i)).toHaveValue('');
  });
});
