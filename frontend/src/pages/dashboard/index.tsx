import React, { useEffect, useState } from 'react';
import { apiClient } from '@/shared/api/client';
import { useCity } from '@/shared/lib/cityContext';
import type { City, Store, CitySettings } from '@/shared/types';
import { MapPin, Store as StoreIcon, Settings as SettingsIcon, Truck, TrendingUp, Package } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { currentCityId } = useCity();
  const [cities, setCities] = useState<City[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [settings, setSettings] = useState<CitySettings | null>(null);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    apiClient.get('/cities').then(r => setCities(r.data));
    apiClient.get('/products').then(r => setProductCount(r.data.length));
  }, []);

  useEffect(() => {
    if (!currentCityId) return;
    apiClient.get(`/stores?cityId=${currentCityId}`).then(r => setStores(r.data));
    apiClient.get(`/delivery-settings/${currentCityId}`).then(r => setSettings(r.data));
  }, [currentCityId]);

  const currentCity = cities.find(c => c.id === currentCityId);

  const stats = [
    { icon: MapPin, label: 'Городов', value: cities.length, color: 'var(--blue)' },
    { icon: StoreIcon, label: 'ТТ в городе', value: stores.length, color: 'var(--green)' },
    { icon: Package, label: 'Товаров', value: productCount, color: 'var(--purple)' },
    { icon: Truck, label: 'Лимит/день', value: settings?.rate?.maxDeliveriesPerDay ?? '—', color: 'var(--orange)' },
    { icon: TrendingUp, label: 'Цена за км', value: settings?.rate ? `${settings.rate.pricePerKm} ₽` : '—', color: 'var(--cyan)' },
    { icon: SettingsIcon, label: 'Горизонт', value: settings?.rate ? `${settings.rate.planningHorizonDays} дн` : '—', color: 'var(--red)' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Dashboard</h1>
        {currentCity && (
          <span className="dashboard__city-badge">{currentCity.name}</span>
        )}
      </div>

      <div className="dashboard__stats">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card__icon" style={{ background: `${stat.color}18`, color: stat.color }}>
              <stat.icon size={20} />
            </div>
            <div className="stat-card__body">
              <div className="stat-card__value">{stat.value}</div>
              <div className="stat-card__label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {settings?.rate && (
        <div className="dashboard__panels">
          <div className="panel">
            <h2 className="panel__title">Коэффициенты доставки</h2>
            <div className="panel__grid">
              <div className="panel__item">
                <span className="panel__item-label">День в день</span>
                <span className="panel__item-value">×{settings.rate.kDayInDay}</span>
              </div>
              <div className="panel__item">
                <span className="panel__item-label">Точно ко времени</span>
                <span className="panel__item-value">×{settings.rate.kExactTime}</span>
              </div>
              <div className="panel__item">
                <span className="panel__item-label">Экспресс</span>
                <span className="panel__item-value">×{settings.rate.kExpress}</span>
              </div>
              <div className="panel__item">
                <span className="panel__item-label">Сбор между ТТ</span>
                <span className="panel__item-value">×{settings.rate.kCollect}</span>
              </div>
            </div>
          </div>

          <div className="panel">
            <h2 className="panel__title">Минимальные цены</h2>
            <table className="panel__table">
              <thead>
                <tr><th>До кг</th><th>Мин. цена</th></tr>
              </thead>
              <tbody>
                {settings.rate.minPrices.map((mp, i) => (
                  <tr key={i}>
                    <td>{mp.maxWeight.toLocaleString()} кг</td>
                    <td>{mp.minPrice.toLocaleString()} ₽</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <h2 className="panel__title">Торговые точки</h2>
            <div className="panel__store-list">
              {stores.map(store => (
                <div key={store.id} className="panel__store-item">
                  <div className="panel__store-icon" style={{
                    background: store.type === 'warehouse' ? 'var(--orange-soft)' : 'var(--green-soft)',
                    color: store.type === 'warehouse' ? 'var(--orange)' : 'var(--green)',
                  }}>
                    <StoreIcon size={14} />
                  </div>
                  <div>
                    <div className="panel__store-name">{store.name}</div>
                    <div className="panel__store-address">{store.address}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard { padding: var(--space-lg); }
        .dashboard__header { display: flex; align-items: center; gap: 16px; margin-bottom: var(--space-xl); }
        .dashboard__title { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em; }
        .dashboard__city-badge {
          padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
          background: var(--blue-soft); color: var(--cyan); border: 1px solid var(--blue)22;
        }
        .dashboard__stats {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: var(--space-md); margin-bottom: var(--space-xl);
        }
        .stat-card {
          display: flex; align-items: center; gap: 14px; padding: 18px 20px;
          background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        .stat-card:hover { border-color: var(--line-bright); transform: translateY(-1px); }
        .stat-card__icon {
          width: 42px; height: 42px; border-radius: var(--radius-sm);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .stat-card__value { font-size: 1.25rem; font-weight: 700; line-height: 1.2; }
        .stat-card__label { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
        .dashboard__panels {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-md);
        }
        .panel {
          background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md);
          padding: var(--space-lg);
        }
        .panel__title { font-size: 0.9375rem; font-weight: 700; margin-bottom: var(--space-md); }
        .panel__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .panel__item {
          padding: 10px 14px; background: var(--bg); border-radius: var(--radius-sm);
          display: flex; justify-content: space-between; align-items: center;
        }
        .panel__item-label { font-size: 0.8125rem; color: var(--text-secondary); }
        .panel__item-value { font-size: 0.875rem; font-weight: 700; color: var(--cyan); font-variant-numeric: tabular-nums; }
        .panel__table { width: 100%; border-collapse: collapse; }
        .panel__table th, .panel__table td {
          padding: 8px 12px; text-align: left; font-size: 0.8125rem; border-bottom: 1px solid var(--line);
        }
        .panel__table th { color: var(--text-muted); font-weight: 500; }
        .panel__table td { font-variant-numeric: tabular-nums; }
        .panel__store-list { display: flex; flex-direction: column; gap: 8px; }
        .panel__store-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
        .panel__store-icon {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .panel__store-name { font-size: 0.8125rem; font-weight: 600; }
        .panel__store-address { font-size: 0.75rem; color: var(--text-muted); margin-top: 1px; }
      `}</style>
    </div>
  );
};
