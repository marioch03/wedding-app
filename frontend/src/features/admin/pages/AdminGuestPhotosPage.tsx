import React, { useState, useEffect } from 'react';
import { guestPhotosApi } from '../../../lib/api/guestPhotos';
import { getMediaUrl } from '../../../common/utils/media';
import { ConfirmModal } from '../../../common/components/ConfirmModal/ConfirmModal';
import type { GuestPhoto } from '../../../types';
import styles from './AdminGuestPhotosPage.module.css';

export const AdminGuestPhotosPage: React.FC = () => {
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<GuestPhoto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      const data = await guestPhotosApi.listAdmin();
      setPhotos(data);
    } catch (err) {
      console.error('Error al cargar fotos de invitados en admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleConfirmDelete = async () => {
    if (!photoToDelete) return;

    try {
      setIsDeleting(true);
      setErrorMessage(null);
      await guestPhotosApi.deleteAdmin(photoToDelete.id);
      setPhotos((prev) => prev.filter((p) => p.id !== photoToDelete.id));
      setPhotoToDelete(null);
    } catch (err) {
      console.error('Error al eliminar foto:', err);
      setErrorMessage('No se pudo eliminar la foto. Por favor, inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadZip = async () => {
    if (photos.length === 0) return;
    try {
      setIsDownloadingZip(true);
      const blob = await guestPhotosApi.downloadZipAdmin();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fotos-invitados-boda.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar archivo ZIP:', err);
      alert('Error al generar el archivo ZIP. Por favor, intenta más tarde.');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className={styles.container}>
      {errorMessage && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>⚠️ {errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            style={{ background: 'transparent', border: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 'bold' }}
            aria-label="Cerrar mensaje"
          >
            ✕
          </button>
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>
            <span>📸</span> Álbum de Fotos de los Invitados
          </h1>
          <p className={styles.subtitle}>
            Supervisa las fotos compartidas por los asistentes. Puedes eliminar cualquier foto no deseada o
            descargar todo el álbum en un archivo comprimido .ZIP de alta resolución.
          </p>
        </div>

        <div className={styles.actionsBar}>
          <span className={styles.counterBadge}>
            {photos.length} {photos.length === 1 ? 'foto subida' : 'fotos subidas'}
          </span>
          <button
            type="button"
            className={styles.zipButton}
            onClick={handleDownloadZip}
            disabled={isDownloadingZip || photos.length === 0}
            title="Descargar todas las fotos originales en un archivo .ZIP"
          >
            <span>📦</span>
            {isDownloadingZip ? 'Generando ZIP...' : 'Descargar Álbum (.ZIP)'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          Cargando fotos de invitados...
        </div>
      ) : photos.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📷</span>
          <h3>No hay fotos de invitados todavía</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto' }}>
            Las fotos que suban los invitados durante el evento aparecerán aquí inmediatamente para que
            puedas revisarlas y descargarlas.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {photos.map((photo) => (
            <div key={photo.id} className={styles.card}>
              <div className={styles.imgWrapper}>
                <img
                  src={getMediaUrl(photo.imageUrl)}
                  alt={photo.caption || `Foto de ${photo.uploaderName}`}
                  className={styles.img}
                  loading="lazy"
                />
              </div>
              <div className={styles.cardBody}>
                <span className={styles.author}>👤 {photo.uploaderName}</span>
                {photo.caption && <p className={styles.caption}>"{photo.caption}"</p>}
                <span className={styles.date}>{formatDate(photo.createdAt)}</span>
              </div>
              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => setPhotoToDelete(photo)}
                  title="Eliminar esta foto del álbum"
                  aria-label={`Eliminar foto de ${photo.uploaderName}`}
                >
                  <span>🗑️</span>
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Personalizado de Confirmación */}
      <ConfirmModal
        isOpen={Boolean(photoToDelete)}
        title="Eliminar Foto del Álbum"
        message={
          photoToDelete
            ? `¿Estás seguro de que deseas eliminar la foto de "${photoToDelete.uploaderName}"? Esta acción borrará la imagen permanentemente del álbum y del servidor.`
            : ''
        }
        confirmText="Sí, eliminar foto"
        cancelText="Cancelar"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => !isDeleting && setPhotoToDelete(null)}
      />
    </div>
  );
};
