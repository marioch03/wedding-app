import React from 'react';
import styles from './RouteLoadingFallback.module.css';

export const RouteLoadingFallback: React.FC = () => {
  return (
    <div className={styles.fallbackContainer} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
      <span className={styles.loadingText}>Cargando...</span>
    </div>
  );
};
