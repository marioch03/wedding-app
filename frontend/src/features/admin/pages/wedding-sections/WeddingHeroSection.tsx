import React from 'react';
import { getMediaUrl } from '../../../../common/utils/media';
import styles from '../AdminWeddingPage.module.css';

interface WeddingHeroSectionProps {
  heroSubtitle: string;
  setHeroSubtitle: (value: string) => void;
  coverImageUrl: string;
  setCoverImageUrl: (value: string) => void;
  uploadingCover: boolean;
  coverInputRef: React.RefObject<HTMLInputElement | null>;
  dragOverCover: boolean;
  setDragOverCover: (value: boolean) => void;
  onUploadCoverFile: (file: File) => void;
  partner1Name: string;
  partner2Name: string;
}

export const WeddingHeroSection: React.FC<WeddingHeroSectionProps> = ({
  heroSubtitle,
  setHeroSubtitle,
  coverImageUrl,
  setCoverImageUrl,
  uploadingCover,
  coverInputRef,
  dragOverCover,
  setDragOverCover,
  onUploadCoverFile,
  partner1Name,
  partner2Name,
}) => {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>✨</div>
        <div>
          <h2 className={styles.sectionTitle}>Portada Principal (Hero)</h2>
          <span className={styles.sectionSubtitle}>
            La primera impresión que verán tus invitados al acceder a la web de la boda
          </span>
        </div>
      </div>

      <div className={styles.sectionBody}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Subtítulo de Bienvenida
            <span className={styles.labelHint}>(Aparece sobre o bajo el monograma)</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            placeholder="Ej. ¡Nos casamos! o Bienvenidos a nuestra celebración"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Fotografía de Portada
            <span className={styles.labelHint}>(Imagen horizontal de alta calidad)</span>
          </label>

          {/* Zona de Subida / Dropzone */}
          <div
            className={`${styles.uploadDropzone} ${dragOverCover ? styles.uploadDropzoneActive : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverCover(true);
            }}
            onDragLeave={() => setDragOverCover(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverCover(false);
              if (e.dataTransfer.files?.[0]) {
                onUploadCoverFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => coverInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') coverInputRef.current?.click();
            }}
          >
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className={styles.hiddenFileInput}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  onUploadCoverFile(e.target.files[0]);
                }
              }}
            />
            <div className={styles.uploadIcon}>🖼️</div>
            <div className={styles.uploadTitle}>
              {uploadingCover
                ? 'Subiendo fotografía...'
                : coverImageUrl
                ? 'Cambiar fotografía de portada'
                : 'Arrastra una foto aquí o haz clic para subir desde tu equipo'}
            </div>
            <div className={styles.uploadSubtitle}>
              Formatos recomendados: JPG, PNG, WebP (máx. 10MB)
            </div>

            {uploadingCover && (
              <div className={styles.uploadStatusBadge}>
                <span className={styles.uploadSpinner} />
                Subiendo imagen...
              </div>
            )}
          </div>

          {/* Barra de imagen asignada */}
          {coverImageUrl && (
            <div className={styles.assignedImageBar} style={{ marginTop: '0.6rem' }}>
              <span className={styles.assignedImageText}>
                ✓ Imagen asignada: {coverImageUrl.split('/').pop()}
              </span>
              <button
                type="button"
                onClick={() => setCoverImageUrl('')}
                className={styles.removePhotoBtn}
              >
                Quitar foto
              </button>
            </div>
          )}

          {/* Opción alternativa: URL externa directa */}
          <div style={{ marginTop: '0.6rem' }}>
            <input
              type="text"
              className={styles.input}
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="O introduce una URL web externa (https://...)"
            />
          </div>
        </div>

        {/* Live Preview */}
        {coverImageUrl && (
          <div className={styles.imagePreviewWrapper}>
            <img src={getMediaUrl(coverImageUrl)} alt="Vista previa de portada" className={styles.imagePreview} />
            <div className={styles.imageOverlayBadge}>
              Vista previa de portada • {partner1Name} & {partner2Name}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
