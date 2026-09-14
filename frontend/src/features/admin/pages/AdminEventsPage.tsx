import React, { useState, useEffect, useMemo } from 'react';
import type { EventResponse, MenuOptionResponse, DietType, EventAttendanceStatsDto } from '../../../types';
import { eventsApi } from '../../../lib/api/events';
import { weddingApi } from '../../../lib/api/wedding';
import { rsvpApi } from '../../../lib/api/rsvp';
import { EventModal } from '../components/EventModal/EventModal';
import { MenuOptionModal } from '../components/MenuOptionModal/MenuOptionModal';
import { ConfirmModal } from '../../../common/components';
import { usePageTitle } from '../../../common/hooks';
import styles from './AdminEventsPage.module.css';

export const AdminEventsPage: React.FC = () => {
  usePageTitle('Eventos & Menús | Panel de Administración');

  const [weddingId, setWeddingId] = useState<string>('');
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [eventMenus, setEventMenus] = useState<Record<string, MenuOptionResponse[]>>({});
  const [eventStatsMap, setEventStatsMap] = useState<Record<string, EventAttendanceStatsDto>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals State
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Menu Modal State
  const [selectedEventForMenu, setSelectedEventForMenu] = useState<{ id: string; name: string } | null>(null);
  const [selectedMenuOption, setSelectedMenuOption] = useState<MenuOptionResponse | null>(null);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

  // Confirmation Modals State
  const [eventToDelete, setEventToDelete] = useState<EventResponse | null>(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  const [menuToDelete, setMenuToDelete] = useState<{ eventId: string; menu: MenuOptionResponse } | null>(null);
  const [isDeletingMenu, setIsDeletingMenu] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Obtener Wedding ID
      let wId = weddingId;
      if (!wId) {
        try {
          const wedding = await weddingApi.getCurrentAdmin();
          wId = wedding.id;
          setWeddingId(wedding.id);
        } catch (wErr) {
          console.warn('No se pudo cargar wedding current:', wErr);
        }
      }

      // 2. Obtener Lista de Eventos
      const eventsList = await eventsApi.list();
      // Ordenar por displayOrder y por fecha de inicio
      eventsList.sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        return new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime();
      });
      setEvents(eventsList);

      if (!wId && eventsList.length > 0) {
        setWeddingId(eventsList[0].weddingId);
      }

      // 3. Cargar opciones de menú para cada evento
      const menusMap: Record<string, MenuOptionResponse[]> = {};
      await Promise.all(
        eventsList.map(async (ev) => {
          try {
            const options = await eventsApi.listMenuOptions(ev.id);
            options.sort((a, b) => a.displayOrder - b.displayOrder);
            menusMap[ev.id] = options;
          } catch (mErr) {
            console.error(`Error loading menus for event ${ev.id}:`, mErr);
            menusMap[ev.id] = [];
          }
        })
      );
      setEventMenus(menusMap);

      // 4. Cargar estadísticas de asistencia por evento
      try {
        const rsvpStats = await rsvpApi.getStatsAdmin();
        if (rsvpStats.eventStats) {
          const map: Record<string, EventAttendanceStatsDto> = {};
          for (const es of rsvpStats.eventStats) {
            map[es.eventId] = es;
          }
          setEventStatsMap(map);
        }
      } catch (stErr) {
        console.warn('No se pudieron cargar estadísticas de asistencia para eventos:', stErr);
      }
    } catch (err: any) {
      console.error('Error loading events:', err);
      setError(err?.message || 'Error al cargar los eventos del día.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Estadísticas rápidas
  const totalMenus = useMemo(() => {
    return Object.values(eventMenus).reduce((acc, curr) => acc + curr.length, 0);
  }, [eventMenus]);

  const firstEventTime = useMemo(() => {
    if (events.length === 0) return null;
    const date = new Date(events[0].startDatetime);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }, [events]);

  // Handlers para Eventos
  const handleOpenNewEvent = () => {
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (ev: EventResponse) => {
    setSelectedEvent(ev);
    setIsEventModalOpen(true);
  };

  const handleEventSaved = () => {
    setIsEventModalOpen(false);
    loadData();
  };

  const handleConfirmDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      setIsDeletingEvent(true);
      await eventsApi.delete(eventToDelete.id);
      setEventToDelete(null);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Error al eliminar el evento.');
    } finally {
      setIsDeletingEvent(false);
    }
  };

  // Handlers para Menús
  const handleOpenAddMenu = (eventId: string, eventName: string) => {
    setSelectedEventForMenu({ id: eventId, name: eventName });
    setSelectedMenuOption(null);
    setIsMenuModalOpen(true);
  };

  const handleOpenEditMenu = (eventId: string, eventName: string, menu: MenuOptionResponse) => {
    setSelectedEventForMenu({ id: eventId, name: eventName });
    setSelectedMenuOption(menu);
    setIsMenuModalOpen(true);
  };

  const handleMenuSaved = async () => {
    setIsMenuModalOpen(false);
    if (selectedEventForMenu?.id) {
      try {
        const options = await eventsApi.listMenuOptions(selectedEventForMenu.id);
        options.sort((a, b) => a.displayOrder - b.displayOrder);
        setEventMenus((prev) => ({ ...prev, [selectedEventForMenu.id]: options }));
      } catch (err) {
        console.error('Error reloading menus:', err);
      }
    }
  };

  const handleConfirmDeleteMenu = async () => {
    if (!menuToDelete) return;

    try {
      setIsDeletingMenu(true);
      await eventsApi.deleteMenuOption(menuToDelete.eventId, menuToDelete.menu.id);
      const options = await eventsApi.listMenuOptions(menuToDelete.eventId);
      options.sort((a, b) => a.displayOrder - b.displayOrder);
      setEventMenus((prev) => ({ ...prev, [menuToDelete.eventId]: options }));
      setMenuToDelete(null);
    } catch (err: any) {
      alert(err?.message || 'Error al eliminar la opción de menú.');
    } finally {
      setIsDeletingMenu(false);
    }
  };

  const formatEventDate = (startIso: string, endIso?: string) => {
    const start = new Date(startIso);
    const dateFormatted = start.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    const startTime = start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    if (endIso) {
      const end = new Date(endIso);
      const endTime = end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      return `${dateFormatted} · ${startTime} - ${endTime} h`;
    }

    return `${dateFormatted} · ${startTime} h`;
  };

  const renderEventTypeBadge = (type: string) => {
    switch (type) {
      case 'CEREMONY':
        return <span className={`${styles.eventTypeBadge} ${styles.badgeCeremony}`}>💍 Ceremonia</span>;
      case 'RECEPTION':
        return <span className={`${styles.eventTypeBadge} ${styles.badgeReception}`}>🍽️ Cóctel / Banquete</span>;
      case 'PARTY':
        return <span className={`${styles.eventTypeBadge} ${styles.badgeParty}`}>🎉 Fiesta / Baile</span>;
      case 'OTHER':
      default:
        return <span className={`${styles.eventTypeBadge} ${styles.badgeOther}`}>✨ Momento Especial</span>;
    }
  };

  const renderDietTag = (diet: DietType) => {
    switch (diet) {
      case 'STANDARD':
        return <span className={`${styles.dietTag} ${styles.dietStandard}`}>🥩 Estándar</span>;
      case 'VEGETARIAN':
        return <span className={`${styles.dietTag} ${styles.dietVegetarian}`}>🌱 Vegetariano</span>;
      case 'VEGAN':
        return <span className={`${styles.dietTag} ${styles.dietVegan}`}>🥗 Vegano</span>;
      case 'CHILD':
        return <span className={`${styles.dietTag} ${styles.dietChild}`}>🧒 Infantil</span>;
      case 'OTHER':
      default:
        return <span className={`${styles.dietTag} ${styles.dietOther}`}>✨ Especial</span>;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Eventos del Día & Menús</h1>
          <p className={styles.pageSubtitle}>
            Configura el cronograma del gran día (Ceremonia, Cóctel, Banquete, Fiesta) y las opciones gastronómicas para los invitados.
          </p>
        </div>

        <button type="button" className={styles.newEventButton} onClick={handleOpenNewEvent}>
          <span>➕</span> Nuevo Evento
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIconWrapper} ${styles.statIconEvents}`}>📅</div>
          <div>
            <div className={styles.statValue}>{events.length}</div>
            <div className={styles.statLabel}>Eventos Programados</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconWrapper} ${styles.statIconMenus}`}>🍽️</div>
          <div>
            <div className={styles.statValue}>{totalMenus}</div>
            <div className={styles.statLabel}>Platos / Opciones de Menú</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconWrapper} ${styles.statIconTime}`}>⏱️</div>
          <div>
            <div className={styles.statValue}>{firstEventTime || '--:--'}</div>
            <div className={styles.statLabel}>Hora de Inicio de la Jornada</div>
          </div>
        </div>
      </div>

      {/* Events Timeline List */}
      {loading ? (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>⏳</div>
          <h3 className={styles.emptyTitle}>Cargando cronograma de eventos...</h3>
        </div>
      ) : error ? (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>⚠️</div>
          <h3 className={styles.emptyTitle}>Error al cargar eventos</h3>
          <p className={styles.emptyText}>{error}</p>
          <button type="button" className={styles.newEventButton} onClick={loadData}>
            Reintentar
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>💍</div>
          <h3 className={styles.emptyTitle}>Aún no hay eventos registrados</h3>
          <p className={styles.emptyText}>
            Comienza añadiendo los momentos clave de tu boda (Ceremonia, Cóctel de bienvenida, Banquete, Fiesta).
          </p>
          <button type="button" className={styles.newEventButton} onClick={handleOpenNewEvent}>
            <span>➕</span> Crear Primer Evento
          </button>
        </div>
      ) : (
        <div className={styles.eventsTimeline}>
          {events.map((ev, index) => {
            const menus = eventMenus[ev.id] || [];

            return (
              <div key={ev.id} className={styles.eventCard}>
                {/* Event Header */}
                <div className={styles.eventHeader}>
                  <div className={styles.eventHeaderLeft}>
                    <div className={styles.eventOrderBadge}>
                      {ev.displayOrder !== undefined && ev.displayOrder > 0
                        ? ev.displayOrder
                        : index + 1}
                    </div>

                    <div>
                      <div className={styles.eventTitleRow}>
                        <h2 className={styles.eventName}>{ev.name}</h2>
                        {renderEventTypeBadge(ev.eventType)}
                        {ev.isPublic ? (
                          <span className={styles.publicTag}>🌐 Web Pública</span>
                        ) : (
                          <span className={styles.privateTag}>
                            🔒 Solo Admin
                          </span>
                        )}
                        {eventStatsMap[ev.id] && (
                          <span
                            className={styles.attendanceBadge}
                            title={`${eventStatsMap[ev.id].confirmedCount} confirmados de ${eventStatsMap[ev.id].totalInvitedCount} convocados`}
                          >
                            👥 <strong>{eventStatsMap[ev.id].confirmedCount}</strong> / {eventStatsMap[ev.id].totalInvitedCount} confirmados
                          </span>
                        )}
                      </div>

                      <div className={styles.eventMetaRow}>
                        <span className={styles.metaItem}>
                          <span>🕒</span> {formatEventDate(ev.startDatetime, ev.endDatetime)}
                        </span>
                        {ev.venueName && (
                          <span className={styles.metaItem}>
                            <span>📍</span> <strong>{ev.venueName}</strong>
                            {ev.address && ` (${ev.address})`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={styles.eventActions}>
                    <button
                      type="button"
                      className={styles.actionButtonOutline}
                      onClick={() => handleOpenAddMenu(ev.id, ev.name)}
                      title="Añadir plato o menú a este evento"
                    >
                      <span>🍽️</span> Añadir Plato
                    </button>

                    <button
                      type="button"
                      className={styles.actionButtonOutline}
                      onClick={() => handleOpenEditEvent(ev)}
                      title="Editar evento"
                    >
                      <span>✏️</span> Editar
                    </button>

                    <button
                      type="button"
                      className={styles.deleteIconButton}
                      onClick={() => setEventToDelete(ev)}
                      title="Eliminar evento"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Event Description (if any) */}
                {ev.description && (
                  <div className={styles.eventDescription}>
                    <p>{ev.description}</p>
                  </div>
                )}

                {/* Menus Section */}
                <div className={styles.menusSection}>
                  <div className={styles.menusHeader}>
                    <div className={styles.menusTitle}>
                      <span>🍽️</span> Opciones Gastronómicas / Menús ({menus.length})
                    </div>
                    {menus.length > 0 && (
                      <button
                        type="button"
                        className={styles.addMenuSmallButton}
                        onClick={() => handleOpenAddMenu(ev.id, ev.name)}
                      >
                        <span>➕</span> Añadir Opción
                      </button>
                    )}
                  </div>

                  {menus.length === 0 ? (
                    <div className={styles.emptyMenusNote}>
                      Este evento no requiere elección de menú o aún no tiene opciones asignadas.
                    </div>
                  ) : (
                    <div className={styles.menuGrid}>
                      {menus.map((m) => (
                        <div key={m.id} className={styles.menuCard}>
                          <div className={styles.menuTop}>
                            <div className={styles.menuName}>{m.name}</div>
                            {renderDietTag(m.dietType)}
                          </div>

                          {m.description && <p className={styles.menuDesc}>{m.description}</p>}

                          <div className={styles.menuActions}>
                            <button
                              type="button"
                              className={styles.menuSmallIconBtn}
                              title="Editar opción de menú"
                              onClick={() => handleOpenEditMenu(ev.id, ev.name, m)}
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className={`${styles.menuSmallIconBtn} ${styles.menuSmallIconBtnDanger}`}
                              title="Eliminar opción de menú"
                              onClick={() => setMenuToDelete({ eventId: ev.id, menu: m })}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Crear / Editar Evento */}
      {isEventModalOpen && (
        <EventModal
          weddingId={weddingId}
          event={selectedEvent}
          onClose={() => setIsEventModalOpen(false)}
          onSaved={handleEventSaved}
        />
      )}

      {/* Modal para Crear / Editar Opción de Menú */}
      {isMenuModalOpen && selectedEventForMenu && (
        <MenuOptionModal
          eventId={selectedEventForMenu.id}
          eventName={selectedEventForMenu.name}
          menuOption={selectedMenuOption}
          onClose={() => setIsMenuModalOpen(false)}
          onSaved={handleMenuSaved}
        />
      )}

      {/* ConfirmModal para Eliminar Evento */}
      <ConfirmModal
        isOpen={!!eventToDelete}
        title="¿Eliminar evento del cronograma?"
        message={`¿Estás seguro de eliminar el evento "${eventToDelete?.name}"? Esta acción también eliminará todas las opciones de menú y asignaciones asociadas a este evento.`}
        confirmText="Eliminar Evento"
        cancelText="Cancelar"
        variant="danger"
        loading={isDeletingEvent}
        onConfirm={handleConfirmDeleteEvent}
        onCancel={() => setEventToDelete(null)}
      />

      {/* ConfirmModal para Eliminar Plato/Menú */}
      <ConfirmModal
        isOpen={!!menuToDelete}
        title="¿Eliminar opción de menú?"
        message={`¿Estás seguro de eliminar el plato "${menuToDelete?.menu.name}"?`}
        confirmText="Eliminar Plato"
        cancelText="Cancelar"
        variant="danger"
        loading={isDeletingMenu}
        onConfirm={handleConfirmDeleteMenu}
        onCancel={() => setMenuToDelete(null)}
      />
    </div>
  );
};
