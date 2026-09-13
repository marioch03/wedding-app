import React, { useState } from 'react';
import type { EventResponse, EventRequest, EventType } from '../../../../types';
import { eventsApi } from '../../../../lib/api/events';
import styles from './EventModal.module.css';

interface EventModalProps {
  weddingId: string;
  event?: EventResponse | null; // null if creating
  onClose: () => void;
  onSaved: (savedEvent: EventResponse) => void;
}

const toLocalInputFormat = (isoString?: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toIsoFormat = (localString: string): string => {
  if (!localString) return '';
  const date = new Date(localString);
  return date.toISOString();
};

export const EventModal: React.FC<EventModalProps> = ({
  weddingId,
  event,
  onClose,
  onSaved,
}) => {
  const isEditing = !!event;

  const [name, setName] = useState(event?.name || '');
  const [eventType, setEventType] = useState<EventType>((event?.eventType as EventType) || 'CEREMONY');
  const [startDatetime, setStartDatetime] = useState(toLocalInputFormat(event?.startDatetime) || '');
  const [endDatetime, setEndDatetime] = useState(toLocalInputFormat(event?.endDatetime) || '');
  const [venueName, setVenueName] = useState(event?.venueName || '');
  const [address, setAddress] = useState(event?.address || '');
  const [description, setDescription] = useState(event?.description || '');
  const [displayOrder, setDisplayOrder] = useState<number>(event?.displayOrder ?? 0);
  const [isPublic, setIsPublic] = useState<boolean>(event?.isPublic ?? true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('El nombre del evento es obligatorio.');
      return;
    }
    if (!startDatetime) {
      setError('La fecha y hora de inicio es obligatoria.');
      return;
    }

    if (endDatetime && new Date(endDatetime) < new Date(startDatetime)) {
      setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const request: EventRequest = {
        weddingId: event?.weddingId || weddingId,
        name: name.trim(),
        eventType,
        startDatetime: toIsoFormat(startDatetime),
        endDatetime: endDatetime ? toIsoFormat(endDatetime) : undefined,
        venueName: venueName.trim() || undefined,
        address: address.trim() || undefined,
        description: description.trim() || undefined,
        displayOrder: Number(displayOrder) || 0,
        isPublic,
      };

      let saved: EventResponse;
      if (event?.id) {
        saved = await eventsApi.update(event.id, request);
      } else {
        saved = await eventsApi.create(request);
      }

      onSaved(saved);
    } catch (err: any) {
      console.error('Error saving event:', err);
      if (err?.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        const firstFieldMsg = Object.values(err.fieldErrors)[0] as string;
        setError(firstFieldMsg || err.message || 'Error al guardar el evento.');
      } else {
        setError(err?.message || 'Error al guardar el evento.');
      }
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
            <div className={styles.modalIcon}>{isEditing ? '✏️' : '📅'}</div>
            <div>
              <h2 className={styles.modalTitle}>
                {isEditing ? `Editar: ${event.name}` : 'Nuevo Evento del Día'}
              </h2>
              <p className={styles.modalSubtitle}>
                {isEditing
                  ? 'Modifica los horarios, ubicación y detalles del evento'
                  : 'Añade una parte del día (Ceremonia, Cóctel, Banquete, Fiesta)'}
              </p>
            </div>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className={styles.modalBody}>
          <form id="eventForm" onSubmit={handleSubmit}>
            {error && <div className={styles.errorAlert}>⚠️ {error}</div>}

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="eventName" className={styles.label}>
                  Nombre del Evento *
                  <span className={styles.labelHint}>(Ej: Banquete Nupcial)</span>
                </label>
                <input
                  id="eventName"
                  type="text"
                  className={styles.input}
                  placeholder="Ej: Ceremonia Religiosa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="eventType" className={styles.label}>Tipo de Evento</label>
                <select
                  id="eventType"
                  className={styles.select}
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                >
                  <option value="CEREMONY">💍 Ceremonia</option>
                  <option value="RECEPTION">🍽️ Cóctel / Banquete</option>
                  <option value="PARTY">🎉 Fiesta / Baile</option>
                  <option value="OTHER">✨ Otro Momento</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="startDatetime" className={styles.label}>Fecha y Hora de Inicio *</label>
                <input
                  id="startDatetime"
                  type="datetime-local"
                  className={styles.input}
                  value={startDatetime}
                  onChange={(e) => setStartDatetime(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Fecha y Hora de Fin
                  <span className={styles.labelHint}>(Opcional)</span>
                </label>
                <input
                  type="datetime-local"
                  className={styles.input}
                  value={endDatetime}
                  onChange={(e) => setEndDatetime(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Lugar / Finca
                  <span className={styles.labelHint}>(Ej: Finca Las Jarillas)</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Nombre del recinto o iglesia"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Orden en el Cronograma
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
              <label className={styles.label}>Dirección Completa</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Calle, número, código postal, ciudad"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Descripción o Indicaciones para los Invitados
              </label>
              <textarea
                className={styles.textarea}
                placeholder="Ej: Servicio de autobuses disponible desde el centro. Aparcamiento privado en la entrada principal."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <span>
                  <strong>Mostrar en la web pública</strong> (visible en el itinerario y countdown)
                </span>
              </label>
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
            form="eventForm"
            className={styles.saveButton}
            disabled={saving}
          >
            {saving ? 'Guardando...' : isEditing ? 'Actualizar Evento' : 'Crear Evento'}
          </button>
        </div>
      </div>
    </div>
  );
};
