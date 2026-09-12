import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import type { PartyResponse } from '../../../../types';
import styles from './QrCodeModal.module.css';

interface QrCodeModalProps {
  party: PartyResponse;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ party, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const rsvpUrl = `${origin}/rsvp/${party.rsvpToken}`;

  const handleCopyLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(rsvpUrl);
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleCopyCode = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(party.rsvpToken);
    }
    setCopiedCode(true);
    setTimeout(() => {
      setCopiedCode(false);
    }, 2000);
  };

  const handleDownloadQr = () => {
    const canvas = document.getElementById(`qr-canvas-${party.id}`) as HTMLCanvasElement;
    if (!canvas) return;

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    const cleanName = party.displayName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_');
    downloadLink.download = `invitacion-boda-${cleanName}-qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const whatsappMessage = encodeURIComponent(
    `¡Hola ${party.displayName}! Os invitamos con mucha ilusión a nuestra boda. Podéis confirmar vuestra asistencia y menú en este enlace directo:\n${rsvpUrl}\n\n(O entrando en la web con vuestro código de invitación: ${party.rsvpToken})`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappMessage}`;

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="qrModalTitle">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleWrapper}>
            <div className={styles.modalIcon} aria-hidden="true">💌</div>
            <div>
              <h2 id="qrModalTitle" className={styles.modalTitle}>Invitación & Código QR</h2>
              <p className={styles.modalSubtitle}>Grupo: {party.displayName}</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* QR Container */}
          <div className={styles.qrWrapper}>
            <div className={styles.qrCanvasWrapper}>
              <QRCodeCanvas
                id={`qr-canvas-${party.id}`}
                value={rsvpUrl}
                size={220}
                level="H"
                marginSize={1}
                fgColor="#2c1a16"
                bgColor="#ffffff"
              />
            </div>
            <span className={styles.partyLabel}>{party.displayName}</span>
            <span className={styles.qrHint}>Escanea con la cámara del móvil para confirmar asistencia</span>
          </div>

          {/* Código de Invitación destacado */}
          <div className={styles.codeCard}>
            <div className={styles.codeCardLeft}>
              <span className={styles.codeCardLabel}>CÓDIGO DE INVITACIÓN (TARJETA FÍSICA)</span>
              <span className={styles.codeCardValue}>{party.rsvpToken}</span>
            </div>
            <button
              type="button"
              className={`${styles.copyCodeButton} ${copiedCode ? styles.copyButtonSuccess : ''}`}
              onClick={handleCopyCode}
              title="Copiar únicamente el código corto"
            >
              <span>{copiedCode ? '✓' : '📋'}</span>
              {copiedCode ? '¡Copiado!' : 'Copiar Código'}
            </button>
          </div>

          {/* Link Copiable */}
          <div className={styles.linkContainer}>
            <label htmlFor="rsvp-direct-link" className={styles.linkLabel}>
              Enlace directo personalizado:
            </label>
            <div className={styles.linkRow}>
              <input
                id="rsvp-direct-link"
                type="text"
                readOnly
                value={rsvpUrl}
                className={styles.linkInput}
              />
              <button
                type="button"
                className={`${styles.copyButton} ${copied ? styles.copyButtonSuccess : ''}`}
                onClick={handleCopyLink}
              >
                <span>{copied ? '✓' : '📋'}</span>
                {copied ? '¡Copiado!' : 'Copiar Enlace'}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionsGrid}>
            <button
              type="button"
              className={styles.downloadButton}
              onClick={handleDownloadQr}
              title="Descargar imagen PNG de alta resolución"
            >
              <span>📥</span> Descargar QR (PNG)
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappButton}
              title="Compartir enlace personalizado por WhatsApp"
            >
              <span>💬</span> Enviar por WhatsApp
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.closeFooterButton} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
