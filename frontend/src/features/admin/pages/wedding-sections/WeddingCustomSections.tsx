import React from 'react';
import type { PracticalDetailSection } from '../../../../types';
import styles from '../AdminWeddingPage.module.css';

export const SUGGESTED_SECTION_ICONS = [
  '🎁', '👶', '🎵', '📸', '🅿️', '🐾', '💍', '🍽️', '💡', 'ℹ️', '📍', '🍸'
];

interface WeddingCustomSectionsProps {
  customSections: PracticalDetailSection[];
  onAddSection: () => void;
  onDeleteSection: (index: number) => void;
  onMoveSection: (index: number, direction: 'up' | 'down') => void;
  onUpdateSection: (index: number, field: keyof PracticalDetailSection, value: string) => void;
  saving: boolean;
  loading: boolean;
  saveSuccess: boolean;
}

export const WeddingCustomSections: React.FC<WeddingCustomSectionsProps> = ({
  customSections,
  onAddSection,
  onDeleteSection,
  onMoveSection,
  onUpdateSection,
  saving,
  loading,
  saveSuccess,
}) => {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>ℹ️</div>
        <div>
          <h2 className={styles.sectionTitle}>Detalles Prácticos para Invitados</h2>
          <span className={styles.sectionSubtitle}>
            Tarjetas informativas útiles (código de vestimenta, transporte, alojamiento, regalos, niños, etc.)
          </span>
        </div>
      </div>

      <div className={styles.sectionBody}>
        {/* Secciones Personalizadas de Información */}
        <div className={styles.customSectionsContainer}>
          <div className={styles.customSectionsHeader}>
            <div>
              <h3 className={styles.customSectionsTitle}>
                <span>📑</span> Secciones Adicionales Personalizadas
              </h3>
              <span className={styles.labelHint}>
                Añade tarjetas adicionales para regalos, lista de bodas, niños, fotos, peticiones musicales o cualquier otra indicación
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={styles.addSectionBtn}
                onClick={onAddSection}
              >
                + Añadir Sección
              </button>
              <button
                type="submit"
                form="weddingConfigForm"
                className={styles.sectionSaveBtn}
                disabled={saving || loading}
              >
                {saving ? 'Guardando...' : '💾 Guardar Secciones'}
              </button>
            </div>
          </div>

          {customSections.length === 0 ? (
            <div className={styles.emptyCustomSections}>
              <span>No hay secciones personalizadas adicionales añadidas todavía.</span>
              <button
                type="button"
                className={styles.addSectionBtn}
                onClick={onAddSection}
              >
                + Añadir la primera sección (ej. Lista de Bodas o Niños)
              </button>
            </div>
          ) : (
            <div className={styles.customSectionsList}>
              {customSections.map((sec, index) => (
                <div key={sec.id || index} className={styles.customSectionCard}>
                  <div className={styles.customSectionTop}>
                    <div className={styles.sectionBadge}>
                      <span>Sección {index + 1}</span>
                      {sec.title ? ` • ${sec.title}` : ''}
                    </div>
                    <div className={styles.sectionActions}>
                      <button
                        type="button"
                        className={styles.moveBtn}
                        onClick={() => onMoveSection(index, 'up')}
                        disabled={index === 0}
                        title="Mover sección arriba"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className={styles.moveBtn}
                        onClick={() => onMoveSection(index, 'down')}
                        disabled={index === customSections.length - 1}
                        title="Mover sección abajo"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        className={styles.deleteSectionBtn}
                        onClick={() => onDeleteSection(index)}
                        title="Eliminar esta sección"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className={styles.sectionIconRow}>
                    <label className={styles.label}>
                      Icono / Emoji de la Tarjeta
                      <span className={styles.labelHint}>(Elige uno sugerido o escribe el que prefieras)</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        className={styles.customIconInput}
                        value={sec.icon || 'ℹ️'}
                        onChange={(e) => onUpdateSection(index, 'icon', e.target.value)}
                        maxLength={4}
                        title="Emoji personalizado"
                      />
                      <div className={styles.iconChips}>
                        {SUGGESTED_SECTION_ICONS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className={`${styles.iconChip} ${sec.icon === emoji ? styles.iconChipSelected : ''}`}
                            onClick={() => onUpdateSection(index, 'icon', emoji)}
                            title={`Seleccionar ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Título de la Sección *
                      <span className={styles.labelHint}>(Ej. Lista de Bodas & Regalos, Niños en el Enlace, Canciones...)</span>
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      value={sec.title}
                      onChange={(e) => onUpdateSection(index, 'title', e.target.value)}
                      placeholder="Introduce un título descriptivo"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Contenido / Descripción *
                      <span className={styles.labelHint}>(Información detallada que verán los invitados)</span>
                    </label>
                    <textarea
                      className={styles.textarea}
                      value={sec.description}
                      onChange={(e) => onUpdateSection(index, 'description', e.target.value)}
                      placeholder="Escribe aquí las indicaciones o detalles para los invitados..."
                      rows={3}
                    />
                  </div>
                </div>
              ))}

              <div className={styles.customSectionsFooter}>
                <button
                  type="button"
                  className={styles.addSectionBtn}
                  onClick={onAddSection}
                >
                  + Añadir Otra Sección
                </button>
                <button
                  type="submit"
                  form="weddingConfigForm"
                  className={`${styles.sectionSaveBtn} ${saveSuccess ? styles.saveButtonSuccess : ''}`}
                  disabled={saving || loading}
                >
                  {saving ? (
                    <>
                      <span className={styles.uploadSpinner} style={{ borderTopColor: 'var(--color-text-on-primary)', width: '13px', height: '13px' }} />
                      Guardando...
                    </>
                  ) : saveSuccess ? (
                    '✓ ¡Guardado con Éxito!'
                  ) : (
                    '💾 Guardar Secciones'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
