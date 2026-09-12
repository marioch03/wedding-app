import React, { useState } from 'react';
import type { MenuOptionResponse, MenuOptionRequest, DietType } from '../../../../types';
import { eventsApi } from '../../../../lib/api/events';
import styles from './MenuOptionModal.module.css';

interface MenuOptionModalProps {
  eventId: string;
  eventName: string;
  menuOption?: MenuOptionResponse | null; // null if creating
  onClose: () => void;
  onSaved: () => void;
}

export const MenuOptionModal: React.FC<MenuOptionModalProps> = ({
  eventId,
  eventName,
  menuOption,
  onClose,
  onSaved,
}) => {
  const isEditing = !!menuOption;

  const [name, setName] = useState(menuOption?.name || '');
  const [dietType, setDietType] = useState<DietType>(menuOption?.dietType || 'STANDARD');
  const [description, setDescription] = useState(menuOption?.description || '');
  const [displayOrder, setDisplayOrder] = useState<number>(menuOption?.displayOrder ?? 0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('El nombre del menú o plato es obligatorio.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const request: MenuOptionRequest = {
        name: name.trim(),
        dietType,
        description: description.trim() || undefined,
        displayOrder: Number(displayOrder) || 0,
      };

      if (menuOption?.id) {
        await eventsApi.updateMenuOption(eventId, menuOption.id, request);
      } else {
        await eventsApi.addMenuOption(eventId, request);
      }

      onSaved();
    } catch (err: any) {
      console.error('Error saving menu option:', err);
      setError(err?.message || 'Error al guardar la opción de menú.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleWrapper}>
            <div className={styles.modalIcon}>🍽️</div>
            <div>
              <h2 className={styles.modalTitle}>
                {isEditing ? `Editar: ${menuOption.name}` : 'Añadir Opción de Menú'}
              </h2>
              <p className={styles.modalSubtitle}>Evento: {eventName}</p>
            </div>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <form id="menuOptionForm" onSubmit={handleSubmit}>
            {error && <div className={styles.errorAlert}>⚠️ {error}</div>}

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Nombre del Menú / Plato *
                <span className={styles.labelHint}>(Ej: Solomillo al Pedro Ximénez, Menú Infantil)</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ej: Lubina Salvaje con Verduras Glaseadas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tipo de Dieta</label>
                <select
                  className={styles.select}
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value as DietType)}
                >
                  <option value="STANDARD">🥩 Menú Estándar (Carne / Pescado)</option>
                  <option value="VEGETARIAN">🌱 Menú Vegetariano</option>
                  <option value="VEGAN">🥗 Menú Vegano</option>
                  <option value="CHILD">🧒 Menú Infantil</option>
                  <option value="OTHER">✨ Dieta Especial / Celíaco</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Orden de Visualización
                  <span className={styles.labelHint}>(1, 2, 3...)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className={styles.input}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Descripción de Platos / Ingredientes / Alérgenos
              </label>
              <textarea
                className={styles.textarea}
                placeholder="Ej: Entrante: Crema de bogavante. Principal: Solomillo de ternera. Postre: Tarta nupcial de frutos rojos..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="menuOptionForm"
            className={styles.saveButton}
            disabled={saving}
          >
            {saving ? 'Guardando...' : isEditing ? 'Actualizar Plato' : 'Guardar Plato'}
          </button>
        </div>
      </div>
    </div>
  );
};
