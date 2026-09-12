import React from 'react';
import { Link } from 'react-router-dom';
import styles from './FooterSection.module.css';

interface FooterSectionProps {
  partner1Name: string;
  partner2Name: string;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ partner1Name, partner2Name }) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.heart}>❦</div>
      <h3 className={styles.names}>
        {partner1Name} & {partner2Name}
      </h3>
      <p className={styles.note}>Con muchas ganas de celebrar este gran día contigo</p>

      <div className={styles.adminLinkContainer}>
        <Link to="/admin" className={styles.adminLink}>
          Acceso Administrador
        </Link>
      </div>
    </footer>
  );
};
