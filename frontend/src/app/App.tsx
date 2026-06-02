import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router';
import { CityProvider } from '@/shared/lib/cityContext';
import { CitySelector } from '@/widgets/city-selector';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <CityProvider>
        <AppRouter />
        <CitySelector />
      </CityProvider>
    </BrowserRouter>
  );
};
