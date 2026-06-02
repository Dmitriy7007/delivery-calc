import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <div className={`input-group ${error ? 'input-group--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-group__label">
          {label}
        </label>
      )}
      <div className="input-group__wrapper">
        {icon && <span className="input-group__icon">{icon}</span>}
        <input
          id={inputId}
          className={`input-group__input ${icon ? 'input-group__input--with-icon' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="input-group__error">{error}</span>}

      <style>{`
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group__label {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-soft);
        }

        .input-group__wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-group__icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
          font-size: 1.1em;
          display: flex;
          pointer-events: none;
        }

        .input-group__input {
          width: 100%;
          padding: 10px 14px;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          color: var(--text);
          font-size: 0.875rem;
          transition: all var(--transition-fast);
          outline: none;
        }

        .input-group__input--with-icon {
          padding-left: 38px;
        }

        .input-group__input:focus {
          border-color: var(--cyan);
          box-shadow: 0 0 0 2px rgba(113, 169, 179, 0.2);
        }

        .input-group__input::placeholder {
          color: var(--text-muted);
        }

        .input-group--error .input-group__input {
          border-color: var(--red);
        }

        .input-group__error {
          font-size: 0.75rem;
          color: var(--red);
        }
      `}</style>
    </div>
  );
};
