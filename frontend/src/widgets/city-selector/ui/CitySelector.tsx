import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapPin, Search, Plus, Loader2, ChevronRight, X } from 'lucide-react';
import { useCity } from '@/shared/lib/cityContext';
import { citiesApi } from '@/entities/city';
import { geocodingApi } from '@/entities/zone';
import type { City } from '@/shared/types';

// Top Russian cities with coordinates
const POPULAR_CITIES = [
  { name: 'Москва', geocenterLng: 37.6173, geocenterLat: 55.7558, defaultZoom: 11 },
  { name: 'Санкт-Петербург', geocenterLng: 30.3141, geocenterLat: 59.9386, defaultZoom: 11 },
  { name: 'Новосибирск', geocenterLng: 82.9195, geocenterLat: 54.9884, defaultZoom: 12 },
  { name: 'Екатеринбург', geocenterLng: 60.6122, geocenterLat: 56.8389, defaultZoom: 12 },
  { name: 'Казань', geocenterLng: 49.1066, geocenterLat: 55.7887, defaultZoom: 12 },
  { name: 'Челябинск', geocenterLng: 61.4291, geocenterLat: 55.1644, defaultZoom: 12 },
  { name: 'Красноярск', geocenterLng: 92.8932, geocenterLat: 56.0153, defaultZoom: 12 },
  { name: 'Новокузнецк', geocenterLng: 87.1152, geocenterLat: 53.7596, defaultZoom: 12 },
  { name: 'Уфа', geocenterLng: 55.9721, geocenterLat: 54.7388, defaultZoom: 12 },
  { name: 'Самара', geocenterLng: 50.1502, geocenterLat: 53.1959, defaultZoom: 12 },
  { name: 'Ростов-на-Дону', geocenterLng: 39.7015, geocenterLat: 47.2362, defaultZoom: 12 },
  { name: 'Краснодар', geocenterLng: 38.9769, geocenterLat: 45.0355, defaultZoom: 12 },
  { name: 'Воронеж', geocenterLng: 39.1843, geocenterLat: 51.6683, defaultZoom: 12 },
  { name: 'Пермь', geocenterLng: 56.2502, geocenterLat: 58.0105, defaultZoom: 12 },
  { name: 'Омск', geocenterLng: 73.3686, geocenterLat: 54.9885, defaultZoom: 12 },
];

interface Suggestion {
  title: string;
  subtitle: string;
}

