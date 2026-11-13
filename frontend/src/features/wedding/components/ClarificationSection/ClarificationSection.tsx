import React from 'react';
import { DEFAULT_CLARIFICATION_TITLE } from '../../../../types';
import styles from './ClarificationSection.module.css';

interface ClarificationSectionProps {
  title?: string;
  text?: string;
}

export const ClarificationSection: React.FC<ClarificationSectionProps> = ({
  title,
  text,
}) => {
  const trimmedText = text?.trim();
  if (!trimmedText) {
    return null;
  }

  const displayTitle = title?.trim() || DEFAULT_CLARIFICATION_TITLE;

  return (
    <section
      className={styles.section}
      id="aclaracion"
      aria-label="Aclaración sobre nuestra celebración"
    >
      <div className={styles.bgGlowWarm} aria-hidden="true" />
      <div className={styles.bgGlowGold} aria-hidden="true" />

      <div className={styles.container}>
        <article className={styles.card}>
          <div className={styles.cardCornerOrnament} aria-hidden="true" />

          <div className={styles.badge}>
            <span className={styles.badgeIcon} aria-hidden="true">🤍</span>
            <span>Nota importante</span>
          </div>

          <h2 className={styles.title}>{displayTitle}</h2>

          <div className={styles.divider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <span className={styles.dividerIcon}>✦</span>
            <span className={styles.dividerLine} />
          </div>

          <p className={styles.text}>{trimmedText}</p>
        </article>
      </div>
    </section>
  );
};

