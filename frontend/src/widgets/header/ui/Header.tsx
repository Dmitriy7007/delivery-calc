import React from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin, ChevronDown } from 'lucide-react';
import { useCity } from '@/shared/lib/cityContext';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/zones': 'Управление зонами',
  '/calculator': 'Калькулятор доставки',
};

export const Header: React.FC = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Domingo Admin';
  const { selectedCity, openCitySelector } = useCity();

  return (
    <header className="header">
      <h1 className="header__title">{title}</h1>
      <div className="header__actions">
        <button className="header__city" onClick={openCitySelector}>
          <MapPin size={14} className="header__city-icon" />
          <span>{selectedCity?.name ?? 'Выбрать город'}</span>
          <ChevronDown size={13} className="header__city-chevron" />
        </button>
      </div>

      <style>{`
        .header {
          height: var(--header-height);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-xl);
          border-bottom: 1px solid var(--line);
          position: sticky;
          top: 0;
          z-index: 50;
          background: var(--bg-glass);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .header__title {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .header__actions {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .header__city {
          font-size: 0.8125rem;
          color: var(--text-soft);
          padding: 6px 12px;
          background: var(--surface);
          border-radius: var(--radius-sm);
          border: 1px solid var(--line);
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-family: inherit;
          transition: all var(--transition-fast);
        }

        .header__city:hover {
          border-color: var(--cyan);
          color: var(--text);
          background: var(--surface-2);
        }

        .header__city-icon {
          color: var(--cyan);
          flex-shrink: 0;
        }

        .header__city-chevron {
          color: var(--text-muted);
          margin-left: 2px;
        }
      `}</style>
    </header>
  );
};
