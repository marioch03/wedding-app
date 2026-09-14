import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { rsvpApi, weddingApi } from '../../../lib/api';
import type { RsvpStatsResponse, WeddingPublicResponse } from '../../../types';
import { usePageTitle } from '../../../common/hooks';
import styles from './AdminDashboardPage.module.css';

export const AdminDashboardPage: React.FC = () => {
  usePageTitle('Panel de Control | Administración de Boda');

  const { user } = useUser();
  const [stats, setStats] = useState<RsvpStatsResponse | null>(null);
  const [wedding, setWedding] = useState<WeddingPublicResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, weddingData] = await Promise.all([
        rsvpApi.getStatsAdmin(),
        weddingApi.getPublic().catch(() => null),
      ]);
      setStats(statsData);
      setWedding(weddingData);
    } catch (err: any) {
      console.error('Error cargando datos del Dashboard:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo conectar con el servidor. Comprueba la conexión o que el backend esté levantado.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const adminName = user?.firstName || user?.fullName || 'Administrador';

  // Cálculos de porcentajes para la barra de progreso
  const totalGuests = stats?.totalGuests || 0;
  const confirmedGuests = stats?.confirmedGuests || 0;
  const pendingGuests = stats?.pendingGuests || 0;
  const declinedGuests = stats?.declinedGuests || 0;

  const confirmedPct = totalGuests > 0 ? (confirmedGuests / totalGuests) * 100 : 0;
  const pendingPct = totalGuests > 0 ? (pendingGuests / totalGuests) * 100 : 0;
  const declinedPct = totalGuests > 0 ? (declinedGuests / totalGuests) * 100 : 0;

  const formattedWeddingDate = wedding?.weddingDate
    ? new Date(`${wedding.weddingDate}T00:00:00`).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className={styles.container}>
      {/* Banner de Saludo y Resumen del Evento */}
      <div className={styles.welcomeBanner}>
        <div>
          <h1 className={styles.title}>¡Hola, {adminName}! 👋</h1>
          <p className={styles.bannerSubtitle}>
            Panel general de seguimiento de confirmaciones y organización de tu boda.
          </p>
        </div>

        {wedding && (
          <div className={styles.weddingBadge}>
            <span className={styles.weddingBadgeIcon}>💍</span>
            <div>
              <div className={styles.weddingBadgeNames}>
                {wedding.partner1Name} & {wedding.partner2Name}
              </div>
              <div className={styles.weddingBadgeDate}>{formattedWeddingDate}</div>
            </div>
          </div>
        )}
      </div>

      {/* Alerta de Error / Resiliencia si el servidor falla */}
      {error && (
        <div className={styles.errorAlert} role="alert">
          <div className={styles.errorAlertContent}>
            <span className={styles.errorAlertIcon}>⚠️</span>
            <div>
              <h3 className={styles.errorAlertTitle}>Error de conexión con el servidor</h3>
              <p className={styles.errorAlertMessage}>{error}</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.retryButton}
            onClick={fetchData}
            disabled={isLoading}
          >
            <span>🔄</span> Reintentar
          </button>
        </div>
      )}

      {/* KPI Cards Strip (4 Métricas Compactas y Vivas) */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Confirmados</span>
            <div className={`${styles.kpiIconWrapper} ${styles.iconConfirmed}`}>✓</div>
          </div>
          <div className={styles.kpiValue}>
            {isLoading ? '...' : error && !stats ? '--' : confirmedGuests}
          </div>
          <div className={styles.kpiFoot}>
            <span>
              {error && !stats
                ? 'Información no disponible'
                : `${stats?.confirmedParties || 0} grupos confirmados${
                    stats?.partialParties ? ` (${stats.partialParties} parciales)` : ''
                  }`}
            </span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Pendientes</span>
            <div className={`${styles.kpiIconWrapper} ${styles.iconPending}`}>⏳</div>
          </div>
          <div className={styles.kpiValue}>
            {isLoading ? '...' : error && !stats ? '--' : pendingGuests}
          </div>
          <div className={styles.kpiFoot}>
            <span>
              {error && !stats
                ? 'Información no disponible'
                : `${stats?.pendingParties || 0} grupos por responder`}
            </span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Declinados</span>
            <div className={`${styles.kpiIconWrapper} ${styles.iconDeclined}`}>✕</div>
          </div>
          <div className={styles.kpiValue}>
            {isLoading ? '...' : error && !stats ? '--' : declinedGuests}
          </div>
          <div className={styles.kpiFoot}>
            <span>
              {error && !stats
                ? 'Información no disponible'
                : `${stats?.declinedParties || 0} grupos no asisten`}
            </span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Respuesta</span>
            <div className={`${styles.kpiIconWrapper} ${styles.iconRate}`}>%</div>
          </div>
          <div className={styles.kpiValue}>
            {isLoading
              ? '...'
              : error && !stats
              ? '--%'
              : `${stats?.responseRatePercentage.toFixed(0) || 0}%`}
          </div>
          <div className={styles.kpiFoot}>
            <span>
              {error && !stats
                ? 'Información no disponible'
                : `${totalGuests} invitados totales en lista`}
            </span>
          </div>
        </div>
      </div>

      {/* Panel Dividido 2 Columnas */}
      <div className={styles.contentSplit}>
        {/* Columna Izquierda: Balance y Progreso Visual de Asistencia */}
        <div className={styles.breakdownCard}>
          <h2 className={styles.cardTitle}>
            <span>Balance de Invitados</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
              {confirmedPct.toFixed(0)}% Asistencia
            </span>
          </h2>

          {/* Barra de Progreso Multisegmento */}
          <div className={styles.multiProgressBar}>
            <div
              className={styles.progressSegmentConfirmed}
              style={{ width: `${confirmedPct}%` }}
              title={`Confirmados: ${confirmedPct.toFixed(1)}%`}
            />
            <div
              className={styles.progressSegmentPending}
              style={{ width: `${pendingPct}%` }}
              title={`Pendientes: ${pendingPct.toFixed(1)}%`}
            />
            <div
              className={styles.progressSegmentDeclined}
              style={{ width: `${declinedPct}%` }}
              title={`Declinados: ${declinedPct.toFixed(1)}%`}
            />
          </div>

          {/* Lista de Leyendas con Desglose */}
          <div className={styles.legendList}>
            <div className={styles.legendItem}>
              <div className={styles.legendLeft}>
                <div className={`${styles.legendDot} ${styles.dotConfirmed}`} />
                <span className={styles.legendName}>Confirmados</span>
              </div>
              <span className={styles.legendCount}>
                {confirmedGuests} ({confirmedPct.toFixed(1)}%)
              </span>
            </div>

            <div className={styles.legendItem}>
              <div className={styles.legendLeft}>
                <div className={`${styles.legendDot} ${styles.dotPending}`} />
                <span className={styles.legendName}>Pendientes</span>
              </div>
              <span className={styles.legendCount}>
                {pendingGuests} ({pendingPct.toFixed(1)}%)
              </span>
            </div>

            <div className={styles.legendItem}>
              <div className={styles.legendLeft}>
                <div className={`${styles.legendDot} ${styles.dotDeclined}`} />
                <span className={styles.legendName}>Declinados</span>
              </div>
              <span className={styles.legendCount}>
                {declinedGuests} ({declinedPct.toFixed(1)}%)
              </span>
            </div>
          </div>

          <Link to="/admin/rsvp" className={styles.actionButton}>
            <span>📊</span> Ver Control Detallado de RSVP & Dietas
          </Link>
        </div>

        {/* Columna Derecha: Módulos de Gestión Rápida Comprimidos */}
        <div className={styles.quickActionsCard}>
          <h2 className={styles.cardTitle}>Gestión del Evento</h2>

          <div className={styles.actionList}>
            <Link to="/admin/parties" className={styles.actionRow}>
              <div className={styles.actionRowIcon}>💌</div>
              <div className={styles.actionRowContent}>
                <div className={styles.actionRowTitle}>Invitados & Grupos</div>
                <div className={styles.actionRowDesc}>
                  Crear grupos, gestionar acompañantes (+1) y copiar enlaces mágicos.
                </div>
              </div>
              <span className={styles.actionRowArrow}>→</span>
            </Link>

            <Link to="/admin/events" className={styles.actionRow}>
              <div className={styles.actionRowIcon}>📅</div>
              <div className={styles.actionRowContent}>
                <div className={styles.actionRowTitle}>Eventos & Menús</div>
                <div className={styles.actionRowDesc}>
                  Configurar horarios (Ceremonia, Banquete) y opciones de platos.
                </div>
              </div>
              <span className={styles.actionRowArrow}>→</span>
            </Link>

            <Link to="/admin/wedding" className={styles.actionRow}>
              <div className={styles.actionRowIcon}>💍</div>
              <div className={styles.actionRowContent}>
                <div className={styles.actionRowTitle}>Contenido de la Web</div>
                <div className={styles.actionRowDesc}>
                  Editar historia, foto de portada, fecha y datos visibles para invitados.
                </div>
              </div>
              <span className={styles.actionRowArrow}>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sección: Asistencia Detallada por Evento */}
      {stats?.eventStats && stats.eventStats.length > 0 && (
        <div className={styles.eventStatsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                <span>📅 Asistencia por Evento</span>
              </h2>
              <p className={styles.sectionSubtitle}>
                Desglose de invitados confirmados, pendientes y bajas para cada momento del enlace.
              </p>
            </div>
            <Link to="/admin/events" className={styles.sectionLink}>
              Configurar Eventos →
            </Link>
          </div>

          <div className={styles.eventStatsGrid}>
            {stats.eventStats.map((ev) => {
              const evConfirmedPct = ev.totalInvitedCount > 0
                ? (ev.confirmedCount / ev.totalInvitedCount) * 100
                : 0;
              const evPendingPct = ev.totalInvitedCount > 0
                ? (ev.pendingCount / ev.totalInvitedCount) * 100
                : 0;
              const evDeclinedPct = ev.totalInvitedCount > 0
                ? (ev.declinedCount / ev.totalInvitedCount) * 100
                : 0;

              const getEventIcon = (type: string) => {
                switch (type) {
                  case 'CEREMONY':
                    return '💍';
                  case 'RECEPTION':
                    return '🍽️';
                  case 'PARTY':
                    return '🎉';
                  default:
                    return '✨';
                }
              };

              return (
                <div key={ev.eventId} className={styles.eventStatCard}>
                  <div className={styles.eventStatTop}>
                    <div className={styles.eventStatHeaderLeft}>
                      <span className={styles.eventStatIcon}>{getEventIcon(ev.eventType)}</span>
                      <div>
                        <h3 className={styles.eventStatName}>{ev.eventName}</h3>
                        <span className={styles.eventStatTotal}>
                          {ev.totalInvitedCount} convocados
                        </span>
                      </div>
                    </div>
                    <div className={styles.eventStatBadge}>
                      <span className={styles.eventStatRatio}>
                        <strong>{ev.confirmedCount}</strong> / {ev.totalInvitedCount}
                      </span>
                      <span className={styles.eventStatPct}>
                        {evConfirmedPct.toFixed(0)}% Asistencia
                      </span>
                    </div>
                  </div>

                  {/* Barra de progreso por evento */}
                  <div className={styles.miniProgressBar}>
                    <div
                      className={styles.progressSegmentConfirmed}
                      style={{ width: `${evConfirmedPct}%` }}
                      title={`Confirmados: ${ev.confirmedCount} (${evConfirmedPct.toFixed(1)}%)`}
                    />
                    <div
                      className={styles.progressSegmentPending}
                      style={{ width: `${evPendingPct}%` }}
                      title={`Pendientes: ${ev.pendingCount} (${evPendingPct.toFixed(1)}%)`}
                    />
                    <div
                      className={styles.progressSegmentDeclined}
                      style={{ width: `${evDeclinedPct}%` }}
                      title={`Declinados: ${ev.declinedCount} (${evDeclinedPct.toFixed(1)}%)`}
                    />
                  </div>

                  {/* Desglose de etiquetas */}
                  <div className={styles.eventStatPills}>
                    <span className={styles.pillConfirmed}>
                      ✓ {ev.confirmedCount} asisten
                    </span>
                    <span className={styles.pillPending}>
                      ⏳ {ev.pendingCount} pendientes
                    </span>
                    <span className={styles.pillDeclined}>
                      ✕ {ev.declinedCount} no asisten
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
