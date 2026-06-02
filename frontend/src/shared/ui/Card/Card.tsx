import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'var(--space-lg)',
  hover = false,
  onClick,
}) => {
  return (
    <div
      className={`card ${hover ? 'card--hover' : ''} ${className}`}
      style={{ padding }}
      onClick={onClick}
    >
      {children}

      <style>{`
        .card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
        }

        .card--hover {
          cursor: pointer;
        }

        .card--hover:hover {
          background: var(--surface-2);
          border-color: var(--cyan);
          box-shadow: var(--shadow-glow);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};
