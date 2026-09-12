import React, { useState, useEffect } from 'react';
import type {
  PartyResponse,
  PartyUpsertRequest,
  GuestResponse,
  GuestRequest,
  GuestType,
} from '../../../../types';
import { partiesApi } from '../../../../lib/api/parties';
import { guestsApi } from '../../../../lib/api/guests';
import { ConfirmModal } from '../../../../common/components';
import styles from './PartyModal.module.css';

interface PartyModalProps {
  party?: PartyResponse | null; // null if creating a new party
  onClose: () => void;
  onSaved: (party: PartyResponse) => void;
}

export const PartyModal: React.FC<PartyModalProps> = ({ party, onClose, onSaved }) => {
  const isEditing = !!party;
  const [activeTab, setActiveTab] = useState<'info' | 'guests'>('info');

  // Party Form State
  const [displayName, setDisplayName] = useState(party?.displayName || '');
  const [languagePreference, setLanguagePreference] = useState(party?.languagePreference || 'es');
  const [internalNotes, setInternalNotes] = useState(party?.internalNotes || '');
  const [savingParty, setSavingParty] = useState(false);
  const [partyError, setPartyError] = useState<string | null>(null);

  // Guests in this party
  const [guests, setGuests] = useState<GuestResponse[]>([]);
  const [loadingGuests, setLoadingGuests] = useState(false);

  // Guest To Delete Confirmation State
  const [guestToDelete, setGuestToDelete] = useState<GuestResponse | null>(null);
  const [isDeletingGuest, setIsDeletingGuest] = useState(false);

  // Inline Guest Form State (Adding or Editing)
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestType, setGuestType] = useState<GuestType>('ADULT');
  const [isPlusOne, setIsPlusOne] = useState(false);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [savingGuest, setSavingGuest] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  // Load guests if editing existing party
  useEffect(() => {
    if (party?.id) {
      loadPartyGuests(party.id);
    }
  }, [party?.id]);

  const loadPartyGuests = async (partyId: string) => {
    try {
      setLoadingGuests(true);
      const data = await guestsApi.listByParty(partyId);
      setGuests(data);
    } catch (err: unknown) {
      console.error('Error loading guests:', err);
    } finally {
      setLoadingGuests(false);
    }
  };

  const resetGuestForm = () => {
    setEditingGuestId(null);
    setGuestFirstName('');
    setGuestLastName('');
    setGuestType('ADULT');
    setIsPlusOne(false);
    setDietaryRestrictions('');
    setGuestEmail('');
    setGuestPhone('');
    setGuestError(null);
    setShowGuestForm(false);
  };

  const handleOpenEditGuest = (guest: GuestResponse) => {
    setEditingGuestId(guest.id);
    setGuestFirstName(guest.firstName || '');
    setGuestLastName(guest.lastName || '');
    setGuestType(guest.guestType || 'ADULT');
    setIsPlusOne(guest.isPlusOne || false);
    setDietaryRestrictions(guest.dietaryRestrictions || '');
    setGuestEmail(guest.email || '');
    setGuestPhone(guest.phone || '');
    setGuestError(null);
    setShowGuestForm(true);
  };

  const handleSaveParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setPartyError('El nombre del grupo o familia es obligatorio.');
      return;
    }

    try {
      setSavingParty(true);
      setPartyError(null);

      const request: PartyUpsertRequest = {
        displayName: displayName.trim(),
        languagePreference,
        internalNotes: internalNotes.trim() || undefined,
      };

      let saved: PartyResponse;
      if (party?.id) {
        saved = await partiesApi.update(party.id, request);
      } else {
        saved = await partiesApi.create(request);
      }

      onSaved(saved);
    } catch (err: any) {
      setPartyError(err?.message || 'Error al guardar el grupo.');
    } finally {
      setSavingParty(false);
    }
  };

  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!party?.id) {
      setGuestError('Primero debes guardar el grupo antes de añadir invitados.');
      return;
    }

    if (!isPlusOne && !guestFirstName.trim()) {
      setGuestError('Debes indicar al menos el nombre o marcarlo como acompañante (+1).');
      return;
    }

    try {
      setSavingGuest(true);
      setGuestError(null);

      const payload: GuestRequest = {
        firstName: guestFirstName.trim() || undefined,
        lastName: guestLastName.trim() || undefined,
        guestType,
        isPlusOne,
        dietaryRestrictions: dietaryRestrictions.trim() || undefined,
        email: guestEmail.trim() || undefined,
        phone: guestPhone.trim() || undefined,
      };

      if (editingGuestId) {
        await guestsApi.update(editingGuestId, payload);
      } else {
        await guestsApi.createInParty(party.id, payload);
      }

      await loadPartyGuests(party.id);
      resetGuestForm();
    } catch (err: any) {
      setGuestError(err?.message || 'Error al guardar el invitado.');
    } finally {
      setSavingGuest(false);
    }
  };

  const handleConfirmDeleteGuest = async () => {
    if (!guestToDelete) return;

    try {
      setIsDeletingGuest(true);
      await guestsApi.delete(guestToDelete.id);
      if (party?.id) {
        await loadPartyGuests(party.id);
      }
      setGuestToDelete(null);
    } catch (err: any) {
      alert(err?.message || 'Error al eliminar el invitado.');
    } finally {
      setIsDeletingGuest(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleWrapper}>
            <div className={styles.modalIcon}>{isEditing ? '✏️' : '👥'}</div>
            <div>
              <h2 className={styles.modalTitle}>
                {isEditing ? `Editar: ${party.displayName}` : 'Nuevo Grupo / Familia'}
              </h2>
              <p className={styles.modalSubtitle}>
                {isEditing
                  ? 'Gestiona la información y los integrantes del grupo'
                  : 'Registra un grupo para enviar invitaciones personalizadas'}
              </p>
            </div>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Tabs (Only if editing existing party) */}
        {isEditing && (
          <div className={styles.tabsContainer}>
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === 'info' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('info')}
            >
              <span>📋</span> Datos del Grupo
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === 'guests' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('guests')}
            >
              <span>👥</span> Invitados / Acompañantes
              <span className={styles.tabBadge}>{guests.length}</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {activeTab === 'info' && (
            <form id="partyForm" onSubmit={handleSaveParty}>
              {partyError && <div className={styles.errorAlert}>⚠️ {partyError}</div>}

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Nombre del Grupo / Familia *
                  <span className={styles.labelHint}>(Ej: Familia García Pérez, Mario & Laura)</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ej: Familia Morales Ruiz"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Idioma de la Invitación</label>
                  <select
                    className={styles.select}
                    value={languagePreference}
                    onChange={(e) => setLanguagePreference(e.target.value)}
                  >
                    <option value="es">🇪🇸 Español (es)</option>
                    <option value="en">🇬🇧 English (en)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Estado Actual
                    <span className={styles.labelHint}>
                      {party?.status || 'PENDIENTE'}
                    </span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={party ? party.status : 'PENDING (Automático)'}
                    disabled
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Notas Internas
                  <span className={styles.labelHint}>(Solo visible para administradores)</span>
                </label>
                <textarea
                  className={styles.textarea}
                  placeholder="Ej: Amigos de la universidad, asignar en mesa principal..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                />
              </div>
            </form>
          )}

          {activeTab === 'guests' && isEditing && (
            <div>
              <div className={styles.guestsHeader}>
                <h3 className={styles.sectionHeading}>Integrantes del Grupo</h3>
                {!showGuestForm && (
                  <button
                    type="button"
                    className={styles.addGuestSmallButton}
                    onClick={() => {
                      resetGuestForm();
                      setShowGuestForm(true);
                    }}
                  >
                    <span>➕</span> Añadir Integrante
                  </button>
                )}
              </div>

              {/* Guest Form Inline */}
              {showGuestForm && (
                <form className={styles.guestInlineForm} onSubmit={handleSaveGuest}>
                  <div className={styles.formSubtitle}>
                    {editingGuestId ? '✏️ Modificar Invitado' : '➕ Nuevo Integrante / +1'}
                  </div>

                  {guestError && <div className={styles.errorAlert}>⚠️ {guestError}</div>}

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Nombre</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder={isPlusOne ? 'Acompañante (+1)' : 'Nombre'}
                        value={guestFirstName}
                        onChange={(e) => setGuestFirstName(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Apellidos</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Apellidos"
                        value={guestLastName}
                        onChange={(e) => setGuestLastName(e.target.value)}
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
                        <option value="CHILD">Niño (Menú infantil)</option>
                        <option value="INFANT">Bebé (Trona / Cochecito)</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>¿Es Acompañante (+1)?</label>
                      <label className={styles.checkboxContainer}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={isPlusOne}
                          onChange={(e) => setIsPlusOne(e.target.checked)}
                        />
                        <span>El invitado indicará su nombre en el RSVP</span>
                      </label>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Restricciones Dietéticas / Alergias</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ej: Celíaco, Alergia al marisco, Vegetariano..."
                      value={dietaryRestrictions}
                      onChange={(e) => setDietaryRestrictions(e.target.value)}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Email (Opcional)</label>
                      <input
                        type="email"
                        className={styles.input}
                        placeholder="correo@ejemplo.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Teléfono (Opcional)</label>
                      <input
                        type="tel"
                        className={styles.input}
                        placeholder="+34 600 000 000"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.inlineActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={resetGuestForm}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={styles.saveButton}
                      disabled={savingGuest}
                    >
                      {savingGuest ? 'Guardando...' : editingGuestId ? 'Actualizar' : 'Añadir Integrante'}
                    </button>
                  </div>
                </form>
              )}

              {/* Guest List */}
              {loadingGuests ? (
                <div className={styles.emptyGuests}>Cargando invitados del grupo...</div>
              ) : guests.length === 0 ? (
                <div className={styles.emptyGuests}>
                  <p>Este grupo no tiene ningún invitado asociado todavía.</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Haz clic en <strong>"➕ Añadir Integrante"</strong> para registrar a las personas o acompañantes.
                  </p>
                </div>
              ) : (
                <div className={styles.guestList}>
                  {guests.map((g) => (
                    <div key={g.id} className={styles.guestItem}>
                      <div className={styles.guestItemLeft}>
                        <div className={styles.guestAvatar}>
                          {g.guestType === 'CHILD' ? '🧒' : g.guestType === 'INFANT' ? '👶' : '👤'}
                        </div>
                        <div>
                          <div className={styles.guestName}>
                            {g.firstName || g.lastName
                              ? `${g.firstName || ''} ${g.lastName || ''}`.trim()
                              : 'Acompañante'}
                            {g.isPlusOne && <span className={styles.plusOneBadge}>+1</span>}
                            <span className={styles.guestTypeTag}>({g.guestType.toLowerCase()})</span>
                          </div>
                          {g.dietaryRestrictions && (
                            <div className={styles.guestDiet}>
                              <span>🥗</span> {g.dietaryRestrictions}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={styles.guestActions}>
                        <button
                          type="button"
                          className={styles.iconActionButton}
                          title="Editar invitado"
                          onClick={() => handleOpenEditGuest(g)}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconActionButton} ${styles.iconActionButtonDanger}`}
                          title="Eliminar invitado"
                          onClick={() => setGuestToDelete(g)}
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

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Cerrar
          </button>
          {activeTab === 'info' && (
            <button
              type="submit"
              form="partyForm"
              className={styles.saveButton}
              disabled={savingParty}
            >
              {savingParty ? 'Guardando...' : isEditing ? 'Actualizar Grupo' : 'Crear Grupo'}
            </button>
          )}
        </div>
      </div>

      {/* Modal de Confirmación para Eliminar Integrante */}
      <ConfirmModal
        isOpen={!!guestToDelete}
        title="¿Eliminar invitado?"
        message={`¿Estás seguro de eliminar a ${guestToDelete?.firstName || 'este invitado'} del grupo?`}
        confirmText="Eliminar Invitado"
        cancelText="Cancelar"
        variant="danger"
        loading={isDeletingGuest}
        onConfirm={handleConfirmDeleteGuest}
        onCancel={() => setGuestToDelete(null)}
      />
    </div>
  );
};
