import React, { useState, useEffect } from 'react';
import type { RsvpInfoResponse, RsvpSubmitRequest, GuestRsvpDto, EventRsvpDto } from '../../../../types';
import { rsvpApi } from '../../../../lib/api/rsvp';
import { guestsApi } from '../../../../lib/api/guests';
import styles from './ManualRsvpModal.module.css';

interface ManualRsvpModalProps {
  partyId: string;
  partyName: string;
  onClose: () => void;
  onSaved: () => void;
}

interface GuestFormState {
  guestId: string;
  fullName: string;
  isPlusOne: boolean;
  dietaryRestrictions: string;
  events: {
    eventId: string;
    eventName: string;
    attending: boolean | null;
    menuOptionId: string;
    specialNotes: string;
  }[];
}

export const ManualRsvpModal: React.FC<ManualRsvpModalProps> = ({
  partyId,
  partyName,
  onClose,
  onSaved,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rsvpInfo, setRsvpInfo] = useState<RsvpInfoResponse | null>(null);
  const [guestsState, setGuestsState] = useState<GuestFormState[]>([]);

  useEffect(() => {
    loadPartyData();
  }, [partyId]);

  const loadPartyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await rsvpApi.getByPartyIdAdmin(partyId);
      setRsvpInfo(info);

      // Load each guest's current attendances from guest detail API
      const loadedGuests: GuestFormState[] = [];

      for (const g of info.guests) {
        let currentAttendances: Record<string, { attending: boolean; menuOptionId?: string; specialNotes?: string }> = {};

        try {
          const detail = await guestsApi.getById(g.id);
          if (detail.eventAttendances) {
            for (const att of detail.eventAttendances) {
              if (att.attending !== undefined && att.attending !== null) {
                currentAttendances[att.eventId] = {
                  attending: att.attending,
                  menuOptionId: att.menuOptionId,
                  specialNotes: att.specialNotes,
                };
              }
            }
          }
        } catch (detailErr) {
          console.warn('Could not load detailed guest attendance for', g.id, detailErr);
        }

        const eventsState = info.allowedEvents.map((ev) => {
          const prev = currentAttendances[ev.id];
          return {
            eventId: ev.id,
            eventName: ev.name,
            attending: prev ? prev.attending : null,
            menuOptionId: prev?.menuOptionId || (ev.menuOptions?.[0]?.id || ''),
            specialNotes: prev?.specialNotes || '',
          };
        });

        const name = `${g.firstName || ''} ${g.lastName || ''}`.trim() || 'Invitado';

        loadedGuests.push({
          guestId: g.id,
          fullName: name,
          isPlusOne: !!g.isPlusOne,
          dietaryRestrictions: g.dietaryRestrictions || '',
          events: eventsState,
        });
      }

      setGuestsState(loadedGuests);
    } catch (err: any) {
      console.error('Error loading party data:', err);
      setError(err?.message || 'No se pudo cargar la información del grupo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetAttending = (guestIndex: number, eventIndex: number, attending: boolean) => {
    setGuestsState((prev) => {
      const copy = [...prev];
      const guestCopy = { ...copy[guestIndex] };
      const eventsCopy = [...guestCopy.events];
      eventsCopy[eventIndex] = {
        ...eventsCopy[eventIndex],
        attending,
      };
      guestCopy.events = eventsCopy;
      copy[guestIndex] = guestCopy;
      return copy;
    });
  };

  const handleSetMenuOption = (guestIndex: number, eventIndex: number, menuOptionId: string) => {
    setGuestsState((prev) => {
      const copy = [...prev];
      const guestCopy = { ...copy[guestIndex] };
      const eventsCopy = [...guestCopy.events];
      eventsCopy[eventIndex] = {
        ...eventsCopy[eventIndex],
        menuOptionId,
      };
      guestCopy.events = eventsCopy;
      copy[guestIndex] = guestCopy;
      return copy;
    });
  };

  const handleSetSpecialNotes = (guestIndex: number, eventIndex: number, specialNotes: string) => {
    setGuestsState((prev) => {
      const copy = [...prev];
      const guestCopy = { ...copy[guestIndex] };
      const eventsCopy = [...guestCopy.events];
      eventsCopy[eventIndex] = {
        ...eventsCopy[eventIndex],
        specialNotes,
      };
      guestCopy.events = eventsCopy;
      copy[guestIndex] = guestCopy;
      return copy;
    });
  };

  const handleSetDiet = (guestIndex: number, dietaryRestrictions: string) => {
    setGuestsState((prev) => {
      const copy = [...prev];
      copy[guestIndex] = {
        ...copy[guestIndex],
        dietaryRestrictions,
      };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verify all attendances are defined
    for (const g of guestsState) {
      for (const ev of g.events) {
        if (ev.attending === null) {
          setError(`Por favor marca si "${g.fullName}" asiste o no a "${ev.eventName}".`);
          return;
        }
      }
    }

    const payloadGuests: GuestRsvpDto[] = guestsState.map((g) => {
      const eventsDto: EventRsvpDto[] = g.events.map((ev) => ({
        eventId: ev.eventId,
        attending: !!ev.attending,
        menuOptionId: ev.attending ? (ev.menuOptionId || undefined) : undefined,
        specialNotes: ev.specialNotes.trim() || undefined,
      }));

      return {
        guestId: g.guestId,
        dietaryRequirements: g.dietaryRestrictions.trim() || undefined,
        events: eventsDto,
      };
    });

    const payload: RsvpSubmitRequest = {
      guests: payloadGuests,
    };

    try {
      setSaving(true);
      setError(null);
      await rsvpApi.submitAdmin(partyId, payload);
      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Error submitting manual RSVP:', err);
      setError(err?.message || 'Error al guardar la confirmación.');
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
            <div className={styles.modalIcon}>✍️</div>
            <div>
              <h2 className={styles.modalTitle}>Modificar Asistencia Manual</h2>
              <span className={styles.modalSubtitle}>
                {partyName} • Confirmación directa por organizador
              </span>
            </div>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {error && <div className={styles.errorAlert}>⚠️ {error}</div>}

          {loading ? (
            <div className={styles.loadingBox}>Cargando opciones y eventos del grupo...</div>
          ) : !rsvpInfo || guestsState.length === 0 ? (
            <div className={styles.loadingBox}>No se encontraron invitados para este grupo.</div>
          ) : (
            <form id="manualRsvpForm" onSubmit={handleSubmit} style={{ display: 'contents' }}>
              {guestsState.map((guest, gIdx) => (
                <div key={guest.guestId} className={styles.guestCard}>
                  <div className={styles.guestHeader}>
                    <div className={styles.guestName}>
                      👤 {guest.fullName}
                      {guest.isPlusOne && <span className={styles.plusOneBadge}>+1 Acompañante</span>}
                    </div>
                  </div>

                  {/* Events for this guest */}
                  <div className={styles.eventsSection}>
                    {guest.events.map((ev, evIdx) => {
                      const eventDef = rsvpInfo.allowedEvents.find((e) => e.id === ev.eventId);
                      const hasMenuOptions = eventDef && eventDef.menuOptions && eventDef.menuOptions.length > 0;

                      return (
                        <div
                          key={ev.eventId}
                          className={`${styles.eventRow} ${
                            ev.attending === true
                              ? styles.eventRowAttending
                              : ev.attending === false
                              ? styles.eventRowDeclined
                              : ''
                          }`}
                        >
                          <div className={styles.eventHeader}>
                            <div className={styles.eventName}>
                              🗓️ {ev.eventName}
                            </div>

                            <div className={styles.attendanceButtonGroup}>
                              <button
                                type="button"
                                className={`${styles.attendingButton} ${
                                  ev.attending === true ? styles.attendingButtonActive : ''
                                }`}
                                onClick={() => handleSetAttending(gIdx, evIdx, true)}
                              >
                                ✓ Asiste
                              </button>
                              <button
                                type="button"
                                className={`${styles.declinedButton} ${
                                  ev.attending === false ? styles.declinedButtonActive : ''
                                }`}
                                onClick={() => handleSetAttending(gIdx, evIdx, false)}
                              >
                                ✕ No Asiste
                              </button>
                            </div>
                          </div>

                          {/* Menu & Notes if Attending */}
                          {ev.attending === true && (
                            <div className={styles.eventFieldsGrid}>
                              {hasMenuOptions && (
                                <div className={styles.fieldGroup}>
                                  <label className={styles.fieldLabel}>Menú para este evento</label>
                                  <select
                                    className={styles.select}
                                    value={ev.menuOptionId}
                                    onChange={(e) => handleSetMenuOption(gIdx, evIdx, e.target.value)}
                                  >
                                    <option value="">Selecciona una opción...</option>
                                    {eventDef?.menuOptions.map((opt) => (
                                      <option key={opt.id} value={opt.id}>
                                        {opt.name} ({opt.dietType})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              <div className={styles.fieldGroup} style={{ gridColumn: hasMenuOptions ? 'span 1' : 'span 2' }}>
                                <label className={styles.fieldLabel}>Observaciones para este evento</label>
                                <input
                                  type="text"
                                  className={styles.input}
                                  value={ev.specialNotes}
                                  onChange={(e) => handleSetSpecialNotes(gIdx, evIdx, e.target.value)}
                                  placeholder="Ej. Llega en el segundo autobús, trona para bebé..."
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Dietary Restrictions */}
                  <div className={styles.dietRow}>
                    <label className={styles.fieldLabel}>Alergias o Restricciones Dietéticas</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={guest.dietaryRestrictions}
                      onChange={(e) => handleSetDiet(gIdx, e.target.value)}
                      placeholder="Ej. Celíaco, alérgico al marisco, vegetariano..."
                    />
                  </div>
                </div>
              ))}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="manualRsvpForm"
            className={styles.saveButton}
            disabled={saving || loading}
          >
            {saving ? 'Guardando...' : 'Guardar Asistencia'}
          </button>
        </div>
      </div>
    </div>
  );
};
