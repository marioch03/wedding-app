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

// 3 Momentos icónicos y elegantes por defecto
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
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.tag}>Momentos Especiales</span>
        <h2 className={styles.title}>Nuestros Recuerdos</h2>
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') openLightbox(index);
            }}
          >
            <div className={styles.imageWrapper}>
              <img
                src={photo.url}
                alt={photo.caption}
                className={styles.photo}
                loading="lazy"
              />
            </div>
            <span className={styles.caption}>{photo.caption}</span>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className={styles.modalBackdrop}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
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

            <img
              src={photos[selectedIndex].url}
              alt={photos[selectedIndex].caption}
              className={styles.modalImage}
            />

            <p className={styles.modalCaption}>{photos[selectedIndex].caption}</p>

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
