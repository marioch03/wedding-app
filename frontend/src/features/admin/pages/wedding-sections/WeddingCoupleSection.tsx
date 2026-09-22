import React, { useMemo } from 'react';
import styles from '../AdminWeddingPage.module.css';

interface WeddingCoupleSectionProps {
  partner1Name: string;
  setPartner1Name: (value: string) => void;
  partner2Name: string;
  setPartner2Name: (value: string) => void;
  weddingDate: string;
  setWeddingDate: (value: string) => void;
}

export const WeddingCoupleSection: React.FC<WeddingCoupleSectionProps> = ({
  partner1Name,
  setPartner1Name,
  partner2Name,
  setPartner2Name,
  weddingDate,
  setWeddingDate,
}) => {
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

  return (
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
  );
};
