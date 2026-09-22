import React from 'react';
import type { GalleryPhotoItem } from '../../../../types';
import { getMediaUrl } from '../../../../common/utils/media';
import styles from '../AdminWeddingPage.module.css';

interface WeddingGallerySectionProps {
  galleryPhotos: GalleryPhotoItem[];
  uploadingGallery: boolean;
  uploadGalleryProgress: string | null;
  galleryInputRef: React.RefObject<HTMLInputElement | null>;
  dragOverGallery: boolean;
  setDragOverGallery: (value: boolean) => void;
  onUploadGalleryFiles: (files: FileList | File[]) => void;
  onDeletePhoto: (index: number) => void;
  onUpdateCaption: (index: number, caption: string) => void;
}

export const WeddingGallerySection: React.FC<WeddingGallerySectionProps> = ({
  galleryPhotos,
  uploadingGallery,
  uploadGalleryProgress,
  galleryInputRef,
  dragOverGallery,
  setDragOverGallery,
  onUploadGalleryFiles,
  onDeletePhoto,
  onUpdateCaption,
}) => {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>📸</div>
        <div>
          <h2 className={styles.sectionTitle}>Álbum de Fotos & Recuerdos (Momentos Especiales)</h2>
          <span className={styles.sectionSubtitle}>
            Sube las fotografías desde tu dispositivo y personaliza el título o pie de foto de cada momento
          </span>
        </div>
      </div>

      <div className={styles.sectionBody}>
        {/* Subida Múltiple al Álbum */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Fotografías del Álbum
            <span className={styles.labelHint}>(Selecciona o arrastra una o varias fotos a la vez)</span>
          </label>

          <div
            className={`${styles.uploadDropzone} ${dragOverGallery ? styles.uploadDropzoneActive : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverGallery(true);
            }}
            onDragLeave={() => setDragOverGallery(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverGallery(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                onUploadGalleryFiles(e.dataTransfer.files);
              }
            }}
            onClick={() => galleryInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') galleryInputRef.current?.click();
            }}
          >
            <input
              ref={galleryInputRef}
              type="file"
              multiple
              accept="image/*"
              className={styles.hiddenFileInput}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onUploadGalleryFiles(e.target.files);
                }
              }}
            />
            <div className={styles.uploadIcon}>📸</div>
            <div className={styles.uploadTitle}>
              {uploadingGallery
                ? (uploadGalleryProgress || 'Subiendo fotografías...')
                : 'Arrastra tus fotos aquí o haz clic para seleccionarlas'}
            </div>
            <div className={styles.uploadSubtitle}>
              Sube múltiples fotos de golpe (JPG, PNG, WebP • hasta 10MB c/u)
            </div>

            {uploadingGallery && (
              <div className={styles.uploadStatusBadge}>
                <span className={styles.uploadSpinner} />
                {uploadGalleryProgress || 'Subiendo fotos...'}
              </div>
            )}
          </div>
        </div>

        {galleryPhotos.length === 0 ? (
          <div className={styles.emptyGallery}>
            <span style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>📷</span>
            <span style={{ fontWeight: 600 }}>No hay fotografías en el álbum todavía.</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Usa la zona superior para subir tus fotos favoritas desde tu equipo.
            </span>
          </div>
        ) : (
          <div className={styles.galleryGrid}>
            {galleryPhotos.map((photo, idx) => (
              <div key={idx} className={styles.galleryCardWithCaption}>
                <div className={styles.galleryCardImageWrapper}>
                  <img
                    src={getMediaUrl(photo.url)}
                    alt={photo.caption || `Foto ${idx + 1}`}
                    className={styles.galleryPhoto}
                  />
                  <button
                    type="button"
                    className={styles.deletePhotoBtn}
                    onClick={() => onDeletePhoto(idx)}
                    title="Eliminar foto"
                  >
                    ✕
                  </button>
                </div>
                <div className={styles.galleryCaptionWrapper}>
                  <input
                    type="text"
                    className={styles.galleryCaptionInput}
                    value={photo.caption || ''}
                    onChange={(e) => onUpdateCaption(idx, e.target.value)}
                    placeholder="Pie de foto (ej. Día del compromiso)"
                    title="Título o pie de foto para este momento"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
