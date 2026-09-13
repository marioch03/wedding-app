import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rsvpApi } from '../../../lib/api';
import type { RsvpInfoResponse, GuestRsvpDto } from '../../../types';
import { RsvpTokenPrompt } from '../components/RsvpTokenPrompt/RsvpTokenPrompt';
import { RsvpGuestCard } from '../components/RsvpGuestCard/RsvpGuestCard';
import { RsvpSuccess } from '../components/RsvpSuccess/RsvpSuccess';
import { RsvpSkeleton } from '../components/RsvpSkeleton/RsvpSkeleton';
import { usePageTitle } from '../../../common/hooks';
import styles from './RsvpPage.module.css';

export const RsvpPage: React.FC = () => {
  const { token } = useParams<{ token?: string }>();

  const [rsvpInfo, setRsvpInfo] = useState<RsvpInfoResponse | null>(null);
  const [guestsState, setGuestsState] = useState<GuestRsvpDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(token));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pageTitle = rsvpInfo
    ? `Confirmar Asistencia - ${rsvpInfo.partyName} | Nuestra Boda`
    : 'Confirmación de Asistencia (RSVP) | Nuestra Boda';
  usePageTitle(pageTitle);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchRsvpData = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await rsvpApi.getByToken(token);
        setRsvpInfo(data);

        // Inicializar el estado de confirmación recordando opciones previas si existen (TC-RSVP-006)
        const initialFormState: GuestRsvpDto[] = data.guests.map((g) => ({
          guestId: g.id,
          firstName: g.firstName || '',
          lastName: g.lastName || '',
          dietaryRequirements: g.dietaryRestrictions || '',
          events: data.allowedEvents.map((ev) => {
            const existingAttendance = g.eventAttendances?.find(
              (ea) => ea.eventId === ev.id && ea.respondedAt != null
            );

            if (existingAttendance) {
              return {
                eventId: ev.id,
                attending: existingAttendance.attending ?? true,
                menuOptionId:
                  existingAttendance.menuOptionId ??
                  (ev.menuOptions && ev.menuOptions.length > 0 ? ev.menuOptions[0].id : null),
                specialNotes: existingAttendance.specialNotes || '',
              };
            }

            return {
              eventId: ev.id,
              attending: true, // Asistencia seleccionada por defecto si no ha respondido
              menuOptionId: ev.menuOptions && ev.menuOptions.length > 0 ? ev.menuOptions[0].id : null,
              specialNotes: '',
            };
          }),
        }));

        setGuestsState(initialFormState);
      } catch (err: any) {
        console.error('Error cargando información de RSVP:', err);
        setErrorMessage(
          err?.status === 404 || err?.message?.includes('No se encontró')
            ? 'El código de invitación no es válido o ha expirado.'
            : err instanceof Error
            ? err.message
            : 'El código de invitación no es válido o ha expirado.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRsvpData();
  }, [token]);

  // Si no hay token en la URL, mostrar directamente la pantalla de ingreso manual
  if (!token) {
    return <RsvpTokenPrompt />;
  }

  // Mientras se cargan los datos del token
  if (isLoading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageBackground} />
        <div className={styles.pageOverlay} />
        <RsvpSkeleton />
      </div>
    );
  }

  // Si el token falló al cargar o no se encontró, mostrar directamente el prompt de invitación
  // con el aviso de error para reintentar desde esa misma ventana sin redirigir a una página de error.
  if (errorMessage || !rsvpInfo) {
    return <RsvpTokenPrompt initialError={errorMessage} />;
  }

  // Si ya se ha enviado la confirmación
  if (isSubmitted) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.pageBackground} />
        <div className={styles.pageOverlay} />
        <header className={styles.headerNav}>
          <Link to="/" className={styles.backLink}>
            ← Volver a la Web Principal
          </Link>
        </header>
        <RsvpSuccess
          partyName={rsvpInfo.partyName}
          onEdit={() => setIsSubmitted(false)}
        />
      </div>
    );
  }

  const handleGuestUpdate = (index: number, updatedGuest: GuestRsvpDto) => {
    const updated = [...guestsState];
    updated[index] = updatedGuest;
    setGuestsState(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica: nombre para acompañantes
    for (let i = 0; i < rsvpInfo.guests.length; i++) {
      const g = rsvpInfo.guests[i];
      const gState = guestsState[i];
      if (g.isPlusOne && (!gState.firstName || !gState.firstName.trim())) {
        alert('Por favor indica el nombre de tu acompañante.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await rsvpApi.submit(token, {
        guests: guestsState,
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error al enviar RSVP:', err);
      alert(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al registrar tu confirmación. Por favor intenta de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (rsvpInfo.status) {
      case 'CONFIRMED':
        return <span className={`${styles.statusIndicator} ${styles.statusConfirmed}`}>✓ Confirmado</span>;
      case 'PARTIAL':
        return <span className={`${styles.statusIndicator} ${styles.statusPartial}`}>● Confirmación Parcial</span>;
      case 'DECLINED':
        return <span className={`${styles.statusIndicator} ${styles.statusDeclined}`}>✕ Asistencia Declinada</span>;
      default:
        return <span className={`${styles.statusIndicator} ${styles.statusPending}`}>⏳ Pendiente de Respuesta</span>;
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Fondo Inmersivo Fotográfico */}
      <div className={styles.pageBackground} />
      <div className={styles.pageOverlay} />

      <header className={styles.headerNav}>
        <Link to="/" className={styles.backLink}>
          ← Volver a la Web Principal
        </Link>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.partyHeader}>
          <span className={styles.partyTag}>Confirmación de Asistencia</span>
          <h1 className={styles.partyTitle}>{rsvpInfo.partyName}</h1>
          <p className={styles.partySubtitle}>
            Por favor confirma la asistencia de cada persona y selecciona tus preferencias de menú.
          </p>
          <div>{getStatusBadge()}</div>
        </div>

        <form onSubmit={handleSubmit}>
          {rsvpInfo.guests.map((guest, index) => (
            <RsvpGuestCard
              key={guest.id}
              guest={guest}
              allowedEvents={rsvpInfo.allowedEvents}
              guestState={guestsState[index]}
              onChange={(updated) => handleGuestUpdate(index, updated)}
            />
          ))}

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando confirmación...' : 'Enviar Confirmación (RSVP)'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
