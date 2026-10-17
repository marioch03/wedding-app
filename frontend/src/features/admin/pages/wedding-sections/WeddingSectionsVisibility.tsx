import React from 'react';
import type { SectionId, SectionVisibility } from '../../../../types';
import styles from './WeddingSectionsVisibility.module.css';

interface SectionConfig {
  key: SectionId;
  title: string;
  icon: string;
  description: string;
}

const SECTIONS_CONFIG_MAP: Record<SectionId, SectionConfig> = {
  story: {
    key: 'story',
    title: 'Nuestra Historia',
    icon: '📖',
    description: 'Texto y fotografía sobre cómo se conoció la pareja y momentos clave.',
  },
  gallery: {
    key: 'gallery',
    title: 'Galería de Fotos',
    icon: '📸',
    description: 'Álbum de fotografías de los novios y momentos especiales.',
  },
  guestPhotos: {
    key: 'guestPhotos',
    title: 'Álbum de Invitados',
    icon: '📷',
    description: 'Zona interactiva donde los invitados suben y visualizan fotos en directo.',
  },
  timeline: {
    key: 'timeline',
    title: 'Cronograma del Evento',
    icon: '⏳',
    description: 'Horarios e itinerario de la boda (ceremonia, cóctel, banquete, fiesta).',
  },
  accommodations: {
    key: 'accommodations',
    title: 'Hoteles y Alojamientos',
    icon: '🏨',
    description: 'Lista de alojamientos recomendados, tarifas con descuento y mapas.',
  },
  music: {
    key: 'music',
    title: 'Buzón de Canciones',
    icon: '🎵',
    description: 'Sugerencias musicales donde los invitados proponen temas para la fiesta.',
  },
  info: {
    key: 'info',
    title: 'Detalles Prácticos & FAQs',
    icon: 'ℹ️',
    description: 'Dress code, preguntas frecuentes y secciones adicionales de información.',
  },
};

interface WeddingSectionsVisibilityProps {
  sectionOrder: SectionId[];
  onOrderChange: (newOrder: SectionId[]) => void;
  visibility: SectionVisibility;
  onVisibilityChange: (key: keyof SectionVisibility, value: boolean) => void;
  onResetOrder?: () => void;
}

export const WeddingSectionsVisibility: React.FC<WeddingSectionsVisibilityProps> = ({
  sectionOrder,
  onOrderChange,
  visibility,
  onVisibilityChange,
  onResetOrder,
}) => {
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionOrder.length) return;
    const newOrder = [...sectionOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    onOrderChange(newOrder);
  };

  return (
    <div className={styles.visibilityCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon} aria-hidden="true">
            📑
          </div>
          <div className={styles.headerText}>
            <h2 className={styles.cardTitle}>Organizador y Visibilidad de Secciones</h2>
            <p className={styles.cardSubtitle}>
              Reordena la disposición de las secciones con las flechas y elige cuáles estarán
              visibles en la web pública.
            </p>
          </div>
        </div>

        {onResetOrder && (
          <button
            type="button"
            onClick={onResetOrder}
            className={styles.resetOrderButton}
            title="Restablecer el orden recomendado original"
          >
            <span>↺</span> Restablecer Orden
          </button>
        )}
      </div>

      <div className={styles.sectionsList}>
        {sectionOrder.map((sectionId, index) => {
          const config = SECTIONS_CONFIG_MAP[sectionId];
          if (!config) return null;

          const isVisible = visibility[sectionId] !== false;
          const isFirst = index === 0;
          const isLast = index === sectionOrder.length - 1;

          return (
            <div
              key={sectionId}
              className={`${styles.sectionItem} ${!isVisible ? styles.sectionItemDisabled : ''}`}
            >
              <div className={styles.sectionInfo}>
                <span className={styles.positionBadge} title={`Posición #${index + 1}`}>
                  #{index + 1}
                </span>
                <span className={styles.itemIcon} aria-hidden="true">
                  {config.icon}
                </span>
                <div className={styles.itemDetails}>
                  <span className={styles.itemTitle}>{config.title}</span>
                  <span className={styles.itemDescription}>{config.description}</span>
                </div>
              </div>

              <div className={styles.controlsArea}>
                {/* Controles de Orden (Subir / Bajar) */}
                <div className={styles.reorderButtons}>
                  <button
                    type="button"
                    className={styles.moveButton}
                    onClick={() => handleMove(index, 'up')}
                    disabled={isFirst}
                    aria-label={`Subir sección ${config.title}`}
                    title="Mover una posición arriba"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className={styles.moveButton}
                    onClick={() => handleMove(index, 'down')}
                    disabled={isLast}
                    aria-label={`Bajar sección ${config.title}`}
                    title="Mover una posición abajo"
                  >
                    ▼
                  </button>
                </div>

                {/* Badge de Estado */}
                <span
                  className={`${styles.statusBadge} ${
                    isVisible ? styles.badgeVisible : styles.badgeHidden
                  }`}
                >
                  {isVisible ? 'Visible' : 'Oculta'}
                </span>

                {/* Switch de Visibilidad */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isVisible}
                  aria-label={`Mostrar sección ${config.title}`}
                  className={`${styles.switchButton} ${isVisible ? styles.switchChecked : ''}`}
                  onClick={() => onVisibilityChange(sectionId, !isVisible)}
                >
                  <span className={styles.switchKnob} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
