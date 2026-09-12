import React from 'react';
import styles from './ConfirmModal.module.css';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const renderIcon = () => {
    switch (variant) {
      case 'danger':
        return <div className={`${styles.iconWrapper} ${styles.iconDanger}`}>🗑️</div>;
      case 'warning':
        return <div className={`${styles.iconWrapper} ${styles.iconWarning}`}>⚠️</div>;
      case 'info':
      default:
        return <div className={`${styles.iconWrapper} ${styles.iconInfo}`}>ℹ️</div>;
    }
  };

  const getConfirmStyle = () => {
    switch (variant) {
      case 'danger':
        return styles.confirmDanger;
      case 'warning':
        return styles.confirmWarning;
      case 'info':
      default:
        return styles.confirmInfo;
    }
  };

  return (
    <div className={styles.overlay} onClick={loading ? undefined : onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.body}>
          {renderIcon()}
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.message}>{message}</p>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`${styles.confirmButton} ${getConfirmStyle()}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
