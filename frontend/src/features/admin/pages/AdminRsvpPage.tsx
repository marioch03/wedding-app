import React, { useState, useEffect, useMemo } from 'react';
import type {
  RsvpStatsResponse,
  GuestResponse,
  GuestDetailResponse,
  PartyResponse,
  EventResponse,
  CateringReportResponse,
} from '../../../types';
import { rsvpApi, partiesApi, guestsApi, eventsApi, menusApi } from '../../../lib/api';
import { exportCateringToExcel, exportCateringToCsv } from '../../../lib/export/cateringExport';
import { exportRsvpGuestsToExcel, exportRsvpGuestsToCsv } from '../../../lib/export/rsvpExport';
import { ManualRsvpModal } from '../components/ManualRsvpModal/ManualRsvpModal';
import { usePageTitle } from '../../../common/hooks';
import styles from './AdminRsvpPage.module.css';

export const AdminRsvpPage: React.FC = () => {
  usePageTitle('Seguimiento RSVP & Catering | Panel de Administración');

  const [activeTab, setActiveTab] = useState<'attendance' | 'catering'>('attendance');

  // General Loading & Error State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState<RsvpStatsResponse | null>(null);

  // Parties & Guests Data
  const [parties, setParties] = useState<PartyResponse[]>([]);
  const [guestDetails, setGuestDetails] = useState<GuestDetailResponse[]>([]);
  const [events, setEvents] = useState<EventResponse[]>([]);

  // Catering Report Data
  const [selectedEventId, setSelectedEventId] = useState<string>('ALL');
  const [cateringReport, setCateringReport] = useState<CateringReportResponse | null>(null);
  const [loadingCatering, setLoadingCatering] = useState(false);

  // Filters for Attendance Table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'DECLINED' | 'PARTIAL'>('ALL');
  const [dietOnly, setDietOnly] = useState(false);

  // Manual RSVP Modal
  const [partyToEdit, setPartyToEdit] = useState<{
    id: string;
    name: string;
    guestId?: string;
    guestName?: string;
  } | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    loadCateringReport();
  }, [selectedEventId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, partiesData, eventsData, guestsPage] = await Promise.all([
        rsvpApi.getStatsAdmin(),
        partiesApi.list({ size: 100, sort: 'displayName,asc' }),
        eventsApi.list(),
        guestsApi.list({ size: 200 }),
      ]);

      setStats(statsData);
      setParties(partiesData.content || []);
      setEvents(eventsData || []);

      // Load full attendance details for each guest
      const fullGuestDetails: GuestDetailResponse[] = await Promise.all(
        (guestsPage.content || []).map((g: GuestResponse) =>
          guestsApi.getById(g.id).catch(() => ({
            id: g.id,
            partyId: g.partyId,
            partyDisplayName: '',
            firstName: g.firstName,
            lastName: g.lastName,
            guestType: g.guestType,
            isPlusOne: g.isPlusOne,
            email: g.email,
            phone: g.phone,
            dietaryRestrictions: g.dietaryRestrictions,
            eventAttendances: [],
            createdAt: g.createdAt,
            updatedAt: g.updatedAt,
          }))
        )
      );

      setGuestDetails(fullGuestDetails);
    } catch (err: any) {
      console.error('Error loading RSVP data:', err);
      setError(err?.message || 'Error al cargar los datos de RSVP.');
    } finally {
      setLoading(false);
    }
  };

  const loadCateringReport = async () => {
    try {
      setLoadingCatering(true);
      const evId = selectedEventId === 'ALL' ? undefined : selectedEventId;
      const report = await menusApi.getCateringReport(evId);
      setCateringReport(report);
    } catch (err: any) {
      console.error('Error loading catering report:', err);
    } finally {
      setLoadingCatering(false);
    }
  };

  // Helper para determinar el estado de asistencia individual de un invitado
  const getGuestAttendanceStatus = (
    guest: GuestDetailResponse,
    partyStatus: string
  ): 'CONFIRMED' | 'DECLINED' | 'PENDING' => {
    if (partyStatus === 'PENDING') return 'PENDING';
    if (partyStatus === 'CONFIRMED') return 'CONFIRMED';
    if (partyStatus === 'DECLINED') return 'DECLINED';

    // Grupo con estado PARTIAL: evaluar respuestas a eventos del invitado
    const attendances = guest.eventAttendances || [];
    const isAttendingAny = attendances.some((ea) => ea.attending === true);
    if (isAttendingAny) return 'CONFIRMED';

    const hasResponded = attendances.some(
      (ea) => ea.attending !== undefined && ea.attending !== null
    );
    if (hasResponded) return 'DECLINED';

    return 'PENDING';
  };

  // Filtered Guests list
  const filteredGuests = useMemo(() => {
    return guestDetails.filter((g) => {
      // Find parent party status
      const parentParty = parties.find((p) => p.id === g.partyId);
      const partyStatus = parentParty?.status || 'PENDING';
      const computedStatus = getGuestAttendanceStatus(g, partyStatus);

      // Status filter
      if (statusFilter !== 'ALL' && computedStatus !== statusFilter) {
        return false;
      }

      // Diet only filter
      if (dietOnly && !g.dietaryRestrictions) {
        return false;
      }

      // Search filter
      const fullName = `${g.firstName || ''} ${g.lastName || ''}`.toLowerCase();
      const partyName = (g.partyDisplayName || parentParty?.displayName || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      if (term && !fullName.includes(term) && !partyName.includes(term)) {
        return false;
      }

      return true;
    });
  }, [guestDetails, parties, statusFilter, dietOnly, searchTerm]);

  // Only events that have menu options configured are relevant for catering & menus
  const eventsWithMenu = useMemo(() => {
    return events.filter((ev) => ev.menuOptions && ev.menuOptions.length > 0);
  }, [events]);

  // Handle Catering Exports (Excel .xlsx & CSV)
  const handleExportCateringExcel = () => {
    if (!cateringReport) return;
    const currentEvent = eventsWithMenu.find((ev) => ev.id === selectedEventId);
    const eventName = selectedEventId === 'ALL' ? 'Todos los eventos con menú' : currentEvent?.name || 'Evento';
    exportCateringToExcel(cateringReport, eventName);
  };

  const handleExportCateringCsv = () => {
    if (!cateringReport) return;
    const currentEvent = eventsWithMenu.find((ev) => ev.id === selectedEventId);
    const eventName = selectedEventId === 'ALL' ? 'Todos los eventos con menú' : currentEvent?.name || 'Evento';
    exportCateringToCsv(cateringReport, eventName);
  };

  // Handle Guests Attendance Exports (Excel .xlsx & CSV)
  const handleExportGuestsExcel = () => {
    if (filteredGuests.length === 0) return;
    const filterTitle = statusFilter !== 'ALL' ? statusFilter : dietOnly ? 'Dietas_Especiales' : 'General';
    exportRsvpGuestsToExcel(filteredGuests, parties, filterTitle);
  };

  const handleExportGuestsCsv = () => {
    if (filteredGuests.length === 0) return;
    const filterTitle = statusFilter !== 'ALL' ? statusFilter : dietOnly ? 'Dietas_Especiales' : 'General';
    exportRsvpGuestsToCsv(filteredGuests, parties, filterTitle);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>
            <span>✓</span> Control RSVP & Catering
          </h1>
          <p className={styles.subtitle}>
            Seguimiento de confirmaciones en tiempo real y reporte consolidado de menús y alérgenos
          </p>
        </div>
      </div>

      {error && <div className={styles.emptyBox} style={{ color: 'var(--color-error)' }}>⚠️ {error}</div>}

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.kpiIconConfirmed}`}>✓</div>
          <div className={styles.kpiData}>
            <span className={styles.kpiLabel}>Invitados Confirmados</span>
            <span className={styles.kpiValue}>{stats?.confirmedGuests ?? 0}</span>
            <span className={styles.kpiSubtext}>
              {stats?.confirmedParties ?? 0} grupos confirmados
            </span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.kpiIconPending}`}>⏳</div>
          <div className={styles.kpiData}>
            <span className={styles.kpiLabel}>Invitados Pendientes</span>
            <span className={styles.kpiValue}>{stats?.pendingGuests ?? 0}</span>
            <span className={styles.kpiSubtext}>
              {stats?.pendingParties ?? 0} grupos por responder
            </span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.kpiIconDeclined}`}>✕</div>
          <div className={styles.kpiData}>
            <span className={styles.kpiLabel}>Invitados Declinados</span>
            <span className={styles.kpiValue}>{stats?.declinedGuests ?? 0}</span>
            <span className={styles.kpiSubtext}>
              {stats?.declinedParties ?? 0} grupos declinaron
            </span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.kpiIconRate}`}>📊</div>
          <div className={styles.kpiData}>
            <span className={styles.kpiLabel}>Tasa de Respuesta</span>
            <span className={styles.kpiValue}>{stats?.responseRatePercentage ?? 0}%</span>
            <span className={styles.kpiSubtext}>
              {stats?.totalParties
                ? `${stats.totalParties - (stats.pendingParties ?? 0)} de ${stats.totalParties} grupos${
                    stats.partialParties > 0 ? ` (${stats.partialParties} parciales)` : ''
                  }`
                : '0 respuestas'}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'attendance' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <span>📋</span> Control de Asistencia por Invitado
          <span className={styles.tabCountBadge}>{guestDetails.length}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'catering' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('catering')}
        >
          <span>🍽️</span> Reporte para Catering & Alérgenos
          {cateringReport && cateringReport.attendeesWithDietaryAlertsCount > 0 && (
            <span className={styles.tabAlertBadge}>
              ⚠️ {cateringReport.attendeesWithDietaryAlertsCount} Alertas
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ASISTENCIA DETALLADA */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <>
          {/* Filter Bar */}
          <div className={styles.filterBar}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Buscar por nombre de invitado o familia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className={styles.filterControls}>
              <div className={styles.statusPills}>
                <button
                  type="button"
                  className={`${styles.statusPill} ${statusFilter === 'ALL' ? styles.statusPillActive : ''}`}
                  onClick={() => setStatusFilter('ALL')}
                >
                  Todos
                </button>
                <button
                  type="button"
                  className={`${styles.statusPill} ${statusFilter === 'CONFIRMED' ? styles.statusPillActive : ''}`}
                  onClick={() => setStatusFilter('CONFIRMED')}
                >
                  Confirmados
                </button>
                <button
                  type="button"
                  className={`${styles.statusPill} ${statusFilter === 'PENDING' ? styles.statusPillActive : ''}`}
                  onClick={() => setStatusFilter('PENDING')}
                >
                  Pendientes
                </button>
                <button
                  type="button"
                  className={`${styles.statusPill} ${statusFilter === 'DECLINED' ? styles.statusPillActive : ''}`}
                  onClick={() => setStatusFilter('DECLINED')}
                >
                  Declinados
                </button>
              </div>

              <label
                className={`${styles.dietOnlyToggle} ${dietOnly ? styles.dietOnlyToggleActive : ''}`}
              >
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={dietOnly}
                  onChange={(e) => setDietOnly(e.target.checked)}
                />
                <span>🥗 Solo con Alergias/Dietas</span>
              </label>

              <div className={styles.attendanceExportButtons}>
                <button
                  type="button"
                  className={styles.exportSmallBtn}
                  onClick={handleExportGuestsExcel}
                  disabled={filteredGuests.length === 0}
                  title="Descargar listado de invitados en Excel (.xlsx)"
                >
                  <span>📗</span> Excel
                </button>
                <button
                  type="button"
                  className={styles.exportSmallBtn}
                  onClick={handleExportGuestsCsv}
                  disabled={filteredGuests.length === 0}
                  title="Descargar listado de invitados en CSV"
                >
                  <span>📄</span> CSV
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className={styles.tableCard}>
            {loading ? (
              <div className={styles.emptyBox}>Cargando lista de invitados y asistencias...</div>
            ) : filteredGuests.length === 0 ? (
              <div className={styles.emptyBox}>
                No se encontraron invitados con los filtros seleccionados.
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Invitado</th>
                    <th className={styles.th}>Grupo / Familia</th>
                    <th className={styles.th}>Eventos & Asistencia</th>
                    <th className={styles.th}>Alergias / Dieta</th>
                    <th className={styles.th} style={{ textAlign: 'right' }}>
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map((guest) => {
                    const parentParty = parties.find((p) => p.id === guest.partyId);
                    const partyName = guest.partyDisplayName || parentParty?.displayName || 'Grupo';

                    return (
                      <tr key={guest.id} className={styles.tr}>
                        <td className={styles.td}>
                          <div className={styles.guestCell}>
                            <div className={styles.guestAvatar}>
                              {guest.isPlusOne ? '➕' : guest.guestType === 'CHILD' ? '🧒' : '👤'}
                            </div>
                            <div className={styles.guestInfo}>
                              <span className={styles.guestName}>
                                {guest.firstName || guest.lastName
                                  ? `${guest.firstName || ''} ${guest.lastName || ''}`.trim()
                                  : 'Invitado sin nombre'}
                                {guest.isPlusOne && (
                                  <span className={styles.plusOneTag}>+1 Acompañante</span>
                                )}
                              </span>
                              {guest.phone && <span className={styles.kpiSubtext}>📞 {guest.phone}</span>}
                            </div>
                          </div>
                        </td>

                        <td className={styles.td}>
                          <span className={styles.partyName}>{partyName}</span>
                        </td>

                        <td className={styles.td}>
                          {guest.eventAttendances && guest.eventAttendances.length > 0 ? (
                            <div className={styles.eventsBadgeList}>
                              {guest.eventAttendances.map((ea) => (
                                <div
                                  key={ea.eventId}
                                  className={`${styles.eventBadgeItem} ${
                                    ea.attending === true
                                      ? styles.badgeAttending
                                      : ea.attending === false
                                      ? styles.badgeDeclined
                                      : styles.badgePending
                                  }`}
                                >
                                  <span>{ea.eventName}:</span>
                                  <strong>
                                    {ea.attending === true
                                      ? ea.menuOptionName
                                        ? `✓ Asiste (${ea.menuOptionName})`
                                        : '✓ Asiste'
                                      : ea.attending === false
                                      ? '✕ No Asiste'
                                      : '⏳ Pendiente'}
                                  </strong>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className={`${styles.eventBadgeItem} ${styles.badgePending}`}>
                              ⏳ Pendiente de respuesta
                            </span>
                          )}
                        </td>

                        <td className={styles.td}>
                          {guest.dietaryRestrictions ? (
                            <span className={styles.dietTag}>
                              ⚠️ {guest.dietaryRestrictions}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                              Estándar
                            </span>
                          )}
                        </td>

                        <td className={styles.td} style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className={styles.modifyButton}
                            onClick={() =>
                              setPartyToEdit({
                                id: guest.partyId,
                                name: partyName,
                                guestId: guest.id,
                                guestName: `${guest.firstName || ''} ${guest.lastName || ''}`.trim(),
                              })
                            }
                            title="Modificar asistencia manualmente"
                          >
                            <span>✍️</span> Modificar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REPORTE DE CATERING & MENÚS */}
      {/* ========================================================================= */}
      {activeTab === 'catering' && (
        <div className={styles.cateringSection}>
          {/* Catering Toolbar */}
          <div className={styles.cateringToolbar}>
            <div className={styles.eventSelectWrapper}>
              <label className={styles.eventSelectLabel}>Filtrar por Evento:</label>
              <select
                className={styles.eventSelect}
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                <option value="ALL">
                  🌟 {eventsWithMenu.length > 1 ? 'Todos los eventos con menú' : 'Todos los eventos'}
                </option>
                {eventsWithMenu.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.menuOptions?.length} opciones de menú)
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.exportButtons}>
              <button
                type="button"
                className={styles.exportExcelBtn}
                onClick={handleExportCateringExcel}
                disabled={!cateringReport || loadingCatering}
                title="Descargar libro Excel (.xlsx) con resumen ejecutivo, lista nominal y alertas de cocina"
              >
                <span>📗</span> Exportar Excel (.xlsx)
              </button>
              <button
                type="button"
                className={styles.exportCsvBtn}
                onClick={handleExportCateringCsv}
                disabled={!cateringReport || loadingCatering}
                title="Descargar archivo CSV compatible con Excel (UTF-8)"
              >
                <span>📄</span> Exportar CSV
              </button>
              <button
                type="button"
                className={styles.printBtn}
                onClick={handlePrint}
                title="Imprimir reporte o guardar como PDF"
              >
                <span>🖨️</span> Imprimir / PDF
              </button>
            </div>
          </div>

          {loadingCatering ? (
            <div className={styles.emptyBox}>Generando informe de catering...</div>
          ) : !cateringReport ? (
            <div className={styles.emptyBox}>No hay datos de menú para este evento.</div>
          ) : (
            <>
              {/* Menu Counts Breakdown */}
              <div>
                <h3 className={styles.title} style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>
                  🍽️ Recuento de Menús Confirmados ({cateringReport.totalConfirmedAttendees} comensales)
                </h3>

                {cateringReport.menuCounts.length === 0 ? (
                  <div className={styles.emptyBox}>Aún no hay selecciones de menú registradas.</div>
                ) : (
                  <div className={styles.menuCountsGrid}>
                    {cateringReport.menuCounts.map((mc) => {
                      const percentage =
                        cateringReport.totalConfirmedAttendees > 0
                          ? Math.round((mc.count / cateringReport.totalConfirmedAttendees) * 100)
                          : 0;

                      return (
                        <div key={mc.menuOptionId || mc.menuOptionName} className={styles.menuCountCard}>
                          <div className={styles.menuCountHeader}>
                            <span className={styles.menuOptionName}>{mc.menuOptionName}</span>
                            <span className={`${styles.dietBadge} ${styles[`diet${mc.dietType}`] || ''}`}>
                              {mc.dietType}
                            </span>
                          </div>

                          <div className={styles.menuCountNumber}>{mc.count}</div>

                          <div className={styles.menuCountSubtext}>
                            {percentage}% del total de comensales
                          </div>

                          <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Special Dietary Alerts for Chef / Kitchen */}
              <div className={styles.alertsCard}>
                <div className={styles.alertsHeader}>
                  <h3 className={styles.alertsTitle}>
                    <span>⚠️</span> Registro de Alergias, Intolerancias y Notas para Cocina
                  </h3>
                  <span className={styles.alertsCountPill}>
                    {cateringReport.attendeesWithDietaryAlerts.length} comensales con requerimientos
                  </span>
                </div>

                {cateringReport.attendeesWithDietaryAlerts.length === 0 ? (
                  <div className={styles.emptyBox} style={{ color: 'var(--color-success)' }}>
                    ✓ Ningún invitado ha indicado alergias ni notas especiales para este evento.
                  </div>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th}>Comensal</th>
                        <th className={styles.th}>Grupo / Familia</th>
                        <th className={styles.th}>Evento</th>
                        <th className={styles.th}>Menú</th>
                        <th className={styles.th}>Alergias / Intolerancias</th>
                        <th className={styles.th}>Observaciones / Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cateringReport.attendeesWithDietaryAlerts.map((att) => (
                        <tr key={`${att.guestId}-${att.eventId}`} className={styles.tr}>
                          <td className={styles.td}>
                            <strong>{att.guestName}</strong>
                          </td>
                          <td className={styles.td}>{att.partyDisplayName}</td>
                          <td className={styles.td}>{att.eventName}</td>
                          <td className={styles.td}>
                            <span className={styles.menuOptionName} style={{ fontSize: '0.9rem' }}>
                              {att.menuOptionName}
                            </span>
                          </td>
                          <td className={styles.td}>
                            {att.dietaryRestrictions ? (
                              <span className={styles.dietTag}>
                                ⚠️ {att.dietaryRestrictions}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className={styles.td}>
                            {att.specialNotes ? (
                              <em style={{ color: 'var(--color-text-body)' }}>{att.specialNotes}</em>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Manual RSVP Modal */}
      {partyToEdit && (
        <ManualRsvpModal
          partyId={partyToEdit.id}
          partyName={partyToEdit.name}
          targetGuestId={partyToEdit.guestId}
          targetGuestName={partyToEdit.guestName}
          onClose={() => setPartyToEdit(null)}
          onSaved={() => {
            loadAllData();
            loadCateringReport();
          }}
        />
      )}
    </div>
  );
};
