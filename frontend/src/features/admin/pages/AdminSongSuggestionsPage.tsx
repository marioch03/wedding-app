import React, { useState, useEffect } from 'react';
import { songSuggestionsApi } from '../../../lib/api/songSuggestions';
import { ConfirmModal } from '../../../common/components/ConfirmModal/ConfirmModal';
import { usePageTitle } from '../../../common/hooks';
import type { SongSuggestionResponse } from '../../../types';
import styles from './AdminSongSuggestionsPage.module.css';

export const AdminSongSuggestionsPage: React.FC = () => {
  usePageTitle('Música & Canciones | Administración de Boda');

  const [suggestions, setSuggestions] = useState<SongSuggestionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [suggestionToDelete, setSuggestionToDelete] = useState<SongSuggestionResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSuggestions = async () => {
    try {
      setIsLoading(true);
      const data = await songSuggestionsApi.listAdmin();
      setSuggestions(data);
    } catch (err) {
      console.error('Error al cargar canciones sugeridas:', err);
      setErrorMessage('No se pudieron cargar las sugerencias de música.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleConfirmDelete = async () => {
    if (!suggestionToDelete) return;

    try {
      setIsDeleting(true);
      setErrorMessage(null);
      await songSuggestionsApi.deleteAdmin(suggestionToDelete.id);
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionToDelete.id));
      setSuggestionToDelete(null);
    } catch (err) {
      console.error('Error al eliminar canción sugerida:', err);
      setErrorMessage('No se pudo eliminar la petición musical. Inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCsv = async () => {
    if (suggestions.length === 0) return;
    try {
      setIsExportingCsv(true);
      const blob = await songSuggestionsApi.downloadCsvAdmin();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'canciones-sugeridas-boda.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar archivo CSV:', err);
      alert('Error al generar el archivo CSV para el DJ.');
    } finally {
      setIsExportingCsv(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const filteredSuggestions = suggestions.filter((s) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      s.songRequest.toLowerCase().includes(query) ||
      s.guestName.toLowerCase().includes(query)
    );
  });

  const uniqueGuestsCount = new Set(suggestions.map((s) => s.guestName.toLowerCase().trim())).size;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Música &amp; Canciones de la Fiesta</h1>
          <p className={styles.subtitle}>
            Revisa las peticiones musicales de tus invitados y exporta el archivo para el DJ.
          </p>
        </div>

        <div className={styles.actionsArea}>
          <button
            type="button"
            className={styles.exportButton}
            onClick={handleExportCsv}
            disabled={isExportingCsv || suggestions.length === 0}
            title={suggestions.length === 0 ? 'No hay canciones para exportar' : 'Descargar listado en CSV'}
          >
            <span>{isExportingCsv ? '⏳ Generando CSV...' : '📥 Descargar lista para el DJ (CSV)'}</span>
          </button>
        </div>
      </header>

      {errorMessage && (
        <div style={{
          background: '#fdf0f0',
          border: '1px solid #c62828',
          color: '#c62828',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Tarjetas de Métricas */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} aria-hidden="true">🎵</div>
          <div>
            <div className={styles.statValue}>{suggestions.length}</div>
            <div className={styles.statLabel}>Canciones sugeridas</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} aria-hidden="true">👥</div>
          <div>
            <div className={styles.statValue}>{uniqueGuestsCount}</div>
            <div className={styles.statLabel}>Invitados participantes</div>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className={styles.searchBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por canción, artista o invitado..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabla de Resultados */}
      {isLoading ? (
        <div className={styles.loadingContainer}>Cargando canciones sugeridas...</div>
      ) : filteredSuggestions.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden="true">🎶</div>
          <h3 className={styles.emptyTitle}>
            {searchQuery ? 'No hay resultados para la búsqueda' : 'Aún no hay canciones sugeridas'}
          </h3>
          <p className={styles.emptyText}>
            {searchQuery
              ? 'Prueba con otro término de búsqueda.'
              : 'Cuando los invitados envíen sugerencias desde la web, aparecerán aquí clasificadas para tu DJ.'}
          </p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Petición Musical</th>
                <th>Invitado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuggestions.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className={styles.songTitle}>{item.songRequest}</span>
                  </td>
                  <td>
                    <span className={styles.guestBadge}>{item.guestName}</span>
                  </td>
                  <td>
                    <span className={styles.date}>{formatDate(item.createdAt)}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => setSuggestionToDelete(item)}
                      title="Eliminar petición"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Confirmación de Borrado */}
      <ConfirmModal
        isOpen={suggestionToDelete !== null}
        title="¿Eliminar petición musical?"
        message={`¿Estás seguro de que deseas eliminar "${suggestionToDelete?.songRequest}" pedida por ${suggestionToDelete?.guestName}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setSuggestionToDelete(null)}
      />
    </div>
  );
};
