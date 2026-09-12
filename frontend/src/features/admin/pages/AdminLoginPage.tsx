import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import styles from './AdminLoginPage.module.css';

export const AdminLoginPage: React.FC = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.background} />
      <div className={styles.overlay} />

      <div className={styles.contentWrapper}>
        <div className={styles.headerInfo}>
          <span className={styles.tag}>Panel Privado</span>
          <h1 className={styles.title}>Administración</h1>
          <p className={styles.subtitle}>
            Inicia sesión con tu cuenta autorizada para gestionar la boda.
          </p>
        </div>

        {/* routing="virtual" maneja los pasos (email -> password -> 2FA) 100% en memoria sin cambiar URL ni provocar refrescos */}
        <div className={styles.clerkContainer}>
          <SignIn
            routing="virtual"
            fallbackRedirectUrl="/admin"
            appearance={{
              elements: {
                rootBox: {
                  width: '100%',
                  maxWidth: '440px',
                  display: 'flex',
                  justifyContent: 'center',
                },
                card: {
                  width: '100%',
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1.5px solid var(--color-border)',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
                },
                headerTitle: {
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.55rem',
                  fontWeight: '700',
                  color: 'var(--color-text-heading)',
                },
                headerSubtitle: {
                  color: 'var(--color-text-body)',
                  fontSize: '0.9rem',
                },
                formButtonPrimary: {
                  background: 'var(--color-primary-gradient)',
                  borderRadius: '9999px',
                  fontWeight: '700',
                  fontSize: '1rem',
                  padding: '0.85rem 1.5rem',
                  boxShadow: '0 8px 20px var(--color-primary-glow)',
                  border: 'none',
                  transition: 'transform 0.2s ease, filter 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    filter: 'brightness(1.06)',
                  },
                },
                formFieldInput: {
                  borderRadius: '8px',
                  border: '1.5px solid var(--color-border)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.95rem',
                  padding: '0.75rem 1rem',
                  '&:focus': {
                    borderColor: 'var(--color-primary)',
                    boxShadow: '0 0 0 3px var(--color-primary-light)',
                  },
                },
                footerAction: {
                  display: 'none',
                },
                footer: {
                  display: 'none',
                },
              },
              variables: {
                colorPrimary: '#e27d60',
                colorText: '#2e1d1a',
                fontFamily: 'var(--font-sans)',
              },
            }}
          />
        </div>

        <Link to="/" className={styles.backHomeLink}>
          ← Volver a la página principal
        </Link>
      </div>
    </div>
  );
};
