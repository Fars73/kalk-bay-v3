import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../lib/firebase';
import { Event } from '../types';
import { getNextOccurrences } from '../utils/dateUtils';
import { cacheService } from '../services/cache';
import { imageCache } from '../services/imageCache';

const CACHE_KEY = 'events';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Check cache first
        const cachedEvents = cacheService.get<Event[]>(CACHE_KEY);
        if (cachedEvents) {
          setEvents(cachedEvents);
          setLoading(false);
          
          // Preload images in background for cached events
          const imageUrls = cachedEvents.map(event => event.imageUrl);
          imageCache.preloadImages(imageUrls).catch(console.error);
          return;
        }

        const eventsRef = ref(database, 'events');
        const snapshot = await get(eventsRef);
        
        if (!snapshot.exists()) {
          setEvents([]);
          return;
        }

        const allEvents: Event[] = [];
        const imageUrls: string[] = [];
        
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          
          if (data) {
            if (data.recurrence && data.recurrence.frequency === 'weekly') {
              const nextDates = getNextOccurrences(data.recurrence.dayOfWeek, 4);
              nextDates.forEach((date, index) => {
                allEvents.push({
                  id: `${childSnapshot.key}-${index}`,
                  title: data.title,
                  time: data.time,
                  date: date,
                  description: data.description,
                  imageUrl: data.imageUrl,
                  type: 'regular',
                  recurrence: data.recurrence
                });
                imageUrls.push(data.imageUrl);
              });
            } else {
              allEvents.push({
                id: childSnapshot.key || '',
                title: data.title,
                time: data.time,
                date: data.date,
                description: data.description,
                imageUrl: data.imageUrl,
                type: data.type || 'special'
              });
              imageUrls.push(data.imageUrl);
            }
          }
        });
        
        const sortedEvents = allEvents.sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        // Cache the sorted events
        cacheService.set(CACHE_KEY, sortedEvents);
        setEvents(sortedEvents);

        // Preload images in background
        imageCache.preloadImages(imageUrls).catch(console.error);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch events'));
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
};