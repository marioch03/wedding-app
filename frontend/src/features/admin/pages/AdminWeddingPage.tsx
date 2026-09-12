import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { WeddingResponse, WeddingRequest, WeddingContent } from '../../../types';
import { weddingApi } from '../../../lib/api';
import styles from './AdminWeddingPage.module.css';

// Fotos de muestra elegantes de Unsplash para sugerencias rápidas
const SAMPLE_COVER_PHOTOS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1600&q=85',
];

const SAMPLE_STORY_PHOTOS = [
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=85',
];

const SAMPLE_GALLERY_PHOTOS = [
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85',
];

export const AdminWeddingPage: React.FC = () => {
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

  // Gallery
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Practical Details
  const [dressCode, setDressCode] = useState('');
  const [accommodations, setAccommodations] = useState('');
  const [transportInfo, setTransportInfo] = useState('');

  useEffect(() => {
    loadWeddingData();
  }, []);

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
      setStoryImageUrl(content.storyImageUrl || SAMPLE_STORY_PHOTOS[0]);
      setGalleryImages(content.galleryImages || SAMPLE_GALLERY_PHOTOS);
      setDressCode(content.dressCode || '');
      setAccommodations(content.accommodations || '');
      setTransportInfo(content.transportInfo || '');
    } catch (err: any) {
      console.error('Error loading wedding configuration:', err);
      setError(err?.message || 'Error al cargar los datos de la boda.');
    } finally {
      setLoading(false);
    }
  };

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

  // Gallery Handlers
  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    setGalleryImages((prev) => [...prev, newPhotoUrl.trim()]);
    setNewPhotoUrl('');
  };

  const handleDeletePhoto = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleApplySampleGallery = () => {
    setGalleryImages(SAMPLE_GALLERY_PHOTOS);
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

    const contentPayload: WeddingContent = {
      heroSubtitle: heroSubtitle.trim() || undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
      storyTitle: storyTitle.trim() || undefined,
      storyText: storyText.trim() || undefined,
      storyImageUrl: storyImageUrl.trim() || undefined,
      galleryImages: galleryImages.length > 0 ? galleryImages : undefined,
      dressCode: dressCode.trim() || undefined,
      accommodations: accommodations.trim() || undefined,
      transportInfo: transportInfo.trim() || undefined,
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
    } catch (err: any) {
      console.error('Error saving wedding settings:', err);
      setError(err?.message || 'Error al guardar la configuración de la boda.');
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
            className={styles.saveButton}
            disabled={saving || loading}
          >
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className={styles.savedAlert}>
          ✓ ¡Configuración guardada con éxito! Los cambios ya son visibles en la web pública.
        </div>
      )}

      {error && <div className={styles.errorAlert}>⚠️ {error}</div>}

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
                URL de Fotografía de Portada
                <span className={styles.labelHint}>(Imagen horizontal de alta calidad)</span>
              </label>
              <input
                type="url"
                className={styles.input}
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* Presets rápidos */}
            <div className={styles.presetPicker}>
              <span className={styles.presetLabel}>Presets románticos:</span>
              {SAMPLE_COVER_PHOTOS.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
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
                <img src={coverImageUrl} alt="Vista previa de portada" className={styles.imagePreview} />
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
                <img
                  src={storyImageUrl || SAMPLE_STORY_PHOTOS[0]}
                  alt="Foto de la historia"
                  className={styles.polaroidPhoto}
                />
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
                  <label className={styles.label}>Fotografía de la Historia (URL)</label>
                  <input
                    type="url"
                    className={styles.input}
                    value={storyImageUrl}
                    onChange={(e) => setStoryImageUrl(e.target.value)}
                    placeholder="https://..."
                  />

                  {/* Presets story */}
                  <div className={styles.presetPicker} style={{ marginTop: '0.4rem' }}>
                    <span className={styles.presetLabel}>Sugerencias:</span>
                    {SAMPLE_STORY_PHOTOS.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Preset ${idx + 1}`}
                        className={styles.presetThumb}
                        onClick={() => setStoryImageUrl(url)}
                        title="Usar esta foto"
                      />
                    ))}
                  </div>
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

        {/* SECCIÓN 4: ÁLBUM INTERACTIVO (GALERÍA) */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>📸</div>
            <div>
              <h2 className={styles.sectionTitle}>Álbum de Fotos & Recuerdos</h2>
              <span className={styles.sectionSubtitle}>
                Galería interactiva con lightbox que podrán explorar los invitados
              </span>
            </div>
          </div>

          <div className={styles.sectionBody}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Añadir nueva fotografía al álbum</label>
              <div className={styles.addPhotoInputRow}>
                <input
                  type="url"
                  className={styles.input}
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="Introduce la URL de la foto (https://...)"
                />
                <button
                  type="button"
                  className={styles.addPhotoBtn}
                  onClick={handleAddPhoto}
                >
                  + Añadir Foto
                </button>
              </div>
            </div>

            {galleryImages.length === 0 ? (
              <div className={styles.emptyGallery}>
                <span>No hay fotos en el álbum todavía.</span>
                <button
                  type="button"
                  className={styles.quickSamplesBtn}
                  onClick={handleApplySampleGallery}
                >
                  Cargar Colección de Muestra
                </button>
              </div>
            ) : (
              <div className={styles.galleryGrid}>
                {galleryImages.map((url, idx) => (
                  <div key={idx} className={styles.galleryCard}>
                    <img src={url} alt={`Foto ${idx + 1}`} className={styles.galleryPhoto} />
                    <button
                      type="button"
                      className={styles.deletePhotoBtn}
                      onClick={() => handleDeletePhoto(idx)}
                      title="Eliminar foto"
                    >
                      ✕
                    </button>
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
                Información útil sobre código de vestimenta, alojamiento y traslados
              </span>
            </div>
          </div>

          <div className={styles.sectionBody}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                👔 Código de Vestimenta (Dress Code)
              </label>
              <input
                type="text"
                className={styles.input}
                value={dressCode}
                onChange={(e) => setDressCode(e.target.value)}
                placeholder="Ej. Formal / Traje oscuro y vestido de cóctel o largo"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                🏨 Alojamiento Recomendado
              </label>
              <textarea
                className={styles.textarea}
                value={accommodations}
                onChange={(e) => setAccommodations(e.target.value)}
                placeholder="Ej. Hotel Gran Vía (10% de descuento con el código BODA2027) o Hotel Boutique Los Álamos..."
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                🚌 Información de Transporte & Autobuses
              </label>
              <textarea
                className={styles.textarea}
                value={transportInfo}
                onChange={(e) => setTransportInfo(e.target.value)}
                placeholder="Ej. Habrá servicio de autobús con salida a las 12:30h desde la Plaza Mayor y regreso a las 22:00h y 02:00h..."
                rows={3}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
