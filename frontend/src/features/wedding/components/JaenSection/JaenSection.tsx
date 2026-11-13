import React, { useState } from 'react';
import { DEFAULT_JAEN_TITLE, type BarItem } from '../../../../types';
import { getMediaUrl } from '../../../../common/utils/media';
import {
  resolveGoogleMapsEmbedUrl,
  getGoogleMapsNavigationUrl,
} from '../AccommodationsSection/AccommodationsSection';
import styles from './JaenSection.module.css';

interface JaenSectionProps {
  title?: string;
  text?: string;
  bars?: BarItem[];
}

export const JaenSection: React.FC<JaenSectionProps> = ({
  title,
  text,
  bars,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<
    Record<string, 'photo' | 'map'>
  >({});

  const trimmedText = text?.trim();
  const hasBars = Boolean(bars && bars.length > 0);

  if (!trimmedText && !hasBars) {
    return null;
  }

  const displayTitle = title?.trim() || DEFAULT_JAEN_TITLE;

  const toggleMediaTab = (barId: string, tab: 'photo' | 'map') => {
    setActiveMediaTab((prev) => ({ ...prev, [barId]: tab }));
  };

  return (
    <section
      className={styles.section}
      id="jaen"
      aria-label="Recomendaciones y guía sobre Jaén"
    >
      <div className={styles.bgGlowWarm} aria-hidden="true" />
      <div className={styles.bgGlowGold} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.tag}>Descubre Nuestra Tierra</span>
          <h2 className={styles.title}>{displayTitle}</h2>
          <div className={styles.headerDivider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <span className={styles.dividerIcon}>🫒</span>
            <span className={styles.dividerLine} />
          </div>
        </div>

        {trimmedText && (
          <div className={styles.editorialCard}>
            <p className={styles.editorialText}>{trimmedText}</p>
          </div>
        )}

        {hasBars && bars && (
          <div className={styles.barsSection}>
            <div className={styles.barsHeader}>
              <span className={styles.barsTag}>Gastronomía &amp; Tapeo</span>
              <h3 className={styles.barsTitle}>Bares y Sitios Recomendados</h3>
            </div>

            <div className={styles.columnList}>
              {bars.map((bar) => {
                const locationContext = {
                  ...bar,
                  address: bar.address || 'Jaén',
                };
                const embedUrl = resolveGoogleMapsEmbedUrl(locationContext);
                const navUrl = getGoogleMapsNavigationUrl(locationContext);
                const hasCustomPhoto = Boolean(
                  bar.imageUrl && bar.imageUrl.trim()
                );
                const currentTab =
                  activeMediaTab[bar.id] || (hasCustomPhoto ? 'photo' : 'map');

                return (
                  <article key={bar.id} className={styles.card}>
                    <div className={styles.mediaContainer}>
                      {hasCustomPhoto && (
                        <div className={styles.mediaSwitch}>
                          <button
                            type="button"
                            className={`${styles.mediaSwitchBtn} ${
                              currentTab === 'photo' ? styles.activeSwitch : ''
                            }`}
                            onClick={() => toggleMediaTab(bar.id, 'photo')}
                            title="Ver fotografía del bar"
                          >
                            📷 Foto
                          </button>
                          <button
                            type="button"
                            className={`${styles.mediaSwitchBtn} ${
                              currentTab === 'map' ? styles.activeSwitch : ''
                            }`}
                            onClick={() => toggleMediaTab(bar.id, 'map')}
                            title="Ver ubicación en Google Maps"
                          >
                            📍 Mapa
                          </button>
                        </div>
                      )}

                      {hasCustomPhoto && currentTab === 'photo' ? (
                        <div className={styles.imageWrapper}>
                          <img
                            src={getMediaUrl(bar.imageUrl!)}
                            alt={`Fotografía de ${bar.name}`}
                            className={styles.barImage}
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className={styles.mapWrapper}>
                          <iframe
                            src={embedUrl}
                            title={`Ubicación de ${bar.name} en Google Maps`}
                            className={styles.mapIframe}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                      )}

                      <div className={styles.typeBadgeWrapper}>
                        <span className={styles.typeBadge}>
                          <span className={styles.typeIcon} aria-hidden="true">
                            🍻
                          </span>{' '}
                          Bar / Tapas
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.cardHeaderRow}>
                        <h4 className={styles.barName}>{bar.name}</h4>
                      </div>

                      {bar.address && (
                        <div className={styles.addressRow}>
                          <span
                            className={styles.addressIcon}
                            aria-hidden="true"
                          >
                            📍
                          </span>
                          <span className={styles.addressText}>
                            {bar.address}
                          </span>
                        </div>
                      )}

                      {bar.description && (
                        <p className={styles.description}>{bar.description}</p>
                      )}

                      <div className={styles.cardActions}>
                        <a
                          href={navUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.mapButton}
                          title={`Cómo llegar a ${bar.name} en Google Maps`}
                        >
                          <span
                            className={styles.actionIcon}
                            aria-hidden="true"
                          >
                            🗺️
                          </span>
                          <span>Cómo llegar</span>
                        </a>

                        {bar.websiteUrl && (
                          <a
                            href={bar.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.webButton}
                            title={`Visitar web o carta de ${bar.name}`}
                            aria-label={`Ver sitio web o carta de ${bar.name}`}
                          >
                            <span
                              className={styles.actionIcon}
                              aria-hidden="true"
                            >
                              🌐
                            </span>
                            <span className={styles.webTextFull}>
                              Ver Web / Carta
                            </span>
                            <span className={styles.webTextShort}>Web</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

