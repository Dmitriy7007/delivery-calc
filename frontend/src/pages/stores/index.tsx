import React, { useEffect, useState } from 'react';
import { apiClient } from '@/shared/api/client';
import { useCity } from '@/shared/lib/cityContext';
import type { Store as StoreType } from '@/shared/types';
import { Button, Input, Modal } from '@/shared/ui';
import { Plus, Pencil, Trash2, Store as StoreIcon, Warehouse } from 'lucide-react';

export const StoresPage: React.FC = () => {
  const { currentCityId } = useCity();
  const [stores, setStores] = useState<StoreType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<StoreType | null>(null);
  const [form, setForm] = useState({ name: '', address: '', lng: '', lat: '', type: 'store', workHoursFrom: '09:00', workHoursTo: '20:00' });

  const load = async () => {
    if (!currentCityId) return;
    const res = await apiClient.get(`/stores?cityId=${currentCityId}`);
    setStores(res.data);
  };

  useEffect(() => { load(); }, [currentCityId]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', address: '', lng: '', lat: '', type: 'store', workHoursFrom: '09:00', workHoursTo: '20:00' });
    setShowModal(true);
  };

  const openEdit = (store: StoreType) => {
    setEditing(store);
    setForm({
      name: store.name, address: store.address,
      lng: String(store.lng), lat: String(store.lat),
      type: store.type, workHoursFrom: store.workHoursFrom, workHoursTo: store.workHoursTo,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const payload = { ...form, lng: parseFloat(form.lng), lat: parseFloat(form.lat), cityId: currentCityId };
    if (editing) {
      await apiClient.patch(`/stores/${editing.id}`, payload);
    } else {
      await apiClient.post('/stores', payload);
    }
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить ТТ?')) return;
    await apiClient.delete(`/stores/${id}`);
    load();
  };

  return (
    <div className="stores-page">
      <div className="page-header">
        <h1 className="page-title">Торговые точки</h1>
        <Button variant="primary" onClick={openCreate} icon={<Plus size={16} />}>Добавить ТТ</Button>
      </div>

      <div className="stores-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Тип</th>
              <th>Название</th>
              <th>Адрес</th>
              <th>Координаты</th>
              <th>Часы работы</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {stores.map(store => (
              <tr key={store.id}>
                <td>
                  <span className="store-type-badge" style={{
                    background: store.type === 'warehouse' ? 'var(--orange-soft)' : 'var(--green-soft)',
                    color: store.type === 'warehouse' ? 'var(--orange)' : 'var(--green)',
                  }}>
                    {store.type === 'warehouse' ? <Warehouse size={12} /> : <StoreIcon size={12} />}
                    {store.type === 'warehouse' ? 'Склад' : 'Магазин'}
                  </span>
                </td>
                <td className="td-name">{store.name}</td>
                <td className="td-address">{store.address}</td>
                <td className="td-coords">{store.lat.toFixed(4)}, {store.lng.toFixed(4)}</td>
                <td>{store.workHoursFrom} — {store.workHoursTo}</td>
                <td>
                  <div className="table-actions">
                    <button className="icon-btn" onClick={() => openEdit(store)}><Pencil size={14} /></button>
                    <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(store.id)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {stores.length === 0 && (
              <tr><td colSpan={6} className="td-empty">Нет торговых точек</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Редактировать ТТ' : 'Новая ТТ'}>
        <div className="form-stack">
          <Input label="Название" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Адрес" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          <div className="form-row">
            <Input label="Долгота (lng)" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} />
            <Input label="Широта (lat)" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Тип</label>
              <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="store">Магазин</option>
                <option value="warehouse">Склад</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <Input label="Время с" value={form.workHoursFrom} onChange={e => setForm(f => ({ ...f, workHoursFrom: e.target.value }))} />
            <Input label="Время до" value={form.workHoursTo} onChange={e => setForm(f => ({ ...f, workHoursTo: e.target.value }))} />
          </div>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Отмена</Button>
            <Button variant="primary" onClick={handleSave}>Сохранить</Button>
          </div>
        </div>
      </Modal>

      <style>{`
        .stores-page { padding: var(--space-lg); }
        .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-xl); }
        .page-title { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em; }
        .stores-table-wrapper { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 12px 16px; text-align: left; font-size: 0.8125rem; border-bottom: 1px solid var(--line); }
        .data-table th { color: var(--text-muted); font-weight: 500; background: var(--bg); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .data-table tr:hover td { background: var(--surface-2); }
        .store-type-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 8px; border-radius: 8px; font-size: 0.6875rem; font-weight: 600;
        }
        .td-name { font-weight: 600; }
        .td-address { color: var(--text-secondary); max-width: 250px; }
        .td-coords { font-variant-numeric: tabular-nums; font-size: 0.75rem; color: var(--text-muted); }
        .td-empty { text-align: center; color: var(--text-muted); padding: 40px !important; }
        .table-actions { display: flex; gap: 4px; }
        .icon-btn { width: 28px; height: 28px; border: none; border-radius: 6px; background: var(--bg); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: all var(--transition-fast); }
        .icon-btn:hover { background: var(--surface-2); color: var(--text); }
        .icon-btn--danger:hover { background: var(--red-soft); color: var(--red); }
        .form-stack { display: flex; flex-direction: column; gap: 16px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
        .form-select { padding: 8px 12px; background: var(--bg); border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--text); font-size: 0.875rem; outline: none; }
        .form-select:focus { border-color: var(--blue); }
      `}</style>
    </div>
  );
};
