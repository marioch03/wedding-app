import React from 'react';
import { getMediaUrl } from '../../../../common/utils/media';
import styles from './StorySection.module.css';

interface StorySectionProps {
  storyTitle?: string;
  storyDate?: string;
  storyLocation?: string;
  storyText?: string;
  storyImageUrl?: string;
}

const DEFAULT_STORY_IMAGE =
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=85';

export const StorySection: React.FC<StorySectionProps> = ({
  storyTitle,
  storyDate,
  storyLocation,
  storyText,
  storyImageUrl,
}) => {
  if (!storyTitle && !storyText && !storyLocation && !storyDate) {
    return null;
  }

  const imageUrl = getMediaUrl(storyImageUrl) || DEFAULT_STORY_IMAGE;

  return (
    <section className={styles.section}>

      {/* ── Capa 1: Lavados de tono crema — profundidad sin color ── */}
      <div className={styles.bgWash1} aria-hidden="true" />
      <div className={styles.bgWash2} aria-hidden="true" />

      {/* ── Capa 2: Destello central diagonal en champagne ── */}
      <div className={styles.bgHighlight} aria-hidden="true" />

      {/* ── Capa 3: Patrón de diamantes ── */}
      <div className={styles.bgPattern} aria-hidden="true" />

      {/* ── Contenido ── */}
      <div className={styles.container}>
        {/* Columna Izquierda: Fotografía Polaroid Editorial con profundidad de capas */}
        <div className={styles.imageWrapper}>
          <div className={styles.photoGhost} aria-hidden="true" />
          <div className={styles.photoFrame}>
            <img
              src={imageUrl}
              alt={storyTitle || 'Los novios'}
              className={styles.storyPhoto}
              loading="lazy"
            />
            <span className={styles.photoCaption}>Nuestra Historia</span>
            <div className={styles.decorativeStamp} aria-hidden="true">
              ❦
            </div>
          </div>
        </div>

        {/* Columna Derecha: Texto de la Historia */}
        <div className={styles.content}>
          <span className={styles.tag}>Nuestra Historia</span>
          <div className={styles.tagOrnament} aria-hidden="true">
            <span className={styles.tagOrnamentLine} />
            <span className={styles.tagOrnamentIcon}>❧</span>
          </div>

          {storyTitle && <h2 className={styles.title}>{storyTitle}</h2>}

          {(storyDate || storyLocation) && (
            <div className={styles.metaRow}>
              {storyDate && (
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon} aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      width="15"
                      height="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </span>
                  <span className={styles.metaLabel}>Fecha:</span>
                  <span className={styles.metaValue}>{storyDate}</span>
                </div>
              )}

              {storyLocation && (
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon} aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      width="15"
                      height="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <span className={styles.metaLabel}>Lugar:</span>
                  <span className={styles.metaValue}>{storyLocation}</span>
                </div>
              )}
            </div>
          )}

          {(storyDate || storyLocation) && (
            <div className={styles.storyDivider} aria-hidden="true" />
          )}

          {storyText && <p className={styles.text}>{storyText}</p>}
        </div>
      </div>
    </section>
  );
};
