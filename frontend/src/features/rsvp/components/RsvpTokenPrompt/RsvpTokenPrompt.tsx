import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './RsvpTokenPrompt.module.css';

export const RsvpTokenPrompt: React.FC = () => {
  const [tokenInput, setTokenInput] = useState('');
  const navigate = useNavigate();

  const extractToken = (raw: string): string => {
    let cleaned = raw.trim();
    const rsvpIndex = cleaned.toLowerCase().indexOf('/rsvp/');
    if (rsvpIndex !== -1) {
      cleaned = cleaned.substring(rsvpIndex + 6);
      cleaned = cleaned.split('?')[0].replace(/\/+$/, '');
    }
    return cleaned.toUpperCase();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted && (pasted.includes('/rsvp/') || pasted.includes('http'))) {
      e.preventDefault();
      setTokenInput(extractToken(pasted));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = extractToken(tokenInput);
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
          Introduce el código personal de 6 caracteres que aparece en tu tarjeta de invitación para acceder a tus eventos y selección de menús.
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
              placeholder="Ej: K7M4XP"
              value={tokenInput}
              maxLength={120}
              onChange={(e) => setTokenInput(extractToken(e.target.value))}
              onPaste={handlePaste}
              required
              autoFocus
            />
            <span className={styles.hintText}>
              💡 También puedes pegar el enlace completo si lo recibiste por mensaje.
            </span>
          </div>

          <button type="submit" className={styles.submitButton}>
            Acceder al Formulario →
          </button>
        </form>

        <Link to="/" className={styles.backHomeLink}>
          ← Volver a la página principal
        </Link>
      </div>
    </div>
  );
};
