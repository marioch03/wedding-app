import React, { useState, useEffect } from 'react';
import type { PartyResponse, PartyUpsertRequest, GuestResponse, GuestRequest, GuestType, EventResponse } from '../../../../types';
import { partiesApi } from '../../../../lib/api/parties';
import { guestsApi } from '../../../../lib/api/guests';
import { eventsApi } from '../../../../lib/api/events';
import { QrCodeModal } from '../QrCodeModal/QrCodeModal';
import styles from './PartyModal.module.css';

interface PartyModalProps {
  party: PartyResponse | null;
  onClose: () => void;
  onSaved: (savedParty: PartyResponse) => void;
}

export const PartyModal: React.FC<PartyModalProps> = ({ party, onClose, onSaved }) => {
  const isEditing = !!party;
  const [activeTab, setActiveTab] = useState<'info' | 'guests' | 'events'>('info');

  // Party Form State
  const [displayName, setDisplayName] = useState(party?.displayName || '');
  const [languagePreference, setLanguagePreference] = useState(party?.languagePreference || 'es');
  const [internalNotes, setInternalNotes] = useState(party?.internalNotes || '');
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>(party?.eventIds || []);

  // Events list for association checklist
  const [allEvents, setAllEvents] = useState<EventResponse[]>([]);

  // Guests State
  const [guests, setGuests] = useState<GuestResponse[]>([]);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);

  // Guest Form State
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestType, setGuestType] = useState<GuestType>('ADULT');
  const [guestIsPlusOne, setGuestIsPlusOne] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestDiet, setGuestDiet] = useState('');

  // General State
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // QR & Link State
  const [showQrModal, setShowQrModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const rsvpUrl = party
    ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}/rsvp/${party.rsvpToken}`
    : '';

  const handleCopyLink = () => {
    if (navigator?.clipboard?.writeText && rsvpUrl) {
      navigator.clipboard.writeText(rsvpUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  useEffect(() => {
    // Load all events for the checklist
    eventsApi.list()
      .then((evList) => {
        setAllEvents(evList);
        if (!party) {
          // If creating a new party, check all events by default
          setSelectedEventIds(evList.map((e) => e.id));
        }
      })
      .catch((err) => console.error('Error loading events:', err));

    if (party) {
      partiesApi.getById(party.id)
        .then((freshParty) => {
          if (freshParty.eventIds && freshParty.eventIds.length > 0) {
            setSelectedEventIds(freshParty.eventIds);
          }
        })
        .catch((err) => console.error('Error fetching party details:', err));
    }
  }, [party]);

  useEffect(() => {
    if (party) {
      loadGuests(party.id);
    }
  }, [party]);

  const loadGuests = async (partyId: string) => {
    try {
      setLoadingGuests(true);
      const res = await guestsApi.listByParty(partyId);
      setGuests(res);
    } catch (err: any) {
      console.error('Error loading guests for party:', err);
    } finally {
      setLoadingGuests(false);
    }
  };

  const handleToggleEvent = (eventId: string) => {
    setSelectedEventIds((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  const resetGuestForm = () => {
    setGuestFirstName('');
    setGuestLastName('');
    setGuestType('ADULT');
    setGuestIsPlusOne(false);
    setGuestEmail('');
    setGuestPhone('');
    setGuestDiet('');
    setIsAddingGuest(false);
    setEditingGuestId(null);
  };

  const handleStartEditGuest = (guest: GuestResponse) => {
    setEditingGuestId(guest.id);
    setGuestFirstName(guest.firstName || '');
    setGuestLastName(guest.lastName || '');
    setGuestType(guest.guestType);
    setGuestIsPlusOne(guest.isPlusOne);
    setGuestEmail(guest.email || '');
    setGuestPhone(guest.phone || '');
    setGuestDiet(guest.dietaryRestrictions || '');
    setIsAddingGuest(true);
  };

  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!party) {
      setError('Debes guardar primero el grupo para poder añadir invitados.');
      return;
    }

    const guestPayload: GuestRequest = {
      partyId: party.id,
      firstName: guestFirstName.trim() || undefined,
      lastName: guestLastName.trim() || undefined,
      guestType,
      isPlusOne: guestIsPlusOne,
      email: guestEmail.trim() || undefined,
      phone: guestPhone.trim() || undefined,
      dietaryRestrictions: guestDiet.trim() || undefined,
    };

    try {
      if (editingGuestId) {
        await guestsApi.update(editingGuestId, guestPayload);
      } else {
        await guestsApi.createInParty(party.id, guestPayload);
      }
      resetGuestForm();
      await loadGuests(party.id);
    } catch (err: any) {
      console.error('Error saving guest:', err);
      setError(err?.message || 'Error al guardar el invitado');
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm('¿Eliminar este invitado del grupo?')) return;
    try {
      await guestsApi.delete(guestId);
      if (party) await loadGuests(party.id);
    } catch (err: any) {
      alert(err?.message || 'Error al eliminar invitado');
    }
  };

  const handleSaveParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('El nombre del grupo o familia es obligatorio.');
      return;
    }

    const payload: PartyUpsertRequest = {
      displayName: displayName.trim(),
      languagePreference,
      internalNotes: internalNotes.trim() || undefined,
      eventIds: selectedEventIds,
    };

    try {
      setSaving(true);
      setError(null);
      let saved: PartyResponse;
      if (isEditing && party) {
        saved = await partiesApi.update(party.id, payload);
      } else {
        saved = await partiesApi.create(payload);
      }
      onSaved(saved);
      onClose();
    } catch (err: any) {
      console.error('Error saving party:', err);
      setError(err?.message || 'Error al guardar el grupo');
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
            <div className={styles.modalIcon}>
              {isEditing ? '👥' : '✨'}
            </div>
            <div>
              <h2 className={styles.modalTitle}>
                {isEditing ? `Editar: ${party.displayName}` : 'Nuevo Grupo de Invitación'}
              </h2>
              <span className={styles.modalSubtitle}>
                {isEditing
                  ? 'Gestiona la información del grupo, eventos y acompañantes'
                  : 'Crea una invitación familiar o individual con enlace RSVP personalizado'}
              </span>
            </div>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabsContainer}>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'info' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Información General
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'events' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Eventos Asignados
            <span className={styles.tabBadge}>{selectedEventIds.length}</span>
          </button>
          {isEditing && (
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === 'guests' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('guests')}
            >
              Invitados del Grupo
              <span className={styles.tabBadge}>{guests.length}</span>
            </button>
          )}
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {error && <div className={styles.errorAlert}>⚠️ {error}</div>}

          {/* TAB 1: INFO GENERAL */}
          {activeTab === 'info' && (
            <form id="partyForm" onSubmit={handleSaveParty}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Nombre del Grupo o Familia *
                  <span className={styles.labelHint}>(Ej. Familia Morales, Juan y Acompañante)</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ej. Familia García Gómez"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Idioma de Invitación</label>
                  <select
                    className={styles.select}
                    value={languagePreference}
                    onChange={(e) => setLanguagePreference(e.target.value)}
                  >
                    <option value="es">Español (es)</option>
                    <option value="en">English (en)</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Notas Internas (Solo Organizadores)</label>
                <textarea
                  className={styles.textarea}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Ej. Amigos de la universidad. Requieren traslado desde el hotel."
                />
              </div>

              {party && (
                <div className={styles.invitationBox}>
                  <div className={styles.invitationHeader}>
                    <span>💌 Código para Tarjeta Física: <strong>{party.rsvpToken}</strong></span>
                    <button
                      type="button"
                      className={styles.invitationQrBtn}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                      onClick={() => {
                        if (navigator?.clipboard?.writeText) {
                          navigator.clipboard.writeText(party.rsvpToken);
                          setLinkCopied(true);
                          setTimeout(() => setLinkCopied(false), 2000);
                        }
                      }}
                      title="Copiar código corto de 6 caracteres"
                    >
                      {linkCopied ? '✓ Código Copiado' : '🏷️ Copiar Código'}
                    </button>
                  </div>
                  <div className={styles.invitationLinkRow}>
                    <input
                      type="text"
                      readOnly
                      value={rsvpUrl}
                      className={styles.invitationInput}
                      aria-label="Enlace RSVP del grupo"
                    />
                    <button
                      type="button"
                      className={styles.invitationCopyBtn}
                      onClick={handleCopyLink}
                    >
                      {linkCopied ? '✓ Copiado' : '📋 Copiar Enlace'}
                    </button>
                    <button
                      type="button"
                      className={styles.invitationQrBtn}
                      onClick={() => setShowQrModal(true)}
                    >
                      📱 QR
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: EVENTOS ASIGNADOS */}
          {activeTab === 'events' && (
            <div>
              <div className={styles.sectionHeading}>Eventos a los que está invitado el grupo</div>
              <p className={styles.modalSubtitle} style={{ marginTop: '0.25rem', marginBottom: '1rem' }}>
                Marca los eventos del día de la boda que estarán disponibles en su formulario de RSVP:
              </p>

              {allEvents.length === 0 ? (
                <div className={styles.emptyGuests}>No hay eventos creados todavía en la boda.</div>
              ) : (
                <div className={styles.eventsChecklist}>
                  {allEvents.map((event) => {
                    const isChecked = selectedEventIds.includes(event.id);
                    return (
                      <div
                        key={event.id}
                        className={`${styles.eventCheckItem} ${isChecked ? styles.eventCheckItemActive : ''}`}
                        onClick={() => handleToggleEvent(event.id)}
                      >
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={isChecked}
                          onChange={() => {}} // handled by parent onClick
                        />
                        <div className={styles.eventCheckItemLeft}>
                          <div>
                            <div className={styles.eventCheckName}>
                              {event.eventType === 'CEREMONY' && '💍 '}
                              {event.eventType === 'RECEPTION' && '🥂 '}
                              {event.eventType === 'PARTY' && '🎉 '}
                              {event.eventType === 'OTHER' && '✨ '}
                              {event.name}
                            </div>
                            <div className={styles.eventCheckMeta}>
                              {event.venueName ? `📍 ${event.venueName}` : 'Sin ubicación definida'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INVITADOS INDIVIDUALES (Only when editing party) */}
          {activeTab === 'guests' && (
            <div>
              <div className={styles.guestsHeader}>
                <div>
                  <div className={styles.sectionHeading}>Integrantes del Grupo</div>
                  <span className={styles.modalSubtitle}>
                    Personas individuales que confirman asistencia y eligen menú
                  </span>
                </div>
                {!isAddingGuest && (
                  <button
                    type="button"
                    className={styles.addGuestSmallButton}
                    onClick={() => {
                      resetGuestForm();
                      setIsAddingGuest(true);
                    }}
                  >
                    + Añadir Invitado
                  </button>
                )}
              </div>

              {/* Guest Form (Add / Edit) */}
              {isAddingGuest && (
                <form className={styles.guestInlineForm} onSubmit={handleSaveGuest}>
                  <div className={styles.formSubtitle}>
                    {editingGuestId ? '✏️ Editar Integrante' : '➕ Nuevo Integrante'}
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Nombre</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={guestFirstName}
                        onChange={(e) => setGuestFirstName(e.target.value)}
                        placeholder="Ej. Carlos"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Apellidos</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={guestLastName}
                        onChange={(e) => setGuestLastName(e.target.value)}
                        placeholder="Ej. Gómez"
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Tipo de Invitado</label>
                      <select
                        className={styles.select}
                        value={guestType}
                        onChange={(e) => setGuestType(e.target.value as GuestType)}
                      >
                        <option value="ADULT">Adulto</option>
                        <option value="CHILD">Niño</option>
                        <option value="INFANT">Bebé</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.checkboxContainer}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={guestIsPlusOne}
                          onChange={(e) => setGuestIsPlusOne(e.target.checked)}
                        />
                        <span>¿Es un Acompañante (+1)?</span>
                      </label>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Email (Opcional)</label>
                      <input
                        type="email"
                        className={styles.input}
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="carlos@ejemplo.com"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Teléfono (Opcional)</label>
                      <input
                        type="tel"
                        className={styles.input}
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+34 600 000 000"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Restricciones Dietéticas / Alergias</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={guestDiet}
                      onChange={(e) => setGuestDiet(e.target.value)}
                      placeholder="Ej. Celíaco, alérgico a los frutos secos, vegetariano..."
                    />
                  </div>

                  <div className={styles.inlineActions}>
                    <button type="button" className={styles.cancelButton} onClick={resetGuestForm}>
                      Cancelar
                    </button>
                    <button type="submit" className={styles.saveButton}>
                      {editingGuestId ? 'Guardar Cambios' : 'Añadir Integrante'}
                    </button>
                  </div>
                </form>
              )}

              {/* Guest List */}
              {loadingGuests ? (
                <div className={styles.emptyGuests}>Cargando invitados...</div>
              ) : guests.length === 0 ? (
                <div className={styles.emptyGuests}>
                  No hay personas añadidas a este grupo todavía. Haz clic en <strong>+ Añadir Invitado</strong>.
                </div>
              ) : (
                <div className={styles.guestList}>
                  {guests.map((g) => (
                    <div key={g.id} className={styles.guestItem}>
                      <div className={styles.guestItemLeft}>
                        <div className={styles.guestAvatar}>
                          {g.isPlusOne ? '➕' : g.guestType === 'CHILD' ? '🧒' : '👤'}
                        </div>
                        <div>
                          <div className={styles.guestName}>
                            {g.firstName || g.lastName ? `${g.firstName || ''} ${g.lastName || ''}`.trim() : 'Invitado sin nombre'}
                            {g.isPlusOne && <span className={styles.plusOneBadge}>+1 Acompañante</span>}
                          </div>
                          {g.dietaryRestrictions && (
                            <div className={styles.guestDiet}>
                              🥗 <em>{g.dietaryRestrictions}</em>
                            </div>
                          )}
                          <div className={styles.guestTypeTag}>
                            {g.guestType === 'ADULT' ? 'Adulto' : g.guestType === 'CHILD' ? 'Niño' : 'Bebé'}
                            {g.phone && ` • 📞 ${g.phone}`}
                          </div>
                        </div>
                      </div>
                      <div className={styles.guestActions}>
                        <button
                          type="button"
                          className={styles.iconActionButton}
                          onClick={() => handleStartEditGuest(g)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconActionButton} ${styles.iconActionButtonDanger}`}
                          onClick={() => handleDeleteGuest(g.id)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Cerrar
          </button>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSaveParty}
            disabled={saving}
          >
            {saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Grupo'}
          </button>
        </div>
      </div>

      {/* Modal para Ver / Descargar Código QR y Compartir */}
      {showQrModal && party && (
        <QrCodeModal
          party={party}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
};
