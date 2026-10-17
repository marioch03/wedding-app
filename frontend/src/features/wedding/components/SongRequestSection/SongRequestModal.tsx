import React, { useState, useEffect } from 'react';
import { songSuggestionsApi } from '../../../../lib/api/songSuggestions';
import type { SongSuggestionResponse } from '../../../../types';
import styles from './SongRequestModal.module.css';

interface SongRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSongSuggested?: (suggestion: SongSuggestionResponse) => void;
}

export const SongRequestModal: React.FC<SongRequestModalProps> = ({
  isOpen,
  onClose,
  onSongSuggested,
}) => {
  const [guestName, setGuestName] = useState('');
  const [songRequest, setSongRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedSong, setSubmittedSong] = useState<SongSuggestionResponse | null>(null);

  // Cerrar al pulsar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    setSubmittedSong(null);
    setSongRequest('');
    onClose();
  };

  const handleSuggestAnother = () => {
    setSongRequest('');
    setSubmittedSong(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError('Por favor indica tu nombre.');
      return;
    }
    if (!songRequest.trim()) {
      setError('Por favor escribe qué canción o temazo te gustaría escuchar.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await songSuggestionsApi.createPublic({
        guestName: guestName.trim(),
        songRequest: songRequest.trim(),
      });

      setSubmittedSong(response);
      setSongRequest('');
      if (onSongSuggested) {
        onSongSuggested(response);
      }
    } catch (err) {
      console.error('Error al enviar sugerencia de canción:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al enviar tu sugerencia. Inténtalo de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="song-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitleWrapper}>
            <span className={styles.headerIcon} aria-hidden="true">🎵</span>
            <h3 id="song-modal-title" className={styles.title}>
              {submittedSong ? '¡Petición enviada!' : 'Pide tu temazo'}
            </h3>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Cerrar ventana"
          >
            ×
          </button>
        </div>

        {submittedSong ? (
          <div className={styles.successContainer}>
            <div className={styles.successIconBadge}>✓</div>
            <h4 className={styles.successTitle}>¡Anotada para la fiesta!</h4>
            <p className={styles.successText}>
              Los novios ya tienen tu petición lista para entregársela al DJ.
            </p>

            <div className={styles.successSongPill}>
              <span className={styles.successSongTitle}>{submittedSong.songRequest}</span>
            </div>

            <div className={styles.successActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleSuggestAnother}
              >
                Pedir otra
              </button>
              <button
                type="button"
                className={styles.submitButton}
                onClick={handleClose}
              >
                Listo
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.body}>
            <p className={styles.description}>
              ¿Qué canción necesitas escuchar para darlo todo en la pista? Cuéntanoslo y se la pasamos directamente al DJ.
            </p>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="guestName" className={styles.label}>
                  Tu nombre *
                </label>
                <input
                  id="guestName"
                  type="text"
                  className={styles.input}
                  placeholder="Ej. Carlos, Lucía..."
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  maxLength={100}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="songRequest" className={styles.label}>
                  ¿Qué canción o temazo quieres pedir? *
                </label>
                <input
                  id="songRequest"
                  type="text"
                  className={styles.input}
                  placeholder="Ej. Danza Kuduro - Don Omar"
                  value={songRequest}
                  onChange={(e) => setSongRequest(e.target.value)}
                  maxLength={250}
                  disabled={isSubmitting}
                  required
                />
                <span className={styles.helperText}>
                  💡 Formato recomendado: <strong className={styles.helperHighlight}>Canción - Artista</strong> (o solo el título si no recuerdas el autor).
                </span>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar petición'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
