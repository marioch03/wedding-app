import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './RsvpTokenPrompt.module.css';

export const RsvpTokenPrompt: React.FC = () => {
  const [tokenInput, setTokenInput] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = tokenInput.trim();
    if (cleanToken) {
      navigate(`/rsvp/${cleanToken}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.background} />
      <div className={styles.overlay} />

      <div className={styles.card}>
        <span className={styles.tag}>Confirmación de Asistencia</span>
        <h1 className={styles.title}>Tu Invitación</h1>
        <p className={styles.description}>
          Introduce el código personal que aparece en tu tarjeta de invitación para acceder a tus eventos y selección de menús.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
            <label htmlFor="rsvp-code" className={styles.label}>
              Código de Invitación
            </label>
            <input
              id="rsvp-code"
              type="text"
              className={styles.input}
              placeholder="Ej: ABC123XYZ"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Acceder al Formulario
          </button>
        </form>

        <Link to="/" className={styles.backHomeLink}>
          ← Volver a la página principal
        </Link>
      </div>
    </div>
  );
};
