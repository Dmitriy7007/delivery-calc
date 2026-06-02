import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <label className={`custom-checkbox ${disabled ? 'custom-checkbox--disabled' : ''}`}>
      <div className="custom-checkbox__input-wrapper">
        <input
          type="checkbox"
          className="custom-checkbox__input"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={`custom-checkbox__box ${checked ? 'custom-checkbox__box--checked' : ''}`}>
          {checked && <Check size={14} className="custom-checkbox__icon" strokeWidth={3} />}
        </div>
      </div>
      <span className="custom-checkbox__label">{label}</span>

      <style>{`
        .custom-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
          width: fit-content;
        }

        .custom-checkbox--disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .custom-checkbox__input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .custom-checkbox__input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .custom-checkbox__box {
          width: 20px;
          height: 20px;
          border: 2px solid var(--line-strong);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface);
          transition: all var(--transition-fast);
        }

        .custom-checkbox__input:focus-visible ~ .custom-checkbox__box {
          outline: 2px solid var(--cyan);
          outline-offset: 2px;
        }

        .custom-checkbox:hover .custom-checkbox__box {
          border-color: var(--cyan);
        }

        .custom-checkbox__box--checked {
          background: var(--cyan);
          border-color: var(--cyan);
          box-shadow: 0 0 10px rgba(113, 169, 179, 0.4);
        }

        .custom-checkbox__icon {
          color: var(--surface);
          animation: scaleIn var(--transition-fast);
        }

        .custom-checkbox__label {
          font-size: 0.875rem;
          color: var(--text);
          font-weight: 500;
        }
      `}</style>
    </label>
  );
};
