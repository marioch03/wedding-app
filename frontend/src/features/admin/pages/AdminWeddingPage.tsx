import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import type {
  WeddingResponse,
  WeddingRequest,
  WeddingContent,
  PracticalDetailSection,
  GalleryPhotoItem,
} from '../../../types';
import { weddingApi } from '../../../lib/api';
import { mediaApi } from '../../../lib/api/media';
import { usePageTitle } from '../../../common/hooks';
import { getMediaUrl } from '../../../common/utils/media';
import styles from './AdminWeddingPage.module.css';

// Fotos de muestra elegantes de Unsplash para sugerencias rápidas
const SAMPLE_COVER_PHOTOS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1600&q=85',
];

const SUGGESTED_SECTION_ICONS = ['🎁', '👶', '🎵', '📸', '🅿️', '🐾', '💍', '🍽️', '💡', 'ℹ️', '📍', '🍸'];

export const AdminWeddingPage: React.FC = () => {
  usePageTitle('Configuración de la Boda | Panel de Administración');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [partner1Name, setPartner1Name] = useState('');
  const [partner2Name, setPartner2Name] = useState('');
  const [weddingDate, setWeddingDate] = useState('');

  // Content Fields
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [storyText, setStoryText] = useState('');
  const [storyImageUrl, setStoryImageUrl] = useState('');

  // Gallery (Momentos Especiales)
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhotoItem[]>([]);

  // Upload States
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingStory, setUploadingStory] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadGalleryProgress, setUploadGalleryProgress] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Drag over states
  const [dragOverCover, setDragOverCover] = useState(false);
  const [dragOverStory, setDragOverStory] = useState(false);
  const [dragOverGallery, setDragOverGallery] = useState(false);

  // File input refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const storyInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Practical Details
  const [customSections, setCustomSections] = useState<PracticalDetailSection[]>([]);

  const loadWeddingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: WeddingResponse = await weddingApi.getCurrentAdmin();

      setPartner1Name(data.partner1Name || '');
      setPartner2Name(data.partner2Name || '');
      setWeddingDate(data.weddingDate || '');

      const content = data.content || {};
      setHeroSubtitle(content.heroSubtitle || '¡Nos casamos!');
      setCoverImageUrl(content.coverImageUrl || SAMPLE_COVER_PHOTOS[0]);
      setStoryTitle(content.storyTitle || 'Cómo empezó todo');
      setStoryText(content.storyText || '');
      setStoryImageUrl(content.storyImageUrl || '');

      const loadedGallery: GalleryPhotoItem[] = (content.galleryImages || []).map((item, idx) => {
        if (typeof item === 'string') {
          return { url: item, caption: `Momento especial ${idx + 1}` };
        }
        return { url: item.url, caption: item.caption || `Momento especial ${idx + 1}` };
      });
      setGalleryPhotos(loadedGallery);

      setCustomSections(content.customSections || []);
    } catch (err: unknown) {
      console.error('Error loading wedding configuration:', err);
      const msg = err instanceof Error ? err.message : 'Error al cargar los datos de la boda.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeddingData();
  }, []);

  // Monogram & Days Calculation
  const monogram = useMemo(() => {
    const p1 = partner1Name.trim() ? partner1Name.trim().charAt(0) : 'L';
    const p2 = partner2Name.trim() ? partner2Name.trim().charAt(0) : 'M';
    return `${p1} & ${p2}`;
  }, [partner1Name, partner2Name]);

  const daysLeft = useMemo(() => {
    if (!weddingDate) return null;
    const target = new Date(`${weddingDate}T00:00:00`).getTime();
    const now = new Date().getTime();
    const diff = target - now;
    if (diff <= 0) return 0;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, [weddingDate]);

  // Upload Handlers
  const handleUploadCoverFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setMediaError('El archivo seleccionado debe ser una imagen válida (JPG, PNG, WebP o GIF)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMediaError('La imagen no puede superar los 10MB de tamaño');
      return;
    }
    try {
      setUploadingCover(true);
      setMediaError(null);
      const res = await mediaApi.uploadImage(file);
      setCoverImageUrl(res.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir la fotografía de portada';
      setMediaError(msg);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleUploadStoryFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setMediaError('El archivo seleccionado debe ser una imagen válida (JPG, PNG, WebP o GIF)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMediaError('La imagen no puede superar los 10MB de tamaño');
      return;
    }
    try {
      setUploadingStory(true);
      setMediaError(null);
      const res = await mediaApi.uploadImage(file);
      setStoryImageUrl(res.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir la fotografía de la historia';
      setMediaError(msg);
    } finally {
      setUploadingStory(false);
    }
  };

  const handleUploadGalleryFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(
      (f) => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024
    );

    if (validFiles.length === 0) {
      setMediaError('Por favor selecciona imágenes válidas de hasta 10MB (JPG, PNG, WebP)');
      return;
    }

    try {
      setUploadingGallery(true);
      setMediaError(null);
      setUploadGalleryProgress(`Subiendo ${validFiles.length} foto${validFiles.length > 1 ? 's' : ''}...`);
      const responses = await mediaApi.uploadMultipleImages(validFiles);
      const newItems: GalleryPhotoItem[] = responses.map((r, i) => ({
        url: r.url,
        caption: `Momento especial ${galleryPhotos.length + i + 1}`,
      }));
      setGalleryPhotos((prev) => [...prev, ...newItems]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir las fotografías al álbum';
      setMediaError(msg);
    } finally {
      setUploadingGallery(false);
      setUploadGalleryProgress(null);
    }
  };

  // Gallery Handlers
  const handleUpdateGalleryCaption = (index: number, caption: string) => {
    setGalleryPhotos((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], caption };
      return next;
    });
  };

  const handleDeletePhoto = (index: number) => {
    setGalleryPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Custom Sections Handlers
  const handleAddSection = () => {
    const newSection: PracticalDetailSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: '',
      description: '',
      icon: '🎁',
    };
    setCustomSections((prev) => [...prev, newSection]);
  };

  const handleUpdateSection = (
    index: number,
    field: keyof PracticalDetailSection,
    value: string
  ) => {
    setCustomSections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleDeleteSection = (index: number) => {
    setCustomSections((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    setCustomSections((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!partner1Name.trim() || !partner2Name.trim()) {
      setError('Debes especificar el nombre de ambos contrayentes.');
      return;
    }

    if (!weddingDate) {
      setError('Debes especificar la fecha del enlace.');
      return;
    }

    const validSections = customSections
      .filter((s) => s.title.trim() || s.description.trim())
      .map((s) => ({
        id: s.id,
        title: s.title.trim(),
        description: s.description.trim(),
        icon: s.icon?.trim() || 'ℹ️',
      }));

    const contentPayload: WeddingContent = {
      heroSubtitle: heroSubtitle.trim() || undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
      storyTitle: storyTitle.trim() || undefined,
      storyText: storyText.trim() || undefined,
      storyImageUrl: storyImageUrl.trim() || undefined,
      galleryImages: galleryPhotos.length > 0 ? galleryPhotos : undefined,
      customSections: validSections.length > 0 ? validSections : undefined,
    };

    const payload: WeddingRequest = {
      partner1Name: partner1Name.trim(),
      partner2Name: partner2Name.trim(),
      weddingDate,
      content: contentPayload,
    };

    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);
      await weddingApi.updateCurrentAdmin(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      console.error('Error saving wedding settings:', err);
      const msg = err instanceof Error ? err.message : 'Error al guardar la configuración de la boda.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>
            <span>💍</span> Configuración de la Boda & Web
          </h1>
          <p className={styles.subtitle}>
            Personaliza los datos del enlace, fotografías de portada, historia y contenido de la web pública
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link to="/" target="_blank" rel="noreferrer" className={styles.publicLinkButton}>
            <span>👁️</span> Ver Web Pública
          </Link>
          <button
            type="submit"
            form="weddingConfigForm"
            className={`${styles.saveButton} ${saveSuccess ? styles.saveButtonSuccess : ''}`}
            disabled={saving || loading}
          >
            {saving ? (
              <>
                <span className={styles.uploadSpinner} style={{ borderTopColor: '#ffffff', width: '14px', height: '14px' }} />
                Guardando...
              </>
            ) : saveSuccess ? (
              '✓ ¡Guardado con Éxito!'
            ) : (
              '💾 Guardar Configuración'
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className={styles.savedAlert}>
          ✓ ¡Configuración guardada con éxito! Los cambios ya son visibles en la web pública.
        </div>
      )}

      {error && <div className={styles.errorAlert}>⚠️ {error}</div>}
      {mediaError && (
        <div className={styles.uploadErrorBanner}>
          <span>⚠️ {mediaError}</span>
          <button
            type="button"
            className={styles.uploadErrorClose}
            onClick={() => setMediaError(null)}
            aria-label="Cerrar aviso de error"
          >
            ✕
          </button>
        </div>
      )}

      <form id="weddingConfigForm" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* SECCIÓN 1: DATOS PRINCIPALES DE LA PAREJA */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>💒</div>
            <div>
              <h2 className={styles.sectionTitle}>La Pareja & Fecha del Enlace</h2>
              <span className={styles.sectionSubtitle}>
                Nombres que aparecerán en la cabecera, invitaciones y fecha oficial de la boda
              </span>
            </div>
          </div>

          <div className={styles.sectionBody}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Nombre Pareja 1 *
                  <span className={styles.labelHint}>(Ej. Lucía)</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={partner1Name}
                  onChange={(e) => setPartner1Name(e.target.value)}
                  placeholder="Nombre de la novia/novio"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Nombre Pareja 2 *
                  <span className={styles.labelHint}>(Ej. Marcos)</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={partner2Name}
                  onChange={(e) => setPartner2Name(e.target.value)}
                  placeholder="Nombre de la novia/novio"
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Fecha de la Boda *
                  <span className={styles.labelHint}>(Día del enlace matrimonial)</span>
                </label>
                <input
                  type="date"
                  className={styles.input}
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  required
                />
              </div>

              {/* Live Preview Box */}
              <div className={styles.couplePreviewBox}>
                <div>
                  <div className={styles.labelHint}>Vista previa del Monograma</div>
                  <div className={styles.monogramDisplay}>{monogram}</div>
                </div>

                {daysLeft !== null && (
                  <div className={styles.countdownDisplay}>
                    <span className={styles.countdownBadge}>
                      ⏳ {daysLeft === 0 ? '¡Hoy es el gran día!' : `Faltan ${daysLeft} días`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: PORTADA PRINCIPAL (HERO) */}
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
                    handleUploadCoverFile(e.dataTransfer.files[0]);
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
                      handleUploadCoverFile(e.target.files[0]);
                    }
                  }}
                />
                <div className={styles.uploadIcon}>🖼️</div>
                <div className={styles.uploadTitle}>
                  {uploadingCover ? 'Subiendo fotografía...' : 'Arrastra una foto aquí o haz clic para subir desde tu equipo'}
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

              {/* Opción alternativa: URL externa directa */}
              <div style={{ marginTop: '0.6rem' }}>
                <input
                  type="url"
                  className={styles.input}
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="O introduce una URL web externa (https://...)"
                />
              </div>
            </div>

            {/* Presets rápidos */}
            <div className={styles.presetPicker}>
              <span className={styles.presetLabel}>Presets románticos:</span>
              {SAMPLE_COVER_PHOTOS.map((url, idx) => (
                <img
                  key={idx}
                  src={getMediaUrl(url)}
                  alt={`Preset ${idx + 1}`}
                  className={styles.presetThumb}
                  onClick={() => setCoverImageUrl(url)}
                  title="Usar esta foto"
                />
              ))}
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

        {/* SECCIÓN 3: NUESTRA HISTORIA */}
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
                      background: 'var(--color-bg-subtle, #faf7f5)',
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                        handleUploadStoryFile(e.dataTransfer.files[0]);
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
                          handleUploadStoryFile(e.target.files[0]);
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem', padding: '0.35rem 0.6rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-text-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                        ✓ Imagen asignada: {storyImageUrl.split('/').pop()}
                      </span>
                      <button
                        type="button"
                        onClick={() => setStoryImageUrl('')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#c53030',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                          textDecoration: 'underline',
                          whiteSpace: 'nowrap',
                        }}
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

        {/* SECCIÓN 4: ÁLBUM INTERACTIVO (MOMENTOS ESPECIALES) */}
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
                    handleUploadGalleryFiles(e.dataTransfer.files);
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
                      handleUploadGalleryFiles(e.target.files);
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
                        onClick={() => handleDeletePhoto(idx)}
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
                        onChange={(e) => handleUpdateGalleryCaption(idx, e.target.value)}
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

        {/* SECCIÓN 5: DETALLES PRÁCTICOS PARA INVITADOS */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>ℹ️</div>
            <div>
              <h2 className={styles.sectionTitle}>Detalles Prácticos para Invitados</h2>
              <span className={styles.sectionSubtitle}>
                Tarjetas informativas útiles (código de vestimenta, transporte, alojamiento, regalos, niños, etc.)
              </span>
            </div>
          </div>

          <div className={styles.sectionBody}>
            {/* Secciones Personalizadas de Información */}
            <div className={styles.customSectionsContainer}>
              <div className={styles.customSectionsHeader}>
                <div>
                  <h3 className={styles.customSectionsTitle}>
                    <span>📑</span> Secciones Adicionales Personalizadas
                  </h3>
                  <span className={styles.labelHint}>
                    Añade tarjetas adicionales para regalos, lista de bodas, niños, fotos, peticiones musicales o cualquier otra indicación
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={styles.addSectionBtn}
                    onClick={handleAddSection}
                  >
                    + Añadir Sección
                  </button>
                  <button
                    type="submit"
                    form="weddingConfigForm"
                    className={styles.sectionSaveBtn}
                    disabled={saving || loading}
                  >
                    {saving ? 'Guardando...' : '💾 Guardar Secciones'}
                  </button>
                </div>
              </div>

              {customSections.length === 0 ? (
                <div className={styles.emptyCustomSections}>
                  <span>No hay secciones personalizadas adicionales añadidas todavía.</span>
                  <button
                    type="button"
                    className={styles.addSectionBtn}
                    onClick={handleAddSection}
                  >
                    + Añadir la primera sección (ej. Lista de Bodas o Niños)
                  </button>
                </div>
              ) : (
                <div className={styles.customSectionsList}>
                  {customSections.map((sec, index) => (
                    <div key={sec.id || index} className={styles.customSectionCard}>
                      <div className={styles.customSectionTop}>
                        <div className={styles.sectionBadge}>
                          <span>Sección {index + 1}</span>
                          {sec.title ? ` • ${sec.title}` : ''}
                        </div>
                        <div className={styles.sectionActions}>
                          <button
                            type="button"
                            className={styles.moveBtn}
                            onClick={() => handleMoveSection(index, 'up')}
                            disabled={index === 0}
                            title="Mover sección arriba"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className={styles.moveBtn}
                            onClick={() => handleMoveSection(index, 'down')}
                            disabled={index === customSections.length - 1}
                            title="Mover sección abajo"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            className={styles.deleteSectionBtn}
                            onClick={() => handleDeleteSection(index)}
                            title="Eliminar esta sección"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div className={styles.sectionIconRow}>
                        <label className={styles.label}>
                          Icono / Emoji de la Tarjeta
                          <span className={styles.labelHint}>(Elige uno sugerido o escribe el que prefieras)</span>
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            className={styles.customIconInput}
                            value={sec.icon || 'ℹ️'}
                            onChange={(e) => handleUpdateSection(index, 'icon', e.target.value)}
                            maxLength={4}
                            title="Emoji personalizado"
                          />
                          <div className={styles.iconChips}>
                            {SUGGESTED_SECTION_ICONS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                className={`${styles.iconChip} ${sec.icon === emoji ? styles.iconChipSelected : ''}`}
                                onClick={() => handleUpdateSection(index, 'icon', emoji)}
                                title={`Seleccionar ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          Título de la Sección *
                          <span className={styles.labelHint}>(Ej. Lista de Bodas & Regalos, Niños en el Enlace, Canciones...)</span>
                        </label>
                        <input
                          type="text"
                          className={styles.input}
                          value={sec.title}
                          onChange={(e) => handleUpdateSection(index, 'title', e.target.value)}
                          placeholder="Introduce un título descriptivo"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          Contenido / Descripción *
                          <span className={styles.labelHint}>(Información detallada que verán los invitados)</span>
                        </label>
                        <textarea
                          className={styles.textarea}
                          value={sec.description}
                          onChange={(e) => handleUpdateSection(index, 'description', e.target.value)}
                          placeholder="Escribe aquí las indicaciones o detalles para los invitados..."
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}

                  <div className={styles.customSectionsFooter}>
                    <button
                      type="button"
                      className={styles.addSectionBtn}
                      onClick={handleAddSection}
                    >
                      + Añadir Otra Sección
                    </button>
                    <button
                      type="submit"
                      form="weddingConfigForm"
                      className={`${styles.sectionSaveBtn} ${saveSuccess ? styles.saveButtonSuccess : ''}`}
                      disabled={saving || loading}
                    >
                      {saving ? (
                        <>
                          <span className={styles.uploadSpinner} style={{ borderTopColor: '#ffffff', width: '13px', height: '13px' }} />
                          Guardando...
                        </>
                      ) : saveSuccess ? (
                        '✓ ¡Guardado con Éxito!'
                      ) : (
                        '💾 Guardar Secciones'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Barra Inferior Fija de Guardado Accesible en Todo Momento */}
      <div className={styles.stickyFooterBar}>
        <div className={`${styles.stickyFooterContent} ${saveSuccess ? styles.stickyFooterSuccess : ''}`}>
          <div className={styles.stickyFooterText}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span className={styles.stickyFooterTitle}>Configuración de la Boda</span>
              {saveSuccess && (
                <span className={styles.stickySuccessBadge}>
                  ✓ ¡Guardado en la base de datos!
                </span>
              )}
            </div>
            <span
              className={styles.stickyFooterSubtitle}
              style={{
                color: saveSuccess ? '#15803d' : undefined,
                fontWeight: saveSuccess ? 600 : undefined,
              }}
            >
              {saving
                ? '⏳ Guardando cambios en el servidor...'
                : saveSuccess
                ? '✓ Todos los cambios, fotos y secciones se han guardado y publicado correctamente.'
                : 'Pulsa en Guardar para que las secciones, fotos y datos se mantengan y publiquen'}
            </span>
          </div>

          <div className={styles.headerActions}>
            <Link to="/" target="_blank" rel="noreferrer" className={styles.publicLinkButton}>
              <span>👁️</span> Ver Web Pública
            </Link>
            <button
              type="submit"
              form="weddingConfigForm"
              className={`${styles.saveButton} ${saveSuccess ? styles.saveButtonSuccess : ''}`}
              disabled={saving || loading}
            >
              {saving ? (
                <>
                  <span className={styles.uploadSpinner} style={{ borderTopColor: '#ffffff', width: '14px', height: '14px' }} />
                  Guardando...
                </>
              ) : saveSuccess ? (
                '✓ ¡Guardado con Éxito!'
              ) : (
                '💾 Guardar Configuración'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
