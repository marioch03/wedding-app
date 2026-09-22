import React, { useState, useEffect, useRef } from 'react';
import { guestPhotosApi } from '../../../../lib/api/guestPhotos';
import { getMediaUrl } from '../../../../common/utils/media';
import { downloadFile } from '../../../../common/utils/download';
import type { GuestPhoto } from '../../../../types';
import { GuestPhotoUploadModal } from './GuestPhotoUploadModal';
import styles from './GuestPhotosSection.module.css';

export const GuestPhotosSection: React.FC = () => {
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const loadPhotos = async () => {
    try {
      const data = await guestPhotosApi.listPublic();
      setPhotos(data);
    } catch (err) {
      console.error('Error al cargar fotos de invitados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handlePhotosUploaded = (newPhotos: GuestPhoto[]) => {
    setPhotos((prev) => [...newPhotos, ...prev]);
  };

  const activePhoto = activePhotoIndex !== null && photos[activePhotoIndex] ? photos[activePhotoIndex] : null;

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (photos.length <= 1) return;
    setActivePhotoIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : null));
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (photos.length <= 1) return;
    setActivePhotoIndex((prev) => (prev !== null ? (prev + 1) % photos.length : null));
  };

  // Navegación mediante teclado (flechas y escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIndex === null || photos.length === 0) return;
      if (e.key === 'Escape') setActivePhotoIndex(null);
      if (e.key === 'ArrowLeft') handlePrevPhoto();
      if (e.key === 'ArrowRight') handleNextPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, photos.length]);

  // Gestos táctiles de deslizamiento (Swipe) en móvil
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handlePrevPhoto();
      } else {
        handleNextPhoto();
      }
    }
    touchStartXRef.current = null;
  };

  // Descarga de fotos al dispositivo
  const handleDownload = async (e: React.MouseEvent, photo: GuestPhoto) => {
    e.stopPropagation();
    const url = getMediaUrl(photo.imageUrl);
    const cleanUploader = (photo.uploaderName || 'invitado')
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, '-');
    const filename = `boda-invitados-${cleanUploader}-${photo.id.slice(0, 8)}.jpg`;

    try {
      setIsDownloading(true);
      await downloadFile(url, filename);
    } catch (err) {
      console.error('Error al descargar la foto:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <section id="fotos-invitados" className={styles.container}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.badge}>
            <span>📸</span> Álbum en Vivo
          </div>
          <h2 className={styles.title}>Fotos de los Invitados</h2>
          <p className={styles.subtitle}>
            ¡Vuestra mirada de nuestro gran día! Sube y comparte las fotos que captures durante la
            celebración para que todos podamos disfrutarlas y recordarlas.
          </p>

          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.uploadButtonMain}
              onClick={() => setIsModalOpen(true)}
            >
              <span className={styles.uploadIcon}>📷</span>
              <span>Subir Fotos de la Boda</span>
            </button>
          </div>
        </header>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            Cargando el álbum de fotos...
          </div>
        ) : photos.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} role="img" aria-label="Cámara de fotos">📷</span>
            <h3 className={styles.emptyTitle}>Aún no hay fotos en el álbum</h3>
            <p className={styles.emptySubtitle}>
              ¡Sé el primero en compartir tus mejores momentos de la fiesta y congelar este día para siempre!
            </p>
            <button
              type="button"
              className={styles.uploadButtonMain}
              onClick={() => setIsModalOpen(true)}
            >
              + Subir las primeras fotos
            </button>
          </div>
        ) : (
          <div className={styles.gridContainer}>
            {photos.map((photo, index) => (
              <article
                key={photo.id}
                className={styles.photoCard}
                onClick={() => setActivePhotoIndex(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setActivePhotoIndex(index);
                }}
                aria-label={`Ver foto de ${photo.uploaderName}`}
              >
                <div className={styles.photoThumbWrapper}>
                  <img
                    src={getMediaUrl(photo.imageUrl)}
                    alt={photo.caption || `Foto de ${photo.uploaderName}`}
                    className={styles.photoImg}
                    loading="lazy"
                  />
                  <button
                    type="button"
                    className={styles.cardQuickDownloadBtn}
                    onClick={(e) => handleDownload(e, photo)}
                    aria-label={`Descargar foto de ${photo.uploaderName}`}
                    title="Descargar foto"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="15"
                      height="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                </div>
                <div className={styles.cardFooter}>
                  <div className={styles.authorRow}>
                    <span className={styles.authorTag}>👤 {photo.uploaderName}</span>
                    <span className={styles.timestamp}>{formatDate(photo.createdAt)}</span>
                  </div>
                  {photo.caption && <p className={styles.captionText}>{photo.caption}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Subida */}
      <GuestPhotoUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPhotosUploaded={handlePhotosUploaded}
      />

      {/* Lightbox a pantalla completa con navegación por flechas y deslizamiento */}
      {activePhoto && activePhotoIndex !== null && (
        <div
          className={styles.lightboxBackdrop}
          onClick={() => setActivePhotoIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.lightboxCard}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className={styles.lightboxTopBar}>
              <button
                type="button"
                className={styles.lightboxDownloadActionBtn}
                onClick={(e) => handleDownload(e, activePhoto)}
                aria-label="Descargar foto"
                title="Descargar foto en tu dispositivo"
                disabled={isDownloading}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>{isDownloading ? 'Descargando...' : 'Descargar'}</span>
              </button>

              <button
                type="button"
                className={styles.lightboxCloseBtn}
                onClick={() => setActivePhotoIndex(null)}
                aria-label="Cerrar foto"
                title="Cerrar (Esc)"
              >
                ✕
              </button>
            </div>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.lightboxNavBtn} ${styles.lightboxPrevBtn}`}
                  onClick={handlePrevPhoto}
                  aria-label="Foto anterior"
                  title="Foto anterior (Flecha izquierda)"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className={`${styles.lightboxNavBtn} ${styles.lightboxNextBtn}`}
                  onClick={handleNextPhoto}
                  aria-label="Foto siguiente"
                  title="Foto siguiente (Flecha derecha)"
                >
                  ›
                </button>
              </>
            )}

            <div className={styles.lightboxImageContainer}>
              <img
                src={getMediaUrl(activePhoto.imageUrl)}
                alt={activePhoto.caption || `Foto de ${activePhoto.uploaderName}`}
                className={styles.lightboxImg}
              />
            </div>

            <div className={styles.lightboxDetails}>
              <div className={styles.lightboxInfoRow}>
                <span className={styles.lightboxAuthor}>👤 Foto de: {activePhoto.uploaderName}</span>
                <div className={styles.lightboxInfoRight}>
                  <button
                    type="button"
                    className={styles.lightboxDetailsDownloadBtn}
                    onClick={(e) => handleDownload(e, activePhoto)}
                    aria-label="Descargar foto"
                    disabled={isDownloading}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>{isDownloading ? 'Descargando...' : 'Descargar'}</span>
                  </button>
                  {photos.length > 1 && (
                    <span className={styles.lightboxCounter}>
                      {activePhotoIndex + 1} de {photos.length}
                    </span>
                  )}
                </div>
              </div>
              {activePhoto.caption && (
                <p className={styles.lightboxCaption}>"{activePhoto.caption}"</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
