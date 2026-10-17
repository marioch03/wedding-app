import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../test/test-utils';
import { AdminSongSuggestionsPage } from '../pages/AdminSongSuggestionsPage';
import { songSuggestionsApi } from '../../../lib/api/songSuggestions';

describe('Feature: Gestión y Exportación de Canciones (AdminSongSuggestionsPage)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockSuggestions = [
    {
      id: 'song-1',
      guestName: 'Carlos Gómez',
      songRequest: 'Fiesta Pagana (Mägo de Oz)',
      createdAt: '2026-10-17T12:00:00Z',
    },
    {
      id: 'song-2',
      guestName: 'Laura Ruiz',
      songRequest: 'Vivir Mi Vida - Marc Anthony',
      createdAt: '2026-10-17T12:30:00Z',
    },
  ];

  it('carga y renderiza la lista de canciones sugeridas en la tabla de administración', async () => {
    vi.spyOn(songSuggestionsApi, 'listAdmin').mockResolvedValueOnce(mockSuggestions);

    renderWithRouter(<AdminSongSuggestionsPage />);

    expect(screen.getByText('Música & Canciones de la Fiesta')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Fiesta Pagana (Mägo de Oz)')).toBeInTheDocument();
      expect(screen.getByText('Carlos Gómez')).toBeInTheDocument();
      expect(screen.getByText('Vivir Mi Vida - Marc Anthony')).toBeInTheDocument();
      expect(screen.getByText('Laura Ruiz')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Descargar lista para el DJ \(CSV\)/i })).toBeInTheDocument();
  });

  it('permite filtrar canciones mediante el buscador en tiempo real', async () => {
    const user = userEvent.setup();
    vi.spyOn(songSuggestionsApi, 'listAdmin').mockResolvedValueOnce(mockSuggestions);

    renderWithRouter(<AdminSongSuggestionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Fiesta Pagana (Mägo de Oz)')).toBeInTheDocument();
      expect(screen.getByText('Vivir Mi Vida - Marc Anthony')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Buscar por canción, artista o invitado/i);
    await user.type(searchInput, 'Marc Anthony');

    expect(screen.queryByText('Fiesta Pagana (Mägo de Oz)')).not.toBeInTheDocument();
    expect(screen.getByText('Vivir Mi Vida - Marc Anthony')).toBeInTheDocument();
  });

  it('permite eliminar una canción tras confirmar en el modal de confirmación', async () => {
    const user = userEvent.setup();
    vi.spyOn(songSuggestionsApi, 'listAdmin').mockResolvedValueOnce(mockSuggestions);
    const deleteSpy = vi.spyOn(songSuggestionsApi, 'deleteAdmin').mockResolvedValueOnce();

    renderWithRouter(<AdminSongSuggestionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Fiesta Pagana (Mägo de Oz)')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i });
    await user.click(deleteButtons[0]);

    expect(screen.getByText('¿Eliminar petición musical?')).toBeInTheDocument();
    expect(screen.getByText(/¿Estás seguro de que deseas eliminar "Fiesta Pagana \(Mägo de Oz\)" pedida por Carlos Gómez\?/i)).toBeInTheDocument();

    // Confirmar en el modal
    const confirmBtn = screen.getByRole('button', { name: 'Eliminar' });
    await user.click(confirmBtn);

    expect(deleteSpy).toHaveBeenCalledWith('song-1');

    await waitFor(() => {
      expect(screen.queryByText('Fiesta Pagana (Mägo de Oz)')).not.toBeInTheDocument();
    });
  });

  it('permite descargar el archivo CSV para el DJ', async () => {
    const user = userEvent.setup();
    vi.spyOn(songSuggestionsApi, 'listAdmin').mockResolvedValueOnce(mockSuggestions);
    const downloadSpy = vi.spyOn(songSuggestionsApi, 'downloadCsvAdmin').mockResolvedValueOnce(
      new Blob(['fake-csv-data'], { type: 'text/csv' })
    );

    // Mock createObjectURL & revokeObjectURL
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();

    renderWithRouter(<AdminSongSuggestionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Fiesta Pagana (Mägo de Oz)')).toBeInTheDocument();
    });

    const exportBtn = screen.getByRole('button', { name: /Descargar lista para el DJ \(CSV\)/i });
    await user.click(exportBtn);

    expect(downloadSpy).toHaveBeenCalled();
  });
});
