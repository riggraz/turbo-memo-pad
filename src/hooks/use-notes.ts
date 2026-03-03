import { useEffect, useState } from 'react';

import { getAllNotes, getDatabase, type Note } from '@/db';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const db = await getDatabase();
    setNotes(await getAllNotes(db));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return { notes, loading, refresh: load };
}
