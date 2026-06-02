import React, { useEffect, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = '500px',
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal animate-scale-in"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button className="modal__close" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-lg);
        }

        .modal {
          background: var(--shell-2);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          width: 100%;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-lg), var(--shadow-glow);
        }

        .modal__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-lg);
          border-bottom: 1px solid var(--line);
        }

        .modal__title {
          font-size: 1.125rem;
          font-weight: 600;
        }

        .modal__close {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 1rem;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .modal__close:hover {
          background: var(--surface);
          color: var(--text);
        }

        .modal__body {
          padding: var(--space-lg);
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};
