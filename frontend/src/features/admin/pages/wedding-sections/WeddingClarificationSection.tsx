import React from 'react';
import { DEFAULT_CLARIFICATION_TITLE } from '../../../../types';
import styles from '../AdminWeddingPage.module.css';

interface WeddingClarificationSectionProps {
  clarificationTitle: string;
  setClarificationTitle: (value: string) => void;
  clarificationText: string;
  setClarificationText: (value: string) => void;
  saving: boolean;
  loading: boolean;
  saveSuccess: boolean;
}

export const WeddingClarificationSection: React.FC<WeddingClarificationSectionProps> = ({
  clarificationTitle,
  setClarificationTitle,
  clarificationText,
  setClarificationText,
  saving,
  loading,
  saveSuccess,
}) => {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>🤍</div>
        <div>
          <h2 className={styles.sectionTitle}>
            Una pequeña aclaración sobre nuestra celebración 🤍
          </h2>
          <span className={styles.sectionSubtitle}>
            Muestra una nota aclaratoria destacada a los invitados justo antes de la sección de preguntas frecuentes
          </span>
        </div>
      </div>

      <div className={styles.sectionBody}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="clarificationTitleInput">
            Título de la Aclaración
            <span className={styles.labelHint}>
              (Por defecto: «{DEFAULT_CLARIFICATION_TITLE}»)
            </span>
          </label>
          <input
            id="clarificationTitleInput"
            type="text"
            className={styles.input}
            value={clarificationTitle}
            onChange={(e) => setClarificationTitle(e.target.value)}
            placeholder={DEFAULT_CLARIFICATION_TITLE}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="clarificationTextInput">
            Texto Aclarativo para los Invitados
            <span className={styles.labelHint}>
              (Si se deja vacío, la sección no se mostrará en la web pública)
            </span>
          </label>
          <textarea
            id="clarificationTextInput"
            className={styles.textarea}
            value={clarificationText}
            onChange={(e) => setClarificationText(e.target.value)}
            placeholder="Escribe aquí el texto aclarativo sobre vuestra celebración que queréis transmitir con cariño a los invitados..."
            rows={5}
          />
        </div>

        <div className={styles.customSectionsFooter}>
          <button
            type="button"
            className={styles.quickSamplesBtn}
            onClick={() => setClarificationTitle(DEFAULT_CLARIFICATION_TITLE)}
          >
            ↺ Restaurar título predeterminado
          </button>

          <button
            type="submit"
            form="weddingConfigForm"
            className={`${styles.sectionSaveBtn} ${saveSuccess ? styles.saveButtonSuccess : ''}`}
            disabled={saving || loading}
          >
            {saving
              ? 'Guardando...'
              : saveSuccess
              ? '✓ ¡Guardado con Éxito!'
              : '💾 Guardar Aclaración'}
          </button>
        </div>
      </div>
    </div>
  );
};

