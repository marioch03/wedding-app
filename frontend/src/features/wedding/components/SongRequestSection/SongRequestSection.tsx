import React, { useState } from 'react';
import type { SongSuggestionResponse } from '../../../../types';
import { SongRequestModal } from './SongRequestModal';
import styles from './SongRequestSection.module.css';

export const SongRequestSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSuggested, setLastSuggested] = useState<SongSuggestionResponse | null>(null);

  const handleSongSuggested = (suggestion: SongSuggestionResponse) => {
    setLastSuggested(suggestion);
  };

  return (
    <section className={styles.section} aria-label="Sugerencias de música para la fiesta">
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.vinylGlow} aria-hidden="true" />

          <div className={styles.badge}>
            <span className={styles.badgeIcon} aria-hidden="true">🎉</span>
            <span>Música de la fiesta</span>
          </div>

          <h2 className={styles.title}>¿Qué canción no puede faltar?</h2>

          <p className={styles.description}>
            Queremos que la pista de baile no pare en toda la noche. Cuéntanos qué temazo necesitas escuchar para darlo todo y se lo haremos llegar directamente al DJ.
          </p>

          <div className={styles.ctaWrapper}>
            <button
              type="button"
              className={styles.requestButton}
              onClick={() => setIsModalOpen(true)}
            >
              <span className={styles.buttonIcon} aria-hidden="true">🎵</span>
              <span>Sugerir una canción</span>
            </button>

            {lastSuggested && (
              <div className={styles.recentBadge} role="status">
                <span>Último tema añadido:</span>
                <span className={styles.recentBadgeStrong}>
                  {lastSuggested.songRequest}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <SongRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSongSuggested={handleSongSuggested}
      />
    </section>
  );
};
