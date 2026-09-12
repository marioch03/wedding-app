import React from 'react';
import styles from './InfoSection.module.css';

interface InfoSectionProps {
  dressCode?: string;
  accommodations?: string;
  transportInfo?: string;
  faqs?: Array<{ question: string; answer: string }>;
}

export const InfoSection: React.FC<InfoSectionProps> = ({
  dressCode,
  accommodations,
  transportInfo,
  faqs,
}) => {
  const hasCards = Boolean(dressCode || accommodations || transportInfo);
  const hasFaqs = Boolean(faqs && faqs.length > 0);

  if (!hasCards && !hasFaqs) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.tag}>Información Útil</span>
        <h2 className={styles.title}>Detalles para Invitados</h2>
      </div>

      {hasCards && (
        <div className={styles.grid}>
          {dressCode && (
            <div className={styles.card}>
              <div className={styles.cardIcon}>✨</div>
              <h3 className={styles.cardTitle}>Código de Vestimenta</h3>
              <p className={styles.cardText}>{dressCode}</p>
            </div>
          )}

          {transportInfo && (
            <div className={styles.card}>
              <div className={styles.cardIcon}>🚗</div>
              <h3 className={styles.cardTitle}>Cómo Llegar / Transporte</h3>
              <p className={styles.cardText}>{transportInfo}</p>
            </div>
          )}

          {accommodations && (
            <div className={styles.card}>
              <div className={styles.cardIcon}>🏨</div>
              <h3 className={styles.cardTitle}>Alojamiento Recomendado</h3>
              <p className={styles.cardText}>{accommodations}</p>
            </div>
          )}
        </div>
      )}

      {hasFaqs && faqs && (
        <div className={styles.faqSection}>
          <h3 className={styles.faqTitle}>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <h4 className={styles.faqQuestion}>{faq.question}</h4>
                <p className={styles.faqAnswer}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
