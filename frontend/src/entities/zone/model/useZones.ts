import { useState, useEffect, useCallback } from 'react';
import type { Zone } from '@/shared/types';
import { zonesApi } from '../api/zonesApi';

export function useZones(cityId?: number) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchZones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await zonesApi.getAll(cityId);
      setZones(data);
    } catch (err) {
      setError('Ошибка загрузки зон');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [cityId]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  return { zones, loading, error, refetch: fetchZones };
}
