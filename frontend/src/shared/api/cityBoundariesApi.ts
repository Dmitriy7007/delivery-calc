import { apiClient } from '@/shared/api/client';
import type { CityBoundary } from '@/shared/types';
import type { Polygon } from 'geojson';

export const cityBoundariesApi = {
  async getAll(cityId?: number): Promise<CityBoundary[]> {
    const { data } = await apiClient.get<CityBoundary[]>('/city-boundaries', {
      params: cityId ? { cityId } : {},
    });
    return data;
  },

  async create(payload: { cityId: number; polygon: Polygon; color?: string }): Promise<CityBoundary> {
    const { data } = await apiClient.post<CityBoundary>('/city-boundaries', payload);
    return data;
  },

  async update(id: number, payload: { polygon?: Polygon; color?: string }): Promise<CityBoundary> {
    const { data } = await apiClient.patch<CityBoundary>(`/city-boundaries/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/city-boundaries/${id}`);
  },
};
