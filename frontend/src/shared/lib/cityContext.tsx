import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { City } from '@/shared/types';
import { citiesApi } from '@/entities/city';

interface CityContextValue {
  selectedCity: City | null;
  currentCityId: number | null;
  cities: City[];
  loadingCities: boolean;
  setSelectedCity: (city: City) => void;
  refreshCities: () => Promise<void>;
  openCitySelector: () => void;
  closeCitySelector: () => void;
  isCitySelectorOpen: boolean;
}

const CityContext = createContext<CityContextValue | null>(null);

const CITY_STORAGE_KEY = 'domingo_selected_city';

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [selectedCity, setSelectedCityState] = useState<City | null>(() => {
    try {
      const saved = localStorage.getItem(CITY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isCitySelectorOpen, setIsCitySelectorOpen] = useState(false);

  const refreshCities = useCallback(async () => {
    setLoadingCities(true);
    try {
      const data = await citiesApi.getAll();
      setCities(data);
    } catch (err) {
      console.error('Failed to load cities:', err);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  useEffect(() => {
    refreshCities();
  }, [refreshCities]);

  const setSelectedCity = useCallback((city: City) => {
    setSelectedCityState(city);
    localStorage.setItem(CITY_STORAGE_KEY, JSON.stringify(city));
    setIsCitySelectorOpen(false);
  }, []);

  const openCitySelector = useCallback(() => setIsCitySelectorOpen(true), []);
  const closeCitySelector = useCallback(() => setIsCitySelectorOpen(false), []);

  return (
    <CityContext.Provider value={{
      selectedCity,
      currentCityId: selectedCity?.id ?? null,
      cities,
      loadingCities,
      setSelectedCity,
      refreshCities,
      openCitySelector,
      closeCitySelector,
      isCitySelectorOpen,
    }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = (): CityContextValue => {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error('useCity must be used within CityProvider');
  return ctx;
};
