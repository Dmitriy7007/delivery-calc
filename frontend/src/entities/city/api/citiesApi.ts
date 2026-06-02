import { apiClient } from '@/shared/api/client';
import type { City } from '@/shared/types';

export interface CreateCityPayload {
  name: string;
  geocenterLng?: number;
  geocenterLat?: number;
  defaultZoom?: number;
}

export const citiesApi = {
  async getAll(): Promise<City[]> {
    const { data } = await apiClient.get<City[]>('/cities');
    return data;
  },

  async create(payload: CreateCityPayload): Promise<City> {
    const { data } = await apiClient.post<City>('/cities', payload);
    return data;
  },

  async update(id: number, payload: Partial<CreateCityPayload>): Promise<City> {
    const { data } = await apiClient.patch<City>(`/cities/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/cities/${id}`);
  },
};
