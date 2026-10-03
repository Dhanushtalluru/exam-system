import { useEffect, useState, useCallback } from 'react';
export default function useLoad(fn, deps = []) {
  const [data, setData] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const reload = useCallback(() => { setLoading(true); fn().then(d => { setData(d); setError(''); }).catch(e => setError(e.message)).finally(() => setLoading(false)); }, deps);
  useEffect(() => { reload(); }, [reload]);
  return { data, error, loading, reload };
}
