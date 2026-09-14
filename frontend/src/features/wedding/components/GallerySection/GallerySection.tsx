import React, { useState, useEffect } from 'react';
import type { GalleryPhotoItem } from '../../../../types';
import { getMediaUrl } from '../../../../common/utils/media';
import styles from './GallerySection.module.css';

interface GallerySectionProps {
  galleryImages?: Array<string | GalleryPhotoItem>;
}

interface PhotoItem {
  url: string;
  caption: string;
}

// Momentos icónicos y elegantes por defecto con respaldo de alta calidad
const DEFAULT_MOMENTS: PhotoItem[] = [
  {
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=85',
    caption: 'El día del compromiso',
  },
  {
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=85',
    caption: 'Preparando nuestro gran día',
  },
  {
    url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=85',
    caption: 'Un paseo al atardecer',
  },
  {
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85',
    caption: 'Celebrando nuestro amor',
  },
];

export const GallerySection: React.FC<GallerySectionProps> = ({ galleryImages }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const photos: PhotoItem[] =
    galleryImages && galleryImages.length > 0
      ? galleryImages.map((item, idx) => {
          const url = typeof item === 'string' ? item : item.url;
          const caption =
            typeof item === 'object' && item.caption?.trim()
              ? item.caption.trim()
              : `Momento especial ${idx + 1}`;
          return {
            url: getMediaUrl(url),
            caption,
          };
        })
      : DEFAULT_MOMENTS;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, index: number) => {
    const target = e.currentTarget;
    if (!target.dataset.fallbackApplied) {
      target.dataset.fallbackApplied = 'true';
      target.src = DEFAULT_MOMENTS[index % DEFAULT_MOMENTS.length]?.url || DEFAULT_MOMENTS[0].url;
    }
  };

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % photos.length);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : null));
      }
      if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev !== null ? (prev + 1) % photos.length : null));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, photos.length]);

  return (
    <section className={styles.section} id="recuerdos" aria-label="Galería de recuerdos">
      {/* Capas ambientales decorativas */}
      <div className={styles.bgGlowGold} aria-hidden="true" />
      <div className={styles.bgGlowWarm} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.tag}>Momentos Especiales</span>
          <h2 className={styles.title}>Nuestros Recuerdos</h2>
          <div className={styles.headerDivider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <span className={styles.dividerIcon}>❦</span>
            <span className={styles.dividerLine} />
          </div>
          <p className={styles.subtitle}>
            Instantes inolvidables que nos han traído hasta este emocionante capítulo.
          </p>
        </div>

        <div className={styles.momentsGrid}>
          {photos.map((photo, index) => (
            <div
              key={index}
              className={styles.momentCard}
              onClick={() => openLightbox(index)}
              role="button"
              tabIndex={0}
              aria-label={`Ver foto: ${photo.caption}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openLightbox(index);
                }
              }}
            >
              <div className={styles.imageWrapper}>
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className={styles.photo}
                  loading="lazy"
                  onError={(e) => handleImageError(e, index)}
                />
                <div className={styles.zoomHint} aria-hidden="true">
                  <span className={styles.zoomIcon}>✦</span>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.caption}>{photo.caption}</span>
                <span className={styles.cardStamp} aria-hidden="true">❦</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className={styles.modalBackdrop}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Visor de fotografía"
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeLightbox}
              aria-label="Cerrar visor"
            >
              ✕
            </button>

            <button
              type="button"
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={handlePrev}
              aria-label="Foto anterior"
            >
              ‹
            </button>

            <div className={styles.modalImageWrapper}>
              <img
                src={photos[selectedIndex].url}
                alt={photos[selectedIndex].caption}
                className={styles.modalImage}
                onError={(e) => handleImageError(e, selectedIndex)}
              />
            </div>

            <div className={styles.modalInfo}>
              <p className={styles.modalCaption}>{photos[selectedIndex].caption}</p>
              <span className={styles.modalCounter}>
                {selectedIndex + 1} de {photos.length}
              </span>
            </div>

            <button
              type="button"
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={handleNext}
              aria-label="Foto siguiente"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
