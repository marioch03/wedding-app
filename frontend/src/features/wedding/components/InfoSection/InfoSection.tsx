import React from 'react';
import type { PracticalDetailSection } from '../../../../types';
import styles from './InfoSection.module.css';

interface InfoSectionProps {
  dressCode?: string;
  accommodations?: string;
  transportInfo?: string;
  customSections?: PracticalDetailSection[];
  faqs?: Array<{ question: string; answer: string }>;
}

export const InfoSection: React.FC<InfoSectionProps> = ({
  dressCode,
  accommodations,
  transportInfo,
  customSections,
  faqs,
}) => {
  const hasCustomSections = Boolean(customSections && customSections.length > 0);
  const hasCards = Boolean(dressCode || accommodations || transportInfo || hasCustomSections);
  const hasFaqs = Boolean(faqs && faqs.length > 0);

  if (!hasCards && !hasFaqs) {
    return null;
  }

  return (
    <section className={styles.section} id="detalles" aria-label="Detalles para invitados">
      {/* Capas ambientales decorativas */}
      <div className={styles.bgGlowWarm} aria-hidden="true" />
      <div className={styles.bgGlowGold} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.tag}>Información Útil</span>
          <h2 className={styles.title}>Detalles para Invitados</h2>
          <div className={styles.headerDivider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <span className={styles.dividerIcon}>✦</span>
            <span className={styles.dividerLine} />
          </div>
          <p className={styles.subtitle}>
            Todo lo necesario para que disfrutéis al máximo y sin preocupaciones de nuestro gran día.
          </p>
        </div>

        {hasCards && (
          <div className={styles.grid}>
            {dressCode && (
              <article className={styles.card}>
                <div className={styles.cardIcon} aria-hidden="true">✨</div>
                <h3 className={styles.cardTitle}>Código de Vestimenta</h3>
                <p className={styles.cardText}>{dressCode}</p>
              </article>
            )}

            {transportInfo && (
              <article className={styles.card}>
                <div className={styles.cardIcon} aria-hidden="true">🚗</div>
                <h3 className={styles.cardTitle}>Cómo Llegar / Transporte</h3>
                <p className={styles.cardText}>{transportInfo}</p>
              </article>
            )}

            {accommodations && (
              <article className={styles.card}>
                <div className={styles.cardIcon} aria-hidden="true">🏨</div>
                <h3 className={styles.cardTitle}>Alojamiento Recomendado</h3>
                <p className={styles.cardText}>{accommodations}</p>
              </article>
            )}

            {customSections?.map((section, index) => (
              <article key={section.id || index} className={styles.card}>
                <div className={styles.cardIcon} aria-hidden="true">{section.icon || 'ℹ️'}</div>
                <h3 className={styles.cardTitle}>{section.title}</h3>
                <p className={styles.cardText} style={{ whiteSpace: 'pre-line' }}>{section.description}</p>
              </article>
            ))}
          </div>
        )}

        {hasFaqs && faqs && (
          <div className={styles.faqSection}>
            <div className={styles.faqHeader}>
              <span className={styles.faqTag}>Dudas Frecuentes</span>
              <h3 className={styles.faqTitle}>Preguntas Frecuentes</h3>
            </div>
            <div className={styles.faqList}>
              {faqs.map((faq, index) => (
                <details key={index} className={styles.faqItem} open={index === 0}>
                  <summary className={styles.faqSummary}>
                    <h4 className={styles.faqQuestion}>{faq.question}</h4>
                    <span className={styles.faqChevron} aria-hidden="true">▾</span>
                  </summary>
                  <p className={styles.faqAnswer}>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
