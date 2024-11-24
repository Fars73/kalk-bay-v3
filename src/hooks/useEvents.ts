import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../lib/firebase';
import { Event } from '../types';
import { cacheService } from '../services/cache';

const CACHE_KEY = 'events';

const getNextServiceDate = (dayOfWeek: number) => {
  const today = new Date();
  const currentDay = today.getDay();
  const currentHour = today.getHours();
  const currentMinutes = today.getMinutes();
  
  // For Sunday Service (9:00 AM)
  if (dayOfWeek === 0) {
    if (currentDay === 0) {
      // If it's Sunday and we're past 12:00 PM (service + buffer time)
      if (currentHour >= 12) {
        // Move to next Sunday
        const nextSunday = new Date(today);
        nextSunday.setDate(today.getDate() + 7);
        return nextSunday.toISOString().split('T')[0];
      }
    }
  }
  
  // For Wednesday Bible Study (7:00 PM)
  if (dayOfWeek === 3) {
    if (currentDay === 3) {
      // If it's Wednesday and we're past 10:00 PM (study + buffer time)
      if (currentHour >= 22 || (currentHour === 21 && currentMinutes >= 30)) {
        // Move to next Wednesday
        const nextWednesday = new Date(today);
        nextWednesday.setDate(today.getDate() + 7);
        return nextWednesday.toISOString().split('T')[0];
      }
    }
  }
  
  // Calculate days until next service
  let daysUntil = dayOfWeek - currentDay;
  if (daysUntil <= 0) {
    daysUntil += 7;
  }
  
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntil);
  return nextDate.toISOString().split('T')[0];
};

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const validateAndUpdatePermanentEvents = async (events: Event[]) => {
    const updates: { [key: string]: any } = {};
    const today = new Date();

    events.forEach(event => {
      if (event.isPermanent && event.recurrence) {
        const eventDate = new Date(event.date!);
        const dayOfWeek = event.recurrence.dayOfWeek;
        const nextDate = getNextServiceDate(dayOfWeek);
        
        // Only update if the current date is past the event date
        if (today > eventDate || event.date !== nextDate) {
          updates[`events/${event.id}`] = {
            ...event,
            date: nextDate
          };
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      try {
        await set(ref(database), updates);
      } catch (err) {
        console.error('Error updating permanent events:', err);
      }
    }
  };

  useEffect(() => {
    const eventsRef = ref(database, 'events');
    
    const unsubscribe = onValue(eventsRef, async (snapshot) => {
      try {
        if (!snapshot.exists()) {
          setEvents([]);
          setLoading(false);
          return;
        }

        const allEvents: Event[] = [];
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          if (data) {
            allEvents.push({
              id: childSnapshot.key || '',
              ...data
            });
          }
        });

        // Validate and update permanent events if needed
        await validateAndUpdatePermanentEvents(allEvents);
        
        const sortedEvents = allEvents.sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        setEvents(sortedEvents);
        cacheService.set(CACHE_KEY, sortedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch events'));
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error('Error in onValue subscription:', err);
      setError(err instanceof Error ? err : new Error('Failed to subscribe to events'));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { events, loading, error };
};