import { useCallback, useRef, useState } from 'react';
import { api } from './api';

export function useApi<T>(url: string) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loaded = useRef(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(url);
      setData(res.data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load';
      setError(msg);
    } finally {
      setLoading(false);
      loaded.current = true;
    }
  }, [url]);

  return { data, setData, loading, error, reload: load, loaded };
}
