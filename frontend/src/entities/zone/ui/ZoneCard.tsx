import React from 'react';
import type { Zone } from '@/shared/types';
import { Badge } from '@/shared/ui';

interface ZoneCardProps {
  zone: Zone;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ZoneCard: React.FC<ZoneCardProps> = ({ zone, isSelected, onClick }) => {
  return (
    <div
      className={`zone-card ${isSelected ? 'zone-card--selected' : ''}`}
      onClick={onClick}
    >
      <div className="zone-card__color" style={{ background: zone.color }} />
      <div className="zone-card__info">
        <div className="zone-card__header">
          <span className="zone-card__name">{zone.name}</span>
          <Badge variant={zone.isActive ? 'success' : 'danger'}>
            {zone.isActive ? 'Активна' : 'Неактивна'}
          </Badge>
        </div>
        <div className="zone-card__details">
          <span className="zone-card__price">{zone.price} ₽</span>
          {zone.deliveryTime && (
            <span className="zone-card__time">⏱ {zone.deliveryTime}</span>
          )}
        </div>
        {zone.minOrderAmount > 0 && (
          <span className="zone-card__min">Мин. заказ: {zone.minOrderAmount} ₽</span>
        )}
      </div>

      <style>{`
        .zone-card {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: var(--radius-sm);
          background: var(--surface);
          border: 1px solid var(--line);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .zone-card:hover {
          background: var(--surface-2);
          border-color: var(--line-strong);
        }

        .zone-card--selected {
          background: var(--surface-3);
          border-color: var(--cyan);
          box-shadow: 0 0 12px rgba(113, 169, 179, 0.2);
        }

        .zone-card__color {
          width: 4px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .zone-card__info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .zone-card__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .zone-card__name {
          font-weight: 600;
          font-size: 0.875rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .zone-card__details {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.8125rem;
        }

        .zone-card__price {
          color: var(--cyan);
          font-weight: 600;
        }

        .zone-card__time {
          color: var(--text-muted);
        }

        .zone-card__min {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
