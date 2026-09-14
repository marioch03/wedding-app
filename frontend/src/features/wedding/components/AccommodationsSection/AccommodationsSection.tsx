import React from 'react';
import type { HotelItem, AccommodationType } from '../../../../types';
import { getMediaUrl } from '../../../../common/utils/media';
import styles from './AccommodationsSection.module.css';

interface AccommodationsSectionProps {
  hotels?: HotelItem[];
}

const DEFAULT_HOTEL_IMAGES: Record<AccommodationType, string> = {
  HOTEL: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  RURAL: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80',
  PARADOR: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
  BOUTIQUE: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
  HOSTEL: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
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

const getGoogleMapsUrl = (hotel: HotelItem): string => {
  if (hotel.googleMapsUrl && hotel.googleMapsUrl.trim()) {
    return hotel.googleMapsUrl.trim();
  }
  const searchQuery = [hotel.name, hotel.address].filter(Boolean).join(' ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
};

export const AccommodationsSection: React.FC<AccommodationsSectionProps> = ({ hotels }) => {
  if (!hotels || hotels.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} id="alojamiento">
      <div className={styles.header}>
        <span className={styles.tag}>Dónde Alojarse</span>
        <h2 className={styles.title}>Hoteles y Alojamientos Recomendados</h2>
        <p className={styles.subtitle}>
          Hemos seleccionado estas opciones cercanas para que vuestra estancia sea lo más cómoda posible.
        </p>
      </div>

      <div className={styles.grid}>
        {hotels.map((hotel) => {
          const mapsUrl = getGoogleMapsUrl(hotel);
          const icon = getAccommodationIcon(hotel.accommodationType);
          const label = getAccommodationLabel(hotel.accommodationType);
          const hotelImg = hotel.imageUrl ? getMediaUrl(hotel.imageUrl) : DEFAULT_HOTEL_IMAGES[hotel.accommodationType || 'HOTEL'];

          return (
            <article key={hotel.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <img
                  src={hotelImg}
                  alt={`Fotografía de ${hotel.name}`}
                  className={styles.hotelImage}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      DEFAULT_HOTEL_IMAGES[hotel.accommodationType || 'HOTEL'];
                  }}
                />
                <div className={styles.imageOverlayBadge}>
                  <span className={styles.typeBadge}>
                    <span>{icon}</span> {label}
                  </span>
                </div>
              </div>

              <div className={styles.cardContent}>
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

                {hotel.description && (
                  <p className={styles.description}>{hotel.description}</p>
                )}

                {hotel.address && (
                  <div className={styles.addressRow}>
                    <span className={styles.addressIcon}>📍</span>
                    <span>{hotel.address}</span>
                  </div>
                )}
              </div>

              <div className={styles.cardActions}>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapButton}
                  title={`Cómo llegar a ${hotel.name} en Google Maps`}
                >
                  🗺️ Cómo llegar
                </a>

                {hotel.websiteUrl && (
                  <a
                    href={hotel.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.webButton}
                    title={`Visitar sitio web oficial o reservar en ${hotel.name}`}
                  >
                    🌐 Sitio Web / Reservar
                  </a>
                )}

                {hotel.phone && (
                  <a
                    href={`tel:${hotel.phone.replace(/\s+/g, '')}`}
                    className={styles.phoneButton}
                    title={`Llamar a ${hotel.name}: ${hotel.phone}`}
                  >
                    📞
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
