import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${loading ? 'btn--loading' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn__spinner" />}
      {!loading && icon && <span className="btn__icon">{icon}</span>}
      {children && <span className="btn__text">{children}</span>}

      <style>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          border-radius: var(--radius-sm);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
          position: relative;
          overflow: hidden;
        }

        .btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .btn:hover::after { opacity: 1; }

        .btn:active { transform: scale(0.97); }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .btn:disabled::after { display: none; }

        /* Variants */
        .btn--primary {
          background: linear-gradient(135deg, var(--blue), var(--cyan));
          color: #fff;
          box-shadow: 0 2px 12px rgba(107, 155, 196, 0.3);
        }

        .btn--primary:hover {
          box-shadow: 0 4px 20px rgba(113, 169, 179, 0.5);
        }

        .btn--secondary {
          background: var(--surface);
          color: var(--text);
          border: 1px solid var(--line);
        }

        .btn--secondary:hover {
          background: var(--surface-2);
          border-color: var(--cyan);
          box-shadow: 0 0 8px rgba(113, 169, 179, 0.2);
        }

        .btn--danger {
          background: linear-gradient(135deg, var(--red), #c0392b);
          color: white;
          box-shadow: 0 2px 12px rgba(218, 131, 121, 0.3);
        }

        .btn--ghost {
          background: transparent;
          color: var(--text-soft);
        }

        .btn--ghost:hover {
          background: var(--surface);
          color: var(--text);
        }

        /* Sizes */
        .btn--sm { padding: 6px 12px; font-size: 0.8125rem; }
        .btn--md { padding: 8px 20px; font-size: 0.875rem; }
        .btn--lg { padding: 12px 28px; font-size: 1rem; }

        /* Loading */
        .btn__spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .btn__icon {
          display: flex;
          align-items: center;
          font-size: 1.1em;
        }
      `}</style>
    </button>
  );
};
