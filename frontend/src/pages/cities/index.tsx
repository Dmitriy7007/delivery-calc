import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/shared/api/client';
import { cityBoundariesApi } from '@/shared/api/cityBoundariesApi';
import { useCity } from '@/shared/lib/cityContext';
import type { City, CityBoundary, Zone } from '@/shared/types';
import { Button, Input, Modal } from '@/shared/ui';
import { ZoneMap } from '@/widgets/zone-map';
import { DrawingToolbar } from '@/features/draw-zone';
import { useDrawing } from '@/features/draw-zone/model/useDrawing';
import { Plus, Pencil, Trash2, MapPin, Map, X } from 'lucide-react';
import type { Polygon } from 'geojson';

export const CitiesPage: React.FC = () => {
  const { selectedCity, refreshCities, setSelectedCity } = useCity();
  const [cities, setCities] = useState<City[]>([]);
  const [boundaries, setBoundaries] = useState<CityBoundary[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<City | null>(null);
  const [form, setForm] = useState({ name: '', geocenterLng: '', geocenterLat: '', defaultZoom: '12' });
  const [saving, setSaving] = useState(false);

  // Boundary editing state
  const [editingBoundaryCity, setEditingBoundaryCity] = useState<City | null>(null);
  const [existingBoundary, setExistingBoundary] = useState<CityBoundary | null>(null);

  const drawing = useDrawing();

  const loadCities = async () => {
    const res = await apiClient.get('/cities');
    setCities(res.data);
  };

  const loadBoundaries = async () => {
    const res = await apiClient.get('/city-boundaries');
    setBoundaries(res.data);
  };

  useEffect(() => {
    loadCities();
    loadBoundaries();
  }, []);

  // === City CRUD ===
  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', geocenterLng: '', geocenterLat: '', defaultZoom: '12' });
    setShowModal(true);
  };

  const openEdit = (city: City) => {
    setEditing(city);
    setForm({
      name: city.name,
      geocenterLng: String(city.geocenterLng),
      geocenterLat: String(city.geocenterLat),
      defaultZoom: String(city.defaultZoom),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const payload = {
      name: form.name,
      geocenterLng: parseFloat(form.geocenterLng),
      geocenterLat: parseFloat(form.geocenterLat),
      defaultZoom: parseInt(form.defaultZoom),
    };
    if (editing) {
      await apiClient.patch(`/cities/${editing.id}`, payload);
    } else {
      await apiClient.post('/cities', payload);
    }
    setShowModal(false);
    loadCities();
    refreshCities();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить город?')) return;
    await apiClient.delete(`/cities/${id}`);
    loadCities();
    refreshCities();
  };

  // === Boundary editing ===
  const startEditBoundary = (city: City) => {
    const boundary = boundaries.find(b => b.cityId === city.id);
    setEditingBoundaryCity(city);
    setExistingBoundary(boundary || null);

    if (boundary && boundary.polygon?.coordinates?.[0]) {
      const coords = boundary.polygon.coordinates[0].map(
        (c: number[]) => [c[0], c[1]] as [number, number]
      );
      // Remove closing point
      if (coords.length > 1 && coords[0][0] === coords[coords.length - 1][0] && coords[0][1] === coords[coords.length - 1][1]) {
        coords.pop();
      }
      drawing.loadCoords(coords);
    } else {
      drawing.startDrawing();
    }
  };

  const cancelEditBoundary = () => {
    setEditingBoundaryCity(null);
    setExistingBoundary(null);
    drawing.cancelDrawing();
  };

  const saveBoundary = async () => {
    if (!editingBoundaryCity || drawing.coords.length < 3) return;
    setSaving(true);
    try {
      const ring = [...drawing.coords, drawing.coords[0]];
      const polygon: Polygon = { type: 'Polygon', coordinates: [ring] };

      if (existingBoundary) {
        await cityBoundariesApi.update(existingBoundary.id, { polygon });
      } else {
        await cityBoundariesApi.create({ cityId: editingBoundaryCity.id, polygon, color: '#4fc3f7' });
      }
      loadBoundaries();
      setEditingBoundaryCity(null);
      setExistingBoundary(null);
      drawing.cancelDrawing();
    } catch (err) {
      console.error('Failed to save boundary:', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteBoundary = async (cityId: number) => {
    const boundary = boundaries.find(b => b.cityId === cityId);
    if (!boundary) return;
    if (!confirm('Удалить контур города?')) return;
    await cityBoundariesApi.remove(boundary.id);
    loadBoundaries();
  };

  const getBoundary = (cityId: number) => boundaries.find(b => b.cityId === cityId);

  // Convert boundaries to Zone-like objects for ZoneMap compatibility
  // Filter by selected city if no boundary is being edited
  const filteredBoundaries = selectedCity
    ? boundaries.filter(b => b.cityId === selectedCity.id)
    : boundaries;

  const boundaryZones: Zone[] = filteredBoundaries.map(b => ({
    id: b.id,
    name: 'Контур',
    price: 0,
    minOrderAmount: 0,
    deliveryTime: null,
    color: b.color || '#4fc3f7',
    polygon: b.polygon,
    isActive: b.isActive,
    cityId: b.cityId,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  }));

  // Map center
  const mapCity = editingBoundaryCity || selectedCity;
  const mapCenter: [number, number] | undefined = mapCity
    ? [mapCity.geocenterLng, mapCity.geocenterLat]
    : undefined;
  const mapZoom = mapCity?.defaultZoom;

  const isDrawingOrPreview = drawing.state === 'drawing' || drawing.state === 'preview';

  return (
    <div className="cities-page">
      <div className="page-header">
        <h1 className="page-title">Города и контуры</h1>
        <Button variant="primary" onClick={openCreate} icon={<Plus size={16} />}>Добавить город</Button>
      </div>

      <div className="cities-layout">
        {/* Left panel: city cards */}
        <div className="cities-list">
          {cities.map(city => {
            const boundary = getBoundary(city.id);
            const isEditing = editingBoundaryCity?.id === city.id;

            return (
              <div key={city.id}
                className={`city-card ${isEditing ? 'city-card--editing' : ''} ${selectedCity?.id === city.id ? 'city-card--selected' : ''}`}
                onClick={() => setSelectedCity(city)}
                style={{ cursor: 'pointer' }}
              >
                <div className="city-card__header">
                  <div className="city-card__icon" style={{
                    background: boundary ? 'var(--green-soft)' : 'var(--orange-soft)',
                  }}>
                    <MapPin size={18} color={boundary ? 'var(--green)' : 'var(--orange)'} />
                  </div>
                  <div className="city-card__info">
                    <h3 className="city-card__name">{city.name}</h3>
                    <p className="city-card__coords">{city.geocenterLat.toFixed(4)}, {city.geocenterLng.toFixed(4)}</p>
                  </div>
                  <div className="city-card__actions">
                    <button className="icon-btn" onClick={() => openEdit(city)} title="Редактировать">
                      <Pencil size={14} />
                    </button>
                    <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(city.id)} title="Удалить">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="city-card__footer">
                  <span className="city-card__badge" style={{
                    background: boundary ? 'var(--green-soft)' : 'var(--surface)',
                    color: boundary ? 'var(--green)' : 'var(--text-muted)',
                  }}>
                    {boundary ? '✓ Контур задан' : '○ Нет контура'}
                  </span>

                  <div className="city-card__map-actions">
                    {isEditing ? (
                      <Button size="sm" variant="ghost" onClick={cancelEditBoundary} icon={<X size={12} />}>
                        Отмена
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => startEditBoundary(city)} icon={<Map size={12} />}>
                          {boundary ? 'Редактировать' : 'Нарисовать'}
                        </Button>
                        {boundary && (
                          <button className="icon-btn icon-btn--danger" onClick={() => deleteBoundary(city.id)} title="Удалить контур">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right panel: map */}
        <div className="cities-map-container">
          {isDrawingOrPreview && (
            <div className="map-toolbar-wrapper">
              <DrawingToolbar
                state={drawing.state}
                pointCount={drawing.coords.length}
                metrics={drawing.metrics}
                canUndo={drawing.canUndo}
                canRedo={drawing.canRedo}
                isEditing={!!editingBoundaryCity}
                editingZoneName={editingBoundaryCity?.name}
                isSaving={saving}
                onStart={drawing.startDrawing}
                onUndo={drawing.undo}
                onRedo={drawing.redo}
                onFinish={drawing.finishDrawing}
                onCancel={cancelEditBoundary}
                onReset={drawing.resetDrawing}
                onSavePolygon={saveBoundary}
              />
            </div>
          )}
          <div className="cities-map">
            <ZoneMap
              key={`map-${mapCity?.id ?? 'default'}`}
              zones={editingBoundaryCity ? [] : boundaryZones}
              drawingCoords={isDrawingOrPreview ? drawing.coords : undefined}
              drawingColor="#4fc3f7"
              isDrawing={drawing.state === 'drawing'}
              onMapClick={drawing.addPoint}
              onPointUpdate={drawing.updatePoint}
              onPointRemove={drawing.removePoint}
              onPointInsert={drawing.insertPoint}
              mapCenter={mapCenter}
              mapZoom={mapZoom}
            />
          </div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Редактировать город' : 'Новый город'}>
        <div className="form-stack">
          <Input label="Название" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div className="form-row">
            <Input label="Долгота (lng)" value={form.geocenterLng} onChange={e => setForm(f => ({ ...f, geocenterLng: e.target.value }))} />
            <Input label="Широта (lat)" value={form.geocenterLat} onChange={e => setForm(f => ({ ...f, geocenterLat: e.target.value }))} />
          </div>
          <Input label="Zoom по умолчанию" value={form.defaultZoom} onChange={e => setForm(f => ({ ...f, defaultZoom: e.target.value }))} />
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Отмена</Button>
            <Button variant="primary" onClick={handleSave}>Сохранить</Button>
          </div>
        </div>
      </Modal>

      <style>{`
        .cities-page { padding: var(--space-lg); height: calc(100vh - var(--header-height)); display: flex; flex-direction: column; }
        .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-lg); flex-shrink: 0; }
        .page-title { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em; }
        .cities-layout { display: grid; grid-template-columns: 380px 1fr; gap: var(--space-lg); flex: 1; min-height: 0; }
        .cities-list { display: flex; flex-direction: column; gap: var(--space-sm); overflow-y: auto; padding-right: 4px; }
        .city-card {
          background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md);
          padding: var(--space-md); transition: all var(--transition-fast); flex-shrink: 0;
        }
        .city-card:hover { border-color: var(--line-bright); }
        .city-card--editing { border-color: var(--cyan); box-shadow: 0 0 12px var(--blue-soft); }
        .city-card--selected { border-color: var(--blue); background: var(--blue-soft); }
        .city-card__header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .city-card__icon {
          width: 36px; height: 36px; border-radius: var(--radius-sm);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .city-card__info { flex: 1; min-width: 0; }
        .city-card__name { font-size: 0.9375rem; font-weight: 700; }
        .city-card__coords { font-size: 0.6875rem; color: var(--text-muted); margin-top: 2px; font-variant-numeric: tabular-nums; }
        .city-card__actions { display: flex; gap: 4px; }
        .icon-btn {
          width: 28px; height: 28px; border: none; border-radius: 6px;
          background: var(--bg); cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: var(--text-muted); transition: all var(--transition-fast);
        }
        .icon-btn:hover { background: var(--surface-2); color: var(--text); }
        .icon-btn--danger:hover { background: var(--red-soft); color: var(--red); }
        .city-card__footer { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid var(--line); }
        .city-card__badge { padding: 3px 10px; border-radius: 12px; font-size: 0.625rem; font-weight: 600; }
        .city-card__map-actions { display: flex; align-items: center; gap: 4px; }
        .cities-map-container { display: flex; flex-direction: column; min-height: 0; position: relative; }
        .map-toolbar-wrapper { position: absolute; top: 12px; left: 12px; z-index: 10; }
        .cities-map { flex: 1; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--line); min-height: 500px; }
        .form-stack { display: flex; flex-direction: column; gap: 16px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
      `}</style>
    </div>
  );
};
