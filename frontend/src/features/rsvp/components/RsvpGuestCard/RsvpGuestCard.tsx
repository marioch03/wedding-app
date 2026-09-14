import React from 'react';
import type { GuestDto, EventDto, GuestRsvpDto } from '../../../../types';
import styles from './RsvpGuestCard.module.css';

interface RsvpGuestCardProps {
  guest: GuestDto;
  allowedEvents: EventDto[];
  guestState: GuestRsvpDto;
  onChange: (updatedGuest: GuestRsvpDto) => void;
}

export const RsvpGuestCard: React.FC<RsvpGuestCardProps> = ({
  guest,
  allowedEvents,
  guestState,
  onChange,
}) => {
  const handleNameChange = (field: 'firstName' | 'lastName', value: string) => {
    onChange({
      ...guestState,
      [field]: value,
    });
  };

  const handleDietaryChange = (value: string) => {
    onChange({
      ...guestState,
      dietaryRequirements: value,
    });
  };

  const handleEventAttendance = (eventId: string, attending: boolean) => {
    const updatedEvents = guestState.events.map((ev) => {
      if (ev.eventId === eventId) {
        // Si hace clic en la opción que ya estaba activa, se desmarca a null (neutro)
        const nextAttending = ev.attending === attending ? null : attending;
        return {
          ...ev,
          attending: nextAttending,
          // Si pasa a asistir y no tenía menú, asigna la primera opción disponible
          menuOptionId:
            nextAttending === true
              ? ev.menuOptionId ??
                (allowedEvents.find((e) => e.id === eventId)?.menuOptions?.[0]?.id ?? null)
              : null,
        };
      }
      return ev;
    });

    onChange({
      ...guestState,
      events: updatedEvents,
    });
  };

  const handleMenuSelect = (eventId: string, menuOptionId: string) => {
    const updatedEvents = guestState.events.map((ev) => {
      if (ev.eventId === eventId) {
        return {
          ...ev,
          menuOptionId,
        };
      }
      return ev;
    });

    onChange({
      ...guestState,
      events: updatedEvents,
    });
  };

  const displayName = guest.isPlusOne
    ? guestState.firstName
      ? `${guestState.firstName} ${guestState.lastName || ''}`.trim()
      : 'Acompañante (+1)'
    : `${guest.firstName || ''} ${guest.lastName || ''}`.trim();

  const isAttendingAny = guestState.events.some((e) => e.attending === true);
  const hasLastName = Boolean(guestState.lastName && guestState.lastName.trim());
  const isNameRequired = isAttendingAny || hasLastName;

  return (
    <div className={styles.guestCard}>
      <div className={styles.guestHeader}>
        <h3 className={styles.guestName}>{displayName}</h3>
        {guest.isPlusOne && (
          <span className={styles.plusOneBadge}>Acompañante</span>
        )}
      </div>

      {/* Si es Acompañante (+1), permitir editar nombre y apellidos */}
      {guest.isPlusOne && (
        <div className={styles.plusOneInputs}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Nombre del Acompañante {isNameRequired && '*'}
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="Nombre"
              value={guestState.firstName || ''}
              onChange={(e) => handleNameChange('firstName', e.target.value)}
              required={isNameRequired}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Apellidos</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Apellidos"
              value={guestState.lastName || ''}
              onChange={(e) => handleNameChange('lastName', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Eventos y asistencia */}
      <div className={styles.eventsSection}>
        {allowedEvents.map((event) => {
          const eventRsvp = guestState.events.find((e) => e.eventId === event.id);
          const isAttendingYes = eventRsvp?.attending === true;
          const isAttendingNo = eventRsvp?.attending === false;
          const hasMenuOptions = event.menuOptions && event.menuOptions.length > 0;

          return (
            <div key={event.id} className={styles.eventBlock}>
              <div className={styles.eventHeader}>
                <span className={styles.eventName}>{event.name}</span>
                <div className={styles.attendanceToggle}>
                  <button
                    type="button"
                    className={`${styles.toggleButton} ${isAttendingYes ? styles.toggleActiveYes : ''}`}
                    onClick={() => handleEventAttendance(event.id, true)}
                  >
                    ✓ Asistiré
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleButton} ${isAttendingNo ? styles.toggleActiveNo : ''}`}
                    onClick={() => handleEventAttendance(event.id, false)}
                  >
                    ✕ No podré asistir
                  </button>
                </div>
              </div>

              {/* Si asiste y el evento tiene opciones de menú */}
              {isAttendingYes && hasMenuOptions && (
                <div className={styles.menuSection}>
                  <label className={styles.label}>Selección de Menú para {event.name}:</label>
                  <div className={styles.menuGrid}>
                    {event.menuOptions.map((menu) => {
                      const isSelected = eventRsvp?.menuOptionId === menu.id;
                      return (
                        <div
                          key={menu.id}
                          className={`${styles.menuOptionCard} ${isSelected ? styles.menuOptionSelected : ''}`}
                          onClick={() => handleMenuSelect(event.id, menu.id)}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                        >
                          <div className={styles.menuOptionHeader}>
                            <span className={styles.menuOptionName}>{menu.name}</span>
                            <span className={styles.dietBadge}>{menu.dietType}</span>
                          </div>
                          {menu.description && (
                            <p className={styles.menuOptionDescription}>{menu.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Restricciones alimentarias y alergias */}
      <div className={styles.dietarySection}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Alergias, Intolerancias o Restricciones Alimentarias:</label>
          <textarea
            className={styles.textarea}
            placeholder="Ej: Celíaco, alérgico a los frutos secos, vegetariano, etc."
            value={guestState.dietaryRequirements || ''}
            onChange={(e) => handleDietaryChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
