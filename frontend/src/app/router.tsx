import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/widgets/layout';
import { DashboardPage } from '@/pages/dashboard';
import { CitiesPage } from '@/pages/cities';
import { StoresPage } from '@/pages/stores';
import { SettingsPage } from '@/pages/settings';
import { ProductsPage } from '@/pages/products';
import { CalculatorPage } from '@/pages/calculator';
import { LiftingPage } from '@/pages/lifting';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cities" element={<CitiesPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/lifting" element={<LiftingPage />} />
      </Route>
    </Routes>
  );
};
