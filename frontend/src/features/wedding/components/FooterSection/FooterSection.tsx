import React from 'react';
import { Link } from 'react-router-dom';
import styles from './FooterSection.module.css';

interface FooterSectionProps {
  partner1Name: string;
  partner2Name: string;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ partner1Name, partner2Name }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer} role="contentinfo" aria-label="Pie de página">
      {/* Resplandor ambiental de fondo */}
      <div className={styles.bgGlowCenter} aria-hidden="true" />

      <div className={styles.container}>
        {/* Botón flotante suave para volver arriba */}
        <button
          type="button"
          onClick={scrollToTop}
          className={styles.scrollTopButton}
          aria-label="Volver al inicio de la página"
          title="Volver arriba"
        >
          <span className={styles.scrollTopArrow} aria-hidden="true">↑</span>
          <span className={styles.scrollTopText}>Inicio</span>
        </button>

        <h3 className={styles.names}>
          {partner1Name} <span className={styles.ampersand}>&amp;</span> {partner2Name}
        </h3>

        <p className={styles.note}>Con muchas ganas de celebrar este gran día contigo</p>

        <div className={styles.adminLinkContainer}>
          <Link to="/admin" className={styles.adminLink}>
            <span className={styles.lockIcon} aria-hidden="true">🔒</span>
            <span>Acceso Administrador</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};
