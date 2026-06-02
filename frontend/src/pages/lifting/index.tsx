import React, { useState } from 'react';
import { apiClient } from '@/shared/api/client';
import { useCity } from '@/shared/lib/cityContext';
import type { LiftingResult } from '@/shared/types';
import { Button, Input } from '@/shared/ui';
import { ArrowUpFromLine, Info } from 'lucide-react';

export const LiftingPage: React.FC = () => {
  const { currentCityId } = useCity();
  const [totalWeight, setTotalWeight] = useState('100');
  const [maxItemLengthMm, setMaxItemLengthMm] = useState('1500');
  const [floor, setFloor] = useState('5');
  const [hasElevator, setHasElevator] = useState(true);
  const [liftType, setLiftType] = useState<'to_entrance' | 'elevator' | 'manual'>('elevator');
  const [result, setResult] = useState<LiftingResult | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!currentCityId) return;
    setLoading(true);
    try {
      const res = await apiClient.post('/lifting/calculate', {
        cityId: currentCityId,
        totalWeight: parseFloat(totalWeight),
        maxItemLengthMm: parseInt(maxItemLengthMm),
        floor: parseInt(floor),
        hasElevator,
        liftType,
      });
      setResult(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lifting-page">
      <div className="page-header">
        <h1 className="page-title">Калькулятор подъёма</h1>
      </div>

      <div className="lifting-layout">
        <div className="lifting-input">
          <div className="lift-section">
            <h3 className="lift-section-title">Параметры груза</h3>
            <div className="lift-form">
              <div className="lift-field">
                <label>Общий вес (кг)</label>
                <input type="number" value={totalWeight} onChange={e => setTotalWeight(e.target.value)} />
              </div>
              <div className="lift-field">
                <label>Макс. длина товара (мм)</label>
                <input type="number" value={maxItemLengthMm} onChange={e => setMaxItemLengthMm(e.target.value)} />
              </div>
              <div className="lift-field">
                <label>Этаж</label>
                <input type="number" value={floor} onChange={e => setFloor(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="lift-section">
            <h3 className="lift-section-title">Наличие лифта</h3>
            <div className="lift-toggle">
              <button className={`lift-toggle-btn ${hasElevator ? 'lift-toggle-btn--active' : ''}`} onClick={() => setHasElevator(true)}>
                Есть лифт
              </button>
              <button className={`lift-toggle-btn ${!hasElevator ? 'lift-toggle-btn--active' : ''}`} onClick={() => setHasElevator(false)}>
                Нет лифта
              </button>
            </div>
          </div>

          <div className="lift-section">
            <h3 className="lift-section-title">Тип подъёма</h3>
            <div className="lift-types">
              {([
                { key: 'to_entrance' as const, label: 'До двери подъезда', desc: 'Без подъёма на этаж' },
                { key: 'elevator' as const, label: 'На лифте', desc: 'Подъём на лифте до квартиры' },
                { key: 'manual' as const, label: 'Без лифта (пешком)', desc: 'Ручной подъём по лестнице' },
              ]).map(t => (
                <button key={t.key} className={`lift-type ${liftType === t.key ? 'lift-type--active' : ''}`} onClick={() => setLiftType(t.key)}>
                  <span className="lift-type__label">{t.label}</span>
                  <span className="lift-type__desc">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <Button variant="primary" onClick={calculate} loading={loading} icon={<ArrowUpFromLine size={16} />} style={{ width: '100%' }}>
            Рассчитать подъём
          </Button>
        </div>

        <div className="lifting-result">
          {!result ? (
            <div className="lift-empty">
              <ArrowUpFromLine size={48} strokeWidth={1} />
              <p>Укажите параметры для расчёта подъёма</p>
            </div>
          ) : result.error ? (
            <div className="lift-empty"><p className="lift-error">{result.error}</p></div>
          ) : (
            <>
              <div className="lift-price-card">
                <div className="lift-price-label">Стоимость подъёма</div>
                <div className="lift-price-value">{result.price.toLocaleString()} ₽</div>
                <div className="lift-price-type">
                  {result.effectiveLiftType === 'to_entrance' && 'До двери подъезда'}
                  {result.effectiveLiftType === 'elevator' && 'На лифте'}
                  {result.effectiveLiftType === 'manual' && 'Без лифта (пешком)'}
                </div>
              </div>

              {result.elevatorBlocked && (
                <div className="lift-warning">
                  <Info size={16} /> Товар длиннее {result.tariff.maxElevatorItemLengthMm} мм — лифт недоступен, расчёт для ручного подъёма
                </div>
              )}

              <div className="lift-breakdown">
                <h3>Расшифровка</h3>
                <div className="breakdown-items">
                  <div className="breakdown-item">
                    <span>Единиц тарификации (N)</span>
                    <span className="breakdown-val">{result.nWeightCategory} × {result.weightStepKg} кг</span>
                  </div>
                  {result.breakdown.map((b, i) => (
                    <div key={i} className="breakdown-item">
                      <span>{b.label}</span>
                      <span className="breakdown-val">{b.value.toLocaleString()} ₽</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lift-formula-block">
                <h3>Формула</h3>
                <div className="lift-formula">{result.formula}</div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .lifting-page { padding: var(--space-lg); }
        .page-header { margin-bottom: var(--space-lg); }
        .page-title { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em; }
        .lifting-layout { display: grid; grid-template-columns: 380px 1fr; gap: var(--space-lg); align-items: start; }
        @media (max-width: 900px) { .lifting-layout { grid-template-columns: 1fr; } }
        .lifting-input { display: flex; flex-direction: column; gap: var(--space-md); }
        .lift-section { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: var(--space-lg); }
        .lift-section-title { font-size: 0.8125rem; font-weight: 700; margin-bottom: 14px; }
        .lift-form { display: flex; flex-direction: column; gap: 14px; }
        .lift-field { display: flex; flex-direction: column; gap: 6px; }
        .lift-field label { font-size: 0.6875rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .lift-field input { padding: 9px 12px; background: var(--bg); border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--text); font-size: 0.875rem; outline: none; }
        .lift-field input:focus { border-color: var(--blue); }
        .lift-toggle { display: flex; gap: 4px; }
        .lift-toggle-btn { flex: 1; padding: 10px; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--bg); color: var(--text-muted); cursor: pointer; font-size: 0.8125rem; font-weight: 600; transition: all var(--transition-fast); }
        .lift-toggle-btn--active { background: var(--blue-soft); border-color: var(--blue); color: var(--cyan); }
        .lift-types { display: flex; flex-direction: column; gap: 6px; }
        .lift-type { padding: 12px 14px; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--bg); cursor: pointer; text-align: left; transition: all var(--transition-fast); display: flex; flex-direction: column; gap: 2px; }
        .lift-type:hover { border-color: var(--blue); }
        .lift-type--active { background: var(--blue-soft); border-color: var(--blue); }
        .lift-type__label { font-size: 0.8125rem; font-weight: 600; color: var(--text); }
        .lift-type__desc { font-size: 0.6875rem; color: var(--text-muted); }
        .lifting-result { min-height: 400px; }
        .lift-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; color: var(--text-muted); gap: 16px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); }
        .lift-error { color: var(--red); }
        .lift-price-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: var(--space-xl); text-align: center; margin-bottom: var(--space-md); }
        .lift-price-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
        .lift-price-value { font-size: 2.5rem; font-weight: 800; color: var(--green); line-height: 1; }
        .lift-price-type { font-size: 0.875rem; color: var(--text-secondary); margin-top: 8px; }
        .lift-warning { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: var(--orange-soft); color: var(--orange); border-radius: var(--radius-sm); font-size: 0.8125rem; margin-bottom: var(--space-md); }
        .lift-breakdown { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-md); }
        .lift-breakdown h3 { font-size: 0.8125rem; font-weight: 700; margin-bottom: 12px; }
        .breakdown-items { display: flex; flex-direction: column; gap: 8px; }
        .breakdown-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg); border-radius: var(--radius-sm); font-size: 0.8125rem; }
        .breakdown-val { font-weight: 700; color: var(--cyan); font-variant-numeric: tabular-nums; }
        .lift-formula-block { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: var(--space-lg); }
        .lift-formula-block h3 { font-size: 0.8125rem; font-weight: 700; margin-bottom: 12px; }
        .lift-formula { padding: 12px 16px; background: var(--bg); border-radius: var(--radius-sm); font-family: monospace; font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.6; }
      `}</style>
    </div>
  );
};
