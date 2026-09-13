import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks';
import styles from './NotFoundPage.module.css';

export const NotFoundPage: React.FC = () => {
  usePageTitle('Página no encontrada | Nuestra Boda');

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Página no encontrada</h1>
        <p className={styles.description}>
          La dirección a la que intentas acceder no existe o no está disponible.
        </p>
        <Link to="/" className={styles.homeButton}>
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};
