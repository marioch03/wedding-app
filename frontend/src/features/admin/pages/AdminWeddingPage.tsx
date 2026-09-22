import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type {
  WeddingResponse,
  WeddingRequest,
  WeddingContent,
  PracticalDetailSection,
  GalleryPhotoItem,
  HotelItem,
} from '../../../types';
import { weddingApi } from '../../../lib/api';
import { mediaApi } from '../../../lib/api/media';
import { usePageTitle } from '../../../common/hooks';
import { applyCustomTheme, resetCustomTheme } from '../../../common/utils/theme';
import {
  WeddingCoupleSection,
  WeddingThemeSection,
  WeddingHeroSection,
  WeddingStorySection,
  WeddingGallerySection,
  WeddingCustomSections,
  WeddingHotelsSection,
  SAMPLE_COVER_PHOTOS,
} from './wedding-sections';
import styles from './AdminWeddingPage.module.css';

export const AdminWeddingPage: React.FC = () => {
  usePageTitle('Configuración de la Boda | Panel de Administración');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Form State: Pareja
  const [partner1Name, setPartner1Name] = useState('');
  const [partner2Name, setPartner2Name] = useState('');
  const [weddingDate, setWeddingDate] = useState('');

  // Color & Theme
  const [primaryColor, setPrimaryColor] = useState('');
  const [accentColor, setAccentColor] = useState('');

  // Portada (Hero)
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [dragOverCover, setDragOverCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Historia
  const [storyTitle, setStoryTitle] = useState('');
  const [storyText, setStoryText] = useState('');
  const [storyImageUrl, setStoryImageUrl] = useState('');
  const [uploadingStory, setUploadingStory] = useState(false);
  const [dragOverStory, setDragOverStory] = useState(false);
  const storyInputRef = useRef<HTMLInputElement>(null);

  // Galería (Momentos Especiales)
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhotoItem[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadGalleryProgress, setUploadGalleryProgress] = useState<string | null>(null);
  const [dragOverGallery, setDragOverGallery] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Secciones Prácticas
  const [customSections, setCustomSections] = useState<PracticalDetailSection[]>([]);

  // Hoteles / Alojamientos
  const [hotels, setHotels] = useState<HotelItem[]>([]);

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
      setHotels(content.hotels || []);

      const pColor = content.primaryColor || '';
      const aColor = content.accentColor || '';
      setPrimaryColor(pColor);
      setAccentColor(aColor);
      applyCustomTheme(pColor, aColor);
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

  // Upload Handlers: Portada
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

  // Upload Handlers: Historia
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

  // Upload Handlers: Galería
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

  const handleDeleteGalleryPhoto = (index: number) => {
    setGalleryPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateGalleryCaption = (index: number, caption: string) => {
    setGalleryPhotos((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], caption };
      return updated;
    });
  };

  // Secciones Prácticas Handlers
  const handleAddSection = () => {
    setCustomSections((prev) => [
      ...prev,
      {
        id: `section-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: '',
        description: '',
        icon: 'ℹ️',
      },
    ]);
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

  // Theme & Color Handlers
  const handlePrimaryColorChange = (newColor: string) => {
    setPrimaryColor(newColor);
    applyCustomTheme(newColor, accentColor);
  };

  const handleAccentColorChange = (newColor: string) => {
    setAccentColor(newColor);
    applyCustomTheme(primaryColor, newColor);
  };

  const handleResetColors = () => {
    setPrimaryColor('');
    setAccentColor('');
    resetCustomTheme();
  };

  // Guardado General
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
      hotels: hotels.length > 0 ? hotels : undefined,
      primaryColor: primaryColor.trim() || undefined,
      accentColor: accentColor.trim() || undefined,
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
                <span className={styles.uploadSpinner} style={{ borderTopColor: 'var(--color-text-on-primary)', width: '14px', height: '14px' }} />
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
        <WeddingCoupleSection
          partner1Name={partner1Name}
          setPartner1Name={setPartner1Name}
          partner2Name={partner2Name}
          setPartner2Name={setPartner2Name}
          weddingDate={weddingDate}
          setWeddingDate={setWeddingDate}
        />

        {/* SECCIÓN: PALETA DE COLOR Y ESTILO VISUAL */}
        <WeddingThemeSection
          primaryColor={primaryColor}
          accentColor={accentColor}
          onPrimaryColorChange={handlePrimaryColorChange}
          onAccentColorChange={handleAccentColorChange}
          onResetColors={handleResetColors}
        />

        {/* SECCIÓN 2: PORTADA PRINCIPAL (HERO) */}
        <WeddingHeroSection
          heroSubtitle={heroSubtitle}
          setHeroSubtitle={setHeroSubtitle}
          coverImageUrl={coverImageUrl}
          setCoverImageUrl={setCoverImageUrl}
          uploadingCover={uploadingCover}
          coverInputRef={coverInputRef}
          dragOverCover={dragOverCover}
          setDragOverCover={setDragOverCover}
          onUploadCoverFile={handleUploadCoverFile}
          partner1Name={partner1Name}
          partner2Name={partner2Name}
        />

        {/* SECCIÓN 3: NUESTRA HISTORIA */}
        <WeddingStorySection
          storyTitle={storyTitle}
          setStoryTitle={setStoryTitle}
          storyText={storyText}
          setStoryText={setStoryText}
          storyImageUrl={storyImageUrl}
          setStoryImageUrl={setStoryImageUrl}
          uploadingStory={uploadingStory}
          storyInputRef={storyInputRef}
          dragOverStory={dragOverStory}
          setDragOverStory={setDragOverStory}
          onUploadStoryFile={handleUploadStoryFile}
        />

        {/* SECCIÓN 4: ÁLBUM INTERACTIVO (MOMENTOS ESPECIALES) */}
        <WeddingGallerySection
          galleryPhotos={galleryPhotos}
          uploadingGallery={uploadingGallery}
          uploadGalleryProgress={uploadGalleryProgress}
          galleryInputRef={galleryInputRef}
          dragOverGallery={dragOverGallery}
          setDragOverGallery={setDragOverGallery}
          onUploadGalleryFiles={handleUploadGalleryFiles}
          onDeletePhoto={handleDeleteGalleryPhoto}
          onUpdateCaption={handleUpdateGalleryCaption}
        />

        {/* SECCIÓN 5: DETALLES PRÁCTICOS PARA INVITADOS */}
        <WeddingCustomSections
          customSections={customSections}
          onAddSection={handleAddSection}
          onDeleteSection={handleDeleteSection}
          onMoveSection={handleMoveSection}
          onUpdateSection={handleUpdateSection}
          saving={saving}
          loading={loading}
          saveSuccess={saveSuccess}
        />

        {/* SECCIÓN 6: HOTELES Y ALOJAMIENTO RECOMENDADO */}
        <WeddingHotelsSection
          hotels={hotels}
          setHotels={setHotels}
          onError={setMediaError}
        />
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
                color: saveSuccess ? 'var(--color-success-dark)' : undefined,
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
                  <span className={styles.uploadSpinner} style={{ borderTopColor: 'var(--color-text-on-primary)', width: '14px', height: '14px' }} />
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
