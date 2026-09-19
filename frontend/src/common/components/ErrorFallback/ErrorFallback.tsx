import React from 'react';
import styles from './ErrorFallback.module.css';

interface ErrorFallbackProps {
  error?: unknown;
  resetError?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ resetError }) => {
  const handleReload = () => {
    if (resetError) {
      resetError();
    }
    window.location.reload();
  };

  const handleGoHome = () => {
    if (resetError) {
      resetError();
    }
    window.location.href = '/';
  };

  return (
    <div className={styles.container} role="alert">
      <div className={styles.card}>
        <div className={styles.iconWrapper} aria-hidden="true">
          ✨
        </div>
        <h1 className={styles.title}>Ha ocurrido un detalle inesperado</h1>
        <p className={styles.description}>
          Disculpa las molestias. Hemos tomado nota de la incidencia de forma automática para
          revisarla. Puedes intentar recargar la página o regresar al inicio.
        </p>
        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleReload}
            className={styles.primaryButton}
          >
            Recargar página
          </button>
          <button
            type="button"
            onClick={handleGoHome}
            className={styles.secondaryButton}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};
