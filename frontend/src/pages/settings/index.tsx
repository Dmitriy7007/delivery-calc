import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/shared/api/client';
import { useCity } from '@/shared/lib/cityContext';
import type { CitySettings, DistanceCoefficient, VehicleCategory, ClientDiscount } from '@/shared/types';
import { Button, Input } from '@/shared/ui';
import { Save, Plus, Trash2 } from 'lucide-react';

type TabKey = 'rates' | 'minPrices' | 'distance' | 'vehicles' | 'discounts' | 'lifting';
const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'rates', label: 'Основные тарифы' },
  { key: 'minPrices', label: 'Мин. цены' },
  { key: 'distance', label: 'Коэфф. удалённости' },
  { key: 'vehicles', label: 'Категории машин' },
  { key: 'discounts', label: 'Скидки клиентов' },
  { key: 'lifting', label: 'Подъём' },
];

export const SettingsPage: React.FC = () => {
  const { currentCityId } = useCity();
  const [activeTab, setActiveTab] = useState<TabKey>('rates');
  const [settings, setSettings] = useState<CitySettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    if (!currentCityId) return;
    const res = await apiClient.get(`/delivery-settings/${currentCityId}`);
    setSettings(res.data);
  }, [currentCityId]);

  useEffect(() => { load(); }, [load]);

  const saveRate = async (fields: Record<string, any>) => {
    if (!currentCityId) return;
    setSaving(true);
    try {
      await apiClient.patch(`/delivery-settings/${currentCityId}/rates`, fields);
      setMsg('Сохранено!');
      setTimeout(() => setMsg(''), 2000);
      load();
    } finally { setSaving(false); }
  };

  const saveLiftingTariff = async (fields: Record<string, any>) => {
    if (!currentCityId) return;
    setSaving(true);
    try {
      await apiClient.patch(`/delivery-settings/${currentCityId}/lifting-tariff`, fields);
      setMsg('Сохранено!');
      setTimeout(() => setMsg(''), 2000);
      load();
    } finally { setSaving(false); }
  };

  if (!settings) return <div className="settings-page"><p>Загрузка...</p></div>;

  const rate = settings.rate;

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Настройки тарифов</h1>
        {msg && <span className="save-msg">{msg}</span>}
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t.key} className={`tab ${activeTab === t.key ? 'tab--active' : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'rates' && rate && <RatesTab rate={rate} onSave={saveRate} saving={saving} />}
        {activeTab === 'minPrices' && rate && <MinPricesTab minPrices={rate.minPrices} onSave={(mp) => saveRate({ minPrices: mp })} saving={saving} />}
        {activeTab === 'distance' && <DistanceTab cityId={currentCityId!} items={settings.distanceCoefficients} onReload={load} />}
        {activeTab === 'vehicles' && <VehiclesTab cityId={currentCityId!} items={settings.vehicleCategories} onReload={load} />}
        {activeTab === 'discounts' && <DiscountsTab cityId={currentCityId!} items={settings.clientDiscounts} onReload={load} />}
        {activeTab === 'lifting' && settings.liftingTariff && <LiftingTab tariff={settings.liftingTariff} onSave={saveLiftingTariff} saving={saving} />}
      </div>

      <style>{`
        .settings-page { padding: var(--space-lg); height: calc(100vh - var(--header-height)); overflow-y: auto; }
        .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: var(--space-lg); }
        .page-title { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em; }
        .save-msg { font-size: 0.8125rem; color: var(--green); font-weight: 600; animation: fadeIn 0.3s; }
        .tabs { display: flex; gap: 2px; margin-bottom: var(--space-lg); background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 4px; overflow-x: auto; }
        .tab { padding: 8px 14px; border: none; border-radius: var(--radius-sm); background: transparent; color: var(--text-muted); font-size: 0.75rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all var(--transition-fast); }
        .tab:hover { color: var(--text); background: var(--bg); }
        .tab--active { background: var(--blue-soft); color: var(--cyan); }
        .tab-content { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: var(--space-xl); }
        .settings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        .setting-field { display: flex; flex-direction: column; gap: 6px; }
        .setting-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); line-height: 1.3; }
        .setting-input { padding: 8px 12px; background: var(--bg); border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--text); font-size: 0.875rem; outline: none; font-variant-numeric: tabular-nums; color-scheme: dark; }
        .setting-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-soft); }
        .save-bar { display: flex; justify-content: flex-end; margin-top: 24px; }
        .editable-table { width: 100%; border-collapse: collapse; }
        .editable-table th, .editable-table td { padding: 10px 12px; text-align: left; font-size: 0.8125rem; border-bottom: 1px solid var(--line); }
        .editable-table th { color: var(--text-muted); font-weight: 500; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .editable-table input { width: 100%; padding: 6px 8px; background: var(--bg); border: 1px solid var(--line); border-radius: 4px; color: var(--text); font-size: 0.8125rem; }
        .add-row-btn { margin-top: 12px; }
        .del-btn { width: 26px; height: 26px; border: none; border-radius: 4px; background: transparent; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; justify-content: center; }
        .del-btn:hover { background: var(--red-soft); color: var(--red); }
        .section-title { font-size: 0.9375rem; font-weight: 700; margin-bottom: 16px; }
      `}</style>
    </div>
  );
};

// === Tab components ===

function RatesTab({ rate, onSave, saving }: any) {
  const [f, setF] = useState({
    pricePerKm: rate.pricePerKm, kDayInDay: rate.kDayInDay, kExactTime: rate.kExactTime,
    kExpress: rate.kExpress, expressHours: rate.expressHours, kCollect: rate.kCollect,
    collectDelayDays: rate.collectDelayDays, dayInDayCutoffTime: rate.dayInDayCutoffTime,
    expressAvailableFrom: rate.expressAvailableFrom, expressAvailableTo: rate.expressAvailableTo,
    exactTimeDeltaHours: rate.exactTimeDeltaHours, standardOrderCutoffTime: rate.standardOrderCutoffTime,
  });
  const up = (k: string, v: string) => setF(prev => ({ ...prev, [k]: v }));
  const fields = [
    { key: 'pricePerKm', label: 'Цена за 1 км (₽)' },
    { key: 'kDayInDay', label: 'Коэфф. «День в день»' },
    { key: 'kExactTime', label: 'Коэфф. «Точно ко времени»' },
    { key: 'kExpress', label: 'Коэфф. «Экспресс»' },
    { key: 'expressHours', label: 'Гарантия экспресса (часов)' },
    { key: 'kCollect', label: 'Коэфф. сбора между ТТ' },
    { key: 'collectDelayDays', label: 'Задержка сбора (дн.)' },
    { key: 'dayInDayCutoffTime', label: 'Приём заказов «День в день» до' },
    { key: 'expressAvailableFrom', label: 'Экспресс доступен с' },
    { key: 'expressAvailableTo', label: 'Экспресс доступен до' },
    { key: 'exactTimeDeltaHours', label: 'Мин. запас «Точно ко вр.» (ч)' },
    { key: 'standardOrderCutoffTime', label: 'Приём стандартных заказов до' },
  ];
  const [limitsF, setLimitsF] = useState({
    maxDeliveriesPerDay: rate.maxDeliveriesPerDay,
    planningHorizonDays: rate.planningHorizonDays,
    defaultSupplyDays: rate.defaultSupplyDays,
  });
  const upLimits = (k: string, v: string) => setLimitsF(prev => ({ ...prev, [k]: v }));

  // Intervals as structured array
  const [intervals, setIntervals] = useState<Array<{ from: string; to: string }>>(
    Array.isArray(rate.deliveryIntervals) ? rate.deliveryIntervals : []
  );
  const updateInterval = (idx: number, field: 'from' | 'to', val: string) => {
    setIntervals(prev => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  };
  const addInterval = () => setIntervals(prev => [...prev, { from: '09:00', to: '18:00' }]);
  const removeInterval = (idx: number) => setIntervals(prev => prev.filter((_, i) => i !== idx));

  // Blocked weekdays as toggle set
  const [blockedDays, setBlockedDays] = useState<Set<number>>(
    new Set(Array.isArray(rate.blockedWeekdays) ? rate.blockedWeekdays : [])
  );
  const weekdays = [
    { idx: 1, name: 'Пн' }, { idx: 2, name: 'Вт' }, { idx: 3, name: 'Ср' },
    { idx: 4, name: 'Чт' }, { idx: 5, name: 'Пт' }, { idx: 6, name: 'Сб' },
    { idx: 0, name: 'Вс' },
  ];
  const toggleDay = (day: number) => {
    setBlockedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day); else next.add(day);
      return next;
    });
  };

  const handleSaveAll = () => {
    onSave({
      ...f,
      maxDeliveriesPerDay: parseInt(String(limitsF.maxDeliveriesPerDay)),
      planningHorizonDays: parseInt(String(limitsF.planningHorizonDays)),
      defaultSupplyDays: parseInt(String(limitsF.defaultSupplyDays)),
      deliveryIntervals: intervals,
      blockedWeekdays: Array.from(blockedDays).sort(),
    });
  };

  return (
    <>
      <h3 className="section-title">Коэффициенты и время приёма</h3>
      <div className="settings-grid">
        {fields.map(fi => (
          <div key={fi.key} className="setting-field">
            <label className="setting-label">{fi.label}</label>
            <input className="setting-input" value={(f as any)[fi.key]} onChange={e => up(fi.key, e.target.value)} />
          </div>
        ))}
      </div>

      <h3 className="section-title" style={{ marginTop: 32 }}>Ёмкость и расписание</h3>
      <div className="settings-grid">
        <div className="setting-field">
          <label className="setting-label">Макс. доставок в день</label>
          <input className="setting-input" value={limitsF.maxDeliveriesPerDay} onChange={e => upLimits('maxDeliveriesPerDay', e.target.value)} />
        </div>
        <div className="setting-field">
          <label className="setting-label">Горизонт планирования (дн.)</label>
          <input className="setting-input" value={limitsF.planningHorizonDays} onChange={e => upLimits('planningHorizonDays', e.target.value)} />
        </div>
        <div className="setting-field">
          <label className="setting-label">Срок поставки «под заказ» (дн.)</label>
          <input className="setting-input" value={limitsF.defaultSupplyDays} onChange={e => upLimits('defaultSupplyDays', e.target.value)} />
        </div>
      </div>

      {/* Delivery intervals */}
      <div style={{ marginTop: 24 }}>
        <label className="setting-label" style={{ marginBottom: 8, display: 'block' }}>Интервалы доставки</label>
        <div className="intervals-list">
          {intervals.map((int, idx) => (
            <div key={idx} className="interval-row">
              <span className="interval-label">с</span>
              <input
                type="time"
                className="setting-input interval-time"
                value={int.from}
                onChange={e => updateInterval(idx, 'from', e.target.value)}
              />
              <span className="interval-label">до</span>
              <input
                type="time"
                className="setting-input interval-time"
                value={int.to}
                onChange={e => updateInterval(idx, 'to', e.target.value)}
              />
              <button className="del-btn" onClick={() => removeInterval(idx)} title="Удалить">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={addInterval} icon={<Plus size={14} />} style={{ marginTop: 8 }}>
          Добавить интервал
        </Button>
      </div>

      {/* Blocked weekdays */}
      <div style={{ marginTop: 24 }}>
        <label className="setting-label" style={{ marginBottom: 8, display: 'block' }}>Нерабочие дни недели</label>
        <div className="weekday-chips">
          {weekdays.map(wd => (
            <button
              key={wd.idx}
              className={`weekday-chip ${blockedDays.has(wd.idx) ? 'weekday-chip--blocked' : ''}`}
              onClick={() => toggleDay(wd.idx)}
              title={blockedDays.has(wd.idx) ? 'Нерабочий — нажмите чтобы включить' : 'Рабочий — нажмите чтобы отключить'}
            >
              {wd.name}
            </button>
          ))}
        </div>
        <p className="weekday-hint">
          {blockedDays.size === 0
            ? 'Доставка работает каждый день'
            : `Нерабочие: ${Array.from(blockedDays).map(d => weekdays.find(w => w.idx === d)?.name).filter(Boolean).join(', ')}`}
        </p>
      </div>

      <div className="save-bar">
        <Button variant="primary" onClick={handleSaveAll} loading={saving} icon={<Save size={16} />}>Сохранить</Button>
      </div>

      <style>{`
        .intervals-list { display: flex; flex-direction: column; gap: 8px; }
        .interval-row { display: flex; align-items: center; gap: 8px; }
        .interval-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }
        .interval-time { width: 120px; text-align: center; }
        .weekday-chips { display: flex; gap: 6px; flex-wrap: wrap; }
        .weekday-chip {
          width: 44px; height: 36px; border: 1px solid var(--line); border-radius: var(--radius-sm);
          background: var(--bg); color: var(--text); font-size: 0.75rem; font-weight: 600;
          cursor: pointer; transition: all var(--transition-fast);
          display: flex; align-items: center; justify-content: center;
        }
        .weekday-chip:hover { border-color: var(--blue); }
        .weekday-chip--blocked {
          background: var(--red-soft); border-color: var(--red); color: var(--red);
          text-decoration: line-through;
        }
        .weekday-hint { font-size: 0.6875rem; color: var(--text-muted); margin-top: 8px; }
      `}</style>
    </>
  );
}

function MinPricesTab({ minPrices, onSave, saving }: any) {
  const [rows, setRows] = useState<Array<{ maxWeight: number; minPrice: number }>>(minPrices || []);
  const update = (idx: number, k: string, v: string) => {
    const next = [...rows];
    (next[idx] as any)[k] = parseFloat(v) || 0;
    setRows(next);
  };
  const add = () => setRows([...rows, { maxWeight: 0, minPrice: 0 }]);
  const del = (idx: number) => setRows(rows.filter((_, i) => i !== idx));
  return (
    <>
      <h3 className="section-title">Минимальные цены по весу</h3>
      <table className="editable-table">
        <thead><tr><th>Макс. вес (кг)</th><th>Мин. цена (₽)</th><th></th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td><input value={r.maxWeight} onChange={e => update(i, 'maxWeight', e.target.value)} /></td>
              <td><input value={r.minPrice} onChange={e => update(i, 'minPrice', e.target.value)} /></td>
              <td><button className="del-btn" onClick={() => del(i)}><Trash2 size={14} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button variant="ghost" size="sm" onClick={add} icon={<Plus size={14} />} className="add-row-btn">Добавить</Button>
      <div className="save-bar">
        <Button variant="primary" onClick={() => onSave(rows)} loading={saving} icon={<Save size={16} />}>Сохранить</Button>
      </div>
    </>
  );
}

function DistanceTab({ cityId, items, onReload }: { cityId: number; items: DistanceCoefficient[]; onReload: () => void }) {
  const add = async () => {
    await apiClient.post(`/delivery-settings/${cityId}/distance-coefficients`, { maxDistanceKm: 0, coefficient: 1.0 });
    onReload();
  };
  const update = async (id: number, field: string, value: string) => {
    await apiClient.patch(`/delivery-settings/distance-coefficients/${id}`, { [field]: parseFloat(value) });
    onReload();
  };
  const remove = async (id: number) => {
    await apiClient.delete(`/delivery-settings/distance-coefficients/${id}`);
    onReload();
  };
  return (
    <>
      <h3 className="section-title">Коэффициенты удалённости (K<sub>dist</sub>)</h3>
      <table className="editable-table">
        <thead><tr><th>До км</th><th>Коэффициент</th><th></th></tr></thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id}>
              <td><input defaultValue={it.maxDistanceKm} onBlur={e => update(it.id, 'maxDistanceKm', e.target.value)} /></td>
              <td><input defaultValue={it.coefficient} onBlur={e => update(it.id, 'coefficient', e.target.value)} /></td>
              <td><button className="del-btn" onClick={() => remove(it.id)}><Trash2 size={14} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button variant="ghost" size="sm" onClick={add} icon={<Plus size={14} />} className="add-row-btn">Добавить</Button>
    </>
  );
}

function VehiclesTab({ cityId, items, onReload }: { cityId: number; items: VehicleCategory[]; onReload: () => void }) {
  const add = async () => {
    await apiClient.post(`/delivery-settings/${cityId}/vehicle-categories`, { maxWeight: 0, maxVolume: 0, kWeight: 1.0 });
    onReload();
  };
  const update = async (id: number, field: string, value: string) => {
    await apiClient.patch(`/delivery-settings/vehicle-categories/${id}`, { [field]: parseFloat(value) });
    onReload();
  };
  const remove = async (id: number) => {
    await apiClient.delete(`/delivery-settings/vehicle-categories/${id}`);
    onReload();
  };
  return (
    <>
      <h3 className="section-title">Категории машин (K<sub>weight</sub>)</h3>
      <table className="editable-table">
        <thead><tr><th>Макс. вес (кг)</th><th>Макс. объём (м³)</th><th>K<sub>weight</sub></th><th></th></tr></thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id}>
              <td><input defaultValue={it.maxWeight} onBlur={e => update(it.id, 'maxWeight', e.target.value)} /></td>
              <td><input defaultValue={it.maxVolume} onBlur={e => update(it.id, 'maxVolume', e.target.value)} /></td>
              <td><input defaultValue={it.kWeight} onBlur={e => update(it.id, 'kWeight', e.target.value)} /></td>
              <td><button className="del-btn" onClick={() => remove(it.id)}><Trash2 size={14} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button variant="ghost" size="sm" onClick={add} icon={<Plus size={14} />} className="add-row-btn">Добавить</Button>
    </>
  );
}

function DiscountsTab({ cityId, items, onReload }: { cityId: number; items: ClientDiscount[]; onReload: () => void }) {
  const add = async () => {
    await apiClient.post(`/delivery-settings/${cityId}/client-discounts`, { clientType: 'standard', minOrderAmount: 0, discountPercent: 0 });
    onReload();
  };
  const update = async (id: number, field: string, value: string) => {
    const v = field === 'clientType' ? value : parseFloat(value);
    await apiClient.patch(`/delivery-settings/client-discounts/${id}`, { [field]: v });
    onReload();
  };
  const remove = async (id: number) => {
    await apiClient.delete(`/delivery-settings/client-discounts/${id}`);
    onReload();
  };
  return (
    <>
      <h3 className="section-title">Скидки по типам клиентов (D<sub>client</sub>)</h3>
      <table className="editable-table">
        <thead><tr><th>Тип</th><th>Мин. сумма (₽)</th><th>Макс. вес (кг)</th><th>Скидка (%)</th><th></th></tr></thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id}>
              <td>
                <select defaultValue={it.clientType} onChange={e => update(it.id, 'clientType', e.target.value)} style={{ padding: '6px 8px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', color: 'var(--text)', fontSize: '0.8125rem' }}>
                  <option value="standard">standard</option>
                  <option value="vip">vip</option>
                  <option value="wholesale">wholesale</option>
                  <option value="partner">partner</option>
                </select>
              </td>
              <td><input defaultValue={it.minOrderAmount} onBlur={e => update(it.id, 'minOrderAmount', e.target.value)} /></td>
              <td><input defaultValue={it.maxOrderWeight ?? ''} onBlur={e => update(it.id, 'maxOrderWeight', e.target.value)} /></td>
              <td><input defaultValue={it.discountPercent} onBlur={e => update(it.id, 'discountPercent', e.target.value)} /></td>
              <td><button className="del-btn" onClick={() => remove(it.id)}><Trash2 size={14} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button variant="ghost" size="sm" onClick={add} icon={<Plus size={14} />} className="add-row-btn">Добавить</Button>
    </>
  );
}

function LiftingTab({ tariff, onSave, saving }: any) {
  const [f, setF] = useState({ ...tariff });
  const up = (k: string, v: string) => setF((prev: any) => ({ ...prev, [k]: v }));
  const fields = [
    { key: 'weightStepKg', label: 'Шаг тарификации (кг)' },
    { key: 'pMinToElevator', label: 'Мин. стоимость подноса к подъезду (₽)' },
    { key: 'pMinFromElevatorToRoom', label: 'Мин. стоимость подъёма на этаж (₽)' },
    { key: 'pToElevator', label: 'Стоимость подноса за ед. веса (₽)' },
    { key: 'pFromElevatorToRoom', label: 'Стоимость подъёма за ед. веса (₽)' },
    { key: 'pFloor', label: 'Доплата за этаж без лифта (₽/ед.)' },
    { key: 'maxElevatorItemLengthMm', label: 'Макс. длина товара для лифта (мм)' },
  ];
  return (
    <>
      <h3 className="section-title">Тарифы подъёма</h3>
      <div className="settings-grid">
        {fields.map(fi => (
          <div key={fi.key} className="setting-field">
            <label className="setting-label">{fi.label}</label>
            <input className="setting-input" value={f[fi.key]} onChange={e => up(fi.key, e.target.value)} />
          </div>
        ))}
      </div>
      <div className="save-bar">
        <Button variant="primary" onClick={() => onSave(f)} loading={saving} icon={<Save size={16} />}>Сохранить</Button>
      </div>
    </>
  );
}

