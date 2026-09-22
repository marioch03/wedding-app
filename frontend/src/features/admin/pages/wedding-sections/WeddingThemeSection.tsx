import React from 'react';
import styles from '../AdminWeddingPage.module.css';

interface WeddingThemeSectionProps {
  primaryColor: string;
  accentColor: string;
  onPrimaryColorChange: (newColor: string) => void;
  onAccentColorChange: (newColor: string) => void;
  onResetColors: () => void;
}

export const WeddingThemeSection: React.FC<WeddingThemeSectionProps> = ({
  primaryColor,
  accentColor,
  onPrimaryColorChange,
  onAccentColorChange,
  onResetColors,
}) => {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>🎨</div>
        <div>
          <h2 className={styles.sectionTitle}>Color & Estilo Visual de la Boda</h2>
          <span className={styles.sectionSubtitle}>
            Personaliza el color principal de botones, títulos, degradados y detalles de la web
          </span>
        </div>
      </div>

      <div className={styles.sectionBody}>
        <div className={styles.colorThemeRow}>
          {/* Color Principal */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Color Principal de la Boda
              <span className={styles.labelHint}>(Botones, encabezados, monograma y degradados)</span>
            </label>
            <div className={styles.colorInputWrapper}>
              <input
                type="color"
                className={styles.nativeColorPicker}
                value={primaryColor && primaryColor.startsWith('#') ? primaryColor : '#df6a4f'}
                onChange={(e) => onPrimaryColorChange(e.target.value)}
                aria-label="Selector visual de color principal"
              />
              <input
                type="text"
                className={styles.colorHexInput}
                placeholder="#DF6A4F (Color por defecto)"
                value={primaryColor}
                maxLength={7}
                onChange={(e) => onPrimaryColorChange(e.target.value)}
              />
            </div>
          </div>

          {/* Color de Acento (Opcional) */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Color de Acento / Dorado (Opcional)
              <span className={styles.labelHint}>(Detalles dorados, iconos y adornos secundarios)</span>
            </label>
            <div className={styles.colorInputWrapper}>
              <input
                type="color"
                className={styles.nativeColorPicker}
                value={accentColor && accentColor.startsWith('#') ? accentColor : '#cba258'}
                onChange={(e) => onAccentColorChange(e.target.value)}
                aria-label="Selector visual de color secundario"
              />
              <input
                type="text"
                className={styles.colorHexInput}
                placeholder="#CBA258 (Dorado por defecto)"
                value={accentColor}
                maxLength={7}
                onChange={(e) => onAccentColorChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tarjeta de Previsualización en Vivo */}
        <div className={styles.colorPreviewCard}>
          <div className={styles.colorPreviewSample}>
            <button type="button" className={styles.sampleButton}>
              Botón de Muestra
            </button>
            <span className={styles.sampleTag}>Etiqueta Destacada</span>
          </div>

          {(primaryColor || accentColor) && (
            <button
              type="button"
              className={styles.resetColorButton}
              onClick={onResetColors}
            >
              ↺ Restablecer colores originales
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
