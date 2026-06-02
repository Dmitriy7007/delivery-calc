import React, { useEffect, useState, useRef, useCallback } from 'react';
import { apiClient } from '@/shared/api/client';
import { useCity } from '@/shared/lib/cityContext';
import type { Product, DeliveryResult } from '@/shared/types';
import { Button, Input } from '@/shared/ui';
import { Calculator, Truck, Clock, Zap, CalendarDays, AlertTriangle, MapPin, Package, Search } from 'lucide-react';

interface CartLine { productId: number; quantity: number; product: Product; }
interface Suggestion { title: string; subtitle: string; uri: string; }

export const CalculatorPage: React.FC = () => {
  const { currentCityId } = useCity();
  const [products, setProducts] = useState<Product[]>([]);
  const [address, setAddress] = useState('');
  const [clientType, setClientType] = useState('standard');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [result, setResult] = useState<DeliveryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Suggest state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiClient.get('/products').then(r => setProducts(r.data));
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddress(val);

    if (suggestTimer.current) clearTimeout(suggestTimer.current);

    if (val.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    suggestTimer.current = setTimeout(async () => {
      try {
        const res = await apiClient.get('/geocoding/suggest', { params: { query: val } });
        setSuggestions(res.data || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }, []);

  const selectSuggestion = (s: Suggestion) => {
    setAddress(s.title + (s.subtitle ? ', ' + s.subtitle : ''));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(c => c.productId === product.id);
    if (existing) {
      setCart(cart.map(c => c.productId === product.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { productId: product.id, quantity: 1, product }]);
    }
  };

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter(c => c.productId !== productId));
    } else {
      setCart(cart.map(c => c.productId === productId ? { ...c, quantity: qty } : c));
    }
  };

  const calculate = async () => {
    if (!address || !currentCityId) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/delivery/calculate', {
        address,
        cityId: currentCityId,
        clientType,
        cart: cart.map(c => ({ productId: c.productId, quantity: c.quantity })),
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка расчёта');
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = cart.reduce((sum, c) => sum + Number(c.product.price) * c.quantity, 0);
  const cartWeight = cart.reduce((sum, c) => sum + Number(c.product.weight) * c.quantity, 0);

  return (
    <div className="calc-page">
      <div className="page-header">
        <h1 className="page-title">Калькулятор доставки</h1>
      </div>

      <div className="calc-layout">
        {/* Left: Input */}
        <div className="calc-input">
          <div className="calc-section">
            <h3 className="calc-section-title"><MapPin size={16} /> Адрес доставки</h3>
            <div className="suggest-wrapper" ref={suggestRef}>
              <Input
                label="Адрес"
                value={address}
                onChange={handleAddressChange}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Введите адрес доставки..."
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggest-dropdown">
                  {suggestions.map((s, i) => (
                    <button key={i} className="suggest-item" onClick={() => selectSuggestion(s)}>
                      <span className="suggest-title">{s.title}</span>
                      {s.subtitle && <span className="suggest-subtitle">{s.subtitle}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="calc-section">
            <h3 className="calc-section-title"><Package size={16} /> Корзина</h3>
            <div className="product-picker">
              {products.map(p => (
                <button key={p.id} className="product-chip" onClick={() => addToCart(p)} title={`${p.name} — ${Number(p.weight)} кг, ${Number(p.price).toLocaleString()} ₽`}>
                  <span className="product-chip__sku">{p.sku}</span>
                  <span className="product-chip__name">{p.name.substring(0, 25)}</span>
                </button>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="cart-items">
                {cart.map(c => (
                  <div key={c.productId} className="cart-item">
                    <span className="cart-item__name">{c.product.name}</span>
                    <div className="cart-item__qty">
                      <button onClick={() => updateQty(c.productId, c.quantity - 1)}>−</button>
                      <span>{c.quantity}</span>
                      <button onClick={() => updateQty(c.productId, c.quantity + 1)}>+</button>
                    </div>
                    <span className="cart-item__price">{(Number(c.product.price) * c.quantity).toLocaleString()} ₽</span>
                  </div>
                ))}
                <div className="cart-totals">
                  <span>Итого: <strong>{cartTotal.toLocaleString()} ₽</strong></span>
                  <span>Вес: <strong>{cartWeight.toFixed(1)} кг</strong></span>
                </div>
              </div>
            )}
          </div>

          <div className="calc-section">
            <h3 className="calc-section-title">Тип клиента</h3>
            <div className="client-types">
              {['standard', 'vip', 'wholesale', 'partner'].map(t => (
                <button key={t} className={`client-btn ${clientType === t ? 'client-btn--active' : ''}`} onClick={() => setClientType(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Button variant="primary" onClick={calculate} loading={loading} icon={<Calculator size={16} />} style={{ width: '100%' }}>
            Рассчитать доставку
          </Button>
          {error && <p className="calc-error">{error}</p>}
        </div>

        {/* Right: Result */}
        <div className="calc-result">
          {!result ? (
            <div className="calc-empty">
              <Search size={48} strokeWidth={1} />
              <p>Введите адрес и добавьте товары для расчёта</p>
            </div>
          ) : result.error ? (
            <div className="calc-empty"><AlertTriangle size={48} /><p>{result.error}</p></div>
          ) : result.manualCalculation ? (
            <div className="calc-empty"><AlertTriangle size={48} color="var(--orange)" /><p>{'Расстояние > 200 км — ручной расчёт'}</p></div>
          ) : (
            <>
              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="result-warnings">
                  {result.warnings.map((w, i) => (
                    <div key={i} className="warning-item"><AlertTriangle size={14} /> {w}</div>
                  ))}
                </div>
              )}

              {/* Route info */}
              <div className="result-route">
                <div className="route-point">
                  <span className="route-dot route-dot--store"></span>
                  <div>
                    <div className="route-label">Ближайшая ТТ</div>
                    <div className="route-value">{result.nearestStore.name}</div>
                  </div>
                </div>
                <div className="route-line">
                  <span className="route-distance">{result.distanceKm} км</span>
                  {result.durationMinutes && (
                    <span className="route-duration">≈ {result.durationMinutes} мин</span>
                  )}
                </div>
                <div className="route-point">
                  <span className="route-dot route-dot--client"></span>
                  <div>
                    <div className="route-label">Адрес доставки</div>
                    <div className="route-value">{result.address.formatted}</div>
                  </div>
                </div>
                <span className={`route-badge ${result.isInsideCity ? 'route-badge--in' : 'route-badge--out'}`}>
                  {result.isInsideCity ? 'В черте города' : 'За городом'}
                </span>
              </div>

              {/* Coefficients */}
              <div className="result-coefficients">
                <h3 className="section-title">Коэффициенты</h3>
                <div className="coeff-grid">
                  <div className="coeff"><span className="coeff-label">P<sub>km</sub></span><span className="coeff-val">{result.coefficients.pricePerKm} ₽</span></div>
                  <div className="coeff"><span className="coeff-label">K<sub>dist</sub></span><span className="coeff-val">{result.coefficients.kDist}</span></div>
                  <div className="coeff"><span className="coeff-label">K<sub>weight</sub></span><span className="coeff-val">{result.coefficients.kWeight}</span></div>
                  <div className="coeff"><span className="coeff-label">D<sub>client</sub></span><span className="coeff-val">{result.coefficients.dClientType}</span></div>
                  <div className="coeff"><span className="coeff-label">K<sub>collect</sub></span><span className="coeff-val">{result.coefficients.kCollect}</span></div>
                  <div className="coeff"><span className="coeff-label">P<sub>min</sub></span><span className="coeff-val">{result.coefficients.pWeightMin} ₽</span></div>
                </div>
                <div className="formula-display">
                  P = {result.coefficients.pricePerKm} × {result.distanceKm} × {result.coefficients.kDist} × {result.coefficients.kWeight} × {result.coefficients.dClientType} × {result.coefficients.kCollect} = <strong>{result.delivery.standard.price} ₽</strong>
                </div>
              </div>

              {/* Delivery types */}
              <div className="delivery-cards">
                <DeliveryCard icon={<Truck size={20} />} title="Стандартная" price={result.delivery.standard.finalPrice} available={true} subtitle={`мин. ${result.delivery.standard.minPrice} ₽`} color="var(--green)" />
                <DeliveryCard icon={<Clock size={20} />} title="День в день" price={result.delivery.dayInDay.price} available={result.delivery.dayInDay.available} reason={result.delivery.dayInDay.reason} color="var(--blue)" />
                <DeliveryCard icon={<CalendarDays size={20} />} title="Точно ко времени" price={result.delivery.exactTime.price} available={result.delivery.exactTime.available} reason={result.delivery.exactTime.reason} color="var(--purple)" />
                <DeliveryCard icon={<Zap size={20} />} title="Экспресс" price={result.delivery.express.price} available={result.delivery.express.available} reason={result.delivery.express.reason} subtitle={`${result.delivery.express.hours} часа`} color="var(--orange)" />
              </div>

              {/* Available dates */}
              {result.availableDates.length > 0 && (
                <div className="result-dates">
                  <h3 className="section-title">Доступные даты</h3>
                  <div className="dates-grid">
                    {result.availableDates.map(d => (
                      <div key={d.date} className="date-card">
                        <div className="date-card__date">{formatDateShort(d.date)}</div>
                        <div className="date-card__intervals">
                          {d.intervals.map((int, i) => <span key={i} className="date-card__interval">{int}</span>)}
                        </div>
                        <div className="date-card__slots">{d.slotsLeft} слотов (заглушка)</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .calc-page { padding: var(--space-lg); height: calc(100vh - var(--header-height)); overflow-y: auto; }
        .page-header { margin-bottom: var(--space-lg); }
        .page-title { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em; }
        .calc-layout { display: grid; grid-template-columns: 380px 1fr; gap: var(--space-lg); align-items: start; }
        @media (max-width: 900px) { .calc-layout { grid-template-columns: 1fr; } }
        .calc-input { display: flex; flex-direction: column; gap: var(--space-md); }
        .calc-section { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: var(--space-lg); }
        .calc-section-title { font-size: 0.8125rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .product-picker { display: flex; flex-wrap: wrap; gap: 4px; max-height: 180px; overflow-y: auto; padding: 4px 0; }
        .product-chip { display: flex; flex-direction: column; align-items: flex-start; padding: 6px 10px; border: 1px solid var(--line); border-radius: 6px; background: var(--bg); cursor: pointer; transition: all var(--transition-fast); text-align: left; }
        .product-chip:hover { border-color: var(--blue); background: var(--blue-soft); }
        .product-chip__sku { font-size: 0.5625rem; font-family: monospace; color: var(--cyan); }
        .product-chip__name { font-size: 0.6875rem; color: var(--text-secondary); line-height: 1.2; }
        .cart-items { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; }
        .cart-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: var(--bg); border-radius: var(--radius-sm); }
        .cart-item__name { flex: 1; font-size: 0.75rem; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cart-item__qty { display: flex; align-items: center; gap: 6px; }
        .cart-item__qty button { width: 22px; height: 22px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface); color: var(--text); cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; }
        .cart-item__qty span { font-size: 0.8125rem; font-weight: 700; min-width: 20px; text-align: center; }
        .cart-item__price { font-size: 0.75rem; font-weight: 600; color: var(--green); white-space: nowrap; }
        .cart-totals { display: flex; justify-content: space-between; padding: 10px 0; border-top: 1px solid var(--line); margin-top: 6px; font-size: 0.8125rem; color: var(--text-secondary); }
        .client-types { display: flex; gap: 4px; }
        .client-btn { padding: 6px 14px; border: 1px solid var(--line); border-radius: 6px; background: var(--bg); color: var(--text-muted); cursor: pointer; font-size: 0.75rem; font-weight: 600; transition: all var(--transition-fast); text-transform: uppercase; }
        .client-btn:hover { border-color: var(--blue); }
        .client-btn--active { background: var(--blue-soft); border-color: var(--blue); color: var(--cyan); }
        .calc-error { color: var(--red); font-size: 0.8125rem; margin-top: 8px; }
        .suggest-wrapper { position: relative; }
        .suggest-dropdown {
          position: absolute; top: 100%; left: 0; right: 0; z-index: 50;
          background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-sm);
          margin-top: 4px; max-height: 260px; overflow-y: auto;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .suggest-item {
          display: flex; flex-direction: column; gap: 2px; width: 100%; padding: 10px 14px;
          border: none; background: transparent; color: var(--text); cursor: pointer;
          text-align: left; font-size: 0.8125rem; border-bottom: 1px solid var(--line);
          transition: background var(--transition-fast);
        }
        .suggest-item:last-child { border-bottom: none; }
        .suggest-item:hover { background: var(--blue-soft); }
        .suggest-title { font-weight: 600; }
        .suggest-subtitle { font-size: 0.6875rem; color: var(--text-muted); }
        .calc-result { min-height: 400px; }
        .calc-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; color: var(--text-muted); gap: 16px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); }
        .calc-empty p { font-size: 0.875rem; }
        .result-warnings { display: flex; flex-direction: column; gap: 6px; margin-bottom: var(--space-md); }
        .warning-item { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: var(--orange-soft); color: var(--orange); border-radius: var(--radius-sm); font-size: 0.8125rem; font-weight: 500; }
        .result-route { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-md); position: relative; }
        .route-point { display: flex; align-items: center; gap: 12px; }
        .route-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
        .route-dot--store { background: var(--green); box-shadow: 0 0 8px var(--green); }
        .route-dot--client { background: var(--blue); box-shadow: 0 0 8px var(--blue); }
        .route-label { font-size: 0.6875rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .route-value { font-size: 0.875rem; font-weight: 600; margin-top: 2px; }
        .route-line { display: flex; align-items: center; justify-content: center; padding: 8px 0 8px 6px; border-left: 2px dashed var(--line); margin-left: 5px; }
        .route-distance { padding: 2px 10px; background: var(--surface-2); border-radius: 10px; font-size: 0.75rem; font-weight: 700; color: var(--cyan); }
        .route-duration { padding: 2px 10px; background: var(--surface-2); border-radius: 10px; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
        .route-badge { position: absolute; top: 12px; right: 12px; padding: 3px 10px; border-radius: 10px; font-size: 0.625rem; font-weight: 700; }
        .route-badge--in { background: var(--green-soft); color: var(--green); }
        .route-badge--out { background: var(--orange-soft); color: var(--orange); }
        .result-coefficients { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-md); }
        .section-title { font-size: 0.8125rem; font-weight: 700; margin-bottom: 12px; }
        .coeff-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; margin-bottom: 12px; }
        .coeff { padding: 8px 12px; background: var(--bg); border-radius: var(--radius-sm); display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .coeff-label { font-size: 0.6875rem; color: var(--text-muted); }
        .coeff-val { font-size: 1rem; font-weight: 700; color: var(--cyan); font-variant-numeric: tabular-nums; }
        .formula-display { padding: 10px 14px; background: var(--bg); border-radius: var(--radius-sm); font-size: 0.8125rem; color: var(--text-secondary); font-family: monospace; line-height: 1.6; }
        .formula-display strong { color: var(--green); font-size: 1rem; }
        .delivery-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-md); }
        .result-dates { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: var(--space-lg); }
        .dates-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; }
        .date-card { padding: 10px 14px; background: var(--bg); border: 1px solid var(--line); border-radius: var(--radius-sm); }
        .date-card__date { font-weight: 700; font-size: 0.875rem; margin-bottom: 6px; }
        .date-card__intervals { display: flex; flex-direction: column; gap: 2px; }
        .date-card__interval { font-size: 0.6875rem; color: var(--text-secondary); }
        .date-card__slots { font-size: 0.625rem; color: var(--text-muted); margin-top: 6px; }
      `}</style>
    </div>
  );
};

function DeliveryCard({ icon, title, price, available, reason, subtitle, color }: {
  icon: React.ReactNode; title: string; price: number; available: boolean;
  reason?: string | null; subtitle?: string; color: string;
}) {
  return (
    <div className={`delivery-card ${!available ? 'delivery-card--disabled' : ''}`}>
      <div className="delivery-card__icon" style={{ color, background: `${color}18` }}>{icon}</div>
      <div className="delivery-card__title">{title}</div>
      {available ? (
        <div className="delivery-card__price" style={{ color }}>{price.toLocaleString()} ₽</div>
      ) : (
        <div className="delivery-card__unavailable">Недоступно</div>
      )}
      {subtitle && available && <div className="delivery-card__sub">{subtitle}</div>}
      {reason && !available && <div className="delivery-card__reason">{reason}</div>}
      <style>{`
        .delivery-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; transition: all var(--transition-fast); }
        .delivery-card:hover { border-color: var(--line-bright); transform: translateY(-1px); }
        .delivery-card--disabled { opacity: 0.5; }
        .delivery-card__icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
        .delivery-card__title { font-size: 0.8125rem; font-weight: 600; margin-bottom: 6px; }
        .delivery-card__price { font-size: 1.5rem; font-weight: 800; }
        .delivery-card__unavailable { font-size: 0.8125rem; color: var(--text-muted); }
        .delivery-card__sub { font-size: 0.6875rem; color: var(--text-muted); margin-top: 4px; }
        .delivery-card__reason { font-size: 0.6875rem; color: var(--orange); margin-top: 4px; }
      `}</style>
    </div>
  );
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}
