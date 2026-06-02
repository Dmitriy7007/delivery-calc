import { apiClient } from '@/shared/api/client';
import type { Zone, CreateZonePayload, UpdateZonePayload } from '@/shared/types';

export const zonesApi = {
  async getAll(cityId?: number): Promise<Zone[]> {
    const { data } = await apiClient.get<Zone[]>('/zones', {
      params: cityId ? { cityId } : {},
    });
    return data;
  },

  async getById(id: number): Promise<Zone> {
    const { data } = await apiClient.get<Zone>(`/zones/${id}`);
    return data;
  },

  async create(payload: CreateZonePayload): Promise<Zone> {
    const { data } = await apiClient.post<Zone>('/zones', payload);
    return data;
  },

  async update(id: number, payload: UpdateZonePayload): Promise<Zone> {
    const { data } = await apiClient.patch<Zone>(`/zones/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/zones/${id}`);
  },

  async findByPoint(lng: number, lat: number): Promise<Zone | null> {
    try {
      const { data } = await apiClient.get<Zone>('/zones/find-by-point', {
        params: { lng, lat },
      });
      return data;
    } catch {
      return null;
    }
  },
};

export const deliveryApi = {
  async calculate(address: string) {
    const { data } = await apiClient.get('/delivery/calculate', {
      params: { address },
    });
    return data;
  },
};

export const geocodingApi = {
  async geocode(address: string) {
    const { data } = await apiClient.get('/geocoding', {
      params: { address },
    });
    return data;
  },

  async suggest(query: string): Promise<Array<{ title: string; subtitle: string; uri: string }>> {
    const { data } = await apiClient.get('/geocoding/suggest', {
      params: { query },
    });
    return data;
  },
};

