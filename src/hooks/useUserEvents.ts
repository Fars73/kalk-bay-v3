import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../lib/firebase';
import { Event } from '../types';
import { useAuth } from './useAuth';
import { cacheService } from '../services/cache';

export const useUserEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!user?.uid) {
        setEvents([]);
        setLoading(false);
        return;
      }

      try {
        // Check cache first with user-specific key
        const cacheKey = `user-events-${user.uid}`;
        const cachedEvents = cacheService.get<Event[]>(cacheKey);
        if (cachedEvents) {
          setEvents(cachedEvents);
          setLoading(false);
          return;
        }

        const userEventsRef = ref(database, `userEvents/${user.uid}`);
        const snapshot = await get(userEventsRef);
        
        if (!snapshot.exists()) {
          setEvents([]);
          return;
        }

        const eventIds = Object.values(snapshot.val());
        const eventsRef = ref(database, 'events');
        const eventsSnapshot = await get(eventsRef);
        
        if (!eventsSnapshot.exists()) {
          setEvents([]);
          return;
        }

        const allEvents = eventsSnapshot.val();
        const userEvents = eventIds
          .map((id: string) => ({
            id,
            ...allEvents[id]
          }))
          .filter(Boolean) as Event[];

        // Cache the user events
        cacheService.set(cacheKey, userEvents);
        setEvents(userEvents);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch user events'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [user?.uid]);

  return { events, loading, error };
};