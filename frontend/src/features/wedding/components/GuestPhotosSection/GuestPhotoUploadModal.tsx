import React, { useState, useRef } from 'react';
import { guestPhotosApi } from '../../../../lib/api/guestPhotos';
import type { GuestPhoto } from '../../../../types';
import styles from './GuestPhotoUploadModal.module.css';

interface GuestPhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotosUploaded: (newPhotos: GuestPhoto[]) => void;
}

export const GuestPhotoUploadModal: React.FC<GuestPhotoUploadModalProps> = ({
  isOpen,
  onClose,
  onPhotosUploaded,
}) => {
  const [uploaderName, setUploaderName] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (newFiles.length === 0) {
      setError('Por favor, selecciona archivos de imagen válidos (JPG, PNG, WebP).');
      return;
    }

    if (selectedFiles.length + newFiles.length > 10) {
      setError('Puedes subir un máximo de 10 fotos por cada envío.');
      return;
    }

    setError(null);
    const combinedFiles = [...selectedFiles, ...newFiles].slice(0, 10);
    setSelectedFiles(combinedFiles);

    // Generar URLs para previsualización local
    const newPreviews = combinedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newPreviews);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(updatedPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploaderName.trim()) {
      setError('Indica tu nombre para que los novios sepan quién tomó la foto.');
      return;
    }

    if (selectedFiles.length === 0) {
      setError('Selecciona al menos una foto para subir.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const uploaded = await guestPhotosApi.uploadPublic(
        uploaderName.trim(),
        caption.trim() || undefined,
        selectedFiles
      );
      onPhotosUploaded(uploaded);
      onClose();
    } catch (err) {
      console.error('Error al subir fotos de invitado:', err);
      setError('Ocurrió un error al subir las fotos. Comprueba tu conexión y vuelve a intentarlo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            <span>📸</span> Subir Fotos a la Boda
          </h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.label}>¿Quién eres? (Tu nombre o grupo) *</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Ej. Tía Carmen / Amigos del novio"
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              required
              disabled={isUploading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Dedicatoria o momento (opcional)</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Ej. ¡Vaya baile! / Momentazo en el banquete"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Fotografías ({selectedFiles.length}/10)</label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                handleFilesSelected(e.target.files);
                e.target.value = '';
              }}
              disabled={isUploading}
            />

            <div
              className={styles.dropZone}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  fileInputRef.current?.click();
                }
              }}
            >
              <span className={styles.dropIcon}>📷</span>
              <p className={styles.dropText}>Toca para seleccionar o tomar fotos</p>
              <p className={styles.dropHint}>Puedes seleccionar hasta 10 fotos a la vez (JPG, PNG, WebP)</p>
            </div>

            {previewUrls.length > 0 && (
              <div className={styles.previewGrid}>
                {previewUrls.map((url, idx) => (
                  <div key={idx} className={styles.previewItem}>
                    <img src={url} alt={`Vista previa ${idx + 1}`} className={styles.previewImg} />
                    {!isUploading && (
                      <button
                        type="button"
                        className={styles.removeImgBtn}
                        onClick={() => handleRemoveFile(idx)}
                        title="Eliminar foto"
                        aria-label={`Eliminar foto ${idx + 1}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isUploading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isUploading || selectedFiles.length === 0}
            >
              {isUploading ? 'Subiendo fotos...' : `✓ Compartir ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
