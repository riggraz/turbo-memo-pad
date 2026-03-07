import { useEffect, useState } from 'react';

import { getAllNotes, getDatabase, type Note } from '@/db';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const db = await getDatabase();
      setNotes(await getAllNotes(db));
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function loadOnce() {
      setLoading(true);
      setError(null);
      try {
        const db = await getDatabase();
        const result = await getAllNotes(db);
        if (!cancelled) setNotes(result);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadOnce();
    return () => { cancelled = true; };
  }, []);

  return { notes, loading, error, refresh: load };
}
