import React, { useState, useRef } from 'react';
import type { HotelItem, AccommodationType } from '../../../../types';
import { mediaApi } from '../../../../lib/api/media';
import { getMediaUrl } from '../../../../common/utils/media';
import styles from '../AdminWeddingPage.module.css';

// Función de saneamiento para enlaces o bloques iframe de Google Maps
export const sanitizeGoogleMapsInput = (val: string): string => {
  const trimmed = val.trim();
  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1];
  }
  return trimmed;
};

interface WeddingHotelsSectionProps {
  hotels: HotelItem[];
  setHotels: React.Dispatch<React.SetStateAction<HotelItem[]>>;
  onError: (message: string) => void;
}

export const WeddingHotelsSection: React.FC<WeddingHotelsSectionProps> = ({
  hotels,
  setHotels,
  onError,
}) => {
  const [isAddingHotel, setIsAddingHotel] = useState(false);
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);

  // Formulario de Hotel
  const [hotelName, setHotelName] = useState('');
  const [hotelType, setHotelType] = useState<AccommodationType>('HOTEL');
  const [hotelDescription, setHotelDescription] = useState('');
  const [hotelAddress, setHotelAddress] = useState('');
  const [hotelGoogleMapsUrl, setHotelGoogleMapsUrl] = useState('');
  const [hotelWebsiteUrl, setHotelWebsiteUrl] = useState('');
  const [hotelPhone, setHotelPhone] = useState('');
  const [hotelDistance, setHotelDistance] = useState('');
  const [hotelPriceRange, setHotelPriceRange] = useState('');
  const [hotelImageUrl, setHotelImageUrl] = useState('');
  const [hotelDiscountCode, setHotelDiscountCode] = useState('');
  const [hotelDiscountDetails, setHotelDiscountDetails] = useState('');
  const [hotelDiscountInstructions, setHotelDiscountInstructions] = useState('');
  const [hotelDiscountExpiresAt, setHotelDiscountExpiresAt] = useState('');
  const [uploadingHotelImage, setUploadingHotelImage] = useState(false);
  const hotelFileInputRef = useRef<HTMLInputElement>(null);

  const resetHotelForm = () => {
    setHotelName('');
    setHotelType('HOTEL');
    setHotelDescription('');
    setHotelAddress('');
    setHotelGoogleMapsUrl('');
    setHotelWebsiteUrl('');
    setHotelPhone('');
    setHotelDistance('');
    setHotelPriceRange('');
    setHotelImageUrl('');
    setHotelDiscountCode('');
    setHotelDiscountDetails('');
    setHotelDiscountInstructions('');
    setHotelDiscountExpiresAt('');
    setEditingHotelId(null);
    setIsAddingHotel(false);
  };

  const handleStartAddHotel = () => {
    resetHotelForm();
    setIsAddingHotel(true);
  };

  const handleStartEditHotel = (h: HotelItem) => {
    setEditingHotelId(h.id);
    setIsAddingHotel(true);
    setHotelName(h.name);
    setHotelType(h.accommodationType || 'HOTEL');
    setHotelDescription(h.description || '');
    setHotelAddress(h.address || '');
    setHotelGoogleMapsUrl(h.googleMapsUrl || '');
    setHotelWebsiteUrl(h.websiteUrl || '');
    setHotelPhone(h.phone || '');
    setHotelDistance(h.distance || '');
    setHotelPriceRange(h.priceRange || '');
    setHotelImageUrl(h.imageUrl || '');
    setHotelDiscountCode(h.discountCode || '');
    setHotelDiscountDetails(h.discountDetails || '');
    setHotelDiscountInstructions(h.discountInstructions || '');
    setHotelDiscountExpiresAt(h.discountExpiresAt || '');
  };

  const handleUploadHotelImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError('El archivo seleccionado debe ser una imagen válida (JPG, PNG, WebP o GIF)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onError('La imagen no puede superar los 10MB de tamaño');
      return;
    }
    try {
      setUploadingHotelImage(true);
      const res = await mediaApi.uploadImage(file);
      setHotelImageUrl(res.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir la fotografía del alojamiento';
      onError(msg);
    } finally {
      setUploadingHotelImage(false);
    }
  };

  const handleSaveHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelName.trim()) {
      alert('El nombre del hotel o alojamiento es obligatorio.');
      return;
    }

    const newHotel: HotelItem = {
      id: editingHotelId || `hotel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: hotelName.trim(),
      accommodationType: hotelType,
      description: hotelDescription.trim() || undefined,
      address: hotelAddress.trim() || undefined,
      googleMapsUrl: sanitizeGoogleMapsInput(hotelGoogleMapsUrl) || undefined,
      websiteUrl: hotelWebsiteUrl.trim() || undefined,
      phone: hotelPhone.trim() || undefined,
      distance: hotelDistance.trim() || undefined,
      priceRange: hotelPriceRange.trim() || undefined,
      imageUrl: hotelImageUrl.trim() || undefined,
      discountCode: hotelDiscountCode.trim() || undefined,
      discountDetails: hotelDiscountDetails.trim() || undefined,
      discountInstructions: hotelDiscountInstructions.trim() || undefined,
      discountExpiresAt: hotelDiscountExpiresAt.trim() || undefined,
    };

    if (editingHotelId) {
      setHotels((prev) => prev.map((h) => (h.id === editingHotelId ? newHotel : h)));
    } else {
      setHotels((prev) => [...prev, newHotel]);
    }

    resetHotelForm();
  };

  const handleDeleteHotel = (id: string) => {
    if (!confirm('¿Eliminar este hotel o alojamiento de la lista?')) return;
    setHotels((prev) => prev.filter((h) => h.id !== id));
    if (editingHotelId === id) resetHotelForm();
  };

  const handleMoveHotel = (index: number, direction: 'up' | 'down') => {
    setHotels((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const renderHotelForm = () => (
    <div className={styles.hotelFormContainer}>
      <div className={styles.hotelFormHeader}>
        <span className={styles.hotelFormTitle}>
          {editingHotelId ? '✏️ Editar Alojamiento' : '➕ Nuevo Alojamiento'}
        </span>
        <button
          type="button"
          className={styles.hotelFormCloseBtn}
          onClick={resetHotelForm}
          title="Cerrar formulario"
          aria-label="Cerrar formulario"
        >
          ✕
        </button>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup} style={{ flex: 2 }}>
          <label className={styles.label}>Nombre del Alojamiento *</label>
          <input
            type="text"
            className={styles.input}
            value={hotelName}
            onChange={(e) => setHotelName(e.target.value)}
            placeholder="Ej. Parador de Alcalá de Henares"
            required
          />
        </div>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label className={styles.label}>Tipo de Alojamiento</label>
          <select
            className={styles.input}
            value={hotelType}
            onChange={(e) => setHotelType(e.target.value as AccommodationType)}
          >
            <option value="HOTEL">🏨 Hotel</option>
            <option value="RURAL">🏡 Casa Rural</option>
            <option value="PARADOR">🏰 Parador / Finca</option>
            <option value="BOUTIQUE">✨ Hotel Boutique</option>
            <option value="HOSTEL">🛏️ Hostal / Pensión</option>
          </select>
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Distancia al evento
            <span className={styles.labelHint}>(Ej. A 5 min de la finca)</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={hotelDistance}
            onChange={(e) => setHotelDistance(e.target.value)}
            placeholder="Ej. A 5 minutos en coche"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Rango de Precios
            <span className={styles.labelHint}>(Ej. 85€ - 120€ / noche o €€)</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={hotelPriceRange}
            onChange={(e) => setHotelPriceRange(e.target.value)}
            placeholder="Ej. 90€ / noche aprox."
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup} style={{ flex: 2 }}>
          <label className={styles.label}>
            Dirección Completa
            <span className={styles.labelHint}>(Para el mapa y los invitados)</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={hotelAddress}
            onChange={(e) => setHotelAddress(e.target.value)}
            placeholder="Ej. Calle Colegios 8, 28801 Alcalá de Henares"
          />
        </div>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label className={styles.label}>Teléfono de Contacto</label>
          <input
            type="tel"
            className={styles.input}
            value={hotelPhone}
            onChange={(e) => setHotelPhone(e.target.value)}
            placeholder="Ej. +34 918 880 330"
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Enlace o Embed de Google Maps
            <span className={styles.labelHint}>(Enlace oficial o código &lt;iframe&gt;. Se autogenera si se deja vacío)</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={hotelGoogleMapsUrl}
            onChange={(e) => setHotelGoogleMapsUrl(sanitizeGoogleMapsInput(e.target.value))}
            placeholder="Pega el enlace oficial, código <iframe> o déjalo en blanco"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Enlace Sitio Web / Reservas
            <span className={styles.labelHint}>(Página oficial o reservas)</span>
          </label>
          <input
            type="url"
            className={styles.input}
            value={hotelWebsiteUrl}
            onChange={(e) => setHotelWebsiteUrl(e.target.value)}
            placeholder="https://www.parador.es"
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Fotografía del Alojamiento (Opcional)
          <span className={styles.labelHint}>
            (Sube una foto desde tu equipo. Si no subes ninguna, se utilizará la vista oficial de Google Maps)
          </span>
        </label>

        {/* Botón de subida de archivo y spinner */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <input
            type="file"
            ref={hotelFileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadHotelImage(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className={styles.uploadButtonOutline}
            onClick={() => hotelFileInputRef.current?.click()}
            disabled={uploadingHotelImage}
          >
            <span>📁</span>
            {uploadingHotelImage ? 'Subiendo imagen...' : 'Subir foto desde tu equipo'}
          </button>

          {uploadingHotelImage && (
            <div className={styles.uploadStatusBadge}>
              <span className={styles.uploadSpinner} />
              Subiendo archivo...
            </div>
          )}
        </div>

        {/* Previsualización si hay imagen asignada */}
        {hotelImageUrl && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.6rem', padding: '0.6rem', background: 'var(--color-bg-subtle)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <div style={{ width: '80px', height: '56px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: 'var(--color-surface-hover)' }}>
              <img
                src={getMediaUrl(hotelImageUrl)}
                alt="Vista previa hotel"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80';
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-heading)', display: 'block' }}>
                Foto seleccionada
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                Archivo subido correctamente
              </span>
            </div>
            <button
              type="button"
              onClick={() => setHotelImageUrl('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-error)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: '0.3rem 0.6rem', borderRadius: '4px' }}
              title="Eliminar foto"
            >
              ✕ Quitar
            </button>
          </div>
        )}
      </div>

      {/* Bloque de Código de Descuento / Oferta para Invitados */}
      <div style={{ padding: '0.85rem', background: 'var(--color-bg-subtle)', borderRadius: '8px', border: '1px dashed var(--color-border)', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-heading)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>🏷️</span> Código Promocional o Descuento para Invitados (Opcional)
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup} style={{ flex: 1 }}>
            <label className={styles.label}>
              Código Promocional / Cupón
              <span className={styles.labelHint}>(Ej. BODA-MARIO-ANA)</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={hotelDiscountCode}
              onChange={(e) => setHotelDiscountCode(e.target.value.toUpperCase())}
              placeholder="Ej. BODA2026"
            />
          </div>
          <div className={styles.formGroup} style={{ flex: 1 }}>
            <label className={styles.label}>
              Detalle del Descuento
              <span className={styles.labelHint}>(Ej. 15% dto. o 20€ menos)</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={hotelDiscountDetails}
              onChange={(e) => setHotelDiscountDetails(e.target.value)}
              placeholder="Ej. 15% de dto. sobre tarifa oficial"
            />
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup} style={{ flex: 2 }}>
            <label className={styles.label}>
              Instrucciones para los Invitados
              <span className={styles.labelHint}>(Dónde indicarlo o condiciones)</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={hotelDiscountInstructions}
              onChange={(e) => setHotelDiscountInstructions(e.target.value)}
              placeholder="Ej. Indicar por teléfono o en el campo 'Código Promocional' en su web"
            />
          </div>
          <div className={styles.formGroup} style={{ flex: 1 }}>
            <label className={styles.label}>
              Válido hasta
              <span className={styles.labelHint}>(Fecha límite opcional)</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={hotelDiscountExpiresAt}
              onChange={(e) => setHotelDiscountExpiresAt(e.target.value)}
              placeholder="Ej. 15/06/2026"
            />
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Descripción o Indicaciones para los Invitados
          <span className={styles.labelHint}>(Habitaciones reservadas, desayuno, parking...)</span>
        </label>
        <textarea
          className={styles.textarea}
          rows={2}
          value={hotelDescription}
          onChange={(e) => setHotelDescription(e.target.value)}
          placeholder="Ej. Dispone de parking concertado. Indicar al reservar que asistís a nuestra boda."
        />
      </div>

      <div className={styles.hotelFormActions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={resetHotelForm}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={styles.addSectionBtn}
          onClick={handleSaveHotel}
        >
          {editingHotelId ? '✓ Actualizar Alojamiento' : '✓ Añadir Alojamiento'}
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>🏨</div>
        <div>
          <h2 className={styles.sectionTitle}>Hoteles y Alojamiento Recomendado</h2>
          <span className={styles.sectionSubtitle}>
            Recomendaciones de estancia para los invitados con navegación a Google Maps y enlace a sus sitios web
          </span>
        </div>
      </div>

      <div className={styles.sectionBody}>
        <div className={styles.customSectionsContainer}>
          <div className={styles.customSectionsHeader}>
            <div>
              <h3 className={styles.customSectionsTitle}>
                <span>📍</span> Opciones de Alojamiento ({hotels.length})
              </h3>
              <span className={styles.labelHint}>
                Añade hoteles, casas rurales o fincas recomendadas para los invitados que viajen a la boda
              </span>
            </div>
            {!isAddingHotel && (
              <button
                type="button"
                className={styles.addSectionBtn}
                onClick={handleStartAddHotel}
              >
                + Añadir Hotel / Alojamiento
              </button>
            )}
          </div>

          {/* Si es NUEVO alojamiento (no edición), se muestra aquí arriba */}
          {isAddingHotel && !editingHotelId && renderHotelForm()}

          {/* Lista de Hoteles Registrados */}
          {hotels.length === 0 && !isAddingHotel ? (
            <div className={styles.emptyCustomSections}>
              <span>No hay hoteles o alojamientos recomendados añadidos todavía.</span>
              <button
                type="button"
                className={styles.addSectionBtn}
                onClick={handleStartAddHotel}
              >
                + Añadir el primer alojamiento recomendado
              </button>
            </div>
          ) : (
            <div className={styles.customSectionsList}>
              {hotels.map((h, index) => {
                // Si se está editando este alojamiento específico, el formulario se renderiza IN-PLACE en su misma posición
                if (editingHotelId === h.id) {
                  return (
                    <div key={h.id} id={`hotel-edit-container-${h.id}`}>
                      {renderHotelForm()}
                    </div>
                  );
                }

                const defaultImg =
                  h.accommodationType === 'RURAL'
                    ? 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=300&q=80'
                    : h.accommodationType === 'PARADOR'
                    ? 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=300&q=80'
                    : h.accommodationType === 'BOUTIQUE'
                    ? 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=300&q=80'
                    : h.accommodationType === 'HOSTEL'
                    ? 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=300&q=80'
                    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80';

                return (
                  <div key={h.id} className={styles.hotelItemCard}>
                    <div className={styles.hotelItemHeader}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'var(--color-bg-subtle)' }}>
                          <img
                            src={h.imageUrl ? getMediaUrl(h.imageUrl) : defaultImg}
                            alt={h.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = defaultImg;
                            }}
                          />
                        </div>
                        <div>
                          <div className={styles.hotelItemTitle}>
                            <span>
                              {h.accommodationType === 'RURAL'
                                ? '🏡'
                                : h.accommodationType === 'PARADOR'
                                ? '🏰'
                                : h.accommodationType === 'BOUTIQUE'
                                ? '✨'
                                : h.accommodationType === 'HOSTEL'
                                ? '🛏️'
                                : '🏨'}
                            </span>
                            <span>{h.name}</span>
                          </div>
                          <div className={styles.hotelBadgesRow}>
                            {h.distance && (
                              <span className={styles.hotelBadge}>⏱️ {h.distance}</span>
                            )}
                            {h.priceRange && (
                              <span className={styles.hotelBadge}>💶 {h.priceRange}</span>
                            )}
                            {h.phone && (
                              <span className={styles.hotelBadge}>📞 {h.phone}</span>
                            )}
                            {h.discountCode && (
                              <span className={styles.hotelBadge} style={{ borderColor: 'var(--color-accent-gold-border, #d4af37)', color: 'var(--color-accent-gold-dark, #8c6d23)', background: 'var(--color-accent-gold-light, #fef9e7)', fontWeight: 600 }}>
                                🏷️ {h.discountCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={styles.hotelActionsGroup}>
                        <button
                          type="button"
                          className={styles.moveBtn}
                          onClick={() => handleMoveHotel(index, 'up')}
                          disabled={index === 0}
                          title="Mover arriba"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className={styles.moveBtn}
                          onClick={() => handleMoveHotel(index, 'down')}
                          disabled={index === hotels.length - 1}
                          title="Mover abajo"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          className={styles.editBtn}
                          onClick={() => handleStartEditHotel(h)}
                          title="Editar alojamiento"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteHotel(h.id)}
                          title="Eliminar alojamiento"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {h.address && (
                      <div className={styles.hotelMetaText}>
                        📍 <strong>Dirección:</strong> {h.address}
                      </div>
                    )}

                    {h.description && (
                      <div className={styles.hotelMetaText}>
                        {h.description}
                      </div>
                    )}

                    {h.websiteUrl && (
                      <div className={styles.hotelMetaText}>
                        🌐{' '}
                        <a
                          href={h.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
                        >
                          {h.websiteUrl}
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
