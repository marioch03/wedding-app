import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { rsvpApi } from '../../../../lib/api';
import styles from './RsvpTokenPrompt.module.css';

export interface RsvpTokenPromptProps {
  initialError?: string | null;
  initialToken?: string;
  onSuccess?: (token: string) => void;
}

export const RsvpTokenPrompt: React.FC<RsvpTokenPromptProps> = ({
  initialError = null,
  initialToken = '',
  onSuccess,
}) => {
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const inputRef = useRef<HTMLInputElement>(null);
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
      setError(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenInput(extractToken(e.target.value));
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = extractToken(tokenInput);
    if (!cleanToken) return;

    setIsVerifying(true);
    setError(null);

    try {
      // Validar el token contra la API antes de navegar (TC-RSVP-002)
      await rsvpApi.getByToken(cleanToken);
      if (onSuccess) {
        onSuccess(cleanToken);
      } else {
        navigate(`/rsvp/${cleanToken}`);
      }
    } catch (err: any) {
      console.error('Error al validar código de invitación:', err);
      setError(
        err?.status === 404 || err?.message?.includes('No se encontró')
          ? 'El código de invitación no es válido o ha expirado.'
          : err?.message || 'El código de invitación no es válido o ha expirado.'
      );
      // Limpiar el campo y mantener al usuario en la misma ventana para reintentar (TC-RSVP-002)
      setTokenInput('');
      inputRef.current?.focus();
    } finally {
      setIsVerifying(false);
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

        {error && (
          <div className={styles.errorAlert} role="alert">
            <span className={styles.errorIcon}>⚠️</span>
            <div className={styles.errorTextWrapper}>
              <p className={styles.errorMessage}>{error}</p>
              <span className={styles.errorSubtext}>
                Por favor, comprueba que has introducido el código correctamente e inténtalo de nuevo.
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
            <label htmlFor="rsvp-code" className={styles.label}>
              Código de Invitación
            </label>
            <input
              ref={inputRef}
              id="rsvp-code"
              type="text"
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              placeholder="Ej: K7M4XP"
              value={tokenInput}
              maxLength={120}
              onChange={handleChange}
              onPaste={handlePaste}
              required
              autoFocus
              disabled={isVerifying}
            />
            <span className={styles.hintText}>
              💡 También puedes pegar el enlace completo si lo recibiste por mensaje.
            </span>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isVerifying || !tokenInput.trim()}
          >
            {isVerifying ? (
              <span className={styles.buttonLoadingText}>Comprobando...</span>
            ) : (
              'Continuar / Acceder al Formulario →'
            )}
          </button>
        </form>

        <Link to="/" className={styles.backHomeLink}>
          ← Volver a la página principal
        </Link>
      </div>
    </div>
  );
};
