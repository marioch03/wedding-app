import React from 'react';
import { Link } from 'react-router-dom';
import styles from './RsvpSuccess.module.css';

interface RsvpSuccessProps {
  partyName: string;
  onEdit: () => void;
}

export const RsvpSuccess: React.FC<RsvpSuccessProps> = ({ partyName, onEdit }) => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.checkIcon}>✓</div>
        <h1 className={styles.title}>¡Confirmación Enviada!</h1>
        <p className={styles.message}>
          Muchas gracias, <strong>{partyName}</strong>. Hemos registrado correctamente vuestra confirmación de asistencia y preferencias gastronómicas.
        </p>

        <div className={styles.actions}>
          <Link to="/" className={styles.homeButton}>
            Volver a la Web Principal
          </Link>
          <button type="button" onClick={onEdit} className={styles.editButton}>
            Modificar Respuestas
          </button>
        </div>
      </div>
    </div>
  );
};