export const CitySelector: React.FC = () => {
  const { isCitySelectorOpen, closeCitySelector, cities, selectedCity, setSelectedCity, refreshCities } = useCity();

  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [selectedSuggestIdx, setSelectedSuggestIdx] = useState(-1);
  const [addingCity, setAddingCity] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const suggestTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCitySelectorOpen) {
      setSearch('');
      setSuggestions([]);
      setAddError(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isCitySelectorOpen]);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setSuggestLoading(true);
    try {
      const data = await geocodingApi.suggest(query);
      setSuggestions(data);
      setSelectedSuggestIdx(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestLoading(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    setAddError(null);
    if (suggestTimeout.current) clearTimeout(suggestTimeout.current);
    suggestTimeout.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleAddCity = async (name: string, lng?: number, lat?: number) => {
    setAddingCity(true);
    setAddError(null);
    try {
      // If no coords — geocode via backend
      let geocenterLng = lng;
      let geocenterLat = lat;
      if (!geocenterLng || !geocenterLat) {
        const geo = await geocodingApi.geocode(name);
        geocenterLng = geo.lng;
        geocenterLat = geo.lat;
      }

      const city = await citiesApi.create({
        name,
        geocenterLng,
        geocenterLat,
        defaultZoom: 12,
      });
      await refreshCities();
      setSelectedCity(city);
      setSearch('');
      setSuggestions([]);
    } catch (err: any) {
      setAddError('Не удалось добавить город. Попробуйте ещё раз.');
    } finally {
      setAddingCity(false);
    }
  };

  const handleSelectExisting = (city: City) => {
    setSelectedCity(city);
  };

  const handleSelectPopular = async (popular: typeof POPULAR_CITIES[0]) => {
    // Check if already in list
    const existing = cities.find(c => c.name.toLowerCase() === popular.name.toLowerCase());
    if (existing) {
      setSelectedCity(existing);
    } else {
      await handleAddCity(popular.name, popular.geocenterLng, popular.geocenterLat);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedSuggestIdx(p => Math.min(p + 1, suggestions.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedSuggestIdx(p => Math.max(p - 1, -1)); }
      else if (e.key === 'Enter' && selectedSuggestIdx >= 0) {
        e.preventDefault();
        const s = suggestions[selectedSuggestIdx];
        handleAddCity(s.title || search);
        return;
      } else if (e.key === 'Escape') { setSuggestions([]); return; }
    }
    if (e.key === 'Enter' && search.trim()) {
      handleAddCity(search.trim());
    }
  };

  // Filter popular cities based on search (those not already saved)
  const filteredPopular = search.trim()
    ? POPULAR_CITIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : POPULAR_CITIES;

  if (!isCitySelectorOpen) return null;

  return (
    <div className="city-selector__overlay" onClick={closeCitySelector}>
      <div className="city-selector__modal animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="city-selector__header">
          <div className="city-selector__header-title">
            <MapPin size={18} color="var(--cyan)" />
            <span>Выбор города</span>
          </div>
          <button className="city-selector__close" onClick={closeCitySelector}>
            <X size={18} />
          </button>
        </div>

        {/* Search Input */}
        <div className="city-selector__search">
          <div className="city-selector__input-wrap">
            <div className="city-selector__input-icon">
              {suggestLoading || addingCity
                ? <Loader2 size={16} className="city-selector__spinner" />
                : <Search size={16} />}
            </div>
            <input
              ref={inputRef}
              className="city-selector__input"
              placeholder="Введите название города..."
              value={search}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            {search && (
              <button className="city-selector__input-clear" onClick={() => { setSearch(''); setSuggestions([]); }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <div className="city-selector__suggestions">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className={`city-selector__suggestion ${i === selectedSuggestIdx ? 'city-selector__suggestion--active' : ''}`}
                  onClick={() => handleAddCity(s.title)}
                  onMouseEnter={() => setSelectedSuggestIdx(i)}
                  type="button"
                >
                  <MapPin size={14} className="city-selector__suggestion-icon" />
                  <div>
                    <div className="city-selector__suggestion-title">{s.title}</div>
                    {s.subtitle && <div className="city-selector__suggestion-sub">{s.subtitle}</div>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {addError && <div className="city-selector__error">{addError}</div>}
        </div>

        <div className="city-selector__body">
          {/* Saved cities */}
          {cities.length > 0 && (
            <div className="city-selector__section">
              <div className="city-selector__section-label">Мои города</div>
              <div className="city-selector__city-list">
                {cities.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase())).map(city => (
                  <button
                    key={city.id}
                    className={`city-selector__city-item ${selectedCity?.id === city.id ? 'city-selector__city-item--active' : ''}`}
                    onClick={() => handleSelectExisting(city)}
                  >
                    <MapPin size={14} />
                    <span>{city.name}</span>
                    {selectedCity?.id === city.id && <span className="city-selector__city-badge">Текущий</span>}
                    <ChevronRight size={14} className="city-selector__city-arrow" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular cities */}
          <div className="city-selector__section">
            <div className="city-selector__section-label">Популярные города России</div>
            <div className="city-selector__popular-grid">
              {filteredPopular.map(city => {
                const isSaved = cities.some(c => c.name.toLowerCase() === city.name.toLowerCase());
                const isActive = selectedCity?.name.toLowerCase() === city.name.toLowerCase();
                return (
                  <button
                    key={city.name}
                    className={`city-selector__popular-btn ${isActive ? 'city-selector__popular-btn--active' : ''} ${isSaved ? 'city-selector__popular-btn--saved' : ''}`}
                    onClick={() => handleSelectPopular(city)}
                  >
                    {city.name}
                    {!isSaved && <Plus size={12} className="city-selector__popular-plus" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <style>{`
          .city-selector__overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: 1000;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 80px;
          }

          .city-selector__modal {
            width: 520px;
            max-height: calc(100vh - 120px);
            background: var(--surface);
            border: 1px solid var(--line);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .city-selector__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 20px;
            border-bottom: 1px solid var(--line);
            flex-shrink: 0;
          }

          .city-selector__header-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1rem;
            font-weight: 600;
            color: var(--text);
          }

          .city-selector__close {
            width: 32px;
            height: 32px;
            border-radius: var(--radius-sm);
            border: 1px solid transparent;
            background: transparent;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all var(--transition-fast);
          }

          .city-selector__close:hover {
            background: var(--surface-2);
            border-color: var(--line);
            color: var(--text);
          }

          .city-selector__search {
            padding: 16px 20px;
            border-bottom: 1px solid var(--line);
            flex-shrink: 0;
            position: relative;
          }

          .city-selector__input-wrap {
            position: relative;
            display: flex;
            align-items: center;
          }

          .city-selector__input-icon {
            position: absolute;
            left: 12px;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            pointer-events: none;
          }

          .city-selector__input {
            width: 100%;
            padding: 10px 36px;
            background: var(--surface-2);
            border: 1px solid var(--line);
            border-radius: var(--radius-sm);
            color: var(--text);
            font-size: 0.875rem;
            font-family: inherit;
            outline: none;
            transition: all var(--transition-fast);
          }

          .city-selector__input:focus {
            border-color: var(--cyan);
            box-shadow: 0 0 0 3px rgba(113, 169, 179, 0.15);
          }

          .city-selector__input::placeholder { color: var(--text-muted); }

          .city-selector__input-clear {
            position: absolute;
            right: 10px;
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            display: flex;
            align-items: center;
            padding: 2px;
            border-radius: 4px;
            transition: color var(--transition-fast);
          }

          .city-selector__input-clear:hover { color: var(--text); }

          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .city-selector__spinner { animation: spin 0.8s linear infinite; }

          .city-selector__suggestions {
            position: absolute;
            top: calc(100% - 4px);
            left: 20px;
            right: 20px;
            background: var(--surface-2);
            border: 1px solid var(--line-strong);
            border-radius: var(--radius-sm);
            box-shadow: var(--shadow-lg);
            z-index: 10;
            max-height: 220px;
            overflow-y: auto;
          }

          .city-selector__suggestion {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            width: 100%;
            padding: 10px 14px;
            background: transparent;
            border: none;
            border-bottom: 1px solid var(--line);
            cursor: pointer;
            text-align: left;
            font-family: inherit;
            color: var(--text);
            transition: background var(--transition-fast);
          }

          .city-selector__suggestion:last-child { border-bottom: none; }

          .city-selector__suggestion:hover,
          .city-selector__suggestion--active { background: var(--surface-3); }

          .city-selector__suggestion-icon { color: var(--cyan); flex-shrink: 0; margin-top: 2px; }

          .city-selector__suggestion-title { font-size: 0.875rem; font-weight: 500; }

          .city-selector__suggestion-sub { font-size: 0.75rem; color: var(--text-muted); }

          .city-selector__error {
            margin-top: 8px;
            padding: 8px 12px;
            background: rgba(218, 131, 121, 0.1);
            border: 1px solid rgba(218, 131, 121, 0.2);
            border-radius: var(--radius-sm);
            color: var(--red);
            font-size: 0.8125rem;
          }

          .city-selector__body {
            flex: 1;
            overflow-y: auto;
            padding: 16px 20px;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .city-selector__section-label {
            font-size: 0.6875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--text-muted);
            margin-bottom: 10px;
          }

          .city-selector__city-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .city-selector__city-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            background: var(--surface-2);
            border: 1px solid var(--line);
            border-radius: var(--radius-sm);
            cursor: pointer;
            font-family: inherit;
            font-size: 0.875rem;
            color: var(--text-soft);
            transition: all var(--transition-fast);
            text-align: left;
          }

          .city-selector__city-item:hover {
            border-color: var(--cyan);
            color: var(--text);
            background: var(--surface-3);
          }

          .city-selector__city-item--active {
            border-color: var(--cyan);
            background: rgba(113, 169, 179, 0.08);
            color: var(--text);
          }

          .city-selector__city-badge {
            margin-left: auto;
            font-size: 0.6875rem;
            background: rgba(113, 169, 179, 0.15);
            color: var(--cyan);
            padding: 2px 8px;
            border-radius: 20px;
            font-weight: 500;
          }

          .city-selector__city-arrow {
            margin-left: auto;
            color: var(--text-muted);
            flex-shrink: 0;
          }

          .city-selector__city-item--active .city-selector__city-arrow { display: none; }

          .city-selector__popular-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .city-selector__popular-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 7px 14px;
            background: var(--surface-2);
            border: 1px solid var(--line);
            border-radius: 20px;
            cursor: pointer;
            font-family: inherit;
            font-size: 0.8125rem;
            color: var(--text-soft);
            transition: all var(--transition-fast);
          }

          .city-selector__popular-btn:hover {
            border-color: var(--cyan);
            color: var(--text);
            background: var(--surface-3);
          }

          .city-selector__popular-btn--active {
            border-color: var(--cyan);
            background: rgba(113, 169, 179, 0.12);
            color: var(--cyan);
          }

          .city-selector__popular-btn--saved {
            border-color: var(--line-strong);
          }

          .city-selector__popular-plus {
            color: var(--text-muted);
          }
        `}</style>
      </div>
    </div>
  );
};
