import React from 'react';
import { getMediaUrl } from '../../../../common/utils/media';
import styles from './StorySection.module.css';

interface StorySectionProps {
  storyTitle?: string;
  storyText?: string;
  storyImageUrl?: string;
}

const DEFAULT_STORY_IMAGE =
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=85';

export const StorySection: React.FC<StorySectionProps> = ({
  storyTitle,
  storyText,
  storyImageUrl,
}) => {
  if (!storyTitle && !storyText) {
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
          {storyText && <p className={styles.text}>{storyText}</p>}
        </div>
      </div>
    </section>
  );
};
