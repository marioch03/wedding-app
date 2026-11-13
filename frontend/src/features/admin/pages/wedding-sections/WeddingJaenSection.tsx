import React, { useState, useRef } from 'react';
import { DEFAULT_JAEN_TITLE, type BarItem } from '../../../../types';
import { mediaApi } from '../../../../lib/api/media';
import { getMediaUrl } from '../../../../common/utils/media';
import { sanitizeGoogleMapsInput } from './WeddingHotelsSection';
import styles from '../AdminWeddingPage.module.css';

interface WeddingJaenSectionProps {
  jaenTitle: string;
  setJaenTitle: (value: string) => void;
  jaenText: string;
  setJaenText: (value: string) => void;
  bars: BarItem[];
  setBars: React.Dispatch<React.SetStateAction<BarItem[]>>;
  onError: (message: string) => void;
  saving: boolean;
  loading: boolean;
  saveSuccess: boolean;
}

const DEFAULT_BAR_IMAGE =
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=300&q=80';

export const WeddingJaenSection: React.FC<WeddingJaenSectionProps> = ({
  jaenTitle,
  setJaenTitle,
  jaenText,
  setJaenText,
  bars,
  setBars,
  onError,
  saving,
  loading,
  saveSuccess,
}) => {
  const [isAddingBar, setIsAddingBar] = useState(false);
  const [editingBarId, setEditingBarId] = useState<string | null>(null);

  // Formulario esencial de Bar
  const [barName, setBarName] = useState('');
  const [barAddress, setBarAddress] = useState('');
  const [barDescription, setBarDescription] = useState('');
  const [barGoogleMapsUrl, setBarGoogleMapsUrl] = useState('');
  const [barWebsiteUrl, setBarWebsiteUrl] = useState('');
  const [barImageUrl, setBarImageUrl] = useState('');
  const [uploadingBarImage, setUploadingBarImage] = useState(false);
  const barFileInputRef = useRef<HTMLInputElement>(null);

  const resetBarForm = () => {
    setBarName('');
    setBarAddress('');
    setBarDescription('');
    setBarGoogleMapsUrl('');
    setBarWebsiteUrl('');
    setBarImageUrl('');
    setEditingBarId(null);
    setIsAddingBar(false);
  };

  const handleStartAddBar = () => {
    resetBarForm();
    setIsAddingBar(true);
  };

  const handleStartEditBar = (b: BarItem) => {
    setEditingBarId(b.id);
    setIsAddingBar(true);
    setBarName(b.name);
    setBarAddress(b.address || '');
    setBarDescription(b.description || '');
    setBarGoogleMapsUrl(b.googleMapsUrl || '');
    setBarWebsiteUrl(b.websiteUrl || '');
    setBarImageUrl(b.imageUrl || '');
  };

  const handleUploadBarImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError(
        'El archivo seleccionado debe ser una imagen válida (JPG, PNG, WebP o GIF)'
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onError('La imagen no puede superar los 10MB de tamaño');
      return;
    }
    try {
      setUploadingBarImage(true);
      const res = await mediaApi.uploadImage(file);
      setBarImageUrl(res.url);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Error al subir la fotografía del bar';
      onError(msg);
    } finally {
      setUploadingBarImage(false);
    }
  };

  const handleSaveBar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barName.trim()) {
      alert('El nombre del bar es obligatorio.');
      return;
    }

    const newBar: BarItem = {
      id:
        editingBarId ||
        `bar-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: barName.trim(),
      address: barAddress.trim() || undefined,
      description: barDescription.trim() || undefined,
      googleMapsUrl: sanitizeGoogleMapsInput(barGoogleMapsUrl) || undefined,
      websiteUrl: barWebsiteUrl.trim() || undefined,
      imageUrl: barImageUrl.trim() || undefined,
    };

    if (editingBarId) {
      setBars((prev) =>
        prev.map((b) => (b.id === editingBarId ? newBar : b))
      );
    } else {
      setBars((prev) => [...prev, newBar]);
    }

    resetBarForm();
  };

  const handleDeleteBar = (id: string) => {
    if (!confirm('¿Eliminar este bar de las recomendaciones?')) return;
    setBars((prev) => prev.filter((b) => b.id !== id));
    if (editingBarId === id) resetBarForm();
  };

  const handleMoveBar = (index: number, direction: 'up' | 'down') => {
    setBars((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const renderBarForm = () => (
    <div className={styles.hotelFormContainer}>
      <div className={styles.hotelFormHeader}>
        <span className={styles.hotelFormTitle}>
          {editingBarId ? '✏️ Editar Bar Recomendado' : '➕ Nuevo Bar Recomendado'}
        </span>
        <button
          type="button"
          className={styles.hotelFormCloseBtn}
          onClick={resetBarForm}
          title="Cerrar formulario"
          aria-label="Cerrar formulario"
        >
          ✕
        </button>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Nombre del Bar / Taberna *</label>
          <input
            type="text"
            className={styles.input}
            value={barName}
            onChange={(e) => setBarName(e.target.value)}
            placeholder="Ej. Taberna El Gorrión o La Manchega"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Ubicación / Dirección
            <span className={styles.labelHint}>(Calle, plaza o zona en Jaén)</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={barAddress}
            onChange={(e) => setBarAddress(e.target.value)}
            placeholder="Ej. Calle Arco del Consuelo 7, Jaén"
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Enlace o Embed de Google Maps
            <span className={styles.labelHint}>
              (Enlace o &lt;iframe&gt;. Se autogenera si se deja vacío)
            </span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={barGoogleMapsUrl}
            onChange={(e) =>
              setBarGoogleMapsUrl(sanitizeGoogleMapsInput(e.target.value))
            }
            placeholder="Pega el enlace de Google Maps o déjalo en blanco"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Enlace Web / Carta / Instagram (Opcional)
          </label>
          <input
            type="url"
            className={styles.input}
            value={barWebsiteUrl}
            onChange={(e) => setBarWebsiteUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Fotografía del Bar o Tapa (Opcional)
          <span className={styles.labelHint}>
            (Si no subes foto, se mostrará directamente el mapa interactivo de Google Maps)
          </span>
        </label>

        <div className={styles.customSectionsHeader}>
          <input
            type="file"
            ref={barFileInputRef}
            accept="image/*"
            className={styles.hiddenFileInput}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadBarImage(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className={styles.uploadButtonOutline}
            onClick={() => barFileInputRef.current?.click()}
            disabled={uploadingBarImage}
          >
            <span>📁</span>
            {uploadingBarImage
              ? 'Subiendo imagen...'
              : 'Subir foto desde tu equipo'}
          </button>

          {uploadingBarImage && (
            <div className={styles.uploadStatusBadge}>
              <span className={styles.uploadSpinner} />
              Subiendo archivo...
            </div>
          )}
        </div>

        {barImageUrl && (
          <div className={styles.assignedImageBar}>
            <span className={styles.assignedImageText}>
              ✓ Imagen asignada: {barImageUrl.split('/').pop()}
            </span>
            <button
              type="button"
              onClick={() => setBarImageUrl('')}
              className={styles.removePhotoBtn}
            >
              ✕ Quitar foto
            </button>
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Recomendación / Descripción del Bar
          <span className={styles.labelHint}>
            (Especialidad, mejores tapas, ambiente...)
          </span>
        </label>
        <textarea
          className={styles.textarea}
          rows={2}
          value={barDescription}
          onChange={(e) => setBarDescription(e.target.value)}
          placeholder="Ej. Parada obligatoria en las tascas para probar el flamenquín y sus tapas clásicas."
        />
      </div>

      <div className={styles.hotelFormActions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={resetBarForm}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={styles.addSectionBtn}
          onClick={handleSaveBar}
        >
          {editingBarId ? '✓ Actualizar Bar' : '✓ Añadir Bar'}
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>🫒</div>
        <div>
          <h2 className={styles.sectionTitle}>Y en Jaén....¿qué? 🌿 🫒</h2>
          <span className={styles.sectionSubtitle}>
            Texto editorial en formato justificado sobre Jaén y recomendaciones de bares para los invitados
          </span>
        </div>
      </div>

      <div className={styles.sectionBody}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="jaenTitleInput">
            Título de la Sección
            <span className={styles.labelHint}>
              (Por defecto: «{DEFAULT_JAEN_TITLE}»)
            </span>
          </label>
          <input
            id="jaenTitleInput"
            type="text"
            className={styles.input}
            value={jaenTitle}
            onChange={(e) => setJaenTitle(e.target.value)}
            placeholder={DEFAULT_JAEN_TITLE}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="jaenTextInput">
            Texto sobre Jaén (se mostrará en formato justificado)
            <span className={styles.labelHint}>
              (Habla sobre la ciudad, qué visitar, cultura del tapeo, el mar de olivos...)
            </span>
          </label>
          <textarea
            id="jaenTextInput"
            className={`${styles.textarea} ${styles.textareaJustified}`}
            value={jaenText}
            onChange={(e) => setJaenText(e.target.value)}
            placeholder="Escribe aquí lo que quieras contar a los invitados sobre Jaén, su catedral, sus calles y su gastronomía..."
            rows={5}
          />
        </div>

        <div className={styles.customSectionsContainer}>
          <div className={styles.customSectionsHeader}>
            <div>
              <h3 className={styles.customSectionsTitle}>
                <span>🍻</span> Bares y Tapas Recomendados ({bars.length})
              </h3>
              <span className={styles.labelHint}>
                Añade vuestros bares, tascas y tabernas favoritas de Jaén con su ubicación
              </span>
            </div>
            {!isAddingBar && (
              <button
                type="button"
                className={styles.addSectionBtn}
                onClick={handleStartAddBar}
              >
                + Añadir Bar Recomendado
              </button>
            )}
          </div>

          {isAddingBar && !editingBarId && renderBarForm()}

          {bars.length === 0 && !isAddingBar ? (
            <div className={styles.emptyCustomSections}>
              <span>No hay bares recomendados añadidos todavía.</span>
              <button
                type="button"
                className={styles.addSectionBtn}
                onClick={handleStartAddBar}
              >
                + Añadir el primer bar recomendado
              </button>
            </div>
          ) : (
            <div className={styles.customSectionsList}>
              {bars.map((b, index) => {
                if (editingBarId === b.id) {
                  return (
                    <div key={b.id} id={`bar-edit-container-${b.id}`}>
                      {renderBarForm()}
                    </div>
                  );
                }

                return (
                  <div key={b.id} className={styles.hotelItemCard}>
                    <div className={styles.hotelItemHeader}>
                      <div className={styles.sectionActions}>
                        <img
                          src={
                            b.imageUrl
                              ? getMediaUrl(b.imageUrl)
                              : DEFAULT_BAR_IMAGE
                          }
                          alt={b.name}
                          className={styles.presetThumb}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              DEFAULT_BAR_IMAGE;
                          }}
                        />
                        <div>
                          <div className={styles.hotelItemTitle}>
                            <span>🍻</span>
                            <span>{b.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.hotelActionsGroup}>
                        <button
                          type="button"
                          className={styles.moveBtn}
                          onClick={() => handleMoveBar(index, 'up')}
                          disabled={index === 0}
                          title="Mover arriba"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className={styles.moveBtn}
                          onClick={() => handleMoveBar(index, 'down')}
                          disabled={index === bars.length - 1}
                          title="Mover abajo"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          className={styles.editBtn}
                          onClick={() => handleStartEditBar(b)}
                          title="Editar bar"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteBar(b.id)}
                          title="Eliminar bar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {b.address && (
                      <div className={styles.hotelMetaText}>
                        📍 <strong>Ubicación:</strong> {b.address}
                      </div>
                    )}

                    {b.description && (
                      <div className={styles.hotelMetaText}>
                        {b.description}
                      </div>
                    )}

                    {b.websiteUrl && (
                      <div className={styles.hotelMetaText}>
                        🌐{' '}
                        <a
                          href={b.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {b.websiteUrl}
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.customSectionsFooter}>
          <button
            type="button"
            className={styles.quickSamplesBtn}
            onClick={() => setJaenTitle(DEFAULT_JAEN_TITLE)}
          >
            ↺ Restaurar título predeterminado
          </button>

          <button
            type="submit"
            form="weddingConfigForm"
            className={`${styles.sectionSaveBtn} ${
              saveSuccess ? styles.saveButtonSuccess : ''
            }`}
            disabled={saving || loading}
          >
            {saving
              ? 'Guardando...'
              : saveSuccess
              ? '✓ ¡Guardado con Éxito!'
              : '💾 Guardar Sección Jaén'}
          </button>
        </div>
      </div>
    </div>
  );
};
