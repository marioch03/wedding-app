import React, { useState } from 'react';
import type { HotelItem, AccommodationType } from '../../../../types';
import { getMediaUrl } from '../../../../common/utils/media';
import styles from './AccommodationsSection.module.css';

interface AccommodationsSectionProps {
  hotels?: HotelItem[];
}

export const resolveGoogleMapsEmbedUrl = (hotel: {
  googleMapsUrl?: string;
  embedMapUrl?: string;
  name: string;
  address?: string;
}): string => {
  if (hotel.embedMapUrl && hotel.embedMapUrl.trim()) {
    return hotel.embedMapUrl.trim();
  }

  const rawUrl = (hotel.googleMapsUrl || '').trim();

  // Si el usuario pegó un iframe HTML completo: <iframe src="...">
  const iframeMatch = rawUrl.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1];
  }

  // Si es una URL embed directa de Google
  if (rawUrl.includes('google.com/maps/embed') || rawUrl.includes('output=embed')) {
    return rawUrl;
  }

  // Fallback transparente: autogeneración mediante consulta de Maps con output=embed
  const query = [hotel.name, hotel.address].filter(Boolean).join(', ');
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
};

export const getGoogleMapsNavigationUrl = (hotel: HotelItem): string => {
  const rawUrl = (hotel.googleMapsUrl || '').trim();

  // Si pegó un iframe o una URL con /embed o output=embed, generar navegación estándar
  if (rawUrl.includes('<iframe') || rawUrl.includes('/embed') || rawUrl.includes('output=embed')) {
    const searchQuery = [hotel.name, hotel.address].filter(Boolean).join(' ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
  }

  if (rawUrl) {
    return rawUrl;
  }

  const searchQuery = [hotel.name, hotel.address].filter(Boolean).join(' ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
};

const getAccommodationIcon = (type?: AccommodationType): string => {
  switch (type) {
    case 'RURAL':
      return '🏡';
    case 'PARADOR':
      return '🏰';
    case 'BOUTIQUE':
      return '✨';
    case 'HOSTEL':
      return '🛏️';
    case 'HOTEL':
    default:
      return '🏨';
  }
};

const getAccommodationLabel = (type?: AccommodationType): string => {
  switch (type) {
    case 'RURAL':
      return 'Casa Rural';
    case 'PARADOR':
      return 'Parador / Finca';
    case 'BOUTIQUE':
      return 'Hotel Boutique';
    case 'HOSTEL':
      return 'Hostal / Pensión';
    case 'HOTEL':
    default:
      return 'Hotel';
  }
};

export const AccommodationsSection: React.FC<AccommodationsSectionProps> = ({ hotels }) => {
  const [activeMediaTab, setActiveMediaTab] = useState<Record<string, 'photo' | 'map'>>({});
  const [copiedHotelId, setCopiedHotelId] = useState<string | null>(null);

  if (!hotels || hotels.length === 0) {
    return null;
  }

  const toggleMediaTab = (hotelId: string, tab: 'photo' | 'map') => {
    setActiveMediaTab((prev) => ({ ...prev, [hotelId]: tab }));
  };

  const handleCopyDiscountCode = async (hotelId: string, code: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedHotelId(hotelId);
      setTimeout(() => {
        setCopiedHotelId((current) => (current === hotelId ? null : current));
      }, 2000);
    } catch {
      // Fallback silencioso
    }
  };

  return (
    <section className={styles.section} id="alojamiento" aria-label="Alojamientos recomendados">
      {/* Capas ambientales decorativas */}
      <div className={styles.bgGlowWarm} aria-hidden="true" />
      <div className={styles.bgGlowGold} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.tag}>Dónde Alojarse</span>
          <h2 className={styles.title}>Hoteles y Alojamientos Recomendados</h2>
          <div className={styles.headerDivider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <span className={styles.dividerIcon}>✦</span>
            <span className={styles.dividerLine} />
          </div>
          <p className={styles.subtitle}>
            Hemos seleccionado estas opciones cercanas para que vuestra estancia sea lo más cómoda posible.
          </p>
        </div>

        {/* Listado en columna estilizada */}
        <div className={styles.columnList}>
          {hotels.map((hotel) => {
            const embedUrl = resolveGoogleMapsEmbedUrl(hotel);
            const navUrl = getGoogleMapsNavigationUrl(hotel);
            const icon = getAccommodationIcon(hotel.accommodationType);
            const label = getAccommodationLabel(hotel.accommodationType);
            const hasCustomPhoto = Boolean(hotel.imageUrl && hotel.imageUrl.trim());
            const currentTab = activeMediaTab[hotel.id] || (hasCustomPhoto ? 'photo' : 'map');

            return (
              <article key={hotel.id} className={styles.card}>
                {/* Zona Visual Compacta (Mini-mapa o Foto) */}
                <div className={styles.mediaContainer}>
                  {hasCustomPhoto && (
                    <div className={styles.mediaSwitch}>
                      <button
                        type="button"
                        className={`${styles.mediaSwitchBtn} ${currentTab === 'photo' ? styles.activeSwitch : ''}`}
                        onClick={() => toggleMediaTab(hotel.id, 'photo')}
                        title="Ver fotografía del alojamiento"
                      >
                        📷 Foto
                      </button>
                      <button
                        type="button"
                        className={`${styles.mediaSwitchBtn} ${currentTab === 'map' ? styles.activeSwitch : ''}`}
                        onClick={() => toggleMediaTab(hotel.id, 'map')}
                        title="Ver mapa interactivo oficial de Google Maps"
                      >
                        📍 Mapa
                      </button>
                    </div>
                  )}

                  {hasCustomPhoto && currentTab === 'photo' ? (
                    <div className={styles.imageWrapper}>
                      <img
                        src={getMediaUrl(hotel.imageUrl!)}
                        alt={`Fotografía de ${hotel.name}`}
                        className={styles.hotelImage}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className={styles.mapWrapper}>
                      <iframe
                        src={embedUrl}
                        title={`Ubicación y ficha de ${hotel.name} en Google Maps`}
                        className={styles.mapIframe}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  )}

                  <div className={styles.typeBadgeWrapper}>
                    <span className={styles.typeBadge}>
                      <span className={styles.typeIcon} aria-hidden="true">{icon}</span> {label}
                    </span>
                  </div>
                </div>

                {/* Contenido Editorial del Alojamiento */}
                <div className={styles.cardBody}>
                  <div className={styles.cardHeaderRow}>
                    <h3 className={styles.hotelName}>{hotel.name}</h3>

                    {(hotel.distance || hotel.priceRange) && (
                      <div className={styles.badgesRow}>
                        {hotel.distance && (
                          <span className={styles.metaBadge}>
                            ⏱️ {hotel.distance}
                          </span>
                        )}
                        {hotel.priceRange && (
                          <span className={styles.metaBadge}>
                            💶 {hotel.priceRange}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {hotel.description && (
                    <p className={styles.description}>{hotel.description}</p>
                  )}

                  {hotel.address && (
                    <div className={styles.addressRow}>
                      <span className={styles.addressIcon} aria-hidden="true">📍</span>
                      <span className={styles.addressText}>{hotel.address}</span>
                    </div>
                  )}

                  {/* Bloque de Cupón / Descuento para Invitados */}
                  {(hotel.discountCode || hotel.discountDetails) && (
                    <div className={styles.discountContainer}>
                      <div className={styles.discountHeader}>
                        <div className={styles.discountBadgeGroup}>
                          <span className={styles.discountIcon} aria-hidden="true">🏷️</span>
                          {hotel.discountCode && (
                            <span className={styles.discountCodeBadge}>
                              Código: <strong className={styles.discountCodeText}>{hotel.discountCode}</strong>
                            </span>
                          )}
                          {hotel.discountDetails && (
                            <span className={styles.discountDetailsBadge}>{hotel.discountDetails}</span>
                          )}
                        </div>

                        {hotel.discountCode && (
                          <button
                            type="button"
                            className={`${styles.copyCodeButton} ${copiedHotelId === hotel.id ? styles.copiedSuccess : ''}`}
                            onClick={() => handleCopyDiscountCode(hotel.id, hotel.discountCode!)}
                            title="Copiar código al portapapeles"
                            aria-label={`Copiar código de descuento ${hotel.discountCode}`}
                          >
                            {copiedHotelId === hotel.id ? (
                              <>
                                <span className={styles.copyIcon} aria-hidden="true">✓</span>
                                <span>¡Copiado!</span>
                              </>
                            ) : (
                              <>
                                <span className={styles.copyIcon} aria-hidden="true">📋</span>
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {(hotel.discountInstructions || hotel.discountExpiresAt) && (
                        <div className={styles.discountMeta}>
                          {hotel.discountInstructions && (
                            <span className={styles.discountInstructions}>
                              💡 {hotel.discountInstructions}
                            </span>
                          )}
                          {hotel.discountExpiresAt && (
                            <span className={styles.discountExpiry}>
                              ⏳ Válido hasta: {hotel.discountExpiresAt}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Acciones Rápidas */}
                  <div className={styles.cardActions}>
                    <a
                      href={navUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.mapButton}
                      title={`Cómo llegar a ${hotel.name} en Google Maps`}
                    >
                      <span className={styles.actionIcon} aria-hidden="true">🗺️</span>
                      <span>Cómo llegar</span>
                    </a>

                    {hotel.websiteUrl && (
                      <a
                        href={hotel.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.webButton}
                        title={`Visitar sitio web oficial o reservar en ${hotel.name}`}
                        aria-label={`Sitio Web / Reservar en ${hotel.name}`}
                      >
                        <span className={styles.actionIcon} aria-hidden="true">🌐</span>
                        <span className={styles.webTextFull}>Sitio Web / Reservar</span>
                        <span className={styles.webTextShort}>Reservar</span>
                      </a>
                    )}

                    {hotel.phone && (
                      <a
                        href={`tel:${hotel.phone.replace(/\s+/g, '')}`}
                        className={styles.phoneButton}
                        title={`Llamar a ${hotel.name}: ${hotel.phone}`}
                        aria-label={`Llamar a ${hotel.name}: ${hotel.phone}`}
                      >
                        <span className={styles.actionIcon} aria-hidden="true">📞</span>
                        <span className={styles.phoneText}>Llamar</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

