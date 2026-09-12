import React, { useEffect, useState } from 'react';
import type { EventResponse } from '../../../../types';
import { eventsApi } from '../../../../lib/api/events';
import { TimelineSkeleton } from './TimelineSkeleton';
import styles from './TimelineSection.module.css';

interface TimelineSectionProps {
  events?: EventResponse[];
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({ events: initialEvents }) => {
  const [events, setEvents] = useState<EventResponse[]>(initialEvents || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialEvents);

  useEffect(() => {
    if (initialEvents) {
      setEvents(initialEvents);
      setIsLoading(false);
      return;
    }

    const loadPublicEvents = async () => {
      try {
        setIsLoading(true);
        const data = await eventsApi.getPublic();
        // Ordenar por displayOrder y por fecha de inicio
        const sorted = [...data].sort((a, b) => {
          if (a.displayOrder !== b.displayOrder) {
            return a.displayOrder - b.displayOrder;
          }
          return new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime();
        });
        setEvents(sorted);
      } catch (err) {
        console.error('Error al cargar eventos públicos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicEvents();
  }, [initialEvents]);

  const getEventIcon = (type: string): string => {
    switch (type) {
      case 'CEREMONY':
        return '💍';
      case 'RECEPTION':
        return '🍽️';
      case 'PARTY':
        return '🎉';
      case 'OTHER':
      default:
        return '✨';
    }
  };

  const getEventTypeName = (type: string): string => {
    switch (type) {
      case 'CEREMONY':
        return 'Ceremonia';
      case 'RECEPTION':
        return 'Cóctel & Banquete';
      case 'PARTY':
        return 'Fiesta & Baile';
      case 'OTHER':
      default:
        return 'Momento Especial';
    }
  };

  const formatEventTime = (startIso: string, endIso?: string): string => {
    const start = new Date(startIso);
    const startTime = start.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (endIso) {
      const end = new Date(endIso);
      const endTime = end.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${startTime} - ${endTime} h`;
    }

    return `${startTime} h`;
  };

  if (isLoading) {
    return (
      <section className={styles.section} aria-label="Itinerario de la boda">
        <div className={styles.header}>
          <span className={styles.tag}>Itinerario</span>
          <h2 className={styles.title}>Cronograma del Día</h2>
          <p className={styles.subtitle}>
            Los momentos clave pensados para disfrutar juntos de este día inolvidable.
          </p>
        </div>
        <TimelineSkeleton />
      </section>
    );
  }

  // Si no hay eventos públicos, no mostrar la sección vacía en la landing
  if (events.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} id="itinerario" aria-label="Itinerario de la boda">
      <div className={styles.header}>
        <span className={styles.tag}>Itinerario</span>
        <h2 className={styles.title}>Cronograma del Día</h2>
        <p className={styles.subtitle}>
          Acompañadnos en cada instante. Aquí tenéis los momentos principales y detalles de cada evento.
        </p>
      </div>

      <div className={styles.timeline}>
        {events.map((event) => {
          const mapQuery = encodeURIComponent(
            event.address ? `${event.venueName ? event.venueName + ', ' : ''}${event.address}` : event.venueName || ''
          );
          const mapsUrl = mapQuery ? `https://www.google.com/maps/search/?api=1&query=${mapQuery}` : null;

          return (
            <div key={event.id} className={styles.timelineItem}>
              <div className={styles.nodeWrapper} aria-hidden="true">
                {getEventIcon(event.eventType)}
              </div>

              <article className={styles.eventCard}>
                <div className={styles.eventTopRow}>
                  <time className={styles.timeBadge} dateTime={event.startDatetime}>
                    <span>⏱️</span> {formatEventTime(event.startDatetime, event.endDatetime)}
                  </time>
                  <span className={styles.typeBadge}>{getEventTypeName(event.eventType)}</span>
                </div>

                <h3 className={styles.eventName}>{event.name}</h3>

                {(event.venueName || event.address) && (
                  <div className={styles.venueRow}>
                    <span>📍</span>
                    {event.venueName && <span className={styles.venueName}>{event.venueName}</span>}
                    {event.address && <span className={styles.venueAddress}>({event.address})</span>}
                  </div>
                )}

                {event.description && <p className={styles.description}>{event.description}</p>}

                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapsButton}
                    title={`Ver ubicación de ${event.name} en Google Maps`}
                  >
                    <span>🗺️</span> Cómo llegar
                  </a>
                )}
              </article>
            </div>
          );
        })}
      </div>
    </section>
  );
};
