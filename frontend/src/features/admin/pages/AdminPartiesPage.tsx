import React, { useState, useEffect, useMemo } from 'react';
import type { PartyResponse, PartyStatus } from '../../../types';
import { partiesApi } from '../../../lib/api/parties';
import { PartyModal } from '../components/PartyModal/PartyModal';
import { ConfirmModal } from '../../../common/components';
import { QrCodeModal } from '../components/QrCodeModal/QrCodeModal';
import styles from './AdminPartiesPage.module.css';

export const AdminPartiesPage: React.FC = () => {
  const [parties, setParties] = useState<PartyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal State
  const [selectedParty, setSelectedParty] = useState<PartyResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partyForQr, setPartyForQr] = useState<PartyResponse | null>(null);

  // Confirmation Modals State
  const [partyToDelete, setPartyToDelete] = useState<PartyResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [partyToRegenerate, setPartyToRegenerate] = useState<PartyResponse | null>(null);
  const [isRegeneratingToken, setIsRegeneratingToken] = useState(false);

  // Feedback states
  const [copiedPartyId, setCopiedPartyId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const loadParties = async (pageNumber: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      const res = await partiesApi.list({ page: pageNumber, size: 50, sort: 'displayName,asc' });
      setParties(res.content || []);
      if (res.page) {
        setTotalPages(res.page.totalPages || 1);
        setTotalElements(res.page.totalElements || res.content?.length || 0);
        setPage(res.page.number || 0);
      }
    } catch (err: any) {
      console.error('Error loading parties:', err);
      setError(err?.message || 'No se pudieron cargar los grupos de invitados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParties(page);
  }, [page]);

  // Filtered list based on Search and Status Pill
  const filteredParties = useMemo(() => {
    return parties.filter((p) => {
      const matchesSearch =
        p.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.internalNotes && p.internalNotes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        selectedStatus === 'ALL' || p.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [parties, searchTerm, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = parties.length;
    const confirmed = parties.filter((p) => p.status === 'CONFIRMED').length;
    const pending = parties.filter((p) => p.status === 'PENDING').length;
    const declined = parties.filter((p) => p.status === 'DECLINED').length;
    return { total, confirmed, pending, declined };
  }, [parties]);

  const handleCopyLink = (party: PartyResponse) => {
    const origin = window.location.origin;
    const url = `${origin}/rsvp/${party.rsvpToken}`;
    navigator.clipboard.writeText(url);
    setCopiedPartyId(party.id);
    setTimeout(() => {
      setCopiedPartyId(null);
    }, 2000);
  };

  const handleCopyCode = (party: PartyResponse) => {
    navigator.clipboard.writeText(party.rsvpToken);
    setCopiedCodeId(party.id);
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 2000);
  };

  const handleConfirmRegenerate = async () => {
    if (!partyToRegenerate) return;

    try {
      setIsRegeneratingToken(true);
      const updated = await partiesApi.regenerateToken(partyToRegenerate.id);
      setParties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setPartyToRegenerate(null);
    } catch (err: any) {
      alert(err?.message || 'Error al regenerar el token.');
    } finally {
      setIsRegeneratingToken(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!partyToDelete) return;

    try {
      setIsDeleting(true);
      await partiesApi.delete(partyToDelete.id);
      setParties((prev) => prev.filter((p) => p.id !== partyToDelete.id));
      setPartyToDelete(null);
    } catch (err: any) {
      alert(err?.message || 'Error al eliminar el grupo.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenNewModal = () => {
    setSelectedParty(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (party: PartyResponse) => {
    setSelectedParty(party);
    setIsModalOpen(true);
  };

  const handleModalSaved = (_saved: PartyResponse) => {
    setIsModalOpen(false);
    loadParties(page);
  };

  const renderStatusBadge = (status: PartyStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className={`${styles.statusBadge} ${styles.statusConfirmed}`}>✓ Confirmado</span>;
      case 'PENDING':
        return <span className={`${styles.statusBadge} ${styles.statusPending}`}>⏱ Pendiente</span>;
      case 'DECLINED':
        return <span className={`${styles.statusBadge} ${styles.statusDeclined}`}>✕ Declinado</span>;
      case 'PARTIAL':
        return <span className={`${styles.statusBadge} ${styles.statusPartial}`}>◐ Parcial</span>;
      default:
        return <span className={styles.statusBadge}>{status}</span>;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Invitados & Grupos</h1>
          <p className={styles.pageSubtitle}>
            Gestiona los grupos familiares, asigna acompañantes y comparte enlaces de confirmación RSVP.
          </p>
        </div>

        <button type="button" className={styles.newPartyButton} onClick={handleOpenNewModal}>
          <span>➕</span> Nuevo Grupo / Familia
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIconWrapper} ${styles.statIconAll}`}>👥</div>
          <div>
            <div className={styles.statValue}>{totalElements || stats.total}</div>
            <div className={styles.statLabel}>Total Grupos</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconWrapper} ${styles.statIconConfirmed}`}>✓</div>
          <div>
            <div className={styles.statValue}>{stats.confirmed}</div>
            <div className={styles.statLabel}>Grupos Confirmados</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconWrapper} ${styles.statIconPending}`}>⏱</div>
          <div>
            <div className={styles.statValue}>{stats.pending}</div>
            <div className={styles.statLabel}>Grupos Pendientes</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconWrapper} ${styles.statIconDeclined}`}>✕</div>
          <div>
            <div className={styles.statValue}>{stats.declined}</div>
            <div className={styles.statLabel}>Grupos Declinados</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className={styles.toolbarCard}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nombre de familia o notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterPills}>
          <button
            type="button"
            className={`${styles.filterPill} ${selectedStatus === 'ALL' ? styles.filterPillActive : ''}`}
            onClick={() => setSelectedStatus('ALL')}
          >
            Todos ({parties.length})
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${selectedStatus === 'CONFIRMED' ? styles.filterPillActive : ''}`}
            onClick={() => setSelectedStatus('CONFIRMED')}
          >
            Confirmados ({stats.confirmed})
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${selectedStatus === 'PENDING' ? styles.filterPillActive : ''}`}
            onClick={() => setSelectedStatus('PENDING')}
          >
            Pendientes ({stats.pending})
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${selectedStatus === 'DECLINED' ? styles.filterPillActive : ''}`}
            onClick={() => setSelectedStatus('DECLINED')}
          >
            Declinados ({stats.declined})
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIcon}>⏳</div>
            <h3 className={styles.emptyTitle}>Cargando invitados y grupos...</h3>
          </div>
        ) : error ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIcon}>⚠️</div>
            <h3 className={styles.emptyTitle}>Error al cargar datos</h3>
            <p className={styles.emptyText}>{error}</p>
            <button type="button" className={styles.newPartyButton} onClick={() => loadParties(0)}>
              Reintentar
            </button>
          </div>
        ) : filteredParties.length === 0 ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIcon}>💌</div>
            <h3 className={styles.emptyTitle}>
              {searchTerm || selectedStatus !== 'ALL'
                ? 'No se encontraron grupos con ese filtro'
                : 'Aún no hay grupos creados'}
            </h3>
            <p className={styles.emptyText}>
              {searchTerm || selectedStatus !== 'ALL'
                ? 'Prueba a cambiar el término de búsqueda o selecciona otro filtro de estado.'
                : 'Crea tu primer grupo de invitados para generar sus enlaces personalizados de confirmación.'}
            </p>
            {!searchTerm && selectedStatus === 'ALL' && (
              <button type="button" className={styles.newPartyButton} onClick={handleOpenNewModal}>
                <span>➕</span> Crear Primer Grupo
              </button>
            )}
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Grupo / Familia</th>
                  <th className={styles.th}>Estado RSVP</th>
                  <th className={styles.th}>Enlace de Invitación</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredParties.map((p) => {
                  const isCopied = copiedPartyId === p.id;

                  return (
                    <tr key={p.id} className={styles.tr}>
                      {/* Name & Notes */}
                      <td className={styles.td}>
                        <div className={styles.partyNameCell}>
                          <span className={styles.partyDisplayName}>{p.displayName}</span>
                          {p.internalNotes && (
                            <span className={styles.partyNotes}>📝 {p.internalNotes}</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className={styles.td}>{renderStatusBadge(p.status)}</td>

                      {/* Token / Link Actions */}
                      <td className={styles.td}>
                        <div className={styles.tokenBox}>
                          <button
                            type="button"
                            className={`${styles.codeBadge} ${copiedCodeId === p.id ? styles.codeBadgeCopied : ''}`}
                            onClick={() => handleCopyCode(p)}
                            title="Código para tarjeta física (haz clic para copiar)"
                          >
                            <span>{copiedCodeId === p.id ? '✓' : '🏷️'}</span>
                            {copiedCodeId === p.id ? '¡Copiado!' : p.rsvpToken}
                          </button>

                          <button
                            type="button"
                            className={`${styles.tokenLinkButton} ${isCopied ? styles.tokenCopied : ''}`}
                            onClick={() => handleCopyLink(p)}
                            title="Copiar enlace directo RSVP"
                          >
                            <span>{isCopied ? '✓' : '📋'}</span>
                            {isCopied ? '¡Copiado!' : 'Copiar Enlace'}
                          </button>

                          <button
                            type="button"
                            className={styles.iconOnlyButton}
                            onClick={() => setPartyForQr(p)}
                            title="Ver código QR y compartir"
                          >
                            📱
                          </button>

                          <a
                            href={`/rsvp/${p.rsvpToken}`}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.iconOnlyButton}
                            title="Abrir página RSVP en nueva pestaña"
                          >
                            🌐
                          </a>

                          <button
                            type="button"
                            className={styles.iconOnlyButton}
                            onClick={() => setPartyToRegenerate(p)}
                            title="Regenerar enlace / token"
                          >
                            🔄
                          </button>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className={styles.td}>
                        <div className={styles.actionsCell}>
                          <button
                            type="button"
                            className={styles.editButton}
                            onClick={() => handleOpenEditModal(p)}
                          >
                            <span>✏️</span> Gestionar
                          </button>

                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => setPartyToDelete(p)}
                            title="Eliminar grupo"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination controls if multiple pages */}
            {totalPages > 1 && (
              <div className={styles.paginationContainer}>
                <div className={styles.paginationInfo}>
                  Página {page + 1} de {totalPages} ({totalElements} grupos en total)
                </div>
                <div className={styles.paginationButtons}>
                  <button
                    type="button"
                    className={styles.pageButton}
                    disabled={page === 0}
                    onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  >
                    ← Anterior
                  </button>
                  <button
                    type="button"
                    className={styles.pageButton}
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal for Creating or Editing Party & its Guests */}
      {isModalOpen && (
        <PartyModal
          party={selectedParty}
          onClose={() => setIsModalOpen(false)}
          onSaved={handleModalSaved}
        />
      )}

      {/* Modal para Ver / Descargar Código QR y Compartir */}
      {partyForQr && (
        <QrCodeModal
          party={partyForQr}
          onClose={() => setPartyForQr(null)}
        />
      )}

      {/* Modal de Confirmación para Regenerar Enlace */}
      <ConfirmModal
        isOpen={!!partyToRegenerate}
        title="¿Regenerar enlace de invitación?"
        message={`¿Estás seguro de regenerar el enlace para "${partyToRegenerate?.displayName}"? El enlace RSVP anterior quedará invalidado y deberás compartir el nuevo enlace.`}
        confirmText="Regenerar Enlace"
        cancelText="Cancelar"
        variant="warning"
        loading={isRegeneratingToken}
        onConfirm={handleConfirmRegenerate}
        onCancel={() => setPartyToRegenerate(null)}
      />

      {/* Modal de Confirmación para Eliminar Grupo */}
      <ConfirmModal
        isOpen={!!partyToDelete}
        title="¿Eliminar grupo e invitados?"
        message={`¿Estás seguro de eliminar el grupo "${partyToDelete?.displayName}" y todos sus invitados asociados? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Grupo"
        cancelText="Cancelar"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPartyToDelete(null)}
      />
    </div>
  );
};
