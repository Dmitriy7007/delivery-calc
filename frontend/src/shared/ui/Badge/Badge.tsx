import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: React.ReactNode;
}

const variantStyles: Record<string, { bg: string; color: string }> = {
  success: { bg: 'var(--green-soft)', color: 'var(--green)' },
  warning: { bg: 'var(--amber-soft)', color: 'var(--amber)' },
  danger: { bg: 'var(--red-soft)', color: 'var(--red)' },
  info: { bg: 'rgba(107, 155, 196, 0.15)', color: 'var(--blue)' },
  default: { bg: 'var(--surface)', color: 'var(--text-soft)' },
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children }) => {
  const style = variantStyles[variant];

  return (
    <span
      className="badge"
      style={{ background: style.bg, color: style.color }}
    >
      {children}

      <style>{`
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
      `}</style>
    </span>
  );
};
