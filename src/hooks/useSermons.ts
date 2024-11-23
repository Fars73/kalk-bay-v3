import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../lib/firebase';
import { Sermon } from '../types';
import { cacheService } from '../services/cache';

const CACHE_KEY = 'sermons';

export const useSermons = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        // Check cache first
        const cachedSermons = cacheService.get<Sermon[]>(CACHE_KEY);
        if (cachedSermons) {
          setSermons(cachedSermons);
          setLoading(false);
          return;
        }

        const sermonsRef = ref(database, 'sermons');
        const snapshot = await get(sermonsRef);
        
        if (!snapshot.exists()) {
          setSermons([]);
          return;
        }

        const sermonsData: Sermon[] = [];
        
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          if (data) {
            sermonsData.push({
              id: childSnapshot.key || '',
              title: data.title || 'Untitled Sermon',
              date: data.date || new Date().toISOString(),
              audioUrl: data.audioUrl || '',
              description: data.description || ''
            });
          }
        });

        const sortedSermons = sermonsData.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Cache the sorted sermons
        cacheService.set(CACHE_KEY, sortedSermons);
        setSermons(sortedSermons);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch sermons'));
      } finally {
        setLoading(false);
      }
    };

    fetchSermons();
  }, []);

  return { sermons, loading, error };
};