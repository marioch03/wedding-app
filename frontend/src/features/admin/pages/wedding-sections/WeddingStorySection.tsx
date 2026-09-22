import React from 'react';
import { getMediaUrl } from '../../../../common/utils/media';
import styles from '../AdminWeddingPage.module.css';

interface WeddingStorySectionProps {
  storyTitle: string;
  setStoryTitle: (value: string) => void;
  storyText: string;
  setStoryText: (value: string) => void;
  storyImageUrl: string;
  setStoryImageUrl: (value: string) => void;
  uploadingStory: boolean;
  storyInputRef: React.RefObject<HTMLInputElement | null>;
  dragOverStory: boolean;
  setDragOverStory: (value: boolean) => void;
  onUploadStoryFile: (file: File) => void;
}

export const WeddingStorySection: React.FC<WeddingStorySectionProps> = ({
  storyTitle,
  setStoryTitle,
  storyText,
  setStoryText,
  storyImageUrl,
  setStoryImageUrl,
  uploadingStory,
  storyInputRef,
  dragOverStory,
  setDragOverStory,
  onUploadStoryFile,
}) => {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>📖</div>
        <div>
          <h2 className={styles.sectionTitle}>Nuestra Historia</h2>
          <span className={styles.sectionSubtitle}>
            Comparte con vuestros seres queridos cómo os conocisteis y momentos memorables
          </span>
        </div>
      </div>

      <div className={styles.sectionBody}>
        <div className={styles.storyLayoutGrid}>
          {/* Polaroid Frame Preview */}
          <div className={styles.polaroidFrame}>
            {storyImageUrl ? (
              <img
                src={getMediaUrl(storyImageUrl)}
                alt="Foto de la historia"
                className={styles.polaroidPhoto}
              />
            ) : (
              <div
                style={{
                  height: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--color-bg-subtle)',
                  borderRadius: '4px',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  padding: '1rem',
                  border: '1px dashed var(--color-border)',
                }}
              >
                <span style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>📷</span>
                <span>Sin foto seleccionada</span>
              </div>
            )}
            <div className={styles.polaroidCaption}>Nuestra Historia ❦</div>
          </div>

          {/* Story Content Form */}
          <div className={styles.storyContentForm}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Título de la Historia</label>
              <input
                type="text"
                className={styles.input}
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                placeholder="Ej. Cómo empezó todo o El viaje hasta aquí"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Fotografía de la Historia
                <span className={styles.labelHint}>(Formato vertical o cuadrado para marco Polaroid)</span>
              </label>

              {/* Dropzone Polaroid */}
              <div
                className={`${styles.uploadDropzone} ${dragOverStory ? styles.uploadDropzoneActive : ''}`}
                style={{ padding: '1.25rem' }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverStory(true);
                }}
                onDragLeave={() => setDragOverStory(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverStory(false);
                  if (e.dataTransfer.files?.[0]) {
                    onUploadStoryFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => storyInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') storyInputRef.current?.click();
                }}
              >
                <input
                  ref={storyInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenFileInput}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      onUploadStoryFile(e.target.files[0]);
                    }
                  }}
                />
                <div className={styles.uploadIcon} style={{ fontSize: '1.75rem' }}>📷</div>
                <div className={styles.uploadTitle}>
                  {uploadingStory
                    ? 'Subiendo fotografía...'
                    : storyImageUrl
                    ? 'Cambiar fotografía Polaroid'
                    : 'Subir fotografía desde tu equipo'}
                </div>
                <div className={styles.uploadSubtitle}>
                  Haz clic o arrastra una imagen (JPG, PNG, WebP • máx. 10MB)
                </div>

                {uploadingStory && (
                  <div className={styles.uploadStatusBadge}>
                    <span className={styles.uploadSpinner} />
                    Subiendo foto...
                  </div>
                )}
              </div>

              {storyImageUrl && (
                <div className={styles.assignedImageBar}>
                  <span className={styles.assignedImageText}>
                    ✓ Imagen asignada: {storyImageUrl.split('/').pop()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStoryImageUrl('')}
                    className={styles.removePhotoBtn}
                  >
                    Quitar foto
                  </button>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Texto de la Historia</label>
              <textarea
                className={styles.textarea}
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                placeholder="Escribe aquí vuestra historia, anécdotas de cómo os conocisteis, la pedida de mano..."
                rows={5}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
